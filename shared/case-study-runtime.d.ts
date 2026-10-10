export interface EvidenceSource {
    id: string;
    label: string;
    access: 'public' | 'private';
    url: string;
}
export interface CaseStudy {
    repository: string;
    revision: string;
    sourceAccess: 'public' | 'private';
    kind: 'flagship' | 'team' | 'compact';
    summary: string;
    problemHeading: string;
    problem: string;
    lead: string[];
    leadCaption: string;
    mediaNotes?: string[];
    mediaQualification?: string;
    workflowHeading: string;
    workflow: { title: string; matches: string[]; notice: string; ratio?: string }[];
    contributionIndexes: number[];
    engineeringHeading: string;
    decisions: { title: string; constraint: string; choice: string; consequence: string; sources: string[]; evidenceKind?: string; personalAuthorship?: string }[];
    flow?: { title: string; steps: string[]; description: string };
    flowPlacement?: 'workflow';
    delivered: string[];
    limits: string[];
    sources: EvidenceSource[];
    designCredit?: { label: string; url: string; creator: string | null; creatorStatus: string };
    reviewedAt: string;
    authorship: { status: string; role: string | null; ownership: string | null; documentedPersonalWork: string[]; implementationEvidence: string; boundary: string };
    evidenceStatus: { implementation: string; media: string; projectRuntime: string; sourceInspection: string; projectBackendTests: string };
}
type CaseProject = { slug: string; github?: string | null; contributions?: string[]; myRole?: string | null; ownership?: string | null };
export declare const caseStudies: Record<string, Omit<CaseStudy, 'reviewedAt' | 'evidenceStatus' | 'authorship'>>;
export declare function caseStudyFor(project: CaseProject): CaseStudy | undefined;
export declare function selectedContributions(project: Pick<CaseProject, 'contributions'>, study: CaseStudy): string[];
export declare function screenMatches(src: string, matches: string[]): boolean;
export declare function caseStudyImageCaption(study: CaseStudy | typeof caseStudies[string], src: string, label: string): string;
