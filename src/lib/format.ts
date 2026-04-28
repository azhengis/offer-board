export function formatSalary(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${Math.round(amount / 1_000)}K`;
  return `$${amount}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export const OFFER_TYPE_LABELS: Record<string, string> = {
  full_time: "Full-Time",
  internship: "Internship",
  co_op: "Co-op",
} as const;
