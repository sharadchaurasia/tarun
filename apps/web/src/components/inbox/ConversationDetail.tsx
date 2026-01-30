import { useEffect, useRef, useState } from 'react';
import { useConversationStore } from '@/stores/conversationStore';
import { useMessageStore } from '@/stores/messageStore';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import api from '@/lib/api';
import { Phone, ChevronDown, Loader2, MessageCircle } from 'lucide-react';

export function ConversationDetail() {
  const selectedId = useConversationStore((s) => s.selectedId);
  const conversations = useConversationStore((s) => s.conversations);
  const updateStatus = useConversationStore((s) => s.updateStatus);
  const assignAgent = useConversationStore((s) => s.assignAgent);
  const { messages, loading, fetchMessages, sendMessage } = useMessageStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const convo = conversations.find((c) => c.id === selectedId);

  useEffect(() => {
    if (selectedId) {
      fetchMessages(selectedId);
    }
  }, [selectedId, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    api.get('/users').then((r) => setAgents(r.data));
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 100);
    };
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  if (!convo) return null;

  const handleSend = (body: string) => {
    if (selectedId) {
      sendMessage(selectedId, body);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const displayName = convo.contact.name || convo.contact.phone;

  const avatarColors = [
    'from-violet-400 to-purple-600',
    'from-blue-400 to-indigo-600',
    'from-emerald-400 to-teal-600',
    'from-orange-400 to-red-500',
    'from-pink-400 to-rose-600',
  ];
  let hash = 0;
  for (let i = 0; i < displayName.length; i++) {
    hash = displayName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const avatarColor = avatarColors[Math.abs(hash) % avatarColors.length];
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const statusColors: Record<string, string> = {
    OPEN: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    RESOLVED: 'bg-gray-100 text-gray-600 border-gray-200',
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between glass">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white text-xs font-semibold`}>
            {initials}
          </div>
          <div>
            <h2 className="font-semibold text-sm text-gray-900">{displayName}</h2>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Phone size={11} />
              {convo.contact.phone}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Status dropdown */}
          <select
            value={convo.status}
            onChange={(e) => updateStatus(convo.id, e.target.value)}
            className={`text-xs font-medium border rounded-lg px-2.5 py-1.5 appearance-none cursor-pointer transition-colors ${statusColors[convo.status] || 'bg-gray-50 border-gray-200'}`}
          >
            <option value="OPEN">Open</option>
            <option value="PENDING">Pending</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          {/* Agent dropdown */}
          <select
            value={convo.assignedAgentId || ''}
            onChange={(e) => assignAgent(convo.id, e.target.value || null)}
            className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white hover:bg-gray-50 appearance-none cursor-pointer transition-colors text-gray-700"
          >
            <option value="">Unassigned</option>
            {agents.map((a: any) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 chat-bg space-y-1 relative">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="animate-spin text-gray-400" />
          </div>
        )}
        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <MessageCircle size={40} className="mb-3 text-gray-300" />
            <p className="text-sm font-medium">No messages yet</p>
            <p className="text-xs mt-1">Send a message to start the conversation</p>
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />

        {/* Scroll to bottom */}
        {showScrollBtn && (
          <button
            onClick={scrollToBottom}
            className="fixed bottom-24 right-8 w-9 h-9 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all animate-scale-in"
          >
            <ChevronDown size={18} className="text-gray-600" />
          </button>
        )}
      </div>

      {/* Input */}
      <MessageInput onSend={handleSend} />
    </div>
  );
}
