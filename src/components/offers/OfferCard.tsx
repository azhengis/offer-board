import Link from "next/link";
import { Offer } from "@/types/offer";
import { Badge } from "@/components/ui/Badge";
import { formatSalary, OFFER_TYPE_LABELS } from "@/lib/format";

// Deterministic color per company so the same company always gets the same avatar.
const AVATAR_PALETTES = [
  "bg-red-100 text-red-700",
  "bg-orange-100 text-orange-700",
  "bg-amber-100 text-amber-700",
  "bg-lime-100 text-lime-700",
  "bg-emerald-100 text-emerald-700",
  "bg-teal-100 text-teal-700",
  "bg-cyan-100 text-cyan-700",
  "bg-blue-100 text-blue-700",
  "bg-indigo-100 text-indigo-700",
  "bg-violet-100 text-violet-700",
  "bg-pink-100 text-pink-700",
  "bg-rose-100 text-rose-700",
];

function avatarClass(company: string): string {
  const hash = company
    .split("")
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return AVATAR_PALETTES[hash % AVATAR_PALETTES.length];
}

interface OfferCardProps {
  offer: Offer;
}

export function OfferCard({ offer }: OfferCardProps) {
  return (
    <Link href={`/offers/${offer.id}`}>
      <article className="group flex gap-4 rounded-xl border border-zinc-200 bg-white p-5 transition-all hover:border-zinc-300 hover:shadow-md cursor-pointer">

        {/* Company avatar */}
        <div
          className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold select-none ${avatarClass(offer.company)}`}
          aria-hidden
        >
          {offer.company.charAt(0).toUpperCase()}
        </div>

        {/* Body */}
        <div className="min-w-0 flex-1">

          {/* Top row: identity + comp */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate font-semibold text-zinc-900 group-hover:text-indigo-600 transition-colors">
                {offer.company}
              </p>
              <p className="truncate text-sm text-zinc-500">{offer.role}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xl font-bold tabular-nums text-zinc-900">
                {formatSalary(offer.total_comp)}
              </p>
              <p className="text-xs tabular-nums text-zinc-400">
                {formatSalary(offer.base_salary)} base
                {offer.equity_per_year > 0 && (
                  <> · {formatSalary(offer.equity_per_year)}/yr eq</>
                )}
              </p>
            </div>
          </div>

          {/* Location · School */}
          <p className="mt-2 truncate text-xs text-zinc-400">
            {offer.location}
            {offer.school && <> &middot; {offer.school}</>}
          </p>

          {/* Badges */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge variant="yellow">{OFFER_TYPE_LABELS[offer.offer_type]}</Badge>
            {offer.verified && (
              <Badge variant="green">
                <span className="flex items-center gap-1">
                  <svg className="h-3 w-3" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
                    <path fillRule="evenodd" d="M10.293 2.293a1 1 0 011.414 1.414l-6 6a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414L5 7.586l5.293-5.293z" clipRule="evenodd" />
                  </svg>
                  .edu verified
                </span>
              </Badge>
            )}
          </div>

          {/* Notes */}
          {offer.notes && (
            <p className="mt-2.5 line-clamp-2 text-xs italic text-zinc-400">
              &ldquo;{offer.notes}&rdquo;
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}
