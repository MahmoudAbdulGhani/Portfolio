import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiEye,
  FiFolder,
  FiMail,
  FiUsers,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import { useAnalytics, useMessages } from "../../lib/hooks";
import { formatDate } from "../../lib/format";
import type { AnalyticsSummary } from "../../types";
import { motion } from "framer-motion";

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

  const maxViews = Math.max(
    1,
    ...(analytics?.viewsByProject ?? []).map((p) => p.views),
  );
  const recent = (messages ?? []).slice(0, 4);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="admin-heading">Dashboard</h1>
        <p className="mt-1.5 text-sm text-muted">
          An overview of the portfolio's content and activity.
        </p>
      </div>

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
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-ink">
              Views by project
            </h2>
            <Link
              to="/admin/projects"
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-accent transition-colors hover:text-accent-strong"
            >
              Manage
              <FiArrowRight
                size={14}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </Link>
          </div>

          {analyticsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded-md bg-surface-3" />
                  <div className="h-2 animate-pulse rounded-full bg-surface-3" />
                </div>
              ))}
            </div>
          ) : (analytics?.viewsByProject ?? []).length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">No views recorded yet.</p>
          ) : (
            <div className="space-y-4">
              {(analytics?.viewsByProject ?? []).map((p) => (
                <div key={p.slug}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                    <span className="truncate font-semibold text-ink">{p.name}</span>
                    <span className="shrink-0 font-mono text-xs tabular-nums text-muted">
                      {p.views.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(p.views / maxViews) * 100}%` }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
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
    </div>
  );
}
