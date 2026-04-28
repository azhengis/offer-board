import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export async function POST(req: NextRequest) {
  let body: { id?: string; code?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { id, code } = body;

  if (!id || !code) {
    return NextResponse.json({ error: "id and code are required" }, { status: 422 });
  }

  const supabase = createAdminClient();
  const { data: record } = await supabase
    .from("email_verifications")
    .select("code_hash, verified, expires_at")
    .eq("id", id)
    .maybeSingle();

  if (!record) {
    return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
  }

  if (record.verified) {
    return NextResponse.json({ error: "Code already used" }, { status: 400 });
  }

  if (new Date(record.expires_at) < new Date()) {
    return NextResponse.json({ error: "Code has expired" }, { status: 400 });
  }

  if (sha256(code.trim()) !== record.code_hash) {
    return NextResponse.json({ error: "Incorrect code" }, { status: 400 });
  }

  await supabase
    .from("email_verifications")
    .update({ verified: true })
    .eq("id", id);

  return NextResponse.json({ ok: true });
}
