export default function PageShell({ eyebrow, title, description, children, className = '' }) {
  return (
    <section className={`py-10 sm:py-14 ${className}`}>
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        {(eyebrow || title || description) && (
          <div className="mb-8 max-w-3xl">
            {eyebrow && (
              <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-campus-teal">
                {eyebrow}
              </p>
            )}
            {title && (
              <h1 className="text-3xl font-bold text-campus-navy sm:text-4xl">{title}</h1>
            )}
            {description && <p className="mt-4 text-base leading-7 text-slate-600">{description}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

