import { useEffect } from 'react';
import { useConversationStore } from '@/stores/conversationStore';
import { useMessageStore } from '@/stores/messageStore';
import { useAuthStore } from '@/stores/authStore';
import { connectSocket } from '@/lib/socket';
import { ConversationList } from '@/components/inbox/ConversationList';
import { ConversationDetail } from '@/components/inbox/ConversationDetail';
import { ConversationSidePanel } from '@/components/inbox/ConversationSidePanel';
import { MessageSquare } from 'lucide-react';

export function InboxPage() {
  const token = useAuthStore((s) => s.token);
  const { fetchConversations, statusFilter, updateConversation, selectedId } =
    useConversationStore();
  const addMessage = useMessageStore((s) => s.addMessage);

  useEffect(() => {
    fetchConversations(statusFilter || undefined);
  }, [fetchConversations, statusFilter]);

  useEffect(() => {
    if (!token) return;

    const socket = connectSocket(token);

    socket.on('message:new', (message: any) => {
      addMessage(message);
    });

    socket.on('conversation:updated', (convo: any) => {
      updateConversation(convo);
    });

    return () => {
      socket.off('message:new');
      socket.off('conversation:updated');
    };
  }, [token, addMessage, updateConversation]);

  return (
    <div className="flex h-full">
      <div className="w-80 border-r border-gray-100 flex-shrink-0 shadow-sm">
        <ConversationList />
      </div>
      <div className="flex-1 min-w-0">
        {selectedId ? (
          <ConversationDetail />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 chat-bg">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <MessageSquare size={28} className="text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-500">Select a conversation</p>
            <p className="text-xs mt-1 text-gray-400">Choose from the list on the left</p>
          </div>
        )}
      </div>
      {selectedId && <ConversationSidePanel />}
    </div>
  );
}
