"use client";

import { useState } from "react";
import { Printer, Pencil, CreditCard } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NinjaMark } from "@/components/logo";
import { useCRM } from "@/lib/store";
import type { Invoice } from "@/lib/types";
import {
  formatCurrency,
  formatDate,
  invoiceBalance,
  invoicePaid,
  invoiceSubtotal,
  invoiceTax,
  invoiceTotal,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function InvoiceView({
  invoice,
  onClose,
  onEdit,
}: {
  invoice: Invoice | null;
  onClose: () => void;
  onEdit: (inv: Invoice) => void;
}) {
  const { clients, settings, addPayment } = useCRM();
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("Card");

  if (!invoice) return null;
  const client = clients.find((c) => c.id === invoice.clientId);
  const balance = invoiceBalance(invoice);
  const stampColor =
    invoice.status === "Paid"
      ? "text-emerald-500 border-emerald-500"
      : invoice.status === "Overdue"
        ? "text-rose-500 border-rose-500"
        : "text-sky-500 border-sky-500";

  const print = () => {
    const w = window.open("", "_blank", "width=800,height=900");
    if (!w) return;
    const rows = invoice.items
      .map(
        (i) => `<tr>
          <td style="padding:10px 8px;border-bottom:1px solid #eee">${i.description}</td>
          <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:center">${i.quantity}</td>
          <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:right">${formatCurrency(i.unitPrice, settings.currency)}</td>
          <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:right">${formatCurrency(i.quantity * i.unitPrice, settings.currency)}</td>
        </tr>`,
      )
      .join("");
    w.document.write(`<!doctype html><html><head><title>${invoice.number}</title>
      <style>body{font-family:Inter,Arial,sans-serif;color:#222;padding:40px;max-width:720px;margin:auto}
      h1{color:#089d5a;margin:0} table{width:100%;border-collapse:collapse;margin-top:20px;font-size:14px}
      th{text-align:left;padding:8px;border-bottom:2px solid #089d5a;font-size:12px;text-transform:uppercase;color:#666}
      .right{text-align:right}.muted{color:#888;font-size:13px}</style></head><body>
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div><h1>${settings.studioName}</h1><div class="muted">${settings.address}<br>${settings.email} · ${settings.phone}</div></div>
        <div class="right"><h2 style="margin:0">${invoice.type.toUpperCase()}</h2><div class="muted">${invoice.number}<br>Issued: ${formatDate(invoice.issueDate)}<br>Due: ${formatDate(invoice.dueDate)}</div></div>
      </div>
      <div style="margin-top:24px" class="muted">Bill to</div>
      <div style="font-weight:600">${client ? `${client.firstName} ${client.lastName}` : ""}</div>
      <div class="muted">${client?.email ?? ""}<br>${client?.address ?? ""}</div>
      <table><thead><tr><th>Description</th><th style="text-align:center">Qty</th><th class="right">Unit</th><th class="right">Amount</th></tr></thead>
      <tbody>${rows}</tbody></table>
      <div style="margin-top:20px;margin-left:auto;width:260px;font-size:14px">
        <div style="display:flex;justify-content:space-between;padding:4px 0"><span class="muted">Subtotal</span><span>${formatCurrency(invoiceSubtotal(invoice), settings.currency)}</span></div>
        ${invoice.discount ? `<div style="display:flex;justify-content:space-between;padding:4px 0"><span class="muted">Discount</span><span>-${formatCurrency(invoice.discount, settings.currency)}</span></div>` : ""}
        <div style="display:flex;justify-content:space-between;padding:4px 0"><span class="muted">Tax (${invoice.taxRate}%)</span><span>${formatCurrency(invoiceTax(invoice), settings.currency)}</span></div>
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-top:2px solid #089d5a;font-weight:700;font-size:16px"><span>Total</span><span style="color:#089d5a">${formatCurrency(invoiceTotal(invoice), settings.currency)}</span></div>
        <div style="display:flex;justify-content:space-between;padding:4px 0"><span class="muted">Paid</span><span>${formatCurrency(invoicePaid(invoice), settings.currency)}</span></div>
        <div style="display:flex;justify-content:space-between;padding:4px 0;font-weight:700"><span>Balance due</span><span>${formatCurrency(balance, settings.currency)}</span></div>
      </div>
      ${invoice.notes ? `<div style="margin-top:24px" class="muted">${invoice.notes}</div>` : ""}
      </body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  };

  const recordPayment = () => {
    const amount = Number(payAmount);
    if (!amount || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    addPayment(invoice.id, amount, payMethod);
    setPayAmount("");
    toast.success("Payment recorded");
  };

  return (
    <Dialog open={!!invoice} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto p-0">
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b bg-muted/40 px-5 py-3">
          <span className="text-sm font-semibold">{invoice.type} {invoice.number}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(invoice)} className="gap-1.5">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Button>
            <Button variant="outline" size="sm" onClick={print} className="gap-1.5">
              <Printer className="h-3.5 w-3.5" /> Print / PDF
            </Button>
          </div>
        </div>

        {/* Branded invoice */}
        <div className="relative px-8 py-7">
          {/* Stamp */}
          <div
            className={cn(
              "pointer-events-none absolute right-10 top-16 flex h-24 w-24 rotate-[-14deg] items-center justify-center rounded-full border-[3px] text-lg font-extrabold uppercase tracking-wider opacity-80",
              stampColor,
            )}
          >
            {invoice.status}
          </div>

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <NinjaMark className="h-10 w-10" />
              <div>
                <div className="text-xl font-bold leading-tight">{settings.studioName}</div>
                <div className="text-xs text-muted-foreground">{settings.website}</div>
              </div>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <div className="text-lg font-bold uppercase text-foreground">{invoice.type}</div>
              <div>{invoice.number}</div>
              <div>Issued: {formatDate(invoice.issueDate)}</div>
              <div>Due: {formatDate(invoice.dueDate)}</div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-6 text-sm">
            <div>
              <div className="mb-1 text-xs font-semibold uppercase text-muted-foreground">From</div>
              <div className="font-medium">{settings.studioName}</div>
              <div className="text-muted-foreground">{settings.address}</div>
              <div className="text-muted-foreground">{settings.email}</div>
              <div className="text-muted-foreground">{settings.phone}</div>
            </div>
            <div>
              <div className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Bill to</div>
              <div className="font-medium">{client ? `${client.firstName} ${client.lastName}` : "—"}</div>
              <div className="text-muted-foreground">{client?.email}</div>
              <div className="text-muted-foreground">{client?.address}</div>
              <div className="text-muted-foreground">{client?.phone}</div>
            </div>
          </div>

          {/* Items */}
          <table className="mt-6 w-full text-sm">
            <thead>
              <tr className="border-b-2 border-primary text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="py-2 font-medium">Description</th>
                <th className="py-2 text-center font-medium">Qty</th>
                <th className="py-2 text-right font-medium">Unit</th>
                <th className="py-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((i) => (
                <tr key={i.id} className="border-b">
                  <td className="py-2.5">{i.description}</td>
                  <td className="py-2.5 text-center text-muted-foreground">{i.quantity}</td>
                  <td className="py-2.5 text-right text-muted-foreground">{formatCurrency(i.unitPrice, settings.currency)}</td>
                  <td className="py-2.5 text-right font-medium">{formatCurrency(i.quantity * i.unitPrice, settings.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="mt-4 ml-auto w-full max-w-xs space-y-1.5 text-sm">
            <Line label="Subtotal" value={formatCurrency(invoiceSubtotal(invoice), settings.currency)} />
            {invoice.discount > 0 && (
              <Line label="Discount" value={`-${formatCurrency(invoice.discount, settings.currency)}`} />
            )}
            <Line label={`Tax (${invoice.taxRate}%)`} value={formatCurrency(invoiceTax(invoice), settings.currency)} />
            <div className="flex justify-between border-t-2 border-primary py-2 text-base font-bold">
              <span>Total</span>
              <span className="text-primary">{formatCurrency(invoiceTotal(invoice), settings.currency)}</span>
            </div>
            <Line label="Paid" value={formatCurrency(invoicePaid(invoice), settings.currency)} />
            <div className="flex justify-between font-bold">
              <span>Balance due</span>
              <span className={balance > 0 ? "text-rose-500" : "text-emerald-600"}>
                {formatCurrency(balance, settings.currency)}
              </span>
            </div>
          </div>

          {invoice.notes && (
            <div className="mt-6 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">{invoice.notes}</div>
          )}
        </div>

        {/* Payments + record */}
        {invoice.type === "Invoice" && (
          <div className="border-t bg-muted/30 px-8 py-4">
            <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
              <CreditCard className="h-4 w-4" /> Payments
            </h4>
            <div className="space-y-1 text-sm">
              {invoice.payments.length === 0 && (
                <p className="text-xs text-muted-foreground">No payments recorded yet.</p>
              )}
              {invoice.payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between border-b py-1.5 text-xs">
                  <span className="text-muted-foreground">{formatDate(p.date)} · {p.method}{p.note ? ` · ${p.note}` : ""}</span>
                  <span className="font-medium">{formatCurrency(p.amount, settings.currency)}</span>
                </div>
              ))}
            </div>
            {balance > 0 && (
              <div className="mt-3 flex flex-wrap items-end gap-2">
                <div className="grid gap-1">
                  <span className="text-[11px] text-muted-foreground">Amount</span>
                  <Input
                    type="number"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    placeholder={String(balance)}
                    className="h-9 w-32"
                  />
                </div>
                <div className="grid gap-1">
                  <span className="text-[11px] text-muted-foreground">Method</span>
                  <Select value={payMethod} onValueChange={setPayMethod}>
                    <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Card", "Bank Transfer", "Cash", "PayPal", "Stripe"].map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button size="sm" onClick={recordPayment}>Record payment</Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setPayAmount(String(balance));
                  }}
                >
                  Full balance
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
