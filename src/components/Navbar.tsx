import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-indigo-600">OfferBoard</span>
          <span className="hidden rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600 sm:inline">
            for CS new grads
          </span>
        </Link>
        <Link href="/submit">
          <Button size="sm">+ Share Offer</Button>
        </Link>
      </div>
    </header>
  );
}
