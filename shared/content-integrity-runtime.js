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
export function normalizeExperience(item) {
    const digitalHub = /digital hub/i.test(`${item.company || ''} ${item.facility || ''}`);
    const text = (value) => value == null ? value : prose(digitalHub
        ? value.replace(/\b(?:Completed|Completing) (?:an intensive|a) full-stack software engineering and AI program/gi, 'Participated in a full-stack software engineering and AI program')
        : value);
    return { ...item, meta: dateRange(item.startDate, item.endDate, item.isCurrent) || datePeriod(item.meta),
        ...(item.description != null && { description: text(item.description) }),
        ...(item.details != null && { details: text(item.details) }),
        ...(item.cvDescription != null && { cvDescription: text(item.cvDescription) }),
        ...(item.bullets && { bullets: nonempty(item.bullets).map(v => text(v)) }),
        ...(item.cvBullets && { cvBullets: nonempty(item.cvBullets).map(v => text(v)) }),
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
export function recordKind(item) {
    return /bootcamp|course|study|learning|training/i.test(`${item.title} ${item.description || ''}`)
        ? 'Training' : item.credentialId ? 'Certification' : 'Learning record';
}
export function normalizeTraining(item) {
    const aws = /aws re\/start/i.test(item.title);
    const text = (value) => aws && value
        ? value.replace(/;?\s*completion expected in \d{4}\.?/gi, '').replace(/[;.]+$/, '') + '.' : value;
    return { ...item, ...(item.year && { year: datePeriod(item.year) }),
        ...(aws && item.year?.includes('2025') && { expectedDate: null }),
        ...(item.description != null && { description: text(item.description) }),
        ...(item.cvDescription != null && { cvDescription: text(item.cvDescription) }),
    };
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
