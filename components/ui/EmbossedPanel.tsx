import { ReactNode } from "react";

type EmbossedPanelProps = {
  children: ReactNode;
  className?: string;
};

export function EmbossedPanel({ children, className = "" }: EmbossedPanelProps) {
  return (
    <div
      className={`rounded-luxury border border-white/60 bg-gradient-to-br from-white/50 to-beige-100/70 shadow-embossed backdrop-blur-sm ${className}`}
    >
      {children}
    </div>
  );
}
