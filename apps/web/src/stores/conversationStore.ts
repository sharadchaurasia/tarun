import { create } from 'zustand';
import api from '../lib/api';

export interface Conversation {
  id: string;
  contactId: string;
  assignedAgentId: string | null;
  channel: string;
  status: string;
  lastMessageAt: string | null;
  contact: { id: string; name: string | null; phone: string };
  assignedAgent: { id: string; name: string; email: string } | null;
  messages?: { body: string; direction: string; createdAt: string }[];
}

interface ConversationState {
  conversations: Conversation[];
  selectedId: string | null;
  statusFilter: string;
  loading: boolean;
  setSelectedId: (id: string | null) => void;
  setStatusFilter: (filter: string) => void;
  fetchConversations: (status?: string) => Promise<void>;
  updateConversation: (convo: Conversation) => void;
  updateStatus: (id: string, status: string) => Promise<void>;
  assignAgent: (id: string, agentId: string | null) => Promise<void>;
}

export const useConversationStore = create<ConversationState>((set, get) => ({
  conversations: [],
  selectedId: null,
  statusFilter: '',
  loading: false,

  setSelectedId: (id) => set({ selectedId: id }),
  setStatusFilter: (filter) => set({ statusFilter: filter }),

  fetchConversations: async (status) => {
    set({ loading: true });
    try {
      const params: any = { limit: 50 };
      if (status) params.status = status;
      const res = await api.get('/conversations', { params });
      set({ conversations: res.data.data });
    } finally {
      set({ loading: false });
    }
  },

  updateConversation: (convo) => {
    set((state) => {
      const idx = state.conversations.findIndex((c) => c.id === convo.id);
      if (idx >= 0) {
        const updated = [...state.conversations];
        updated[idx] = convo;
        return { conversations: updated };
      }
      return { conversations: [convo, ...state.conversations] };
    });
  },

  updateStatus: async (id, status) => {
    const res = await api.patch(`/conversations/${id}/status`, { status });
    get().updateConversation(res.data);
  },

  assignAgent: async (id, agentId) => {
    const res = await api.patch(`/conversations/${id}/assign`, { agentId });
    get().updateConversation(res.data);
  },
}));
