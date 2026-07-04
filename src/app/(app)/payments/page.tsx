"use client";

import { useMemo, useState } from "react";
import { Plus, Search, MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";
import { useCRM } from "@/lib/store";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  formatCurrency,
  formatDate,
  invoiceBalance,
  invoicePaid,
  invoiceTotal,
} from "@/lib/format";
import type { DocType, Invoice } from "@/lib/types";
import { InvoiceDialog } from "@/components/dialogs/invoice-dialog";
import { InvoiceView } from "@/components/dialogs/invoice-view";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function PaymentsPage() {
  const { invoices, clients, deleteInvoice, settings } = useCRM();
  const [tab, setTab] = useState<DocType>("Invoice");
  const [search, setSearch] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [viewing, setViewing] = useState<Invoice | null>(null);
  const [defaultType, setDefaultType] = useState<DocType>("Invoice");

  const clientName = (id: string) => {
    const c = clients.find((x) => x.id === id);
    return c ? `${c.firstName} ${c.lastName}` : "—";
  };

  const list = useMemo(() => {
    return invoices
      .filter((i) => i.type === tab)
      .filter(
        (i) =>
          i.number.toLowerCase().includes(search.toLowerCase()) ||
          clientName(i.clientId).toLowerCase().includes(search.toLowerCase()),
      )
      .sort((a, b) => b.issueDate.localeCompare(a.issueDate));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoices, tab, search, clients]);

  // KPIs (invoices only)
  const allInvoices = invoices.filter((i) => i.type === "Invoice");
  const totalInvoiced = allInvoices.reduce((s, i) => s + invoiceTotal(i), 0);
  const totalPaid = allInvoices.reduce((s, i) => s + invoicePaid(i), 0);
  const totalOutstanding = allInvoices.reduce((s, i) => s + Math.max(0, invoiceBalance(i)), 0);

  const openNew = () => {
    setEditing(null);
    setDefaultType(tab);
    setEditorOpen(true);
  };
  const openEdit = (i: Invoice) => {
    setViewing(null);
    setEditing(i);
    setEditorOpen(true);
  };

  return (
    <div>
      <PageHeader title="Payments" subtitle="Invoices, quotes and income tracking.">
        <Button onClick={openNew} className="gap-1.5">
          <Plus className="h-4 w-4" /> New {tab}
        </Button>
      </PageHeader>

      {/* KPIs */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Total Invoiced</p>
          <p className="mt-1 text-2xl font-bold">{formatCurrency(totalInvoiced, settings.currency)}</p>
        </Card>
        <Card className="p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Received</p>
          <p className="mt-1 text-2xl font-bold text-primary">{formatCurrency(totalPaid, settings.currency)}</p>
        </Card>
        <Card className="p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Outstanding</p>
          <p className="mt-1 text-2xl font-bold text-rose-500">{formatCurrency(totalOutstanding, settings.currency)}</p>
        </Card>
      </div>

      {/* Tabs + search */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex overflow-hidden rounded-md border bg-white">
          {(["Invoice", "Quote"] as DocType[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors",
                tab === t ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted",
              )}
            >
              {t}s
            </button>
          ))}
        </div>
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} className="bg-white pl-9" />
        </div>
      </div>

      <Card className="overflow-hidden p-0 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Number</th>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Issued</th>
                <th className="px-4 py-3 font-medium">Due</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
                <th className="px-4 py-3 text-right font-medium">Balance</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="w-10 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {list.map((i) => (
                <tr key={i.id} className="group cursor-pointer hover:bg-muted/30" onClick={() => setViewing(i)}>
                  <td className="px-4 py-3 font-medium hover:text-primary">{i.number}</td>
                  <td className="px-4 py-3 text-muted-foreground">{clientName(i.clientId)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">{formatDate(i.issueDate)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">{formatDate(i.dueDate)}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(invoiceTotal(i), settings.currency)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={invoiceBalance(i) > 0 ? "font-medium text-rose-500" : "text-muted-foreground"}>
                      {formatCurrency(invoiceBalance(i), settings.currency)}
                    </span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={i.status} /></td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="rounded-md p-1.5 text-muted-foreground opacity-60 transition hover:bg-muted group-hover:opacity-100">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setViewing(i)}>
                          <Eye className="mr-2 h-4 w-4" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEdit(i)}>
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            if (confirm(`Delete ${i.type} ${i.number}?`)) {
                              deleteInvoice(i.id);
                              toast.success(`${i.type} deleted`);
                            }
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No {tab.toLowerCase()}s yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <InvoiceDialog open={editorOpen} onOpenChange={setEditorOpen} invoice={editing} defaultType={defaultType} />
      <InvoiceView invoice={viewing} onClose={() => setViewing(null)} onEdit={openEdit} />
    </div>
  );
}
