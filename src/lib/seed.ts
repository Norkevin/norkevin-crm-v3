import type {
  CRMData,
  WorkflowTemplate,
  StudioSettings,
} from "./types";

// Helper to build ISO date strings relative to today
const now = new Date();
function daysFrom(offset: number): string {
  const d = new Date(now);
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

function daysFromTime(offset: number, hour = 9): string {
  const d = new Date(now);
  d.setDate(d.getDate() + offset);
  d.setHours(hour, Math.floor(Math.random() * 55), 0, 0);
  return d.toISOString();
}

export const DEFAULT_SETTINGS: StudioSettings = {
  studioName: "Norkevin Photography",
  ownerName: "Kevin Lemus",
  email: "norkevinfoto@gmail.com",
  phone: "+502 3164 8254",
  address: "Antigua Guatemala, Sacatepequez",
  website: "www.norkevinphoto.com",
  currency: "Q",
  currencyCode: "USD",
  taxName: "Tax",
  defaultTaxRate: 10,
  gmailAddress: "hello@mystudio.co",
  emailProvider: "Gmail",
  emailSignature: "Warm regards,\nAlex Rivera\nMyStudio Photography\nwww.mystudio.co",
  dateFormat: "MMM D, YYYY",
  timeFormat: "12h",
  weekStart: "Sunday",
  googleCalendarConnected: false,
  invoicePrefix: "INV-",
  quotePrefix: "QUO-",
  depositPercent: 30,
  paymentTermsDays: 14,
  autoReminders: true,
  sendReceipts: true,
  paymentMethods: ["Card", "Bank Transfer", "Cash"],
  stripeConnected: false,
  invoiceTerms: "Payment due within 14 days. A 30% non-refundable retainer secures your date. Thank you for your business!",
  quoteTerms: "This quote is valid for 30 days. To book, please sign the contract and pay the retainer.",
  clientPortal: {
    welcomeMessage: "Welcome to your private portal! Here you can review your quotes, sign contracts and pay invoices.",
    brandColor: "#089d5a",
    showQuotes: true,
    showContracts: true,
    showInvoices: true,
    showQuestionnaires: true,
  },
  booking: {
    enabled: true,
    bufferMinutes: 30,
    leadTimeDays: 2,
    sessionTypes: [
      { id: "st1", name: "Mini Session (30 min)", duration: 30, price: 250 },
      { id: "st2", name: "Portrait Session (1 hr)", duration: 60, price: 450 },
      { id: "st3", name: "Family Session (1.5 hr)", duration: 90, price: 650 },
    ],
  },
  contactForm: {
    fields: ["Name", "Email", "Phone", "Event date", "Event type", "Message"],
    redirectUrl: "https://www.mystudio.co/thank-you",
    jobTypesEnabled: true,
  },
  jobTypes: [
    "Wedding",
    "Engagement",
    "Portrait",
    "Family",
    "Newborn",
    "Corporate",
    "Event",
    "Product",
  ],
  leadSources: [
    "Referral",
    "Google",
    "Social",
    "Instagram",
    "Directory",
    "Website",
    "Expo",
    "Advertising",
  ],
};

export const DEFAULT_WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: "wf-wedding",
    name: "Wedding Workflow",
    tasks: [
      { id: "t0", title: "Lead created", offsetDays: -95, category: "Fundamentals", stage: "Lead", type: "trigger", automated: true },
      { id: "t1", title: "Send welcome email & pricing", offsetDays: -90, category: "Fundamentals", stage: "Lead", type: "email", automated: true, emailTemplateId: "em-welcome" },
      { id: "t1b", title: "Follow up with lead", offsetDays: -87, category: "Client Experience", stage: "Lead", type: "email", automated: true, emailTemplateId: "em-quote" },
      { id: "t2", title: "Send quote & contract", offsetDays: -85, category: "Client Experience", stage: "Lead", type: "contract", automated: false },
      { id: "tacc", title: "Job accepted", offsetDays: -83, category: "Fundamentals", stage: "Production", type: "trigger", automated: true },
      { id: "t2b", title: "Booking confirmed email", offsetDays: -82, category: "Client Experience", stage: "Production", type: "email", automated: true, emailTemplateId: "em-booking" },
      { id: "t3", title: "Collect booking deposit", offsetDays: -80, category: "Fundamentals", stage: "Production", type: "trigger", automated: true },
      { id: "t4", title: "Send questionnaire", offsetDays: -30, category: "Client Experience", stage: "Production", type: "questionnaire", automated: true },
      { id: "t5", title: "Confirm timeline & shot list", offsetDays: -7, category: "Pre-Shoot", stage: "Production", type: "task", automated: false },
      { id: "t6", title: "Charge final balance", offsetDays: -3, category: "Fundamentals", stage: "Production", type: "trigger", automated: true },
      { id: "tshoot", title: "Main Shoot", offsetDays: 0, category: "Pre-Shoot", stage: "Production", type: "event", automated: false },
      { id: "t7", title: "Backup & cull images", offsetDays: 2, category: "Post-Shoot", stage: "Post-Production", type: "task", automated: false },
      { id: "t9", title: "Deliver final gallery", offsetDays: 30, category: "Post-Shoot", stage: "Post-Production", type: "email", automated: true, emailTemplateId: "em-gallery" },
      { id: "t10", title: "Request review", offsetDays: 40, category: "Post-Shoot", stage: "Completed", type: "email", automated: true },
    ],
  },
  {
    id: "wf-portrait",
    name: "Portrait Session Workflow",
    tasks: [
      { id: "p0", title: "Lead created", offsetDays: -16, category: "Fundamentals", stage: "Lead", type: "trigger", automated: true },
      { id: "p1", title: "Send welcome email", offsetDays: -14, category: "Fundamentals", stage: "Lead", type: "email", automated: true, emailTemplateId: "em-welcome" },
      { id: "p2", title: "Send invoice & contract", offsetDays: -10, category: "Client Experience", stage: "Lead", type: "contract", automated: false },
      { id: "pacc", title: "Job accepted", offsetDays: -9, category: "Fundamentals", stage: "Production", type: "trigger", automated: true },
      { id: "p3", title: "Confirm session details", offsetDays: -2, category: "Pre-Shoot", stage: "Production", type: "task", automated: false },
      { id: "pshoot", title: "Session", offsetDays: 0, category: "Pre-Shoot", stage: "Production", type: "event", automated: false },
      { id: "p4", title: "Cull & edit images", offsetDays: 3, category: "Post-Shoot", stage: "Post-Production", type: "task", automated: false },
      { id: "p5", title: "Deliver gallery", offsetDays: 10, category: "Post-Shoot", stage: "Post-Production", type: "email", automated: true, emailTemplateId: "em-gallery" },
      { id: "p6", title: "Request review", offsetDays: 15, category: "Post-Shoot", stage: "Completed", type: "email", automated: true },
    ],
  },
];

export const DEFAULT_EMAIL_TEMPLATES = [
  {
    id: "em-welcome",
    name: "Welcome / Enquiry reply",
    subject: "Thank you for your enquiry, %client_first_name%!",
    body:
      "Hi %client_first_name%,\n\nThank you so much for reaching out to %company_name% about your %job_type%! I'd love to be part of your day.\n\nI've attached my pricing guide — let me know if you'd like to hop on a quick call to chat through the details.\n\n%signature%",
  },
  {
    id: "em-quote",
    name: "Quote follow-up",
    subject: "Your quote from %company_name%",
    body:
      "Hi %client_first_name%,\n\nJust following up on the quote I sent through. Do you have any questions? I'd be happy to help.\n\nCLICK TO VIEW YOUR QUOTE: %quote_link%\n\nTo lock in your date, simply review, sign the contract and pay the deposit online.\n\n%signature%",
  },
  {
    id: "em-booking",
    name: "Booking confirmation",
    subject: "You're booked in!",
    body:
      "Hi %client_first_name%,\n\nWonderful news — your %job_type% is officially booked! Thank you for choosing %company_name%.\n\nNext, please complete your questionnaire so I can start planning: %portal_link%\n\n%signature%",
  },
  {
    id: "em-gallery",
    name: "Gallery delivery",
    subject: "Your photos are ready",
    body:
      "Hi %client_first_name%,\n\nYour gallery is ready and I couldn't be more excited to share it! View & download here: %portal_link%\n\nIt was a joy working with you.\n\n%signature%",
  },
];

export const DEFAULT_CONTRACT_BODY =
  "PHOTOGRAPHY SERVICES AGREEMENT\n\nThis agreement is made between {studio} (\"Photographer\") and {client} (\"Client\").\n\n1. SERVICES — The Photographer agrees to provide photography services for the event described in the associated job.\n\n2. BOOKING & PAYMENT — A non-refundable retainer is required to secure the date. The remaining balance is due prior to the event date.\n\n3. CANCELLATION — In the event of cancellation, the retainer is non-refundable.\n\n4. COPYRIGHT — The Photographer retains copyright of all images. The Client is granted a personal-use license.\n\n5. DELIVERY — Final edited images will be delivered via online gallery within the agreed timeframe.\n\nBy signing below, both parties agree to the terms above.";

export const DEFAULT_PRODUCTS = [
  { id: "pr1", name: "Silver Wedding Collection", description: "8 hours coverage · 400+ edited images · online gallery", price: 3200, category: "Package" as const, taxable: true },
  { id: "pr2", name: "Gold Wedding Collection", description: "10 hours · 2 photographers · engagement session · album", price: 5800, category: "Package" as const, taxable: true },
  { id: "pr3", name: "Portrait Session", description: "1 hour · 1 location · 25 edited images", price: 450, category: "Package" as const, taxable: true },
  { id: "pr4", name: "Second Photographer", description: "Additional shooter for the day", price: 700, category: "Service" as const, taxable: true },
  { id: "pr5", name: "Premium Album (12x12)", description: "30-page lay-flat fine art album", price: 300, category: "Product" as const, taxable: true },
  { id: "pr6", name: "Extra Hour", description: "Additional hour of coverage", price: 350, category: "Service" as const, taxable: true },
];

export const DEFAULT_CONTRACT_TEMPLATES = [
  { id: "ct1", name: "Wedding Photography Agreement", body: DEFAULT_CONTRACT_BODY },
  { id: "ct2", name: "Portrait Session Agreement", body: DEFAULT_CONTRACT_BODY },
  { id: "ct3", name: "Commercial / Product Agreement", body: DEFAULT_CONTRACT_BODY },
];

export const DEFAULT_QUESTIONNAIRE_TEMPLATES = [
  {
    id: "qt1",
    name: "Wedding Details",
    questions: [
      "What time does the ceremony start?",
      "Ceremony & reception venue addresses?",
      "How many guests are you expecting?",
      "Any must-have shots or special moments?",
      "Who is the day-of coordinator?",
      "What is your wedding style / vibe?",
    ],
  },
  {
    id: "qt2",
    name: "Portrait Session",
    questions: [
      "Who will be in the session?",
      "Preferred location or vibe?",
      "What will you use the images for?",
      "Any outfit changes planned?",
    ],
  },
];

export function makeSeedData(): CRMData {
  return {
    settings: DEFAULT_SETTINGS,
    workflowTemplates: DEFAULT_WORKFLOW_TEMPLATES,
    products: DEFAULT_PRODUCTS,
    contractTemplates: DEFAULT_CONTRACT_TEMPLATES,
    questionnaireTemplates: DEFAULT_QUESTIONNAIRE_TEMPLATES,
    clients: [
      { id: "c1", firstName: "Sophie", lastName: "Turner", partnerName: "Gary Wells", email: "sophie.turner@email.com", phone: "+1 (555) 231-8890", address: "88 Maple Rd, Portland, OR", createdAt: daysFrom(-120) },
      { id: "c2", firstName: "Thomas", lastName: "Bennett", partnerName: "Ellie Bennett", email: "thomas.b@email.com", phone: "+1 (555) 442-1123", address: "12 Rose St, Salem, OR", createdAt: daysFrom(-95) },
      { id: "c3", firstName: "Anna", lastName: "Whitfield", partnerName: "Deon Whitfield", email: "anna.white@email.com", phone: "+1 (555) 909-4471", address: "5 Cedar Ave, Portland, OR", createdAt: daysFrom(-60) },
      { id: "c4", firstName: "Ben", lastName: "Carter", email: "ben.carter@email.com", phone: "+1 (555) 771-2200", address: "301 Birch Blvd, Beaverton, OR", createdAt: daysFrom(-45) },
      { id: "c5", firstName: "Rene", lastName: "Alvarez", email: "rene.alvarez@email.com", phone: "+1 (555) 118-7734", createdAt: daysFrom(-20) },
      { id: "c6", firstName: "Grace", lastName: "Kim", email: "grace.kim@email.com", phone: "+1 (555) 553-6688", company: "Northwind Co.", createdAt: daysFrom(-10) },
    ],
    leads: [
      { id: "l1", clientId: "c5", name: "Rene Wedding Enquiry", email: "rene.alvarez@email.com", phone: "+1 (555) 118-7734", jobType: "Wedding", status: "New Enquiry", source: "Referral", value: 4200, mailStatus: "New Enquiry", nextTask: "Send thank you & pricing guide", eventDate: daysFrom(120), createdAt: daysFrom(-2) },
      { id: "l2", clientId: "c3", name: "Anna Wedding Enquiry", email: "anna.white@email.com", phone: "+1 (555) 909-4471", jobType: "Wedding", status: "Quote Sent", source: "Instagram", value: 5600, mailStatus: "Email sent on 1 Jul", nextTask: "Follow up email", eventDate: daysFrom(160), createdAt: daysFrom(-7) },
      { id: "l3", name: "Corporate Headshots — Northwind", email: "grace.kim@email.com", phone: "+1 (555) 553-6688", jobType: "Corporate", status: "Contacted", source: "Google", value: 1800, nextTask: "Send corporate package", eventDate: daysFrom(25), createdAt: daysFrom(-4) },
      { id: "l4", name: "Miller Family Session", email: "miller.fam@email.com", jobType: "Family", status: "Follow Up", source: "Website", value: 650, nextTask: "Call to book date", eventDate: daysFrom(18), createdAt: daysFrom(-9) },
      { id: "l5", name: "Dawson Engagement", email: "dawson@email.com", jobType: "Engagement", status: "Won", source: "Social", value: 900, eventDate: daysFrom(40), createdAt: daysFrom(-14) },
      { id: "l6", name: "Product Shoot — Bloom Co", email: "info@bloom.co", jobType: "Product", status: "Lost", source: "Directory", value: 1200, createdAt: daysFrom(-30) },
    ],
    appointments: [],
    jobs: [
      { id: "j01", clientId: "c01", name: "Carlos Ramírez Wedding", jobType: "Wedding", status: "Delivered", shootDate: "2025-01-06", value: 13500, location: "Casa de los Sueños", package: "Foto Gold", brideName: "Carlos", groomName: "Novio", venue: "Casa de los Sueños", weddingDate: "2025-01-06", ceremonyTime: "16:00", receptionTime: "20:00", guestCount: 183, coordinator: "Kevin Lemus", secondShooter: "Alfredo Yuman", videographer: "Henry Gil", notes: "Boda de Carlos Ramírez. Paquete Foto Gold. Ceremonia en iglesia.", currentStage: "Delivered", tasks: [{id:"t1",title:"Pre-boda",done:true}, {id:"t2",title:"Boda",done:true}, {id:"t3",title:"Entrega",done:true}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2024-09-08", updatedAt: "2025-01-06" },
      { id: "j02", clientId: "c02", name: "María José Pérez Wedding", jobType: "Wedding", status: "Completed", shootDate: "2025-02-19", value: 20500, location: "Hotel Casa Santo Domingo", package: "Mix Gold", brideName: "María", groomName: "Pérez", venue: "Hotel Casa Santo Domingo", weddingDate: "2025-02-19", ceremonyTime: "17:00", receptionTime: "20:00", guestCount: 125, coordinator: "Kevin Lemus", secondShooter: "Marvin Rustrian", videographer: "Josema Teque", notes: "Boda de María José Pérez. Paquete Mix Gold. Ceremonia en iglesia.", currentStage: "Completed", tasks: [{id:"t1",title:"Pre-boda",done:true}, {id:"t2",title:"Boda",done:true}, {id:"t3",title:"Entrega",done:false}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2024-11-29", updatedAt: "2025-02-19" },
      { id: "j03", clientId: "c03", name: "Luis Fernando López Wedding", jobType: "Wedding", status: "Completed", shootDate: "2025-03-25", value: 29500, location: "Mesón Panza Verde", package: "Mix Platinum", brideName: "Luis", groomName: "López", venue: "Mesón Panza Verde", weddingDate: "2025-03-25", ceremonyTime: "16:00", receptionTime: "19:00", guestCount: 127, coordinator: "Kevin Lemus", secondShooter: "Luis Lemus", videographer: "Alfredo Yuman", notes: "Boda de Luis Fernando López. Paquete Mix Platinum. Boda al aire libre.", currentStage: "Completed", tasks: [{id:"t1",title:"Pre-boda",done:true}, {id:"t2",title:"Boda",done:true}, {id:"t3",title:"Entrega",done:false}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2024-10-23", updatedAt: "2025-03-25" },
      { id: "j04", clientId: "c04", name: "Ana Lucía García Wedding", jobType: "Wedding", status: "Delivered", shootDate: "2025-04-07", value: 35500, location: "San Cristobal Mixco", package: "Signature", brideName: "Ana", groomName: "García", venue: "San Cristobal Mixco", weddingDate: "2025-04-07", ceremonyTime: "17:00", receptionTime: "19:00", guestCount: 155, coordinator: "Kevin Lemus", secondShooter: "Henry Gil", videographer: "None", notes: "Boda de Ana Lucía García. Paquete Signature. Ceremonia civil.", currentStage: "Delivered", tasks: [{id:"t1",title:"Pre-boda",done:true}, {id:"t2",title:"Boda",done:true}, {id:"t3",title:"Entrega",done:true}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2024-12-25", updatedAt: "2025-04-07" },
      { id: "j05", clientId: "c05", name: "José Manuel Rodríguez Wedding", jobType: "Wedding", status: "Completed", shootDate: "2025-05-15", value: 13500, location: "Casa de los Sueños", package: "Foto Gold", brideName: "José", groomName: "Rodríguez", venue: "Casa de los Sueños", weddingDate: "2025-05-15", ceremonyTime: "16:00", receptionTime: "18:00", guestCount: 183, coordinator: "Kevin Lemus", secondShooter: "Luis Lemus", videographer: "Henry Gil", notes: "Boda de José Manuel Rodríguez. Paquete Foto Gold. Boda indoor.", currentStage: "Completed", tasks: [{id:"t1",title:"Pre-boda",done:true}, {id:"t2",title:"Boda",done:true}, {id:"t3",title:"Entrega",done:false}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2024-11-19", updatedAt: "2025-05-15" },
      { id: "j06", clientId: "c06", name: "Sofía Esperanza Martínez Wedding", jobType: "Wedding", status: "Completed", shootDate: "2025-06-28", value: 20500, location: "Casa de los Sueños", package: "Mix Gold", brideName: "Sofía", groomName: "Martínez", venue: "Casa de los Sueños", weddingDate: "2025-06-28", ceremonyTime: "16:00", receptionTime: "20:00", guestCount: 150, coordinator: "Kevin Lemus", secondShooter: "Luis Lemus", videographer: "Henry Gil", notes: "Boda de Sofía Esperanza Martínez. Paquete Mix Gold. Ceremonia en iglesia.", currentStage: "Completed", tasks: [{id:"t1",title:"Pre-boda",done:true}, {id:"t2",title:"Boda",done:true}, {id:"t3",title:"Entrega",done:false}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2024-12-14", updatedAt: "2025-06-28" },
      { id: "j07", clientId: "c07", name: "Pedro Pablo Hernández Wedding", jobType: "Wedding", status: "Delivered", shootDate: "2025-07-15", value: 29500, location: "Hacienda San Joaquín", package: "Mix Platinum", brideName: "Pedro", groomName: "Hernández", venue: "Hacienda San Joaquín", weddingDate: "2025-07-15", ceremonyTime: "15:00", receptionTime: "18:00", guestCount: 89, coordinator: "Kevin Lemus", secondShooter: "Marvin Rustrian", videographer: "Henry Gil", notes: "Boda de Pedro Pablo Hernández. Paquete Mix Platinum. Boda indoor.", currentStage: "Delivered", tasks: [{id:"t1",title:"Pre-boda",done:true}, {id:"t2",title:"Boda",done:true}, {id:"t3",title:"Entrega",done:true}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2025-04-30", updatedAt: "2025-07-15" },
      { id: "j08", clientId: "c08", name: "Daniela Cristina Sánchez Wedding", jobType: "Wedding", status: "Completed", shootDate: "2025-08-11", value: 35500, location: "Hotel Casa Santo Domingo", package: "Signature", brideName: "Daniela", groomName: "Sánchez", venue: "Hotel Casa Santo Domingo", weddingDate: "2025-08-11", ceremonyTime: "15:00", receptionTime: "20:00", guestCount: 159, coordinator: "Kevin Lemus", secondShooter: "Luis Lemus", videographer: "Henry Gil", notes: "Boda de Daniela Cristina Sánchez. Paquete Signature. Boda al aire libre.", currentStage: "Completed", tasks: [{id:"t1",title:"Pre-boda",done:true}, {id:"t2",title:"Boda",done:true}, {id:"t3",title:"Entrega",done:false}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2025-05-02", updatedAt: "2025-08-11" },
      { id: "j09", clientId: "c09", name: "Andrés Felipe Morales Wedding", jobType: "Wedding", status: "Completed", shootDate: "2025-09-03", value: 13500, location: "San Cristobal Mixco", package: "Foto Gold", brideName: "Andrés", groomName: "Morales", venue: "San Cristobal Mixco", weddingDate: "2025-09-03", ceremonyTime: "15:00", receptionTime: "20:00", guestCount: 194, coordinator: "Kevin Lemus", secondShooter: "Marvin Rustrian", videographer: "Henry Gil", notes: "Boda de Andrés Felipe Morales. Paquete Foto Gold. Boda al aire libre.", currentStage: "Completed", tasks: [{id:"t1",title:"Pre-boda",done:true}, {id:"t2",title:"Boda",done:true}, {id:"t3",title:"Entrega",done:false}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2025-03-17", updatedAt: "2025-09-03" },
      { id: "j10", clientId: "c10", name: "Valeria Isabel Castillo Wedding", jobType: "Wedding", status: "Delivered", shootDate: "2025-10-15", value: 20500, location: "Jardín El Cerro, Fraijanes", package: "Mix Gold", brideName: "Valeria", groomName: "Castillo", venue: "Jardín El Cerro, Fraijanes", weddingDate: "2025-10-15", ceremonyTime: "17:00", receptionTime: "19:00", guestCount: 173, coordinator: "Kevin Lemus", secondShooter: "Luis Lemus", videographer: "Henry Gil", notes: "Boda de Valeria Isabel Castillo. Paquete Mix Gold. Ceremonia en iglesia.", currentStage: "Delivered", tasks: [{id:"t1",title:"Pre-boda",done:true}, {id:"t2",title:"Boda",done:true}, {id:"t3",title:"Entrega",done:true}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2025-06-09", updatedAt: "2025-10-15" },
      { id: "j11", clientId: "c11", name: "Juan Pablo Ramírez Wedding", jobType: "Wedding", status: "Editing", shootDate: "2026-01-10", value: 29500, location: "Hotel Atitlán, Panajachel", package: "Mix Platinum", brideName: "Juan", groomName: "Ramírez", venue: "Hotel Atitlán, Panajachel", weddingDate: "2026-01-10", ceremonyTime: "16:00", receptionTime: "19:00", guestCount: 208, coordinator: "Kevin Lemus", secondShooter: "Henry Gil", videographer: "None", notes: "Boda de Juan Pablo Ramírez. Paquete Mix Platinum. Ceremonia en iglesia.", currentStage: "Editing", tasks: [{id:"t1",title:"Pre-boda",done:true}, {id:"t2",title:"Boda",done:true}, {id:"t3",title:"Entrega",done:false}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2025-09-26", updatedAt: "2026-01-10" },
      { id: "j12", clientId: "c12", name: "Camila José Reyes Wedding", jobType: "Wedding", status: "Delivered", shootDate: "2026-02-16", value: 35500, location: "San Cristobal Mixco", package: "Signature", brideName: "Camila", groomName: "Reyes", venue: "San Cristobal Mixco", weddingDate: "2026-02-16", ceremonyTime: "17:00", receptionTime: "19:00", guestCount: 235, coordinator: "Kevin Lemus", secondShooter: "Luis Lemus", videographer: "Henry Gil", notes: "Boda de Camila José Reyes. Paquete Signature. Ceremonia civil.", currentStage: "Delivered", tasks: [{id:"t1",title:"Pre-boda",done:true}, {id:"t2",title:"Boda",done:true}, {id:"t3",title:"Entrega",done:true}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2025-09-18", updatedAt: "2026-02-16" },
      { id: "j13", clientId: "c13", name: "Miguel Ángel González Wedding", jobType: "Wedding", status: "Editing", shootDate: "2026-03-23", value: 13500, location: "Hotel Atitlán, Panajachel", package: "Foto Gold", brideName: "Miguel", groomName: "González", venue: "Hotel Atitlán, Panajachel", weddingDate: "2026-03-23", ceremonyTime: "15:00", receptionTime: "20:00", guestCount: 109, coordinator: "Kevin Lemus", secondShooter: "Luis Lemus", videographer: "Alfredo Yuman", notes: "Boda de Miguel Ángel González. Paquete Foto Gold. Boda indoor.", currentStage: "Editing", tasks: [{id:"t1",title:"Pre-boda",done:true}, {id:"t2",title:"Boda",done:true}, {id:"t3",title:"Entrega",done:false}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2025-09-02", updatedAt: "2026-03-23" },
      { id: "j14", clientId: "c14", name: "Isabella María López Wedding", jobType: "Wedding", status: "Delivered", shootDate: "2026-04-10", value: 20500, location: "Hotel Soleil Pacífico", package: "Mix Gold", brideName: "Isabella", groomName: "López", venue: "Hotel Soleil Pacífico", weddingDate: "2026-04-10", ceremonyTime: "17:00", receptionTime: "19:00", guestCount: 195, coordinator: "Kevin Lemus", secondShooter: "Marvin Rustrian", videographer: "Marvin Rustrian", notes: "Boda de Isabella María López. Paquete Mix Gold. Boda indoor.", currentStage: "Delivered", tasks: [{id:"t1",title:"Pre-boda",done:true}, {id:"t2",title:"Boda",done:true}, {id:"t3",title:"Entrega",done:true}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2025-11-23", updatedAt: "2026-04-10" },
      { id: "j15", clientId: "c15", name: "Roberto Carlos Méndez Wedding", jobType: "Wedding", status: "Editing", shootDate: "2026-05-19", value: 29500, location: "Villa Botánica", package: "Mix Platinum", brideName: "Roberto", groomName: "Méndez", venue: "Villa Botánica", weddingDate: "2026-05-19", ceremonyTime: "16:00", receptionTime: "20:00", guestCount: 235, coordinator: "Kevin Lemus", secondShooter: "Henry Gil", videographer: "None", notes: "Boda de Roberto Carlos Méndez. Paquete Mix Platinum. Boda indoor.", currentStage: "Editing", tasks: [{id:"t1",title:"Pre-boda",done:true}, {id:"t2",title:"Boda",done:true}, {id:"t3",title:"Entrega",done:false}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2026-02-06", updatedAt: "2026-05-19" },
      { id: "j16", clientId: "c16", name: "Andrea Fernanda Cruz Wedding", jobType: "Wedding", status: "Delivered", shootDate: "2026-06-25", value: 35500, location: "Centenario Eventos", package: "Signature", brideName: "Andrea", groomName: "Cruz", venue: "Centenario Eventos", weddingDate: "2026-06-25", ceremonyTime: "14:00", receptionTime: "18:00", guestCount: 120, coordinator: "Kevin Lemus", secondShooter: "Henry Gil", videographer: "Josema Teque", notes: "Boda de Andrea Fernanda Cruz. Paquete Signature. Boda indoor.", currentStage: "Delivered", tasks: [{id:"t1",title:"Pre-boda",done:true}, {id:"t2",title:"Boda",done:true}, {id:"t3",title:"Entrega",done:true}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2026-03-31", updatedAt: "2026-06-25" },
      { id: "j17", clientId: "c17", name: "Diego Alejandro Pérez Wedding", jobType: "Wedding", status: "Confirmed", shootDate: "2026-07-15", value: 13500, location: "Villa Botánica", package: "Foto Gold", brideName: "Diego", groomName: "Pérez", venue: "Villa Botánica", weddingDate: "2026-07-15", ceremonyTime: "14:00", receptionTime: "19:00", guestCount: 189, coordinator: "Kevin Lemus", secondShooter: "Marvin Rustrian", videographer: "None", notes: "Boda de Diego Alejandro Pérez. Paquete Foto Gold. Ceremonia civil.", currentStage: "Confirmed", tasks: [{id:"t1",title:"Pre-boda",done:true}, {id:"t2",title:"Boda",done:false}, {id:"t3",title:"Entrega",done:false}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2026-01-04", updatedAt: "2026-07-15" },
      { id: "j18", clientId: "c18", name: "María José Castillo Wedding", jobType: "Wedding", status: "Confirmed", shootDate: "2026-08-19", value: 20500, location: "Casa de los Sueños", package: "Mix Gold", brideName: "María", groomName: "Castillo", venue: "Casa de los Sueños", weddingDate: "2026-08-19", ceremonyTime: "15:00", receptionTime: "18:00", guestCount: 208, coordinator: "Kevin Lemus", secondShooter: "Luis Lemus", videographer: "Marvin Rustrian", notes: "Boda de María José Castillo. Paquete Mix Gold. Ceremonia civil.", currentStage: "Confirmed", tasks: [{id:"t1",title:"Pre-boda",done:true}, {id:"t2",title:"Boda",done:false}, {id:"t3",title:"Entrega",done:false}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2026-04-05", updatedAt: "2026-08-19" },
      { id: "j19", clientId: "c19", name: "Sebastián Emilio García Wedding", jobType: "Wedding", status: "Confirmed", shootDate: "2026-09-25", value: 29500, location: "Casa de los Sueños", package: "Mix Platinum", brideName: "Sebastián", groomName: "García", venue: "Casa de los Sueños", weddingDate: "2026-09-25", ceremonyTime: "16:00", receptionTime: "18:00", guestCount: 157, coordinator: "Kevin Lemus", secondShooter: "Luis Lemus", videographer: "None", notes: "Boda de Sebastián Emilio García. Paquete Mix Platinum. Boda indoor.", currentStage: "Confirmed", tasks: [{id:"t1",title:"Pre-boda",done:true}, {id:"t2",title:"Boda",done:false}, {id:"t3",title:"Entrega",done:false}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2026-04-10", updatedAt: "2026-09-25" },
      { id: "j20", clientId: "c20", name: "Paola Andrea Hernández Wedding", jobType: "Wedding", status: "Confirmed", shootDate: "2026-10-16", value: 35500, location: "Hotel Casa Santo Domingo", package: "Signature", brideName: "Paola", groomName: "Hernández", venue: "Hotel Casa Santo Domingo", weddingDate: "2026-10-16", ceremonyTime: "16:00", receptionTime: "20:00", guestCount: 172, coordinator: "Kevin Lemus", secondShooter: "Henry Gil", videographer: "Henry Gil", notes: "Boda de Paola Andrea Hernández. Paquete Signature. Ceremonia en iglesia.", currentStage: "Confirmed", tasks: [{id:"t1",title:"Pre-boda",done:true}, {id:"t2",title:"Boda",done:false}, {id:"t3",title:"Entrega",done:false}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2026-06-26", updatedAt: "2026-10-16" },
      { id: "j21", clientId: "c21", name: "Mateo Alejandro Ruiz Wedding", jobType: "Wedding", status: "Quote Sent", shootDate: "2027-01-22", value: 13500, location: "Casa del Mundo", package: "Foto Gold", brideName: "Mateo", groomName: "Ruiz", venue: "Casa del Mundo", weddingDate: "2027-01-22", ceremonyTime: "14:00", receptionTime: "19:00", guestCount: 179, coordinator: "Kevin Lemus", secondShooter: "Luis Lemus", videographer: "Henry Gil", notes: "Boda de Mateo Alejandro Ruiz. Paquete Foto Gold. Ceremonia civil.", currentStage: "Quote Sent", tasks: [{id:"t1",title:"Pre-boda",done:false}, {id:"t2",title:"Boda",done:false}, {id:"t3",title:"Entrega",done:false}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2026-09-19", updatedAt: "2027-01-22" },
      { id: "j22", clientId: "c22", name: "Luciana Isabel Torres Wedding", jobType: "Wedding", status: "Confirmed", shootDate: "2027-02-08", value: 20500, location: "San Cristobal Mixco", package: "Mix Gold", brideName: "Luciana", groomName: "Torres", venue: "San Cristobal Mixco", weddingDate: "2027-02-08", ceremonyTime: "17:00", receptionTime: "18:00", guestCount: 106, coordinator: "Kevin Lemus", secondShooter: "Marvin Rustrian", videographer: "Alfredo Yuman", notes: "Boda de Luciana Isabel Torres. Paquete Mix Gold. Boda indoor.", currentStage: "Confirmed", tasks: [{id:"t1",title:"Pre-boda",done:true}, {id:"t2",title:"Boda",done:false}, {id:"t3",title:"Entrega",done:false}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2026-08-06", updatedAt: "2027-02-08" },
      { id: "j23", clientId: "c23", name: "Santiago José Pérez Wedding", jobType: "Wedding", status: "Quote Sent", shootDate: "2027-03-26", value: 29500, location: "Casa de los Sueños", package: "Mix Platinum", brideName: "Santiago", groomName: "Pérez", venue: "Casa de los Sueños", weddingDate: "2027-03-26", ceremonyTime: "15:00", receptionTime: "18:00", guestCount: 181, coordinator: "Kevin Lemus", secondShooter: "Henry Gil", videographer: "Josema Teque", notes: "Boda de Santiago José Pérez. Paquete Mix Platinum. Ceremonia civil.", currentStage: "Quote Sent", tasks: [{id:"t1",title:"Pre-boda",done:false}, {id:"t2",title:"Boda",done:false}, {id:"t3",title:"Entrega",done:false}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2026-09-11", updatedAt: "2027-03-26" },
      { id: "j24", clientId: "c24", name: "Renata María Sánchez Wedding", jobType: "Wedding", status: "Quote Sent", shootDate: "2027-04-21", value: 35500, location: "Mesón Panza Verde", package: "Signature", brideName: "Renata", groomName: "Sánchez", venue: "Mesón Panza Verde", weddingDate: "2027-04-21", ceremonyTime: "14:00", receptionTime: "18:00", guestCount: 96, coordinator: "Kevin Lemus", secondShooter: "Alfredo Yuman", videographer: "Henry Gil", notes: "Boda de Renata María Sánchez. Paquete Signature. Boda al aire libre.", currentStage: "Quote Sent", tasks: [{id:"t1",title:"Pre-boda",done:false}, {id:"t2",title:"Boda",done:false}, {id:"t3",title:"Entrega",done:false}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2026-12-30", updatedAt: "2027-04-21" },
      { id: "j25", clientId: "c25", name: "Tomás Emiliano García Wedding", jobType: "Wedding", status: "Confirmed", shootDate: "2027-05-22", value: 13500, location: "Hotel Casa Santo Domingo", package: "Foto Gold", brideName: "Tomás", groomName: "García", venue: "Hotel Casa Santo Domingo", weddingDate: "2027-05-22", ceremonyTime: "14:00", receptionTime: "18:00", guestCount: 176, coordinator: "Kevin Lemus", secondShooter: "Henry Gil", videographer: "Marvin Rustrian", notes: "Boda de Tomás Emiliano García. Paquete Foto Gold. Boda indoor.", currentStage: "Confirmed", tasks: [{id:"t1",title:"Pre-boda",done:true}, {id:"t2",title:"Boda",done:false}, {id:"t3",title:"Entrega",done:false}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2027-01-04", updatedAt: "2027-05-22" },
      { id: "j26", clientId: "c26", name: "Josefina Esperanza Morales Wedding", jobType: "Wedding", status: "Quote Sent", shootDate: "2027-06-14", value: 20500, location: "Hacienda San Joaquín", package: "Mix Gold", brideName: "Josefina", groomName: "Morales", venue: "Hacienda San Joaquín", weddingDate: "2027-06-14", ceremonyTime: "15:00", receptionTime: "18:00", guestCount: 135, coordinator: "Kevin Lemus", secondShooter: "Marvin Rustrian", videographer: "None", notes: "Boda de Josefina Esperanza Morales. Paquete Mix Gold. Ceremonia en iglesia.", currentStage: "Quote Sent", tasks: [{id:"t1",title:"Pre-boda",done:false}, {id:"t2",title:"Boda",done:false}, {id:"t3",title:"Entrega",done:false}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2027-02-13", updatedAt: "2027-06-14" },
      { id: "j27", clientId: "c27", name: "Joaquín Esteban López Wedding", jobType: "Wedding", status: "Quote Sent", shootDate: "2027-07-07", value: 29500, location: "Antigua Guatemala", package: "Mix Platinum", brideName: "Joaquín", groomName: "López", venue: "Antigua Guatemala", weddingDate: "2027-07-07", ceremonyTime: "16:00", receptionTime: "20:00", guestCount: 228, coordinator: "Kevin Lemus", secondShooter: "Luis Lemus", videographer: "Josema Teque", notes: "Boda de Joaquín Esteban López. Paquete Mix Platinum. Ceremonia en iglesia.", currentStage: "Quote Sent", tasks: [{id:"t1",title:"Pre-boda",done:false}, {id:"t2",title:"Boda",done:false}, {id:"t3",title:"Entrega",done:false}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2027-02-17", updatedAt: "2027-07-07" },
      { id: "j28", clientId: "c28", name: "Renata Isabel Martínez Wedding", jobType: "Wedding", status: "Confirmed", shootDate: "2027-08-08", value: 35500, location: "Hotel Casa Santo Domingo", package: "Signature", brideName: "Renata", groomName: "Martínez", venue: "Hotel Casa Santo Domingo", weddingDate: "2027-08-08", ceremonyTime: "14:00", receptionTime: "19:00", guestCount: 248, coordinator: "Kevin Lemus", secondShooter: "Marvin Rustrian", videographer: "Alfredo Yuman", notes: "Boda de Renata Isabel Martínez. Paquete Signature. Ceremonia civil.", currentStage: "Confirmed", tasks: [{id:"t1",title:"Pre-boda",done:true}, {id:"t2",title:"Boda",done:false}, {id:"t3",title:"Entrega",done:false}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2027-02-22", updatedAt: "2027-08-08" },
      { id: "j29", clientId: "c29", name: "Esteban Andrés Hernández Wedding", jobType: "Wedding", status: "Quote Sent", shootDate: "2027-09-27", value: 13500, location: "Centenario Eventos", package: "Foto Gold", brideName: "Esteban", groomName: "Hernández", venue: "Centenario Eventos", weddingDate: "2027-09-27", ceremonyTime: "14:00", receptionTime: "19:00", guestCount: 248, coordinator: "Kevin Lemus", secondShooter: "Alfredo Yuman", videographer: "None", notes: "Boda de Esteban Andrés Hernández. Paquete Foto Gold. Ceremonia civil.", currentStage: "Quote Sent", tasks: [{id:"t1",title:"Pre-boda",done:false}, {id:"t2",title:"Boda",done:false}, {id:"t3",title:"Entrega",done:false}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2027-06-22", updatedAt: "2027-09-27" },
      { id: "j30", clientId: "c30", name: "Mariana Lucía Rodríguez Wedding", jobType: "Wedding", status: "Quote Sent", shootDate: "2027-10-03", value: 20500, location: "Hotel Soleil Pacífico", package: "Mix Gold", brideName: "Mariana", groomName: "Rodríguez", venue: "Hotel Soleil Pacífico", weddingDate: "2027-10-03", ceremonyTime: "15:00", receptionTime: "20:00", guestCount: 190, coordinator: "Kevin Lemus", secondShooter: "Marvin Rustrian", videographer: "None", notes: "Boda de Mariana Lucía Rodríguez. Paquete Mix Gold. Ceremonia civil.", currentStage: "Quote Sent", tasks: [{id:"t1",title:"Pre-boda",done:false}, {id:"t2",title:"Boda",done:false}, {id:"t3",title:"Entrega",done:false}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2027-04-29", updatedAt: "2027-10-03" },
    ],
    tments: [
      { id: "a1", title: "Sophie & Gary — Timeline Meeting", date: daysFrom(3), time: "15:30", type: "Meeting", clientId: "c1", jobId: "j1", location: "Studio / Zoom" },
      { id: "a2", title: "Ben Family Portrait Session", date: daysFrom(-5), time: "09:00", type: "Main Shoot", clientId: "c4", jobId: "j3", location: "Forest Park" },
      { id: "a3", title: "Northwind Corporate Headshots", date: daysFrom(25), time: "10:00", type: "Main Shoot", clientId: "c6", jobId: "j5", location: "Northwind HQ" },
      { id: "a4", title: "Sophie & Gary Wedding", date: daysFrom(21), time: "12:00", endTime: "22:00", type: "Main Shoot", clientId: "c1", jobId: "j1", location: "Rosewood Estate" },
      { id: "a5", title: "Album pick up — Anna & Deon", date: daysFrom(6), time: "16:00", type: "Appointment", clientId: "c3", jobId: "j4", location: "Studio" },
      { id: "a6", title: "Thomas & Ellie Wedding", date: daysFrom(55), time: "11:00", endTime: "21:00", type: "Main Shoot", clientId: "c2", jobId: "j2", location: "The Grand Hall" },
    ],
    invoices: [
      {
        id: "inv1", number: "INV-1042", type: "Invoice", clientId: "c1", jobId: "j1", status: "Partial",
        issueDate: daysFrom(-80), dueDate: daysFrom(18), taxRate: 10, discount: 0,
        items: [
          { id: "i1", description: "Silver Wedding Collection — 8hr coverage", quantity: 1, unitPrice: 4800 },
          { id: "i2", description: "Second photographer", quantity: 1, unitPrice: 700 },
          { id: "i3", description: "Premium album (12x12)", quantity: 1, unitPrice: 300 },
        ],
        payments: [
          { id: "pay1", amount: 2000, date: daysFrom(-80), method: "Card", note: "Booking deposit" },
          { id: "pay1b", amount: 1500, date: daysFrom(-15), method: "Card", note: "Progress payment" },
        ],
      },
      {
        id: "inv2", number: "INV-1043", type: "Invoice", clientId: "c4", jobId: "j3", status: "Paid",
        issueDate: daysFrom(-30), dueDate: daysFrom(-16), taxRate: 10, discount: 0,
        items: [{ id: "i4", description: "Family Portrait Session — 1hr", quantity: 1, unitPrice: 650 }],
        payments: [{ id: "pay2", amount: 715, date: daysFrom(-25), method: "Card" }],
      },
      {
        id: "inv3", number: "INV-1044", type: "Invoice", clientId: "c3", jobId: "j4", status: "Paid",
        issueDate: daysFrom(-50), dueDate: daysFrom(-36), taxRate: 10, discount: 50,
        items: [{ id: "i5", description: "Engagement Session + 20 edited images", quantity: 1, unitPrice: 950 }],
        payments: [{ id: "pay3", amount: 990, date: daysFrom(-45), method: "Bank Transfer" }],
      },
      {
        id: "quo1", number: "QUO-2087", type: "Quote", clientId: "c5", status: "Sent",
        issueDate: daysFrom(-2), dueDate: daysFrom(12), taxRate: 10, discount: 0,
        items: [
          { id: "i6", description: "Gold Wedding Collection — 10hr coverage", quantity: 1, unitPrice: 5800 },
          { id: "i7", description: "Engagement session (included)", quantity: 1, unitPrice: 0 },
        ],
        payments: [],
      },
      {
        id: "inv4", number: "INV-1041", type: "Invoice", clientId: "c2", jobId: "j2", status: "Overdue",
        issueDate: daysFrom(-70), dueDate: daysFrom(-10), taxRate: 10, discount: 0,
        items: [{ id: "i8", description: "Wedding booking deposit", quantity: 1, unitPrice: 2000 }],
        payments: [],
      },
    ],
    contracts: [
      {
        id: "con1", jobId: "j1", clientId: "c1", title: "Wedding Photography Agreement",
        body: DEFAULT_CONTRACT_BODY, status: "Signed",
        createdAt: daysFrom(-85), sentAt: daysFrom(-84), signedAt: daysFrom(-82), signatureName: "Sophie Turner",
      },
      {
        id: "con2", jobId: "j2", clientId: "c2", title: "Wedding Photography Agreement",
        body: DEFAULT_CONTRACT_BODY, status: "Sent",
        createdAt: daysFrom(-68), sentAt: daysFrom(-67),
      },
      {
        id: "con3", jobId: "j5", clientId: "c6", title: "Corporate Session Agreement",
        body: DEFAULT_CONTRACT_BODY, status: "Draft", createdAt: daysFrom(-9),
      },
    ],
    questionnaires: [
      {
        id: "qn1", jobId: "j1", clientId: "c1", title: "Wedding Details Questionnaire", status: "Completed",
        createdAt: daysFrom(-40), completedAt: daysFrom(-33),
        items: [
          { id: "qq1", question: "What time does the ceremony start?", answer: "3:00 PM" },
          { id: "qq2", question: "Ceremony & reception venue addresses?", answer: "Rosewood Estate, 120 Vineyard Rd, Portland" },
          { id: "qq3", question: "How many guests are you expecting?", answer: "Around 120" },
          { id: "qq4", question: "Any must-have shots or special moments?", answer: "First look, grandparents' toast, sparkler exit" },
          { id: "qq5", question: "Who is the day-of coordinator?", answer: "Jamie (Events by Jamie)" },
        ],
      },
      {
        id: "qn2", jobId: "j2", clientId: "c2", title: "Wedding Details Questionnaire", status: "Sent",
        createdAt: daysFrom(-20),
        items: [
          { id: "qq6", question: "What time does the ceremony start?" },
          { id: "qq7", question: "Ceremony & reception venue addresses?" },
          { id: "qq8", question: "How many guests are you expecting?" },
          { id: "qq9", question: "Any must-have shots or special moments?" },
        ],
      },
    ],
    emails: [
      { id: "em1", clientId: "c1", jobId: "j1", to: "sophie.turner@email.com", subject: "Thank you for your enquiry, Sophie!", body: "Hi Sophie,\n\nThank you so much for reaching out about your wedding!", sentAt: daysFromTime(-90, 9), via: "Gmail", direction: "outbound", openedAt: daysFromTime(-90, 11), clickedAt: daysFromTime(-89, 8) },
      { id: "em2", clientId: "c1", jobId: "j1", to: "sophie.turner@email.com", subject: "Your quote from MyStudio Photography", body: "Hi Sophie,\n\nJust following up on the quote I sent through.", sentAt: daysFromTime(-85, 14), via: "Gmail", direction: "outbound", openedAt: daysFromTime(-85, 15) },
      { id: "em3", clientId: "c1", jobId: "j1", to: "sophie.turner@email.com", subject: "You're booked in! 🎉", body: "Hi Sophie,\n\nWonderful news — your wedding is officially booked!", sentAt: daysFromTime(-82, 10), via: "Gmail", direction: "outbound", openedAt: daysFromTime(-82, 10), clickedAt: daysFromTime(-82, 10) },
      { id: "em4", clientId: "c1", jobId: "j1", to: "sophie.turner@email.com", subject: "Quick question about your timeline", body: "Hi Sophie,\n\nCould you confirm the ceremony start time?", sentAt: daysFromTime(-30, 16), via: "Gmail", direction: "outbound", openedAt: daysFromTime(-29, 9) },
      { id: "em5", clientId: "c2", jobId: "j2", to: "thomas.b@email.com", subject: "Your quote from MyStudio Photography", body: "Hi Thomas,\n\nHere is your wedding quote.", sentAt: daysFromTime(-67, 13), via: "Gmail", direction: "outbound", openedAt: daysFromTime(-66, 9) },
      { id: "em6", clientId: "c3", to: "anna.white@email.com", subject: "Following up on your enquiry", body: "Hi Anna,\n\nJust checking in!", sentAt: daysFromTime(-6, 11), via: "Gmail", direction: "outbound" },
    ],
    emailTemplates: DEFAULT_EMAIL_TEMPLATES,
  };
}
