// Reviewed, versioned editorial evidence. Identity, attribution, links and media
// remain CMS-owned. Never persist these read-time presentation records.
const repoSource = (repository, revision, id, label, file, access = 'public') => ({
    id, label, access, url: `${repository}/blob/${revision}/${file}`,
});
const jobpilotRepo = 'https://github.com/MahmoudAbdulGhani/jobpilot-ai';
const jobpilotRevision = '344b0d77d3d3525e8617df0a48e303055fbb024f';
const cedarRepo = 'https://github.com/MahmoudAbdulGhani/Construction-Project-Management-Accounting-System';
const cedarRevision = '0a47f1fe1d16d587116d5debcc63fd76538a0e24';
const lobbyRepo = 'https://github.com/Ahmad-khalaf517/lobby';
const lobbyRevision = '2c8b1d3948b799acfe76d2559723aace143a1f52';
const gamezoneRepo = 'https://github.com/MahmoudAbdulGhani/Gaming-Arena-Reservation-System';
const gamezoneRevision = '2b25a97621c5956c3ea24a2b3a5206fbef6506d9';
const unihubRepo = 'https://github.com/MahmoudAbdulGhani/university-management-system';
const unihubRevision = 'bf341703475285a7fa667fec28ada2b9c3df44d4';
const usersRepo = 'https://github.com/MahmoudAbdulGhani/fastapi-user-management';
const usersRevision = 'a71660b197e3aaf2aa7223318b12d7f430474205';
const medicareRepo = 'https://github.com/MahmoudAbdulGhani/Clinic-management-system';
const medicareRevision = 'a237a4b55059ddacded49eea7d65b63914271e01';
const homeRepo = 'https://github.com/MahmoudAbdulGhani/home-services';
const homeRevision = '583b8d640141fdcd52077b828d56d309418a9d84';

export const caseStudies = {
    'jobpilot-ai': {
        repository: jobpilotRepo, revision: jobpilotRevision, sourceAccess: 'private', kind: 'flagship',
        summary: 'A career workspace that connects reviewed CV evidence, saved jobs, application drafts and interview practice. AI proposes changes; the user decides what becomes part of their profile and documents.',
        problemHeading: 'One application, one consistent source of truth.',
        problem: 'A job search spans listings, CV versions, application drafts and interview notes. JobPilot keeps each saved opportunity connected to reviewed candidate information, so generated suggestions can be checked against their source.',
        lead: ['710055a0-a275-4e6a-991d-4aaa23c6e549.png', '/projects/cinematic/jobpilot-screen.webp'],
        leadCaption: 'Start with a confirmed resume. The library separates uploading a document, confirming extracted text and requesting profile suggestions.',
        workflowHeading: 'From a saved opportunity to the next conversation.',
        workflow: [
            { title: 'Find an opportunity', matches: ['79bf6e53-1fb5-4453-a438-fb5ead4a4961.png'], ratio: '1899 / 877', mobileCrop: { zoom: 3, x: 30, y: 70 }, notice: 'Source and workplace filters narrow discovery. The original listing remains the reference for the role.' },
            { title: 'Keep the application together', matches: ['aba248de-e871-483a-b413-e0db8d4df718.png'], ratio: '1898 / 876', mobileCrop: { zoom: 3, x: 27, y: 38 }, notice: 'A saved job has one workspace for its overview, application pack and tracking. This capture shows the overview, not an approved document.' },
            { title: 'Prepare the conversation', matches: ['8a7fd732-16a0-4b77-a1ad-8ad92e6151f1.png'], ratio: '1900 / 870', mobileCrop: { zoom: 3, x: 39, y: 65 }, notice: 'Voice practice starts with explicit consent. The pictured setup explains that answers remain a draft until the transcript is reviewed.' },
        ],
        contributionIndexes: [0, 2, 3],
        engineeringHeading: 'Keep AI proposals separate from accepted facts.',
        decisions: [
            { title: 'Review before a profile write', constraint: 'Manual edits and AI suggestions can overlap, or become stale.', choice: 'The service merges the proposed changes for review, then checks the reviewed profile’s update timestamp and source freshness under row locks before committing the accepted profile and provenance together.', consequence: 'A changed profile requires another review; repeating the same accepted request does not apply it twice.', sources: ['review'] },
            { title: 'Persist long-running generation', constraint: 'A provider request can outlast the browser or fail after it returns.', choice: 'The configured OpenAI path queues generation. Stored states let the client retrieve progress, while failure and stale-work recovery persist terminal outcomes.', consequence: 'The interface can distinguish processing from failure without starting a second generation just to retrieve its state.', sources: ['generation'] },
            { title: 'Approve the version that is exported', constraint: 'An editable draft is not an approved application document.', choice: 'Application packs retain versions. The download service checks approval on the exact requested version.', consequence: 'A new draft does not inherit the approval of an earlier version.', sources: ['export'] },
        ],
        flow: { title: 'The profile save boundary', steps: ['Confirmed CV', 'Proposed changes', 'User review', 'Revision check', 'Saved profile'], description: 'A code-reviewed path through the profile service. This diagram does not represent a new live save test.' },
        delivered: ['Connected resume, saved-job, application-pack and interview workflows.', 'Reviewed profile changes, background generation states and version-specific document approval in the inspected implementation.'],
        limits: ['Published screens demonstrate interface states. Authenticated saving, document export and live voice/provider behavior were not retested for this case study.', 'The source repository requires access; no audience, hiring-outcome or production-scale result is claimed.'],
        sources: [
            repoSource(jobpilotRepo, jobpilotRevision, 'review', 'Profile review and apply service', 'backend/app/services/profile_suggestion_service.py', 'private'),
            repoSource(jobpilotRepo, jobpilotRevision, 'generation', 'Generation route and stored states', 'backend/app/api/routes/profile_suggestions.py', 'private'),
            repoSource(jobpilotRepo, jobpilotRevision, 'export', 'Application-pack version approval', 'backend/app/services/application_pack_service.py', 'private'),
        ],
    },
    'construction-project-management-accounting-system': {
        repository: cedarRepo, revision: cedarRevision, sourceAccess: 'public', kind: 'flagship',
        summary: 'A construction operations workspace connecting project budgets, invoices, payments and financial reports. Its advisor explains cost trends while Django keeps the calculations and risk rules explicit.',
        problemHeading: 'Follow the project through to its financial record.',
        problem: 'A project budget is only useful when it stays connected to expenses, invoices and payments. Cedar brings those operational documents into one Django application, with a shared accounting path and reports over posted entries.',
        lead: ['425768da-66d4-4088-b725-3199711f8784.png', '/projects/cinematic/cedar-screen.webp'],
        leadCaption: 'The construction portfolio overview connects project status and financial summaries. Pictured monetary values are demonstration data, not business results.',
        workflowHeading: 'From project context to financial explanation.',
        workflow: [
            { title: 'Read the project together', matches: ['b5279347-d2cd-41a6-ac25-84b2cbf7fe71.png', '/projects/cinematic/cedar-detail.webp'], ratio: '1920 / 2333', mobileCrop: { zoom: 4, x: 40, y: 12 }, notice: 'Budget, actual cost and phase progress share the project view, rather than living in disconnected records.' },
            { title: 'Inspect the posted results', matches: ['c6dd1c73-c5dc-4e0c-b30b-3b521d7b5ac5.png'], ratio: '1920 / 1760', mobileCrop: { zoom: 4, x: 36, y: 28 }, notice: 'Reports separate revenue, expenses and receivables. The inventory valuation tile is marked Coming soon; it is not presented as delivered.' },
            { title: 'Explain a calculated estimate', matches: ['88b64d21-f5ad-49ff-8392-5176a9358461.png'], ratio: '572 / 768', mobileCrop: { zoom: 2, x: 50, y: 35 }, notice: 'The advisor labels its output as a trend-based estimate. Groq can explain the numbers; it does not choose the forecast or risk thresholds.' },
        ],
        contributionIndexes: [0, 1, 8],
        engineeringHeading: 'Put financial rules at the shared boundary.',
        decisions: [
            { title: 'One gate for ledger posting', constraint: 'Operational modules must not bypass the accounting rules.', choice: 'Automatic entries and manual posting use the same service. It checks draft status, nonempty lines and equal debit/credit totals inside an atomic operation.', consequence: 'The inspected posting path rejects an unbalanced entry; reports read posted journal lines rather than draft totals.', sources: ['posting', 'reports'] },
            { title: 'Derive balances from allocations', constraint: 'An editable balance can drift away from recorded payments.', choice: 'The payment service calculates an invoice’s outstanding balance from its amount and payment allocations, and centralizes allocation-driven status changes.', consequence: 'The balance has a traceable source in the allocation records instead of a separate manually maintained value.', sources: ['payments'] },
            { title: 'Calculate first, narrate second', constraint: 'An LLM explanation must not decide financial numbers.', choice: 'Django computes the trend estimate and threshold-based risk level. Optional Groq narration receives those facts; missing credentials or provider failure retain deterministic explanatory text.', consequence: 'The estimate remains rule-based and is explicitly not a prediction, regardless of whether narration is available.', sources: ['advisor'] },
        ],
        delivered: ['Project and financial workflows, balanced posting, payment allocations and posted-entry reporting in the inspected Django implementation.', 'A deterministic project advisor with optional Groq explanation and a Docker/Gunicorn deployment configuration.'],
        limits: ['The Render demo did not respond within the review’s public GET check. Authenticated workflows, accounting/concurrency tests and Groq behavior were not retested.', 'Screens show demonstration values. Inventory valuation is labelled Coming soon; no forecast-accuracy or financial-impact result is claimed.'],
        sources: [
            repoSource(cedarRepo, cedarRevision, 'posting', 'Ledger posting rules', 'apps/accounting/services/core.py'),
            repoSource(cedarRepo, cedarRevision, 'reports', 'Posted-entry reports', 'apps/accounting/reports.py'),
            repoSource(cedarRepo, cedarRevision, 'payments', 'Payment allocation service', 'apps/payments/services.py'),
            repoSource(cedarRepo, cedarRevision, 'advisor', 'Deterministic advisor and Groq boundary', 'apps/projects/advisor.py'),
        ],
    },
    lobby: {
        repository: lobbyRepo, revision: lobbyRevision, sourceAccess: 'public', kind: 'flagship',
        summary: 'A team-built communication platform for persistent communities and temporary guest rooms. Invitation links connect people to chat, audio and screen sharing without making every participant follow the same account journey.',
        problemHeading: 'A lasting community, or a room for right now.',
        problem: 'Persistent communities need identity and structure. A quick conversation needs a simpler invitation path. Lobby supports both, with temporary guest rooms alongside the registered community experience.',
        lead: ['/projects/lobby/cover.webp'],
        leadCaption: 'Screen sharing inside an audio room. This published capture shows a team-delivered interface state, not a new live-call test.',
        workflowHeading: 'Enter by invitation, then keep the room together.',
        workflow: [
            { title: 'Join a temporary room', matches: ['/projects/lobby/guest-access.webp'], mobileCrop: { zoom: 3, x: 72, y: 70 }, notice: 'The entry view separates an invitation code from room creation and shows the room’s capacity and lifetime controls.' },
            { title: 'Share one invitation', matches: ['/projects/lobby/share-room.webp'], mobileCrop: { zoom: 2.4, x: 50, y: 50 }, notice: 'The link and QR code lead to the same guest-room entry. The pictured invitation is an existing capture, not a verified current room.' },
            { title: 'Keep chat beside the call', matches: ['/projects/lobby/audio-room.webp'], mobileCrop: { zoom: 3, x: 15, y: 50 }, notice: 'Room chat stays alongside audio and screen-sharing controls. This view shows call setup, not evidence of call quality or participant load.' },
        ],
        contributionIndexes: [0, 1],
        engineeringHeading: 'Share contracts; separate the communication paths.',
        decisions: [
            { title: 'Validate the same room contract', constraint: 'Frontend and backend can otherwise disagree about room settings.', choice: 'A shared Zod schema defines room-name, capacity and lifetime rules. Angular parses the request and NestJS consumes the same schema through its validation pipe.', consequence: 'The two applications use one explicit request shape instead of independently maintained constraints.', sources: ['contracts', 'controller'] },
            { title: 'Separate room data from live media', constraint: 'Chat state and audio transport have different responsibilities.', choice: 'The guest store uses Supabase-scoped room data and realtime subscriptions. The API mints room-specific LiveKit grants for the media connection.', consequence: 'Room membership/data and audio/screen-sharing transport have distinct implementation boundaries.', sources: ['guest', 'media'] },
        ],
        delivered: ['Registered communities and temporary invitation-based rooms with chat and LiveKit-backed media paths in the team implementation.', 'Documented personal contributions to guest/authenticated access, invitations, validation and Supabase-backed workflows.'],
        limits: ['Published room screens demonstrate the UI only. No room was created or joined, and no messages, microphone audio or load tests were submitted during this review.', 'The platform’s full feature set is team delivery; individual ownership is limited to the documented contribution record.'],
        sources: [
            repoSource(lobbyRepo, lobbyRevision, 'contracts', 'Shared guest-room schema', 'packages/shared/src/schemas/guest-channel.schema.ts'),
            repoSource(lobbyRepo, lobbyRevision, 'controller', 'NestJS room validation', 'apps/api/src/modules/guest-channels/guest-channels.controller.ts'),
            repoSource(lobbyRepo, lobbyRevision, 'guest', 'Guest-room data and subscriptions', 'apps/web/src/app/features/guest-room/services/guest-channel.store.ts'),
            repoSource(lobbyRepo, lobbyRevision, 'media', 'Room-specific media grants', 'apps/api/src/modules/calls/calls.service.ts'),
        ],
    },
    'gamezone-arena': {
        repository: gamezoneRepo, revision: gamezoneRevision, sourceAccess: 'public', kind: 'team',
        summary: 'A team-built gaming-arena reservation flow: choose a room, time and devices, then review the booking and payment option. Separate staff screens manage bookings and arena resources.',
        problemHeading: 'Make the reservation choices explicit.',
        problem: 'A booking needs to identify the room, session time, devices and payment state. GameZone turns those decisions into a guided customer flow with a separate administration path.',
        lead: ['/projects/gamezone-arena/choose_Room.webp'],
        leadCaption: 'Room selection is the first booking decision. The pictured rooms and availability are demonstration interface data.',
        workflowHeading: 'One booking, three remaining decisions.',
        workflow: [
            { title: 'Choose the session', matches: ['/projects/gamezone-arena/Booking_date_and_time.webp'], mobileCrop: { zoom: 4, x: 40, y: 34 }, notice: 'The date and time step makes the session explicit before device selection.' },
            { title: 'Choose the devices', matches: ['/projects/gamezone-arena/select_device.webp'], mobileCrop: { zoom: 3, x: 40, y: 35 }, notice: 'Device choices belong to the selected room and session, rather than a separate unconnected request.' },
            { title: 'Review before confirmation', matches: ['/projects/gamezone-arena/confirm_and_pay.webp'], mobileCrop: { zoom: 3, x: 40, y: 26 }, notice: 'The final step summarizes the booking and offers payment choices. A payment screen is not proof that a Stripe transaction settled.' },
        ],
        contributionIndexes: [0, 1],
        engineeringHeading: 'Check the slot and keep payment state explicit.',
        decisions: [
            { title: 'Check overlap on the server', constraint: 'Availability shown in the browser can change before submission.', choice: 'The booking handler queries overlapping active time ranges and distinguishes private-room from device-specific conflicts before insertion.', consequence: 'The implementation can reject a detected conflict. Query-before-insert alone does not prove race-free simultaneous reservations.', sources: ['booking'] },
            { title: 'Keep cash approval separate', constraint: 'A cash selection does not mean money has been received.', choice: 'Cash bookings start pending/unpaid. An admin-checked endpoint records payment and confirms the booking.', consequence: 'Selecting cash and staff recording its receipt are distinct operations.', sources: ['cash'] },
        ],
        delivered: ['A guided reservation interface and customer/staff booking workflows in the three-person implementation.', 'Server-side overlap checks and distinct cash-approval state handling in the reviewed source.'],
        limits: ['No booking, OTP, payment or concurrent-reservation operation was performed. The review does not establish payment settlement or race-free booking guarantees.', 'Screenshots demonstrate the sequence; neither their availability labels nor displayed prices are live operational results.'],
        sources: [
            repoSource(gamezoneRepo, gamezoneRevision, 'booking', 'Booking creation and overlap check', 'app/api/bookings/route.ts'),
            repoSource(gamezoneRepo, gamezoneRevision, 'cash', 'Administrative cash approval', 'app/api/admin/bookings/[id]/approve-cash/route.ts'),
        ],
    },
    unihub: {
        repository: unihubRepo, revision: unihubRevision, sourceAccess: 'public', kind: 'team',
        summary: 'A student workspace inside a team-built university system. Enrolled courses, assignments and academic progress share a portal; Mahmoud’s documented contribution focuses on that student experience.',
        problemHeading: 'Give the student a connected academic view.',
        problem: 'Enrollment, coursework and grades are easier to follow when they share a record. UniHub’s student portal sits alongside the professor and administration portals delivered by the team.',
        lead: ['/projects/unihub/user.webp'],
        leadCaption: 'The student dashboard brings enrolled courses, deadlines and announcements into one view. Its sample GPA and course counts are demonstration data.',
        workflowHeading: 'Read the academic record from the student side.',
        workflow: [
            { title: 'Bring courses and grades together', matches: ['/projects/unihub/transcipt.webp'], mobileCrop: { zoom: 2.6, x: 46, y: 43 }, notice: 'The transcript joins the student’s courses, grades and credits in a printable view. It is an application screen, not a verified academic credential.' },
        ],
        contributionIndexes: [0, 1],
        engineeringHeading: 'Connect the portal to student-specific records.',
        decisions: [
            { title: 'Role checks, then enrollment checks', constraint: 'A student screen needs a server-side boundary as well as navigation.', choice: 'Student routes verify the JWT and require the student role. The service queries the current user’s enrollment/grades and checks enrollment before accepting a submission.', consequence: 'The inspected student paths connect the portal to relevant academic records; this is not a claim that all authorization paths were audited.', sources: ['routes', 'service'] },
            { title: 'Print the existing transcript view', constraint: 'The downloadable record must stay connected to the on-screen data.', choice: 'The React transcript combines student courses and grades, with the download action invoking browser printing.', consequence: 'This is a client-side print workflow, not a separately issued or verified university credential.', sources: ['transcript'] },
        ],
        delivered: ['Student enrollment, coursework and grade views within a larger student/professor/admin product.', 'The documented personal contribution is the student portal and its protected frontend/API integration.'],
        limits: ['No authenticated enrollment, submission, grade update or print/export operation was retested.', 'Professor course-catalog and administration images remain supporting team evidence; they are not relabelled as Mahmoud’s student-portal work.'],
        sources: [
            repoSource(unihubRepo, unihubRevision, 'routes', 'Student JWT and role boundary', 'backend/src/modules/student/student.routes.js'),
            repoSource(unihubRepo, unihubRevision, 'service', 'Enrollment and submission service', 'backend/src/modules/student/student.service.js'),
            repoSource(unihubRepo, unihubRevision, 'transcript', 'Student transcript and browser printing', 'src/pages/student/Transcript.jsx'),
        ],
    },
    'full-stack-user-management-system': {
        repository: usersRepo, revision: usersRevision, sourceAccess: 'public', kind: 'compact',
        summary: 'An independently implemented React/FastAPI application for registration, profile self-service and administrative account management, backed by PostgreSQL.',
        problemHeading: 'Self-service without administrative privileges.',
        problem: 'Registering an account and managing other users need different permissions. This application separates Client and Admin operations and keeps deleted accounts out of normal active-user queries.',
        lead: ['/projects/user-management/dashboard.webp'],
        leadCaption: 'Public aggregate statistics, not an admin dashboard. The pictured counts describe the captured data and are not evidence of adoption.',
        workflowHeading: 'Start with a client account.',
        workflow: [
            { title: 'Registration is a client operation', matches: ['/projects/responsive/user-management-phone.webp'], ratio: '343 / 654', notice: 'The existing mobile capture shows the registration form. Client role assignment is enforced in the server service, not selected by the public form.' },
        ],
        contributionIndexes: [3, 4, 5, 9],
        engineeringHeading: 'Keep account rules in the server.',
        decisions: [
            { title: 'Assign the public role server-side', constraint: 'Public registration must not choose administrative access.', choice: 'The registration service creates Client accounts, normalizes email and hashes the password with Argon2. Admin operations have a separate role dependency.', consequence: 'Role assignment belongs to the API’s implementation rather than a trust in the browser’s form.', sources: ['users', 'auth'] },
            { title: 'Reload users after token validation', constraint: 'A still-valid token may refer to a deleted or changed account.', choice: 'The authentication dependency reloads the user and rejects deleted rows. Soft deletion retains records while active-user queries filter them.', consequence: 'Token validation and current account state are separate checks; deletion does not require physically removing the row.', sources: ['auth', 'users'] },
        ],
        delivered: ['Registration/profile self-service, admin account operations and aggregate statistics in the inspected implementation.'],
        limits: ['No new account, admin change or deletion was submitted. Source inspection does not establish a production security audit; displayed totals are sample data.'],
        sources: [
            repoSource(usersRepo, usersRevision, 'users', 'Registration and soft-deletion rules', 'backend/app/services/user_service.py'),
            repoSource(usersRepo, usersRevision, 'auth', 'Current-user and Admin dependencies', 'backend/app/api/dependencies.py'),
        ],
    },
    'medicare-hub': {
        repository: medicareRepo, revision: medicareRevision, sourceAccess: 'public', kind: 'compact',
        summary: 'A PHP clinic-management project with appointment and role-specific pages. Available source supports a booking-confirmation path; personal ownership and a product-screen walkthrough are not documented in the portfolio.',
        problemHeading: 'An appointment needs a recorded confirmation.',
        problem: 'The project brings clinic scheduling and role-specific pages into one application. The evidence available here is a PHP appointment path, rather than a new authenticated demonstration of clinical operations.',
        lead: ['/projects/cinematic/medicare-logo.webp'],
        leadCaption: 'Existing project identity artwork. It is not a screenshot of appointment booking or clinical records.',
        workflowHeading: 'Follow the appointment code path.', workflow: [], contributionIndexes: [],
        flowPlacement: 'workflow',
        flow: { title: 'Appointment selection → confirmation → history', steps: ['Select an appointment', 'Submit confirmation', 'Open appointment history'], description: 'A diagram of the inspected PHP path, not a simulated product screen. No appointment or patient record was created.' },
        engineeringHeading: 'Separate the form from the recorded action.',
        decisions: [
            { title: 'Confirm against the patient session', constraint: 'An appointment selection still needs a recorded scheduling action.', choice: 'The appointment page checks the patient session/role. Its confirmation handler uses the current patient ID to update the selected appointment and directs the user to history.', consequence: 'Selection and confirmation are distinct source-code steps. This review did not validate the flow against a running clinic database.', sources: ['appointment', 'confirmation'] },
        ],
        delivered: ['Appointment and role-specific PHP pages are present in the inspected repository.'],
        limits: ['No product-workflow screenshots or documented personal contributions were available. The demo returned a host challenge shell, not verified clinic behavior.', 'No clinical records, email recovery, production security or compliance behavior was accessed or tested.'],
        sources: [
            repoSource(medicareRepo, medicareRevision, 'appointment', 'Patient appointment page', 'APPointment.php'),
            repoSource(medicareRepo, medicareRevision, 'confirmation', 'Appointment confirmation handler', 'confirm-appointment.php'),
        ],
    },
    'home-services': {
        repository: homeRepo, revision: homeRevision, sourceAccess: 'public', kind: 'compact',
        summary: 'A responsive home-services landing page implemented in React from a supplied Figma UI kit. The scope is frontend presentation and navigation, rather than an operational booking service.',
        problemHeading: 'Translate a supplied design into a responsive page.',
        problem: 'The implementation turns a supplied landing-page composition into React sections, with breakpoint-specific layouts and a mobile navigation sidebar.',
        designCredit: { label: 'Figma UI kit', url: 'https://www.figma.com/proto/XG6hWGb51vw6XBhUuwMghG/Home-Services---Website---UI-Kit--Community-?node-id=806-5605', creator: null, creatorStatus: 'not identified by the available records' },
        lead: ['/projects/cinematic/home-services.webp'],
        leadCaption: 'The supplied-design landing-page hero. Marketing promises shown in the template are not verified business outcomes.',
        workflowHeading: 'The same navigation, at phone width.',
        workflow: [
            { title: 'A mobile navigation sidebar', matches: ['/projects/phase2/home-services-mobile-menu.webp'], ratio: '390 / 844', notice: 'A new capture of the public page at 390px. Keyboard Enter opened the existing menu and its close button dismissed it; all network writes were blocked.' },
        ],
        contributionIndexes: [], engineeringHeading: 'Adapt the composition through page components.',
        decisions: [
            { title: 'Sections and breakpoint-specific navigation', constraint: 'The supplied desktop design still needs a usable narrow layout.', choice: 'The page composes named React sections. The navigation switches from desktop links to a state-controlled mobile sidebar, while the hero uses breakpoint-specific structure.', consequence: 'Responsive implementation is distinct from authorship of the supplied visual design.', sources: ['composition', 'navigation'] },
        ],
        delivered: ['A component-based landing page and mobile navigation, with supplied-design credit retained.'],
        limits: ['Public menu open/close was checked; the navigation labels use placeholder anchors. Booking, payments and an operational service backend are not demonstrated by this frontend.', 'Personal attribution remains undocumented in the CMS; no conversion, customer or performance results are claimed.'],
        sources: [
            repoSource(homeRepo, homeRevision, 'composition', 'Page section composition', 'src/App.jsx'),
            repoSource(homeRepo, homeRevision, 'navigation', 'Responsive navigation implementation', 'src/components/Navbar.jsx'),
            repoSource(homeRepo, homeRevision, 'credit', 'Supplied-design reference', 'README.md'),
        ],
    },
};

export function caseStudyFor(project) {
    const study = caseStudies[project.slug];
    // A matching slug alone is not enough to editorialize an unrelated CMS
    // record or fixture. Unknown repositories retain the existing reader.
    if (!study || !project.github) return undefined;
    try {
        const url = new URL(project.github);
        const repository = `${url.origin}${url.pathname.replace(/\/$/, '').replace(/\.git$/, '')}`;
        if (repository.toLowerCase() !== study.repository.toLowerCase()) return undefined;
    } catch { return undefined; }
    const personalWork = (project.contributions ?? []).map(value => value.trim()).filter(Boolean);
    const role = project.myRole?.trim() || null;
    const ownership = project.ownership?.trim() || null;
    return { ...study, reviewedAt: '2026-10-09',
        decisions: study.decisions.map(decision => ({ ...decision,
            evidenceKind: 'source-code observation', personalAuthorship: 'not established by code inspection',
        })),
        authorship: {
            status: role || ownership || personalWork.length ? 'documented CMS scope' : 'personal attribution undocumented',
            role, ownership, documentedPersonalWork: personalWork,
            implementationEvidence: 'The engineering decisions describe the project implementation; they do not identify which individual authored a mechanism.',
            boundary: 'Use only the listed personal statements for individual work. Preserve contributed/collaborated scope; do not add specific mechanisms from decisions or screenshots. An empty record does not support attributing the implementation to the portfolio owner.',
        }, evidenceStatus: {
        implementation: 'Inspected at the linked source revision.',
        media: 'Images demonstrate their pictured interface state only; workflow captions identify any new review capture.',
        projectRuntime: 'Authenticated workflows and project backend/provider tests were not rerun in this review.',
        sourceInspection: 'performed; this is observation, not an executed behavior test',
        projectBackendTests: 'not executed in this review',
    } };
}

export function selectedContributions(project, study) {
    const rows = project.contributions ?? [];
    return study.contributionIndexes.map(index => rows[index]?.trim()).filter(Boolean);
}

export function screenMatches(src, matches) {
    const path = src.split(/[?#]/)[0];
    return matches.some(match => match.startsWith('/') ? path === match : path.split('/').at(-1) === match);
}
