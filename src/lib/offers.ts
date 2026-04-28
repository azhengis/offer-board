import { createClient } from "@/lib/supabase/server";
import { Offer, OfferFilters, OfferInsert } from "@/types/offer";

export const PAGE_SIZE = 20;

export interface PagedOffers {
  offers: Offer[];
  total: number;
}

// Case-insensitive deduplication preserving first-seen display name.
function dedupeValues(values: string[]): string[] {
  const seen = new Map<string, string>();
  for (const v of values) {
    const key = v.trim().toLowerCase();
    if (!seen.has(key)) seen.set(key, v.trim());
  }
  return Array.from(seen.values()).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" })
  );
}

export async function getOffers(filters: OfferFilters = {}): Promise<PagedOffers> {
  const supabase = createClient();
  const page     = Math.max(1, filters.page ?? 1);
  const pageSize = filters.pageSize ?? PAGE_SIZE;
  const from     = (page - 1) * pageSize;
  const to       = from + pageSize - 1;

  let query = supabase.from("offers").select("*", { count: "exact" });

  if (filters.offer_type) query = query.eq("offer_type", filters.offer_type);
  // ilike without wildcards = case-insensitive exact match, handles "Google" vs "google"
  if (filters.company)    query = query.ilike("company", filters.company);
  if (filters.role)       query = query.ilike("role", filters.role);
  if (filters.min_base)   query = query.gte("base_salary", filters.min_base);
  if (filters.max_base)   query = query.lte("base_salary", filters.max_base);

  const sortCol   = filters.sort  ?? "total_comp";
  const sortOrder = filters.order ?? "desc";
  query = query.order(sortCol, { ascending: sortOrder === "asc" }).range(from, to);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);
  return { offers: data as Offer[], total: count ?? 0 };
}

// Fetches all distinct company and role values for dropdown options.
// Two single-column queries — cheap even at 10k rows, and options must span
// the full dataset so they don't disappear when other filters are active.
export async function getFilterOptions(): Promise<{ companies: string[]; roles: string[] }> {
  const supabase = createClient();
  const [companiesRes, rolesRes] = await Promise.all([
    supabase.from("offers").select("company"),
    supabase.from("offers").select("role"),
  ]);
  return {
    companies: dedupeValues((companiesRes.data ?? []).map((r) => r.company)),
    roles:     dedupeValues((rolesRes.data ?? []).map((r) => r.role)),
  };
}

export async function getOffer(id: string): Promise<Offer> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("offers")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);
  return data as Offer;
}

export async function createOffer(offer: OfferInsert, verified = false): Promise<Offer> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("offers")
    .insert({ ...offer, verified })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Offer;
}
