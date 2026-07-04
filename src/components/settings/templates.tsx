"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useCRM } from "@/lib/store";
import {
  PRODUCT_CATEGORIES,
  WORKFLOW_STAGES,
  WORKFLOW_TASK_TYPES,
  type ContractTemplate,
  type EmailTemplate,
  type Product,
  type ProductCategory,
  type QuestionnaireTemplate,
  type WorkflowStage,
  type WorkflowTaskType,
  type WorkflowTemplate,
  type WorkflowTemplateTask,
} from "@/lib/types";
import { formatCurrency, uid } from "@/lib/format";
import { applyShortcodes } from "@/lib/shortcodes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  SaveButton,
  SettingsSection,
  ShortcodeChips,
  insertAtCursor,
} from "@/components/settings/kit";
import { toast } from "sonner";

/* ─────────────────────────── shared bits ─────────────────────────── */
function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex shrink-0 gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-foreground"
        onClick={onEdit}
        aria-label="Edit"
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
        onClick={onDelete}
        aria-label="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <p className="rounded-md border border-dashed py-6 text-center text-sm text-muted-foreground">
      {label}
    </p>
  );
}

const TASK_TYPE_LABEL: Record<WorkflowTaskType, string> = {
  email: "Email",
  contract: "Contract",
  questionnaire: "Questionnaire",
  trigger: "Trigger",
  event: "Event",
  task: "Task",
};

const TASK_CATEGORIES = ["Fundamentals", "Client Experience", "Pre-Shoot", "Post-Shoot"] as const;
type TaskCategory = (typeof TASK_CATEGORIES)[number];

/* ══════════════════════════ Email templates ══════════════════════════ */
function EmailTemplateDialog({
  open,
  onOpenChange,
  template,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  template: EmailTemplate | null;
}) {
  const { addEmailTemplate, updateEmailTemplate, workflowTemplates, settings } = useCRM();
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [link, setLink] = useState("general");
  const [focused, setFocused] = useState<"subject" | "body">("body");
  const subjectRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setName(template?.name ?? "");
      setSubject(template?.subject ?? "");
      setBody(template?.body ?? "");
      setLink(template?.workflowTemplateId ?? "general");
      setFocused("body");
    }
  }, [open, template]);

  const insert = (code: string) => {
    if (focused === "subject") insertAtCursor(subjectRef.current, subject, setSubject, code);
    else insertAtCursor(bodyRef.current, body, setBody, code);
  };

  const preview = useMemo(() => applyShortcodes(body, { settings }), [body, settings]);

  const save = () => {
    if (!name.trim()) {
      toast.error("Please enter a template name");
      return;
    }
    const payload = {
      name: name.trim(),
      subject,
      body,
      workflowTemplateId: link === "general" ? undefined : link,
    };
    if (template) {
      updateEmailTemplate(template.id, payload);
      toast.success("Template updated");
    } else {
      addEmailTemplate(payload);
      toast.success("Template created");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{template ? "Edit email template" : "New email template"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Template name">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Welcome email" />
            </Field>
            <Field label="Link to workflow" hint="Optional — group this template with a workflow.">
              <Select value={link} onValueChange={setLink}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General (not linked)</SelectItem>
                  {workflowTemplates.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Subject">
            <Input
              ref={subjectRef}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              onFocus={() => setFocused("subject")}
              placeholder="Subject line…"
            />
          </Field>
          <Field label="Body">
            <Textarea
              ref={bodyRef}
              rows={10}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onFocus={() => setFocused("body")}
              className="resize-none leading-relaxed"
              placeholder="Write your message…"
            />
          </Field>
          <div>
            <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">
              Insert a shortcode into the {focused === "subject" ? "subject" : "body"}
            </p>
            <ShortcodeChips onInsert={insert} />
          </div>
          <div>
            <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">Preview</p>
            <div className="whitespace-pre-wrap rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
              {preview || "Your message preview will appear here."}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save}>{template ? "Save changes" : "Create template"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function EmailTemplatesSection() {
  const { emailTemplates, deleteEmailTemplate } = useCRM();
  const [dialog, setDialog] = useState<{ open: boolean; template: EmailTemplate | null }>({
    open: false,
    template: null,
  });

  return (
    <SettingsSection
      title="Email Templates"
      description="Reusable emails with shortcodes that auto-fill client, job and studio details."
      action={
        <Button size="sm" className="gap-1.5" onClick={() => setDialog({ open: true, template: null })}>
          <Plus className="h-4 w-4" /> New template
        </Button>
      }
    >
      <div className="space-y-2">
        {emailTemplates.map((t) => (
          <div key={t.id} className="flex items-start justify-between gap-3 rounded-lg border p-3">
            <div className="min-w-0">
              <p className="text-sm font-medium">{t.name}</p>
              <p className="truncate text-xs text-muted-foreground">{t.subject}</p>
            </div>
            <RowActions
              onEdit={() => setDialog({ open: true, template: t })}
              onDelete={() => {
                if (confirm(`Delete the "${t.name}" template?`)) {
                  deleteEmailTemplate(t.id);
                  toast.success("Template deleted");
                }
              }}
            />
          </div>
        ))}
        {emailTemplates.length === 0 && <EmptyState label="No email templates yet." />}
      </div>
      <EmailTemplateDialog
        open={dialog.open}
        onOpenChange={(v) => setDialog((s) => ({ ...s, open: v }))}
        template={dialog.template}
      />
    </SettingsSection>
  );
}

/* ══════════════════════════ Products & packages ══════════════════════════ */
function ProductDialog({
  open,
  onOpenChange,
  product,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  product: Product | null;
}) {
  const { addProduct, updateProduct, settings } = useCRM();
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: 0,
    category: "Package" as ProductCategory,
    taxable: true,
  });
  useEffect(() => {
    if (open) {
      setForm(
        product
          ? {
              name: product.name,
              description: product.description ?? "",
              price: product.price,
              category: product.category,
              taxable: product.taxable,
            }
          : { name: "", description: "", price: 0, category: "Package", taxable: true },
      );
    }
  }, [open, product]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = () => {
    if (!form.name.trim()) {
      toast.error("Please enter a product name");
      return;
    }
    const payload = {
      name: form.name.trim(),
      description: form.description,
      price: form.price,
      category: form.category,
      taxable: form.taxable,
    };
    if (product) {
      updateProduct(product.id, payload);
      toast.success("Product updated");
    } else {
      addProduct(payload);
      toast.success("Product added");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{product ? "Edit product" : "New product"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <Field label="Name">
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Gold Wedding Collection" />
          </Field>
          <Field label="Description">
            <Textarea
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className="resize-none"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label={`Price (${settings.currency})`}>
              <Input type="number" value={form.price} onChange={(e) => set("price", Number(e.target.value))} />
            </Field>
            <Field label="Category">
              <Select value={form.category} onValueChange={(v) => set("category", v as ProductCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Taxable</p>
              <p className="text-xs text-muted-foreground">Apply the default tax rate to this item</p>
            </div>
            <Switch checked={form.taxable} onCheckedChange={(v) => set("taxable", v)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save}>{product ? "Save changes" : "Add product"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ProductsSection() {
  const { products, deleteProduct, settings } = useCRM();
  const [dialog, setDialog] = useState<{ open: boolean; product: Product | null }>({
    open: false,
    product: null,
  });

  return (
    <SettingsSection
      title="Products & Packages"
      description="Your price list — add these as line items on quotes and invoices."
      action={
        <Button size="sm" className="gap-1.5" onClick={() => setDialog({ open: true, product: null })}>
          <Plus className="h-4 w-4" /> New product
        </Button>
      }
    >
      <div className="space-y-2">
        {products.map((p) => (
          <div key={p.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium">{p.name}</p>
                <Badge variant="secondary" className="shrink-0 font-medium">
                  {p.category}
                </Badge>
              </div>
              {p.description && <p className="truncate text-xs text-muted-foreground">{p.description}</p>}
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold">{formatCurrency(p.price, settings.currency)}</p>
                <p className="text-[11px] text-muted-foreground">{p.taxable ? "Taxable" : "No tax"}</p>
              </div>
              <RowActions
                onEdit={() => setDialog({ open: true, product: p })}
                onDelete={() => {
                  if (confirm(`Delete "${p.name}"?`)) {
                    deleteProduct(p.id);
                    toast.success("Product deleted");
                  }
                }}
              />
            </div>
          </div>
        ))}
        {products.length === 0 && <EmptyState label="No products yet." />}
      </div>
      <ProductDialog
        open={dialog.open}
        onOpenChange={(v) => setDialog((s) => ({ ...s, open: v }))}
        product={dialog.product}
      />
    </SettingsSection>
  );
}

/* ══════════════════════ Quote & invoice templates ══════════════════════ */
export function DocTemplatesSection() {
  const settings = useCRM((s) => s.settings);
  const updateSettings = useCRM((s) => s.updateSettings);
  const [invoiceTerms, setInvoiceTerms] = useState(settings.invoiceTerms);
  const [quoteTerms, setQuoteTerms] = useState(settings.quoteTerms);
  useEffect(() => {
    setInvoiceTerms(settings.invoiceTerms);
    setQuoteTerms(settings.quoteTerms);
  }, [settings.invoiceTerms, settings.quoteTerms]);

  const save = () => {
    updateSettings({ invoiceTerms, quoteTerms });
    toast.success("Saved");
  };

  return (
    <SettingsSection
      title="Quote & Invoice Templates"
      description="Default terms and notes printed at the bottom of your quotes and invoices."
    >
      <div className="grid gap-4">
        <Field label="Invoice terms & notes">
          <Textarea rows={5} value={invoiceTerms} onChange={(e) => setInvoiceTerms(e.target.value)} className="resize-none" />
        </Field>
        <Field label="Quote terms & notes">
          <Textarea rows={5} value={quoteTerms} onChange={(e) => setQuoteTerms(e.target.value)} className="resize-none" />
        </Field>
      </div>
      <p className="mt-3 rounded-md bg-accent/50 px-3 py-2 text-xs text-muted-foreground">
        Line items come from <span className="font-medium">Products &amp; Packages</span> — add items there to reuse them across documents.
      </p>
      <SaveButton onClick={save} />
    </SettingsSection>
  );
}

/* ══════════════════════════ Contract templates ══════════════════════════ */
function ContractTemplateDialog({
  open,
  onOpenChange,
  template,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  template: ContractTemplate | null;
}) {
  const { addContractTemplate, updateContractTemplate } = useCRM();
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setName(template?.name ?? "");
      setBody(template?.body ?? "");
    }
  }, [open, template]);

  const insert = (code: string) => insertAtCursor(bodyRef.current, body, setBody, code);

  const save = () => {
    if (!name.trim()) {
      toast.error("Please enter a template name");
      return;
    }
    if (template) {
      updateContractTemplate(template.id, { name: name.trim(), body });
      toast.success("Template updated");
    } else {
      addContractTemplate({ name: name.trim(), body });
      toast.success("Template created");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{template ? "Edit contract template" : "New contract template"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <Field label="Template name">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Wedding Photography Agreement" />
          </Field>
          <Field label="Contract body">
            <Textarea
              ref={bodyRef}
              rows={14}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="resize-none font-mono text-xs leading-relaxed"
              placeholder="Write your contract terms…"
            />
          </Field>
          <div>
            <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">Insert a shortcode into the body</p>
            <ShortcodeChips onInsert={insert} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save}>{template ? "Save changes" : "Create template"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ContractTemplatesSection() {
  const { contractTemplates, deleteContractTemplate } = useCRM();
  const [dialog, setDialog] = useState<{ open: boolean; template: ContractTemplate | null }>({
    open: false,
    template: null,
  });

  return (
    <SettingsSection
      title="Contract Templates"
      description="Agreements you can send for e-signature from any job."
      action={
        <Button size="sm" className="gap-1.5" onClick={() => setDialog({ open: true, template: null })}>
          <Plus className="h-4 w-4" /> New template
        </Button>
      }
    >
      <div className="space-y-2">
        {contractTemplates.map((t) => (
          <div key={t.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
            <p className="truncate text-sm font-medium">{t.name}</p>
            <RowActions
              onEdit={() => setDialog({ open: true, template: t })}
              onDelete={() => {
                if (confirm(`Delete the "${t.name}" template?`)) {
                  deleteContractTemplate(t.id);
                  toast.success("Template deleted");
                }
              }}
            />
          </div>
        ))}
        {contractTemplates.length === 0 && <EmptyState label="No contract templates yet." />}
      </div>
      <ContractTemplateDialog
        open={dialog.open}
        onOpenChange={(v) => setDialog((s) => ({ ...s, open: v }))}
        template={dialog.template}
      />
    </SettingsSection>
  );
}

/* ══════════════════════ Questionnaire templates ══════════════════════ */
function QuestionnaireTemplateDialog({
  open,
  onOpenChange,
  template,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  template: QuestionnaireTemplate | null;
}) {
  const { addQuestionnaireTemplate, updateQuestionnaireTemplate } = useCRM();
  const [name, setName] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setName(template?.name ?? "");
      setQuestions(template ? [...template.questions] : [""]);
    }
  }, [open, template]);

  const setQ = (i: number, v: string) => setQuestions((qs) => qs.map((q, idx) => (idx === i ? v : q)));
  const addQ = () => setQuestions((qs) => [...qs, ""]);
  const removeQ = (i: number) => setQuestions((qs) => qs.filter((_, idx) => idx !== i));

  const save = () => {
    if (!name.trim()) {
      toast.error("Please enter a template name");
      return;
    }
    const cleaned = questions.map((q) => q.trim()).filter(Boolean);
    if (cleaned.length === 0) {
      toast.error("Add at least one question");
      return;
    }
    if (template) {
      updateQuestionnaireTemplate(template.id, { name: name.trim(), questions: cleaned });
      toast.success("Template updated");
    } else {
      addQuestionnaireTemplate({ name: name.trim(), questions: cleaned });
      toast.success("Template created");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{template ? "Edit questionnaire" : "New questionnaire"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <Field label="Template name">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Wedding Details" />
          </Field>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label className="text-xs font-medium text-muted-foreground">Questions</Label>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={addQ}>
                <Plus className="h-4 w-4" /> Add question
              </Button>
            </div>
            <div className="space-y-2">
              {questions.map((q, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-4 shrink-0 text-center text-xs font-semibold text-muted-foreground">{i + 1}</span>
                  <Input value={q} onChange={(e) => setQ(i, e.target.value)} placeholder="Type a question…" className="h-9" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeQ(i)}
                    aria-label="Remove question"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {questions.length === 0 && <EmptyState label="No questions yet — add one above." />}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save}>{template ? "Save changes" : "Create template"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function QuestionnaireTemplatesSection() {
  const { questionnaireTemplates, deleteQuestionnaireTemplate } = useCRM();
  const [dialog, setDialog] = useState<{ open: boolean; template: QuestionnaireTemplate | null }>({
    open: false,
    template: null,
  });

  return (
    <SettingsSection
      title="Questionnaire Templates"
      description="Collect details from clients before a shoot."
      action={
        <Button size="sm" className="gap-1.5" onClick={() => setDialog({ open: true, template: null })}>
          <Plus className="h-4 w-4" /> New questionnaire
        </Button>
      }
    >
      <div className="space-y-2">
        {questionnaireTemplates.map((t) => (
          <div key={t.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{t.name}</p>
              <p className="text-xs text-muted-foreground">
                {t.questions.length} {t.questions.length === 1 ? "question" : "questions"}
              </p>
            </div>
            <RowActions
              onEdit={() => setDialog({ open: true, template: t })}
              onDelete={() => {
                if (confirm(`Delete the "${t.name}" questionnaire?`)) {
                  deleteQuestionnaireTemplate(t.id);
                  toast.success("Template deleted");
                }
              }}
            />
          </div>
        ))}
        {questionnaireTemplates.length === 0 && <EmptyState label="No questionnaire templates yet." />}
      </div>
      <QuestionnaireTemplateDialog
        open={dialog.open}
        onOpenChange={(v) => setDialog((s) => ({ ...s, open: v }))}
        template={dialog.template}
      />
    </SettingsSection>
  );
}

/* ══════════════════════════ Workflow templates ══════════════════════════ */
function WorkflowTemplateDialog({
  open,
  onOpenChange,
  template,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  template: WorkflowTemplate | null;
}) {
  const { addWorkflowTemplate, updateWorkflowTemplate, emailTemplates } = useCRM();
  const [name, setName] = useState("");
  const [tasks, setTasks] = useState<WorkflowTemplateTask[]>([]);

  useEffect(() => {
    if (open) {
      setName(template?.name ?? "");
      setTasks(template ? template.tasks.map((t) => ({ ...t })) : []);
    }
  }, [open, template]);

  const setTask = (id: string, patch: Partial<WorkflowTemplateTask>) =>
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  const addTask = () =>
    setTasks((ts) => [
      ...ts,
      {
        id: uid("wt"),
        title: "New step",
        offsetDays: 0,
        category: "Fundamentals",
        stage: "Production",
        type: "task",
        automated: false,
      },
    ]);
  const removeTask = (id: string) => setTasks((ts) => ts.filter((t) => t.id !== id));

  const save = () => {
    if (!name.trim()) {
      toast.error("Please enter a workflow name");
      return;
    }
    const payload = { name: name.trim(), tasks };
    if (template) {
      updateWorkflowTemplate(template.id, payload);
      toast.success("Workflow updated");
    } else {
      addWorkflowTemplate(payload);
      toast.success("Workflow created");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{template ? "Edit workflow" : "New workflow"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <Field label="Workflow name">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Wedding Workflow" />
          </Field>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label className="text-xs font-medium text-muted-foreground">Steps ({tasks.length})</Label>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={addTask}>
                <Plus className="h-4 w-4" /> Add task
              </Button>
            </div>
            <div className="space-y-3">
              {tasks.map((t, i) => {
                const type = t.type ?? "task";
                const needsTemplate = type === "email" || type === "contract" || type === "questionnaire";
                return (
                  <div key={t.id} className="space-y-3 rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <span className="w-4 shrink-0 text-center text-xs font-bold text-muted-foreground">{i + 1}</span>
                      <Input
                        value={t.title}
                        onChange={(e) => setTask(t.id, { title: e.target.value })}
                        placeholder="Step title…"
                        className="h-9 flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeTask(t.id)}
                        aria-label="Remove task"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <Field label="Type">
                        <Select value={type} onValueChange={(v) => setTask(t.id, { type: v as WorkflowTaskType })}>
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {WORKFLOW_TASK_TYPES.map((tt) => (
                              <SelectItem key={tt} value={tt}>
                                {TASK_TYPE_LABEL[tt]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Stage">
                        <Select
                          value={t.stage ?? "Production"}
                          onValueChange={(v) => setTask(t.id, { stage: v as WorkflowStage })}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {WORKFLOW_STAGES.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Days from shoot">
                        <Input
                          type="number"
                          value={t.offsetDays}
                          onChange={(e) => setTask(t.id, { offsetDays: Number(e.target.value) })}
                          className="h-9"
                        />
                      </Field>
                      <Field label="Category">
                        <Select value={t.category} onValueChange={(v) => setTask(t.id, { category: v as TaskCategory })}>
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TASK_CATEGORIES.map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={!!t.automated}
                          onCheckedChange={(v) => setTask(t.id, { automated: v })}
                          id={`auto-${t.id}`}
                        />
                        <Label htmlFor={`auto-${t.id}`} className="text-sm font-normal">
                          Automated (auto-send)
                        </Label>
                      </div>
                      {needsTemplate && (
                        <div className="min-w-[220px]">
                          <Select
                            value={t.emailTemplateId ?? "none"}
                            onValueChange={(v) => setTask(t.id, { emailTemplateId: v === "none" ? undefined : v })}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Link a template" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No template</SelectItem>
                              {emailTemplates.map((e) => (
                                <SelectItem key={e.id} value={e.id}>
                                  {e.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {tasks.length === 0 && <EmptyState label="No steps yet — add your first task above." />}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save}>{template ? "Save changes" : "Create workflow"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function WorkflowTemplatesSection() {
  const { workflowTemplates, deleteWorkflowTemplate } = useCRM();
  const [dialog, setDialog] = useState<{ open: boolean; template: WorkflowTemplate | null }>({
    open: false,
    template: null,
  });

  return (
    <SettingsSection
      title="Workflow Templates"
      description="Step-by-step automations applied automatically when you create a new job."
      action={
        <Button size="sm" className="gap-1.5" onClick={() => setDialog({ open: true, template: null })}>
          <Plus className="h-4 w-4" /> New workflow
        </Button>
      }
    >
      <div className="space-y-2">
        {workflowTemplates.map((w) => (
          <div key={w.id} className="rounded-lg border p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">{w.name}</p>
                <p className="text-xs text-muted-foreground">
                  {w.tasks.length} {w.tasks.length === 1 ? "step" : "steps"}
                </p>
              </div>
              <RowActions
                onEdit={() => setDialog({ open: true, template: w })}
                onDelete={() => {
                  if (confirm(`Delete the "${w.name}" workflow?`)) {
                    deleteWorkflowTemplate(w.id);
                    toast.success("Workflow deleted");
                  }
                }}
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {w.tasks.slice(0, 5).map((t) => (
                <span key={t.id} className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                  {t.title}
                </span>
              ))}
              {w.tasks.length > 5 && (
                <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                  +{w.tasks.length - 5} more
                </span>
              )}
            </div>
          </div>
        ))}
        {workflowTemplates.length === 0 && <EmptyState label="No workflow templates yet." />}
      </div>
      <WorkflowTemplateDialog
        open={dialog.open}
        onOpenChange={(v) => setDialog((s) => ({ ...s, open: v }))}
        template={dialog.template}
      />
    </SettingsSection>
  );
}
