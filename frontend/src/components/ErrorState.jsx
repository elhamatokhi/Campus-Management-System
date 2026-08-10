export default function ErrorState({ title = 'Something went wrong', message }) {
  return (
    <div className="rounded-md border border-red-200 bg-red-50 p-6">
      <h2 className="text-base font-semibold text-red-900">{title}</h2>
      {message && <p className="mt-2 text-sm leading-6 text-red-700">{message}</p>}
    </div>
  );
}

