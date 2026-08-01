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
export const STORAGE_KEY_META_CLOUD_CREDS = "leadx_meta_cloud_creds_v1";

export interface MetaCloudCredentials {
  phoneId: string;
  token: string;
  accountId?: string;
  isCloudApiEnabled: boolean;
}

export const DEFAULT_META_CLOUD_CREDS: MetaCloudCredentials = {
  phoneId: "1137486026112189",
  token: "EAANGVdmYP0QBSCahdRjPNU3MoFaCmxWAe3Q5jxZBdp3pmG8TLF5grIKdOauD7j755F8ZAEmmYJhV3L7ZCk1XoPNwXevJCSMsWqlgzLK8MuQYiLKSHcW7H7mN5HS6RQQn6cGQSNVU0jTXYchQ5d4rQSRVZAT77AozlmrdTz406ZC5OqoXf4Ke3Cisp1XMTfPKki30IpDceoMEm2pZBYq9c2ooolpZAjZCVJjfEYCUXzwJjG3RFboRumTQkTTfX9nkFG2rsmvkm2IpUYdKVkOWtmYPvwZDZD",
  accountId: "1499988068175778",
  isCloudApiEnabled: true,
};

export function getMetaCloudCredentials(): MetaCloudCredentials {
  if (typeof window === "undefined") {
    return DEFAULT_META_CLOUD_CREDS;
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY_META_CLOUD_CREDS);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure token matches the active fresh DEFAULT_META_CLOUD_CREDS token
      if (!parsed.token || parsed.token !== DEFAULT_META_CLOUD_CREDS.token) {
        localStorage.setItem(STORAGE_KEY_META_CLOUD_CREDS, JSON.stringify(DEFAULT_META_CLOUD_CREDS));
        return DEFAULT_META_CLOUD_CREDS;
      }
      return parsed;
    }
  } catch (e) {
    console.error("Failed to load Meta Cloud credentials", e);
  }
  return DEFAULT_META_CLOUD_CREDS;
}

export function saveMetaCloudCredentials(creds: Partial<MetaCloudCredentials>) {
  if (typeof window === "undefined") return;
  const current = getMetaCloudCredentials();
  const updated = { ...current, ...creds };
  localStorage.setItem(STORAGE_KEY_META_CLOUD_CREDS, JSON.stringify(updated));
  return updated;
}

export async function sendMetaCloudMessageDirect(
  phone: string,
  messageText: string
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  const creds = getMetaCloudCredentials();
  const phoneId = creds.phoneId;
  const token = creds.token;

  if (!phoneId || !token) {
    return {
      success: false,
      error: "Meta WhatsApp Cloud API credentials missing. Please enter Phone ID and Access Token.",
    };
  }

  const cleanPhone = phone.replace(/\D/g, "");
  const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  try {
    // 1st Attempt: Try sending text payload
    const textPayload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: targetPhone,
      type: "text",
      text: { preview_url: false, body: messageText },
    };

    let response = await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(textPayload),
    });

    let resData = await response.json();
    if (response.ok && resData.messages?.[0]?.id) {
      return { success: true, messageId: resData.messages[0].id };
    }

    // 2nd Attempt: If Meta requires a template for business-initiated conversation, send hello_world template
    const templatePayload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: targetPhone,
      type: "template",
      template: {
        name: "hello_world",
        language: { code: "en_US" }
      }
    };

    response = await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(templatePayload),
    });

    resData = await response.json();
    if (response.ok && resData.messages?.[0]?.id) {
      return { success: true, messageId: resData.messages[0].id };
    } else {
      return {
        success: false,
        error: resData.error?.message || "Meta Cloud API Error",
      };
    }
  } catch (e: any) {
    return { success: false, error: e.message || "Network request error" };
  }
}

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
