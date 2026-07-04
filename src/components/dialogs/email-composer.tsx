"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Mail, Send, ClipboardCheck } from "lucide-react";
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
import { applyShortcodes, SHORTCODES } from "@/lib/shortcodes";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  clientId?: string;
  jobId?: string;
  to?: string;
  initialTemplateId?: string;
  onSent?: () => void;
}

export function EmailComposer({ open, onOpenChange, clientId, jobId, to, initialTemplateId, onSent }: Props) {
  const { clients, jobs, emailTemplates, settings, logEmail } = useCRM();
  const client = clients.find((c) => c.id === clientId);
  const job = jobs.find((j) => j.id === jobId);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const [toEmail, setToEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [templateId, setTemplateId] = useState("none");

  const fill = useMemo(
    () => (text: string) => applyShortcodes(text, { settings, client, job }),
    [client, job, settings],
  );

  const applyTemplateById = (id: string) => {
    const tpl = emailTemplates.find((t) => t.id === id);
    if (tpl) {
      setSubject(fill(tpl.subject));
      setBody(fill(tpl.body));
    }
  };

  useEffect(() => {
    if (open) {
      setToEmail(to ?? client?.email ?? "");
      if (initialTemplateId && emailTemplates.some((t) => t.id === initialTemplateId)) {
        setTemplateId(initialTemplateId);
        applyTemplateById(initialTemplateId);
      } else {
        setSubject("");
        setBody(settings.emailSignature ? `\n\n${settings.emailSignature}` : "");
        setTemplateId("none");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, to, clientId, jobId, initialTemplateId]);

  const applyTemplate = (id: string) => {
    setTemplateId(id);
    if (id === "none") return;
    applyTemplateById(id);
  };

  const insertShortcode = (code: string) => {
    const el = bodyRef.current;
    if (!el) {
      setBody((b) => b + code);
      return;
    }
    const start = el.selectionStart ?? body.length;
    const end = el.selectionEnd ?? body.length;
    const next = body.slice(0, start) + code + body.slice(end);
    setBody(next);
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = start + code.length;
    });
  };

  const sendViaGmail = () => {
    if (!toEmail) {
      toast.error("Please enter a recipient");
      return;
    }
    const params = new URLSearchParams({
      view: "cm",
      fs: "1",
      to: toEmail,
      su: subject,
      body,
    });
    if (settings.gmailAddress) params.set("authuser", settings.gmailAddress);
    const url = `https://mail.google.com/mail/?${params.toString()}`;
    window.open(url, "_blank", "noopener,noreferrer");
    logEmail({
      clientId,
      jobId,
      to: toEmail,
      subject: subject || "(no subject)",
      body,
      sentAt: new Date().toISOString(),
      via: "Gmail",
      direction: "outbound",
    });
    toast.success("Opened in Gmail & logged to history");
    onSent?.();
    onOpenChange(false);
  };

  const logOnly = () => {
    if (!toEmail) {
      toast.error("Please enter a recipient");
      return;
    }
    logEmail({
      clientId,
      jobId,
      to: toEmail,
      subject: subject || "(no subject)",
      body,
      sentAt: new Date().toISOString(),
      via: "Logged",
      direction: "outbound",
    });
    toast.success("Email logged to history");
    onSent?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" /> Compose email
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-1">
          <div className="grid gap-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Template</Label>
            <Select value={templateId} onValueChange={applyTemplate}>
              <SelectTrigger><SelectValue placeholder="Start from a template" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Blank email</SelectItem>
                {emailTemplates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs font-medium text-muted-foreground">To</Label>
            <Input value={toEmail} onChange={(e) => setToEmail(e.target.value)} placeholder="client@email.com" />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Subject</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Message</Label>
            <Textarea
              ref={bodyRef}
              rows={9}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="resize-none"
            />
            <div className="flex flex-wrap gap-1 pt-0.5">
              <span className="mr-1 text-[11px] font-medium text-muted-foreground">Insert:</span>
              {SHORTCODES.slice(0, 8).map((sc) => (
                <button
                  key={sc.code}
                  type="button"
                  onClick={() => insertShortcode(sc.code)}
                  title={sc.label}
                  className="rounded bg-accent px-1.5 py-0.5 font-mono text-[10px] text-accent-foreground transition hover:bg-primary hover:text-white"
                >
                  {sc.code}
                </button>
              ))}
            </div>
          </div>
          <p className="rounded-md bg-accent/50 px-3 py-2 text-xs text-muted-foreground">
            <strong className="text-accent-foreground">Send via Gmail</strong> opens your Gmail with this message
            pre-filled{settings.gmailAddress ? ` (${settings.gmailAddress})` : ""}, then records it in this job&apos;s
            history.
          </p>
        </div>
        <DialogFooter className="sm:justify-between">
          <Button variant="ghost" onClick={logOnly} className="gap-1.5">
            <ClipboardCheck className="h-4 w-4" /> Log only
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={sendViaGmail} className="gap-1.5">
              <Send className="h-4 w-4" /> Send via Gmail
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
