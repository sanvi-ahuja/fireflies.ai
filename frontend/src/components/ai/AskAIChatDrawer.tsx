"use client";

import { useState } from "react";
import { Sparkles, Send, X, Bot, Play } from "lucide-react";
import { askMeetingAI } from "@/lib/api";

interface AskAIChatDrawerProps {
  meetingId: string;
  meetingTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSeekTimestamp: (seconds: number) => void;
}

interface Message {
  sender: "user" | "ai";
  text: string;
  timestamps?: number[];
}

export default function AskAIChatDrawer({ meetingId, meetingTitle, isOpen, onClose, onSeekTimestamp }: AskAIChatDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: `Hello! I am Fred, your Fireflies AI assistant for "${meetingTitle}". Ask me anything about key decisions, action items, or specific discussions in this meeting!`
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userQ = input;
    setInput("");
    setMessages((prev) => [...prev, { sender: "user", text: userQ }]);
    setLoading(true);

    try {
      const res = await askMeetingAI(meetingId, userQ);
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: res.answer,
          timestamps: res.relevant_timestamps
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Sorry, I had trouble retrieving details. Please check the backend connection."
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-96 bg-[#121721] border-l border-[#202b3d] shadow-2xl flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#202b3d] flex items-center justify-between bg-[#0d1117]">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">Ask AI Assistant</h3>
            <p className="text-[10px] text-slate-400">RAG Semantic Meeting Search</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white bg-[#161c28]">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                m.sender === "user"
                  ? "bg-violet-600 text-white rounded-br-none shadow-md shadow-violet-600/20"
                  : "bg-[#171e2c] border border-[#253145] text-slate-200 rounded-bl-none"
              }`}
            >
              {m.text}

              {/* Timestamps */}
              {m.timestamps && m.timestamps.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-[#253145] flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-medium">Jump to timestamps:</span>
                  {m.timestamps.map((ts, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSeekTimestamp(ts)}
                      className="px-2 py-0.5 rounded bg-violet-950/40 hover:bg-violet-600/30 text-violet-300 font-mono text-[10px] border border-violet-500/30 font-semibold flex items-center space-x-1"
                    >
                      <Play className="w-2 h-2 fill-current" />
                      <span>{formatTime(ts)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center space-x-2 text-xs text-slate-400 p-2">
            <Bot className="w-4 h-4 animate-bounce text-violet-400" />
            <span>Fred is reading transcript...</span>
          </div>
        )}
      </div>

      {/* Input Footer */}
      <form onSubmit={handleSend} className="p-3 border-t border-[#202b3d] bg-[#0d1117] flex items-center space-x-2">
        <input
          type="text"
          placeholder="Ask a question about this meeting..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-[#151c28] border border-[#202b3d] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
