"use client";

import { useState } from "react";
import { Mail, MailOpen, MousePointerClick, Plus, Trash2, ChevronDown } from "lucide-react";
import { useCRM } from "@/lib/store";
import type { Job } from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { EmailComposer } from "@/components/dialogs/email-composer";
import { cn } from "@/lib/utils";

export function MailPanel({ job }: { job: Job }) {
  const { emails, deleteEmail } = useCRM();
  const [composeOpen, setComposeOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const jobEmails = emails
    .filter((e) => e.jobId === job.id || (!e.jobId && e.clientId === job.clientId))
    .sort((a, b) => b.sentAt.localeCompare(a.sentAt));

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{jobEmails.length} messages</p>
        <Button size="sm" onClick={() => setComposeOpen(true)} className="gap-1.5">
          <Plus className="h-4 w-4" /> Compose
        </Button>
      </div>

      <div className="space-y-2">
        {jobEmails.length === 0 && (
          <p className="rounded-md border border-dashed py-8 text-center text-sm text-muted-foreground">
            No emails yet. Click <span className="font-medium text-foreground">Compose</span> to send one via Gmail.
          </p>
        )}
        {jobEmails.map((email) => {
          const isOpen = expanded === email.id;
          return (
            <div key={email.id} className="overflow-hidden rounded-lg border">
              <button
                onClick={() => setExpanded(isOpen ? null : email.id)}
                className="flex w-full items-start gap-3 px-3 py-2.5 text-left transition hover:bg-muted/40"
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  {email.openedAt ? <MailOpen className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">{email.subject}</span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">{formatDateTime(email.sentAt)}</span>
                  </div>
                  <div className="truncate text-xs text-muted-foreground">To: {email.to}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <Tag className="bg-slate-100 text-slate-600">Sent</Tag>
                    {email.openedAt && (
                      <Tag className="bg-emerald-100 text-emerald-700">
                        <MailOpen className="h-3 w-3" /> Opened
                      </Tag>
                    )}
                    {email.clickedAt && (
                      <Tag className="bg-sky-100 text-sky-700">
                        <MousePointerClick className="h-3 w-3" /> Link clicked
                      </Tag>
                    )}
                    {email.via === "Gmail" && <Tag className="bg-rose-50 text-rose-600">Gmail</Tag>}
                  </div>
                </div>
                <ChevronDown className={cn("mt-1 h-4 w-4 shrink-0 text-muted-foreground transition", isOpen && "rotate-180")} />
              </button>
              {isOpen && (
                <div className="border-t bg-muted/20 px-3 py-3">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-foreground/90">{email.body}</pre>
                  {(email.openedAt || email.clickedAt) && (
                    <div className="mt-3 space-y-0.5 border-t pt-2 text-[11px] text-muted-foreground">
                      {email.openedAt && <div>Email opened on {formatDateTime(email.openedAt)}</div>}
                      {email.clickedAt && <div>Link clicked on {formatDateTime(email.clickedAt)}</div>}
                    </div>
                  )}
                  <button
                    onClick={() => deleteEmail(email.id)}
                    className="mt-2 flex items-center gap-1 text-xs text-muted-foreground transition hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" /> Delete from history
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <EmailComposer open={composeOpen} onOpenChange={setComposeOpen} clientId={job.clientId} jobId={job.id} />
    </div>
  );
}

function Tag({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold", className)}>
      {children}
    </span>
  );
}
