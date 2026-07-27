import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return Promise.resolve(false);
  return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
}

export function formatPhoneNumber(phone: string | null): string {
  if (!phone) return "N/A";
  return phone;
}

export function getStatusColor(status: string) {
  switch (status) {
    case "New":
      return "bg-blue-500/10 text-blue-400 border-blue-500/30";
    case "Contacted":
      return "bg-amber-500/10 text-amber-400 border-amber-500/30";
    case "Interested":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    case "Not Interested":
      return "bg-rose-500/10 text-rose-400 border-rose-500/30";
    case "Closed":
      return "bg-purple-500/10 text-purple-400 border-purple-500/30";
    default:
      return "bg-slate-500/10 text-slate-400 border-slate-500/30";
  }
}
