import { FiArrowLeft, FiDownload } from "react-icons/fi";
import { Link } from "react-router-dom";
import { API_BASE } from "../lib/api";
import { PageMeta } from "../components/PageMeta";

export function Cv() {
  const pdfUrl = `${API_BASE}/cv.pdf`;
  return <div className="min-h-screen bg-slate-100">
    <PageMeta title="Resume" description="Professional curriculum vitae." />
    <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-950"><FiArrowLeft />Back to portfolio</Link>
        <a href={pdfUrl} download className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"><FiDownload />Download PDF</a>
      </div>
    </div>
    <main className="mx-auto max-w-6xl p-3 sm:p-6">
      <iframe title="Application CV preview" src={`${pdfUrl}?preview=1#toolbar=0`} className="h-[calc(100vh-7rem)] min-h-[700px] w-full rounded-lg border border-slate-200 bg-white shadow-xl" />
      <p className="mt-3 text-center text-xs text-slate-500">If the preview is unavailable in your browser, use Download PDF.</p>
    </main>
  </div>;
}
