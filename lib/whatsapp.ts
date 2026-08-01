import { Business } from "@/lib/types";

export interface WhatsAppTemplateItem {
  id: number;
  name: string;
  text: string;
}

export const DEFAULT_WHATSAPP_TEMPLATES: WhatsAppTemplateItem[] = [
  {
    id: 1,
    name: "Msg 1: Initial Pitch",
    text: "Namaste {name}, humne aapki business profile Google Maps pe dekhi ({city}). Hum {category} businesses ko new local customers lane mein help karte hain. Kya hum connect kar sakte hain?",
  },
  {
    id: 2,
    name: "Msg 2: Follow-up",
    text: "Hi {name}, following up regarding our previous message. We have a customized growth plan ready for {category} in {city}. Let me know if you are free for 2 mins!",
  },
  {
    id: 3,
    name: "Msg 3: Special Offer",
    text: "Hello {name}, we are offering a complimentary Google Maps Profile & SEO Audit for {name}. Would you like us to share the free report?",
  },
  {
    id: 4,
    name: "Msg 4: Final Reminder",
    text: "Hi {name}, final check-in! If you're interested in increasing leads for {name} in {city}, feel free to reply anytime. Have a great day!",
  },
];

export const STORAGE_KEY_WHATSAPP_TEMPLATES = "leadx_whatsapp_templates_v2";

export function getWhatsAppTemplates(): WhatsAppTemplateItem[] {
  if (typeof window === "undefined") return DEFAULT_WHATSAPP_TEMPLATES;
  try {
    const saved = localStorage.getItem(STORAGE_KEY_WHATSAPP_TEMPLATES);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length >= 4) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to parse saved whatsapp templates:", e);
  }
  return DEFAULT_WHATSAPP_TEMPLATES;
}

export function setWhatsAppTemplates(templates: WhatsAppTemplateItem[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_WHATSAPP_TEMPLATES, JSON.stringify(templates));
  }
}

export function getWhatsAppTemplateById(id: number): string {
  const templates = getWhatsAppTemplates();
  const match = templates.find((t) => t.id === id);
  return match ? match.text : templates[0].text;
}

/**
 * Cleans phone number string into a clean digit sequence for WhatsApp wa.me link.
 * Handles Indian +91 default fallback for 10-digit numbers if country code is missing.
 */
export function formatPhoneForWhatsApp(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;

  if (digits.length === 10) {
    return `91${digits}`;
  }

  if (digits.length === 11 && digits.startsWith("0")) {
    return `91${digits.substring(1)}`;
  }

  return digits;
}

/**
 * Formats raw business names for WhatsApp outreach, stripping out technical mock suffixes like "#1", "Hub 1", " - Delhi".
 */
export function cleanBusinessName(rawName: string | null | undefined, city?: string | null): string {
  if (!rawName) return "Client";
  let clean = rawName.trim();

  // Strip trailing " Hub 1 - Delhi" or " Hub 2"
  clean = clean.replace(/\s+Hub\s+\d+(\s*-\s*.*)?$/i, "");
  
  // Strip trailing "#123" or "#1"
  clean = clean.replace(/\s+#\d+/g, "");

  // Strip trailing duplicate city names like " Delhi" or " - Delhi" if present
  if (city) {
    const cityRegex = new RegExp(`(\\s+-\\s+|\\s+)${city}$`, "i");
    clean = clean.replace(cityRegex, "");
  }

  return clean.trim() || "Client";
}

/**
 * Replaces template placeholders with actual business details and URL encodes the result.
 */
export function generateWhatsAppMessage(template: string, business?: any): string {
  if (!template) return "";
  if (!business) return template;

  // Handle nested business objects (e.g. SavedLead wrapping Business)
  const targetBiz = business.business ? business.business : business;

  const rawName =
    targetBiz.name ||
    targetBiz.business_name ||
    targetBiz.businessName ||
    targetBiz.title ||
    targetBiz.company ||
    targetBiz.company_name ||
    "Client";

  const city =
    targetBiz.city ||
    targetBiz.state ||
    targetBiz.location ||
    (targetBiz.address ? targetBiz.address.split(",")[0] : "") ||
    "your city";

  const businessName = cleanBusinessName(rawName, city);
  const category = targetBiz.category || targetBiz.type || "Business";
  const phone = targetBiz.phone || "";
  const rating = targetBiz.rating ? `${targetBiz.rating}★` : "5.0★";
  const website = targetBiz.website || "";

  return template
    .replace(/\{name\}/gi, businessName)
    .replace(/\{business_name\}/gi, businessName)
    .replace(/\{business\}/gi, businessName)
    .replace(/\{company\}/gi, businessName)
    .replace(/\{title\}/gi, businessName)
    .replace(/\{city\}/gi, city)
    .replace(/\{category\}/gi, category)
    .replace(/\{phone\}/gi, phone)
    .replace(/\{rating\}/gi, rating)
    .replace(/\{website\}/gi, website);
}

/**
 * Directly builds a wa.me URL from pre-formatted message text without re-processing template tags.
 */
export function buildWhatsAppDirectUrl(
  phone: string | null | undefined,
  formattedText: string
): string | null {
  const cleanPhone = formatPhoneForWhatsApp(phone);
  if (!cleanPhone) return null;
  const encodedText = encodeURIComponent(formattedText);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

/**
 * Builds the complete wa.me URL to launch WhatsApp.
 */
export function generateWhatsAppUrl(
  phone: string | null | undefined,
  template?: string,
  business?: Partial<Business>
): string | null {
  const cleanPhone = formatPhoneForWhatsApp(phone);
  if (!cleanPhone) return null;

  const rawTemplate = template || getWhatsAppTemplateById(1);
  const formattedText = generateWhatsAppMessage(rawTemplate, business);
  return buildWhatsAppDirectUrl(cleanPhone, formattedText);
}

/**
 * Opens WhatsApp directly in a new tab/window for a given phone, business info, and optional template index/id or custom text.
 */
export function sendWhatsAppMessage(
  phone: string | null | undefined,
  business?: Partial<Business>,
  templateIdOrText?: number | string
): boolean {
  let templateText: string;
  if (typeof templateIdOrText === "number") {
    templateText = getWhatsAppTemplateById(templateIdOrText);
  } else if (typeof templateIdOrText === "string" && templateIdOrText.trim() !== "") {
    templateText = templateIdOrText;
  } else {
    templateText = getWhatsAppTemplateById(1);
  }

  const url = generateWhatsAppUrl(phone, templateText, business);
  if (!url) return false;

  window.open(url, "_blank", "noopener,noreferrer");
  return true;
}
