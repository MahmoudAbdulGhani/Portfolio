import { useRef, useState } from "react";
import { FiArrowLeft, FiArrowRight, FiMaximize2 } from "react-icons/fi";
import { ResponsiveProjectImage } from "./ResponsiveProjectImage";
import type { Project } from "../types";

export function ProjectWorkflow({ project, onOpenImage }: { project: Project; onOpenImage: (src: string) => void }) {
  const [selected, setSelected] = useState(0);
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  const items = project.slug === "gamezone-arena" ? [
    { src: "/projects/gamezone-arena/choose_Room.webp", label: "Choose a room" },
    { src: "/projects/gamezone-arena/Booking_date_and_time.webp", label: "Date and time" },
    { src: "/projects/gamezone-arena/select_device.webp", label: "Select a device" },
    { src: "/projects/gamezone-arena/confirm_and_pay.webp", label: "Confirm and pay" },
  ] : project.slug === "unihub" ? [
    { src: "/projects/unihub/usercourses.webp", label: "Student courses" },
    { src: "/projects/unihub/user.webp", label: "User portal" },
    { src: "/projects/unihub/Admin.webp", label: "Admin portal" },
  ] : [];
  const available = items.filter(item => project.screenshots?.includes(item.src));
  if (project.slug === "lobby") {
    const pair = [{ src: "/projects/lobby/community-chat.webp", label: "Persistent communities" }, { src: "/projects/lobby/guest-access.webp", label: "Temporary guest rooms" }].filter(item => project.screenshots?.includes(item.src));
    return <div className="case-mode-pair">{pair.map(item => <figure key={item.src}><button type="button" onClick={() => onOpenImage(item.src)} aria-label={`View ${item.label}`}><ResponsiveProjectImage src={item.src} alt={`${project.name}: ${item.label}`} sizes="(min-width: 1024px) 430px, 92vw" /><FiMaximize2 aria-hidden /></button><figcaption>{item.label}</figcaption></figure>)}</div>;
  }
  if (!available.length) return null;
  const active = available[Math.min(selected, available.length - 1)];
  const select = (index: number, focus = false) => { const next = (index + available.length) % available.length; setSelected(next); if (focus) buttons.current[next]?.focus(); };
  return <div className="case-workflow">
    <div role="tablist" aria-label={`${project.name} views`} className="case-workflow-tabs">{available.map((item, index) => <button type="button" key={item.src} role="tab" id={`workflow-${index}`} aria-selected={selected === index} aria-controls="workflow-image" tabIndex={selected === index ? 0 : -1} ref={element => { buttons.current[index] = element; }} onClick={() => select(index)} onKeyDown={event => { if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) { event.preventDefault(); select(event.key === "Home" ? 0 : event.key === "End" ? available.length - 1 : index + (event.key === "ArrowRight" ? 1 : -1), true); } }}>{item.label}</button>)}</div>
    <div id="workflow-image" role="tabpanel" aria-labelledby={`workflow-${selected}`}><button type="button" onClick={() => onOpenImage(active.src)} aria-label={`View ${active.label} full screen`}><ResponsiveProjectImage src={active.src} alt={`${project.name}: ${active.label}`} sizes="(min-width: 1024px) 900px, 92vw" /><span><FiMaximize2 />View full size</span></button></div>
    <div className="case-workflow-controls"><button type="button" onClick={() => select(selected - 1)} aria-label="Previous product view"><FiArrowLeft /></button><p aria-live="polite">{selected + 1} / {available.length} · {active.label}</p><button type="button" onClick={() => select(selected + 1)} aria-label="Next product view"><FiArrowRight /></button></div>
  </div>;
}
