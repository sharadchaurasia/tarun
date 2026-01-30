import { useConversationStore } from '@/stores/conversationStore';
import { Inbox, Loader2 } from 'lucide-react';

const statusFilters = [
  { label: 'All', value: '' },
  { label: 'Open', value: 'OPEN' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Resolved', value: 'RESOLVED' },
];

const avatarColors = [
  'from-violet-400 to-purple-600',
  'from-blue-400 to-indigo-600',
  'from-emerald-400 to-teal-600',
  'from-orange-400 to-red-500',
  'from-pink-400 to-rose-600',
  'from-cyan-400 to-blue-600',
  'from-amber-400 to-orange-600',
  'from-teal-400 to-emerald-600',
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

const statusDot: Record<string, string> = {
  OPEN: 'bg-emerald-500',
  PENDING: 'bg-amber-500',
  RESOLVED: 'bg-gray-400',
};

export function ConversationList() {
  const { conversations, selectedId, statusFilter, loading, setSelectedId, setStatusFilter } =
    useConversationStore();

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Status filter tabs */}
      <div className="flex border-b border-gray-100 px-3 pt-3 gap-1">
        {statusFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-3 py-2 text-xs font-medium rounded-t-lg transition-all duration-200 ${
              statusFilter === f.value
                ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-500 -mb-px'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 -mb-px border-b-2 border-transparent'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="p-8 flex flex-col items-center text-gray-400">
            <Loader2 size={24} className="animate-spin mb-2" />
            <span className="text-sm">Loading conversations...</span>
          </div>
        )}
        {!loading && conversations.length === 0 && (
          <div className="p-8 flex flex-col items-center text-gray-400">
            <Inbox size={32} className="mb-2 text-gray-300" />
            <span className="text-sm font-medium">No conversations</span>
            <span className="text-xs mt-1">Messages will appear here</span>
          </div>
        )}
        {conversations.map((convo) => {
          const lastMsg = convo.messages?.[0];
          const displayName = convo.contact.name || convo.contact.phone;
          const isSelected = selectedId === convo.id;

          return (
            <button
              key={convo.id}
              onClick={() => setSelectedId(convo.id)}
              className={`w-full text-left px-3 py-3 transition-all duration-150 border-l-[3px] ${
                isSelected
                  ? 'bg-emerald-50/80 border-l-emerald-500'
                  : 'border-l-transparent hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(displayName)} flex items-center justify-center text-white text-xs font-semibold shrink-0 shadow-sm`}
                >
                  {getInitials(displayName)}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-center mb-0.5">
                    <p className={`text-sm truncate ${isSelected ? 'font-semibold text-gray-900' : 'font-medium text-gray-800'}`}>
                      {displayName}
                    </p>
                    {convo.lastMessageAt && (
                      <span className="text-[11px] text-gray-400 ml-2 shrink-0">
                        {formatTime(convo.lastMessageAt)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-500 truncate flex-1">
                      {lastMsg ? lastMsg.body : 'No messages yet'}
                    </p>
                    <span className={`w-2 h-2 rounded-full shrink-0 ${statusDot[convo.status] || 'bg-gray-300'}`} />
                  </div>
                  {convo.assignedAgent && (
                    <p className="text-[11px] text-gray-400 mt-1 truncate">
                      {convo.assignedAgent.name}
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
