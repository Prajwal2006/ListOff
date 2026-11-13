import type { Metadata, Viewport } from "next";
import { Big_Shoulders, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import "./globals.css";

const display = Big_Shoulders({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  adjustFontFallback: false,
  fallback: ["Impact", "Arial Narrow", "sans-serif"],
});
const body = Instrument_Sans({ variable: "--font-body", subsets: ["latin"] });
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"], weight: ["500", "700"] });

export const metadata: Metadata = {
  title: { default: "ListOff — How many can you name?", template: "%s · ListOff" },
  description:
    "A fast multiplayer party game. Bid how many answers you can name, see the topic, then race a 20-second clock. Hit your bid, bank the points.",
  applicationName: "ListOff",
};

export const viewport: Viewport = {
  themeColor: "#05071a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable} dark`}>
      <body className="grain min-h-dvh">
        <Providers>{children}</Providers>
        <Toaster
          theme="dark"
          position="top-center"
          toastOptions={{
            style: {
              background: "var(--night)",
              border: "1px solid var(--line-strong)",
              color: "var(--text)",
              fontFamily: "var(--font-body)",
            },
          }}
        />
      </body>
    </html>
  );
}
