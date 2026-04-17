import { ReactNode } from "react";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  align?: "left" | "center";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left"
}: SectionHeadingProps) {
  return (
    <div className={align === "center" ? "text-center" : "text-left"}>
      {eyebrow ? (
        <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-[#6f6253] sm:text-xs">{eyebrow}</p>
      ) : null}
      <h2 className="font-heading text-[2.2rem] leading-[0.95] text-royal-800 sm:text-5xl">{title}</h2>
      {description ? (
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-royal-700/75 sm:text-base">{description}</p>
      ) : null}
    </div>
  );
}
