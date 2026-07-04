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
import { useCRM } from "@/lib/store";
import type { Client } from "@/lib/types";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  client: Client | null;
}

const empty = {
  firstName: "",
  lastName: "",
  partnerName: "",
  email: "",
  phone: "",
  company: "",
  address: "",
  notes: "",
};

export function ClientDialog({ open, onOpenChange, client }: Props) {
  const { addClient, updateClient } = useCRM();
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (open) {
      setForm(
        client
          ? {
              firstName: client.firstName,
              lastName: client.lastName,
              partnerName: client.partnerName ?? "",
              email: client.email,
              phone: client.phone,
              company: client.company ?? "",
              address: client.address ?? "",
              notes: client.notes ?? "",
            }
          : empty,
      );
    }
  }, [open, client]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = () => {
    if (!form.firstName.trim()) {
      toast.error("Please enter a first name");
      return;
    }
    if (client) {
      updateClient(client.id, form);
      toast.success("Client updated");
    } else {
      addClient(form);
      toast.success("Client added");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{client ? "Edit Client" : "New Client"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <Field label="First name">
              <Input value={form.firstName} onChange={(e) => set("firstName", e.target.value)} />
            </Field>
            <Field label="Last name">
              <Input value={form.lastName} onChange={(e) => set("lastName", e.target.value)} />
            </Field>
          </div>
          <Field label="Partner name (optional)">
            <Input value={form.partnerName} onChange={(e) => set("partnerName", e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Email">
              <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </Field>
            <Field label="Phone">
              <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </Field>
          </div>
          <Field label="Company (optional)">
            <Input value={form.company} onChange={(e) => set("company", e.target.value)} />
          </Field>
          <Field label="Address">
            <Input value={form.address} onChange={(e) => set("address", e.target.value)} />
          </Field>
          <Field label="Notes">
            <Textarea rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save}>{client ? "Save changes" : "Add client"}</Button>
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
