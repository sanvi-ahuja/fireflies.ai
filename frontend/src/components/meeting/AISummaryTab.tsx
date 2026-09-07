"use client";

import { Summary } from "@/lib/types";
import { Sparkles, CheckCircle2, Bookmark, Play } from "lucide-react";

interface AISummaryTabProps {
  summary?: Summary;
  onSeekTimestamp: (seconds: number) => void;
}

export default function AISummaryTab({ summary, onSeekTimestamp }: AISummaryTabProps) {
  if (!summary) {
    return (
      <div className="bg-[#121721] border border-[#202b3d] rounded-2xl p-8 text-center text-slate-500 text-xs">
        Generating AI Meeting Summary...
      </div>
    );
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-5">
      {/* Executive Overview */}
      <div className="bg-gradient-to-r from-violet-950/30 to-indigo-950/20 border border-violet-500/30 rounded-2xl p-5 relative overflow-hidden shadow-lg">
        <div className="flex items-center space-x-2 text-violet-300 font-bold text-xs mb-2">
          <Sparkles className="w-4 h-4 text-violet-400" />
          <span>Executive Overview</span>
        </div>
        <p className="text-xs text-slate-200 leading-relaxed">{summary.overview}</p>
      </div>

      {/* Shorthand Takeaways */}
      <div className="bg-[#121721] border border-[#202b3d] rounded-2xl p-5 shadow-md">
        <h3 className="text-xs font-bold text-slate-200 flex items-center mb-3">
          <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-400" />
          Key Meeting Takeaways
        </h3>
        <ul className="space-y-2">
          {summary.shorthand_bullet_points.map((pt, i) => (
            <li key={i} className="flex items-start text-xs text-slate-300 leading-snug">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 mr-2.5 shrink-0"></span>
              <span>{pt}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Chapter Topics Breakdown */}
      <div className="bg-[#121721] border border-[#202b3d] rounded-2xl p-5 shadow-md">
        <h3 className="text-xs font-bold text-slate-200 flex items-center mb-3">
          <Bookmark className="w-4 h-4 mr-2 text-violet-400" />
          Chapters & Outline
        </h3>
        <div className="space-y-3">
          {summary.key_topics.map((topic, i) => (
            <div
              key={i}
              className="p-3 bg-[#161c28] border border-[#1f293a] rounded-xl flex items-start justify-between hover:border-violet-500/40 transition-colors"
            >
              <div>
                <h4 className="text-xs font-bold text-slate-100">{topic.topic}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">{topic.description}</p>
              </div>

              <button
                onClick={() => onSeekTimestamp(topic.timestamp)}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 font-mono text-[10px] border border-violet-500/30 font-semibold cursor-pointer shrink-0 ml-3"
              >
                <Play className="w-2.5 h-2.5 fill-current" />
                <span>{formatTime(topic.timestamp)}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
