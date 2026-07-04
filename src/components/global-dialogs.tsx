"use client";

import { useUI } from "@/lib/ui-store";
import { LeadDialog } from "@/components/dialogs/lead-dialog";
import { JobDialog } from "@/components/dialogs/job-dialog";
import { ClientDialog } from "@/components/dialogs/client-dialog";
import { InvoiceDialog } from "@/components/dialogs/invoice-dialog";
import { AppointmentDialog } from "@/components/dialogs/appointment-dialog";

export function GlobalDialogs() {
  const { quickDialog, closeQuick } = useUI();

  return (
    <>
      <LeadDialog open={quickDialog === "lead"} onOpenChange={(v) => !v && closeQuick()} lead={null} />
      <JobDialog open={quickDialog === "job"} onOpenChange={(v) => !v && closeQuick()} job={null} />
      <ClientDialog open={quickDialog === "client"} onOpenChange={(v) => !v && closeQuick()} client={null} />
      <InvoiceDialog
        open={quickDialog === "invoice"}
        onOpenChange={(v) => !v && closeQuick()}
        invoice={null}
        defaultType="Invoice"
      />
      <InvoiceDialog
        open={quickDialog === "quote"}
        onOpenChange={(v) => !v && closeQuick()}
        invoice={null}
        defaultType="Quote"
      />
      <AppointmentDialog
        open={quickDialog === "appointment"}
        onOpenChange={(v) => !v && closeQuick()}
        appointment={null}
      />
    </>
  );
}
