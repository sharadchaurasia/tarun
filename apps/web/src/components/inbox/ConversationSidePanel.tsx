import { useEffect, useState } from 'react';
import { Phone, Mail, ChevronDown, StickyNote, User, Clock, Loader2 } from 'lucide-react';
import { useConversationStore } from '@/stores/conversationStore';
import { useNoteStore } from '@/stores/noteStore';
import { useLeadStatusStore } from '@/stores/leadStatusStore';
import api from '@/lib/api';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function ConversationSidePanel() {
  const selectedId = useConversationStore((s) => s.selectedId);
  const conversations = useConversationStore((s) => s.conversations);
  const { notes, loading: notesLoading, fetchNotes, addNote } = useNoteStore();
  const { statuses, fetchStatuses } = useLeadStatusStore();

  const [noteText, setNoteText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const convo = conversations.find((c) => c.id === selectedId);

  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  useEffect(() => {
    if (selectedId) {
      fetchNotes(selectedId);
    }
  }, [selectedId, fetchNotes]);

  if (!convo) return null;

  const displayName = convo.contact.name || convo.contact.phone;
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim() || !selectedId) return;
    setSubmitting(true);
    try {
      await addNote(selectedId, noteText);
      setNoteText('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLeadStatusChange = async (status: string) => {
    if (!selectedId) return;
    setUpdatingStatus(true);
    try {
      await api.patch(`/conversations/${selectedId}/lead-status`, { leadStatus: status });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const activeStatuses = statuses.filter((s) => s.isActive);

  return (
    <div className="w-80 border-l border-gray-100 bg-white flex flex-col overflow-y-auto">
      {/* Contact Info */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-sm font-semibold">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm text-gray-900 truncate">{displayName}</p>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Phone size={11} />
              {convo.contact.phone}
            </div>
          </div>
        </div>
        {(convo.contact as any).email && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Mail size={12} className="text-gray-400" />
            {(convo.contact as any).email}
          </div>
        )}
      </div>

      {/* Lead Status */}
      <div className="p-4 border-b border-gray-100">
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Lead Status</label>
        <div className="relative">
          <select
            value={(convo as any).leadStatus || ''}
            onChange={(e) => handleLeadStatusChange(e.target.value)}
            disabled={updatingStatus}
            className="w-full appearance-none px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-300 transition-all pr-9 disabled:opacity-50"
          >
            <option value="">-- Select --</option>
            {activeStatuses.map((s) => (
              <option key={s.id} value={s.name}>{s.name}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Notes */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="px-4 pt-4 pb-2">
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
            <StickyNote size={12} className="inline mr-1" />
            Notes
          </label>
        </div>

        {/* Add note form */}
        <form onSubmit={handleAddNote} className="px-4 pb-3">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add a note..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-300 transition-all resize-none"
          />
          <button
            type="submit"
            disabled={submitting || !noteText.trim()}
            className="mt-2 w-full px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-medium hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Adding...' : 'Add Note'}
          </button>
        </form>

        {/* Notes list */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2.5">
          {notesLoading && (
            <div className="text-center py-4">
              <Loader2 size={16} className="animate-spin mx-auto text-gray-400" />
            </div>
          )}
          {!notesLoading && notes.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-4">No notes yet</p>
          )}
          {notes.map((note) => (
            <div key={note.id} className="bg-gray-50 rounded-xl p-3">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                <User size={11} />
                <span>{note.user.name}</span>
                <span className="flex items-center gap-0.5 ml-auto">
                  <Clock size={11} />
                  {timeAgo(note.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
