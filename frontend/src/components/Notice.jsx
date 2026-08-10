export default function Notice({ children, tone = 'info' }) {
  const styles =
    tone === 'warning'
      ? 'border-amber-200 bg-amber-50 text-amber-900'
      : 'border-teal-200 bg-campus-mist text-campus-navy';

  return (
    <div className={`rounded-md border px-4 py-3 text-sm leading-6 ${styles}`}>
      {children}
    </div>
  );
}

