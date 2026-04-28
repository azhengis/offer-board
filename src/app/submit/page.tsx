"use client";

import { useState } from "react";
import { EmailVerification } from "@/components/offers/EmailVerification";
import { SubmitOfferForm } from "@/components/offers/SubmitOfferForm";

export default function SubmitPage() {
  const [verificationId, setVerificationId] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Share an Offer</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Verified by student email, posted anonymously. Nobody can see who submitted what.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white px-8 py-6 shadow-sm">
        <EmailVerification onVerified={setVerificationId} />
      </div>

      {verificationId && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <SubmitOfferForm verificationId={verificationId} />
        </div>
      )}
    </div>
  );
}
