"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Offer, OfferType } from "@/types/offer";
import { OfferCard } from "@/components/offers/OfferCard";
import { formatSalary, OFFER_TYPE_LABELS } from "@/lib/format";

export type SortKey = "tc_desc" | "tc_asc" | "recent";

interface FeedClientProps {
  offers: Offer[];
  total: number;
  page: number;
  pageSize: number;
  company: string;
  role: string;
  offerType: OfferType | "";
  sort: SortKey;
  companyOptions: string[];
  roleOptions: string[];
}

export function FeedClient({
  offers,
  total,
  page,
  pageSize,
  company,
  role,
  offerType,
  sort,
  companyOptions,
  roleOptions,
}: FeedClientProps) {
  const router = useRouter();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const avgTc = offers.length > 0
    ? Math.round(offers.reduce((s, o) => s + o.total_comp, 0) / offers.length)
    : 0;

  function navigate(overrides: {
    company?: string;
    role?: string;
    offerType?: OfferType | "";
    sort?: SortKey;
    page?: number;
  }) {
    const next = { company, role, offerType, sort, page, ...overrides };
    const params = new URLSearchParams();
    if (next.company)            params.set("company", next.company);
    if (next.role)               params.set("role",    next.role);
    if (next.offerType)          params.set("type",    next.offerType);
    if (next.sort !== "tc_desc") params.set("sort",    next.sort);
    if (next.page > 1)           params.set("page",    String(next.page));
    const q = params.toString();
    router.push(q ? `/?${q}` : "/");
  }

  const hasFilters = !!(company || role || offerType);

  const rangeStart = (page - 1) * pageSize + 1;
  const rangeEnd   = Math.min(page * pageSize, total);

  return (
    <div className="space-y-5">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Offers</h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          Anonymous CS offer data, verified by student email
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 divide-x divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <StatCell value={total} label="offers" />
        <StatCell
          value={offers.length > 0 ? formatSalary(avgTc) : "—"}
          label="avg TC"
        />
        <StatCell
          value={totalPages > 1 ? `${page} / ${totalPages}` : "1 / 1"}
          label="page"
        />
      </div>

      {/* Filter + sort row */}
      <div className="flex flex-wrap items-center gap-2">
        <FilterSelect
          value={company}
          onChange={(v) => navigate({ company: v, page: 1 })}
          placeholder="All Companies"
          options={companyOptions.map((c) => ({ value: c, label: c }))}
        />
        <FilterSelect
          value={role}
          onChange={(v) => navigate({ role: v, page: 1 })}
          placeholder="All Roles"
          options={roleOptions.map((r) => ({ value: r, label: r }))}
        />
        <FilterSelect
          value={offerType}
          onChange={(v) => navigate({ offerType: v as OfferType | "", page: 1 })}
          placeholder="All Types"
          options={Object.entries(OFFER_TYPE_LABELS).map(([value, label]) => ({
            value,
            label,
          }))}
        />
        {hasFilters && (
          <button
            onClick={() => navigate({ company: "", role: "", offerType: "", page: 1 })}
            className="text-sm text-zinc-400 underline underline-offset-2 hover:text-zinc-600"
          >
            Clear
          </button>
        )}

        {/* Sort — pushed to the far right */}
        <div className="ml-auto">
          <FilterSelect
            value={sort}
            onChange={(v) => navigate({ sort: v as SortKey, page: 1 })}
            placeholder=""
            options={[
              { value: "tc_desc", label: "Highest TC"  },
              { value: "tc_asc",  label: "Lowest TC"   },
              { value: "recent",  label: "Most Recent" },
            ]}
          />
        </div>
      </div>

      {/* Offer list */}
      {offers.length === 0 ? (
        <EmptyState
          hasFilters={hasFilters}
          onClear={() => navigate({ company: "", role: "", offerType: "", page: 1 })}
        />
      ) : (
        <div className="grid gap-3">
          {offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => navigate({ page: page - 1 })}
            disabled={page <= 1}
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Previous
          </button>
          <span className="text-sm text-zinc-400">
            {rangeStart}–{rangeEnd} of {total}
          </span>
          <button
            onClick={() => navigate({ page: page + 1 })}
            disabled={page >= totalPages}
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCell({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="px-4 py-4 text-center sm:px-6">
      <p className="text-2xl font-bold tabular-nums text-zinc-900">{value}</p>
      <p className="mt-0.5 text-xs text-zinc-400">{label}</p>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function EmptyState({
  hasFilters,
  onClear,
}: {
  hasFilters: boolean;
  onClear: () => void;
}) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-300 p-12 text-center">
      {hasFilters ? (
        <>
          <p className="text-zinc-500">No offers match these filters.</p>
          <button
            onClick={onClear}
            className="mt-2 text-sm text-indigo-600 hover:underline"
          >
            Clear filters
          </button>
        </>
      ) : (
        <>
          <p className="text-zinc-500">No offers yet.</p>
          <p className="mt-1 text-sm text-zinc-400">
            Be the first to{" "}
            <Link href="/submit" className="text-indigo-600 hover:underline">
              share an offer
            </Link>
            .
          </p>
        </>
      )}
    </div>
  );
}
