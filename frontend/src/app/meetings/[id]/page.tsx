"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import AudioPlayer from "@/components/meeting/AudioPlayer";
import InteractiveTranscript from "@/components/meeting/InteractiveTranscript";
import AISummaryTab from "@/components/meeting/AISummaryTab";
import ActionItemsManager from "@/components/meeting/ActionItemsManager";
import AskAIChatDrawer from "@/components/ai/AskAIChatDrawer";
import { MeetingDetail } from "@/lib/types";
import { fetchMeetingDetail } from "@/lib/api";
import { 
  ArrowLeft, 
  MessageSquare, 
  Sparkles, 
  CheckSquare, 
  Download, 
  Bot, 
  Calendar,
  Share2
} from "lucide-react";

export default function MeetingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const meetingId = resolvedParams.id;
  const router = useRouter();

  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeTab, setActiveTab] = useState<"transcript" | "summary" | "action_items">("transcript");
  const [isAskAIOpen, setIsAskAIOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchMeetingDetail(meetingId);
        setMeeting(data);
      } catch (err) {
        console.error("Error loading meeting detail", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [meetingId]);

  if (loading) {
    return (
      <div className="flex h-screen bg-[#090c10] items-center justify-center text-slate-400 text-xs">
        <div className="flex items-center space-x-3">
          <Sparkles className="w-5 h-5 animate-spin text-violet-500" />
          <span>Loading Fireflies Workspace...</span>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="flex h-screen bg-[#090c10] items-center justify-center text-slate-400 text-xs flex-col space-y-3">
        <p>Meeting not found.</p>
        <Link href="/" className="px-4 py-2 bg-violet-600 text-white rounded-lg">Return to Library</Link>
      </div>
    );
  }

  const handleExportMarkdown = () => {
    const textContent = `
# ${meeting.title}
Date: ${new Date(meeting.date).toLocaleString()}

## Executive Summary
${meeting.summary?.overview || "N/A"}

## Key Takeaways
${meeting.summary?.shorthand_bullet_points.map((p) => `- ${p}`).join("\n") || "N/A"}

## Action Items
${meeting.action_items.map((a) => `- [${a.completed ? "x" : " "}] ${a.text} (@${a.assignee_name || "Unassigned"})`).join("\n")}

## Transcript
${meeting.segments.map((s) => `[${Math.floor(s.start_time / 60)}:${Math.floor(s.start_time % 60).toString().padStart(2, "0")}] ${s.speaker_name}: ${s.text}`).join("\n")}
    `.trim();

    const blob = new Blob([textContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${meeting.title.replace(/[^a-zA-Z0-9]/g, "_")}_notes.md`;
    a.click();
  };

  return (
    <div className="flex h-screen bg-[#090c10] text-slate-100 overflow-hidden select-none">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="h-16 bg-[#0d1117]/80 backdrop-blur-md border-b border-[#1e2736] px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="p-2 rounded-lg bg-[#151c28] border border-[#202b3d] text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-sm font-bold text-white line-clamp-1 flex items-center">
                {meeting.title}
                <span className="ml-2.5 px-2 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                  Recorded & Synced
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 flex items-center mt-0.5">
                <Calendar className="w-3 h-3 mr-1 text-slate-500" />
                {new Date(meeting.date).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Ask AI Trigger Button */}
            <button
              onClick={() => setIsAskAIOpen(true)}
              className="flex items-center space-x-2 px-3.5 py-1.5 bg-violet-600/20 border border-violet-500/40 text-violet-300 hover:bg-violet-600/30 text-xs font-semibold rounded-lg transition-all cursor-pointer"
            >
              <Bot className="w-4 h-4 text-violet-400" />
              <span>Ask AI Chat</span>
            </button>

            {/* Export Markdown */}
            <button
              onClick={handleExportMarkdown}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#151c28] border border-[#202b3d] text-slate-300 hover:text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Notes</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* Synchronized Waveform Audio Player */}
          <AudioPlayer
            audioUrl={meeting.audio_url}
            currentTime={currentTime}
            onSeek={(t) => setCurrentTime(t)}
            onTimeUpdate={(t) => setCurrentTime(t)}
          />

          {/* Navigation Workspace Tabs */}
          <div className="flex border-b border-[#1e2736] space-x-6">
            <button
              onClick={() => setActiveTab("transcript")}
              className={`pb-3 text-xs font-bold flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
                activeTab === "transcript"
                  ? "border-violet-500 text-violet-300"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Interactive Transcript ({meeting.segments.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("summary")}
              className={`pb-3 text-xs font-bold flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
                activeTab === "summary"
                  ? "border-violet-500 text-violet-300"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Summary & Chapters</span>
            </button>

            <button
              onClick={() => setActiveTab("action_items")}
              className={`pb-3 text-xs font-bold flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
                activeTab === "action_items"
                  ? "border-violet-500 text-violet-300"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Action Items ({meeting.action_items.length})</span>
            </button>
          </div>

          {/* Tab Content Display */}
          {activeTab === "transcript" && (
            <InteractiveTranscript
              segments={meeting.segments}
              currentTime={currentTime}
              onSeekTimestamp={(t) => setCurrentTime(t)}
            />
          )}

          {activeTab === "summary" && (
            <AISummaryTab
              summary={meeting.summary}
              onSeekTimestamp={(t) => setCurrentTime(t)}
            />
          )}

          {activeTab === "action_items" && (
            <ActionItemsManager
              meetingId={meeting.id}
              initialItems={meeting.action_items}
            />
          )}
        </main>
      </div>

      {/* Ask AI Chat Drawer */}
      <AskAIChatDrawer
        meetingId={meeting.id}
        meetingTitle={meeting.title}
        isOpen={isAskAIOpen}
        onClose={() => setIsAskAIOpen(false)}
        onSeekTimestamp={(t) => setCurrentTime(t)}
      />
    </div>
  );
}
