"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCRM } from "@/lib/store";
import { JOB_STATUSES, type Job, type JobStatus, type WorkflowTask } from "@/lib/types";
import { uid } from "@/lib/format";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  job: Job | null;
}

export function JobDialog({ open, onOpenChange, job }: Props) {
  const { addJob, updateJob, clients, settings, workflowTemplates } = useCRM();

  const [form, setForm] = useState({
    name: "",
    clientId: "",
    jobType: "Wedding",
    status: "Confirmed" as JobStatus,
    shootDate: "",
    value: 0,
    location: "",
    notes: "",
    templateId: "none",
  });

  useEffect(() => {
    if (open) {
      setForm({
        name: job?.name ?? "",
        clientId: job?.clientId ?? clients[0]?.id ?? "",
        jobType: job?.jobType ?? settings.jobTypes[0] ?? "Wedding",
        status: job?.status ?? "Confirmed",
        shootDate: job?.shootDate ?? "",
        value: job?.value ?? 0,
        location: job?.location ?? "",
        notes: job?.notes ?? "",
        templateId: "none",
      });
    }
  }, [open, job, clients, settings.jobTypes]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = () => {
    if (!form.name.trim()) {
      toast.error("Please enter a job name");
      return;
    }
    if (!form.clientId) {
      toast.error("Please select a client");
      return;
    }
    if (job) {
      updateJob(job.id, {
        name: form.name,
        clientId: form.clientId,
        jobType: form.jobType,
        status: form.status,
        shootDate: form.shootDate,
        value: form.value,
        location: form.location,
        notes: form.notes,
      });
      toast.success("Job updated");
    } else {
      let tasks: WorkflowTask[] = [];
      if (form.templateId !== "none") {
        const tpl = workflowTemplates.find((t) => t.id === form.templateId);
        if (tpl)
          tasks = tpl.tasks.map((t) => ({
            id: uid("t"),
            title: t.title,
            done: false,
            stage: t.stage,
            type: t.type,
            auto: t.automated,
            emailTemplateId: t.emailTemplateId,
          }));
      }
      addJob({
        name: form.name,
        clientId: form.clientId,
        jobType: form.jobType,
        status: form.status,
        shootDate: form.shootDate,
        value: form.value,
        location: form.location,
        notes: form.notes,
        tasks,
        nextTask: tasks[0]?.title,
      });
      toast.success("Job created");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{job ? "Edit Job" : "New Job"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <Field label="Job name">
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Sophie & Gary Wedding" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Client">
              <Select value={form.clientId} onValueChange={(v) => set("clientId", v)}>
                <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.firstName} {c.lastName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Job Type">
              <Select value={form.jobType} onValueChange={(v) => set("jobType", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {settings.jobTypes.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Status">
              <Select value={form.status} onValueChange={(v) => set("status", v as JobStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {JOB_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Shoot date">
              <Input type="date" value={form.shootDate} onChange={(e) => set("shootDate", e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label={`Job value (${settings.currency})`}>
              <Input type="number" value={form.value} onChange={(e) => set("value", Number(e.target.value))} />
            </Field>
            <Field label="Location">
              <Input value={form.location} onChange={(e) => set("location", e.target.value)} />
            </Field>
          </div>
          {!job && (
            <Field label="Apply workflow template">
              <Select value={form.templateId} onValueChange={(v) => set("templateId", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No template</SelectItem>
                  {workflowTemplates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
          <Field label="Notes">
            <Textarea rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save}>{job ? "Save changes" : "Create job"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
