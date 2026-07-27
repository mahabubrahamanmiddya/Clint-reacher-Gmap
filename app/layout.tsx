import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";

export const metadata: Metadata = {
  title: "LeadX — AI Lead Finder & Business Intelligence SaaS",
  description: "Internal CRM & Official Google Places Business Lead Search Dashboard for Sales Teams & Agencies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-[#0b0f19] text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        <Navbar />
        <main className="flex-1 pb-16">{children}</main>
        
        {/* Footer */}
        <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-400 bg-slate-950/60">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© 2026 LeadX SaaS — Powered by Official Google Places APIs & AI Intelligence</p>
            <div className="flex items-center gap-4 text-slate-400">
              <span className="hover:text-slate-200 cursor-pointer">Terms of Service</span>
              <span className="hover:text-slate-200 cursor-pointer">API Policy</span>
              <span className="hover:text-slate-200 cursor-pointer">Support</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
