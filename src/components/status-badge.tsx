import { cn } from "@/lib/utils";

const COLOR_MAP: Record<string, string> = {
  // Lead statuses
  "New Enquiry": "bg-emerald-100 text-emerald-700 border-emerald-200",
  Contacted: "bg-sky-100 text-sky-700 border-sky-200",
  "Quote Sent": "bg-amber-100 text-amber-700 border-amber-200",
  "Follow Up": "bg-orange-100 text-orange-700 border-orange-200",
  Won: "bg-primary/15 text-primary border-primary/20",
  Lost: "bg-rose-100 text-rose-600 border-rose-200",
  // Job statuses
  Enquiry: "bg-slate-100 text-slate-600 border-slate-200",
  Pending: "bg-amber-100 text-amber-700 border-amber-200",
  Confirmed: "bg-sky-100 text-sky-700 border-sky-200",
  "In Progress": "bg-indigo-100 text-indigo-700 border-indigo-200",
  Editing: "bg-violet-100 text-violet-700 border-violet-200",
  Delivered: "bg-teal-100 text-teal-700 border-teal-200",
  Completed: "bg-primary/15 text-primary border-primary/20",
  Cancelled: "bg-slate-100 text-slate-500 border-slate-200",
  // Invoice statuses
  Draft: "bg-slate-100 text-slate-600 border-slate-200",
  Sent: "bg-sky-100 text-sky-700 border-sky-200",
  Paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Partial: "bg-amber-100 text-amber-700 border-amber-200",
  Overdue: "bg-rose-100 text-rose-600 border-rose-200",
  // Appointment types
  "Main Shoot": "bg-primary/15 text-primary border-primary/20",
  "Extra Shoot": "bg-teal-100 text-teal-700 border-teal-200",
  Appointment: "bg-slate-100 text-slate-600 border-slate-200",
  Meeting: "bg-sky-100 text-sky-700 border-sky-200",
  Deadline: "bg-rose-100 text-rose-600 border-rose-200",
};

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const color = COLOR_MAP[status] ?? "bg-slate-100 text-slate-600 border-slate-200";
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-semibold leading-5",
        color,
        className,
      )}
    >
      {status}
    </span>
  );
}

// Colored dot used in calendars / lists
const DOT_MAP: Record<string, string> = {
  "Main Shoot": "bg-primary",
  "Extra Shoot": "bg-teal-500",
  Appointment: "bg-amber-500",
  Meeting: "bg-sky-500",
  Deadline: "bg-rose-500",
};

export function TypeDot({ type, className }: { type: string; className?: string }) {
  return (
    <span
      className={cn("inline-block h-2.5 w-2.5 rounded-full", DOT_MAP[type] ?? "bg-slate-400", className)}
    />
  );
}
