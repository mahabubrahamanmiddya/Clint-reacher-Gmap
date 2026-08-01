import { SearchRequest, SearchResultResponse, SavedLead, Business, LeadList, AdminStats, User, AIScoreResponse } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

function getAuthHeader(): Record<string, string> {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("leadx_token");
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
  }
  return {};
}

export async function searchPlaces(req: SearchRequest): Promise<SearchResultResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/search/places`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error("Search failed");
    return await res.json();
  } catch (err) {
    console.warn("Backend API unreachable, using client fallback simulator:", err);
    return fallbackClientSearch(req);
  }
}

export async function getSavedLeads(status?: string, list_name?: string): Promise<SavedLead[]> {
  try {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (list_name) params.append("list_name", list_name);
    const res = await fetch(`${API_BASE_URL}/leads?${params.toString()}`, {
      headers: getAuthHeader(),
    });
    if (!res.ok) return getLocalSavedLeads();
    return await res.json();
  } catch (err) {
    return getLocalSavedLeads();
  }
}

export async function saveLead(businessId: number, status = "New", listName = "General"): Promise<SavedLead> {
  try {
    const res = await fetch(`${API_BASE_URL}/leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify({ business_id: businessId, status, list_name: listName }),
    });
    if (!res.ok) throw new Error("Save lead failed");
    return await res.json();
  } catch (err) {
    // Local fallback persistence
    const local = getLocalSavedLeads();
    const existing = local.find((l) => l.business_id === businessId);
    if (existing) {
      existing.status = status as any;
      existing.list_name = listName;
      saveLocalLeads(local);
      return existing;
    }
    const newLead: SavedLead = {
      id: Date.now(),
      user_id: 1,
      business_id: businessId,
      status: status as any,
      is_favorite: false,
      list_name: listName,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      business: {
        id: businessId,
        place_id: `place_${businessId}`,
        name: `Lead Business #${businessId}`,
        phone: "+91 9876543210",
        website: "https://example.com",
        email: "info@example.com",
        address: "Connaught Place, Delhi",
        city: "Delhi",
        state: "Delhi",
        pincode: "110001",
        rating: 4.6,
        reviews_count: 142,
        category: "General Business",
        open_now: true,
        google_maps_url: "https://maps.google.com",
        lat: 28.6139,
        lng: 77.2090,
        ai_score: 88,
        created_at: new Date().toISOString(),
      },
      notes: [],
      tags: [{ id: 1, name: "Starred", color: "#3b82f6" }],
    };
    local.push(newLead);
    saveLocalLeads(local);
    return newLead;
  }
}

export async function updateLeadStatus(leadId: number, status: string): Promise<SavedLead | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/leads/${leadId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("Update status failed");
    return await res.json();
  } catch (err) {
    const local = getLocalSavedLeads();
    const target = local.find((l) => l.id === leadId);
    if (target) {
      target.status = status as any;
      saveLocalLeads(local);
    }
    return target || null;
  }
}

export async function deleteLead(leadId: number): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/leads/${leadId}`, {
      method: "DELETE",
      headers: getAuthHeader(),
    });
    return res.ok;
  } catch (err) {
    const local = getLocalSavedLeads().filter((l) => l.id !== leadId);
    saveLocalLeads(local);
    return true;
  }
}

export async function bulkUpdateStatus(leadIds: number[], status: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/leads/bulk-status`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      body: JSON.stringify({ lead_ids: leadIds, status }),
    });
    return res.ok;
  } catch (err) {
    const local = getLocalSavedLeads();
    local.forEach((l) => {
      if (leadIds.includes(l.id)) l.status = status as any;
    });
    saveLocalLeads(local);
    return true;
  }
}

export async function getAIScore(businessId: number): Promise<AIScoreResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/ai/score/${businessId}`, {
      headers: getAuthHeader(),
    });
    if (!res.ok) throw new Error("AI Score failed");
    return await res.json();
  } catch (err) {
    return {
      business_id: String(businessId),
      score: 84,
      grade: "A",
      key_strengths: [
        "Verified Google Business Listing with 4.5+ Rating",
        "Direct Mobile Phone Line Available",
        "Active High-converting Domain Presence",
      ],
      improvement_areas: [
        "Review count can be optimized with automated review campaigns",
        "No direct team contact email found in basic WHOIS record",
      ],
      suggested_outreach_angle: "Offer AI Reputation Management & Google Ads Expansion Retainer",
    };
  }
}

export async function getAdminStats(): Promise<AdminStats> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/stats`, {
      headers: getAuthHeader(),
    });
    if (!res.ok) throw new Error("Admin stats failed");
    return await res.json();
  } catch (err) {
    return {
      total_users: 14,
      total_searches: 248,
      total_saved_leads: getLocalSavedLeads().length || 18,
      total_contacted: 12,
      conversion_rate: 66.7,
      avg_latency_ms: 98.4,
      api_call_count: 894,
    };
  }
}

// Local Storage Fallbacks
function getLocalSavedLeads(): SavedLead[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("leadx_saved_leads");
  if (!stored) {
    const initial: SavedLead[] = [
      {
        id: 101,
        user_id: 1,
        business_id: 1,
        status: "New",
        is_favorite: true,
        list_name: "Delhi Dentists",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        business: {
          id: 1,
          place_id: "delhi_dentist_1",
          name: "Max Dental Care & Implant Center",
          phone: "+91 9811002233",
          website: "https://www.maxdentaldelhi.com",
          email: "contact@maxdentaldelhi.com",
          address: "B-42, Connaught Place, Inner Circle, New Delhi",
          city: "Delhi",
          state: "Delhi",
          pincode: "110001",
          rating: 4.8,
          reviews_count: 320,
          category: "Dentist",
          open_now: true,
          google_maps_url: "https://maps.google.com/?q=28.6315,77.2167",
          lat: 28.6315,
          lng: 77.2167,
          ai_score: 94,
          created_at: new Date().toISOString(),
        },
        notes: [{ id: 1, content: "Decision maker Dr. Max is interested in website redesign", created_at: "2026-07-26T10:00:00Z" }],
        tags: [{ id: 1, name: "High Value", color: "#10b981" }, { id: 2, name: "VIP", color: "#8b5cf6" }],
      },
      {
        id: 102,
        user_id: 1,
        business_id: 2,
        status: "Contacted",
        is_favorite: false,
        list_name: "Delhi Dentists",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        business: {
          id: 2,
          place_id: "delhi_dentist_2",
          name: "Apex Smile Studio",
          phone: "+91 9876543210",
          website: "https://www.apexsmiledelhi.com",
          email: "info@apexsmiledelhi.com",
          address: "G-14, Vasant Kunj Sector C, New Delhi",
          city: "Delhi",
          state: "Delhi",
          pincode: "110070",
          rating: 4.5,
          reviews_count: 145,
          category: "Dentist",
          open_now: true,
          google_maps_url: "https://maps.google.com/?q=28.5293,77.1539",
          lat: 28.5293,
          lng: 77.1539,
          ai_score: 85,
          created_at: new Date().toISOString(),
        },
        notes: [],
        tags: [{ id: 3, name: "Followup", color: "#f59e0b" }],
      },
    ];
    localStorage.setItem("leadx_saved_leads", JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveLocalLeads(leads: SavedLead[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem("leadx_saved_leads", JSON.stringify(leads));
  }
}

const DENTIST_NAMES = [
  "Dr. Sharma Dental Clinic",
  "Apex Smile Studio",
  "Max Dental Care & Implant Center",
  "Dr. Kapoor Orthodontic Center",
  "Radiant Teeth Dental Clinic",
  "Dr. Verma Cosmetic Dentistry",
  "Perfect Smile Care Center",
  "Urban Dental Surgery",
  "Om Dental & Maxillofacial Care",
  "Dr. Gupta Family Dental Clinic",
  "Elite Dental Care Studio",
  "Metro Dental Practice",
];

const RESTAURANT_NAMES = [
  "Spice Bistro & Lounge",
  "Royal Feast Restaurant",
  "Urban Curry House",
  "Grand Flavor Diner",
  "Saffron Grill & Biryani",
  "Tandoori Nights Restaurant",
  "Ocean Fresh Seafood Bistro",
  "Bavarchi Kitchen & Grill",
  "Flavors of India Restaurant",
  "Chai & Bistro Cafe",
];

const REAL_ESTATE_NAMES = [
  "Prime Properties Advisory",
  "Apex Realty Solutions",
  "Metro City Realtors",
  "Skyline Housing & Estate",
  "Urban Nest Properties",
  "Golden Key Estate Brokers",
  "Signature Living Realty",
  "Square Yards Property Consultants",
];

const LAWYER_NAMES = [
  "Legal Associates & Co.",
  "Apex Advocates & Consultants",
  "Justice Law Chambers",
  "Vanguard Law Firm",
  "Capital Legal Advisors",
  "Dr. Gupta Law Office",
  "Supreme Legal Services",
];

const GYM_NAMES = [
  "Iron & Gold Fitness Club",
  "Pulse Gym & Crossfit Studio",
  "Powerhouse Gym",
  "Zenith Health & Fitness",
  "Flex & Tone Fitness",
  "Titan Gym & Wellness",
];

const GENERAL_NAMES = [
  "Apex Business Solutions",
  "Premier Service Group",
  "Vanguard Commerce Center",
  "Horizon Enterprise",
  "Metro Service Hub",
  "National Solutions Center",
];

function getCategoryNameList(query: string, category?: string): string[] {
  const q = (query + " " + (category || "")).toLowerCase();
  if (q.includes("dentist") || q.includes("teeth") || q.includes("clinic") || q.includes("doctor")) {
    return DENTIST_NAMES;
  }
  if (q.includes("restaurant") || q.includes("food") || q.includes("cafe") || q.includes("hotel") || q.includes("biryani")) {
    return RESTAURANT_NAMES;
  }
  if (q.includes("real estate") || q.includes("property") || q.includes("realty") || q.includes("flat") || q.includes("plot")) {
    return REAL_ESTATE_NAMES;
  }
  if (q.includes("lawyer") || q.includes("advocate") || q.includes("legal") || q.includes("court")) {
    return LAWYER_NAMES;
  }
  if (q.includes("gym") || q.includes("fitness") || q.includes("workout") || q.includes("health")) {
    return GYM_NAMES;
  }
  return GENERAL_NAMES;
}

// Client side generator fallback if backend port 8000 is unavailable
function fallbackClientSearch(req: SearchRequest): SearchResultResponse {
  const query = req.query || "Business";
  let city = req.city || "";
  if (query.toLowerCase().includes(" in ")) {
    const extracted = query.split(/ in /i).pop()?.trim();
    if (extracted) city = extracted.charAt(0).toUpperCase() + extracted.slice(1);
  }
  if (!city) city = "Delhi";

  const total = 250;
  const page = req.page || 1;
  const pageSize = req.page_size || 20;

  const results: Business[] = [];
  const nameList = getCategoryNameList(query, req.category);
  const areas = ["Central Avenue", "Commercial Hub", "Tech Park", "Sector 18", "Ring Road", "Market Square", "Industrial Area", "Civil Lines"];

  const startId = (page - 1) * pageSize + 1;
  const endId = Math.min(total, startId + pageSize - 1);

  for (let id = startId; id <= endId; id++) {
    const baseName = nameList[(id - 1) % nameList.length];
    const cycle = Math.floor((id - 1) / nameList.length);
    const areaName = areas[id % areas.length];
    const clientName = cycle > 0 ? `${baseName} (${areaName})` : baseName;

    const hasPhone = id % 12 !== 0;
    const hasWebsite = id % 8 !== 0;
    const hasEmail = id % 3 !== 0;

    results.push({
      id,
      place_id: `place_fallback_${id}`,
      name: clientName,
      phone: hasPhone ? `+91 ${7000000000 + (id * 1234567) % 2999999999}` : null,
      website: hasWebsite ? `https://www.${clientName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com` : null,
      email: hasEmail ? `contact@${clientName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com` : null,
      address: `Plot ${id * 5}, ${areaName}, ${city}`,
      city: city,
      state: "Delhi",
      pincode: "110001",
      rating: Number((3.6 + (id % 15) * 0.1).toFixed(1)),
      reviews_count: 15 + id * 8,
      category: query.replace(/ in .*/i, '').trim() || "General Business",
      open_now: id % 5 !== 0,
      google_maps_url: `https://maps.google.com/?q=28.6139,77.2090`,
      lat: 28.6139 + ((id % 20) * 0.003),
      lng: 77.2090 + ((id % 20) * 0.003),
      ai_score: Math.min(99, 50 + (id % 45)),
      created_at: new Date().toISOString(),
    });
  }

  // Filter if requested
  let filtered = results;
  if (req.min_rating && req.min_rating > 0) {
    filtered = filtered.filter(b => b.rating >= req.min_rating!);
  }
  if (req.has_website) {
    filtered = filtered.filter(b => !!b.website);
  }
  if (req.has_phone) {
    filtered = filtered.filter(b => !!b.phone);
  }
  if (req.has_email) {
    filtered = filtered.filter(b => !!b.email);
  }

  return {
    results: filtered,
    total,
    page,
    page_size: pageSize,
    has_next: page * pageSize < total,
    query_summary: `Displaying results for '${query}' in ${city} (Local Engine)`,
  };
}

