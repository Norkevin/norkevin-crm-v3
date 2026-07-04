"use client";

import { useState } from "react";
import {
  Check,
  Plus,
  X,
  Zap,
  Hand,
  Mail,
  FileSignature,
  ClipboardList,
  GitBranch,
  Camera,
  CheckSquare,
  Send,
} from "lucide-react";
import { useCRM } from "@/lib/store";
import {
  WORKFLOW_STAGES,
  WORKFLOW_TASK_TYPES,
  type Job,
  type WorkflowStage,
  type WorkflowTaskType,
} from "@/lib/types";
import { formatDate, jobProgress } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmailComposer } from "@/components/dialogs/email-composer";

const TYPE_ICON: Record<WorkflowTaskType, typeof Mail> = {
  email: Mail,
  contract: FileSignature,
  questionnaire: ClipboardList,
  trigger: GitBranch,
  event: Camera,
  task: CheckSquare,
};

const TYPE_LABEL: Record<WorkflowTaskType, string> = {
  email: "Email",
  contract: "Contract",
  questionnaire: "Questionnaire",
  trigger: "Trigger",
  event: "Event",
  task: "Task",
};

export function WorkflowPanel({ job }: { job: Job }) {
  const { toggleJobTask, addJobTask, deleteJobTask } = useCRM();
  const [newTask, setNewTask] = useState("");
  const [newStage, setNewStage] = useState<WorkflowStage>("Production");
  const [newType, setNewType] = useState<WorkflowTaskType>("task");
  const [compose, setCompose] = useState<{ open: boolean; templateId?: string; taskId?: string }>({ open: false });
  const progress = jobProgress(job);

  const stageOf = (stage?: WorkflowStage) => stage ?? "Production";
  const grouped = WORKFLOW_STAGES.map((stage) => ({
    stage,
    tasks: job.tasks.filter((t) => stageOf(t.stage) === stage),
  })).filter((g) => g.tasks.length > 0);

  return (
    <div>
      {/* Progress header */}
      <div className="mb-4 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full", progress === 100 ? "bg-primary" : "bg-amber-400")}
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-muted-foreground">{progress}% complete</span>
      </div>

      <div className="space-y-6">
        {grouped.map((group) => (
          <div key={group.stage}>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">{group.stage}</span>
              <span className="h-px flex-1 bg-border" />
            </div>
            <div className="relative space-y-0.5 pl-1">
              {group.tasks.map((task) => {
                const type = (task.type ?? "task") as WorkflowTaskType;
                const TypeIcon = TYPE_ICON[type];
                const canSend = type === "email" && !task.done;
                return (
                  <div key={task.id} className="group relative flex items-start gap-3 rounded-md py-2 pl-1 pr-2 hover:bg-muted/40">
                    <button
                      onClick={() => toggleJobTask(job.id, task.id)}
                      className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition",
                        task.done
                          ? "border-primary bg-primary text-white"
                          : "border-muted-foreground/30 bg-background hover:border-primary",
                      )}
                    >
                      {task.done && <Check className="h-3 w-3" strokeWidth={3} />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <TypeIcon className={cn("h-3.5 w-3.5 shrink-0", task.done ? "text-muted-foreground" : "text-primary")} />
                        <span className={cn("text-sm", task.done ? "text-muted-foreground" : "font-medium")}>
                          {task.title}
                        </span>
                        {task.type && task.type !== "task" && (
                          <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-bold uppercase text-muted-foreground">
                            {TYPE_LABEL[type]}
                          </span>
                        )}
                        {(type === "email" || type === "contract" || type === "questionnaire") && (
                          <span
                            className={cn(
                              "inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase",
                              task.auto ? "bg-accent text-accent-foreground" : "bg-sky-100 text-sky-700",
                            )}
                          >
                            {task.auto ? <Zap className="h-2.5 w-2.5" /> : <Hand className="h-2.5 w-2.5" />}
                            {task.auto ? "Auto" : "Manual"}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {task.done ? `Completed ${formatDate(task.completedAt)}` : type === "trigger" ? "Auto-completes on client action" : "Pending"}
                      </span>
                    </div>
                    {canSend && (
                      <button
                        onClick={() => setCompose({ open: true, templateId: task.emailTemplateId, taskId: task.id })}
                        className="mt-0.5 flex shrink-0 items-center gap-1 rounded-md border border-primary/30 px-2 py-1 text-[11px] font-medium text-primary transition hover:bg-primary hover:text-white"
                      >
                        <Send className="h-3 w-3" /> Send
                      </button>
                    )}
                    <button
                      onClick={() => deleteJobTask(job.id, task.id)}
                      className="mt-1 text-muted-foreground opacity-0 transition hover:text-destructive group-hover:opacity-100"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {job.tasks.length === 0 && (
          <p className="rounded-md border border-dashed py-6 text-center text-sm text-muted-foreground">
            No workflow tasks yet.
          </p>
        )}
      </div>

      {/* Add task */}
      <form
        className="mt-4 flex flex-wrap gap-2 border-t pt-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (newTask.trim()) {
            addJobTask(job.id, newTask.trim(), newStage, newType);
            setNewTask("");
          }
        }}
      >
        <Input value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="Add a step…" className="h-9 min-w-[140px] flex-1" />
        <Select value={newType} onValueChange={(v) => setNewType(v as WorkflowTaskType)}>
          <SelectTrigger className="h-9 w-[130px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {WORKFLOW_TASK_TYPES.map((t) => (
              <SelectItem key={t} value={t}>{TYPE_LABEL[t]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={newStage} onValueChange={(v) => setNewStage(v as WorkflowStage)}>
          <SelectTrigger className="h-9 w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {WORKFLOW_STAGES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit" size="sm" className="gap-1"><Plus className="h-4 w-4" /> Add</Button>
      </form>

      <EmailComposer
        open={compose.open}
        onOpenChange={(v) => setCompose((s) => ({ ...s, open: v }))}
        clientId={job.clientId}
        jobId={job.id}
        initialTemplateId={compose.templateId}
        onSent={() => {
          if (compose.taskId) {
            const t = job.tasks.find((x) => x.id === compose.taskId);
            if (t && !t.done) toggleJobTask(job.id, compose.taskId);
          }
        }}
      />
    </div>
  );
}
