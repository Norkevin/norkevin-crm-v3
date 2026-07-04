// ─────────────────────────────────────────────────────────────
// Studio Ninja CRM — Data model types
// ─────────────────────────────────────────────────────────────

export type LeadStatus =
  | "New Enquiry"
  | "Contacted"
  | "Quote Sent"
  | "Follow Up"
  | "Won"
  | "Lost";

export const LEAD_STATUSES: LeadStatus[] = [
  "New Enquiry",
  "Contacted",
  "Quote Sent",
  "Follow Up",
  "Won",
  "Lost",
];

export type JobStatus =
  | "Enquiry"
  | "Pending"
  | "Confirmed"
  | "In Progress"
  | "Editing"
  | "Delivered"
  | "Completed"
  | "Cancelled";

export const JOB_STATUSES: JobStatus[] = [
  "Enquiry",
  "Pending",
  "Confirmed",
  "In Progress",
  "Editing",
  "Delivered",
  "Completed",
  "Cancelled",
];

export type InvoiceStatus = "Draft" | "Sent" | "Paid" | "Partial" | "Overdue";

export const INVOICE_STATUSES: InvoiceStatus[] = [
  "Draft",
  "Sent",
  "Paid",
  "Partial",
  "Overdue",
];

export type DocType = "Invoice" | "Quote";

export type AppointmentType =
  | "Main Shoot"
  | "Extra Shoot"
  | "Appointment"
  | "Meeting"
  | "Deadline";

export const APPOINTMENT_TYPES: AppointmentType[] = [
  "Main Shoot",
  "Extra Shoot",
  "Appointment",
  "Meeting",
  "Deadline",
];

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  partnerName?: string;
  company?: string;
  address?: string;
  notes?: string;
  createdAt: string;
}

export type WorkflowStage = "Lead" | "Production" | "Post-Production" | "Completed";
export const WORKFLOW_STAGES: WorkflowStage[] = ["Lead", "Production", "Post-Production", "Completed"];

// Task types drive what the automation engine does at each step
export type WorkflowTaskType =
  | "email" // send / auto-send an email (uses an email template)
  | "contract" // send / auto-send a contract
  | "questionnaire" // send / auto-send a questionnaire
  | "trigger" // auto-completes on a client action (accept quote / sign / pay)
  | "event" // physical event with date & location (e.g. Main Shoot)
  | "task"; // generic manual to-do

export const WORKFLOW_TASK_TYPES: WorkflowTaskType[] = [
  "email",
  "contract",
  "questionnaire",
  "trigger",
  "event",
  "task",
];

export interface WorkflowTask {
  id: string;
  title: string;
  done: boolean;
  dueDate?: string;
  completedAt?: string;
  stage?: WorkflowStage;
  auto?: boolean; // automated vs manual
  type?: WorkflowTaskType;
  emailTemplateId?: string; // linked template for email/contract/questionnaire tasks
}

export interface Lead {
  id: string;
  clientId?: string;
  name: string;
  email: string;
  phone?: string;
  jobType: string;
  status: LeadStatus;
  source: string;
  value: number;
  mailStatus?: string;
  nextTask?: string;
  eventDate?: string;
  notes?: string;
  createdAt: string;
}

export interface Job {
  id: string;
  clientId: string;
  name: string;
  jobType: string;
  status: JobStatus;
  shootDate?: string;
  shootTime?: string;
  value: number;
  tasks: WorkflowTask[];
  nextTask?: string;
  location?: string;
  address?: string;
  source?: string;
  workflowName?: string;
  notes?: string;
  files?: FileAttachment[];
  createdAt: string;
}

export interface Appointment {
  id: string;
  title: string;
  date: string; // yyyy-MM-dd
  time: string; // HH:mm
  endTime?: string;
  type: AppointmentType;
  clientId?: string;
  jobId?: string;
  location?: string;
  notes?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface PaymentRecord {
  id: string;
  amount: number;
  date: string;
  method: string;
  note?: string;
}

export interface Invoice {
  id: string;
  number: string;
  type: DocType;
  clientId: string;
  jobId?: string;
  items: InvoiceItem[];
  taxRate: number; // %
  discount: number; // absolute currency amount
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  payments: PaymentRecord[];
  notes?: string;
}

// ── Contracts ──
export type ContractStatus = "Draft" | "Sent" | "Signed" | "Declined";
export const CONTRACT_STATUSES: ContractStatus[] = ["Draft", "Sent", "Signed", "Declined"];

export interface Contract {
  id: string;
  jobId: string;
  clientId: string;
  title: string;
  body: string;
  status: ContractStatus;
  createdAt: string;
  sentAt?: string;
  signedAt?: string;
  signatureName?: string;
}

// ── Questionnaires ──
export type QuestionnaireStatus = "Draft" | "Sent" | "Completed";
export const QUESTIONNAIRE_STATUSES: QuestionnaireStatus[] = ["Draft", "Sent", "Completed"];

export interface QuestionnaireItem {
  id: string;
  question: string;
  answer?: string;
}

export interface Questionnaire {
  id: string;
  jobId: string;
  clientId: string;
  title: string;
  status: QuestionnaireStatus;
  items: QuestionnaireItem[];
  createdAt: string;
  completedAt?: string;
}

// ── Email / communication ──
export interface EmailLog {
  id: string;
  clientId?: string;
  jobId?: string;
  to: string;
  subject: string;
  body: string;
  sentAt: string; // ISO datetime
  via: "Gmail" | "Logged";
  openedAt?: string; // email open tracking
  clickedAt?: string; // link click tracking
  direction?: "outbound" | "inbound";
}

// ── File attachments (stored as metadata + optional data URL) ──
export interface FileAttachment {
  id: string;
  name: string;
  size: number; // bytes
  type: string; // mime
  url?: string; // data URL (small files) or external link
  addedAt: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  workflowTemplateId?: string; // optional: template tied to a specific workflow
}

export interface WorkflowTemplateTask {
  id: string;
  title: string;
  offsetDays: number; // relative to shoot date
  category: "Fundamentals" | "Client Experience" | "Pre-Shoot" | "Post-Shoot";
  stage?: WorkflowStage;
  type?: WorkflowTaskType;
  automated?: boolean; // auto-send vs manual
  emailTemplateId?: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  tasks: WorkflowTemplateTask[];
}

// ── Products & Packages ──
export type ProductCategory = "Package" | "Product" | "Service";
export const PRODUCT_CATEGORIES: ProductCategory[] = ["Package", "Product", "Service"];

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: ProductCategory;
  taxable: boolean;
}

// ── Contract & Questionnaire templates ──
export interface ContractTemplate {
  id: string;
  name: string;
  body: string;
}

export interface QuestionnaireTemplate {
  id: string;
  name: string;
  questions: string[];
}

// ── Booking / client experience sub-config ──
export interface SessionType {
  id: string;
  name: string;
  duration: number; // minutes
  price: number;
}

export interface ClientPortalConfig {
  welcomeMessage: string;
  brandColor: string;
  showQuotes: boolean;
  showContracts: boolean;
  showInvoices: boolean;
  showQuestionnaires: boolean;
}

export interface BookingConfig {
  enabled: boolean;
  sessionTypes: SessionType[];
  bufferMinutes: number;
  leadTimeDays: number;
}

export interface ContactFormConfig {
  fields: string[];
  redirectUrl: string;
  jobTypesEnabled: boolean;
}

export interface StudioSettings {
  studioName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  website?: string;
  logoUrl?: string;
  currency: string; // symbol
  currencyCode: string; // e.g. USD
  taxName: string; // e.g. Tax / VAT / GST / IVA
  defaultTaxRate: number;
  jobTypes: string[];
  leadSources: string[];
  gmailAddress?: string; // connected Gmail account for compose deep-links
  emailProvider: "Gmail" | "SMTP" | "None";
  emailSignature?: string;
  // Date, time & calendar
  dateFormat: string;
  timeFormat: "12h" | "24h";
  weekStart: "Sunday" | "Monday";
  googleCalendarConnected: boolean;
  // Invoice & payment
  invoicePrefix: string;
  quotePrefix: string;
  depositPercent: number;
  paymentTermsDays: number;
  autoReminders: boolean;
  sendReceipts: boolean;
  paymentMethods: string[];
  stripeConnected: boolean;
  invoiceTerms: string;
  quoteTerms: string;
  // Client experience
  clientPortal: ClientPortalConfig;
  booking: BookingConfig;
  contactForm: ContactFormConfig;
}

export interface CRMData {
  clients: Client[];
  leads: Lead[];
  jobs: Job[];
  appointments: Appointment[];
  invoices: Invoice[];
  contracts: Contract[];
  questionnaires: Questionnaire[];
  emails: EmailLog[];
  emailTemplates: EmailTemplate[];
  workflowTemplates: WorkflowTemplate[];
  products: Product[];
  contractTemplates: ContractTemplate[];
  questionnaireTemplates: QuestionnaireTemplate[];
  settings: StudioSettings;
}
