import { NextRequest, NextResponse } from "next/server";
import { createHash, randomInt } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendVerificationCode } from "@/lib/email";

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export async function POST(req: NextRequest) {
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();

  if (!email || !email.endsWith(".edu")) {
    return NextResponse.json(
      { error: "A .edu email address is required" },
      { status: 422 }
    );
  }

  const emailHash = sha256(email);
  const supabase = createAdminClient();

  // Delete stale expired records for this hash before checking the rate limit.
  await supabase
    .from("email_verifications")
    .delete()
    .eq("email_hash", emailHash)
    .lt("expires_at", new Date().toISOString());

  // One pending (unverified) code per address at a time.
  const { data: existing } = await supabase
    .from("email_verifications")
    .select("id")
    .eq("email_hash", emailHash)
    .eq("verified", false)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "A code was already sent. Please wait for it to expire before requesting another." },
      { status: 429 }
    );
  }

  const code = randomInt(100_000, 999_999).toString();
  const codeHash = sha256(code);

  const { data, error } = await supabase
    .from("email_verifications")
    .insert({ email_hash: emailHash, code_hash: codeHash })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to create verification" }, { status: 500 });
  }

  try {
    await sendVerificationCode(email, code);
  } catch {
    // Roll back the record so the user can retry.
    await supabase.from("email_verifications").delete().eq("id", data.id);
    return NextResponse.json({ error: "Failed to send email" }, { status: 502 });
  }

  // Return only the ID — never the code or the email.
  return NextResponse.json({ id: data.id });
}
