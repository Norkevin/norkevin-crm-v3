"use client";

import { useMemo, useState } from "react";
import { Plus, Search, MoreHorizontal, ArrowRightCircle, Pencil, Trash2 } from "lucide-react";
import { useCRM } from "@/lib/store";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency, formatDate } from "@/lib/format";
import { LEAD_STATUSES, type Lead } from "@/lib/types";
import { LeadDialog } from "@/components/dialogs/lead-dialog";
import { toast } from "sonner";

export default function LeadsPage() {
  const { leads, deleteLead, convertLeadToJob, settings } = useCRM();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);

  const filtered = useMemo(() => {
    return leads
      .filter((l) => statusFilter === "all" || l.status === statusFilter)
      .filter(
        (l) =>
          l.name.toLowerCase().includes(search.toLowerCase()) ||
          l.email.toLowerCase().includes(search.toLowerCase()) ||
          l.jobType.toLowerCase().includes(search.toLowerCase()),
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [leads, search, statusFilter]);

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (l: Lead) => {
    setEditing(l);
    setDialogOpen(true);
  };

  const pipelineValue = filtered
    .filter((l) => !["Won", "Lost"].includes(l.status))
    .reduce((s, l) => s + l.value, 0);

  return (
    <div>
      <PageHeader title="Leads" subtitle="Track and convert your enquiries into booked jobs.">
        <Button onClick={openNew} className="gap-1.5">
          <Plus className="h-4 w-4" /> Add Lead
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search leads…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-10 w-[160px] bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {LEAD_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto rounded-md border bg-white px-4 py-2 text-sm">
          <span className="text-muted-foreground">Open pipeline: </span>
          <span className="font-bold text-primary">{formatCurrency(pipelineValue, settings.currency)}</span>
        </div>
      </div>

      <Card className="overflow-hidden p-0 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Lead</th>
                <th className="px-4 py-3 font-medium">Job Type</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 text-right font-medium">Value</th>
                <th className="px-4 py-3 font-medium">Next Task</th>
                <th className="w-10 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((l) => (
                <tr key={l.id} className="group hover:bg-muted/30">
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                    {formatDate(l.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => openEdit(l)} className="text-left font-medium hover:text-primary">
                      {l.name}
                    </button>
                    <div className="text-xs text-muted-foreground">{l.email}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{l.jobType}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={l.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{l.source}</td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatCurrency(l.value, settings.currency)}
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-xs text-muted-foreground">
                    {l.nextTask ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="rounded-md p-1.5 text-muted-foreground opacity-60 transition hover:bg-muted group-hover:opacity-100">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(l)}>
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={l.status === "Won"}
                          onClick={() => {
                            convertLeadToJob(l.id);
                            toast.success(`"${l.name}" converted to a job`);
                          }}
                        >
                          <ArrowRightCircle className="mr-2 h-4 w-4" /> Convert to Job
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            if (confirm(`Delete lead "${l.name}"?`)) {
                              deleteLead(l.id);
                              toast.success("Lead deleted");
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
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No leads found. Click <span className="font-medium text-foreground">Add Lead</span> to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <LeadDialog open={dialogOpen} onOpenChange={setDialogOpen} lead={editing} />
    </div>
  );
}
