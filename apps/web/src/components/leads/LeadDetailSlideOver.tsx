import { useEffect, useState } from 'react';
import { X, Phone, Mail, User, Clock, MessageSquare, ChevronDown } from 'lucide-react';
import { useLeadStore } from '@/stores/leadStore';
import { useLeadStatusStore } from '@/stores/leadStatusStore';

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

export function LeadDetailSlideOver() {
  const selectedLead = useLeadStore((s) => s.selectedLead);
  const selectedLoading = useLeadStore((s) => s.selectedLoading);
  const clearSelected = useLeadStore((s) => s.clearSelected);
  const updateLeadStatus = useLeadStore((s) => s.updateLeadStatus);
  const addCallLog = useLeadStore((s) => s.addCallLog);
  const fetchBoardLeads = useLeadStore((s) => s.fetchBoardLeads);
  const statuses = useLeadStatusStore((s) => s.statuses);
  const fetchStatuses = useLeadStatusStore((s) => s.fetchStatuses);

  const [callForm, setCallForm] = useState({ notes: '', outcome: 'NO_ANSWER', duration: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  if (!selectedLead && !selectedLoading) return null;

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedLead || newStatus === selectedLead.leadStatus) return;
    await updateLeadStatus(selectedLead.id, newStatus);
    fetchBoardLeads();
  };

  const handleAddCallLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !callForm.notes.trim()) return;
    setSubmitting(true);
    try {
      await addCallLog(selectedLead.id, {
        notes: callForm.notes,
        outcome: callForm.outcome,
        duration: callForm.duration ? parseInt(callForm.duration) : undefined,
      });
      setCallForm({ notes: '', outcome: 'NO_ANSWER', duration: '' });
      fetchBoardLeads();
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    clearSelected();
    setCallForm({ notes: '', outcome: 'NO_ANSWER', duration: '' });
  };

  const activeStatuses = statuses.filter((s) => s.isActive);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-md bg-white shadow-2xl animate-slide-in-right flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Lead Details</h3>
          <button onClick={handleClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {selectedLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
          </div>
        )}

        {selectedLead && !selectedLoading && (
          <div className="flex-1 overflow-y-auto">
            {/* Contact Info */}
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-sm font-semibold">
                  {(selectedLead.contact.name || selectedLead.contact.phone)
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {selectedLead.contact.name || selectedLead.contact.phone}
                  </p>
                  <p className="text-xs text-gray-400">{selectedLead.contact.phone}</p>
                </div>
              </div>
              {selectedLead.contact.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail size={14} className="text-gray-400" />
                  {selectedLead.contact.email}
                </div>
              )}
            </div>

            {/* Status Selector */}
            <div className="p-5 border-b border-gray-100">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Status</label>
              <div className="relative">
                <select
                  value={selectedLead.leadStatus || ''}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full appearance-none px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-300 transition-all pr-10"
                >
                  <option value="">-- Select --</option>
                  {activeStatuses.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Assigned Agent */}
            {selectedLead.assignedAgent && (
              <div className="p-5 border-b border-gray-100">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Assigned Agent
                </label>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-[11px] font-semibold">
                    {selectedLead.assignedAgent.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{selectedLead.assignedAgent.name}</p>
                    <p className="text-xs text-gray-400">{selectedLead.assignedAgent.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Messages */}
            <div className="p-5 border-b border-gray-100">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                <MessageSquare size={12} className="inline mr-1" />
                Recent Messages
              </label>
              {selectedLead.messages.length === 0 ? (
                <p className="text-sm text-gray-400">No messages yet</p>
              ) : (
                <div className="space-y-2.5">
                  {selectedLead.messages.slice(0, 5).map((msg, i) => (
                    <div key={i} className="text-sm">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className={`text-[10px] font-medium uppercase tracking-wider ${
                            msg.direction === 'outbound' || msg.direction === 'OUTBOUND'
                              ? 'text-emerald-600'
                              : 'text-blue-600'
                          }`}
                        >
                          {msg.direction === 'outbound' || msg.direction === 'OUTBOUND' ? 'Sent' : 'Received'}
                        </span>
                        <span className="text-xs text-gray-400">{timeAgo(msg.createdAt)}</span>
                      </div>
                      <p className="text-gray-700 line-clamp-2">{msg.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Call Log History */}
            <div className="p-5 border-b border-gray-100">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                <Phone size={12} className="inline mr-1" />
                Call History
              </label>
              {selectedLead.callLogs.length === 0 ? (
                <p className="text-sm text-gray-400">No call logs yet</p>
              ) : (
                <div className="space-y-3">
                  {selectedLead.callLogs.map((log) => (
                    <div key={log.id} className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-600">{log.outcome.replace(/_/g, ' ')}</span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock size={11} />
                          {timeAgo(log.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{log.notes}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                        <span>
                          <User size={11} className="inline mr-0.5" />
                          {log.user.name}
                        </span>
                        {log.duration && <span>{log.duration}s</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Call Log Form */}
            <div className="p-5">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                Add Call Log
              </label>
              <form onSubmit={handleAddCallLog} className="space-y-3">
                <textarea
                  value={callForm.notes}
                  onChange={(e) => setCallForm({ ...callForm, notes: e.target.value })}
                  placeholder="Call notes..."
                  rows={3}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-300 transition-all resize-none"
                />
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <select
                      value={callForm.outcome}
                      onChange={(e) => setCallForm({ ...callForm, outcome: e.target.value })}
                      className="w-full appearance-none px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-300 transition-all pr-10"
                    >
                      <option value="NO_ANSWER">No Answer</option>
                      <option value="ANSWERED">Answered</option>
                      <option value="BUSY">Busy</option>
                      <option value="VOICEMAIL">Voicemail</option>
                      <option value="CALLBACK_REQUESTED">Callback Requested</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                  <input
                    type="number"
                    value={callForm.duration}
                    onChange={(e) => setCallForm({ ...callForm, duration: e.target.value })}
                    placeholder="Duration (s)"
                    min="0"
                    className="w-28 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-300 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting || !callForm.notes.trim()}
                  className="w-full px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Adding...' : 'Add Call Log'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
