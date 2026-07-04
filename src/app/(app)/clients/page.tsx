"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Building2,
} from "lucide-react";
import { useCRM } from "@/lib/store";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { formatCurrency, formatDate, invoiceTotal } from "@/lib/format";
import type { Client } from "@/lib/types";
import { ClientDialog } from "@/components/dialogs/client-dialog";
import { toast } from "sonner";

export default function ClientsPage() {
  const { clients, jobs, invoices, deleteClient, settings } = useCRM();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const clientStats = (id: string) => {
    const cJobs = jobs.filter((j) => j.clientId === id);
    const cInvoices = invoices.filter((i) => i.clientId === id);
    const total = cInvoices.reduce((s, i) => s + invoiceTotal(i), 0);
    return { jobCount: cJobs.length, total };
  };

  const filtered = useMemo(() => {
    return clients
      .filter(
        (c) =>
          `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
          c.email.toLowerCase().includes(search.toLowerCase()) ||
          (c.company ?? "").toLowerCase().includes(search.toLowerCase()),
      )
      .sort((a, b) => a.firstName.localeCompare(b.firstName));
  }, [clients, search]);

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (c: Client) => {
    setEditing(c);
    setDialogOpen(true);
  };

  return (
    <div>
      <PageHeader title="Clients" subtitle="Your complete client database.">
        <Button onClick={openNew} className="gap-1.5">
          <Plus className="h-4 w-4" /> Add Client
        </Button>
      </PageHeader>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search clients…" value={search} onChange={(e) => setSearch(e.target.value)} className="bg-white pl-9" />
        </div>
        <div className="ml-auto rounded-md border bg-white px-4 py-2 text-sm">
          <span className="text-muted-foreground">Total clients: </span>
          <span className="font-bold text-primary">{clients.length}</span>
        </div>
      </div>

      <Card className="overflow-hidden p-0 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 text-center font-medium">Jobs</th>
                <th className="px-4 py-3 text-right font-medium">Total Billed</th>
                <th className="px-4 py-3 font-medium">Since</th>
                <th className="w-10 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((c) => {
                const stats = clientStats(c.id);
                return (
                  <tr key={c.id} className="group cursor-pointer hover:bg-muted/30" onClick={() => setDetailId(c.id)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-accent text-xs font-semibold text-accent-foreground">
                            {c.firstName[0]}{c.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium hover:text-primary">
                            {c.firstName} {c.lastName}
                          </div>
                          {c.partnerName && <div className="text-xs text-muted-foreground">& {c.partnerName}</div>}
                          {c.company && <div className="text-xs text-muted-foreground">{c.company}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-muted-foreground">{c.email}</div>
                      <div className="text-xs text-muted-foreground">{c.phone}</div>
                    </td>
                    <td className="px-4 py-3 text-center font-medium">{stats.jobCount}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(stats.total, settings.currency)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">{formatDate(c.createdAt)}</td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="rounded-md p-1.5 text-muted-foreground opacity-60 transition hover:bg-muted group-hover:opacity-100">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(c)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              if (confirm(`Delete client "${c.firstName} ${c.lastName}"?`)) {
                                deleteClient(c.id);
                                toast.success("Client deleted");
                              }
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No clients found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <ClientDialog open={dialogOpen} onOpenChange={setDialogOpen} client={editing} />
      <ClientDetailSheet clientId={detailId} onClose={() => setDetailId(null)} onEdit={openEdit} />
    </div>
  );
}

function ClientDetailSheet({
  clientId,
  onClose,
  onEdit,
}: {
  clientId: string | null;
  onClose: () => void;
  onEdit: (c: Client) => void;
}) {
  const { clients, jobs, invoices, settings } = useCRM();
  const client = clients.find((c) => c.id === clientId) ?? null;
  const cJobs = jobs.filter((j) => j.clientId === clientId);
  const cInvoices = invoices.filter((i) => i.clientId === clientId);

  return (
    <Sheet open={!!clientId} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        {client && (
          <>
            <SheetHeader>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary text-sm font-semibold text-white">
                    {client.firstName[0]}{client.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <SheetTitle className="text-lg">
                    {client.firstName} {client.lastName}
                    {client.partnerName && <span className="text-muted-foreground"> &amp; {client.partnerName}</span>}
                  </SheetTitle>
                  {client.company && <p className="text-sm text-muted-foreground">{client.company}</p>}
                </div>
              </div>
            </SheetHeader>

            <div className="mt-5 space-y-5">
              <div className="space-y-2 rounded-lg border bg-muted/30 p-3 text-sm">
                <ContactRow icon={Mail} value={client.email} />
                <ContactRow icon={Phone} value={client.phone} />
                {client.address && <ContactRow icon={MapPin} value={client.address} />}
                {client.company && <ContactRow icon={Building2} value={client.company} />}
              </div>

              <div>
                <h4 className="mb-2 text-sm font-semibold">Jobs ({cJobs.length})</h4>
                <div className="space-y-2">
                  {cJobs.length === 0 && <p className="text-xs text-muted-foreground">No jobs yet.</p>}
                  {cJobs.map((j) => (
                    <Link
                      key={j.id}
                      href="/jobs"
                      className="flex items-center justify-between rounded-md border p-2.5 text-sm transition hover:border-primary/40 hover:bg-accent/40"
                    >
                      <div>
                        <div className="font-medium">{j.name}</div>
                        <div className="text-xs text-muted-foreground">{formatDate(j.shootDate)}</div>
                      </div>
                      <StatusBadge status={j.status} />
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-2 text-sm font-semibold">Invoices ({cInvoices.length})</h4>
                <div className="space-y-2">
                  {cInvoices.length === 0 && <p className="text-xs text-muted-foreground">No invoices yet.</p>}
                  {cInvoices.map((i) => (
                    <Link
                      key={i.id}
                      href="/payments"
                      className="flex items-center justify-between rounded-md border p-2.5 text-sm transition hover:border-primary/40 hover:bg-accent/40"
                    >
                      <div>
                        <div className="font-medium">{i.number}</div>
                        <div className="text-xs text-muted-foreground">{formatCurrency(invoiceTotal(i), settings.currency)}</div>
                      </div>
                      <StatusBadge status={i.status} />
                    </Link>
                  ))}
                </div>
              </div>

              {client.notes && (
                <div>
                  <h4 className="mb-1 text-sm font-semibold">Notes</h4>
                  <p className="text-sm text-muted-foreground">{client.notes}</p>
                </div>
              )}

              <Button variant="outline" className="w-full" onClick={() => { onClose(); onEdit(client); }}>
                <Pencil className="mr-2 h-4 w-4" /> Edit client
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function ContactRow({ icon: Icon, value }: { icon: typeof Mail; value: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{value}</span>
    </div>
  );
}
