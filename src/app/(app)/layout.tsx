import { TopNav } from "@/components/top-nav";
import { HydrationGate } from "@/components/hydration-gate";
import { GlobalDialogs } from "@/components/global-dialogs";
import { GlobalSearch } from "@/components/global-search";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-sn-app">
      <TopNav />
      <main className="mx-auto max-w-[1500px] px-4 py-6">
        <HydrationGate>
          {children}
          <GlobalDialogs />
          <GlobalSearch />
        </HydrationGate>
      </main>
    </div>
  );
}
