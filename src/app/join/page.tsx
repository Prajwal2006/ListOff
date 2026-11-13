import { Backdrop } from "@/components/brand/backdrop";
import { Logo } from "@/components/brand/logo";
import { JoinCodeForm } from "@/components/landing/join-code-form";

export const metadata = { title: "Join a game" };

export default function JoinPage() {
  return (
    <main className="relative grid min-h-dvh place-items-center px-4">
      <Backdrop tone="uv" />
      <div className="flex w-full max-w-sm flex-col items-center gap-8 text-center">
        <Logo size="md" />
        <div>
          <h1 className="font-display text-5xl font-black uppercase">Enter the room</h1>
          <p className="mt-2 text-muted-foreground">Type the six-character code from your host&apos;s screen.</p>
        </div>
        <JoinCodeForm autoFocus className="justify-center" />
      </div>
    </main>
  );
}
