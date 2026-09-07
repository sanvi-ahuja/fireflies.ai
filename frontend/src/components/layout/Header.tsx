"use client";

import { Search, Plus, Bell, Sparkles } from "lucide-react";

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenNewMeetingModal: () => void;
}

export default function Header({ searchQuery, setSearchQuery, onOpenNewMeetingModal }: HeaderProps) {
  return (
    <header className="h-16 bg-[#0d1117]/80 backdrop-blur-md border-b border-[#1e2736] px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Global Search Bar */}
      <div className="relative w-96">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search meetings by title, participant, or keyword..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#151c28] border border-[#202b3d] rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
        />
      </div>

      {/* Right Action Bar */}
      <div className="flex items-center space-x-3">
        <button 
          title="Notifications"
          className="p-2 rounded-lg bg-[#151c28] border border-[#202b3d] text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-all relative"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-violet-500 absolute top-1.5 right-1.5"></span>
        </button>

        <button
          onClick={onOpenNewMeetingModal}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-violet-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Upload / Add Meeting</span>
        </button>
      </div>
    </header>
  );
}
