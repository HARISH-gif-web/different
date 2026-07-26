export type Priority = "Low" | "Medium" | "High" | "Critical";

export interface Complaint {
  id: string;
  categorySlug: string;
  categoryName: string;
  complaintType: string;
  title: string;
  description: string;
  location: string;
  district: string;
  gps?: { lat: number; lng: number } | null;
  priority: Priority;
  anonymous: boolean;
  images: string[]; // data URLs
  videos: string[];
  audio: string[];
  citizen: { name?: string; phone?: string; email?: string } | null;
  department: string;
  status: "Registered" | "Under Review" | "Assigned" | "Work Started" | "Resolved";
  createdAt: number;
  timeline: { label: string; at: number; done: boolean }[];
  aiConfidence: number;
  feedback?: { rating: number; comment: string; satisfied: boolean; officerRating: number };
}

const KEY = "pm_complaints_v1";

function read(): Complaint[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function write(list: Complaint[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function generateComplaintId(): string {
  const y = new Date().getFullYear();
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `PM-${y}-${rand}`;
}

export function getSessionComplaintsCount(): number {
  if (typeof window === "undefined") return 0;
  return Number(sessionStorage.getItem("pm_session_complaints_count") || "0");
}

export function incrementSessionComplaintsCount() {
  if (typeof window === "undefined") return;
  const current = getSessionComplaintsCount();
  sessionStorage.setItem("pm_session_complaints_count", String(current + 1));
  window.dispatchEvent(new Event("pm-complaint-count-change"));
}

export function saveComplaint(c: Complaint) {
  const list = read();
  list.unshift(c);
  write(list);
  incrementSessionComplaintsCount();
}

export function getAllComplaints(): Complaint[] {
  return read();
}

export interface ComplaintStats {
  total: number;
  pending: number;
  resolved: number;
  inProgress: number;
}

export function getComplaintStats(): ComplaintStats {
  const list = getAllComplaints();
  const total = list.length;
  const pending = list.filter(
    (c) => c.status === "Registered" || c.status === "Under Review",
  ).length;
  const inProgress = list.filter(
    (c) => c.status === "Assigned" || c.status === "Work Started",
  ).length;
  const resolved = list.filter((c) => c.status === "Resolved").length;
  return { total, pending, resolved, inProgress };
}

export function findComplaint(query: string): Complaint[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const digits = q.replace(/\D/g, "");
  const last10 = digits.slice(-10);
  return read().filter((c) => {
    if (c.id.toLowerCase() === q) return true;
    const phone = c.citizen?.phone?.replace(/\D/g, "") ?? "";
    if (!phone) return false;
    if (last10 && phone.slice(-10) === last10) return true;
    return phone === digits;
  });
}

export function getComplaintsForSession(
  session: {
    email?: string;
    phone?: string;
  } | null,
): Complaint[] {
  if (!session) return [];
  const phone = (session.phone || "").replace(/\D/g, "").slice(-10);
  const email = (session.email || "").toLowerCase();
  return read().filter((c) => {
    const cPhone = (c.citizen?.phone || "").replace(/\D/g, "").slice(-10);
    const cEmail = (c.citizen?.email || "").toLowerCase();
    return (phone && cPhone === phone) || (email && cEmail === email);
  });
}

export function updateComplaint(id: string, patch: Partial<Complaint>) {
  const list = read();
  const idx = list.findIndex((c) => c.id === id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...patch };
    write(list);
  }
}

// Simulated officer workflow: stages advance automatically over time.
const STAGE_DELAYS_MS = [0, 20_000, 45_000, 75_000, 110_000];
const STATUS_ORDER = [
  "Registered",
  "Under Review",
  "Assigned",
  "Work Started",
  "Resolved",
] as const;

export function autoAdvanceComplaint(c: Complaint): Complaint {
  const elapsed = Date.now() - c.createdAt;
  let changed = false;
  const timeline = c.timeline.map((t, i) => {
    if (!t.done && elapsed >= STAGE_DELAYS_MS[i]) {
      changed = true;
      return { ...t, done: true, at: c.createdAt + STAGE_DELAYS_MS[i] };
    }
    return t;
  });
  if (!changed) return c;
  const doneCount = timeline.filter((t) => t.done).length;
  const status = STATUS_ORDER[Math.min(doneCount - 1, STATUS_ORDER.length - 1)];
  const updated = { ...c, timeline, status };
  updateComplaint(c.id, { timeline, status });
  return updated;
}
