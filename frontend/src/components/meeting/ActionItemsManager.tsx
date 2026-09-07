"use client";

import { useState } from "react";
import { ActionItem } from "@/lib/types";
import { CheckSquare, Plus, Trash2, User } from "lucide-react";
import { createActionItem, updateActionItem, deleteActionItem } from "@/lib/api";

interface ActionItemsManagerProps {
  meetingId: string;
  initialItems: ActionItem[];
}

export default function ActionItemsManager({ meetingId, initialItems }: ActionItemsManagerProps) {
  const [items, setItems] = useState<ActionItem[]>(initialItems);
  const [newText, setNewText] = useState("");
  const [assignee, setAssignee] = useState("Sarah Chen");
  const [isAdding, setIsAdding] = useState(false);

  const completedCount = items.filter((i) => i.completed).length;
  const progress = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  async function handleToggle(item: ActionItem) {
    const updated = await updateActionItem(item.id, { completed: !item.completed });
    setItems(items.map((i) => (i.id === item.id ? updated : i)));
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newText.trim()) return;

    const created = await createActionItem(meetingId, newText, assignee);
    setItems([...items, created]);
    setNewText("");
    setIsAdding(false);
  }

  async function handleDelete(id: string) {
    await deleteActionItem(id);
    setItems(items.filter((i) => i.id !== id));
  }

  return (
    <div className="bg-[#121721] border border-[#202b3d] rounded-2xl p-5 shadow-lg space-y-4">
      {/* Header & Progress Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-white flex items-center">
            <CheckSquare className="w-4 h-4 mr-2 text-violet-400" />
            Action Items & Task Checklist
          </h3>
          <p className="text-[11px] text-slate-400">
            {completedCount} of {items.length} tasks completed ({progress}%)
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 text-xs font-semibold border border-violet-500/30 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#1c2536] h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-gradient-to-r from-violet-600 to-emerald-400 h-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Add Item Form */}
      {isAdding && (
        <form onSubmit={handleAdd} className="bg-[#161c28] border border-[#202b3d] rounded-xl p-3 space-y-3">
          <input
            type="text"
            required
            placeholder="Type task description..."
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            className="w-full bg-[#121721] border border-[#253145] rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="bg-[#121721] border border-[#253145] rounded px-2 py-1 text-xs text-slate-300"
              >
                <option value="Sarah Chen">Sarah Chen</option>
                <option value="Alex Rivera">Alex Rivera</option>
                <option value="Elena Rostova">Elena Rostova</option>
                <option value="Priya Sharma">Priya Sharma</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-violet-600 hover:bg-violet-500 text-white rounded text-xs font-semibold"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Action Items List */}
      <div className="space-y-2.5">
        {items.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">No pending action items.</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                item.completed
                  ? "bg-[#10141d]/50 border-[#1a2230] opacity-60"
                  : "bg-[#161c28] border-[#1f293a] hover:border-slate-700"
              }`}
            >
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => handleToggle(item)}
                  className="w-4 h-4 rounded accent-violet-500 cursor-pointer"
                />
                <span className={`text-xs text-slate-200 ${item.completed ? "line-through text-slate-500" : ""}`}>
                  {item.text}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                {item.assignee_name && (
                  <span className="px-2 py-0.5 rounded bg-violet-950/40 text-violet-300 text-[10px] border border-violet-500/30 font-medium">
                    @{item.assignee_name}
                  </span>
                )}
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-slate-500 hover:text-rose-400 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
