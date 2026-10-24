// Server-owned prose for fields where an evaluator must not supply candidate
// facts. The model still selects relevant work and assesses other requirements.
const awsTraining = context => context.certifications.find(row => /aws re\/start/i.test(row.title));
const awsCredential = text => /\bAWS\b/i.test(text) && /\bcertif(?:ication|ied|icate)s?\b/i.test(text);
export function publicMatchCopy(context, jobDescription, candidate, result) {
  // Candidate text is already server-built from the allowed source skills.
  const work = candidate.skillKeys.length ? candidate.text.replace(/^Full-stack software engineer building web applications\. My portfolio includes work with /, 'Relevant work includes ') : 'Explore the selected experience and projects alongside the role’s requirements.';
  const experience = result.relevantExperience.length ? `Relevant background: ${result.relevantExperience.slice(0, 2).join('; ')}.` : 'Explore the selected projects and related experience.';
  const training = awsTraining(context);
  const otherAwsQualification = context.certifications.some(row => /\bAWS\b|Amazon Web Services/i.test(`${row.title} ${row.issuer}`) && !/aws re\/start/i.test(row.title));
  const awsDiscuss = training && !otherAwsQualification && awsCredential(jobDescription);
  const keep = text => !awsDiscuss || !awsCredential(text);
  return {
    overallMatch: `${work} Requirements to discuss are listed separately below.`,
    recruiterSummary: `${work} ${experience}`,
    partialMatches: result.partialMatches.filter(keep),
    gaps: [...result.gaps.filter(keep), ...(awsDiscuss ? ['The role requests AWS certification; the portfolio lists AWS re/Start training.'] : [])],
  };
}

// Direct questions about listed qualifications get a short source-based answer.
// This is not a filter on arbitrary streamed prose. Ambiguous/general questions
// continue through the assistant with its full grounding instructions.
export function qualificationAnswer(question, context) {
  if (!/\b(?:certif(?:ication|ied|icate)s?|qualifications?|complet(?:e|ed|ion)|graduat(?:e|ed|ion)|degree|bsc)\b/i.test(question)) return null;
  const verifying = /\b(?:verif(?:y|ied|ication)|independent(?:ly)?|proof|evidence)\b/i.test(question);
  const records = [
    ...context.education.map(row => ({ row, kind: 'degree', name: row.degree, provider: row.school })),
    ...context.profile.experience.filter(row => row.learningEvidence).map(row => ({ row, kind: 'program', name: row.role, provider: row.company })),
    ...context.certifications.map(row => ({ row, kind: 'training', name: row.title, provider: row.issuer })),
  ];
  const matches = records.filter(({ name = '', provider = '' }) => {
    const words = `${name} ${provider}`.toLowerCase().match(/[a-z0-9]+/g) || [];
    const generic = new Set(['the', 'and', 'from', 'full', 'stack', 'web', 'development', 'training', 'program', 'course', 'bootcamp', 'science', 'computer', 'bachelor', 'of', 'in', 'self', 'directed', 'learning', 'independent', 'fundamentals', 'services']);
    return words.filter(word => !generic.has(word) && word.length > 2).some(word => new RegExp(`\\b${word}\\b`, 'i').test(question));
  });
  if (matches.length !== 1) return null;
  const { row, kind, name, provider } = matches[0], learning = row.learningEvidence;
  const period = row.period || row.meta || row.year;
  const dates = period ? ` (${period})` : '';
  const aws = /aws re\/start/i.test(name || '');
  const description = aws ? 'AWS re/Start training' : [name, provider].filter(Boolean).join(' at ');
  const listed = `The portfolio lists ${description}${dates}.`;
  if (verifying) return `${listed} ${aws ? 'Independent verification of an AWS vendor certification is not provided here.' : 'Independent certificate verification is not provided here.'}`;
  if (/\b(?:certif(?:ication|ied|icate)s?)\b/i.test(question)) {
    return `${listed} ${/angular independent study/i.test(name || '') ? 'This is self-directed learning, not a certification program.' : aws ? 'An earned AWS vendor certification is not listed.' : 'This record does not list an earned certificate.'}`;
  }
  if (learning?.completion.status === 'owner-confirmed') {
    return kind === 'degree' ? `Graduated with a BSc in Computer Science from ${provider}${dates}.` : `Completed the full-stack development program at ${provider}${dates}.`;
  }
  return `${listed} A confirmed completion status is not provided here.`;
}

export function designCreditAnswer(question, context) {
  const project = context.currentProject, study = project?.caseStudy;
  if (!study?.designCredit || !/\b(?:who|whose|credit|supplied|origin)\b/i.test(question) || !/\b(?:design|designer|figma|ui kit)\b/i.test(question)) return null;
  const credit = study.designCredit;
  return `[${project.name}](${project.portfolioUrl}): ${study.summary} Visual design: supplied [${credit.label}](${credit.url}).${credit.creator ? ` Creator: ${credit.creator}.` : ' The original creator is not listed.'}`;
}
