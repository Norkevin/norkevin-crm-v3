"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, CreditCard, ImagePlus, Trash2 } from "lucide-react";
import { useCRM } from "@/lib/store";
import type { StudioSettings } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Field,
  SaveButton,
  SettingsSection,
  ToggleRow,
} from "@/components/settings/kit";

/** Small hook: local editable copy of settings that re-syncs when the store changes. */
function useSettingsForm() {
  const settings = useCRM((s) => s.settings);
  const updateSettings = useCRM((s) => s.updateSettings);
  const [form, setForm] = useState<StudioSettings>(settings);
  useEffect(() => {
    setForm(settings);
  }, [settings]);
  const set = <K extends keyof StudioSettings>(k: K, v: StudioSettings[K]) =>
    setForm((f) => ({ ...f, [k]: v }));
  return { settings, updateSettings, form, set };
}

const DATE_FORMATS = ["MMM D, YYYY", "MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"];

/* ─────────────────────────── Company details ─────────────────────────── */
export function CompanySection() {
  const { updateSettings, form, set } = useSettingsForm();
  const settings = useCRM((s) => s.settings);
  const fileRef = useRef<HTMLInputElement>(null);

  const onLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateSettings({ logoUrl: String(reader.result) });
      toast.success("Logo updated");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const save = () => {
    updateSettings({
      studioName: form.studioName,
      ownerName: form.ownerName,
      email: form.email,
      phone: form.phone,
      address: form.address,
      website: form.website,
    });
    toast.success("Saved");
  };

  return (
    <SettingsSection
      title="Company Details"
      description="Your studio profile appears on invoices, quotes, contracts and client emails."
    >
      {/* Logo */}
      <div className="mb-5 flex items-center gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted/40">
          {settings.logoUrl ? (
            <img src={settings.logoUrl} alt="Studio logo" className="h-full w-full object-contain" />
          ) : (
            <ImagePlus className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onLogo}
          />
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="gap-1.5">
              <ImagePlus className="h-4 w-4" /> {settings.logoUrl ? "Replace logo" : "Upload logo"}
            </Button>
            {settings.logoUrl && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-destructive hover:text-destructive"
                onClick={() => {
                  updateSettings({ logoUrl: "" });
                  toast.success("Logo removed");
                }}
              >
                <Trash2 className="h-4 w-4" /> Remove
              </Button>
            )}
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">PNG, JPG or SVG. Square works best.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Studio name">
          <Input value={form.studioName} onChange={(e) => set("studioName", e.target.value)} />
        </Field>
        <Field label="Owner name">
          <Input value={form.ownerName} onChange={(e) => set("ownerName", e.target.value)} />
        </Field>
        <Field label="Email">
          <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
        </Field>
        <Field label="Phone">
          <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        </Field>
        <Field label="Website">
          <Input value={form.website ?? ""} onChange={(e) => set("website", e.target.value)} placeholder="www.yourstudio.com" />
        </Field>
        <Field label="Address">
          <Input value={form.address} onChange={(e) => set("address", e.target.value)} />
        </Field>
      </div>

      <SaveButton onClick={save} label="Save details" />
    </SettingsSection>
  );
}

/* ─────────────────────────── Currency & taxes ─────────────────────────── */
export function CurrencySection() {
  const { updateSettings, form, set } = useSettingsForm();
  const save = () => {
    updateSettings({
      currency: form.currency,
      currencyCode: form.currencyCode,
      taxName: form.taxName,
      defaultTaxRate: form.defaultTaxRate,
    });
    toast.success("Saved");
  };
  return (
    <SettingsSection
      title="Currency & Taxes"
      description="Set the currency and default tax applied to new quotes and invoices."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Currency symbol" hint="Shown before amounts, e.g. $1,200">
          <Input value={form.currency} onChange={(e) => set("currency", e.target.value)} maxLength={3} />
        </Field>
        <Field label="Currency code" hint="ISO code, e.g. USD, EUR, GBP">
          <Input value={form.currencyCode} onChange={(e) => set("currencyCode", e.target.value.toUpperCase())} maxLength={3} />
        </Field>
        <Field label="Tax name" hint="e.g. Tax, VAT, GST, IVA">
          <Input value={form.taxName} onChange={(e) => set("taxName", e.target.value)} />
        </Field>
        <Field label="Default tax rate (%)">
          <Input
            type="number"
            value={form.defaultTaxRate}
            onChange={(e) => set("defaultTaxRate", Number(e.target.value))}
          />
        </Field>
      </div>
      <SaveButton onClick={save} />
    </SettingsSection>
  );
}

/* ─────────────────────── Date, time & calendar ─────────────────────── */
export function DateTimeSection() {
  const { updateSettings, form, set } = useSettingsForm();
  const save = () => {
    updateSettings({
      dateFormat: form.dateFormat,
      timeFormat: form.timeFormat,
      weekStart: form.weekStart,
      googleCalendarConnected: form.googleCalendarConnected,
    });
    toast.success("Saved");
  };
  return (
    <SettingsSection
      title="Date, Time & Calendar"
      description="Control how dates and times are displayed across the app."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Date format">
          <Select value={form.dateFormat} onValueChange={(v) => set("dateFormat", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATE_FORMATS.map((f) => (
                <SelectItem key={f} value={f}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Time format">
          <Select
            value={form.timeFormat}
            onValueChange={(v) => set("timeFormat", v as StudioSettings["timeFormat"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12h">12-hour (1:30 pm)</SelectItem>
              <SelectItem value="24h">24-hour (13:30)</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Week starts on">
          <Select
            value={form.weekStart}
            onValueChange={(v) => set("weekStart", v as StudioSettings["weekStart"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Sunday">Sunday</SelectItem>
              <SelectItem value="Monday">Monday</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="mt-4 rounded-lg border p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-primary">
              <CalendarDays className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">Google Calendar</p>
              <p className="text-xs text-muted-foreground">
                {form.googleCalendarConnected ? "Connected" : "Not connected"}
              </p>
            </div>
          </div>
          <Switch
            checked={form.googleCalendarConnected}
            onCheckedChange={(v) => set("googleCalendarConnected", v)}
          />
        </div>
        <p className="mt-3 rounded-md bg-accent/50 px-3 py-2 text-xs text-muted-foreground">
          Two-way sync (auto-import events) requires the cloud backend.
        </p>
      </div>

      <SaveButton onClick={save} />
    </SettingsSection>
  );
}

/* ─────────────────────────── Email settings ─────────────────────────── */
export function EmailSection() {
  const { updateSettings, form, set } = useSettingsForm();
  const save = () => {
    updateSettings({
      emailProvider: form.emailProvider,
      gmailAddress: form.gmailAddress,
      emailSignature: form.emailSignature,
    });
    toast.success("Saved");
  };
  return (
    <SettingsSection
      title="Email Settings"
      description="Choose how you send emails to clients and set your default signature."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email provider">
          <Select
            value={form.emailProvider}
            onValueChange={(v) => set("emailProvider", v as StudioSettings["emailProvider"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Gmail">Gmail</SelectItem>
              <SelectItem value="SMTP">SMTP</SelectItem>
              <SelectItem value="None">None</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Your Gmail address">
          <Input
            value={form.gmailAddress ?? ""}
            onChange={(e) => set("gmailAddress", e.target.value)}
            placeholder="you@gmail.com"
          />
        </Field>
      </div>
      <div className="mt-4">
        <Field label="Email signature">
          <Textarea
            rows={4}
            value={form.emailSignature ?? ""}
            onChange={(e) => set("emailSignature", e.target.value)}
            placeholder="Warm regards, …"
            className="resize-none"
          />
        </Field>
      </div>
      <p className="mt-3 rounded-md bg-accent/50 px-3 py-2 text-xs text-muted-foreground">
        Emails open in Gmail pre-filled and are logged to the job&apos;s history with open &amp; click tracking.
        Full two-way sync (auto-import replies) is available when you connect the cloud backend.
      </p>
      <SaveButton onClick={save} label="Save email settings" />
    </SettingsSection>
  );
}

/* ────────────────────── Invoice & payment settings ────────────────────── */
export function InvoicingSection() {
  const { updateSettings, form, set } = useSettingsForm();
  const save = () => {
    updateSettings({
      invoicePrefix: form.invoicePrefix,
      quotePrefix: form.quotePrefix,
      paymentTermsDays: form.paymentTermsDays,
      depositPercent: form.depositPercent,
      autoReminders: form.autoReminders,
      sendReceipts: form.sendReceipts,
      invoiceTerms: form.invoiceTerms,
      quoteTerms: form.quoteTerms,
    });
    toast.success("Saved");
  };
  return (
    <SettingsSection
      title="Invoice & Payment Settings"
      description="Defaults applied when you raise a new quote or invoice."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Invoice number prefix" hint={`Next invoice: ${form.invoicePrefix}1045`}>
          <Input value={form.invoicePrefix} onChange={(e) => set("invoicePrefix", e.target.value)} />
        </Field>
        <Field label="Quote number prefix" hint={`Next quote: ${form.quotePrefix}2088`}>
          <Input value={form.quotePrefix} onChange={(e) => set("quotePrefix", e.target.value)} />
        </Field>
        <Field label="Payment terms (days)">
          <Input
            type="number"
            value={form.paymentTermsDays}
            onChange={(e) => set("paymentTermsDays", Number(e.target.value))}
          />
        </Field>
        <Field label="Deposit / retainer (%)">
          <Input
            type="number"
            value={form.depositPercent}
            onChange={(e) => set("depositPercent", Number(e.target.value))}
          />
        </Field>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <ToggleRow
          label="Automatic reminders"
          description="Nudge clients about upcoming & overdue invoices"
          checked={form.autoReminders}
          onCheckedChange={(v) => set("autoReminders", v)}
        />
        <ToggleRow
          label="Send payment receipts"
          description="Email a receipt when a payment is recorded"
          checked={form.sendReceipts}
          onCheckedChange={(v) => set("sendReceipts", v)}
        />
      </div>

      <div className="mt-4 grid gap-4">
        <Field label="Default invoice terms">
          <Textarea
            rows={3}
            value={form.invoiceTerms}
            onChange={(e) => set("invoiceTerms", e.target.value)}
            className="resize-none"
          />
        </Field>
        <Field label="Default quote terms">
          <Textarea
            rows={3}
            value={form.quoteTerms}
            onChange={(e) => set("quoteTerms", e.target.value)}
            className="resize-none"
          />
        </Field>
      </div>

      <SaveButton onClick={save} />
    </SettingsSection>
  );
}

/* ─────────────────────────── Payment methods ─────────────────────────── */
const PAYMENT_METHODS = ["Card", "Bank Transfer", "Cash", "PayPal", "Stripe", "Check"];

export function PaymentsSection() {
  const settings = useCRM((s) => s.settings);
  const updateSettings = useCRM((s) => s.updateSettings);

  const toggleMethod = (method: string, on: boolean) => {
    const next = new Set(settings.paymentMethods);
    if (on) next.add(method);
    else next.delete(method);
    updateSettings({ paymentMethods: [...next] });
    toast.success(on ? `${method} enabled` : `${method} disabled`);
  };

  return (
    <div className="space-y-5">
      <SettingsSection
        title="Payment Methods"
        description="Choose which payment options clients can see on invoices and quotes."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {PAYMENT_METHODS.map((m) => (
            <ToggleRow
              key={m}
              label={m}
              checked={settings.paymentMethods.includes(m)}
              onCheckedChange={(v) => toggleMethod(m, v)}
            />
          ))}
        </div>
      </SettingsSection>

      <SettingsSection title="Online Card Payments" description="Let clients pay invoices online.">
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500">
                <CreditCard className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold">Stripe</p>
                <p className="text-xs text-muted-foreground">
                  {settings.stripeConnected ? "Connected" : "Not connected"}
                </p>
              </div>
            </div>
            <Switch
              checked={settings.stripeConnected}
              onCheckedChange={(v) => {
                updateSettings({ stripeConnected: v });
                toast.success(v ? "Stripe connected" : "Stripe disconnected");
              }}
            />
          </div>
          <p className="mt-3 rounded-md bg-accent/50 px-3 py-2 text-xs text-muted-foreground">
            Live card processing requires the cloud backend — this toggle is a preview.
          </p>
        </div>
      </SettingsSection>
    </div>
  );
}

