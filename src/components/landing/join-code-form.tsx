"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const ALPHABET = /[^ABCDEFGHJKMNPQRSTUVWXYZ23456789]/g;

/** Six-character room code entry. Accepts a pasted invite link too. */
export function JoinCodeForm({ className, autoFocus }: { className?: string; autoFocus?: boolean }) {
  const router = useRouter();
  const [code, setCode] = useState("");

  const onChange = (raw: string) => {
    const fromLink = raw.match(/join\/([A-Za-z0-9]{6})/)?.[1];
    setCode((fromLink ?? raw).toUpperCase().replace(ALPHABET, "").slice(0, 6));
  };

  return (
    <form
      className={cn("flex w-full max-w-sm items-stretch gap-2", className)}
      onSubmit={(e) => {
        e.preventDefault();
        if (code.length === 6) router.push(`/join/${code}`);
      }}
    >
      <label className="sr-only" htmlFor="room-code">
        Room code
      </label>
      <input
        id="room-code"
        value={code}
        onChange={(e) => onChange(e.target.value)}
        placeholder="ROOM CODE"
        autoFocus={autoFocus}
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        inputMode="text"
        className="h-14 w-full min-w-0 rounded-2xl border border-line-strong bg-night/80 px-4 text-center font-mono text-2xl font-bold tracking-[0.35em] text-text placeholder:text-base placeholder:tracking-[0.25em] placeholder:text-faint focus:border-uv focus:outline-none"
      />
      <button
        type="submit"
        disabled={code.length !== 6}
        aria-label="Join game"
        className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-uv text-white shadow-[0_5px_0_#4a1fd1] transition active:translate-y-1 active:shadow-[0_1px_0_#4a1fd1] disabled:opacity-40"
      >
        <ArrowRight className="size-6" />
      </button>
    </form>
  );
}
