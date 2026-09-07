"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import MeetingCard from "@/components/dashboard/MeetingCard";
import NewMeetingModal from "@/components/dashboard/NewMeetingModal";
import EditMeetingModal from "@/components/dashboard/EditMeetingModal";
import { Meeting } from "@/lib/types";
import { fetchMeetings, deleteMeeting } from "@/lib/api";
import { FolderKanban, Filter, ArrowUpDown, Video, CheckSquare, Clock } from "lucide-react";

export default function Dashboard() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [participantFilter, setParticipantFilter] = useState("");
  const [orderBy, setOrderBy] = useState<"desc" | "asc">("desc");
  const [isNewMeetingOpen, setIsNewMeetingOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const loadMeetings = async () => {
    setLoading(true);
    try {
      const data = await fetchMeetings(searchQuery, participantFilter, orderBy);
      setMeetings(data);
    } catch (err) {
      console.error("Failed to load meetings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeetings();
  }, [searchQuery, participantFilter, orderBy]);

  const handleDeleteMeeting = async (id: string) => {
    try {
      await deleteMeeting(id);
      setMeetings(meetings.filter((m) => m.id !== id));
    } catch (err) {
      alert("Failed to delete meeting.");
    }
  };

  const handleEditMeeting = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setIsEditModalOpen(true);
  };

  const totalMinutes = meetings.reduce((acc, m) => acc + Math.floor(m.duration_seconds / 60), 0);
  const totalTasks = meetings.reduce((acc, m) => acc + (m.action_item_count || 0), 0);

  return (
    <div className="flex h-screen bg-[#090c10] text-slate-100 overflow-hidden select-none">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header */}
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenNewMeetingModal={() => setIsNewMeetingOpen(true)}
        />

        {/* Dashboard Body */}
        <main className="p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Top Title Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-white flex items-center">
                <FolderKanban className="w-5 h-5 mr-2.5 text-violet-400" />
                Meetings Library
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Browse past meetings, search interactive transcripts, and track AI action items.
              </p>
            </div>

            {/* Quick Stats Bar */}
            <div className="flex items-center space-x-3">
              <div className="px-3.5 py-2 rounded-xl bg-[#121721] border border-[#202b3d] flex items-center space-x-2.5">
                <Video className="w-4 h-4 text-violet-400" />
                <div>
                  <p className="text-[10px] text-slate-400 font-medium leading-none">Total Meetings</p>
                  <p className="text-xs font-bold text-slate-100 leading-tight">{meetings.length}</p>
                </div>
              </div>

              <div className="px-3.5 py-2 rounded-xl bg-[#121721] border border-[#202b3d] flex items-center space-x-2.5">
                <Clock className="w-4 h-4 text-emerald-400" />
                <div>
                  <p className="text-[10px] text-slate-400 font-medium leading-none">Time In Calls</p>
                  <p className="text-xs font-bold text-slate-100 leading-tight">{totalMinutes} mins</p>
                </div>
              </div>

              <div className="px-3.5 py-2 rounded-xl bg-[#121721] border border-[#202b3d] flex items-center space-x-2.5">
                <CheckSquare className="w-4 h-4 text-indigo-400" />
                <div>
                  <p className="text-[10px] text-slate-400 font-medium leading-none">Action Items</p>
                  <p className="text-xs font-bold text-slate-100 leading-tight">{totalTasks} tasks</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter & Sorting Controls Bar */}
          <div className="bg-[#121721] border border-[#1e2736] rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span>Filter Participant:</span>
              </div>
              <select
                value={participantFilter}
                onChange={(e) => setParticipantFilter(e.target.value)}
                className="bg-[#161c28] border border-[#253145] rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
              >
                <option value="">All Participants</option>
                <option value="Sarah Chen">Sarah Chen</option>
                <option value="Alex Rivera">Alex Rivera</option>
                <option value="Elena Rostova">Elena Rostova</option>
                <option value="Marcus Vance">Marcus Vance</option>
              </select>
            </div>

            {/* Recency Sort Toggle */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400">Sort by Recency:</span>
              <button
                onClick={() => setOrderBy(orderBy === "desc" ? "asc" : "desc")}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#161c28] border border-[#253145] text-xs text-violet-300 font-semibold hover:border-violet-500 transition-colors"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>{orderBy === "desc" ? "Newest First" : "Oldest First"}</span>
              </button>
            </div>
          </div>

          {/* Meetings Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-44 bg-[#121721] rounded-xl border border-[#1e2736] animate-pulse"></div>
              ))}
            </div>
          ) : meetings.length === 0 ? (
            <div className="text-center py-20 bg-[#121721] rounded-2xl border border-[#1e2736] space-y-3">
              <FolderKanban className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-slate-300">No meetings found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try adjusting your search criteria or add a new meeting using the top right upload button.
              </p>
              <button
                onClick={() => setIsNewMeetingOpen(true)}
                className="px-4 py-2 bg-violet-600 text-white text-xs font-semibold rounded-lg hover:bg-violet-500 transition-all inline-block"
              >
                Add Your First Meeting
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {meetings.map((m) => (
                <MeetingCard
                  key={m.id}
                  meeting={m}
                  onDelete={handleDeleteMeeting}
                  onEdit={handleEditMeeting}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* New Meeting Modal */}
      <NewMeetingModal
        isOpen={isNewMeetingOpen}
        onClose={() => setIsNewMeetingOpen(false)}
        onSuccess={loadMeetings}
      />

      {/* Edit Meeting Modal */}
      <EditMeetingModal
        isOpen={isEditModalOpen}
        meeting={editingMeeting}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingMeeting(null);
        }}
        onSuccess={loadMeetings}
      />
    </div>
  );
}
