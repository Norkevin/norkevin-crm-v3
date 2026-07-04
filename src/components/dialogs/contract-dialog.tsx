"use client";

import { useEffect, useState } from "react";
import { Printer, PenLine, Send } from "lucide-react";
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
import { StatusBadge } from "@/components/status-badge";
import { useCRM } from "@/lib/store";
import { DEFAULT_CONTRACT_BODY } from "@/lib/seed";
import type { Contract } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  contract: Contract | null;
  jobId?: string;
  clientId?: string;
}

export function ContractDialog({ open, onOpenChange, contract, jobId, clientId }: Props) {
  const { addContract, updateContract, deleteContract, signContract, clients, jobs, settings } = useCRM();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [signing, setSigning] = useState(false);
  const [signature, setSignature] = useState("");

  const activeClientId = contract?.clientId ?? clientId;
  const client = clients.find((c) => c.id === activeClientId);
  const job = jobs.find((j) => j.id === (contract?.jobId ?? jobId));

  useEffect(() => {
    if (open) {
      setSigning(false);
      setSignature("");
      if (contract) {
        setTitle(contract.title);
        setBody(contract.body);
      } else {
        setTitle(`${job?.jobType ?? "Photography"} Photography Agreement`);
        setBody(
          DEFAULT_CONTRACT_BODY.replaceAll("{studio}", settings.studioName).replaceAll(
            "{client}",
            client ? `${client.firstName} ${client.lastName}` : "the Client",
          ),
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, contract]);

  const save = (status?: Contract["status"]) => {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (contract) {
      updateContract(contract.id, {
        title,
        body,
        ...(status ? { status, sentAt: status === "Sent" ? new Date().toISOString().slice(0, 10) : contract.sentAt } : {}),
      });
      toast.success("Contract updated");
    } else {
      if (!jobId || !clientId) {
        toast.error("Missing job/client");
        return;
      }
      addContract({
        jobId,
        clientId,
        title,
        body,
        status: status ?? "Draft",
        sentAt: status === "Sent" ? new Date().toISOString().slice(0, 10) : undefined,
      });
      toast.success(status === "Sent" ? "Contract sent" : "Contract created");
    }
    onOpenChange(false);
  };

  const doSign = () => {
    if (!contract) return;
    if (!signature.trim()) {
      toast.error("Type the client's full name to sign");
      return;
    }
    signContract(contract.id, signature.trim());
    toast.success("Contract signed");
    onOpenChange(false);
  };

  const print = () => {
    const w = window.open("", "_blank", "width=800,height=900");
    if (!w) return;
    w.document.write(`<!doctype html><html><head><title>${title}</title>
      <style>body{font-family:Inter,Arial,sans-serif;color:#222;padding:48px;max-width:720px;margin:auto;line-height:1.6}
      h1{color:#089d5a} pre{white-space:pre-wrap;font-family:inherit;font-size:14px}
      .sig{margin-top:48px;border-top:1px solid #ccc;padding-top:12px}</style></head><body>
      <h1>${settings.studioName}</h1><h2>${title}</h2>
      <pre>${body}</pre>
      <div class="sig">${contract?.signatureName ? `Signed by: <strong>${contract.signatureName}</strong> on ${formatDate(contract.signedAt)}` : "Signature: ____________________"}</div>
      </body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {contract ? "Contract" : "New contract"}
            {contract && <StatusBadge status={contract.status} />}
          </DialogTitle>
        </DialogHeader>

        {signing ? (
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              By typing the client&apos;s full legal name below, you confirm they have reviewed and agreed to this contract.
            </p>
            <div className="grid gap-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Client signature (full name)</Label>
              <Input
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder={client ? `${client.firstName} ${client.lastName}` : "Full name"}
                className="font-serif text-lg italic"
              />
            </div>
          </div>
        ) : (
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Contract body</Label>
              <Textarea rows={12} value={body} onChange={(e) => setBody(e.target.value)} className="font-mono text-xs leading-relaxed" />
            </div>
            {contract?.status === "Signed" && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm">
                <span className="text-muted-foreground">Signed by </span>
                <span className="font-serif text-base font-medium italic">{contract.signatureName}</span>
                <span className="text-muted-foreground"> on {formatDate(contract.signedAt)}</span>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="sm:justify-between">
          <div>
            {contract && !signing && (
              <Button
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={() => {
                  if (confirm("Delete this contract?")) {
                    deleteContract(contract.id);
                    toast.success("Contract deleted");
                    onOpenChange(false);
                  }
                }}
              >
                Delete
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {signing ? (
              <>
                <Button variant="outline" onClick={() => setSigning(false)}>Back</Button>
                <Button onClick={doSign} className="gap-1.5">
                  <PenLine className="h-4 w-4" /> Confirm signature
                </Button>
              </>
            ) : (
              <>
                {contract && (
                  <Button variant="outline" onClick={print} className="gap-1.5">
                    <Printer className="h-4 w-4" /> Print
                  </Button>
                )}
                {contract && contract.status !== "Signed" && (
                  <Button variant="outline" onClick={() => setSigning(true)} className="gap-1.5">
                    <PenLine className="h-4 w-4" /> Sign
                  </Button>
                )}
                {(!contract || contract.status === "Draft") && (
                  <Button variant="outline" onClick={() => save("Sent")} className="gap-1.5">
                    <Send className="h-4 w-4" /> Save &amp; send
                  </Button>
                )}
                <Button onClick={() => save()}>Save</Button>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
