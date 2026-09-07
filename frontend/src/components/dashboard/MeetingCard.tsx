"use client";

import Link from "next/link";
import { Meeting } from "@/lib/types";
import { Clock, Calendar, MessageSquare, CheckSquare, Trash2, ArrowRight } from "lucide-react";

interface MeetingCardProps {
  meeting: Meeting;
  onDelete: (id: string) => void;
}

export default function MeetingCard({ meeting, onDelete }: MeetingCardProps) {
  const formattedDate = new Date(meeting.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  const minutes = Math.floor(meeting.duration_seconds / 60);
  const seconds = meeting.duration_seconds % 60;
  const durationStr = `${minutes}m ${seconds}s`;

  return (
    <div className="group bg-[#121721] hover:bg-[#161d2a] border border-[#1e2736] hover:border-violet-500/40 rounded-xl p-5 transition-all duration-200 shadow-lg flex flex-col justify-between relative overflow-hidden">
      {/* Top Gradient Hover Highlight */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

      <div>
        {/* Header Metadata */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
          <div className="flex items-center space-x-2">
            <span className="flex items-center text-slate-400">
              <Calendar className="w-3.5 h-3.5 mr-1 text-slate-500" />
              {formattedDate}
            </span>
          </div>
          <span className="flex items-center px-2 py-0.5 rounded bg-[#1c2433] text-slate-300 font-mono text-[10px] border border-[#253145]">
            <Clock className="w-3 h-3 mr-1 text-violet-400" />
            {durationStr}
          </span>
        </div>

        {/* Meeting Title */}
        <Link href={`/meetings/${meeting.id}`}>
          <h2 className="text-sm font-bold text-slate-100 group-hover:text-violet-300 transition-colors line-clamp-2 leading-snug cursor-pointer mb-3">
            {meeting.title}
          </h2>
        </Link>
      </div>

      {/* Footer Info & Participants */}
      <div className="mt-4 pt-3 border-t border-[#1a2230] flex items-center justify-between">
        {/* Participants Stack */}
        <div className="flex items-center -space-x-2 overflow-hidden">
          {meeting.participants && meeting.participants.length > 0 ? (
            meeting.participants.slice(0, 4).map((p, idx) => (
              <img
                key={idx}
                src={p.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${p.name}`}
                alt={p.name}
                title={p.name}
                className="w-7 h-7 rounded-full border-2 border-[#121721] object-cover bg-slate-800"
              />
            ))
          ) : (
            <span className="text-[11px] text-slate-500">No participants</span>
          )}
          {meeting.participants && meeting.participants.length > 4 && (
            <span className="w-7 h-7 rounded-full bg-[#1e2736] text-[10px] text-slate-300 border-2 border-[#121721] flex items-center justify-center font-bold">
              +{meeting.participants.length - 4}
            </span>
          )}
        </div>

        {/* Stat Pills & Actions */}
        <div className="flex items-center space-x-3">
          <span className="flex items-center text-[11px] text-slate-400" title="Transcript Segments">
            <MessageSquare className="w-3.5 h-3.5 mr-1 text-slate-500" />
            {meeting.segment_count || 0}
          </span>
          <span className="flex items-center text-[11px] text-slate-400" title="Action Items">
            <CheckSquare className="w-3.5 h-3.5 mr-1 text-violet-400" />
            {meeting.action_item_count || 0}
          </span>

          <button
            onClick={(e) => {
              e.preventDefault();
              if (confirm(`Are you sure you want to delete "${meeting.title}"?`)) {
                onDelete(meeting.id);
              }
            }}
            title="Delete Meeting"
            className="p-1.5 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
