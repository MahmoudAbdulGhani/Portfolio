import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { FiArrowUpRight } from "react-icons/fi";
import { LaptopScrollScene } from "./LaptopScrollScene";
import { useSiteSection } from "../lib/hooks";
import type { Project } from "../types";
import "./project-chapters.css";
const artwork: Record<string, {
    main: string;
    detail: string;
    treatment: string;
}> = {
    "jobpilot-ai": { main: "/projects/cinematic/jobpilot-screen.webp", detail: "/projects/cinematic/jobpilot-resume.webp", treatment: "document" },
    lobby: { main: "/projects/lobby/cover.webp", detail: "/projects/lobby/audio-room.webp", treatment: "controls" },
    "gamezone-arena": { main: "/projects/gamezone-arena/cover.webp", detail: "/projects/gamezone-arena/Booking_date_and_time.webp", treatment: "booking" },
    "construction-project-management-accounting-system": { main: "/projects/cinematic/cedar-screen.webp", detail: "/projects/cinematic/cedar-detail.webp", treatment: "dashboard" },
    unihub: { main: "/projects/unihub/usercourses.webp", detail: "/projects/unihub/user.webp", treatment: "portal" },
};
// Artwork never changes the CMS project name, order, visibility or destination.
function ProjectChapter({ project, index }: {
    project: Project;
    index: number;
    total: number;
}) {
    const art = artwork[project.slug];
    return <LaptopScrollScene project={project} index={index} screen={art?.main || project.coverImage || project.screenshots?.[0] || ""} detail={art?.detail || project.screenshots?.[1]}/>;
}
export function ProjectChapters({ featured }: {
    featured: Project[];
}) {
    const { data: section } = useSiteSection("featuredProjects");
    const heading = (section?.eyebrow || "Selected work").split(" ");
    const accent = heading.pop();
    return <section id="projects" className="cinema-projects cinema-chapters" aria-label={section?.eyebrow || "Selected projects"} style={{ "--chapter-screen-left": "7.2048%", "--chapter-screen-top": "6.3172%", "--chapter-screen-width": "85.5237%", "--chapter-screen-height": "83.7366%" } as CSSProperties}>
    <div className="cinema-container chapter-heading"><div><p className="cinema-label">03 / Projects</p><h2>{heading.join(" ")} <em>{accent}</em></h2></div><p className="chapter-intro">{section?.heading}</p></div>
    <div className="cinema-container chapter-list">{featured.map((project, index) => <ProjectChapter key={project.id} project={project} index={index} total={featured.length}/>)}</div>
    <div className="cinema-container chapter-all"><span className="cinema-label">{String(featured.length).padStart(2, "0")} selected projects</span><Link to={section?.ctaUrl || "/projects"} className="cinema-link">{section?.ctaLabel || "View all projects"}<FiArrowUpRight aria-hidden/></Link></div>
  </section>;
}
