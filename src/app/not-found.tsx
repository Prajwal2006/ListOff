import Link from "next/link";
import { Backdrop } from "@/components/brand/backdrop";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-4 text-center">
      <Backdrop tone="hot" />
      <div>
        <p className="font-display text-[9rem] font-black leading-none text-hot">0</p>
        <h1 className="font-display text-4xl font-black uppercase">Not on the list</h1>
        <p className="mt-2 text-muted-foreground">That page doesn&apos;t exist.</p>
        <Link href="/" className="mt-6 inline-block rounded-2xl bg-volt px-6 py-3 font-display text-lg font-extrabold uppercase text-[#0a0d00]">
          Back home
        </Link>
      </div>
    </main>
  );
}
