"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
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
import {
  INVOICE_STATUSES,
  type DocType,
  type Invoice,
  type InvoiceItem,
  type InvoiceStatus,
} from "@/lib/types";
import { formatCurrency, uid } from "@/lib/format";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  invoice: Invoice | null;
  defaultType?: DocType;
  defaultJobId?: string;
  defaultClientId?: string;
}

function nextNumber(type: DocType, invoices: Invoice[]): string {
  const prefix = type === "Invoice" ? "INV" : "QUO";
  const nums = invoices
    .filter((i) => i.type === type)
    .map((i) => Number.parseInt(i.number.replace(/\D/g, ""), 10))
    .filter((n) => !Number.isNaN(n));
  const max = nums.length ? Math.max(...nums) : type === "Invoice" ? 1040 : 2080;
  return `${prefix}-${max + 1}`;
}

export function InvoiceDialog({
  open,
  onOpenChange,
  invoice,
  defaultType = "Invoice",
  defaultJobId,
  defaultClientId,
}: Props) {
  const { addInvoice, updateInvoice, clients, jobs, invoices, settings } = useCRM();

  const [form, setForm] = useState({
    number: "",
    type: defaultType as DocType,
    clientId: "",
    jobId: "none",
    status: "Draft" as InvoiceStatus,
    issueDate: "",
    dueDate: "",
    taxRate: settings.defaultTaxRate,
    discount: 0,
    notes: "",
  });
  const [items, setItems] = useState<InvoiceItem[]>([]);

  useEffect(() => {
    if (open) {
      if (invoice) {
        setForm({
          number: invoice.number,
          type: invoice.type,
          clientId: invoice.clientId,
          jobId: invoice.jobId ?? "none",
          status: invoice.status,
          issueDate: invoice.issueDate,
          dueDate: invoice.dueDate,
          taxRate: invoice.taxRate,
          discount: invoice.discount,
          notes: invoice.notes ?? "",
        });
        setItems(invoice.items.map((i) => ({ ...i })));
      } else {
        const today = new Date();
        const due = new Date();
        due.setDate(due.getDate() + 14);
        setForm({
          number: nextNumber(defaultType, invoices),
          type: defaultType,
          clientId: defaultClientId ?? clients[0]?.id ?? "",
          jobId: defaultJobId ?? "none",
          status: "Draft",
          issueDate: today.toISOString().slice(0, 10),
          dueDate: due.toISOString().slice(0, 10),
          taxRate: settings.defaultTaxRate,
          discount: 0,
          notes: "",
        });
        setItems([{ id: uid("i"), description: "", quantity: 1, unitPrice: 0 }]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, invoice, defaultType]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const updateItem = (id: string, patch: Partial<InvoiceItem>) =>
    setItems((its) => its.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  const addItem = () => setItems((its) => [...its, { id: uid("i"), description: "", quantity: 1, unitPrice: 0 }]);
  const removeItem = (id: string) => setItems((its) => its.filter((i) => i.id !== id));

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const tax = ((subtotal - form.discount) * form.taxRate) / 100;
  const total = subtotal - form.discount + tax;

  const save = () => {
    if (!form.clientId) {
      toast.error("Please select a client");
      return;
    }
    if (items.length === 0 || items.every((i) => !i.description.trim())) {
      toast.error("Add at least one line item");
      return;
    }
    const payload = {
      number: form.number,
      type: form.type,
      clientId: form.clientId,
      jobId: form.jobId === "none" ? undefined : form.jobId,
      status: form.status,
      issueDate: form.issueDate,
      dueDate: form.dueDate,
      taxRate: form.taxRate,
      discount: form.discount,
      notes: form.notes,
      items: items.filter((i) => i.description.trim()),
    };
    if (invoice) {
      updateInvoice(invoice.id, payload);
      toast.success(`${form.type} updated`);
    } else {
      addInvoice({ ...payload, payments: [] });
      toast.success(`${form.type} created`);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{invoice ? `Edit ${invoice.type}` : `New ${form.type}`}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Field label="Type">
              <Select value={form.type} onValueChange={(v) => set("type", v as DocType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Invoice">Invoice</SelectItem>
                  <SelectItem value="Quote">Quote</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Number">
              <Input value={form.number} onChange={(e) => set("number", e.target.value)} />
            </Field>
            <Field label="Status">
              <Select value={form.status} onValueChange={(v) => set("status", v as InvoiceStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {INVOICE_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Client">
              <Select value={form.clientId} onValueChange={(v) => set("clientId", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.firstName} {c.lastName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Field label="Linked job (optional)">
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
            <Field label="Issue date">
              <Input type="date" value={form.issueDate} onChange={(e) => set("issueDate", e.target.value)} />
            </Field>
            <Field label="Due date">
              <Input type="date" value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)} />
            </Field>
          </div>

          {/* Line items */}
          <div>
            <Label className="text-xs font-medium text-muted-foreground">Line items</Label>
            <div className="mt-1.5 space-y-2">
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-[1fr_60px_90px_36px] items-center gap-2">
                  <Input
                    value={item.description}
                    placeholder="Description"
                    onChange={(e) => updateItem(item.id, { description: e.target.value })}
                    className="h-9"
                  />
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, { quantity: Number(e.target.value) })}
                    className="h-9 text-center"
                  />
                  <Input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(item.id, { unitPrice: Number(e.target.value) })}
                    className="h-9 text-right"
                  />
                  <button
                    onClick={() => removeItem(item.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="mt-2 gap-1.5" onClick={addItem}>
              <Plus className="h-3.5 w-3.5" /> Add line
            </Button>
          </div>

          {/* Totals */}
          <div className="ml-auto w-full max-w-xs space-y-2 rounded-lg border bg-muted/30 p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal, settings.currency)}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">Discount</span>
              <Input
                type="number"
                value={form.discount}
                onChange={(e) => set("discount", Number(e.target.value))}
                className="h-7 w-24 text-right"
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">Tax %</span>
              <Input
                type="number"
                value={form.taxRate}
                onChange={(e) => set("taxRate", Number(e.target.value))}
                className="h-7 w-24 text-right"
              />
            </div>
            <div className="flex justify-between border-t pt-2 text-base font-bold">
              <span>Total</span>
              <span className="text-primary">{formatCurrency(total, settings.currency)}</span>
            </div>
          </div>

          <Field label="Notes / terms">
            <Textarea rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Payment terms, thank you message…" />
          </Field>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save}>{invoice ? "Save changes" : `Create ${form.type.toLowerCase()}`}</Button>
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
