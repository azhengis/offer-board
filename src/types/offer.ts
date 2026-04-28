// mirrors the offer_type postgres enum
export type OfferType = "full_time" | "internship" | "co_op";

// exact shape of a row returned from Supabase
export interface Offer {
  id: string;           // uuid
  created_at: string;   // ISO 8601 timestamptz

  company: string;
  role: string;
  offer_type: OfferType;
  location: string;

  base_salary: number;       // annual, USD
  equity_per_year: number;   // annualized equity, USD (0 if none)
  total_comp: number;        // generated: base_salary + equity_per_year

  school: string;
  notes: string | null;

  verified: boolean;   // true when submitted via a confirmed .edu token
}

// what the client sends — server-controlled fields are excluded
export type OfferInsert = Omit<Offer, "id" | "created_at" | "total_comp" | "verified">;

export interface OfferFilters {
  offer_type?: OfferType;
  company?: string;
  role?: string;
  min_base?: number;
  max_base?: number;
  sort?: "total_comp" | "base_salary" | "created_at";
  order?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}
