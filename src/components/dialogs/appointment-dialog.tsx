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
import { APPOINTMENT_TYPES, type Appointment, type AppointmentType } from "@/lib/types";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  appointment: Appointment | null;
  defaultDate?: string;
}

export function AppointmentDialog({ open, onOpenChange, appointment, defaultDate }: Props) {
  const { addAppointment, updateAppointment, deleteAppointment, clients, jobs } = useCRM();

  const [form, setForm] = useState({
    title: "",
    date: "",
    time: "10:00",
    endTime: "",
    type: "Main Shoot" as AppointmentType,
    clientId: "none",
    jobId: "none",
    location: "",
    notes: "",
  });

  useEffect(() => {
    if (open) {
      setForm({
        title: appointment?.title ?? "",
        date: appointment?.date ?? defaultDate ?? new Date().toISOString().slice(0, 10),
        time: appointment?.time ?? "10:00",
        endTime: appointment?.endTime ?? "",
        type: appointment?.type ?? "Main Shoot",
        clientId: appointment?.clientId ?? "none",
        jobId: appointment?.jobId ?? "none",
        location: appointment?.location ?? "",
        notes: appointment?.notes ?? "",
      });
    }
  }, [open, appointment, defaultDate]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = () => {
    if (!form.title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    const payload = {
      title: form.title,
      date: form.date,
      time: form.time,
      endTime: form.endTime || undefined,
      type: form.type,
      clientId: form.clientId === "none" ? undefined : form.clientId,
      jobId: form.jobId === "none" ? undefined : form.jobId,
      location: form.location,
      notes: form.notes,
    };
    if (appointment) {
      updateAppointment(appointment.id, payload);
      toast.success("Event updated");
    } else {
      addAppointment(payload);
      toast.success("Event added");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{appointment ? "Edit Event" : "New Event"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <Field label="Title">
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Family Portrait Session" />
          </Field>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Date">
              <Input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
            </Field>
            <Field label="Start">
              <Input type="time" value={form.time} onChange={(e) => set("time", e.target.value)} />
            </Field>
            <Field label="End (optional)">
              <Input type="time" value={form.endTime} onChange={(e) => set("endTime", e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Type">
              <Select value={form.type} onValueChange={(v) => set("type", v as AppointmentType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {APPOINTMENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Location">
              <Input value={form.location} onChange={(e) => set("location", e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Client (optional)">
              <Select value={form.clientId} onValueChange={(v) => set("clientId", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.firstName} {c.lastName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Job (optional)">
              <Select value={form.jobId} onValueChange={(v) => set("jobId", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {jobs.map((j) => (
                    <SelectItem key={j.id} value={j.id}>{j.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Notes">
            <Textarea rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
          </Field>
        </div>
        <DialogFooter className="sm:justify-between">
          {appointment ? (
            <Button
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={() => {
                deleteAppointment(appointment.id);
                toast.success("Event deleted");
                onOpenChange(false);
              }}
            >
              Delete
            </Button>
          ) : <span />}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={save}>{appointment ? "Save" : "Add event"}</Button>
          </div>
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
