"use client";

import { useEffect, useState } from "react";
import { useCRM } from "@/lib/store";
import { NinjaMark } from "@/components/logo";

export function HydrationGate({ children }: { children: React.ReactNode }) {
  const hydrated = useCRM((s) => s.hydrated);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Fallback in case onRehydrateStorage doesn't fire
    if (!useCRM.persist.hasHydrated?.()) {
      useCRM.persist.rehydrate?.();
    }
    useCRM.setState({ hydrated: true });
  }, []);

  if (!mounted || !hydrated) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <NinjaMark className="h-12 w-12 animate-pulse" />
        <p className="text-sm text-muted-foreground">Loading your studio…</p>
      </div>
    );
  }

  return <>{children}</>;
}
