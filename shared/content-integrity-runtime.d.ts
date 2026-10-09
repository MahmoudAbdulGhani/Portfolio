export declare const projectDisplayNames: Record<string, string>;
export declare function projectDisplayName(project: {
    slug: string;
    name: string;
}): string;
export declare const nonempty: (values?: string[] | null) => string[];
export declare function monthDate(value?: string | null): string;
export declare function datePeriod(value?: string | null): string;
export declare function dateRange(start?: string | null, end?: string | null, current?: boolean): string;
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
export declare function normalizeExperience<T extends ExperienceRecord>(item: T): T;
export declare function sortExperience<T extends ExperienceRecord>(items: T[]): T[];
export declare function skillKey(name: string): string;
export declare function uniqueCapabilities<T extends {
    name: string;
}>(items: T[]): T[];
type TrainingRecord = {
    title: string;
    year?: string | null;
    description?: string | null;
    cvDescription?: string | null;
    expectedDate?: string | null;
    credentialId?: string | null;
};
export declare function recordKind(item: TrainingRecord): "Training" | "Certification" | "Learning record";
export declare function normalizeTraining<T extends TrainingRecord>(item: T): T;
export declare const collaborativeCvBullets: Record<string, string>;
export declare function normalizeProjectCv<T extends {
    slug: string;
    cvBullets?: string[];
    contributions?: string[];
}>(project: T): T;
export {};
