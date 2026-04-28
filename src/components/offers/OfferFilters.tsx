"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function OfferFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function handleChange(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    startTransition(() => router.push(`/?${params.toString()}`));
  }

  function handleReset() {
    startTransition(() => router.push("/"));
  }

  return (
    <div className="flex flex-wrap gap-3 items-end">
      <Input
        placeholder="Company..."
        defaultValue={searchParams.get("company") ?? ""}
        onChange={(e) => handleChange("company", e.target.value)}
        className="w-40"
      />
      <Input
        placeholder="Role..."
        defaultValue={searchParams.get("role") ?? ""}
        onChange={(e) => handleChange("role", e.target.value)}
        className="w-40"
      />
      <Select
        placeholder="Type"
        value={searchParams.get("offer_type") ?? ""}
        onChange={(e) => handleChange("offer_type", e.target.value)}
        options={[
          { value: "full_time", label: "Full-Time" },
          { value: "internship", label: "Internship" },
          { value: "co_op", label: "Co-op" },
        ]}
        className="w-36"
      />
      <Select
        placeholder="Sort By"
        value={searchParams.get("sort") ?? ""}
        onChange={(e) => handleChange("sort", e.target.value)}
        options={[
          { value: "total_comp", label: "Total Comp" },
          { value: "base_salary", label: "Base Salary" },
          { value: "created_at", label: "Date Posted" },
        ]}
        className="w-36"
      />
      {searchParams.toString() && (
        <Button variant="ghost" size="sm" onClick={handleReset} disabled={isPending}>
          Clear
        </Button>
      )}
    </div>
  );
}
