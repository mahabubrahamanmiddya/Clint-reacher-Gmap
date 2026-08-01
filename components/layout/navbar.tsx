"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Database, MapPin, BarChart3, ShieldCheck, Sparkles, User, LogOut, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { WhatsAppTemplateModal } from "@/components/crm/whatsapp-template-modal";

export function Navbar() {
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [waModalOpen, setWaModalOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("leadx_user_email") || "demo@leadx.ai";
    setUserEmail(saved);
  }, []);

  const navItems = [
    { name: "Lead Search", href: "/", icon: Search },
    { name: "CRM Saved Leads", href: "/leads", icon: Database },
    { name: "Interactive Map", href: "/map", icon: MapPin },
    { name: "Dashboard Overview", href: "/dashboard", icon: BarChart3 },
    { name: "Admin Analytics", href: "/admin", icon: ShieldCheck },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 glass-nav border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-[#0A1128]" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
                  Lead<span className="gradient-text">X</span>
                </span>
                <span className="text-[10px] uppercase font-semibold text-amber-400 tracking-wider block -mt-1">
                  AI Lead Finder SaaS
                </span>
              </div>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm"
                        : "text-slate-300 hover:text-amber-200 hover:bg-amber-500/10"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-amber-400" : "text-slate-400"}`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right Action Items */}
            <div className="flex items-center gap-3">
              {/* WhatsApp Template Config Button */}
              <button
                onClick={() => setWaModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:text-emerald-200 text-xs font-bold transition-all shadow-sm"
                title="Configure Custom WhatsApp Outreach Message"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">WhatsApp Template</span>
              </button>

              {/* Live API Status indicator */}
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                API Ready
              </div>

              {/* Auth User Info */}
              <div className="flex items-center gap-2 pl-2 border-l border-amber-500/20">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 text-xs font-bold">
                  {userEmail ? userEmail.charAt(0).toUpperCase() : "U"}
                </div>
                <span className="hidden lg:inline text-xs font-medium text-slate-300 truncate max-w-[120px]">
                  {userEmail}
                </span>
                <Link
                  href="/login"
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                  title="Logout / Change User"
                >
                  <LogOut className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* WhatsApp Template Settings Modal */}
      <WhatsAppTemplateModal isOpen={waModalOpen} onClose={() => setWaModalOpen(false)} />
    </>
  );
}

