"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  FolderKanban, 
  CheckSquare, 
  Zap, 
  Settings, 
  Sparkles, 
  Bot,
  Video,
  ChevronDown
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Meetings Library", href: "/", icon: FolderKanban, active: pathname === "/" || pathname.startsWith("/meetings") },
    { name: "Action Items", href: "#action-items", icon: CheckSquare, badge: "3 Pending" },
    { name: "Live Bot Joins", href: "#", icon: Bot, comingSoon: true },
    { name: "Integrations", href: "#", icon: Zap, comingSoon: true },
    { name: "Settings", href: "#", icon: Settings, comingSoon: true },
  ];

  return (
    <aside className="w-64 bg-[#0d1117] border-r border-[#1e2736] flex flex-col h-screen sticky top-0 z-30 select-none">
      {/* Workspace Branding Header */}
      <div className="p-4 border-b border-[#1e2736] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-white tracking-tight flex items-center">
              Fireflies.ai <span className="ml-1.5 px-1.5 py-0.5 text-[10px] bg-violet-500/20 text-violet-300 rounded border border-violet-500/30">PRO</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Engineering Workspace</p>
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-500" />
      </div>

      {/* Bot Status Card */}
      <div className="mx-3 my-3 p-3 rounded-lg bg-[#141b26] border border-[#202b3d] flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="relative">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
            <div className="absolute -inset-0.5 rounded-full bg-emerald-400 opacity-40 blur-xs"></div>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-200">Fred Notetaker Bot</p>
            <p className="text-[10px] text-slate-400">Ready for next call</p>
          </div>
        </div>
        <span className="text-xs px-2 py-1 bg-violet-600/20 text-violet-300 border border-violet-500/30 rounded font-medium">Auto-Join</span>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                item.active
                  ? "bg-violet-600/20 text-violet-200 border border-violet-500/30 shadow-xs"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#161d2a]"
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${item.active ? "text-violet-400" : "text-slate-400"}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="px-2 py-0.5 text-[10px] bg-violet-500/20 text-violet-300 rounded-full font-semibold">
                  {item.badge}
                </span>
              )}
              {item.comingSoon && (
                <span className="text-[9px] px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded font-medium border border-slate-700">
                  Soon
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-[#1e2736] bg-[#0d1117] flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <img
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
            alt="User avatar"
            className="w-8 h-8 rounded-full border border-violet-500/30 object-cover"
          />
          <div className="text-left">
            <p className="text-xs font-semibold text-slate-200 leading-tight">Sarah Chen</p>
            <p className="text-[10px] text-slate-400 leading-tight">sarah@fireflies.ai</p>
          </div>
        </div>
        <Video className="w-4 h-4 text-slate-500 hover:text-violet-400 cursor-pointer" />
      </div>
    </aside>
  );
}
