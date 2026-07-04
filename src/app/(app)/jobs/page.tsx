"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, MoreHorizontal, Pencil, Trash2, ExternalLink } from "lucide-react";
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
import { formatCurrency, formatDate, jobProgress, nextOpenTask } from "@/lib/format";
import { JOB_STATUSES, type Job } from "@/lib/types";
import { JobDialog } from "@/components/dialogs/job-dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function JobsPage() {
  const { jobs, clients, deleteJob, settings } = useCRM();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Job | null>(null);

  const clientName = (id: string) => {
    const c = clients.find((x) => x.id === id);
    return c ? `${c.firstName} ${c.lastName}` : "—";
  };

  const filtered = useMemo(() => {
    return jobs
      .filter((j) => statusFilter === "all" || j.status === statusFilter)
      .filter(
        (j) =>
          j.name.toLowerCase().includes(search.toLowerCase()) ||
          clientName(j.clientId).toLowerCase().includes(search.toLowerCase()),
      )
      .sort((a, b) => (a.shootDate ?? "").localeCompare(b.shootDate ?? ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobs, search, statusFilter, clients]);

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (j: Job) => {
    setEditing(j);
    setDialogOpen(true);
  };

  const totalValue = filtered.reduce((s, j) => s + j.value, 0);

  return (
    <div>
      <PageHeader title="Jobs Overview" subtitle="Every booked job, deadline and workflow — all in one place.">
        <Button onClick={openNew} className="gap-1.5">
          <Plus className="h-4 w-4" /> Add New Job
        </Button>
      </PageHeader>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search jobs…" value={search} onChange={(e) => setSearch(e.target.value)} className="bg-white pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-10 w-[170px] bg-white"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {JOB_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto rounded-md border bg-white px-4 py-2 text-sm">
          <span className="text-muted-foreground">Total booked: </span>
          <span className="font-bold text-primary">{formatCurrency(totalValue, settings.currency)}</span>
        </div>
      </div>

      <Card className="overflow-hidden p-0 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Job Name</th>
                <th className="px-4 py-3 font-medium">Job Type</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="min-w-[180px] px-4 py-3 font-medium">Workflow Progress</th>
                <th className="px-4 py-3 font-medium">Shoot Date</th>
                <th className="px-4 py-3 font-medium">Next Task</th>
                <th className="w-10 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((j) => {
                const progress = jobProgress(j);
                return (
                  <tr
                    key={j.id}
                    className="group cursor-pointer hover:bg-muted/30"
                    onClick={() => router.push(`/jobs/${j.id}`)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium group-hover:text-primary">{j.name}</div>
                      <div className="text-xs text-muted-foreground">{clientName(j.clientId)}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{j.jobType}</td>
                    <td className="px-4 py-3"><StatusBadge status={j.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              progress === 100 ? "bg-primary" : "bg-amber-400",
                            )}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="w-9 shrink-0 text-xs font-medium text-muted-foreground">{progress}%</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">{formatDate(j.shootDate)}</td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-xs text-muted-foreground">
                      {nextOpenTask(j) ?? "All tasks done"}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="rounded-md p-1.5 text-muted-foreground opacity-60 transition hover:bg-muted group-hover:opacity-100">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/jobs/${j.id}`)}>
                            <ExternalLink className="mr-2 h-4 w-4" /> Open
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEdit(j)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              if (confirm(`Delete job "${j.name}"?`)) {
                                deleteJob(j.id);
                                toast.success("Job deleted");
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
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No jobs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <JobDialog open={dialogOpen} onOpenChange={setDialogOpen} job={editing} />
    </div>
  );
}
