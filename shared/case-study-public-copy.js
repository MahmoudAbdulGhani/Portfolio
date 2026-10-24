// Visitor-facing editorial projection. The original review notes and grounding
// metadata stay in case-study-runtime.js; these descriptions make no new claims.
const copy = {
  'jobpilot-ai': {
    summary: 'A career workspace for saved jobs, application drafts and interview practice, using candidate information approved by the user. AI suggestions require user acceptance.',
    limits: ['AI suggestions remain drafts until accepted; application documents require approval before export.', 'The source repository is private.'],
  },
  'construction-project-management-accounting-system': {
    decisions: { 'One gate for ledger posting': 'The posting service rejects unbalanced entries; reports read posted journal lines rather than draft totals.' },
    limits: ['The advisor explains calculated cost trends rather than predicting financial outcomes.', 'Screens use demonstration values. Inventory valuation is labelled Coming soon.'],
  },
  lobby: {
    summary: 'A team-built communication platform for communities and temporary guest rooms. Mahmoud contributed to guest access, invitations, validation and Supabase-backed workflows.',
    workflow: {
      'Share one invitation': 'A link or QR code opens the guest-room entry.',
      'Keep chat beside the call': 'Chat sits beside audio and screen-sharing controls.',
    },
    delivered: ['Registered communities and temporary invitation-based rooms with chat and LiveKit-backed media paths, delivered by the team.', 'Mahmoud contributed to guest/authenticated access, invitations, validation and Supabase-backed workflows.'],
    limits: ['The platform combines team contributions across community, chat and calling features.', 'Temporary rooms use invitation-based access alongside registered communities.'],
  },
  'gamezone-arena': {
    mediaQualification: 'Availability and prices shown are demonstration data.',
    mediaNotes: ['Booking screens use demonstration rooms, devices, prices and availability.'],
    workflow: { 'Review before confirmation': 'Review the booking details and payment choice before submitting.' },
    delivered: ['A guided reservation interface and customer/staff booking workflows in the three-person implementation.', 'Server-side overlap checks and separate cash-approval states.'],
    limits: ['Availability and prices shown are demonstration data.', 'Cash bookings stay pending until staff record payment. Overlap checks run before insertion; simultaneous bookings require additional concurrency handling.'],
  },
  unihub: {
    summary: 'A student workspace inside a team-built university system. Enrolled courses, assignments and academic progress share a portal; Mahmoud contributed to the student experience.',
    mediaQualification: 'Academic figures shown are demonstration data.',
    workflow: { 'Bring courses and grades together': 'The transcript joins courses, grades and credits in a printable student view.' },
    decisions: {
      'Role checks, then enrollment checks': 'Student routes connect the portal to the current student’s enrollment and academic records.',
      'Print the existing transcript view': 'The download action prints the student view in the browser; it does not issue a university credential.',
    },
    delivered: ['Student enrollment, coursework and grade views within a larger student/professor/admin product.', 'Mahmoud contributed to the student portal and its protected frontend/API integration.'],
    limits: ['Academic records shown are demonstration data; the transcript uses browser printing.', 'Mahmoud contributed to the student portal. Professor and administration portals were delivered by the team.'],
  },
  'full-stack-user-management-system': {
    leadCaption: 'Public aggregate statistics, with sample account totals.',
    delivered: ['Account registration and profile self-service, administrative account operations and aggregate statistics.'],
    limits: ['Displayed totals are sample data. Public registration creates Client accounts; administrative operations use separate role checks.'],
    mediaNotes: ['The registration capture shows the public form at 520px. At 390px, the source application has navigation overflow and a password-icon overlap.'],
  },
  'medicare-hub': {
    leadCaption: 'The public Medicare Hub homepage; the appointment flow is illustrated below.',
    mediaQualification: 'Public homepage and appointment-flow illustration.',
    mediaNotes: ['The gallery includes the public homepage, login page and original project identity.'],
    flowDescription: 'The PHP appointment flow connects selection, confirmation and patient history.',
    decisions: { 'Confirm against the patient session': 'Selection and confirmation are separate actions tied to the current patient session.' },
    delivered: ['Appointment and role-specific PHP pages for a clinic-management project.'],
    limits: ['The gallery presents public pages; the diagram explains the patient appointment flow.', 'This is a clinic-management project, not a clinical service.'],
  },
  'home-services': {
    leadCaption: 'The complete landing page, implemented from a supplied design with template marketing copy.',
    limits: ['A frontend demonstration with placeholder navigation anchors and no operational booking or payment backend.', 'Visual design comes from the supplied Figma UI kit; the project focuses on its React implementation.'],
  },
};

export function publicCaseStudy(study, slug) {
  const { workflow, decisions, flowDescription, ...fields } = copy[slug] || {};
  return {
    ...study, ...fields,
    workflow: study.workflow.map(step => ({ ...step, notice: workflow?.[step.title] || step.notice })),
    decisions: study.decisions.map(decision => ({ ...decision, consequence: decisions?.[decision.title] || decision.consequence })),
    ...(study.flow && { flow: { ...study.flow, ...(flowDescription && { description: flowDescription }) } }),
  };
}
