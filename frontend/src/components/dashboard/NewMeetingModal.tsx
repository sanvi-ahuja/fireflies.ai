"use client";

import { useState } from "react";
import { X, Upload, FileText, Sparkles } from "lucide-react";
import { createMeeting, uploadTranscriptFile } from "@/lib/api";

import Logo from "@/components/ui/Logo";

interface NewMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NewMeetingModal({ isOpen, onClose, onSuccess }: NewMeetingModalProps) {
  const [title, setTitle] = useState("");
  const [rawText, setRawText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState<"idle" | "creating" | "uploading" | "done">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [tab, setTab] = useState<"paste" | "upload">("paste");

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // For upload tab, file is mandatory
    if (tab === "upload" && !file) {
      setErrorMsg("Please select a transcript file to upload.");
      return;
    }

    // Auto-derive title from filename if user left it blank
    const effectiveTitle = title.trim() ||
      (tab === "upload" && file ? file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ") : "");

    if (!effectiveTitle) {
      setErrorMsg("Please enter a meeting title.");
      return;
    }

    setIsSubmitting(true);
    setSubmitStep("creating");
    setErrorMsg(null);
    try {
      // Step 1 — Create the meeting record
      const created = await createMeeting({
        title: effectiveTitle,
        date: new Date().toISOString(),
        raw_transcript_text: tab === "paste" ? rawText : undefined,
        participants: [
          { name: "Sarah Chen", email: "sarah@fireflies.ai" },
          { name: "Alex Rivera", email: "alex@fireflies.ai" }
        ]
      });

      // Step 2 — Upload & process the transcript file
      if (tab === "upload" && file) {
        setSubmitStep("uploading");
        await uploadTranscriptFile(created.id, file);
      }

      setSubmitStep("done");
      setTitle("");
      setRawText("");
      setFile(null);
      setErrorMsg(null);
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err?.message || "Failed to create meeting. Make sure the backend is running on http://localhost:8000";
      setErrorMsg(msg);
      setSubmitStep("idle");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="bg-[#121721] border border-[#202b3d] rounded-2xl w-full max-w-xl p-6 shadow-2xl relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-[#1a2230]"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#141b26] border border-[#202b3d] flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Logo size={28} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Create / Upload New Meeting</h2>
            <p className="text-xs text-slate-400">Import transcript files or paste notes to generate AI summary</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title input */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Meeting Title</label>
            <input
              type="text"
              placeholder={tab === "upload" && file ? file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ") : "e.g. Q4 Engineering Architecture Sprint"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#171e2c] border border-[#253145] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          {/* Source Tabs */}
          <div className="flex space-x-2 border-b border-[#202b3d] pt-2">
            <button
              type="button"
              onClick={() => setTab("paste")}
              className={`pb-2 px-3 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-all ${
                tab === "paste"
                  ? "border-violet-500 text-violet-300"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Paste Transcript</span>
            </button>
            <button
              type="button"
              onClick={() => setTab("upload")}
              className={`pb-2 px-3 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-all ${
                tab === "upload"
                  ? "border-violet-500 text-violet-300"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload File (.vtt, .json, .txt)</span>
            </button>
          </div>

          {tab === "paste" ? (
            <div>
              <textarea
                rows={5}
                placeholder="Paste speaker transcript with timestamps e.g.&#10;[00:05] Sarah: Welcome team to our roadmap review...&#10;[00:20] Alex: Thanks Sarah, engineering updates are complete."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="w-full bg-[#171e2c] border border-[#253145] rounded-lg p-3 text-xs text-slate-200 font-mono placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>
          ) : (
            <div className="border-2 border-dashed border-[#253145] rounded-xl p-6 text-center hover:border-violet-500/50 transition-colors">
              <Upload className="w-8 h-8 text-violet-400 mx-auto mb-2" />
              <p className="text-xs text-slate-300 font-medium mb-1">
                {file ? file.name : "Click or drag & drop VTT, JSON, or TXT file"}
              </p>
              <p className="text-[11px] text-slate-500">Supports WebVTT (.vtt), JSON, and text files up to 25MB</p>
              <input
                type="file"
                accept=".vtt,.json,.txt"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="mt-3 text-xs text-slate-400 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-violet-600/20 file:text-violet-300 hover:file:bg-violet-600/30"
              />
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
              {errorMsg}
            </div>
          )}

          {/* Submit buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 bg-[#161d2a] hover:bg-[#1f283a]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-md shadow-violet-600/20 disabled:opacity-50 flex items-center space-x-2"
            >
              {submitStep === "creating" ? "Creating Meeting..." :
               submitStep === "uploading" ? "Processing Transcript..." :
               "Generate Meeting Notes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
