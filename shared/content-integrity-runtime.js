// Public presentation rules shared by the UI, PDF generator and AI snapshot.
// These transform returned records; they never persist changes to the CMS.
export const projectDisplayNames = {
    'construction-project-management-accounting-system': 'Cedar Construction',
    'full-stack-user-management-system': 'User Management',
};
export function projectDisplayName(project) {
    return projectDisplayNames[project.slug] || project.name;
}
export const nonempty = (values) => (values ?? []).map(value => value.trim()).filter(Boolean);
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export function monthDate(value) {
    const text = value?.trim() || '';
    const iso = /^(\d{4})-(\d{2})(?:-\d{2}(?:T.*)?)?$/.exec(text);
    const slash = /^(\d{1,2})\/(\d{4})$/.exec(text);
    const named = /^([A-Za-z]+)\s+(\d{4})$/.exec(text);
    const month = iso ? Number(iso[2]) - 1 : slash ? Number(slash[1]) - 1 : named ? months.findIndex(m => m.toLowerCase() === named[1].slice(0, 3).toLowerCase()) : -1;
    const year = iso?.[1] || slash?.[2] || named?.[2];
    return year && month >= 0 && month < 12 ? `${months[month]} ${year}` : text;
}
export function datePeriod(value) {
    // A spaced separator avoids splitting ISO month values themselves.
    return (value?.trim() || '').split(/\s+[–—-]\s+/).map(monthDate).join(' – ');
}
export function dateRange(start, end, current = false) {
    return [monthDate(start), current ? 'Present' : monthDate(end)].filter(Boolean).join(' – ');
}
const prose = (text) => text.replace(/; Built\b/g, '; built').replace(/; Deployed\b/g, '; deployed');
const digitalHubRecord = item => /\bdigital hub\b/i.test(`${item.company || ''} ${item.facility || ''}`);
const liuComputerScience = item => /lebanese international university|^LIU$/i.test(item.school || '')
    && /\b(?:bachelor|bsc)\b/i.test(item.degree || '') && /computer science/i.test(item.degree || '');
// Owner-confirmed facts, 22 Oct 2026; see docs/content/profile-public-copy.md.
// These identities do not establish an independently verified certificate.
const confirmedCompletion = item => (digitalHubRecord(item)
    && /\bfull[- ]stack\b/i.test(`${item.role || item.milestone || ''} ${item.description || item.details || ''} ${(item.cvBullets || []).join(' ')}`))
    || liuComputerScience(item);
const publicLearningText = (value, confirmed = false) => value == null ? value : value
    .split(/(?<=[.!?;])\s+/)
    .filter(part => !/\b(?:not (?:independently )?verified|unverified|available records)\b/i.test(part)
        && (confirmed || !/\b(?:completed|completing|completion|graduated|earned|awarded|certified)\b/i.test(part)))
    .join(' ').trim().replace(/;$/, '.');
// Evidence metadata stays internal to the snapshot/normalizers, not Profile copy.
export function learningEvidence(item) {
    const claims = [...(item.learningEvidence?.completion.recordedClaims ?? []), item.description, item.details, item.cvDescription, ...(item.cvBullets ?? [])]
        .filter(value => typeof value === 'string' && /\b(?:completed|graduated|earned|awarded)\b/i.test(value));
    return {
        participation: 'listed in the portfolio',
        dates: dateRange(item.startDate, item.endDate, item.isCurrent)
            || datePeriod(item.period || item.year || item.meta),
        completion: {
            status: confirmedCompletion(item) ? 'owner-confirmed' : 'unverified', recordedClaims: [...new Set(claims)],
            basis: confirmedCompletion(item)
                ? 'The portfolio owner explicitly confirmed this degree or program completion on 22 October 2026; this is not independent certificate verification.'
                : 'No completion evidence is supplied by the available records. Past dates do not establish completion or graduation.',
        },
        certification: {
            status: 'unverified',
            recordedCredential: item.credentialId ? {
                id: item.credentialId, issueDate: item.issueDate || null, url: item.url || null,
            } : null,
            basis: 'Listed credential details or links are not independent verification. Training participation is not an earned vendor certification.',
        },
    };
}
export function normalizeEducation(item) {
    const confirmed = liuComputerScience(item);
    const details = publicLearningText(item.details, confirmed);
    const normalized = { ...item, period: dateRange(item.startDate, item.endDate) || datePeriod(item.period),
        ...(item.details != null && { details }),
        ...(item.cvDescription != null && { cvDescription: publicLearningText(item.cvDescription, confirmed) }),
        ...(confirmed && !/\bgraduated\b/i.test(details || '') && {
            details: ['Graduated with a BSc in Computer Science.', details].filter(Boolean).join(' '),
        }),
    };
    return { ...normalized, learningEvidence: learningEvidence({ ...normalized, learningEvidence: learningEvidence(item) }) };
}
export function normalizeExperience(item) {
    const digitalHub = digitalHubRecord(item);
    const fala = /\bFALA\b/i.test(`${item.company || ''} ${item.facility || ''}`);
    const text = value => {
        if (value == null) return value;
        let copy = value;
        if (digitalHub) {
            copy = publicLearningText(copy, true)
                .replace(/\b(?:Completed|Completing|Participated in) (?:an intensive|a) full-stack software engineering and AI program/gi, 'Completed a full-stack software engineering and AI program')
                .replace(/\bDeveloping type-safe\b/g, 'Developed type-safe')
                .replace(/; implementing secure SQL and NoSQL data layers/g, '; implemented secure SQL and NoSQL data layers');
            if (item.location) copy = copy.split(/(?<=[.!?])\s+/).filter(sentence =>
                sentence.replace(/^Location:\s*/i, '').replace(/\.$/, '').trim().toLowerCase() !== item.location.trim().toLowerCase()).join(' ');
        }
        if (fala) copy = copy.replace('Mentored developers on procedural engineering logic, component workflows, and industry-standard deployment structures.',
            'Mentored developers in programming logic and component-based workflows, and guided learners through project structure and deployment practices.');
        return prose(copy);
    };
    const normalized = { ...item, meta: dateRange(item.startDate, item.endDate, item.isCurrent) || datePeriod(item.meta),
        ...(item.description != null && { description: text(item.description) }),
        ...(item.details != null && { details: text(item.details) }),
        ...(item.cvDescription != null && { cvDescription: text(item.cvDescription) }),
        ...(item.bullets && { bullets: nonempty(item.bullets).map(v => text(v)) }),
        ...(item.cvBullets && { cvBullets: nonempty(item.cvBullets).map(v => text(v)) }),
    };
    const grounded = { ...normalized, employmentEvidence: employmentEvidence(normalized) };
    return digitalHub || /\b(?:bootcamp|training program)\b/i.test(`${item.description || ''} ${item.details || ''}`)
        ? { ...grounded, learningEvidence: learningEvidence(normalized) } : grounded;
}
export function experienceLocation(item) {
    const location = item.location?.trim() || '';
    const organization = (item.company || item.facility || '').trim().toLowerCase();
    return location && !organization.endsWith(`, ${location.toLowerCase()}`) ? location : '';
}
export function employmentEvidence(item) {
    const role = item.role || item.milestone || '';
    const dates = [item.startDate, item.endDate].filter(Boolean);
    const range = dateRange(item.startDate, item.endDate, item.isCurrent) || datePeriod(item.meta);
    const monthOnly = (dates.length > 0 && dates.every(value => /^\d{4}-\d{2}$/.test(value)))
        || /^[A-Za-z]{3} \d{4} – [A-Za-z]{3} \d{4}$/.test(range);
    return {
        role, employmentType: /\bintern(?:ship)?\b/i.test(role) ? 'Internship' : null,
        workArrangement: item.workArrangement || null,
        dateRange: range,
        dateGranularity: monthOnly ? 'month' : 'as recorded',
        exactDuration: null,
        basis: 'Role labels and recorded dates only. Month-level endpoints are not an exact duration. No unspecified employment type is inferred.',
    };
}
export function sortExperience(items) {
    const time = (item) => {
        if (item.isCurrent)
            return Infinity;
        const end = item.endDate || item.startDate || datePeriod(item.meta).split(' – ').at(-1);
        const parsed = Date.parse(monthDate(end));
        return Number.isFinite(parsed) ? parsed : -Infinity;
    };
    return [...items].sort((a, b) => time(b) - time(a));
}
export function skillKey(name) {
    const key = name.trim().toLowerCase().replace(/\s+/g, ' ');
    return { 'solid principles': 'solid', 'javascript (es6+)': 'javascript', 'react.js': 'react', 'pytest': 'pytest' }[key] || key;
}
export function uniqueCapabilities(items) {
    const seen = new Set();
    return items.filter(item => {
        const key = skillKey(item.name);
        if (!key || seen.has(key))
            return false;
        seen.add(key);
        return true;
    });
}
// These are presentation groupings, not aliases between distinct technologies.
// Split the few CMS compound labels into atoms before assigning one location.
export function capabilityParts(name) {
    const value = name.trim();
    const composites = {
        'html & css': ['HTML', 'CSS'], 'html5 / css3': ['HTML5', 'CSS3'],
        'mysql / mariadb': ['MySQL', 'MariaDB'], 'mysql/mariadb': ['MySQL', 'MariaDB'],
        'git & github': ['Git', 'GitHub'], 'git/github': ['Git', 'GitHub'],
    };
    const composite = composites[value.toLowerCase()];
    if (composite) return composite.flatMap(capabilityParts);
    if (/^html5?$/i.test(value)) return [{ key: 'html', name: 'HTML', details: /^html5$/i.test(value) ? ['HTML5'] : [] }];
    if (/^css3?$/i.test(value)) return [{ key: 'css', name: 'CSS', details: /^css3$/i.test(value) ? ['CSS3'] : [] }];
    if (/^argon2(?: password hashing)?$/i.test(value)) return [{ key: 'argon2', name: 'Argon2', details: /hashing/i.test(value) ? ['Password hashing'] : [] }];
    const ai = /^AI API Integration(?:\s*[—–:-]\s*(.+))?$/i.exec(value);
    if (ai) return [{ key: 'ai api integration', name: 'AI API Integration', details: ai[1] ? [ai[1]] : [] }];
    if (/^OpenAI API$/i.test(value)) return [{ key: 'ai api integration', name: 'AI API Integration', details: ['OpenAI'] }];
    if (/^JWT (?:Authentication|Auth)$/i.test(value)) return [{ key: 'jwt', name: 'JWT', details: ['Authentication'] }];
    return [{ key: skillKey(value), name: value, details: [] }];
}
export function capabilityGroups(technologies = [], skills = [], projects = []) {
    const groups = new Map();
    for (const [rows, technology] of [[technologies, true], [skills, false]]) {
        for (const row of rows) for (const part of capabilityParts(row.name)) {
            if (!part.key) continue;
            const group = groups.get(part.key) || { key: part.key, name: part.name,
                category: technology ? row.category : 'skills', details: new Set() };
            part.details.forEach(detail => group.details.add(detail));
            groups.set(part.key, group);
        }
    }
    return [...groups.values()].map(group => ({ ...group, details: [...group.details],
        evidence: projects.filter(project => project.published && project.showOnPortfolio !== false
            && Boolean(project.myRole?.trim() || project.ownership?.trim() || project.contributions?.some(item => item.trim()))
            && project.stack.some(tech => capabilityParts(tech).some(part => part.key === group.key)))
            .slice(0, 1).map(project => ({ slug: project.slug, name: projectDisplayName(project) })),
    }));
}
export function recordKind(item) {
    return /bootcamp|course|study|learning|training/i.test(`${item.title} ${item.description || ''}`)
        ? 'Training' : item.credentialId ? 'Certification' : 'Learning record';
}
export function normalizeTraining(item) {
    const aws = /aws re\/start/i.test(item.title);
    const angular = /^angular (?:independent study|self-learning course)$/i.test(item.title);
    const text = value => publicLearningText(aws && value
        ? value.replace(/;?\s*completion expected in \d{4}\.?/gi, '').replace(/[;.]+$/, '') + '.' : value);
    const normalized = { ...item, ...(item.year && { year: datePeriod(item.year) }),
        ...(angular && { title: 'Angular Independent Study', issuer: 'Self-directed learning' }),
        ...(aws && item.year?.includes('2025') && { expectedDate: null }),
        ...(item.description != null && { description: text(item.description) }),
        ...(item.cvDescription != null && { cvDescription: text(item.cvDescription) }),
        ...(angular && !text(item.description) && { description: 'Self-directed study of Angular.' }),
    };
    return { ...normalized, learningEvidence: learningEvidence({ ...normalized,
        description: item.description, cvDescription: item.cvDescription }) };
}
// The two highlighted team-project summaries use only their existing CMS
// contribution statements. Product scope remains explicitly collaborative.
export const collaborativeCvBullets = {
    lobby: 'Co-developed a real-time communication platform for persistent communities and temporary guest rooms. Contributed to authenticated and guest access, invitation links, validation, and Supabase-backed services.',
    'gamezone-arena': 'Co-developed a gaming-arena reservation platform with live availability and conflict prevention. Contributed to frontend and backend integration across bookings, payments, rooms, devices, and users.',
};
const legacyCollaborativeSummaries = {
    lobby: 'Built a real-time communication platform supporting persistent communities, servers, channels, guest rooms, and live voice communication.',
    'gamezone-arena': 'Built a gaming-arena reservation platform with live availability and conflict detection to prevent overlapping room/device bookings.',
};
export function normalizeProjectCv(project) {
    const replacement = collaborativeCvBullets[project.slug];
    // Preserve future reviewed CMS prose and explicit tailored overrides.
    return replacement && project.cvBullets?.[0]?.startsWith(legacyCollaborativeSummaries[project.slug])
        ? { ...project, cvBullets: [replacement, ...project.cvBullets.slice(1)] } : project;
}
