export function truncateText(value: string | null | undefined, max = 60) {
  if (!value) return "-";

  return value.length > max ? `${value.slice(0, max)}...` : value;
}