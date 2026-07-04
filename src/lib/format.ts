import type { Invoice, Job } from "./types";

export function formatCurrency(amount: number, symbol = "$"): string {
  const sign = amount < 0 ? "-" : "";
  const abs = Math.abs(amount);
  return `${sign}${symbol}${abs.toLocaleString("en-US", {
    minimumFractionDigits: abs % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateShort(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

export function formatDateTime(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatTime(time?: string): string {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "pm" : "am";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")}${period}`;
}

export function relativeDay(iso?: string): string {
  if (!iso) return "";
  const target = new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  if (diff > 0) return `in ${diff} days`;
  return `${Math.abs(diff)} days ago`;
}

// ── Invoice calculations ────────────────────────────────
export function invoiceSubtotal(inv: Invoice): number {
  return inv.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
}

export function invoiceTax(inv: Invoice): number {
  const taxable = invoiceSubtotal(inv) - inv.discount;
  return (taxable * inv.taxRate) / 100;
}

export function invoiceTotal(inv: Invoice): number {
  return invoiceSubtotal(inv) - inv.discount + invoiceTax(inv);
}

export function invoicePaid(inv: Invoice): number {
  return inv.payments.reduce((sum, p) => sum + p.amount, 0);
}

export function invoiceBalance(inv: Invoice): number {
  return invoiceTotal(inv) - invoicePaid(inv);
}

// ── Job progress ────────────────────────────────────────
export function jobProgress(job: Job): number {
  if (!job.tasks.length) return 0;
  const done = job.tasks.filter((t) => t.done).length;
  return Math.round((done / job.tasks.length) * 100);
}

export function nextOpenTask(job: Job): string | undefined {
  return job.tasks.find((t) => !t.done)?.title;
}

// ── ID generator (crypto-free for iframe compatibility) ──
export function uid(prefix = "id"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}
