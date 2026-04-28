import { getOffers, getFilterOptions, PAGE_SIZE } from "@/lib/offers";
import { FeedClient, SortKey } from "@/components/offers/FeedClient";
import { OfferType } from "@/types/offer";

const VALID_OFFER_TYPES: OfferType[] = ["full_time", "internship", "co_op"];
const VALID_SORTS: SortKey[]         = ["tc_desc", "tc_asc", "recent"];

const SORT_MAP: Record<SortKey, {
  sort: "total_comp" | "base_salary" | "created_at";
  order: "asc" | "desc";
}> = {
  tc_desc: { sort: "total_comp",  order: "desc" },
  tc_asc:  { sort: "total_comp",  order: "asc"  },
  recent:  { sort: "created_at",  order: "desc" },
};

interface HomeProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function Home({ searchParams }: HomeProps) {
  const raw = searchParams;

  const page      = Math.max(1, Number(raw.page) || 1);
  const company   = typeof raw.company === "string" ? raw.company : "";
  const role      = typeof raw.role    === "string" ? raw.role    : "";
  const offerType = VALID_OFFER_TYPES.includes(raw.type as OfferType)
    ? (raw.type as OfferType)
    : ("" as OfferType | "");
  const sort      = VALID_SORTS.includes(raw.sort as SortKey)
    ? (raw.sort as SortKey)
    : "tc_desc";

  const { sort: sortCol, order } = SORT_MAP[sort];

  let result      = { offers: [], total: 0 } as Awaited<ReturnType<typeof getOffers>>;
  let filterOpts  = { companies: [], roles: [] } as Awaited<ReturnType<typeof getFilterOptions>>;

  try {
    [result, filterOpts] = await Promise.all([
      getOffers({
        page,
        company:    company   || undefined,
        role:       role      || undefined,
        offer_type: offerType || undefined,
        sort:       sortCol,
        order,
      }),
      getFilterOptions(),
    ]);
  } catch {
    // FeedClient renders a graceful empty state when arrays are empty.
  }

  return (
    <FeedClient
      offers={result.offers}
      total={result.total}
      page={page}
      pageSize={PAGE_SIZE}
      company={company}
      role={role}
      offerType={offerType}
      sort={sort}
      companyOptions={filterOpts.companies}
      roleOptions={filterOpts.roles}
    />
  );
}
