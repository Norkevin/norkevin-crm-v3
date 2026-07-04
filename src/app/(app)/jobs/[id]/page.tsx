"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Plus,
  MapPin,
  Calendar,
  Tag as TagIcon,
  Phone,
  Mail,
  FileText,
  FileSignature,
  ClipboardList,
  Paperclip,
  StickyNote,
  Download,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { useCRM } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/status-badge";
import { WorkflowPanel } from "@/components/job/workflow-panel";
import { MailPanel } from "@/components/job/mail-panel";
import { JobDialog } from "@/components/dialogs/job-dialog";
import { InvoiceDialog } from "@/components/dialogs/invoice-dialog";
import { InvoiceView } from "@/components/dialogs/invoice-view";
import { ContractDialog } from "@/components/dialogs/contract-dialog";
import { QuestionnaireDialog } from "@/components/dialogs/questionnaire-dialog";
import { EmailComposer } from "@/components/dialogs/email-composer";
import {
  formatCurrency,
  formatDate,
  formatFileSize,
  formatTime,
  invoiceBalance,
  invoiceTotal,
} from "@/lib/format";
import type { Contract, DocType, Invoice, Questionnaire } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id);
  const {
    jobs, clients, invoices, contracts, questionnaires, settings,
    updateJob, addJobFile, deleteJobFile,
  } = useCRM();

  const job = jobs.find((j) => j.id === id);
  const [tab, setTab] = useState<"workflow" | "mail">("workflow");

  // dialog states
  const [editJob, setEditJob] = useState(false);
  const [invoiceEditor, setInvoiceEditor] = useState<{ open: boolean; type: DocType; invoice: Invoice | null }>({ open: false, type: "Invoice", invoice: null });
  const [invoiceView, setInvoiceView] = useState<Invoice | null>(null);
  const [contractDialog, setContractDialog] = useState<{ open: boolean; contract: Contract | null }>({ open: false, contract: null });
  const [questionnaireDialog, setQuestionnaireDialog] = useState<{ open: boolean; q: Questionnaire | null }>({ open: false, q: null });
  const [composeOpen, setComposeOpen] = useState(false);
  const [notes, setNotes] = useState(job?.notes ?? "");
  const fileRef = useRef<HTMLInputElement>(null);

  const client = clients.find((c) => c.id === job?.clientId);
  const jobInvoices = useMemo(() => invoices.filter((i) => i.jobId === id && i.type === "Invoice"), [invoices, id]);
  const jobQuotes = useMemo(() => invoices.filter((i) => i.jobId === id && i.type === "Quote"), [invoices, id]);
  const jobContracts = useMemo(() => contracts.filter((c) => c.jobId === id), [contracts, id]);
  const jobQuestionnaires = useMemo(() => questionnaires.filter((q) => q.jobId === id), [questionnaires, id]);

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <p className="text-lg font-semibold">Job not found</p>
        <Button onClick={() => router.push("/jobs")} variant="outline">Back to jobs</Button>
      </div>
    );
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const finish = (url?: string) => {
      addJobFile(job.id, { name: file.name, size: file.size, type: file.type, url });
      toast.success("File attached");
    };
    if (file.size < 1_500_000) {
      const reader = new FileReader();
      reader.onload = () => finish(String(reader.result));
      reader.readAsDataURL(file);
    } else {
      finish(undefined);
      toast.message("Large file — stored as reference only (no preview).");
    }
    e.target.value = "";
  };

  const saveNotes = () => {
    updateJob(job.id, { notes });
    toast.success("Notes saved");
  };

  return (
    <div>
      {/* Breadcrumb + header */}
      <div className="mb-4">
        <Link href="/jobs" className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Jobs
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{job.name}</h1>
            <StatusBadge status={job.status} />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setComposeOpen(true)} className="gap-1.5">
              <Mail className="h-4 w-4" /> Email client
            </Button>
            <Button onClick={() => setEditJob(true)} className="gap-1.5">
              <Pencil className="h-4 w-4" /> Edit job
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_380px]">
        {/* LEFT: Workflow / Mail */}
        <Card className="h-fit p-0 shadow-sm">
          <div className="flex border-b">
            {(["workflow", "mail"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "relative px-5 py-3 text-sm font-medium capitalize transition-colors",
                  tab === t ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t === "workflow" ? "Workflow" : "Mail"}
                {tab === t && <span className="absolute bottom-0 left-0 h-[3px] w-full rounded-full bg-primary" />}
              </button>
            ))}
          </div>
          <div className="p-5">
            {tab === "workflow" ? <WorkflowPanel job={job} /> : <MailPanel job={job} />}
          </div>
        </Card>

        {/* RIGHT: stacked info cards */}
        <div className="space-y-4">
          {/* Job details */}
          <SectionCard icon={TagIcon} title="Job" onAdd={() => setEditJob(true)} addLabel="Edit">
            <dl className="space-y-2 text-sm">
              <Detail label="Event type" value={job.jobType} />
              <Detail label="Workflow" value={job.workflowName ?? "—"} />
              <Detail
                label="Main shoot"
                value={job.shootDate ? `${formatDate(job.shootDate)}${job.shootTime ? ` · ${formatTime(job.shootTime)}` : ""}` : "—"}
                icon={Calendar}
              />
              <Detail label="Location" value={job.location ? `${job.location}${job.address ? ` — ${job.address}` : ""}` : "—"} icon={MapPin} />
              <Detail label="Lead source" value={job.source ?? "—"} />
              <Detail label="Value" value={formatCurrency(job.value, settings.currency)} />
            </dl>
          </SectionCard>

          {/* Client */}
          {client && (
            <SectionCard icon={Phone} title="Client">
              <div className="text-sm">
                <p className="font-medium">
                  {client.firstName} {client.lastName}
                  {client.partnerName && <span className="text-muted-foreground"> &amp; {client.partnerName}</span>}
                </p>
                <a href={`tel:${client.phone}`} className="mt-1 flex items-center gap-2 text-muted-foreground hover:text-primary">
                  <Phone className="h-3.5 w-3.5" /> {client.phone}
                </a>
                <button onClick={() => setComposeOpen(true)} className="mt-0.5 flex items-center gap-2 text-muted-foreground hover:text-primary">
                  <Mail className="h-3.5 w-3.5" /> {client.email}
                </button>
              </div>
            </SectionCard>
          )}

          {/* Invoices */}
          <SectionCard icon={FileText} title="Invoices" onAdd={() => setInvoiceEditor({ open: true, type: "Invoice", invoice: null })}>
            {jobInvoices.length === 0 ? (
              <Empty label="No invoices" />
            ) : (
              <div className="space-y-2">
                {jobInvoices.map((i) => (
                  <RowLink key={i.id} onClick={() => setInvoiceView(i)}>
                    <div>
                      <div className="text-sm font-medium">{i.number}</div>
                      <div className="text-xs text-muted-foreground">
                        {invoiceBalance(i) > 0 ? `Balance ${formatCurrency(invoiceBalance(i), settings.currency)} · due ${formatDate(i.dueDate)}` : "Fully paid"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{formatCurrency(invoiceTotal(i), settings.currency)}</span>
                      <StatusBadge status={i.status} />
                    </div>
                  </RowLink>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Quotes */}
          <SectionCard icon={FileText} title="Quotes" onAdd={() => setInvoiceEditor({ open: true, type: "Quote", invoice: null })}>
            {jobQuotes.length === 0 ? (
              <Empty label="No quotes" />
            ) : (
              <div className="space-y-2">
                {jobQuotes.map((q) => (
                  <RowLink key={q.id} onClick={() => setInvoiceView(q)}>
                    <div>
                      <div className="text-sm font-medium">{q.number}</div>
                      <div className="text-xs text-muted-foreground">Sent {formatDate(q.issueDate)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{formatCurrency(invoiceTotal(q), settings.currency)}</span>
                      <StatusBadge status={q.status} />
                    </div>
                  </RowLink>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Contracts */}
          <SectionCard icon={FileSignature} title="Contracts" onAdd={() => setContractDialog({ open: true, contract: null })}>
            {jobContracts.length === 0 ? (
              <Empty label="No contracts" />
            ) : (
              <div className="space-y-2">
                {jobContracts.map((c) => (
                  <RowLink key={c.id} onClick={() => setContractDialog({ open: true, contract: c })}>
                    <div>
                      <div className="text-sm font-medium">{c.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {c.status === "Signed"
                          ? `Signed ${formatDate(c.signedAt)}`
                          : c.sentAt
                            ? `Sent ${formatDate(c.sentAt)}`
                            : "Draft"}
                      </div>
                    </div>
                    <StatusBadge status={c.status} />
                  </RowLink>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Questionnaires */}
          <SectionCard icon={ClipboardList} title="Questionnaires" onAdd={() => setQuestionnaireDialog({ open: true, q: null })}>
            {jobQuestionnaires.length === 0 ? (
              <Empty label="No questionnaires" />
            ) : (
              <div className="space-y-2">
                {jobQuestionnaires.map((q) => (
                  <RowLink key={q.id} onClick={() => setQuestionnaireDialog({ open: true, q })}>
                    <div>
                      <div className="text-sm font-medium">{q.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {q.status === "Completed" ? `Completed ${formatDate(q.completedAt)}` : `Sent ${formatDate(q.createdAt)}`}
                      </div>
                    </div>
                    <StatusBadge status={q.status} />
                  </RowLink>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Files */}
          <SectionCard icon={Paperclip} title="Files" onAdd={() => fileRef.current?.click()}>
            <input ref={fileRef} type="file" className="hidden" onChange={handleFile} />
            {(job.files ?? []).length === 0 ? (
              <Empty label="No files attached (up to ~1.5MB each)" />
            ) : (
              <div className="space-y-2">
                {(job.files ?? []).map((f) => (
                  <div key={f.id} className="group flex items-center gap-2 rounded-md border px-2.5 py-2 text-sm">
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{f.name}</div>
                      <div className="text-xs text-muted-foreground">{formatFileSize(f.size)}</div>
                    </div>
                    {f.url && (
                      <a href={f.url} download={f.name} className="text-muted-foreground transition hover:text-primary">
                        <Download className="h-4 w-4" />
                      </a>
                    )}
                    <button onClick={() => deleteJobFile(job.id, f.id)} className="text-muted-foreground opacity-0 transition hover:text-destructive group-hover:opacity-100">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Notes */}
          <SectionCard icon={StickyNote} title="Notes">
            <Textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={saveNotes}
              placeholder="Add notes about this job…"
              className="resize-none text-sm"
            />
          </SectionCard>
        </div>
      </div>

      {/* Dialogs */}
      <JobDialog open={editJob} onOpenChange={setEditJob} job={job} />
      <InvoiceDialog
        open={invoiceEditor.open}
        onOpenChange={(v) => setInvoiceEditor((s) => ({ ...s, open: v }))}
        invoice={invoiceEditor.invoice}
        defaultType={invoiceEditor.type}
        defaultJobId={job.id}
        defaultClientId={job.clientId}
      />
      <InvoiceView
        invoice={invoiceView}
        onClose={() => setInvoiceView(null)}
        onEdit={(inv) => {
          setInvoiceView(null);
          setInvoiceEditor({ open: true, type: inv.type, invoice: inv });
        }}
      />
      <ContractDialog
        open={contractDialog.open}
        onOpenChange={(v) => setContractDialog((s) => ({ ...s, open: v }))}
        contract={contractDialog.contract}
        jobId={job.id}
        clientId={job.clientId}
      />
      <QuestionnaireDialog
        open={questionnaireDialog.open}
        onOpenChange={(v) => setQuestionnaireDialog((s) => ({ ...s, open: v }))}
        questionnaire={questionnaireDialog.q}
        jobId={job.id}
        clientId={job.clientId}
      />
      <EmailComposer open={composeOpen} onOpenChange={setComposeOpen} clientId={job.clientId} jobId={job.id} />
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  onAdd,
  addLabel,
  children,
}: {
  icon: typeof TagIcon;
  title: string;
  onAdd?: () => void;
  addLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-0 shadow-sm">
      <div className="flex items-center justify-between border-b px-4 py-2.5">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Icon className="h-4 w-4 text-muted-foreground" /> {title}
        </h3>
        {onAdd && (
          <button
            onClick={onAdd}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary transition hover:bg-accent"
          >
            {addLabel ? addLabel : <Plus className="h-4 w-4" />}
          </button>
        )}
      </div>
      <div className="p-4">{children}</div>
    </Card>
  );
}

function Detail({ label, value, icon: Icon }: { label: string; value: string; icon?: typeof MapPin }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="flex items-center gap-1.5 text-right font-medium">
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
        {value}
      </dd>
    </div>
  );
}

function RowLink({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between gap-2 rounded-md border p-2.5 text-left transition hover:border-primary/40 hover:bg-accent/40"
    >
      {children}
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </button>
  );
}

function Empty({ label }: { label: string }) {
  return <p className="py-3 text-center text-xs text-muted-foreground">{label}</p>;
}
