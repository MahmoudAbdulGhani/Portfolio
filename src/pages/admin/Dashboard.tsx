import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiBriefcase,
  FiExternalLink,
  FiEye,
  FiFileText,
  FiFolder,
  FiMail,
  FiPlus,
  FiUsers,
  FiAlertTriangle,
  FiCheckCircle,
  FiSettings,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import { useAdminProfile, useAdminProjects, useAdminSiteContent, useAnalytics, useMessages } from "../../lib/hooks";
import { formatDate } from "../../lib/format";
import type { AnalyticsSummary } from "../../types";
import { motion } from "framer-motion";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import { StatusBadge } from "../../components/admin/AdminUI";

type StatKey = Pick<
  AnalyticsSummary,
  "publishedProjects" | "totalSkills" | "unreadMessages" | "totalViews"
>;

const statCards: { key: keyof StatKey; label: string; icon: IconType; tone: string }[] = [
  { key: "publishedProjects", label: "Published projects", icon: FiFolder, tone: "text-accent" },
  { key: "totalSkills", label: "Skills listed", icon: FiUsers, tone: "text-accent" },
  { key: "unreadMessages", label: "Unread messages", icon: FiMail, tone: "text-gold" },
  { key: "totalViews", label: "Total views", icon: FiEye, tone: "text-accent" },
];

function StatSkeleton() {
  return (
    <div className="card flex items-center gap-4 p-5">
      <div className="h-11 w-11 animate-pulse rounded-xl bg-surface-3" />
      <div className="flex-1 space-y-2">
        <div className="h-6 w-16 animate-pulse rounded-md bg-surface-3" />
        <div className="h-3 w-28 animate-pulse rounded-full bg-surface-3" />
      </div>
    </div>
  );
}

export function Dashboard() {
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();
  const { data: messages, isLoading: messagesLoading } = useMessages();
  const { data: projects } = useAdminProjects();
  const { data: profile } = useAdminProfile();
  const { data: sections } = useAdminSiteContent();

  const recent = (messages ?? []).slice(0, 4);
  const readiness = [
    !profile?.portfolioUrl && { label: "Add the production portfolio URL", to: "/admin/settings" },
    !profile?.professionalSummary && { label: "Add a concise professional summary", to: "/admin/settings" },
    !profile?.seoDescription && { label: "Add the default SEO description", to: "/admin/settings" },
    projects?.length && !projects.some((project) => project.featured && project.published) && { label: "Choose at least one published featured project", to: "/admin/projects" },
    projects?.some((project) => !project.imageAlt) && { label: "Add alt text to project images", to: "/admin/projects" },
    projects?.some((project) => project.showOnCv && !project.cvDescription) && { label: "Add concise CV copy to selected projects", to: "/admin/projects" },
    sections?.some((section) => section.visible && !section.heading) && { label: "Complete headings for visible sections", to: "/admin/site-content" },
  ].filter(Boolean) as { label: string; to: string }[];

  return (
    <div className="space-y-8">
      <AdminPageHeader title="Dashboard" description="Portfolio health, publishing status, and the next useful actions." meta={<StatusBadge tone={readiness.length ? "warning" : "success"}>{readiness.length ? `${readiness.length} items need attention` : "Content ready"}</StatusBadge>} actions={<Link to="/admin/projects/new" className="btn-primary btn-sm"><FiPlus />Add project</Link>} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {analyticsLoading
          ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
          : statCards.map((card) => {
              const value = analytics?.[card.key] ?? 0;
              return (
                <motion.div
                  key={card.key}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.32, delay: statCards.indexOf(card) * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  className="card flex items-center gap-4 p-5"
                >
                  <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-surface-2 ${card.tone}`}>
                    <card.icon size={19} />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display text-2xl font-bold leading-none text-ink">
                      {value.toLocaleString()}
                    </span>
                    <span className="mt-1 block truncate text-xs text-muted">
                      {card.label}
                    </span>
                  </span>
                </motion.div>
              );
            })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="card p-6">
          <h2 className="font-display text-base font-bold text-ink">Quick actions</h2>
          <p className="mt-1 text-sm text-muted">Common portfolio updates, one click away.</p>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <Link to="/admin/projects/new" className="btn-primary justify-start"><FiPlus />Add project</Link>
            <Link to="/admin/experience" className="btn-outline justify-start"><FiBriefcase />Manage experience</Link>
            <Link to="/admin/cv" className="btn-outline justify-start"><FiFileText />Open CV Manager</Link>
            <Link to="/admin/settings" className="btn-outline justify-start"><FiSettings />Edit profile</Link>
            <Link to="/" className="btn-ghost justify-start"><FiExternalLink />View portfolio</Link>
          </div>
        </div>

        <div className="card p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-ink">
              Recent messages
            </h2>
            <Link
              to="/admin/messages"
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-accent transition-colors hover:text-accent-strong"
            >
              Inbox
              <FiArrowRight
                size={14}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </Link>
          </div>

          {messagesLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 rounded-xl border border-line bg-surface-2 px-4 py-3"
                >
                  <div className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-surface-3" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-32 animate-pulse rounded-full bg-surface-3" />
                    <div className="h-3 w-24 animate-pulse rounded-full bg-surface-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : recent.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">No messages yet.</p>
          ) : (
            <div className="space-y-3">
              {recent.map((msg) => (
                <div
                  key={msg.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-line bg-surface-2 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                      {!msg.read && (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />
                      )}
                      <span className="truncate">{msg.name}</span>
                    </p>
                    <p className="truncate text-xs text-muted">{msg.subject}</p>
                  </div>
                  <span className="shrink-0 font-mono text-[11px] text-faint">
                    {formatDate(msg.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
          <div><h2 className="font-display text-base font-bold text-ink">Content readiness</h2><p className="mt-1 text-sm text-muted">Checks based on content currently saved in the CMS.</p></div>
          <StatusBadge tone={readiness.length ? "warning" : "success"}>{readiness.length ? "Review needed" : "Ready to publish"}</StatusBadge>
        </div>
        {readiness.length ? <ul className="divide-y divide-line">{readiness.map((issue) => <li key={issue.label}><Link to={issue.to} className="group flex items-center gap-3 px-5 py-3.5 text-sm text-ink hover:bg-surface-2 sm:px-6"><FiAlertTriangle className="shrink-0 text-gold" /><span className="flex-1">{issue.label}</span><FiArrowRight className="text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-accent" /></Link></li>)}</ul> : <div className="flex items-center gap-3 px-5 py-6 text-sm text-muted sm:px-6"><FiCheckCircle className="text-ok" />No obvious content gaps were found.</div>}
      </div>
    </div>
  );
}
