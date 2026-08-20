import { useState, type ReactNode } from "react";
import { FiAlertCircle, FiDownload, FiLoader } from "react-icons/fi";

interface CvDownloadButtonProps {
  url: string;
  className?: string;
  children?: ReactNode;
  filename?: string;
}

export function CvDownloadButton({
  url,
  className = "btn-outline",
  children = "Download CV",
  filename = "Mahmoud-Hussein-Abdul-Ghani-CV.pdf",
}: CvDownloadButtonProps) {
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  const download = async () => {
    if (state === "loading") return;
    setState("loading");
    setMessage("");
    try {
      const response = await fetch(url, { credentials: "include" });
      if (!response.ok) throw new Error(`CV generation failed (${response.status}).`);
      const blob = await response.blob();
      const signature = await blob.slice(0, 5).text();
      if (!response.headers.get("content-type")?.includes("application/pdf") || signature !== "%PDF-") {
        throw new Error("The server did not return a valid PDF.");
      }
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
      setState("idle");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "The CV could not be downloaded.");
    }
  };

  return (
    <span className="inline-flex flex-col items-start gap-2">
      <button type="button" onClick={download} disabled={state === "loading"} className={className}>
        {state === "loading" ? <FiLoader size={17} className="animate-spin" aria-hidden /> : <FiDownload size={17} aria-hidden />}
        {state === "loading" ? "Preparing PDF…" : children}
      </button>
      {state === "error" && (
        <span role="alert" className="inline-flex max-w-xs items-center gap-1.5 text-xs font-semibold text-danger">
          <FiAlertCircle size={13} aria-hidden />
          {message} Please try again.
        </span>
      )}
    </span>
  );
}
