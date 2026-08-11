import { cn } from "../lib/format";
import { Reveal } from "./Reveal";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        "mb-12 max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      <span className={cn("eyebrow", align === "center" && "justify-center")}>
        {eyebrow}
      </span>
      <h2 className="heading mt-4">{title}</h2>
      {description && (
        <p className="mt-4 text-[15px] leading-relaxed text-muted">
          {description}
        </p>
      )}
    </Reveal>
  );
}
