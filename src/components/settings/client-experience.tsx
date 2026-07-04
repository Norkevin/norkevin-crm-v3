"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { useCRM } from "@/lib/store";
import type {
  BookingConfig,
  ClientPortalConfig,
  ContactFormConfig,
  SessionType,
  StudioSettings,
} from "@/lib/types";
import { formatCurrency, uid } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  copyToClipboard,
  Field,
  SaveButton,
  SettingsSection,
  ToggleRow,
} from "@/components/settings/kit";
import { toast } from "sonner";

/* ─────────────────────────── Client portal ─────────────────────────── */
export function PortalSection() {
  const settings = useCRM((s) => s.settings);
  const updateSettings = useCRM((s) => s.updateSettings);
  const [cp, setCp] = useState<ClientPortalConfig>(settings.clientPortal);
  useEffect(() => setCp(settings.clientPortal), [settings.clientPortal]);

  const set = <K extends keyof ClientPortalConfig>(k: K, v: ClientPortalConfig[K]) =>
    setCp((f) => ({ ...f, [k]: v }));

  const save = () => {
    updateSettings({ clientPortal: cp });
    toast.success("Saved");
  };

  const enabledSections = [
    cp.showQuotes && "Quotes",
    cp.showContracts && "Contracts",
    cp.showInvoices && "Invoices",
    cp.showQuestionnaires && "Questionnaires",
  ].filter(Boolean) as string[];

  const initials = settings.studioName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <SettingsSection
      title="Client Portal"
      description="Your clients' private hub to review quotes, sign contracts, pay invoices and answer questionnaires."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Editor */}
        <div className="space-y-4">
          <Field label="Welcome message">
            <Textarea
              rows={4}
              value={cp.welcomeMessage}
              onChange={(e) => set("welcomeMessage", e.target.value)}
              className="resize-none"
            />
          </Field>
          <Field label="Brand color" hint="Used for the portal header and accents.">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={cp.brandColor}
                onChange={(e) => set("brandColor", e.target.value)}
                className="h-9 w-12 cursor-pointer rounded-md border bg-transparent p-1"
                aria-label="Brand color"
              />
              <Input
                value={cp.brandColor}
                onChange={(e) => set("brandColor", e.target.value)}
                className="w-32 font-mono uppercase"
                maxLength={7}
              />
            </div>
          </Field>
          <div className="grid gap-2">
            <ToggleRow label="Show quotes" checked={cp.showQuotes} onCheckedChange={(v) => set("showQuotes", v)} />
            <ToggleRow label="Show contracts" checked={cp.showContracts} onCheckedChange={(v) => set("showContracts", v)} />
            <ToggleRow label="Show invoices" checked={cp.showInvoices} onCheckedChange={(v) => set("showInvoices", v)} />
            <ToggleRow label="Show questionnaires" checked={cp.showQuestionnaires} onCheckedChange={(v) => set("showQuestionnaires", v)} />
          </div>
        </div>

        {/* Live preview */}
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Live preview</p>
          <div className="overflow-hidden rounded-xl border shadow-sm">
            <div className="px-4 py-5 text-white" style={{ backgroundColor: cp.brandColor }}>
              <div className="flex items-center gap-2.5">
                {settings.logoUrl ? (
                  <img
                    src={settings.logoUrl}
                    alt="Logo"
                    className="h-9 w-9 rounded-md bg-white/20 object-contain p-0.5"
                  />
                ) : (
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-white/20 text-xs font-bold">
                    {initials}
                  </span>
                )}
                <span className="text-base font-semibold">{settings.studioName}</span>
              </div>
            </div>
            <div className="space-y-3 bg-card p-4">
              <p className="text-sm leading-relaxed text-muted-foreground">{cp.welcomeMessage}</p>
              <div className="flex flex-wrap gap-1.5">
                {enabledSections.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border px-2.5 py-1 text-xs font-medium"
                    style={{ color: cp.brandColor, borderColor: `${cp.brandColor}55` }}
                  >
                    {s}
                  </span>
                ))}
                {enabledSections.length === 0 && (
                  <span className="text-xs text-muted-foreground">No sections enabled yet.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <SaveButton onClick={save} />
    </SettingsSection>
  );
}

/* ─────────────────────────── Contact form ─────────────────────────── */
function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function buildEmbed(cf: ContactFormConfig, settings: StudioSettings): string {
  const inputs = cf.fields.map((f) => {
    const name = slug(f) || "field";
    if (/message|note/i.test(f)) {
      return `  <textarea name="${name}" placeholder="${f}" rows="4"></textarea>`;
    }
    const type = /email/i.test(f)
      ? "email"
      : /date/i.test(f)
        ? "date"
        : /phone|mobile|tel/i.test(f)
          ? "tel"
          : "text";
    return `  <input type="${type}" name="${name}" placeholder="${f}" />`;
  });
  const jobTypeSelect = cf.jobTypesEnabled
    ? [
        `  <select name="job_type">`,
        ...settings.jobTypes.map((t) => `    <option>${t}</option>`),
        `  </select>`,
      ].join("\n")
    : "";
  const action = `https://forms.studioninja.co/${slug(settings.studioName) || "studio"}`;
  return [
    `<!-- ${settings.studioName} enquiry form -->`,
    `<form action="${action}" method="POST"${cf.redirectUrl ? ` data-redirect="${cf.redirectUrl}"` : ""}>`,
    ...inputs,
    jobTypeSelect,
    `  <button type="submit">Send enquiry</button>`,
    `</form>`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function ContactFormSection() {
  const settings = useCRM((s) => s.settings);
  const updateSettings = useCRM((s) => s.updateSettings);
  const [cf, setCf] = useState<ContactFormConfig>(settings.contactForm);
  const [newField, setNewField] = useState("");
  useEffect(() => setCf(settings.contactForm), [settings.contactForm]);

  const embed = useMemo(() => buildEmbed(cf, settings), [cf, settings]);

  const addField = () => {
    const t = newField.trim();
    if (!t) return;
    if (cf.fields.some((x) => x.toLowerCase() === t.toLowerCase())) {
      toast.error("That field already exists");
      return;
    }
    setCf((f) => ({ ...f, fields: [...f.fields, t] }));
    setNewField("");
  };
  const removeField = (t: string) => setCf((f) => ({ ...f, fields: f.fields.filter((x) => x !== t) }));

  const save = () => {
    updateSettings({ contactForm: cf });
    toast.success("Saved");
  };

  const copy = async () => {
    const ok = await copyToClipboard(embed);
    if (ok) toast.success("Embed code copied");
    else toast.error("Couldn't copy — select the code manually");
  };

  return (
    <SettingsSection
      title="Contact Form"
      description="Collect enquiries from your website. New submissions arrive in your Leads list."
    >
      <div className="space-y-4">
        <Field label="Form fields">
          <div className="mb-2 flex flex-wrap gap-2">
            {cf.fields.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 rounded-full border bg-white px-2.5 py-1 text-xs font-medium"
              >
                {t}
                <button
                  type="button"
                  onClick={() => removeField(t)}
                  className="text-muted-foreground transition hover:text-destructive"
                  aria-label={`Remove ${t}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {cf.fields.length === 0 && (
              <span className="text-xs text-muted-foreground">No fields yet — add one below.</span>
            )}
          </div>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              addField();
            }}
          >
            <Input
              value={newField}
              onChange={(e) => setNewField(e.target.value)}
              placeholder="Add a field, e.g. Budget…"
              className="h-9"
            />
            <Button type="submit" size="sm" variant="secondary">
              <Plus className="h-4 w-4" />
            </Button>
          </form>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Redirect URL after submit" hint="Where to send visitors once they submit.">
            <Input
              value={cf.redirectUrl}
              onChange={(e) => setCf((f) => ({ ...f, redirectUrl: e.target.value }))}
              placeholder="https://yourstudio.com/thank-you"
            />
          </Field>
          <div className="flex items-end">
            <ToggleRow
              label="Include job type picker"
              description="Let enquirers choose the type of shoot"
              checked={cf.jobTypesEnabled}
              onCheckedChange={(v) => setCf((f) => ({ ...f, jobTypesEnabled: v }))}
            />
          </div>
        </div>

        <Field label="Embed code" hint="Paste this snippet into your website where you'd like the form to appear.">
          <Textarea
            readOnly
            rows={9}
            value={embed}
            className="resize-none bg-muted/40 font-mono text-xs leading-relaxed"
            onFocus={(e) => e.currentTarget.select()}
          />
        </Field>
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={copy} className="gap-1.5">
            <Plus className="h-4 w-4 rotate-45" /> Copy code
          </Button>
        </div>
      </div>

      <SaveButton onClick={save} />
    </SettingsSection>
  );
}

/* ─────────────────────────── Online booking ─────────────────────────── */
export function BookingSection() {
  const settings = useCRM((s) => s.settings);
  const updateSettings = useCRM((s) => s.updateSettings);
  const [b, setB] = useState<BookingConfig>(settings.booking);
  useEffect(() => setB(settings.booking), [settings.booking]);

  const setType = (id: string, patch: Partial<SessionType>) =>
    setB((f) => ({
      ...f,
      sessionTypes: f.sessionTypes.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }));
  const addType = () =>
    setB((f) => ({
      ...f,
      sessionTypes: [...f.sessionTypes, { id: uid("st"), name: "New session", duration: 60, price: 0 }],
    }));
  const removeType = (id: string) =>
    setB((f) => ({ ...f, sessionTypes: f.sessionTypes.filter((t) => t.id !== id) }));

  const save = () => {
    updateSettings({ booking: b });
    toast.success("Saved");
  };

  return (
    <SettingsSection
      title="Online Booking"
      description="Let clients book and pay for sessions directly from a public booking page."
      action={
        <Button variant="outline" size="sm" onClick={addType} className="gap-1.5">
          <Plus className="h-4 w-4" /> Add session
        </Button>
      }
    >
      <div className="space-y-4">
        <ToggleRow
          label="Enable online booking"
          description="Publish your booking page for clients to self-schedule"
          checked={b.enabled}
          onCheckedChange={(v) => setB((f) => ({ ...f, enabled: v }))}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Buffer between sessions (minutes)">
            <Input
              type="number"
              value={b.bufferMinutes}
              onChange={(e) => setB((f) => ({ ...f, bufferMinutes: Number(e.target.value) }))}
            />
          </Field>
          <Field label="Minimum lead time (days)">
            <Input
              type="number"
              value={b.leadTimeDays}
              onChange={(e) => setB((f) => ({ ...f, leadTimeDays: Number(e.target.value) }))}
            />
          </Field>
        </div>

        <div>
          <Label className="text-xs font-medium text-muted-foreground">Session types</Label>
          <div className="mt-2 space-y-2">
            {b.sessionTypes.map((t) => (
              <div key={t.id} className="rounded-lg border p-3">
                <div className="flex flex-wrap items-end gap-3">
                  <div className="grid min-w-[160px] flex-1 gap-1.5">
                    <Label className="text-[11px] font-medium text-muted-foreground">Name</Label>
                    <Input value={t.name} onChange={(e) => setType(t.id, { name: e.target.value })} className="h-9" />
                  </div>
                  <div className="grid w-24 gap-1.5">
                    <Label className="text-[11px] font-medium text-muted-foreground">Minutes</Label>
                    <Input
                      type="number"
                      value={t.duration}
                      onChange={(e) => setType(t.id, { duration: Number(e.target.value) })}
                      className="h-9"
                    />
                  </div>
                  <div className="grid w-28 gap-1.5">
                    <Label className="text-[11px] font-medium text-muted-foreground">Price</Label>
                    <Input
                      type="number"
                      value={t.price}
                      onChange={(e) => setType(t.id, { price: Number(e.target.value) })}
                      className="h-9"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeType(t.id)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Remove session type"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {t.duration} min session · {formatCurrency(t.price, settings.currency)}
                </p>
              </div>
            ))}
            {b.sessionTypes.length === 0 && (
              <p className="rounded-md border border-dashed py-6 text-center text-sm text-muted-foreground">
                No session types yet. Add one to get started.
              </p>
            )}
          </div>
        </div>
      </div>

      <SaveButton onClick={save} />
    </SettingsSection>
  );
}
