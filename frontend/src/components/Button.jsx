const variants = {
  primary: 'bg-campus-teal text-white hover:bg-teal-700',
  secondary: 'border border-slate-300 bg-white text-campus-navy hover:border-campus-teal hover:text-campus-teal',
  danger: 'bg-campus-coral text-white hover:bg-red-700',
};

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  className = '',
  ...props
}) {
  return (
    <button
      type={type}
      className={`focus-ring inline-flex min-h-11 items-center justify-center rounded-md px-5 py-2.5 text-sm font-semibold transition ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

