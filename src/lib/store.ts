import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Appointment,
  Client,
  Contract,
  ContractTemplate,
  CRMData,
  EmailLog,
  EmailTemplate,
  FileAttachment,
  Invoice,
  Job,
  Lead,
  Product,
  Questionnaire,
  QuestionnaireTemplate,
  StudioSettings,
  WorkflowStage,
  WorkflowTaskType,
  WorkflowTemplate,
} from "./types";
import { makeSeedData } from "./seed";
import { uid } from "./format";

interface CRMState extends CRMData {
  hydrated: boolean;
  setHydrated: (v: boolean) => void;

  // Clients
  addClient: (c: Omit<Client, "id" | "createdAt">) => Client;
  updateClient: (id: string, patch: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  // Leads
  addLead: (l: Omit<Lead, "id" | "createdAt">) => Lead;
  updateLead: (id: string, patch: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  convertLeadToJob: (id: string) => void;

  // Jobs
  addJob: (j: Omit<Job, "id" | "createdAt">) => Job;
  updateJob: (id: string, patch: Partial<Job>) => void;
  deleteJob: (id: string) => void;
  toggleJobTask: (jobId: string, taskId: string) => void;
  addJobTask: (jobId: string, title: string, stage?: WorkflowStage, type?: WorkflowTaskType) => void;
  deleteJobTask: (jobId: string, taskId: string) => void;

  // Appointments
  addAppointment: (a: Omit<Appointment, "id">) => Appointment;
  updateAppointment: (id: string, patch: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;

  // Invoices
  addInvoice: (i: Omit<Invoice, "id">) => Invoice;
  updateInvoice: (id: string, patch: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  addPayment: (invoiceId: string, amount: number, method: string, note?: string) => void;

  // Contracts
  addContract: (c: Omit<Contract, "id" | "createdAt">) => Contract;
  updateContract: (id: string, patch: Partial<Contract>) => void;
  deleteContract: (id: string) => void;
  signContract: (id: string, signatureName: string) => void;

  // Questionnaires
  addQuestionnaire: (q: Omit<Questionnaire, "id" | "createdAt">) => Questionnaire;
  updateQuestionnaire: (id: string, patch: Partial<Questionnaire>) => void;
  deleteQuestionnaire: (id: string) => void;

  // Emails
  logEmail: (e: Omit<EmailLog, "id">) => EmailLog;
  deleteEmail: (id: string) => void;

  // Email templates
  addEmailTemplate: (t: Omit<EmailTemplate, "id">) => void;
  updateEmailTemplate: (id: string, patch: Partial<EmailTemplate>) => void;
  deleteEmailTemplate: (id: string) => void;

  // Job files
  addJobFile: (jobId: string, file: Omit<FileAttachment, "id" | "addedAt">) => void;
  deleteJobFile: (jobId: string, fileId: string) => void;

  // Settings & workflow templates
  updateSettings: (patch: Partial<StudioSettings>) => void;
  addWorkflowTemplate: (t: Omit<WorkflowTemplate, "id">) => void;
  updateWorkflowTemplate: (id: string, patch: Partial<WorkflowTemplate>) => void;
  deleteWorkflowTemplate: (id: string) => void;

  // Products & packages
  addProduct: (p: Omit<Product, "id">) => void;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Contract templates
  addContractTemplate: (t: Omit<ContractTemplate, "id">) => void;
  updateContractTemplate: (id: string, patch: Partial<ContractTemplate>) => void;
  deleteContractTemplate: (id: string) => void;

  // Questionnaire templates
  addQuestionnaireTemplate: (t: Omit<QuestionnaireTemplate, "id">) => void;
  updateQuestionnaireTemplate: (id: string, patch: Partial<QuestionnaireTemplate>) => void;
  deleteQuestionnaireTemplate: (id: string) => void;

  // Data management
  exportData: () => string;
  importData: (json: string) => boolean;
  resetData: () => void;
  clearAll: () => void;
}

const seed = makeSeedData();

export const useCRM = create<CRMState>()(
  persist(
    (set, get) => ({
      ...seed,
      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),

      // ── Clients ──
      addClient: (c) => {
        const client: Client = { ...c, id: uid("c"), createdAt: new Date().toISOString().slice(0, 10) };
        set((s) => ({ clients: [client, ...s.clients] }));
        return client;
      },
      updateClient: (id, patch) =>
        set((s) => ({ clients: s.clients.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
      deleteClient: (id) =>
        set((s) => ({ clients: s.clients.filter((c) => c.id !== id) })),

      // ── Leads ──
      addLead: (l) => {
        const lead: Lead = { ...l, id: uid("l"), createdAt: new Date().toISOString().slice(0, 10) };
        set((s) => ({ leads: [lead, ...s.leads] }));
        return lead;
      },
      updateLead: (id, patch) =>
        set((s) => ({ leads: s.leads.map((l) => (l.id === id ? { ...l, ...patch } : l)) })),
      deleteLead: (id) => set((s) => ({ leads: s.leads.filter((l) => l.id !== id) })),
      convertLeadToJob: (id) => {
        const lead = get().leads.find((l) => l.id === id);
        if (!lead) return;
        let clientId = lead.clientId;
        // Create a client if not linked
        if (!clientId) {
          const [firstName, ...rest] = lead.name.replace(/enquiry/i, "").trim().split(" ");
          const client = get().addClient({
            firstName: firstName || lead.name,
            lastName: rest.join(" "),
            email: lead.email,
            phone: lead.phone || "",
          });
          clientId = client.id;
        }
        get().addJob({
          clientId,
          name: lead.name.replace(/enquiry/i, "").trim() || lead.name,
          jobType: lead.jobType,
          status: "Confirmed",
          shootDate: lead.eventDate,
          value: lead.value,
          tasks: [],
          nextTask: "Send welcome email",
        });
        get().updateLead(id, { status: "Won" });
      },

      // ── Jobs ──
      addJob: (j) => {
        const job: Job = { ...j, id: uid("j"), createdAt: new Date().toISOString().slice(0, 10) };
        set((s) => ({ jobs: [job, ...s.jobs] }));
        return job;
      },
      updateJob: (id, patch) =>
        set((s) => ({ jobs: s.jobs.map((j) => (j.id === id ? { ...j, ...patch } : j)) })),
      deleteJob: (id) => set((s) => ({ jobs: s.jobs.filter((j) => j.id !== id) })),
      toggleJobTask: (jobId, taskId) =>
        set((s) => ({
          jobs: s.jobs.map((j) =>
            j.id === jobId
              ? {
                  ...j,
                  tasks: j.tasks.map((t) =>
                    t.id === taskId
                      ? {
                          ...t,
                          done: !t.done,
                          completedAt: !t.done ? new Date().toISOString().slice(0, 10) : undefined,
                        }
                      : t,
                  ),
                }
              : j,
          ),
        })),
      addJobTask: (jobId, title, stage, type) =>
        set((s) => ({
          jobs: s.jobs.map((j) =>
            j.id === jobId
              ? { ...j, tasks: [...j.tasks, { id: uid("t"), title, done: false, stage, type }] }
              : j,
          ),
        })),
      deleteJobTask: (jobId, taskId) =>
        set((s) => ({
          jobs: s.jobs.map((j) =>
            j.id === jobId ? { ...j, tasks: j.tasks.filter((t) => t.id !== taskId) } : j,
          ),
        })),

      // ── Appointments ──
      addAppointment: (a) => {
        const appt: Appointment = { ...a, id: uid("a") };
        set((s) => ({ appointments: [...s.appointments, appt] }));
        return appt;
      },
      updateAppointment: (id, patch) =>
        set((s) => ({ appointments: s.appointments.map((a) => (a.id === id ? { ...a, ...patch } : a)) })),
      deleteAppointment: (id) =>
        set((s) => ({ appointments: s.appointments.filter((a) => a.id !== id) })),

      // ── Invoices ──
      addInvoice: (i) => {
        const invoice: Invoice = { ...i, id: uid("inv") };
        set((s) => ({ invoices: [invoice, ...s.invoices] }));
        return invoice;
      },
      updateInvoice: (id, patch) =>
        set((s) => ({ invoices: s.invoices.map((i) => (i.id === id ? { ...i, ...patch } : i)) })),
      deleteInvoice: (id) => set((s) => ({ invoices: s.invoices.filter((i) => i.id !== id) })),
      addPayment: (invoiceId, amount, method, note) =>
        set((s) => {
          const today = new Date().toISOString().slice(0, 10);
          let triggerJobId: string | undefined;
          const invoices = s.invoices.map((inv) => {
            if (inv.id !== invoiceId) return inv;
            const payments = [...inv.payments, { id: uid("pay"), amount, method, note, date: today }];
            const subtotal = inv.items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);
            const total = subtotal - inv.discount + ((subtotal - inv.discount) * inv.taxRate) / 100;
            const paid = payments.reduce((sum, p) => sum + p.amount, 0);
            const status = paid >= total ? "Paid" : paid > 0 ? "Partial" : inv.status;
            triggerJobId = inv.jobId;
            return { ...inv, payments, status };
          });
          const jobs = triggerJobId
            ? s.jobs.map((j) => {
                if (j.id !== triggerJobId) return j;
                const tasks = j.tasks.map((t) =>
                  t.type === "trigger" && !t.done && /accept|deposit|booking|balance|pay/i.test(t.title)
                    ? { ...t, done: true, completedAt: today }
                    : t,
                );
                const status = (["Enquiry", "Pending"] as string[]).includes(j.status) ? "Confirmed" : j.status;
                return { ...j, tasks, status };
              })
            : s.jobs;
          return { invoices, jobs };
        }),

      // ── Contracts ──
      addContract: (c) => {
        const contract: Contract = { ...c, id: uid("con"), createdAt: new Date().toISOString().slice(0, 10) };
        set((s) => ({ contracts: [contract, ...s.contracts] }));
        return contract;
      },
      updateContract: (id, patch) =>
        set((s) => ({ contracts: s.contracts.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
      deleteContract: (id) => set((s) => ({ contracts: s.contracts.filter((c) => c.id !== id) })),
      signContract: (id, signatureName) =>
        set((s) => {
          const today = new Date().toISOString().slice(0, 10);
          const contract = s.contracts.find((c) => c.id === id);
          const contracts = s.contracts.map((c) =>
            c.id === id ? { ...c, status: "Signed" as const, signatureName, signedAt: today } : c,
          );
          if (!contract) return { contracts };
          const jobs = s.jobs.map((j) => {
            if (j.id !== contract.jobId) return j;
            const tasks = j.tasks.map((t) =>
              t.type === "trigger" && !t.done && /sign|contract|accept/i.test(t.title)
                ? { ...t, done: true, completedAt: today }
                : t,
            );
            const status = (["Enquiry", "Pending"] as string[]).includes(j.status) ? "Confirmed" : j.status;
            return { ...j, tasks, status };
          });
          return { contracts, jobs };
        }),

      // ── Questionnaires ──
      addQuestionnaire: (q) => {
        const questionnaire: Questionnaire = { ...q, id: uid("qn"), createdAt: new Date().toISOString().slice(0, 10) };
        set((s) => ({ questionnaires: [questionnaire, ...s.questionnaires] }));
        return questionnaire;
      },
      updateQuestionnaire: (id, patch) =>
        set((s) => ({ questionnaires: s.questionnaires.map((q) => (q.id === id ? { ...q, ...patch } : q)) })),
      deleteQuestionnaire: (id) =>
        set((s) => ({ questionnaires: s.questionnaires.filter((q) => q.id !== id) })),

      // ── Emails ──
      logEmail: (e) => {
        const email: EmailLog = { ...e, id: uid("em") };
        set((s) => ({ emails: [email, ...s.emails] }));
        return email;
      },
      deleteEmail: (id) => set((s) => ({ emails: s.emails.filter((e) => e.id !== id) })),

      // ── Email templates ──
      addEmailTemplate: (t) =>
        set((s) => ({ emailTemplates: [...s.emailTemplates, { ...t, id: uid("emt") }] })),
      updateEmailTemplate: (id, patch) =>
        set((s) => ({ emailTemplates: s.emailTemplates.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
      deleteEmailTemplate: (id) =>
        set((s) => ({ emailTemplates: s.emailTemplates.filter((t) => t.id !== id) })),

      // ── Job files ──
      addJobFile: (jobId, file) =>
        set((s) => ({
          jobs: s.jobs.map((j) =>
            j.id === jobId
              ? {
                  ...j,
                  files: [
                    ...(j.files ?? []),
                    { ...file, id: uid("f"), addedAt: new Date().toISOString().slice(0, 10) },
                  ],
                }
              : j,
          ),
        })),
      deleteJobFile: (jobId, fileId) =>
        set((s) => ({
          jobs: s.jobs.map((j) =>
            j.id === jobId ? { ...j, files: (j.files ?? []).filter((f) => f.id !== fileId) } : j,
          ),
        })),

      // ── Settings & templates ──
      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      addWorkflowTemplate: (t) =>
        set((s) => ({ workflowTemplates: [...s.workflowTemplates, { ...t, id: uid("wf") }] })),
      updateWorkflowTemplate: (id, patch) =>
        set((s) => ({
          workflowTemplates: s.workflowTemplates.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      deleteWorkflowTemplate: (id) =>
        set((s) => ({ workflowTemplates: s.workflowTemplates.filter((t) => t.id !== id) })),

      // ── Products & packages ──
      addProduct: (p) => set((s) => ({ products: [...s.products, { ...p, id: uid("pr") }] })),
      updateProduct: (id, patch) =>
        set((s) => ({ products: s.products.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
      deleteProduct: (id) => set((s) => ({ products: s.products.filter((p) => p.id !== id) })),

      // ── Contract templates ──
      addContractTemplate: (t) =>
        set((s) => ({ contractTemplates: [...s.contractTemplates, { ...t, id: uid("ct") }] })),
      updateContractTemplate: (id, patch) =>
        set((s) => ({ contractTemplates: s.contractTemplates.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
      deleteContractTemplate: (id) =>
        set((s) => ({ contractTemplates: s.contractTemplates.filter((t) => t.id !== id) })),

      // ── Questionnaire templates ──
      addQuestionnaireTemplate: (t) =>
        set((s) => ({ questionnaireTemplates: [...s.questionnaireTemplates, { ...t, id: uid("qt") }] })),
      updateQuestionnaireTemplate: (id, patch) =>
        set((s) => ({
          questionnaireTemplates: s.questionnaireTemplates.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      deleteQuestionnaireTemplate: (id) =>
        set((s) => ({ questionnaireTemplates: s.questionnaireTemplates.filter((t) => t.id !== id) })),

      // ── Data management ──
      exportData: () => {
        const {
          clients, leads, jobs, appointments, invoices, contracts, questionnaires,
          emails, emailTemplates, workflowTemplates, products, contractTemplates,
          questionnaireTemplates, settings,
        } = get();
        return JSON.stringify(
          {
            clients, leads, jobs, appointments, invoices, contracts, questionnaires,
            emails, emailTemplates, workflowTemplates, products, contractTemplates,
            questionnaireTemplates, settings,
            _exportedAt: new Date().toISOString(),
          },
          null,
          2,
        );
      },
      importData: (json) => {
        try {
          const data = JSON.parse(json) as Partial<CRMData>;
          if (!data || typeof data !== "object") return false;
          set((s) => ({
            clients: data.clients ?? s.clients,
            leads: data.leads ?? s.leads,
            jobs: data.jobs ?? s.jobs,
            appointments: data.appointments ?? s.appointments,
            invoices: data.invoices ?? s.invoices,
            contracts: data.contracts ?? s.contracts,
            questionnaires: data.questionnaires ?? s.questionnaires,
            emails: data.emails ?? s.emails,
            emailTemplates: data.emailTemplates ?? s.emailTemplates,
            workflowTemplates: data.workflowTemplates ?? s.workflowTemplates,
            products: data.products ?? s.products,
            contractTemplates: data.contractTemplates ?? s.contractTemplates,
            questionnaireTemplates: data.questionnaireTemplates ?? s.questionnaireTemplates,
            settings: data.settings ?? s.settings,
          }));
          return true;
        } catch {
          return false;
        }
      },
      resetData: () => set({ ...makeSeedData() }),
      clearAll: () =>
        set((s) => ({
          clients: [],
          leads: [],
          jobs: [],
          appointments: [],
          invoices: [],
          contracts: [],
          questionnaires: [],
          emails: [],
          workflowTemplates: s.workflowTemplates,
          emailTemplates: s.emailTemplates,
          products: s.products,
          contractTemplates: s.contractTemplates,
          questionnaireTemplates: s.questionnaireTemplates,
        })),
    }),
    {
      name: "studio-ninja-crm",
      version: 4,
      // Schema expanded (typed workflow tasks, shortcodes, automation triggers).
      // Reset to the richer seed dataset when upgrading from an older version.
      migrate: () => makeSeedData(),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
