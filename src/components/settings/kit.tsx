"use client";

import type { ReactNode } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SHORTCODES } from "@/lib/shortcodes";
import { cn } from "@/lib/utils";

/** A white settings card with a header, optional description and optional header action. */
export function SettingsSection({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card className="p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold">{title}</h3>
          {description && (
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </Card>
  );
}

/** Labelled form control with an optional hint below. */
export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
      {hint && <p className="text-[11px] leading-relaxed text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** A bordered row with a label/description on the left and a Switch on the right. */
export function ToggleRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

/** Right-aligned primary save button used at the bottom of a section form. */
export function SaveButton({
  onClick,
  label = "Save",
  className,
}: {
  onClick: () => void;
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn("mt-5 flex justify-end", className)}>
      <Button onClick={onClick} className="gap-1.5">
        <Save className="h-4 w-4" /> {label}
      </Button>
    </div>
  );
}

type TextField = HTMLInputElement | HTMLTextAreaElement | null;

/** Insert a snippet at the caret of a text field, restoring a sensible caret position. */
export function insertAtCursor(
  el: TextField,
  value: string,
  setValue: (v: string) => void,
  snippet: string,
) {
  if (!el) {
    setValue(value + snippet);
    return;
  }
  const start = el.selectionStart ?? value.length;
  const end = el.selectionEnd ?? value.length;
  const next = value.slice(0, start) + snippet + value.slice(end);
  setValue(next);
  requestAnimationFrame(() => {
    el.focus();
    const caret = start + snippet.length;
    el.selectionStart = caret;
    el.selectionEnd = caret;
  });
}

/** Clickable pills that insert a %shortcode% into the currently focused field. */
export function ShortcodeChips({
  onInsert,
  className,
}: {
  onInsert: (code: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {SHORTCODES.map((sc) => (
        <button
          key={sc.code}
          type="button"
          title={sc.label}
          onClick={() => onInsert(sc.code)}
          className="rounded-full border bg-white px-2 py-0.5 text-[11px] font-medium text-muted-foreground transition hover:border-primary/40 hover:bg-accent hover:text-accent-foreground"
        >
          {sc.code}
        </button>
      ))}
    </div>
  );
}

/** iframe-safe clipboard copy with a legacy fallback. */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (
      typeof navigator !== "undefined" &&
      navigator.clipboard &&
      typeof window !== "undefined" &&
      window.isSecureContext
    ) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy approach below
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
