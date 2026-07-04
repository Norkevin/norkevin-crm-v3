"use client";

import { useRef, useState } from "react";
import { Plus, X, Download, Upload, RotateCcw, Trash2, Save, Workflow, Mail, Check, Link2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useCRM } from "@/lib/store";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function SettingsPage() {
  const {
    settings,
    updateSettings,
    workflowTemplates,
    exportData,
    importData,
    resetData,
    clearAll,
  } = useCRM();

  const [form, setForm] = useState(settings);
  const [newJobType, setNewJobType] = useState("");
  const [newSource, setNewSource] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const saveDetails = () => {
    updateSettings(form);
    toast.success("Studio settings saved");
  };

  const addJobType = () => {
    if (!newJobType.trim()) return;
    const updated = [...form.jobTypes, newJobType.trim()];
    set("jobTypes", updated);
    updateSettings({ jobTypes: updated });
    setNewJobType("");
  };
  const removeJobType = (t: string) => {
    const updated = form.jobTypes.filter((x) => x !== t);
    set("jobTypes", updated);
    updateSettings({ jobTypes: updated });
  };
  const addSource = () => {
    if (!newSource.trim()) return;
    const updated = [...form.leadSources, newSource.trim()];
    set("leadSources", updated);
    updateSettings({ leadSources: updated });
    setNewSource("");
  };
  const removeSource = (t: string) => {
    const updated = form.leadSources.filter((x) => x !== t);
    set("leadSources", updated);
    updateSettings({ leadSources: updated });
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `studio-ninja-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup downloaded");
  };
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (importData(String(reader.result))) {
        setForm(useCRM.getState().settings);
        toast.success("Backup restored");
      } else toast.error("Invalid backup file");
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="max-w-4xl">
      <PageHeader title="Settings" subtitle="Manage your studio profile, workflow and data." />

      <div className="space-y-5">
        {/* Studio details */}
        <Card className="p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold">Studio details</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Studio name">
              <Input value={form.studioName} onChange={(e) => set("studioName", e.target.value)} />
            </Field>
            <Field label="Owner name">
              <Input value={form.ownerName} onChange={(e) => set("ownerName", e.target.value)} />
            </Field>
            <Field label="Email">
              <Input value={form.email} onChange={(e) => set("email", e.target.value)} />
            </Field>
            <Field label="Phone">
              <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </Field>
            <Field label="Website">
              <Input value={form.website ?? ""} onChange={(e) => set("website", e.target.value)} />
            </Field>
            <Field label="Address">
              <Input value={form.address} onChange={(e) => set("address", e.target.value)} />
            </Field>
            <Field label="Currency symbol">
              <Input value={form.currency} onChange={(e) => set("currency", e.target.value)} maxLength={3} />
            </Field>
            <Field label="Default tax rate (%)">
              <Input type="number" value={form.defaultTaxRate} onChange={(e) => set("defaultTaxRate", Number(e.target.value))} />
            </Field>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={saveDetails} className="gap-1.5">
              <Save className="h-4 w-4" /> Save details
            </Button>
          </div>
        </Card>

        {/* Job types + sources */}
        <div className="grid gap-5 sm:grid-cols-2">
          <Card className="p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold">Job types</h3>
            <div className="mb-3 flex flex-wrap gap-2">
              {form.jobTypes.map((t) => (
                <Chip key={t} label={t} onRemove={() => removeJobType(t)} />
              ))}
            </div>
            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); addJobType(); }}>
              <Input value={newJobType} onChange={(e) => setNewJobType(e.target.value)} placeholder="Add job type…" className="h-9" />
              <Button type="submit" size="sm" variant="secondary"><Plus className="h-4 w-4" /></Button>
            </form>
          </Card>

          <Card className="p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold">Lead sources</h3>
            <div className="mb-3 flex flex-wrap gap-2">
              {form.leadSources.map((t) => (
                <Chip key={t} label={t} onRemove={() => removeSource(t)} />
              ))}
            </div>
            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); addSource(); }}>
              <Input value={newSource} onChange={(e) => setNewSource(e.target.value)} placeholder="Add lead source…" className="h-9" />
              <Button type="submit" size="sm" variant="secondary"><Plus className="h-4 w-4" /></Button>
            </form>
          </Card>
        </div>

        {/* Workflow templates */}
        <Card className="p-5 shadow-sm">
          <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
            <Workflow className="h-4 w-4" /> Workflow templates
          </h3>
          <div className="space-y-3">
            {workflowTemplates.map((tpl) => (
              <div key={tpl.id} className="rounded-lg border p-3">
                <div className="mb-2 font-medium">{tpl.name}</div>
                <div className="flex flex-wrap gap-1.5">
                  {tpl.tasks.map((t) => (
                    <span key={t.id} className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                      {t.title}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Templates are applied automatically when you create a new job.
          </p>
        </Card>

        {/* Integrations & Email */}
        <Card className="p-5 shadow-sm">
          <h3 className="mb-1 flex items-center gap-1.5 text-sm font-semibold">
            <Link2 className="h-4 w-4" /> Integrations &amp; Email
          </h3>
          <p className="mb-4 text-xs text-muted-foreground">
            Connect your Gmail so you can send &amp; log emails to clients directly from a job.
          </p>

          {/* Gmail */}
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-500">
                  <Mail className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold">Gmail</p>
                  <p className="text-xs text-muted-foreground">
                    {form.gmailAddress ? `Connected as ${form.gmailAddress}` : "Not connected"}
                  </p>
                </div>
              </div>
              {form.gmailAddress && (
                <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  <Check className="h-3.5 w-3.5" /> Connected
                </span>
              )}
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Your Gmail address">
                <Input
                  value={form.gmailAddress ?? ""}
                  onChange={(e) => set("gmailAddress", e.target.value)}
                  placeholder="you@gmail.com"
                />
              </Field>
              <Field label="Email signature">
                <Textarea
                  rows={3}
                  value={form.emailSignature ?? ""}
                  onChange={(e) => set("emailSignature", e.target.value)}
                  placeholder="Warm regards, …"
                  className="resize-none"
                />
              </Field>
            </div>
            <div className="mt-3 flex justify-end">
              <Button size="sm" onClick={saveDetails} className="gap-1.5">
                <Save className="h-4 w-4" /> Save email settings
              </Button>
            </div>
            <p className="mt-3 rounded-md bg-accent/50 px-3 py-2 text-xs text-muted-foreground">
              Emails open in Gmail pre-filled and are logged to the job&apos;s history with open/click tracking.
              Full two-way sync (auto-import replies) is available when you connect the cloud backend.
            </p>
          </div>

          {/* Other integrations */}
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {[
              { name: "Google Calendar", desc: "Sync shoots & appointments" },
              { name: "Stripe", desc: "Accept online payments" },
              { name: "Xero", desc: "Sync invoices & accounting" },
              { name: "QuickBooks", desc: "Sync invoices & accounting" },
            ].map((it) => (
              <div key={it.name} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{it.name}</p>
                  <p className="text-xs text-muted-foreground">{it.desc}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toast.info(`${it.name} requires the cloud backend — coming soon.`)}
                >
                  Connect
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Data management */}
        <Card className="border-amber-200 bg-amber-50/40 p-5 shadow-sm">
          <h3 className="mb-1 text-sm font-semibold">Data &amp; backups</h3>
          <p className="mb-4 text-xs text-muted-foreground">
            Your data is saved automatically in this browser. Download a backup regularly to keep it safe,
            or restore it on another device.
          </p>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={handleImport} />
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleExport} className="gap-1.5">
              <Download className="h-4 w-4" /> Download backup
            </Button>
            <Button variant="outline" onClick={() => fileRef.current?.click()} className="gap-1.5">
              <Upload className="h-4 w-4" /> Restore backup
            </Button>
            <Separator orientation="vertical" className="h-9" />
            <Button
              variant="outline"
              className="gap-1.5"
              onClick={() => {
                if (confirm("Reset to the sample dataset? Your current data will be replaced.")) {
                  resetData();
                  setForm(useCRM.getState().settings);
                  toast.success("Sample data restored");
                }
              }}
            >
              <RotateCcw className="h-4 w-4" /> Reset sample data
            </Button>
            <Button
              variant="outline"
              className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => {
                if (confirm("Delete ALL clients, leads, jobs, events and invoices? This cannot be undone.")) {
                  clearAll();
                  toast.success("All records cleared");
                }
              }}
            >
              <Trash2 className="h-4 w-4" /> Clear all records
            </Button>
          </div>
        </Card>
      </div>
    </div>
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

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border bg-white px-2.5 py-1 text-xs font-medium">
      {label}
      <button onClick={onRemove} className="text-muted-foreground transition hover:text-destructive">
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
