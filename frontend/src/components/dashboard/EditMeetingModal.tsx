"use client";

import { useState, useEffect } from "react";
import { X, Pencil, UserPlus, Trash2 } from "lucide-react";
import { updateMeeting } from "@/lib/api";
import { Meeting } from "@/lib/types";

interface EditMeetingModalProps {
  isOpen: boolean;
  meeting: { id: string; title: string; participants?: { name: string; email?: string }[] } | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditMeetingModal({ isOpen, meeting, onClose, onSuccess }: EditMeetingModalProps) {
  const [title, setTitle] = useState("");
  const [participants, setParticipants] = useState<{ name: string; email?: string }[]>([]);
  const [newParticipantName, setNewParticipantName] = useState("");
  const [newParticipantEmail, setNewParticipantEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (meeting) {
      setTitle(meeting.title || "");
      setParticipants(meeting.participants || []);
    }
  }, [meeting]);

  if (!isOpen || !meeting) return null;

  const handleAddParticipant = () => {
    if (!newParticipantName.trim()) return;
    setParticipants([...participants, { name: newParticipantName.trim(), email: newParticipantEmail.trim() || undefined }]);
    setNewParticipantName("");
    setNewParticipantEmail("");
  };

  const handleRemoveParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const handleParticipantChange = (index: number, field: "name" | "email", value: string) => {
    const updated = [...participants];
    updated[index] = { ...updated[index], [field]: value };
    setParticipants(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Title cannot be empty.");
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);
    try {
      await updateMeeting(meeting.id, {
        title: title.trim(),
        participants
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to update meeting.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="bg-[#121721] border border-[#202b3d] rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-[#1a2230]"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <Pencil className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Edit Meeting Details</h2>
            <p className="text-xs text-slate-400">Update title and participant list</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title Input */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Meeting Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#171e2c] border border-[#253145] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          {/* Participants Section */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Participants ({participants.length})
            </label>

            {/* Existing Participants List */}
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {participants.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No participants listed.</p>
              ) : (
                participants.map((p, idx) => (
                  <div key={idx} className="flex items-center space-x-2 bg-[#171e2c] border border-[#253145] p-2 rounded-lg">
                    <input
                      type="text"
                      placeholder="Participant Name"
                      value={p.name}
                      onChange={(e) => handleParticipantChange(idx, "name", e.target.value)}
                      className="flex-1 bg-transparent text-xs text-white font-medium focus:outline-none"
                    />
                    <input
                      type="email"
                      placeholder="Email (optional)"
                      value={p.email || ""}
                      onChange={(e) => handleParticipantChange(idx, "email", e.target.value)}
                      className="flex-1 bg-transparent text-xs text-slate-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveParticipant(idx)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                      title="Remove participant"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add New Participant Row */}
            <div className="mt-3 flex items-center space-x-2">
              <input
                type="text"
                placeholder="New Participant Name"
                value={newParticipantName}
                onChange={(e) => setNewParticipantName(e.target.value)}
                className="flex-1 bg-[#171e2c] border border-[#253145] rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
              <input
                type="email"
                placeholder="Email (optional)"
                value={newParticipantEmail}
                onChange={(e) => setNewParticipantEmail(e.target.value)}
                className="flex-1 bg-[#171e2c] border border-[#253145] rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
              <button
                type="button"
                onClick={handleAddParticipant}
                className="px-3 py-1.5 rounded-lg bg-violet-600/20 text-violet-300 border border-violet-500/40 hover:bg-violet-600/30 text-xs font-semibold flex items-center space-x-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
              {errorMsg}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 bg-[#161d2a] hover:bg-[#1f283a]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-md disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
