"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Users, Crosshair, Camera, CreditCard, CalendarDays } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useUI } from "@/lib/ui-store";
import { useCRM } from "@/lib/store";
import { formatCurrency, formatDate } from "@/lib/format";

interface Result {
  id: string;
  label: string;
  sub: string;
  href: string;
  icon: typeof Users;
  group: string;
}

export function GlobalSearch() {
  const { searchOpen, setSearchOpen } = useUI();
  const { clients, leads, jobs, invoices, appointments, settings } = useCRM();
  const [q, setQ] = useState("");
  const router = useRouter();

  // Cmd/Ctrl+K shortcut
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSearchOpen]);

  useEffect(() => {
    if (!searchOpen) setQ("");
  }, [searchOpen]);

  const results = useMemo<Result[]>(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    const out: Result[] = [];
    for (const c of clients) {
      if (`${c.firstName} ${c.lastName} ${c.email} ${c.company ?? ""}`.toLowerCase().includes(term))
        out.push({ id: c.id, label: `${c.firstName} ${c.lastName}`, sub: c.email, href: "/clients", icon: Users, group: "Clients" });
    }
    for (const l of leads) {
      if (`${l.name} ${l.email} ${l.jobType}`.toLowerCase().includes(term))
        out.push({ id: l.id, label: l.name, sub: `${l.jobType} · ${l.status}`, href: "/leads", icon: Crosshair, group: "Leads" });
    }
    for (const j of jobs) {
      if (`${j.name} ${j.jobType}`.toLowerCase().includes(term))
        out.push({ id: j.id, label: j.name, sub: `${j.jobType} · ${j.status}`, href: "/jobs", icon: Camera, group: "Jobs" });
    }
    for (const i of invoices) {
      if (i.number.toLowerCase().includes(term))
        out.push({ id: i.id, label: i.number, sub: `${i.type} · ${i.status}`, href: "/payments", icon: CreditCard, group: "Payments" });
    }
    for (const a of appointments) {
      if (`${a.title} ${a.location ?? ""}`.toLowerCase().includes(term))
        out.push({ id: a.id, label: a.title, sub: `${formatDate(a.date)} · ${a.type}`, href: "/calendar", icon: CalendarDays, group: "Calendar" });
    }
    return out.slice(0, 12);
  }, [q, clients, leads, jobs, invoices, appointments]);

  const go = (href: string) => {
    setSearchOpen(false);
    router.push(href);
  };

  return (
    <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-xl" showCloseButton={false}>
        <DialogTitle className="sr-only">Search</DialogTitle>
        <div className="flex items-center gap-2 border-b px-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search clients, leads, jobs, invoices…"
            className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:block">ESC</kbd>
        </div>
        <div className="max-h-[360px] overflow-y-auto p-2 thin-scroll">
          {q.trim() === "" && (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              Start typing to search across your studio.
            </p>
          )}
          {q.trim() !== "" && results.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">No results for “{q}”.</p>
          )}
          {results.map((r) => (
            <button
              key={`${r.group}-${r.id}`}
              onClick={() => go(r.href)}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition hover:bg-accent"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <r.icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{r.label}</span>
                <span className="block truncate text-xs text-muted-foreground">{r.sub}</span>
              </span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{r.group}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
