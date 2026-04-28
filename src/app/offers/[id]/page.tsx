import { notFound } from "next/navigation";
import Link from "next/link";
import { getOffer } from "@/lib/offers";
import { Badge } from "@/components/ui/Badge";
import { formatSalary, formatDate, OFFER_TYPE_LABELS } from "@/lib/format";

interface OfferPageProps {
  params: { id: string };
}

export default async function OfferPage({ params }: OfferPageProps) {
  let offer;
  try {
    offer = await getOffer(params.id);
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-600">
        ← Back to all offers
      </Link>

      <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">{offer.company}</h1>
            <p className="mt-1 text-zinc-500">{offer.role}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-indigo-600">
              {formatSalary(offer.total_comp)}
            </p>
            <p className="text-xs text-zinc-400">total comp / yr</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
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

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Stat label="Base Salary" value={formatSalary(offer.base_salary)} />
          <Stat
            label="Equity / yr"
            value={offer.equity_per_year > 0 ? formatSalary(offer.equity_per_year) : "—"}
          />
          <Stat label="Location" value={offer.location} />
          <Stat label="School" value={offer.school} />
        </div>

        {offer.notes && (
          <div className="mt-6 rounded-xl bg-zinc-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Notes
            </p>
            <p className="mt-1 text-sm text-zinc-600">{offer.notes}</p>
          </div>
        )}

        <p className="mt-6 text-xs text-zinc-400">
          Shared anonymously on {formatDate(offer.created_at)}
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-zinc-800">{value}</p>
    </div>
  );
}
