"use client";

import { useState, useRef, useEffect } from "react";
import { TranscriptSegment } from "@/lib/types";
import { Search, MessageSquare, Highlighter, Play } from "lucide-react";

interface InteractiveTranscriptProps {
  segments: TranscriptSegment[];
  currentTime: number;
  onSeekTimestamp: (seconds: number) => void;
}

export default function InteractiveTranscript({ segments, currentTime, onSeekTimestamp }: InteractiveTranscriptProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const activeRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to active transcript segment during audio playback
  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [currentTime]);

  const filteredSegments = segments.filter((seg) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return seg.text.toLowerCase().includes(q) || seg.speaker_name.toLowerCase().includes(q);
  });

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-amber-400/30 text-amber-200 px-0.5 rounded font-semibold">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="bg-[#121721] border border-[#202b3d] rounded-2xl p-5 flex flex-col h-[580px] shadow-xl">
      {/* Transcript Top Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-[#1e2736] mb-3">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center">
            <MessageSquare className="w-4 h-4 mr-2 text-violet-400" />
            Interactive Transcript
          </h2>
          <p className="text-[11px] text-slate-400">{segments.length} dialogue segments recorded</p>
        </div>

        {/* Filter / Search input */}
        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search within transcript..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#171e2c] border border-[#253145] rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500"
          />
        </div>
      </div>

      {/* Segments List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {filteredSegments.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-xs">
            No matching transcript segments found.
          </div>
        ) : (
          filteredSegments.map((seg) => {
            const isActive = currentTime >= seg.start_time && currentTime <= seg.end_time + 1.0;

            return (
              <div
                key={seg.id}
                ref={isActive ? activeRef : null}
                onClick={() => onSeekTimestamp(seg.start_time)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer relative group ${
                  isActive
                    ? "active-transcript-line bg-violet-950/20 border-violet-500/50 shadow-md shadow-violet-950/20"
                    : "bg-[#161c28] border-[#1f293a] hover:border-slate-700 hover:bg-[#1a2232]"
                }`}
              >
                {/* Segment Header */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-violet-600/30 text-violet-300 font-bold text-[10px] flex items-center justify-center border border-violet-500/30">
                      {seg.speaker_name[0] || "S"}
                    </div>
                    <span className="text-xs font-bold text-slate-200">{seg.speaker_name}</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSeekTimestamp(seg.start_time);
                    }}
                    className="flex items-center space-x-1 px-2 py-0.5 rounded bg-[#1f2a3d] hover:bg-violet-600/30 text-violet-300 font-mono text-[10px] transition-colors"
                  >
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>{formatTime(seg.start_time)}</span>
                  </button>
                </div>

                {/* Segment Text */}
                <p className="text-xs text-slate-300 leading-relaxed font-normal pl-8">
                  {highlightText(seg.text, searchQuery)}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
