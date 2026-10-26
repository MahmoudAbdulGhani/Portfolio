// Formal qualifications are separate requirements from practical work. Keep
// this interpretation shared by the provider prompt and public result formatter.
const subjects = [
  ['accessibility', /\b(?:accessib\w*|a11y|WCAG(?:\s*\d(?:\.\d)?(?:\s*(?:Level\s+)?A{1,3})?)?|IAAP|CPACC|WAS|ADA)\b|\b(?:EN\s*301\s*549|Section\s*508)\b/gi],
  ['security', /\b(?:secur\w*|CISSP|CISM|CEH|OWASP|SOC\s*2|ISO\s*27001|PCI\s*DSS)\b/gi],
  ['aws', /\bAWS\b|\bAmazon Web Services\b/gi],
  ['azure', /\bAzure\b/gi],
];
const formal = /\b(?:certif(?:ication|icate)s?|certified|credentials?|degrees?|BSc|MSc|PhD|licen[cs](?:e[ds]?|ing)|audits?|auditing|CPACC|CISSP|CISM|CEH)\b|\b(?:formal|academic)\s+qualifications?\b|\b(?:WCAG(?:\s*\d(?:\.\d)?(?:\s*(?:Level\s+)?A{1,3})?)?|ADA|EN\s*301\s*549|Section\s*508|SOC\s*2|ISO\s*27001|PCI\s*DSS)\b/gi;
const clauses = text => text.split(/[!?;\n]+|(?<!\d)\.(?!\d)(?=\s|$)/).filter(Boolean);
const subjectFor = (clause, index, length) => {
  const near = subjects.flatMap(([subject, pattern]) => [...clause.matchAll(pattern)].map(match => ({ subject,
    distance: Math.max(0, match.index - index - length, index - match.index - match[0].length),
  }))).sort((a, b) => a.distance - b.distance);
  return near[0]?.distance <= 64 ? near[0].subject : 'general';
};
function formalReferences(text) {
  return clauses(text).flatMap(clause => [...clause.matchAll(formal)].flatMap(match => {
    const before = clause.slice(0, match.index), after = clause.slice(match.index + match[0].length);
    // Audit trails/logs are implementation features, not a formal audit.
    if (/^audit/i.test(match[0]) && /^\s*(?:logs?|logging|trails?)\b/i.test(after)) return [];
    const kind = /^audit/i.test(match[0]) ? 'audit' : /^(?:WCAG|ADA|EN\s*301|Section\s*508|SOC\s*2|ISO\s*27001|PCI\s*DSS)/i.test(match[0]) ? 'standard'
      : /^(?:degree|BSc|MSc|PhD|academic)/i.test(match[0]) ? 'degree' : /^licen/i.test(match[0]) ? 'license' : 'credential';
    const preferred = /^\s*(?:(?:is|are)\s+)?(?:preferred|desirable|a bonus)\b/i.test(after)
      || /\b(?:preferred|desirable)\s+(?:\w+\s+){0,3}$/i.test(before);
    const waived = !preferred && (/\b(?:no|without|does not require|do not require)\s*(?:an?\s*)?(?:\w+\s+){0,3}$/i.test(before)
      || /^\s*(?:(?:is|are)\s+)?(?:explicitly\s+)?(?:not required|not needed|not necessary|optional|not mandatory)\b/i.test(after));
    const subject = kind === 'standard' ? (/^(?:WCAG|ADA|EN|Section)/i.test(match[0]) ? 'accessibility' : 'security') : subjectFor(clause, match.index, match[0].length);
    return [{ kind, subject,
      ...(kind === 'standard' && { standard: match[0].toLowerCase().replace(/\blevel\b/g, '').replace(/\s+/g, '') }), waived }];
  }));
}

export function formalJobRequirements(description) {
  return formalReferences(description).filter(row => !row.waived).map(({ kind, subject, standard }) => ({ kind, subject, ...(standard && { standard }) }));
}
export function requestsAwsCredential(description) {
  return formalJobRequirements(description).some(row => row.subject === 'aws' && row.kind === 'credential');
}
export const REQUIREMENT_SCOPE_INSTRUCTION = `Interpret the actual job requirements before comparing the portfolio. Practical implementation skills, earned credentials, formal audits and compliance standards are distinct requirements. Building accessible React interfaces does not request accessibility certification, a formal audit or WCAG/ADA compliance unless the job explicitly says so. Practical security, authentication and API work do not request a security credential or external audit. Never introduce additional qualifications because implementation evidence is limited. Describe the relevant recorded work; when the practical approach needs clarification, suggest discussing implementation and testing rather than certification or verification. Each strength, related experience, project comparison and requirement to discuss must address something the job actually requests. Only discuss a formal credential, audit or standard in the explicit, same-topic formal job requirements supplied below; an AWS credential request cannot authorize an accessibility credential or audit requirement. Preserve genuinely requested preferred qualifications, while explicitly waived qualifications are not requirements. Do not upgrade practical work into certified or audited experience.`;

function requestedDiscussion(reference) {
  const subject = reference.subject === 'general' ? '' : `${reference.subject === 'aws' ? 'AWS' : reference.subject} `;
  return reference.kind === 'standard' ? `Discuss the role’s ${reference.standard.toUpperCase()} requirement.`
    : `Discuss the ${subject}${reference.kind === 'audit' ? 'audit' : 'qualification'} requested by the role.`;
}

// Apply the same requirement interpretation to every provider-authored public
// statement, not just one observed sentence. Unrequested formal comparisons
// cannot leak through strengths, related experience, gaps or project prose.
export function scopeMatchStatements(description, statements, { discussPractical = false } = {}) {
  const requirements = formalJobRequirements(description);
  const requested = reference => requirements.some(request => request.kind === reference.kind
    && request.subject === reference.subject && request.standard === reference.standard);
  return [...new Set(statements.flatMap(text => {
    if (formalReferences(text).every(requested)) return [text];
    // Preserve useful work descriptions when an unrelated formal comparison
    // was appended as a separate sentence. Do not split names like Express.js.
    return text.split(/(?<=[.!?])\s+(?=[A-Z])|;\s*/).flatMap(part => {
      const references = formalReferences(part);
      const unrequested = references.filter(reference => !requested(reference));
      if (!unrequested.length) return [part];
      if (!discussPractical) return [];
      const domains = new Set(unrequested.map(row => row.subject));
      return [
        ...references.filter(requested).map(requestedDiscussion),
        ...(domains.has('accessibility') && /\baccessible\b|\b(?:accessibility|a11y)\s+(?:implementation|testing|skills|experience)\b/i.test(description)
          ? ['Discuss the approach to implementing and testing accessible interfaces.'] : []),
        ...(domains.has('security') && /\bsecure\b|\bauthentication\b|\bsecurity\s+(?:implementation|testing|skills|experience)\b/i.test(description)
          ? ['Discuss the approach to application security and testing.'] : []),
      ];
    });
  }))].slice(0, 12);
}
