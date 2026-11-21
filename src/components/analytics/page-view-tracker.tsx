"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const ID_KEY = "listoff:anon";

function anonId(): string | null {
  try {
    let id = localStorage.getItem(ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(ID_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

function deviceType(): string {
  const w = window.innerWidth;
  return w < 640 ? "mobile" : w < 1024 ? "tablet" : "desktop";
}

/** Sends one anonymous page-view per navigation. Honours Do Not Track / Global Privacy Control. */
export function PageViewTracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
    if (nav.doNotTrack === "1" || nav.globalPrivacyControl) return;
    const body = JSON.stringify({
      name: "page_view",
      path: pathname,
      anonId: anonId(),
      device: deviceType(),
      referrer: document.referrer && !document.referrer.startsWith(location.origin) ? document.referrer : null,
    });
    fetch("/api/analytics", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
  }, [pathname]);
  return null;
}
