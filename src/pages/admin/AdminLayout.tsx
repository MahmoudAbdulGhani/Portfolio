import { useEffect, useState } from "react";
import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiAward,
  FiBarChart2,
  FiBookOpen,
  FiCode,
  FiFileText,
  FiBriefcase,
  FiFolder,
  FiLogOut,
  FiMail,
  FiMenu,
  FiSettings,
  FiUser,
  FiX,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth, useLogout, useMessages } from "../../lib/hooks";
import { Logo } from "../../components/Logo";
import { PageMeta } from "../../components/PageMeta";
import { ThemeToggle } from "../../components/ThemeToggle";
import { cn } from "../../lib/format";
import type { AuthUser } from "../../types";

interface NavItem {
  to: string;
  label: string;
  icon: IconType;
}

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Content",
    items: [
      { to: "/admin/dashboard", label: "Dashboard", icon: FiBarChart2 },
      { to: "/admin/projects", label: "Projects", icon: FiFolder },
      { to: "/admin/experience", label: "Experience", icon: FiBriefcase },
      { to: "/admin/skills", label: "Skills", icon: FiUser },
      { to: "/admin/technologies", label: "Technologies", icon: FiCode },
      { to: "/admin/education", label: "Education", icon: FiBookOpen },
      { to: "/admin/certifications", label: "Certifications", icon: FiAward },
    ],
  },
  {
    label: "Documents",
    items: [{ to: "/admin/cv", label: "CV Manager", icon: FiFileText }],
  },
  {
    label: "Communication",
    items: [{ to: "/admin/messages", label: "Messages", icon: FiMail }],
  },
  {
    label: "System",
    items: [{ to: "/admin/settings", label: "Settings", icon: FiSettings }],
  },
];

function SidebarContent({
  unread,
  admin,
  onNavigate,
}: {
  unread: number;
  admin: AuthUser;
  onNavigate?: () => void;
}) {
  const logout = useLogout();
  const handleLogout = () => {
    logout.mutate(undefined, { onSettled: () => { window.location.href = "/admin"; } });
  };
  return (
    <>
      <div className="flex h-16 items-center gap-3 border-b border-line px-6">
        <Logo showLabel={false} />
        <span className="font-display text-sm font-bold text-ink">
          Admin console
        </span>
      </div>

      <div className="flex items-center gap-3 border-b border-line px-6 py-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent/15 font-mono text-xs font-bold text-accent">
          {admin.name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-ink">
            {admin.name}
          </span>
          <span className="block truncate text-[11px] text-faint">
            {admin.email}
          </span>
        </span>
      </div>

      <nav aria-label="Admin" className="flex-1 overflow-y-auto px-4 py-5">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-6">
            <p className="mb-1.5 px-4 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-faint">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cn(
                        "group flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors duration-200",
                        isActive
                          ? "bg-accent/10 text-accent"
                          : "text-muted hover:bg-surface-2 hover:text-ink",
                      )
                    }
                  >
                    <item.icon
                      size={17}
                      className="transition-colors group-hover:text-accent"
                    />
                    {item.label}
                    {item.label === "Messages" && unread > 0 && (
                      <span className="ml-auto rounded-full bg-danger px-2 py-0.5 font-mono text-[10px] font-bold tabular-nums text-white">
                        {unread}
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="space-y-1 border-t border-line p-4">
        <Link
          to="/"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-semibold text-muted transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <FiArrowLeft size={17} />
          View site
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-semibold text-muted transition-colors hover:bg-surface-2 hover:text-danger"
        >
          <FiLogOut size={17} />
          Sign out
        </button>
      </div>
    </>
  );
}

export function AdminLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const auth = useAuth();
  const { data: messages } = useMessages(auth.isSuccess);
  const [mobileNav, setMobileNav] = useState(false);
  const unread = (messages ?? []).filter((m) => !m.read).length;
  const segments = pathname.split("/").filter(Boolean).slice(1);
  const currentLabel = segments.length
    ? segments[segments.length - 1] === "edit"
      ? "Edit project"
      : segments[segments.length - 1] === "new"
        ? "New project"
        : segments[segments.length - 1].replaceAll("-", " ")
    : "Dashboard";

  useEffect(() => {
    if (auth.isError) {
      navigate("/admin", { replace: true });
    }
  }, [auth.isError, navigate]);

  useEffect(() => {
    const onUnauthorized = () => navigate("/admin", { replace: true });
    window.addEventListener("admin:unauthorized", onUnauthorized);
    return () => window.removeEventListener("admin:unauthorized", onUnauthorized);
  }, [navigate]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileNav(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!mobileNav) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileNav]);

  if (auth.isPending) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted">Checking session…</div>;
  }

  if (auth.isError || !auth.data) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <>
      <PageMeta title="Admin" />
      <div className="flex min-h-screen bg-bg">
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-line bg-surface lg:flex">
          <SidebarContent unread={unread} admin={auth.data} />
        </aside>

        <AnimatePresence>
          {mobileNav && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={() => setMobileNav(false)}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                aria-hidden
              />
              <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
                role="dialog"
                aria-modal="true"
                aria-label="Admin navigation"
                className="absolute inset-y-0 left-0 flex w-72 flex-col bg-surface shadow-card-lg"
              >
                <button
                  type="button"
                  onClick={() => setMobileNav(false)}
                  aria-label="Close menu"
                  className="btn-icon absolute right-3 top-3 border border-line text-muted"
                >
                  <FiX size={17} />
                </button>
                <SidebarContent
                  unread={unread}
                  admin={auth.data}
                  onNavigate={() => setMobileNav(false)}
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-bg/92 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileNav(true)}
                aria-label="Open menu"
                className="btn-icon border border-line bg-surface text-ink lg:hidden"
              >
                <FiMenu size={18} />
              </button>
              <Logo showLabel={false} />
              <span className="font-display text-sm font-bold text-ink lg:hidden">
                Admin
              </span>
              <div className="hidden items-center gap-2 text-xs sm:flex lg:flex">
                <Link to="/admin/dashboard" className="text-faint hover:text-ink">Admin</Link>
                <span aria-hidden="true" className="text-line-strong">/</span>
                <span className="max-w-48 truncate font-semibold capitalize text-muted" aria-current="page">{currentLabel}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link
                to="/"
                className="btn-ghost btn-sm"
                aria-label="View site"
              >
                <FiArrowLeft size={15} />
                <span className="hidden sm:inline">View site</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  fetch(`${import.meta.env.VITE_API_URL ?? "/api"}/admin/auth/logout`, { method: "POST", credentials: "include" })
                    .finally(() => { window.location.href = "/admin"; });
                }}
                className="btn-ghost-danger btn-icon-sm"
                aria-label="Sign out"
              >
                <FiLogOut size={15} />
              </button>
            </div>
          </header>

          <main className="flex-1 p-5 sm:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}
