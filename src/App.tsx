import { lazy, Suspense, useEffect } from "react";
import { Outlet, Route, Routes, useLocation } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Home } from "./pages/Home";
import { Projects } from "./pages/Projects";
import { ProjectDetail } from "./pages/ProjectDetail";
import { Contact } from "./pages/Contact";
import { JobMatch } from "./pages/JobMatch";
import { NotFound } from "./pages/NotFound";
import { PortfolioAssistant } from "./components/PortfolioAssistant";

const CvPage = lazy(() => import("./pages/Cv").then((m) => ({ default: m.Cv })));

const AdminLogin = lazy(() =>
  import("./pages/admin/Login").then((m) => ({ default: m.Login })),
);
const AdminLayout = lazy(() =>
  import("./pages/admin/AdminLayout").then((m) => ({ default: m.AdminLayout })),
);
const Dashboard = lazy(() =>
  import("./pages/admin/Dashboard").then((m) => ({ default: m.Dashboard })),
);
const AdminProjects = lazy(() =>
  import("./pages/admin/Projects").then((m) => ({ default: m.AdminProjects })),
);
const ProjectEdit = lazy(() =>
  import("./pages/admin/ProjectEdit").then((m) => ({ default: m.ProjectEdit })),
);
const Messages = lazy(() =>
  import("./pages/admin/Messages").then((m) => ({ default: m.Messages })),
);
const Settings = lazy(() =>
  import("./pages/admin/Settings").then((m) => ({ default: m.Settings })),
);
const Technologies = lazy(() =>
  import("./pages/admin/Technologies").then((m) => ({ default: m.Technologies })),
);
const Skills = lazy(() =>
  import("./pages/admin/Skills").then((m) => ({ default: m.Skills })),
);
const Education = lazy(() =>
  import("./pages/admin/Education").then((m) => ({ default: m.Education })),
);
const Certifications = lazy(() =>
  import("./pages/admin/Certifications").then((m) => ({ default: m.Certifications })),
);
const CvManager = lazy(() =>
  import("./pages/admin/CvManager").then((m) => ({ default: m.CvManager })),
);
const ExperienceAdmin = lazy(() => import("./pages/admin/Experience").then((m) => ({ default: m.ExperienceAdmin })));

function PublicLayout() {
  const { pathname } = useLocation();
  const assistantContext = pathname.match(/^\/projects\/([^/]+)$/)?.[1] ?? "general";
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
      <PortfolioAssistant key={assistantContext} />
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-muted">
        <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
        Loading…
      </div>
    </div>
  );
}

export function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:slug" element={<ProjectDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/job-match" element={<JobMatch />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          <Route path="/cv" element={<CvPage />} />

          <Route path="/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/*" element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="projects/new" element={<ProjectEdit mode="create" />} />
            <Route path="projects/:slug/edit" element={<ProjectEdit />} />
            <Route path="technologies" element={<Technologies />} />
            <Route path="skills" element={<Skills />} />
            <Route path="education" element={<Education />} />
            <Route path="certifications" element={<Certifications />} />
            <Route path="cv" element={<CvManager />} />
            <Route path="experience" element={<ExperienceAdmin />} />
            <Route path="messages" element={<Messages />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}
