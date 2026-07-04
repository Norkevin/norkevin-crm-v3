"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useCRM } from "@/lib/store";
import { PageHeader } from "@/components/page-header";
import { TypeDot, StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AppointmentDialog } from "@/components/dialogs/appointment-dialog";
import { formatTime, formatDate } from "@/lib/format";
import type { Appointment } from "@/lib/types";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const { appointments } = useCRM();
  const [cursor, setCursor] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [defaultDate, setDefaultDate] = useState<string | undefined>();

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor));
    const end = endOfWeek(endOfMonth(cursor));
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  const eventsByDay = (day: Date) =>
    appointments
      .filter((a) => isSameDay(parseISO(`${a.date}T00:00:00`), day))
      .sort((a, b) => a.time.localeCompare(b.time));

  const openNew = (date?: string) => {
    setEditing(null);
    setDefaultDate(date);
    setDialogOpen(true);
  };
  const openEdit = (a: Appointment) => {
    setEditing(a);
    setDefaultDate(undefined);
    setDialogOpen(true);
  };

  const upcoming = [...appointments]
    .filter((a) => parseISO(`${a.date}T00:00:00`) >= new Date(new Date().setHours(0, 0, 0, 0)))
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
    .slice(0, 8);

  return (
    <div>
      <PageHeader title="Calendar" subtitle="Shoots, meetings and deadlines at a glance.">
        <Button onClick={() => openNew()} className="gap-1.5">
          <Plus className="h-4 w-4" /> Add Event
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        {/* Calendar grid */}
        <Card className="p-0 shadow-sm">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h2 className="text-lg font-bold">{format(cursor, "MMMM yyyy")}</h2>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={() => setCursor(new Date())}>
                Today
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCursor(subMonths(cursor, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCursor(addMonths(cursor, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 border-b bg-muted/30 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {WEEKDAYS.map((d) => (
              <div key={d} className="py-2">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {days.map((day) => {
              const dayEvents = eventsByDay(day);
              const inMonth = isSameMonth(day, cursor);
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => openNew(format(day, "yyyy-MM-dd"))}
                  className={cn(
                    "group min-h-[104px] border-b border-r p-1.5 text-left align-top transition-colors hover:bg-accent/40 [&:nth-child(7n)]:border-r-0",
                    !inMonth && "bg-muted/20 text-muted-foreground/50",
                  )}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                        isToday(day) && "bg-primary text-white",
                      )}
                    >
                      {format(day, "d")}
                    </span>
                    <Plus className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition group-hover:opacity-60" />
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <div
                        key={ev.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(ev);
                        }}
                        className="flex items-center gap-1 truncate rounded bg-white px-1.5 py-1 text-[11px] shadow-sm ring-1 ring-border transition hover:ring-primary/40"
                      >
                        <TypeDot type={ev.type} />
                        <span className="truncate font-medium">{formatTime(ev.time)}</span>
                        <span className="truncate text-muted-foreground">{ev.title}</span>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="px-1 text-[10px] font-medium text-muted-foreground">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Upcoming list */}
        <Card className="h-fit p-0 shadow-sm">
          <div className="border-b px-4 py-3">
            <h3 className="text-sm font-semibold">Upcoming</h3>
          </div>
          <div className="divide-y">
            {upcoming.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">No upcoming events</p>
            )}
            {upcoming.map((ev) => (
              <button
                key={ev.id}
                onClick={() => openEdit(ev)}
                className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-muted/40"
              >
                <div className="flex w-12 shrink-0 flex-col items-center rounded-md bg-accent px-2 py-1 text-center">
                  <span className="text-[10px] font-semibold uppercase text-accent-foreground">
                    {format(parseISO(`${ev.date}T00:00:00`), "MMM")}
                  </span>
                  <span className="text-base font-bold leading-none text-accent-foreground">
                    {format(parseISO(`${ev.date}T00:00:00`), "d")}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{ev.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatTime(ev.time)}
                    {ev.endTime && ` – ${formatTime(ev.endTime)}`}
                    {ev.location && ` · ${ev.location}`}
                  </div>
                  <div className="mt-1">
                    <StatusBadge status={ev.type} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <AppointmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        appointment={editing}
        defaultDate={defaultDate}
      />
    </div>
  );
}
