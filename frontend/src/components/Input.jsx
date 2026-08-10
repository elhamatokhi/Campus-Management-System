export default function Input({ label, id, className = '', containerClassName = '', ...props }) {
  return (
    <label className={`block ${containerClassName}`}>
      <span className="mb-2 block text-sm font-semibold text-campus-navy">{label}</span>
      <input
        id={id}
        className={`focus-ring w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 ${className}`}
        {...props}
      />
    </label>
  );
}
