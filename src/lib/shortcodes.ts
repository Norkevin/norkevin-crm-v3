import type { Client, Contract, Invoice, Job, StudioSettings } from "./types";
import { formatCurrency, formatDate, invoiceBalance, invoiceTotal } from "./format";

export interface ShortcodeContext {
  settings: StudioSettings;
  client?: Client;
  job?: Job;
  invoice?: Invoice;
  contract?: Contract;
}

export interface ShortcodeDef {
  code: string;
  label: string;
}

// Available shortcodes shown in the template editor / composer
export const SHORTCODES: ShortcodeDef[] = [
  { code: "%client_name%", label: "Client full name" },
  { code: "%client_first_name%", label: "Client first name" },
  { code: "%partner_name%", label: "Partner name" },
  { code: "%company_name%", label: "Your studio name" },
  { code: "%owner_name%", label: "Your name" },
  { code: "%job_type%", label: "Job type" },
  { code: "%job_name%", label: "Job name" },
  { code: "%event_date%", label: "Event / shoot date" },
  { code: "%location%", label: "Event location" },
  { code: "%portal_link%", label: "Client portal link" },
  { code: "%quote_link%", label: "View quote link" },
  { code: "%contract_link%", label: "View / sign contract link" },
  { code: "%invoice_link%", label: "View / pay invoice link" },
  { code: "%total%", label: "Document total" },
  { code: "%balance%", label: "Balance due" },
  { code: "%signature%", label: "Your email signature" },
];

function portalBase(settings: StudioSettings): string {
  const site = (settings.website ?? "").replace(/^https?:\/\//, "").replace(/\/$/, "");
  const domain = site || "portal.studioninja.co";
  return `https://${domain}/portal`;
}

export function applyShortcodes(text: string, ctx: ShortcodeContext): string {
  if (!text) return text;
  const { settings, client, job, invoice, contract } = ctx;
  const base = portalBase(settings);
  const jobRef = job?.id ?? "job";

  const map: Record<string, string> = {
    "%client_name%": client ? `${client.firstName} ${client.lastName}`.trim() : "there",
    "%client_first_name%": client?.firstName ?? "there",
    "%partner_name%": client?.partnerName ?? "",
    "%company_name%": settings.studioName,
    "%owner_name%": settings.ownerName,
    "%job_type%": job?.jobType ?? "session",
    "%job_name%": job?.name ?? "",
    "%event_date%": job?.shootDate ? formatDate(job.shootDate) : "",
    "%location%": job?.location ?? "",
    "%portal_link%": `${base}/${jobRef}`,
    "%quote_link%": `${base}/${jobRef}/quote${invoice ? `/${invoice.id}` : ""}`,
    "%contract_link%": `${base}/${jobRef}/contract${contract ? `/${contract.id}` : ""}`,
    "%invoice_link%": `${base}/${jobRef}/invoice${invoice ? `/${invoice.id}` : ""}`,
    "%total%": invoice ? formatCurrency(invoiceTotal(invoice), settings.currency) : "",
    "%balance%": invoice ? formatCurrency(invoiceBalance(invoice), settings.currency) : "",
    "%signature%": settings.emailSignature ?? settings.studioName,
  };

  return text.replace(/%[a-z_]+%/g, (m) => (m in map ? map[m] : m));
}
