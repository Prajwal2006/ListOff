"use client";

import { useEffect, useState } from "react";
import { useClientValue } from "@/lib/client/use-client-value";
import QRCode from "qrcode";
import { Check, Copy, Share2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function useJoinUrl(code: string) {
  const origin = useClientValue(() => process.env.NEXT_PUBLIC_APP_URL || window.location.origin, "");
  return `${origin.replace(/\/$/, "")}/join/${code}`;
}

export function ShareCard({ code, big = false }: { code: string; big?: boolean }) {
  const url = useJoinUrl(code);
  const [qr, setQr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!url.startsWith("http")) return;
    QRCode.toString(url, { type: "svg", margin: 0, color: { dark: "#05071a", light: "#ffffff" } })
      .then(setQr)
      .catch(() => setQr(null));
  }, [url]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Invite link copied");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Couldn't copy — select the link and copy it manually.");
    }
  }

  async function share() {
    try {
      await navigator.share({ title: "Join my ListOff game", text: `Room code ${code}`, url });
    } catch {
      /* dismissed */
    }
  }

  return (
    <div className={cn("panel flex flex-col gap-5 p-5 sm:flex-row sm:items-center", big && "sm:p-7")}>
      {qr && (
        <div
          className={cn("shrink-0 self-center rounded-2xl bg-white p-3", big ? "size-44" : "size-32")}
          dangerouslySetInnerHTML={{ __html: qr }}
          aria-label="QR code for the invite link"
          role="img"
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan">Join at {url.replace(/^https?:\/\//, "").replace(/\/join\/.*/, "")}</p>
        <p className={cn("font-mono font-bold tracking-[0.25em] text-text", big ? "text-6xl sm:text-7xl" : "text-5xl")}>{code}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={copy}
            className="flex h-11 min-w-0 max-w-full items-center gap-2 rounded-xl border border-line-strong bg-ink/60 px-3 text-sm text-muted-foreground hover:text-text"
          >
            {copied ? <Check className="size-4 shrink-0 text-volt" /> : <Copy className="size-4 shrink-0" />}
            <span className="truncate font-mono">{url}</span>
          </button>
          {typeof navigator !== "undefined" && "share" in navigator && (
            <button
              onClick={share}
              className="flex h-11 items-center gap-2 rounded-xl border border-line-strong bg-ink/60 px-3 text-sm text-muted-foreground hover:text-text"
            >
              <Share2 className="size-4" /> Share
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
