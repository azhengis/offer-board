import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createOffer } from "@/lib/offers";
import { OfferInsert } from "@/types/offer";
import { checkRateLimit } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "127.0.0.1";

  const limit = checkRateLimit(ip);
  if (!limit.allowed) {
    const retryAfterSec = Math.ceil((limit.resetAt - Date.now()) / 1000);
    return NextResponse.json(
      { error: "Too many submissions from this IP. You can submit again in 24 hours." },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSec),
          "X-RateLimit-Limit": "3",
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(limit.resetAt / 1000)),
        },
      }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { verification_id, ...offerFields } = body;
  const offer = offerFields as OfferInsert;

  if (!offer.company || !offer.role || !offer.base_salary) {
    return NextResponse.json(
      { error: "company, role, and base_salary are required" },
      { status: 422 }
    );
  }

  const tc = (Number(offer.base_salary) || 0) + (Number(offer.equity_per_year) || 0);
  if (tc < 30_000) {
    return NextResponse.json(
      { error: "Total comp is under $30k — did you enter a monthly or hourly figure?" },
      { status: 422 }
    );
  }
  if (tc > 800_000) {
    return NextResponse.json(
      { error: "Total comp exceeds $800k — double-check your figures." },
      { status: 422 }
    );
  }

  // Every submission must be backed by a verified .edu token.
  if (!verification_id || typeof verification_id !== "string") {
    return NextResponse.json({ error: "Email verification required" }, { status: 403 });
  }

  const supabase = createAdminClient();
  const { data: verification } = await supabase
    .from("email_verifications")
    .select("id, verified, expires_at")
    .eq("id", verification_id)
    .maybeSingle();

  if (!verification || !verification.verified) {
    return NextResponse.json({ error: "Email verification required" }, { status: 403 });
  }

  if (new Date(verification.expires_at) < new Date()) {
    return NextResponse.json({ error: "Verification has expired — please re-verify" }, { status: 403 });
  }

  // Delete the token immediately so it can't be reused.
  await supabase.from("email_verifications").delete().eq("id", verification_id);

  try {
    const created = await createOffer(offer, true);
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
