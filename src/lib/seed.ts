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
    [
      { id: "c01", firstName: "Carlos", lastName: "Ramírez", partnerName: "María José", email: "carlos.ramírez@norkevinphoto.com", phone: "+502 5555-1000", address: "Guatemala", createdAt: "2024-01-01" },
      { id: "c02", firstName: "María José", lastName: "Pérez", partnerName: "Luis Fernando", email: "maríajosé.pérez@norkevinphoto.com", phone: "+502 5555-1001", address: "Guatemala", createdAt: "2024-01-01" },
      { id: "c03", firstName: "Luis Fernando", lastName: "López", partnerName: "Ana Lucía", email: "luisfernando.lópez@norkevinphoto.com", phone: "+502 5555-1002", address: "Guatemala", createdAt: "2024-01-01" },
      { id: "c04", firstName: "Ana Lucía", lastName: "García", partnerName: "Pedro Pablo", email: "analucía.garcía@norkevinphoto.com", phone: "+502 5555-1003", address: "Guatemala", createdAt: "2024-01-01" },
      { id: "c05", firstName: "José Manuel", lastName: "Rodríguez", partnerName: "Sofía Esperanza", email: "josémanuel.rodríguez@norkevinphoto.com", phone: "+502 5555-1004", address: "Guatemala", createdAt: "2024-01-01" },
      { id: "c06", firstName: "Sofía Esperanza", lastName: "Martínez", partnerName: "Daniela Cristina", email: "sofíaesperanza.martínez@norkevinphoto.com", phone: "+502 5555-1005", address: "Guatemala", createdAt: "2024-01-01" },
      { id: "c07", firstName: "Pedro Pablo", lastName: "Hernández", partnerName: "Andrés Felipe", email: "pedropablo.hernández@norkevinphoto.com", phone: "+502 5555-1006", address: "Guatemala", createdAt: "2024-01-01" },
      { id: "c08", firstName: "Daniela Cristina", lastName: "Sánchez", partnerName: "Valeria Isabel", email: "danielacristina.sánchez@norkevinphoto.com", phone: "+502 5555-1007", address: "Guatemala", createdAt: "2024-01-01" },
      { id: "c09", firstName: "Andrés Felipe", lastName: "Morales", partnerName: "Tomás Emiliano", email: "andrésfelipe.morales@norkevinphoto.com", phone: "+502 5555-1008", address: "Guatemala", createdAt: "2024-01-01" },
      { id: "c10", firstName: "Valeria Isabel", lastName: "Castillo", partnerName: "Luciana Isabel", email: "valeriaisabel.castillo@norkevinphoto.com", phone: "+502 5555-1009", address: "Guatemala", createdAt: "2024-01-01" }
    ],
    [
      { id: "l01", name: "María González Wedding Enquiry", email: "maria.gonzalez@email.com", phone: "+502 5555-2001", jobType: "Wedding", status: "Quote Sent", source: "Instagram", value: 20500, nextTask: "Follow up", eventDate: "2027-12-15", createdAt: "2026-07-01" },,
      { id: "l02", name: "Luis Pérez Wedding Enquiry", email: "luis.perez@email.com", phone: "+502 5555-2002", jobType: "Wedding", status: "Contacted", source: "Referral", value: 13500, nextTask: "Follow up", eventDate: "2027-12-15", createdAt: "2026-07-01" },,
      { id: "l03", name: "Ana Rodríguez Wedding Enquiry", email: "ana.rodriguez@email.com", phone: "+502 5555-2003", jobType: "Wedding", status: "New Enquiry", source: "WhatsApp", value: 29500, nextTask: "Follow up", eventDate: "2027-12-15", createdAt: "2026-07-01" },,
      { id: "l04", name: "Pedro Mendoza Wedding Enquiry", email: "pedro.mendoza@email.com", phone: "+502 5555-2004", jobType: "Wedding", status: "Quote Sent", source: "Website", value: 20500, nextTask: "Follow up", eventDate: "2027-12-15", createdAt: "2026-07-01" },,
      { id: "l05", name: "Sofía Castillo Wedding Enquiry", email: "sofia.castillo@email.com", phone: "+502 5555-2005", jobType: "Engagement", status: "New Enquiry", source: "Instagram", value: 9000, nextTask: "Follow up", eventDate: "2027-12-15", createdAt: "2026-07-01" },,
      { id: "l06", name: "Diego Morales Wedding Enquiry", email: "diego.morales@email.com", phone: "+502 5555-2006", jobType: "Wedding", status: "Contacted", source: "WhatsApp", value: 29500, nextTask: "Follow up", eventDate: "2027-12-15", createdAt: "2026-07-01" },,
      { id: "l07", name: "Valeria Sánchez Wedding Enquiry", email: "valeria.sanchez@email.com", phone: "+502 5555-2007", jobType: "Wedding", status: "Quote Sent", source: "Expo", value: 35500, nextTask: "Follow up", eventDate: "2027-12-15", createdAt: "2026-07-01" },,
      { id: "l08", name: "Mateo Pérez Wedding Enquiry", email: "mateo.perez@email.com", phone: "+502 5555-2008", jobType: "Wedding", status: "New Enquiry", source: "Google", value: 13500, nextTask: "Follow up", eventDate: "2027-12-15", createdAt: "2026-07-01" },,
      { id: "l09", name: "Luciana García Wedding Enquiry", email: "luciana.garcia@email.com", phone: "+502 5555-2009", jobType: "Family", status: "Contacted", source: "Referral", value: 4500, nextTask: "Follow up", eventDate: "2027-12-15", createdAt: "2026-07-01" },,
      { id: "l10", name: "Esteban Hernández Wedding Enquiry", email: "esteban.hernandez@email.com", phone: "+502 5555-2010", jobType: "Wedding", status: "Quote Sent", source: "Instagram", value: 20500, nextTask: "Follow up", eventDate: "2027-12-15", createdAt: "2026-07-01" },,
      { id: "l11", name: "Renata López Wedding Enquiry", email: "renata.lopez@email.com", phone: "+502 5555-2011", jobType: "Wedding", status: "New Enquiry", source: "WhatsApp", value: 35500, nextTask: "Follow up", eventDate: "2027-12-15", createdAt: "2026-07-01" },,
      { id: "l12", name: "Joaquín Martínez Wedding Enquiry", email: "joaquin.martinez@email.com", phone: "+502 5555-2012", jobType: "Corporate", status: "New Enquiry", source: "LinkedIn", value: 18000, nextTask: "Follow up", eventDate: "2027-12-15", createdAt: "2026-07-01" },
    ],
    appointments: [],
    [
      { id: "j01", clientId: "c02", name: "Carlos Ramírez Wedding", jobType: "Wedding", status: "Delivered", shootDate: "2025-01-21", value: 13500, location: "Antigua Guatemala", package: "Foto Gold", brideName: "Carlos", groomName: "María José", venue: "Antigua Guatemala", weddingDate: "2025-01-21", ceremonyTime: "15:00", receptionTime: "18:00", guestCount: 150, coordinator: "Kevin Lemus", secondShooter: "Alfredo Yuman", videographer: "Henry Gil", notes: "Boda de Carlos Ramírez. Paquete Foto Gold.", currentStage: "Delivered", tasks: [{id:"j01t1",title:"Pre-boda",done:true},{id:"j01t2",title:"Boda",done:true},{id:"j01t3",title:"Entrega",done:true}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2025-01-21", updatedAt: "2025-01-21" },
      { id: "j02", clientId: "c03", name: "María José Pérez Wedding", jobType: "Wedding", status: "Completed", shootDate: "2025-02-08", value: 20500, location: "Hotel Atitlán, Panajachel", package: "Mix Gold", brideName: "María José", groomName: "Luis Fernando", venue: "Hotel Atitlán, Panajachel", weddingDate: "2025-02-08", ceremonyTime: "15:00", receptionTime: "18:00", guestCount: 106, coordinator: "Kevin Lemus", secondShooter: "Henry Gil", videographer: "Alfredo Yuman", notes: "Boda de María José Pérez. Paquete Mix Gold.", currentStage: "Completed", tasks: [{id:"j02t1",title:"Pre-boda",done:true},{id:"j02t2",title:"Boda",done:true},{id:"j02t3",title:"Entrega",done:false}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2025-02-08", updatedAt: "2025-02-08" },
      { id: "j03", clientId: "c04", name: "Luis Fernando López Wedding", jobType: "Wedding", status: "Delivered", shootDate: "2025-03-22", value: 29500, location: "Mesón Panza Verde", package: "Mix Platinum", brideName: "Luis Fernando", groomName: "Ana Lucía", venue: "Mesón Panza Verde", weddingDate: "2025-03-22", ceremonyTime: "15:00", receptionTime: "18:00", guestCount: 231, coordinator: "Kevin Lemus", secondShooter: "Josema Teque", videographer: "Henry Gil", notes: "Boda de Luis Fernando López. Paquete Mix Platinum.", currentStage: "Delivered", tasks: [{id:"j03t1",title:"Pre-boda",done:true},{id:"j03t2",title:"Boda",done:true},{id:"j03t3",title:"Entrega",done:true}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2025-03-22", updatedAt: "2025-03-22" },
      { id: "j04", clientId: "c05", name: "Ana Lucía García Wedding", jobType: "Wedding", status: "Completed", shootDate: "2025-04-14", value: 35500, location: "San Cristobal Mixco", package: "Signature", brideName: "Ana Lucía", groomName: "Pedro Pablo", venue: "San Cristobal Mixco", weddingDate: "2025-04-14", ceremonyTime: "15:00", receptionTime: "18:00", guestCount: 103, coordinator: "Kevin Lemus", secondShooter: "Alfredo Yuman", videographer: "Henry Gil", notes: "Boda de Ana Lucía García. Paquete Signature.", currentStage: "Completed", tasks: [{id:"j04t1",title:"Pre-boda",done:true},{id:"j04t2",title:"Boda",done:true},{id:"j04t3",title:"Entrega",done:false}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2025-04-14", updatedAt: "2025-04-14" },
      { id: "j05", clientId: "c06", name: "José Manuel Rodríguez Wedding", jobType: "Wedding", status: "Delivered", shootDate: "2025-05-07", value: 13500, location: "Casa de los Sueños", package: "Foto Gold", brideName: "José Manuel", groomName: "Sofía Esperanza", venue: "Casa de los Sueños", weddingDate: "2025-05-07", ceremonyTime: "15:00", receptionTime: "18:00", guestCount: 234, coordinator: "Kevin Lemus", secondShooter: "Henry Gil", videographer: "None", notes: "Boda de José Manuel Rodríguez. Paquete Foto Gold.", currentStage: "Delivered", tasks: [{id:"j05t1",title:"Pre-boda",done:true},{id:"j05t2",title:"Boda",done:true},{id:"j05t3",title:"Entrega",done:true}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2025-05-07", updatedAt: "2025-05-07" },
      { id: "j06", clientId: "c07", name: "Sofía Esperanza Martínez Wedding", jobType: "Wedding", status: "Completed", shootDate: "2025-06-01", value: 20500, location: "Hotel Casa Santo Domingo", package: "Mix Gold", brideName: "Sofía Esperanza", groomName: "Daniela Cristina", venue: "Hotel Casa Santo Domingo", weddingDate: "2025-06-01", ceremonyTime: "15:00", receptionTime: "18:00", guestCount: 246, coordinator: "Kevin Lemus", secondShooter: "Josema Teque", videographer: "Alfredo Yuman", notes: "Boda de Sofía Esperanza Martínez. Paquete Mix Gold.", currentStage: "Completed", tasks: [{id:"j06t1",title:"Pre-boda",done:true},{id:"j06t2",title:"Boda",done:true},{id:"j06t3",title:"Entrega",done:false}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2025-06-01", updatedAt: "2025-06-01" },
      { id: "j07", clientId: "c08", name: "Pedro Pablo Hernández Wedding", jobType: "Wedding", status: "Delivered", shootDate: "2025-07-23", value: 29500, location: "Hacienda San Joaquín", package: "Mix Platinum", brideName: "Pedro Pablo", groomName: "Andrés Felipe", venue: "Hacienda San Joaquín", weddingDate: "2025-07-23", ceremonyTime: "15:00", receptionTime: "18:00", guestCount: 136, coordinator: "Kevin Lemus", secondShooter: "Josema Teque", videographer: "Josema Teque", notes: "Boda de Pedro Pablo Hernández. Paquete Mix Platinum.", currentStage: "Delivered", tasks: [{id:"j07t1",title:"Pre-boda",done:true},{id:"j07t2",title:"Boda",done:true},{id:"j07t3",title:"Entrega",done:true}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2025-07-23", updatedAt: "2025-07-23" },
      { id: "j08", clientId: "c09", name: "Daniela Cristina Sánchez Wedding", jobType: "Wedding", status: "Completed", shootDate: "2025-08-15", value: 35500, location: "Jardín El Cerro, Fraijanes", package: "Signature", brideName: "Daniela Cristina", groomName: "Valeria Isabel", venue: "Jardín El Cerro, Fraijanes", weddingDate: "2025-08-15", ceremonyTime: "15:00", receptionTime: "18:00", guestCount: 81, coordinator: "Kevin Lemus", secondShooter: "Josema Teque", videographer: "Marvin Rustrian", notes: "Boda de Daniela Cristina Sánchez. Paquete Signature.", currentStage: "Completed", tasks: [{id:"j08t1",title:"Pre-boda",done:true},{id:"j08t2",title:"Boda",done:true},{id:"j08t3",title:"Entrega",done:false}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2025-08-15", updatedAt: "2025-08-15" },
      { id: "j09", clientId: "c10", name: "Andrés Felipe Morales Wedding", jobType: "Wedding", status: "Delivered", shootDate: "2025-09-25", value: 13500, location: "Centenario Eventos", package: "Foto Gold", brideName: "Andrés Felipe", groomName: "Tomás Emiliano", venue: "Centenario Eventos", weddingDate: "2025-09-25", ceremonyTime: "15:00", receptionTime: "18:00", guestCount: 167, coordinator: "Kevin Lemus", secondShooter: "Henry Gil", videographer: "Josema Teque", notes: "Boda de Andrés Felipe Morales. Paquete Foto Gold.", currentStage: "Delivered", tasks: [{id:"j09t1",title:"Pre-boda",done:true},{id:"j09t2",title:"Boda",done:true},{id:"j09t3",title:"Entrega",done:true}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2025-09-25", updatedAt: "2025-09-25" },
      { id: "j10", clientId: "c01", name: "Valeria Isabel Castillo Wedding", jobType: "Wedding", status: "Completed", shootDate: "2025-10-09", value: 20500, location: "Hotel Soleil Pacífico", package: "Mix Gold", brideName: "Valeria Isabel", groomName: "Luciana Isabel", venue: "Hotel Soleil Pacífico", weddingDate: "2025-10-09", ceremonyTime: "15:00", receptionTime: "18:00", guestCount: 166, coordinator: "Kevin Lemus", secondShooter: "Henry Gil", videographer: "Alfredo Yuman", notes: "Boda de Valeria Isabel Castillo. Paquete Mix Gold.", currentStage: "Completed", tasks: [{id:"j10t1",title:"Pre-boda",done:true},{id:"j10t2",title:"Boda",done:true},{id:"j10t3",title:"Entrega",done:false}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2025-10-09", updatedAt: "2025-10-09" },
      { id: "j11", clientId: "c02", name: "Carlos Ramírez Wedding", jobType: "Wedding", status: "Editing", shootDate: "2026-01-04", value: 13500, location: "Antigua Guatemala", package: "Foto Gold", brideName: "Carlos", groomName: "María José", venue: "Antigua Guatemala", weddingDate: "2026-01-04", ceremonyTime: "15:00", receptionTime: "18:00", guestCount: 104, coordinator: "Kevin Lemus", secondShooter: "Alfredo Yuman", videographer: "Josema Teque", notes: "Boda de Carlos Ramírez. Paquete Foto Gold.", currentStage: "Editing", tasks: [{id:"j11t1",title:"Pre-boda",done:true},{id:"j11t2",title:"Boda",done:true},{id:"j11t3",title:"Entrega",done:false}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2026-01-04", updatedAt: "2026-01-04" },
      { id: "j12", clientId: "c03", name: "María José Pérez Wedding", jobType: "Wedding", status: "Delivered", shootDate: "2026-02-12", value: 20500, location: "Hotel Atitlán, Panajachel", package: "Mix Gold", brideName: "María José", groomName: "Luis Fernando", venue: "Hotel Atitlán, Panajachel", weddingDate: "2026-02-12", ceremonyTime: "15:00", receptionTime: "18:00", guestCount: 147, coordinator: "Kevin Lemus", secondShooter: "Marvin Rustrian", videographer: "None", notes: "Boda de María José Pérez. Paquete Mix Gold.", currentStage: "Delivered", tasks: [{id:"j12t1",title:"Pre-boda",done:true},{id:"j12t2",title:"Boda",done:true},{id:"j12t3",title:"Entrega",done:true}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2026-02-12", updatedAt: "2026-02-12" },
      { id: "j13", clientId: "c04", name: "Luis Fernando López Wedding", jobType: "Wedding", status: "Editing", shootDate: "2026-03-26", value: 29500, location: "Mesón Panza Verde", package: "Mix Platinum", brideName: "Luis Fernando", groomName: "Ana Lucía", venue: "Mesón Panza Verde", weddingDate: "2026-03-26", ceremonyTime: "15:00", receptionTime: "18:00", guestCount: 217, coordinator: "Kevin Lemus", secondShooter: "Alfredo Yuman", videographer: "Josema Teque", notes: "Boda de Luis Fernando López. Paquete Mix Platinum.", currentStage: "Editing", tasks: [{id:"j13t1",title:"Pre-boda",done:true},{id:"j13t2",title:"Boda",done:true},{id:"j13t3",title:"Entrega",done:false}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2026-03-26", updatedAt: "2026-03-26" },
      { id: "j14", clientId: "c05", name: "Ana Lucía García Wedding", jobType: "Wedding", status: "Delivered", shootDate: "2026-04-04", value: 35500, location: "San Cristobal Mixco", package: "Signature", brideName: "Ana Lucía", groomName: "Pedro Pablo", venue: "San Cristobal Mixco", weddingDate: "2026-04-04", ceremonyTime: "15:00", receptionTime: "18:00", guestCount: 221, coordinator: "Kevin Lemus", secondShooter: "Luis Lemus", videographer: "Henry Gil", notes: "Boda de Ana Lucía García. Paquete Signature.", currentStage: "Delivered", tasks: [{id:"j14t1",title:"Pre-boda",done:true},{id:"j14t2",title:"Boda",done:true},{id:"j14t3",title:"Entrega",done:true}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2026-04-04", updatedAt: "2026-04-04" },
      { id: "j15", clientId: "c06", name: "José Manuel Rodríguez Wedding", jobType: "Wedding", status: "Editing", shootDate: "2026-05-10", value: 13500, location: "Casa de los Sueños", package: "Foto Gold", brideName: "José Manuel", groomName: "Sofía Esperanza", venue: "Casa de los Sueños", weddingDate: "2026-05-10", ceremonyTime: "15:00", receptionTime: "18:00", guestCount: 227, coordinator: "Kevin Lemus", secondShooter: "Josema Teque", videographer: "Marvin Rustrian", notes: "Boda de José Manuel Rodríguez. Paquete Foto Gold.", currentStage: "Editing", tasks: [{id:"j15t1",title:"Pre-boda",done:true},{id:"j15t2",title:"Boda",done:true},{id:"j15t3",title:"Entrega",done:false}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2026-05-10", updatedAt: "2026-05-10" },
      { id: "j16", clientId: "c07", name: "Sofía Esperanza Martínez Wedding", jobType: "Wedding", status: "Delivered", shootDate: "2026-06-07", value: 20500, location: "Hotel Casa Santo Domingo", package: "Mix Gold", brideName: "Sofía Esperanza", groomName: "Daniela Cristina", venue: "Hotel Casa Santo Domingo", weddingDate: "2026-06-07", ceremonyTime: "15:00", receptionTime: "18:00", guestCount: 249, coordinator: "Kevin Lemus", secondShooter: "Alfredo Yuman", videographer: "Henry Gil", notes: "Boda de Sofía Esperanza Martínez. Paquete Mix Gold.", currentStage: "Delivered", tasks: [{id:"j16t1",title:"Pre-boda",done:true},{id:"j16t2",title:"Boda",done:true},{id:"j16t3",title:"Entrega",done:true}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2026-06-07", updatedAt: "2026-06-07" },
      { id: "j17", clientId: "c08", name: "Pedro Pablo Hernández Wedding", jobType: "Wedding", status: "Confirmed", shootDate: "2026-07-08", value: 29500, location: "Hacienda San Joaquín", package: "Mix Platinum", brideName: "Pedro Pablo", groomName: "Andrés Felipe", venue: "Hacienda San Joaquín", weddingDate: "2026-07-08", ceremonyTime: "15:00", receptionTime: "18:00", guestCount: 139, coordinator: "Kevin Lemus", secondShooter: "Marvin Rustrian", videographer: "Henry Gil", notes: "Boda de Pedro Pablo Hernández. Paquete Mix Platinum.", currentStage: "Confirmed", tasks: [{id:"j17t1",title:"Pre-boda",done:true},{id:"j17t2",title:"Boda",done:false},{id:"j17t3",title:"Entrega",done:false}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2026-07-08", updatedAt: "2026-07-08" },
      { id: "j18", clientId: "c09", name: "Daniela Cristina Sánchez Wedding", jobType: "Wedding", status: "Confirmed", shootDate: "2026-08-28", value: 35500, location: "Jardín El Cerro, Fraijanes", package: "Signature", brideName: "Daniela Cristina", groomName: "Valeria Isabel", venue: "Jardín El Cerro, Fraijanes", weddingDate: "2026-08-28", ceremonyTime: "15:00", receptionTime: "18:00", guestCount: 151, coordinator: "Kevin Lemus", secondShooter: "Alfredo Yuman", videographer: "Josema Teque", notes: "Boda de Daniela Cristina Sánchez. Paquete Signature.", currentStage: "Confirmed", tasks: [{id:"j18t1",title:"Pre-boda",done:true},{id:"j18t2",title:"Boda",done:false},{id:"j18t3",title:"Entrega",done:false}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2026-08-28", updatedAt: "2026-08-28" },
      { id: "j19", clientId: "c10", name: "Andrés Felipe Morales Wedding", jobType: "Wedding", status: "Confirmed", shootDate: "2026-09-15", value: 13500, location: "Centenario Eventos", package: "Foto Gold", brideName: "Andrés Felipe", groomName: "Tomás Emiliano", venue: "Centenario Eventos", weddingDate: "2026-09-15", ceremonyTime: "15:00", receptionTime: "18:00", guestCount: 174, coordinator: "Kevin Lemus", secondShooter: "Marvin Rustrian", videographer: "Alfredo Yuman", notes: "Boda de Andrés Felipe Morales. Paquete Foto Gold.", currentStage: "Confirmed", tasks: [{id:"j19t1",title:"Pre-boda",done:true},{id:"j19t2",title:"Boda",done:false},{id:"j19t3",title:"Entrega",done:false}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2026-09-15", updatedAt: "2026-09-15" },
      { id: "j20", clientId: "c01", name: "Valeria Isabel Castillo Wedding", jobType: "Wedding", status: "Confirmed", shootDate: "2026-10-12", value: 20500, location: "Hotel Soleil Pacífico", package: "Mix Gold", brideName: "Valeria Isabel", groomName: "Luciana Isabel", venue: "Hotel Soleil Pacífico", weddingDate: "2026-10-12", ceremonyTime: "15:00", receptionTime: "18:00", guestCount: 245, coordinator: "Kevin Lemus", secondShooter: "Henry Gil", videographer: "Marvin Rustrian", notes: "Boda de Valeria Isabel Castillo. Paquete Mix Gold.", currentStage: "Confirmed", tasks: [{id:"j20t1",title:"Pre-boda",done:true},{id:"j20t2",title:"Boda",done:false},{id:"j20t3",title:"Entrega",done:false}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2026-10-12", updatedAt: "2026-10-12" },
      { id: "j21", clientId: "c02", name: "Carlos Ramírez Wedding", jobType: "Wedding", status: "Confirmed", shootDate: "2027-01-03", value: 13500, location: "Antigua Guatemala", package: "Foto Gold", brideName: "Carlos", groomName: "María José", venue: "Antigua Guatemala", weddingDate: "2027-01-03", ceremonyTime: "15:00", receptionTime: "18:00", guestCount: 216, coordinator: "Kevin Lemus", secondShooter: "Josema Teque", videographer: "Alfredo Yuman", notes: "Boda de Carlos Ramírez. Paquete Foto Gold.", currentStage: "Confirmed", tasks: [{id:"j21t1",title:"Pre-boda",done:true},{id:"j21t2",title:"Boda",done:false},{id:"j21t3",title:"Entrega",done:false}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2027-01-03", updatedAt: "2027-01-03" },
      { id: "j22", clientId: "c03", name: "María José Pérez Wedding", jobType: "Wedding", status: "Quote Sent", shootDate: "2027-02-24", value: 20500, location: "Hotel Atitlán, Panajachel", package: "Mix Gold", brideName: "María José", groomName: "Luis Fernando", venue: "Hotel Atitlán, Panajachel", weddingDate: "2027-02-24", ceremonyTime: "15:00", receptionTime: "18:00", guestCount: 198, coordinator: "Kevin Lemus", secondShooter: "Henry Gil", videographer: "Alfredo Yuman", notes: "Boda de María José Pérez. Paquete Mix Gold.", currentStage: "Quote Sent", tasks: [{id:"j22t1",title:"Pre-boda",done:false},{id:"j22t2",title:"Boda",done:false},{id:"j22t3",title:"Entrega",done:false}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2027-02-24", updatedAt: "2027-02-24" },
      { id: "j23", clientId: "c04", name: "Luis Fernando López Wedding", jobType: "Wedding", status: "Quote Sent", shootDate: "2027-03-13", value: 29500, location: "Mesón Panza Verde", package: "Mix Platinum", brideName: "Luis Fernando", groomName: "Ana Lucía", venue: "Mesón Panza Verde", weddingDate: "2027-03-13", ceremonyTime: "15:00", receptionTime: "18:00", guestCount: 136, coordinator: "Kevin Lemus", secondShooter: "Marvin Rustrian", videographer: "None", notes: "Boda de Luis Fernando López. Paquete Mix Platinum.", currentStage: "Quote Sent", tasks: [{id:"j23t1",title:"Pre-boda",done:false},{id:"j23t2",title:"Boda",done:false},{id:"j23t3",title:"Entrega",done:false}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2027-03-13", updatedAt: "2027-03-13" },
      { id: "j24", clientId: "c05", name: "Ana Lucía García Wedding", jobType: "Wedding", status: "Confirmed", shootDate: "2027-04-22", value: 35500, location: "San Cristobal Mixco", package: "Signature", brideName: "Ana Lucía", groomName: "Pedro Pablo", venue: "San Cristobal Mixco", weddingDate: "2027-04-22", ceremonyTime: "15:00", receptionTime: "18:00", guestCount: 138, coordinator: "Kevin Lemus", secondShooter: "Marvin Rustrian", videographer: "Henry Gil", notes: "Boda de Ana Lucía García. Paquete Signature.", currentStage: "Confirmed", tasks: [{id:"j24t1",title:"Pre-boda",done:true},{id:"j24t2",title:"Boda",done:false},{id:"j24t3",title:"Entrega",done:false}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2027-04-22", updatedAt: "2027-04-22" },
      { id: "j25", clientId: "c06", name: "José Manuel Rodríguez Wedding", jobType: "Wedding", status: "Quote Sent", shootDate: "2027-05-27", value: 13500, location: "Casa de los Sueños", package: "Foto Gold", brideName: "José Manuel", groomName: "Sofía Esperanza", venue: "Casa de los Sueños", weddingDate: "2027-05-27", ceremonyTime: "15:00", receptionTime: "18:00", guestCount: 182, coordinator: "Kevin Lemus", secondShooter: "Alfredo Yuman", videographer: "Marvin Rustrian", notes: "Boda de José Manuel Rodríguez. Paquete Foto Gold.", currentStage: "Quote Sent", tasks: [{id:"j25t1",title:"Pre-boda",done:false},{id:"j25t2",title:"Boda",done:false},{id:"j25t3",title:"Entrega",done:false}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2027-05-27", updatedAt: "2027-05-27" },
      { id: "j26", clientId: "c07", name: "Sofía Esperanza Martínez Wedding", jobType: "Wedding", status: "Quote Sent", shootDate: "2027-06-09", value: 20500, location: "Hotel Casa Santo Domingo", package: "Mix Gold", brideName: "Sofía Esperanza", groomName: "Daniela Cristina", venue: "Hotel Casa Santo Domingo", weddingDate: "2027-06-09", ceremonyTime: "15:00", receptionTime: "18:00", guestCount: 225, coordinator: "Kevin Lemus", secondShooter: "Alfredo Yuman", videographer: "Alfredo Yuman", notes: "Boda de Sofía Esperanza Martínez. Paquete Mix Gold.", currentStage: "Quote Sent", tasks: [{id:"j26t1",title:"Pre-boda",done:false},{id:"j26t2",title:"Boda",done:false},{id:"j26t3",title:"Entrega",done:false}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2027-06-09", updatedAt: "2027-06-09" },
      { id: "j27", clientId: "c08", name: "Pedro Pablo Hernández Wedding", jobType: "Wedding", status: "Confirmed", shootDate: "2027-07-23", value: 29500, location: "Hacienda San Joaquín", package: "Mix Platinum", brideName: "Pedro Pablo", groomName: "Andrés Felipe", venue: "Hacienda San Joaquín", weddingDate: "2027-07-23", ceremonyTime: "15:00", receptionTime: "18:00", guestCount: 247, coordinator: "Kevin Lemus", secondShooter: "Marvin Rustrian", videographer: "Alfredo Yuman", notes: "Boda de Pedro Pablo Hernández. Paquete Mix Platinum.", currentStage: "Confirmed", tasks: [{id:"j27t1",title:"Pre-boda",done:true},{id:"j27t2",title:"Boda",done:false},{id:"j27t3",title:"Entrega",done:false}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2027-07-23", updatedAt: "2027-07-23" },
      { id: "j28", clientId: "c09", name: "Daniela Cristina Sánchez Wedding", jobType: "Wedding", status: "Quote Sent", shootDate: "2027-08-16", value: 35500, location: "Jardín El Cerro, Fraijanes", package: "Signature", brideName: "Daniela Cristina", groomName: "Valeria Isabel", venue: "Jardín El Cerro, Fraijanes", weddingDate: "2027-08-16", ceremonyTime: "15:00", receptionTime: "18:00", guestCount: 116, coordinator: "Kevin Lemus", secondShooter: "Luis Lemus", videographer: "Josema Teque", notes: "Boda de Daniela Cristina Sánchez. Paquete Signature.", currentStage: "Quote Sent", tasks: [{id:"j28t1",title:"Pre-boda",done:false},{id:"j28t2",title:"Boda",done:false},{id:"j28t3",title:"Entrega",done:false}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2027-08-16", updatedAt: "2027-08-16" },
      { id: "j29", clientId: "c10", name: "Andrés Felipe Morales Wedding", jobType: "Wedding", status: "Quote Sent", shootDate: "2027-09-09", value: 13500, location: "Centenario Eventos", package: "Foto Gold", brideName: "Andrés Felipe", groomName: "Tomás Emiliano", venue: "Centenario Eventos", weddingDate: "2027-09-09", ceremonyTime: "15:00", receptionTime: "18:00", guestCount: 223, coordinator: "Kevin Lemus", secondShooter: "Henry Gil", videographer: "Alfredo Yuman", notes: "Boda de Andrés Felipe Morales. Paquete Foto Gold.", currentStage: "Quote Sent", tasks: [{id:"j29t1",title:"Pre-boda",done:false},{id:"j29t2",title:"Boda",done:false},{id:"j29t3",title:"Entrega",done:false}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2027-09-09", updatedAt: "2027-09-09" },
      { id: "j30", clientId: "c01", name: "Valeria Isabel Castillo Wedding", jobType: "Wedding", status: "Confirmed", shootDate: "2027-10-18", value: 20500, location: "Hotel Soleil Pacífico", package: "Mix Gold", brideName: "Valeria Isabel", groomName: "Luciana Isabel", venue: "Hotel Soleil Pacífico", weddingDate: "2027-10-18", ceremonyTime: "15:00", receptionTime: "18:00", guestCount: 189, coordinator: "Kevin Lemus", secondShooter: "Marvin Rustrian", videographer: "None", notes: "Boda de Valeria Isabel Castillo. Paquete Mix Gold.", currentStage: "Confirmed", tasks: [{id:"j30t1",title:"Pre-boda",done:true},{id:"j30t2",title:"Boda",done:false},{id:"j30t3",title:"Entrega",done:false}], coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", createdAt: "2027-10-18", updatedAt: "2027-10-18" }
    ],
    tments: [
      { id: "a1", title: "Sophie & Gary — Timeline Meeting", date: daysFrom(3), time: "15:30", type: "Meeting", clientId: "c1", jobId: "j1", location: "Studio / Zoom" },
      { id: "a2", title: "Ben Family Portrait Session", date: daysFrom(-5), time: "09:00", type: "Main Shoot", clientId: "c4", jobId: "j3", location: "Forest Park" },
      { id: "a3", title: "Northwind Corporate Headshots", date: daysFrom(25), time: "10:00", type: "Main Shoot", clientId: "c6", jobId: "j5", location: "Northwind HQ" },
      { id: "a4", title: "Sophie & Gary Wedding", date: daysFrom(21), time: "12:00", endTime: "22:00", type: "Main Shoot", clientId: "c1", jobId: "j1", location: "Rosewood Estate" },
      { id: "a5", title: "Album pick up — Anna & Deon", date: daysFrom(6), time: "16:00", type: "Appointment", clientId: "c3", jobId: "j4", location: "Studio" },
      { id: "a6", title: "Thomas & Ellie Wedding", date: daysFrom(55), time: "11:00", endTime: "21:00", type: "Main Shoot", clientId: "c2", jobId: "j2", location: "The Grand Hall" },
    ],
    [
      { id: "qt20251000", number: "QT-2025-1000", type: "Quote", clientId: "c02", jobId: "j01", status: "Accepted", issueDate: "2025-01-19", dueDate: "2025-01-19", taxRate: 0, discount: 0, items: [{ id: "j01i1", description: "Foto Gold - Cobertura completa", quantity: 1, unitPrice: 13500 }], payments: [] },,
      { id: "inv20252001", number: "INV-2025-2001", type: "Invoice", clientId: "c02", jobId: "j01", status: "Paid", issueDate: "2025-01-19", dueDate: "2025-01-19", taxRate: 0, discount: 0, items: [{ id: "inv20252001i1", description: "Foto Gold - Anticipo", quantity: 1, unitPrice: 6750.0 }], payments: [{ id: "pinv20252001", amount: 6750.0, date: "2025-01-19", method: "Transfer", note: "Foto Gold - Anticipo" }] },,
      { id: "inv20252002", number: "INV-2025-2002", type: "Invoice", clientId: "c02", jobId: "j01", status: "Paid", issueDate: "2025-01-19", dueDate: "2025-01-19", taxRate: 0, discount: 0, items: [{ id: "inv20252002i1", description: "Foto Gold - Pago 2", quantity: 1, unitPrice: 6750.0 }], payments: [{ id: "pinv20252002", amount: 6750.0, date: "2025-01-19", method: "Transfer", note: "Foto Gold - Pago 2" }] },,
      { id: "qt20251003", number: "QT-2025-1003", type: "Quote", clientId: "c03", jobId: "j02", status: "Accepted", issueDate: "2025-02-12", dueDate: "2025-02-12", taxRate: 0, discount: 0, items: [{ id: "j02i1", description: "Mix Gold - Cobertura completa", quantity: 1, unitPrice: 20500 }], payments: [] },,
      { id: "inv20252004", number: "INV-2025-2004", type: "Invoice", clientId: "c03", jobId: "j02", status: "Paid", issueDate: "2025-02-12", dueDate: "2025-02-12", taxRate: 0, discount: 0, items: [{ id: "inv20252004i1", description: "Mix Gold - Anticipo", quantity: 1, unitPrice: 20500.0 }], payments: [{ id: "pinv20252004", amount: 20500.0, date: "2025-02-12", method: "Transfer", note: "Mix Gold - Anticipo" }] },,
      { id: "qt20251005", number: "QT-2025-1005", type: "Quote", clientId: "c04", jobId: "j03", status: "Accepted", issueDate: "2025-03-05", dueDate: "2025-03-05", taxRate: 0, discount: 0, items: [{ id: "j03i1", description: "Mix Platinum - Cobertura completa", quantity: 1, unitPrice: 29500 }], payments: [] },,
      { id: "inv20252006", number: "INV-2025-2006", type: "Invoice", clientId: "c04", jobId: "j03", status: "Paid", issueDate: "2025-03-05", dueDate: "2025-03-05", taxRate: 0, discount: 0, items: [{ id: "inv20252006i1", description: "Mix Platinum - Anticipo", quantity: 1, unitPrice: 9833.33 }], payments: [{ id: "pinv20252006", amount: 9833.33, date: "2025-03-05", method: "Transfer", note: "Mix Platinum - Anticipo" }] },,
      { id: "inv20252007", number: "INV-2025-2007", type: "Invoice", clientId: "c04", jobId: "j03", status: "Paid", issueDate: "2025-03-05", dueDate: "2025-03-05", taxRate: 0, discount: 0, items: [{ id: "inv20252007i1", description: "Mix Platinum - Pago 2", quantity: 1, unitPrice: 9833.33 }], payments: [{ id: "pinv20252007", amount: 9833.33, date: "2025-03-05", method: "Transfer", note: "Mix Platinum - Pago 2" }] },,
      { id: "inv20252008", number: "INV-2025-2008", type: "Invoice", clientId: "c04", jobId: "j03", status: "Paid", issueDate: "2025-03-05", dueDate: "2025-03-05", taxRate: 0, discount: 0, items: [{ id: "inv20252008i1", description: "Mix Platinum - Pago 3", quantity: 1, unitPrice: 9833.33 }], payments: [{ id: "pinv20252008", amount: 9833.33, date: "2025-03-05", method: "Transfer", note: "Mix Platinum - Pago 3" }] },,
      { id: "qt20251009", number: "QT-2025-1009", type: "Quote", clientId: "c05", jobId: "j04", status: "Accepted", issueDate: "2025-04-16", dueDate: "2025-04-16", taxRate: 0, discount: 0, items: [{ id: "j04i1", description: "Signature - Cobertura completa", quantity: 1, unitPrice: 35500 }], payments: [] },,
      { id: "inv20252010", number: "INV-2025-2010", type: "Invoice", clientId: "c05", jobId: "j04", status: "Paid", issueDate: "2025-04-16", dueDate: "2025-04-16", taxRate: 0, discount: 0, items: [{ id: "inv20252010i1", description: "Signature - Anticipo", quantity: 1, unitPrice: 35500.0 }], payments: [{ id: "pinv20252010", amount: 35500.0, date: "2025-04-16", method: "Transfer", note: "Signature - Anticipo" }] },,
      { id: "qt20251011", number: "QT-2025-1011", type: "Quote", clientId: "c06", jobId: "j05", status: "Accepted", issueDate: "2025-05-25", dueDate: "2025-05-25", taxRate: 0, discount: 0, items: [{ id: "j05i1", description: "Foto Gold - Cobertura completa", quantity: 1, unitPrice: 13500 }], payments: [] },,
      { id: "inv20252012", number: "INV-2025-2012", type: "Invoice", clientId: "c06", jobId: "j05", status: "Paid", issueDate: "2025-05-25", dueDate: "2025-05-25", taxRate: 0, discount: 0, items: [{ id: "inv20252012i1", description: "Foto Gold - Anticipo", quantity: 1, unitPrice: 13500.0 }], payments: [{ id: "pinv20252012", amount: 13500.0, date: "2025-05-25", method: "Transfer", note: "Foto Gold - Anticipo" }] },,
      { id: "qt20251013", number: "QT-2025-1013", type: "Quote", clientId: "c07", jobId: "j06", status: "Accepted", issueDate: "2025-06-28", dueDate: "2025-06-28", taxRate: 0, discount: 0, items: [{ id: "j06i1", description: "Mix Gold - Cobertura completa", quantity: 1, unitPrice: 20500 }], payments: [] },,
      { id: "inv20252014", number: "INV-2025-2014", type: "Invoice", clientId: "c07", jobId: "j06", status: "Paid", issueDate: "2025-06-28", dueDate: "2025-06-28", taxRate: 0, discount: 0, items: [{ id: "inv20252014i1", description: "Mix Gold - Anticipo", quantity: 1, unitPrice: 20500.0 }], payments: [{ id: "pinv20252014", amount: 20500.0, date: "2025-06-28", method: "Transfer", note: "Mix Gold - Anticipo" }] },,
      { id: "qt20251015", number: "QT-2025-1015", type: "Quote", clientId: "c08", jobId: "j07", status: "Accepted", issueDate: "2025-07-05", dueDate: "2025-07-05", taxRate: 0, discount: 0, items: [{ id: "j07i1", description: "Mix Platinum - Cobertura completa", quantity: 1, unitPrice: 29500 }], payments: [] },,
      { id: "inv20252016", number: "INV-2025-2016", type: "Invoice", clientId: "c08", jobId: "j07", status: "Paid", issueDate: "2025-07-05", dueDate: "2025-07-05", taxRate: 0, discount: 0, items: [{ id: "inv20252016i1", description: "Mix Platinum - Anticipo", quantity: 1, unitPrice: 9833.33 }], payments: [{ id: "pinv20252016", amount: 9833.33, date: "2025-07-05", method: "Transfer", note: "Mix Platinum - Anticipo" }] },,
      { id: "inv20252017", number: "INV-2025-2017", type: "Invoice", clientId: "c08", jobId: "j07", status: "Paid", issueDate: "2025-07-05", dueDate: "2025-07-05", taxRate: 0, discount: 0, items: [{ id: "inv20252017i1", description: "Mix Platinum - Pago 2", quantity: 1, unitPrice: 9833.33 }], payments: [{ id: "pinv20252017", amount: 9833.33, date: "2025-07-05", method: "Transfer", note: "Mix Platinum - Pago 2" }] },,
      { id: "inv20252018", number: "INV-2025-2018", type: "Invoice", clientId: "c08", jobId: "j07", status: "Paid", issueDate: "2025-07-05", dueDate: "2025-07-05", taxRate: 0, discount: 0, items: [{ id: "inv20252018i1", description: "Mix Platinum - Pago 3", quantity: 1, unitPrice: 9833.33 }], payments: [{ id: "pinv20252018", amount: 9833.33, date: "2025-07-05", method: "Transfer", note: "Mix Platinum - Pago 3" }] },,
      { id: "qt20251019", number: "QT-2025-1019", type: "Quote", clientId: "c09", jobId: "j08", status: "Accepted", issueDate: "2025-08-06", dueDate: "2025-08-06", taxRate: 0, discount: 0, items: [{ id: "j08i1", description: "Signature - Cobertura completa", quantity: 1, unitPrice: 35500 }], payments: [] },,
      { id: "inv20252020", number: "INV-2025-2020", type: "Invoice", clientId: "c09", jobId: "j08", status: "Paid", issueDate: "2025-08-06", dueDate: "2025-08-06", taxRate: 0, discount: 0, items: [{ id: "inv20252020i1", description: "Signature - Anticipo", quantity: 1, unitPrice: 11833.33 }], payments: [{ id: "pinv20252020", amount: 11833.33, date: "2025-08-06", method: "Transfer", note: "Signature - Anticipo" }] },,
      { id: "inv20252021", number: "INV-2025-2021", type: "Invoice", clientId: "c09", jobId: "j08", status: "Paid", issueDate: "2025-08-06", dueDate: "2025-08-06", taxRate: 0, discount: 0, items: [{ id: "inv20252021i1", description: "Signature - Pago 2", quantity: 1, unitPrice: 11833.33 }], payments: [{ id: "pinv20252021", amount: 11833.33, date: "2025-08-06", method: "Transfer", note: "Signature - Pago 2" }] },,
      { id: "inv20252022", number: "INV-2025-2022", type: "Invoice", clientId: "c09", jobId: "j08", status: "Paid", issueDate: "2025-08-06", dueDate: "2025-08-06", taxRate: 0, discount: 0, items: [{ id: "inv20252022i1", description: "Signature - Pago 3", quantity: 1, unitPrice: 11833.33 }], payments: [{ id: "pinv20252022", amount: 11833.33, date: "2025-08-06", method: "Transfer", note: "Signature - Pago 3" }] },,
      { id: "qt20251023", number: "QT-2025-1023", type: "Quote", clientId: "c10", jobId: "j09", status: "Accepted", issueDate: "2025-09-14", dueDate: "2025-09-14", taxRate: 0, discount: 0, items: [{ id: "j09i1", description: "Foto Gold - Cobertura completa", quantity: 1, unitPrice: 13500 }], payments: [] },,
      { id: "inv20252024", number: "INV-2025-2024", type: "Invoice", clientId: "c10", jobId: "j09", status: "Paid", issueDate: "2025-09-14", dueDate: "2025-09-14", taxRate: 0, discount: 0, items: [{ id: "inv20252024i1", description: "Foto Gold - Anticipo", quantity: 1, unitPrice: 4500.0 }], payments: [{ id: "pinv20252024", amount: 4500.0, date: "2025-09-14", method: "Transfer", note: "Foto Gold - Anticipo" }] },,
      { id: "inv20252025", number: "INV-2025-2025", type: "Invoice", clientId: "c10", jobId: "j09", status: "Paid", issueDate: "2025-09-14", dueDate: "2025-09-14", taxRate: 0, discount: 0, items: [{ id: "inv20252025i1", description: "Foto Gold - Pago 2", quantity: 1, unitPrice: 4500.0 }], payments: [{ id: "pinv20252025", amount: 4500.0, date: "2025-09-14", method: "Transfer", note: "Foto Gold - Pago 2" }] },,
      { id: "inv20252026", number: "INV-2025-2026", type: "Invoice", clientId: "c10", jobId: "j09", status: "Paid", issueDate: "2025-09-14", dueDate: "2025-09-14", taxRate: 0, discount: 0, items: [{ id: "inv20252026i1", description: "Foto Gold - Pago 3", quantity: 1, unitPrice: 4500.0 }], payments: [{ id: "pinv20252026", amount: 4500.0, date: "2025-09-14", method: "Transfer", note: "Foto Gold - Pago 3" }] },,
      { id: "qt20251027", number: "QT-2025-1027", type: "Quote", clientId: "c01", jobId: "j10", status: "Accepted", issueDate: "2025-10-03", dueDate: "2025-10-03", taxRate: 0, discount: 0, items: [{ id: "j10i1", description: "Mix Gold - Cobertura completa", quantity: 1, unitPrice: 20500 }], payments: [] },,
      { id: "inv20252028", number: "INV-2025-2028", type: "Invoice", clientId: "c01", jobId: "j10", status: "Paid", issueDate: "2025-10-03", dueDate: "2025-10-03", taxRate: 0, discount: 0, items: [{ id: "inv20252028i1", description: "Mix Gold - Anticipo", quantity: 1, unitPrice: 10250.0 }], payments: [{ id: "pinv20252028", amount: 10250.0, date: "2025-10-03", method: "Transfer", note: "Mix Gold - Anticipo" }] },,
      { id: "inv20252029", number: "INV-2025-2029", type: "Invoice", clientId: "c01", jobId: "j10", status: "Paid", issueDate: "2025-10-03", dueDate: "2025-10-03", taxRate: 0, discount: 0, items: [{ id: "inv20252029i1", description: "Mix Gold - Pago 2", quantity: 1, unitPrice: 10250.0 }], payments: [{ id: "pinv20252029", amount: 10250.0, date: "2025-10-03", method: "Transfer", note: "Mix Gold - Pago 2" }] },,
      { id: "qt20251030", number: "QT-2025-1030", type: "Quote", clientId: "c02", jobId: "j11", status: "Accepted", issueDate: "2026-01-13", dueDate: "2026-01-13", taxRate: 0, discount: 0, items: [{ id: "j11i1", description: "Foto Gold - Cobertura completa", quantity: 1, unitPrice: 13500 }], payments: [] },,
      { id: "inv20252031", number: "INV-2025-2031", type: "Invoice", clientId: "c02", jobId: "j11", status: "Paid", issueDate: "2026-01-13", dueDate: "2026-01-13", taxRate: 0, discount: 0, items: [{ id: "inv20252031i1", description: "Foto Gold - Anticipo", quantity: 1, unitPrice: 4500.0 }], payments: [{ id: "pinv20252031", amount: 4500.0, date: "2026-01-13", method: "Transfer", note: "Foto Gold - Anticipo" }] },,
      { id: "inv20252032", number: "INV-2025-2032", type: "Invoice", clientId: "c02", jobId: "j11", status: "Paid", issueDate: "2026-01-13", dueDate: "2026-01-13", taxRate: 0, discount: 0, items: [{ id: "inv20252032i1", description: "Foto Gold - Pago 2", quantity: 1, unitPrice: 4500.0 }], payments: [{ id: "pinv20252032", amount: 4500.0, date: "2026-01-13", method: "Transfer", note: "Foto Gold - Pago 2" }] },,
      { id: "inv20252033", number: "INV-2025-2033", type: "Invoice", clientId: "c02", jobId: "j11", status: "Paid", issueDate: "2026-01-13", dueDate: "2026-01-13", taxRate: 0, discount: 0, items: [{ id: "inv20252033i1", description: "Foto Gold - Pago 3", quantity: 1, unitPrice: 4500.0 }], payments: [{ id: "pinv20252033", amount: 4500.0, date: "2026-01-13", method: "Transfer", note: "Foto Gold - Pago 3" }] },,
      { id: "qt20251034", number: "QT-2025-1034", type: "Quote", clientId: "c03", jobId: "j12", status: "Accepted", issueDate: "2026-02-15", dueDate: "2026-02-15", taxRate: 0, discount: 0, items: [{ id: "j12i1", description: "Mix Gold - Cobertura completa", quantity: 1, unitPrice: 20500 }], payments: [] },,
      { id: "inv20252035", number: "INV-2025-2035", type: "Invoice", clientId: "c03", jobId: "j12", status: "Paid", issueDate: "2026-02-15", dueDate: "2026-02-15", taxRate: 0, discount: 0, items: [{ id: "inv20252035i1", description: "Mix Gold - Anticipo", quantity: 1, unitPrice: 6833.33 }], payments: [{ id: "pinv20252035", amount: 6833.33, date: "2026-02-15", method: "Transfer", note: "Mix Gold - Anticipo" }] },,
      { id: "inv20252036", number: "INV-2025-2036", type: "Invoice", clientId: "c03", jobId: "j12", status: "Paid", issueDate: "2026-02-15", dueDate: "2026-02-15", taxRate: 0, discount: 0, items: [{ id: "inv20252036i1", description: "Mix Gold - Pago 2", quantity: 1, unitPrice: 6833.33 }], payments: [{ id: "pinv20252036", amount: 6833.33, date: "2026-02-15", method: "Transfer", note: "Mix Gold - Pago 2" }] },,
      { id: "inv20252037", number: "INV-2025-2037", type: "Invoice", clientId: "c03", jobId: "j12", status: "Paid", issueDate: "2026-02-15", dueDate: "2026-02-15", taxRate: 0, discount: 0, items: [{ id: "inv20252037i1", description: "Mix Gold - Pago 3", quantity: 1, unitPrice: 6833.33 }], payments: [{ id: "pinv20252037", amount: 6833.33, date: "2026-02-15", method: "Transfer", note: "Mix Gold - Pago 3" }] },,
      { id: "qt20251038", number: "QT-2025-1038", type: "Quote", clientId: "c04", jobId: "j13", status: "Accepted", issueDate: "2026-03-09", dueDate: "2026-03-09", taxRate: 0, discount: 0, items: [{ id: "j13i1", description: "Mix Platinum - Cobertura completa", quantity: 1, unitPrice: 29500 }], payments: [] },,
      { id: "inv20252039", number: "INV-2025-2039", type: "Invoice", clientId: "c04", jobId: "j13", status: "Paid", issueDate: "2026-03-09", dueDate: "2026-03-09", taxRate: 0, discount: 0, items: [{ id: "inv20252039i1", description: "Mix Platinum - Anticipo", quantity: 1, unitPrice: 9833.33 }], payments: [{ id: "pinv20252039", amount: 9833.33, date: "2026-03-09", method: "Transfer", note: "Mix Platinum - Anticipo" }] },,
      { id: "inv20252040", number: "INV-2025-2040", type: "Invoice", clientId: "c04", jobId: "j13", status: "Paid", issueDate: "2026-03-09", dueDate: "2026-03-09", taxRate: 0, discount: 0, items: [{ id: "inv20252040i1", description: "Mix Platinum - Pago 2", quantity: 1, unitPrice: 9833.33 }], payments: [{ id: "pinv20252040", amount: 9833.33, date: "2026-03-09", method: "Transfer", note: "Mix Platinum - Pago 2" }] },,
      { id: "inv20252041", number: "INV-2025-2041", type: "Invoice", clientId: "c04", jobId: "j13", status: "Paid", issueDate: "2026-03-09", dueDate: "2026-03-09", taxRate: 0, discount: 0, items: [{ id: "inv20252041i1", description: "Mix Platinum - Pago 3", quantity: 1, unitPrice: 9833.33 }], payments: [{ id: "pinv20252041", amount: 9833.33, date: "2026-03-09", method: "Transfer", note: "Mix Platinum - Pago 3" }] },,
      { id: "qt20251042", number: "QT-2025-1042", type: "Quote", clientId: "c05", jobId: "j14", status: "Accepted", issueDate: "2026-04-28", dueDate: "2026-04-28", taxRate: 0, discount: 0, items: [{ id: "j14i1", description: "Signature - Cobertura completa", quantity: 1, unitPrice: 35500 }], payments: [] },,
      { id: "inv20252043", number: "INV-2025-2043", type: "Invoice", clientId: "c05", jobId: "j14", status: "Paid", issueDate: "2026-04-28", dueDate: "2026-04-28", taxRate: 0, discount: 0, items: [{ id: "inv20252043i1", description: "Signature - Anticipo", quantity: 1, unitPrice: 35500.0 }], payments: [{ id: "pinv20252043", amount: 35500.0, date: "2026-04-28", method: "Transfer", note: "Signature - Anticipo" }] },,
      { id: "qt20251044", number: "QT-2025-1044", type: "Quote", clientId: "c06", jobId: "j15", status: "Accepted", issueDate: "2026-05-22", dueDate: "2026-05-22", taxRate: 0, discount: 0, items: [{ id: "j15i1", description: "Foto Gold - Cobertura completa", quantity: 1, unitPrice: 13500 }], payments: [] },,
      { id: "inv20252045", number: "INV-2025-2045", type: "Invoice", clientId: "c06", jobId: "j15", status: "Paid", issueDate: "2026-05-22", dueDate: "2026-05-22", taxRate: 0, discount: 0, items: [{ id: "inv20252045i1", description: "Foto Gold - Anticipo", quantity: 1, unitPrice: 4500.0 }], payments: [{ id: "pinv20252045", amount: 4500.0, date: "2026-05-22", method: "Transfer", note: "Foto Gold - Anticipo" }] },,
      { id: "inv20252046", number: "INV-2025-2046", type: "Invoice", clientId: "c06", jobId: "j15", status: "Paid", issueDate: "2026-05-22", dueDate: "2026-05-22", taxRate: 0, discount: 0, items: [{ id: "inv20252046i1", description: "Foto Gold - Pago 2", quantity: 1, unitPrice: 4500.0 }], payments: [{ id: "pinv20252046", amount: 4500.0, date: "2026-05-22", method: "Transfer", note: "Foto Gold - Pago 2" }] },,
      { id: "inv20252047", number: "INV-2025-2047", type: "Invoice", clientId: "c06", jobId: "j15", status: "Paid", issueDate: "2026-05-22", dueDate: "2026-05-22", taxRate: 0, discount: 0, items: [{ id: "inv20252047i1", description: "Foto Gold - Pago 3", quantity: 1, unitPrice: 4500.0 }], payments: [{ id: "pinv20252047", amount: 4500.0, date: "2026-05-22", method: "Transfer", note: "Foto Gold - Pago 3" }] },,
      { id: "qt20251048", number: "QT-2025-1048", type: "Quote", clientId: "c07", jobId: "j16", status: "Accepted", issueDate: "2026-06-04", dueDate: "2026-06-04", taxRate: 0, discount: 0, items: [{ id: "j16i1", description: "Mix Gold - Cobertura completa", quantity: 1, unitPrice: 20500 }], payments: [] },,
      { id: "inv20252049", number: "INV-2025-2049", type: "Invoice", clientId: "c07", jobId: "j16", status: "Paid", issueDate: "2026-06-04", dueDate: "2026-06-04", taxRate: 0, discount: 0, items: [{ id: "inv20252049i1", description: "Mix Gold - Anticipo", quantity: 1, unitPrice: 6833.33 }], payments: [{ id: "pinv20252049", amount: 6833.33, date: "2026-06-04", method: "Transfer", note: "Mix Gold - Anticipo" }] },,
      { id: "inv20252050", number: "INV-2025-2050", type: "Invoice", clientId: "c07", jobId: "j16", status: "Paid", issueDate: "2026-06-04", dueDate: "2026-06-04", taxRate: 0, discount: 0, items: [{ id: "inv20252050i1", description: "Mix Gold - Pago 2", quantity: 1, unitPrice: 6833.33 }], payments: [{ id: "pinv20252050", amount: 6833.33, date: "2026-06-04", method: "Transfer", note: "Mix Gold - Pago 2" }] },,
      { id: "inv20252051", number: "INV-2025-2051", type: "Invoice", clientId: "c07", jobId: "j16", status: "Paid", issueDate: "2026-06-04", dueDate: "2026-06-04", taxRate: 0, discount: 0, items: [{ id: "inv20252051i1", description: "Mix Gold - Pago 3", quantity: 1, unitPrice: 6833.33 }], payments: [{ id: "pinv20252051", amount: 6833.33, date: "2026-06-04", method: "Transfer", note: "Mix Gold - Pago 3" }] },,
      { id: "qt20251052", number: "QT-2025-1052", type: "Quote", clientId: "c08", jobId: "j17", status: "Accepted", issueDate: "2026-07-18", dueDate: "2026-07-18", taxRate: 0, discount: 0, items: [{ id: "j17i1", description: "Mix Platinum - Cobertura completa", quantity: 1, unitPrice: 29500 }], payments: [] },,
      { id: "inv20252053", number: "INV-2025-2053", type: "Invoice", clientId: "c08", jobId: "j17", status: "Paid", issueDate: "2026-07-01", dueDate: "2026-07-01", taxRate: 0, discount: 0, items: [{ id: "inv20252053i1", description: "Mix Platinum - Anticipo", quantity: 1, unitPrice: 14750.0 }], payments: [{ id: "pinv20252053", amount: 14750.0, date: "2026-07-01", method: "Transfer", note: "Mix Platinum - Anticipo" }] },,
      { id: "qt20251054", number: "QT-2025-1054", type: "Quote", clientId: "c09", jobId: "j18", status: "Accepted", issueDate: "2026-08-25", dueDate: "2026-08-25", taxRate: 0, discount: 0, items: [{ id: "j18i1", description: "Signature - Cobertura completa", quantity: 1, unitPrice: 35500 }], payments: [] },,
      { id: "inv20252055", number: "INV-2025-2055", type: "Invoice", clientId: "c09", jobId: "j18", status: "Paid", issueDate: "2026-08-01", dueDate: "2026-08-01", taxRate: 0, discount: 0, items: [{ id: "inv20252055i1", description: "Signature - Anticipo", quantity: 1, unitPrice: 17750.0 }], payments: [{ id: "pinv20252055", amount: 17750.0, date: "2026-08-01", method: "Transfer", note: "Signature - Anticipo" }] },,
      { id: "qt20251056", number: "QT-2025-1056", type: "Quote", clientId: "c10", jobId: "j19", status: "Accepted", issueDate: "2026-09-09", dueDate: "2026-09-09", taxRate: 0, discount: 0, items: [{ id: "j19i1", description: "Foto Gold - Cobertura completa", quantity: 1, unitPrice: 13500 }], payments: [] },,
      { id: "inv20252057", number: "INV-2025-2057", type: "Invoice", clientId: "c10", jobId: "j19", status: "Paid", issueDate: "2026-09-01", dueDate: "2026-09-01", taxRate: 0, discount: 0, items: [{ id: "inv20252057i1", description: "Foto Gold - Anticipo", quantity: 1, unitPrice: 6750.0 }], payments: [{ id: "pinv20252057", amount: 6750.0, date: "2026-09-01", method: "Transfer", note: "Foto Gold - Anticipo" }] },,
      { id: "qt20251058", number: "QT-2025-1058", type: "Quote", clientId: "c01", jobId: "j20", status: "Accepted", issueDate: "2026-10-25", dueDate: "2026-10-25", taxRate: 0, discount: 0, items: [{ id: "j20i1", description: "Mix Gold - Cobertura completa", quantity: 1, unitPrice: 20500 }], payments: [] },,
      { id: "inv20252059", number: "INV-2025-2059", type: "Invoice", clientId: "c01", jobId: "j20", status: "Paid", issueDate: "2026-10-01", dueDate: "2026-10-01", taxRate: 0, discount: 0, items: [{ id: "inv20252059i1", description: "Mix Gold - Anticipo", quantity: 1, unitPrice: 10250.0 }], payments: [{ id: "pinv20252059", amount: 10250.0, date: "2026-10-01", method: "Transfer", note: "Mix Gold - Anticipo" }] },,
      { id: "qt20251060", number: "QT-2025-1060", type: "Quote", clientId: "c02", jobId: "j21", status: "Accepted", issueDate: "2027-01-21", dueDate: "2027-01-21", taxRate: 0, discount: 0, items: [{ id: "j21i1", description: "Foto Gold - Cobertura completa", quantity: 1, unitPrice: 13500 }], payments: [] },,
      { id: "qt20251061", number: "QT-2025-1061", type: "Quote", clientId: "c03", jobId: "j22", status: "Accepted", issueDate: "2027-02-11", dueDate: "2027-02-11", taxRate: 0, discount: 0, items: [{ id: "j22i1", description: "Mix Gold - Cobertura completa", quantity: 1, unitPrice: 20500 }], payments: [] },,
      { id: "qt20251062", number: "QT-2025-1062", type: "Quote", clientId: "c04", jobId: "j23", status: "Accepted", issueDate: "2027-03-04", dueDate: "2027-03-04", taxRate: 0, discount: 0, items: [{ id: "j23i1", description: "Mix Platinum - Cobertura completa", quantity: 1, unitPrice: 29500 }], payments: [] },,
      { id: "qt20251063", number: "QT-2025-1063", type: "Quote", clientId: "c05", jobId: "j24", status: "Accepted", issueDate: "2027-04-10", dueDate: "2027-04-10", taxRate: 0, discount: 0, items: [{ id: "j24i1", description: "Signature - Cobertura completa", quantity: 1, unitPrice: 35500 }], payments: [] },,
      { id: "qt20251064", number: "QT-2025-1064", type: "Quote", clientId: "c06", jobId: "j25", status: "Accepted", issueDate: "2027-05-14", dueDate: "2027-05-14", taxRate: 0, discount: 0, items: [{ id: "j25i1", description: "Foto Gold - Cobertura completa", quantity: 1, unitPrice: 13500 }], payments: [] },,
      { id: "qt20251065", number: "QT-2025-1065", type: "Quote", clientId: "c07", jobId: "j26", status: "Accepted", issueDate: "2027-06-06", dueDate: "2027-06-06", taxRate: 0, discount: 0, items: [{ id: "j26i1", description: "Mix Gold - Cobertura completa", quantity: 1, unitPrice: 20500 }], payments: [] },,
      { id: "qt20251066", number: "QT-2025-1066", type: "Quote", clientId: "c08", jobId: "j27", status: "Accepted", issueDate: "2027-07-15", dueDate: "2027-07-15", taxRate: 0, discount: 0, items: [{ id: "j27i1", description: "Mix Platinum - Cobertura completa", quantity: 1, unitPrice: 29500 }], payments: [] },,
      { id: "qt20251067", number: "QT-2025-1067", type: "Quote", clientId: "c09", jobId: "j28", status: "Accepted", issueDate: "2027-08-01", dueDate: "2027-08-01", taxRate: 0, discount: 0, items: [{ id: "j28i1", description: "Signature - Cobertura completa", quantity: 1, unitPrice: 35500 }], payments: [] },,
      { id: "qt20251068", number: "QT-2025-1068", type: "Quote", clientId: "c10", jobId: "j29", status: "Accepted", issueDate: "2027-09-24", dueDate: "2027-09-24", taxRate: 0, discount: 0, items: [{ id: "j29i1", description: "Foto Gold - Cobertura completa", quantity: 1, unitPrice: 13500 }], payments: [] },,
      { id: "qt20251069", number: "QT-2025-1069", type: "Quote", clientId: "c01", jobId: "j30", status: "Accepted", issueDate: "2027-10-24", dueDate: "2027-10-24", taxRate: 0, discount: 0, items: [{ id: "j30i1", description: "Mix Gold - Cobertura completa", quantity: 1, unitPrice: 20500 }], payments: [] },
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
