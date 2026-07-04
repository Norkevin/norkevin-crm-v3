"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Send, CheckCircle2 } from "lucide-react";
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
import type { Questionnaire, QuestionnaireItem } from "@/lib/types";
import { uid } from "@/lib/format";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  questionnaire: Questionnaire | null;
  jobId?: string;
  clientId?: string;
}

const DEFAULT_QUESTIONS = [
  "What time does the event start?",
  "Venue name & address?",
  "How many guests are you expecting?",
  "Any must-have shots or special moments?",
  "Who is the day-of coordinator?",
];

export function QuestionnaireDialog({ open, onOpenChange, questionnaire, jobId, clientId }: Props) {
  const { addQuestionnaire, updateQuestionnaire, deleteQuestionnaire, jobs } = useCRM();
  const job = jobs.find((j) => j.id === (questionnaire?.jobId ?? jobId));
  const [title, setTitle] = useState("");
  const [items, setItems] = useState<QuestionnaireItem[]>([]);

  useEffect(() => {
    if (open) {
      if (questionnaire) {
        setTitle(questionnaire.title);
        setItems(questionnaire.items.map((i) => ({ ...i })));
      } else {
        setTitle(`${job?.jobType ?? "Session"} Details Questionnaire`);
        setItems(DEFAULT_QUESTIONS.map((q) => ({ id: uid("qq"), question: q })));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, questionnaire]);

  const isResponding = questionnaire && questionnaire.status !== "Draft";

  const setQuestion = (id: string, question: string) =>
    setItems((its) => its.map((i) => (i.id === id ? { ...i, question } : i)));
  const setAnswer = (id: string, answer: string) =>
    setItems((its) => its.map((i) => (i.id === id ? { ...i, answer } : i)));
  const addItem = () => setItems((its) => [...its, { id: uid("qq"), question: "" }]);
  const removeItem = (id: string) => setItems((its) => its.filter((i) => i.id !== id));

  const persist = (status?: Questionnaire["status"]) => {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    const cleanItems = items.filter((i) => i.question.trim());
    if (questionnaire) {
      updateQuestionnaire(questionnaire.id, {
        title,
        items: cleanItems,
        ...(status ? { status } : {}),
        ...(status === "Completed" ? { completedAt: new Date().toISOString().slice(0, 10) } : {}),
        ...(status === "Sent" ? {} : {}),
      });
      toast.success("Questionnaire updated");
    } else {
      if (!jobId || !clientId) {
        toast.error("Missing job/client");
        return;
      }
      addQuestionnaire({
        jobId,
        clientId,
        title,
        items: cleanItems,
        status: status ?? "Draft",
      });
      toast.success(status === "Sent" ? "Questionnaire sent" : "Questionnaire created");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {questionnaire ? "Questionnaire" : "New questionnaire"}
            {questionnaire && <StatusBadge status={questionnaire.status} />}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={item.id} className="rounded-lg border p-3">
                <div className="flex items-start gap-2">
                  <span className="mt-2 text-xs font-semibold text-muted-foreground">{idx + 1}.</span>
                  {isResponding ? (
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.question}</p>
                      <Textarea
                        rows={2}
                        value={item.answer ?? ""}
                        onChange={(e) => setAnswer(item.id, e.target.value)}
                        placeholder="Client's answer…"
                        className="mt-1.5 resize-none"
                      />
                    </div>
                  ) : (
                    <>
                      <Input
                        value={item.question}
                        onChange={(e) => setQuestion(item.id, e.target.value)}
                        placeholder="Question…"
                        className="flex-1"
                      />
                      <button
                        onClick={() => removeItem(item.id)}
                        className="mt-1.5 text-muted-foreground transition hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {!isResponding && (
            <Button variant="outline" size="sm" className="w-fit gap-1.5" onClick={addItem}>
              <Plus className="h-3.5 w-3.5" /> Add question
            </Button>
          )}
        </div>

        <DialogFooter className="sm:justify-between">
          <div>
            {questionnaire && (
              <Button
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={() => {
                  if (confirm("Delete this questionnaire?")) {
                    deleteQuestionnaire(questionnaire.id);
                    toast.success("Questionnaire deleted");
                    onOpenChange(false);
                  }
                }}
              >
                Delete
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {isResponding ? (
              <>
                <Button variant="outline" onClick={() => persist()}>Save answers</Button>
                <Button onClick={() => persist("Completed")} className="gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Mark completed
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => persist("Sent")} className="gap-1.5">
                  <Send className="h-4 w-4" /> Save &amp; send
                </Button>
                <Button onClick={() => persist()}>Save draft</Button>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
