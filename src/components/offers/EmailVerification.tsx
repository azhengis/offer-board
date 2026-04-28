"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

type Step = "idle" | "code_sent" | "verified";

interface EmailVerificationProps {
  onVerified: (id: string) => void;
}

export function EmailVerification({ onVerified }: EmailVerificationProps) {
  const [step, setStep] = useState<Step>("idle");
  const [email, setEmail] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendCode() {
    setError(null);
    setLoading(true);

    const res = await fetch("/api/verify/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to send code");
      return;
    }

    setVerificationId(data.id);
    setStep("code_sent");
  }

  async function confirmCode() {
    setError(null);
    setLoading(true);

    const res = await fetch("/api/verify/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: verificationId, code }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Incorrect code");
      return;
    }

    setStep("verified");
    onVerified(verificationId);
  }

  if (step === "verified") {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        <span>
          <strong>.edu address verified.</strong> Your email will not be stored — this offer is anonymous.
        </span>
      </div>
    );
  }

  if (step === "code_sent") {
    return (
      <div className="space-y-3">
        <p className="text-sm text-zinc-600">
          We sent a 6-digit code to <strong>{email}</strong>. It expires in 15 minutes.
        </p>
        <div className="flex gap-2">
          <Input
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            maxLength={6}
            className="w-32 font-mono tracking-widest"
            onKeyDown={(e) => e.key === "Enter" && confirmCode()}
          />
          <Button onClick={confirmCode} disabled={loading || code.length !== 6}>
            {loading ? "Verifying..." : "Verify"}
          </Button>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button
          onClick={() => { setStep("idle"); setCode(""); setError(null); }}
          className="text-xs text-zinc-400 underline underline-offset-2 hover:text-zinc-600"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-zinc-700">Verify your student email</p>
        <p className="text-xs text-zinc-400 mt-0.5">
          We confirm you&apos;re a real student. Your email won&apos;t be stored or linked to your offer.
        </p>
      </div>
      <div className="flex gap-2">
        <Input
          id="edu-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@university.edu"
          className="w-64"
          onKeyDown={(e) => e.key === "Enter" && sendCode()}
        />
        <Button onClick={sendCode} disabled={loading || !email.trim().toLowerCase().endsWith(".edu")}>
          {loading ? "Sending..." : "Send Code"}
        </Button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
