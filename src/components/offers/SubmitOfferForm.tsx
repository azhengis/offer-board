"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { formatSalary } from "@/lib/format";

interface SubmitOfferFormProps {
  verificationId: string;
}

const TC_MIN = 30_000;
const TC_MAX = 800_000;

type FieldErrors = Partial<Record<
  "company" | "role" | "offer_type" | "location" | "base_salary" | "school" | "tc",
  string
>>;

function validate(data: FormData, base: string, equity: string): FieldErrors {
  const errs: FieldErrors = {};
  if (!data.get("company")?.toString().trim())   errs.company    = "Required";
  if (!data.get("role")?.toString().trim())      errs.role       = "Required";
  if (!data.get("offer_type"))                   errs.offer_type = "Required";
  if (!data.get("location")?.toString().trim())  errs.location   = "Required";
  if (!base || Number(base) <= 0)                errs.base_salary = "Required";
  if (!data.get("school")?.toString().trim())    errs.school     = "Required";
  const tc = (Number(base) || 0) + (Number(equity) || 0);
  if (tc < TC_MIN) errs.tc = `Total comp looks too low ($${(TC_MIN / 1000).toFixed(0)}k minimum) — did you enter a monthly or hourly figure?`;
  if (tc > TC_MAX) errs.tc = `Total comp looks too high ($${(TC_MAX / 1000).toFixed(0)}k maximum) — double-check your figures.`;
  return errs;
}

export function SubmitOfferForm({ verificationId }: SubmitOfferFormProps) {
  const router = useRouter();

  // Controlled only for the fields that feed the live TC preview.
  const [base, setBase] = useState("");
  const [equity, setEquity] = useState("");

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const tc = (Number(base) || 0) + (Number(equity) || 0);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    const errs = validate(form, base, equity);
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      // Scroll to the first error so it's visible.
      const firstField = Object.keys(errs)[0];
      document.getElementById(firstField)?.focus();
      return;
    }

    setFieldErrors({});
    setSubmitError(null);
    setLoading(true);

    const res = await fetch("/api/offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        verification_id: verificationId,
        company:         form.get("company"),
        role:            form.get("role"),
        offer_type:      form.get("offer_type"),
        location:        form.get("location"),
        base_salary:     Number(base),
        equity_per_year: equity ? Number(equity) : 0,
        school:          form.get("school"),
        notes:           form.get("notes") || null,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setSubmitError(data.error ?? "Something went wrong");
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">

      {/* ── Role ─────────────────────────────────────────────── */}
      <fieldset className="space-y-4">
        <legend className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Role
        </legend>
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <Input
            id="company"
            name="company"
            label="Company *"
            placeholder="Google"
            error={fieldErrors.company}
            onChange={() => fieldErrors.company && setFieldErrors(p => ({ ...p, company: undefined }))}
          />
          <Input
            id="role"
            name="role"
            label="Role *"
            placeholder="Software Engineer"
            error={fieldErrors.role}
            onChange={() => fieldErrors.role && setFieldErrors(p => ({ ...p, role: undefined }))}
          />
          <Select
            id="offer_type"
            name="offer_type"
            label="Offer Type *"
            placeholder="Select type"
            error={fieldErrors.offer_type}
            onChange={() => fieldErrors.offer_type && setFieldErrors(p => ({ ...p, offer_type: undefined }))}
            options={[
              { value: "full_time",   label: "Full-Time" },
              { value: "internship",  label: "Internship" },
              { value: "co_op",       label: "Co-op" },
            ]}
          />
          <Input
            id="location"
            name="location"
            label="Location *"
            placeholder="Seattle, WA"
            error={fieldErrors.location}
            onChange={() => fieldErrors.location && setFieldErrors(p => ({ ...p, location: undefined }))}
          />
        </div>
      </fieldset>

      {/* ── Compensation ─────────────────────────────────────── */}
      <fieldset className="space-y-4">
        <legend className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Compensation
        </legend>
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <Input
            id="base_salary"
            name="base_salary"
            label="Base Salary * ($/yr)"
            type="number"
            placeholder="150000"
            min={0}
            value={base}
            onChange={(e) => {
              setBase(e.target.value);
              if (fieldErrors.base_salary || fieldErrors.tc)
                setFieldErrors(p => ({ ...p, base_salary: undefined, tc: undefined }));
            }}
            error={fieldErrors.base_salary}
          />
          <Input
            id="equity_per_year"
            name="equity_per_year"
            label="Equity ($/yr)"
            type="number"
            placeholder="25000"
            min={0}
            value={equity}
            onChange={(e) => {
              setEquity(e.target.value);
              if (fieldErrors.tc) setFieldErrors(p => ({ ...p, tc: undefined }));
            }}
          />

          {/* TC display — spans both columns on mobile, single column on sm+ */}
          <div className="sm:col-span-2">
            <div className={`rounded-lg border px-4 py-3 ${fieldErrors.tc ? "border-red-300 bg-red-50" : "border-zinc-200 bg-zinc-50"}`}>
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-sm font-medium text-zinc-700">
                  Total Comp * (annualized)
                </span>
                <span className={`text-xl font-bold tabular-nums ${tc > 0 ? "text-zinc-900" : "text-zinc-300"}`}>
                  {tc > 0 ? formatSalary(tc) : "—"}
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-400">
                = base + equity per year.{" "}
                <strong className="text-zinc-500">Enter yearly figures only</strong>{" "}
                — not hourly, not monthly. For internships, annualize the hourly rate
                (hourly × 2080).
              </p>
            </div>
            {fieldErrors.tc && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.tc}</p>
            )}
          </div>
        </div>
      </fieldset>

      {/* ── Background ───────────────────────────────────────── */}
      <fieldset className="space-y-4">
        <legend className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Background
        </legend>
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <Input
            id="school"
            name="school"
            label="School *"
            placeholder="University of Illinois Urbana-Champaign"
            error={fieldErrors.school}
            onChange={() => fieldErrors.school && setFieldErrors(p => ({ ...p, school: undefined }))}
          />
          {/* Notes lives in the right column on the same row as school */}
          <div className="flex flex-col gap-1">
            <label htmlFor="notes" className="text-sm font-medium text-zinc-700">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder="Recruiter tips, timeline, whether you negotiated..."
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
          </div>
        </div>
      </fieldset>

      {submitError && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{submitError}</p>
      )}

      <Button type="submit" disabled={loading} size="lg">
        {loading ? "Submitting..." : "Submit Anonymously"}
      </Button>
    </form>
  );
}
