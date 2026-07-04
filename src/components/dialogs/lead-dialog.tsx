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
import { LEAD_STATUSES, type Lead, type LeadStatus } from "@/lib/types";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  lead: Lead | null;
}

const empty = {
  name: "",
  email: "",
  phone: "",
  jobType: "Wedding",
  status: "New Enquiry" as LeadStatus,
  source: "Referral",
  value: 0,
  eventDate: "",
  nextTask: "",
  notes: "",
};

export function LeadDialog({ open, onOpenChange, lead }: Props) {
  const { addLead, updateLead, settings } = useCRM();
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (open) {
      setForm(
        lead
          ? {
              name: lead.name,
              email: lead.email,
              phone: lead.phone ?? "",
              jobType: lead.jobType,
              status: lead.status,
              source: lead.source,
              value: lead.value,
              eventDate: lead.eventDate ?? "",
              nextTask: lead.nextTask ?? "",
              notes: lead.notes ?? "",
            }
          : { ...empty, jobType: settings.jobTypes[0] ?? "Wedding", source: settings.leadSources[0] ?? "Referral" },
      );
    }
  }, [open, lead, settings.jobTypes, settings.leadSources]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const save = () => {
    if (!form.name.trim()) {
      toast.error("Please enter a lead name");
      return;
    }
    if (lead) {
      updateLead(lead.id, form);
      toast.success("Lead updated");
    } else {
      addLead(form);
      toast.success("Lead added");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{lead ? "Edit Lead" : "New Lead"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <Field label="Lead / Enquiry name">
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Sarah & James Wedding Enquiry" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Email">
              <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </Field>
            <Field label="Phone">
              <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
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
            <Field label="Status">
              <Select value={form.status} onValueChange={(v) => set("status", v as LeadStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LEAD_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Source">
              <Select value={form.source} onValueChange={(v) => set("source", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {settings.leadSources.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label={`Estimated value (${settings.currency})`}>
              <Input type="number" value={form.value} onChange={(e) => set("value", Number(e.target.value))} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Event date">
              <Input type="date" value={form.eventDate} onChange={(e) => set("eventDate", e.target.value)} />
            </Field>
            <Field label="Next task">
              <Input value={form.nextTask} onChange={(e) => set("nextTask", e.target.value)} placeholder="e.g. Send pricing guide" />
            </Field>
          </div>
          <Field label="Notes">
            <Textarea rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save}>{lead ? "Save changes" : "Add lead"}</Button>
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
