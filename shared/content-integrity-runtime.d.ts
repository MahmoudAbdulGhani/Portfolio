export declare const projectDisplayNames: Record<string, string>;
export declare function projectDisplayName(project: {
    slug: string;
    name: string;
}): string;
export declare const nonempty: (values?: string[] | null) => string[];
export declare function monthDate(value?: string | null): string;
export declare function datePeriod(value?: string | null): string;
export declare function dateRange(start?: string | null, end?: string | null, current?: boolean): string;
export type LearningEvidence = {
    participation: string; dates: string;
    completion: { status: 'unverified'; recordedClaims: string[]; basis: string };
    certification: { status: 'unverified'; recordedCredential: { id: string; issueDate: string | null; url: string | null } | null; basis: string };
};
type LearningRecord = { startDate?: string | null; endDate?: string | null; isCurrent?: boolean; period?: string | null; year?: string | null; meta?: string | null; description?: string | null; details?: string | null; cvDescription?: string | null; cvBullets?: string[]; credentialId?: string | null; issueDate?: string | null; url?: string | null };
export declare function learningEvidence(item: LearningRecord): LearningEvidence;
export declare function normalizeEducation<T extends LearningRecord>(item: T): T & { learningEvidence: LearningEvidence };
type ExperienceRecord = {
    company?: string | null;
    facility?: string | null;
    description?: string | null;
    details?: string | null;
    cvDescription?: string | null;
    bullets?: string[];
    cvBullets?: string[];
    startDate?: string | null;
    endDate?: string | null;
    isCurrent?: boolean;
    meta?: string | null;
};
export declare function normalizeExperience<T extends ExperienceRecord>(item: T): T & { learningEvidence?: LearningEvidence };
export declare function sortExperience<T extends ExperienceRecord>(items: T[]): T[];
export declare function skillKey(name: string): string;
export declare function uniqueCapabilities<T extends {
    name: string;
}>(items: T[]): T[];
export declare function capabilityParts(name: string): { key: string; name: string; details: string[] }[];
export type CapabilityGroup = { key: string; name: string; category: string; details: string[]; evidence: { slug: string; name: string }[] };
export declare function capabilityGroups(technologies?: { name: string; category: string }[], skills?: { name: string }[], projects?: { slug: string; name: string; stack: string[]; published: boolean; showOnPortfolio?: boolean; myRole?: string | null; ownership?: string | null; contributions?: string[] }[]): CapabilityGroup[];
type TrainingRecord = {
    title: string;
    year?: string | null;
    description?: string | null;
    cvDescription?: string | null;
    expectedDate?: string | null;
    credentialId?: string | null;
};
export declare function recordKind(item: TrainingRecord): "Training" | "Certification" | "Learning record";
export declare function normalizeTraining<T extends TrainingRecord>(item: T): T & { learningEvidence: LearningEvidence };
export declare const collaborativeCvBullets: Record<string, string>;
export declare function normalizeProjectCv<T extends {
    slug: string;
    cvBullets?: string[];
    contributions?: string[];
}>(project: T): T;
export {};
