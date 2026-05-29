export function AlertError({ id, errorMessage }: { id?: string; errorMessage?: string }) {
  if (!errorMessage) return null;
  return (
    <div
      className="flex items-center gap-1 mt-1"
      id={id ? `${id}-error` : undefined}
      role="alert"
    >
      <span className="text-xs font-medium text-destructive">{errorMessage}</span>
    </div>
  );
}
