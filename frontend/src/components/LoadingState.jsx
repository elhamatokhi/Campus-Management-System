export default function LoadingState({ message = 'Loading content...' }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-campus-teal" />
      <p className="text-sm font-medium text-slate-600">{message}</p>
    </div>
  );
}

