import type { ReactNode } from "react";

type PolicySection = {
  heading: string;
  body: string;
};

export function PolicyPageLayout({
  title,
  effectiveDate,
  sections,
  children
}: {
  title: string;
  effectiveDate: string;
  sections: PolicySection[];
  children?: ReactNode;
}) {
  return (
    <div className="container-base py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-2">
          <h1 className="font-heading text-3xl text-stone-900">{title}</h1>
          <p className="text-sm text-stone-500">Effective Date: {effectiveDate}</p>
        </header>

        <div className="card space-y-6 p-6">
          {sections.map((section) => (
            <section key={section.heading} className="space-y-2">
              <h2 className="font-heading text-xl text-stone-900">{section.heading}</h2>
              <p className="text-sm leading-6 text-stone-600">{section.body}</p>
            </section>
          ))}
          {children}
        </div>
      </div>
    </div>
  );
}
