import { create } from 'zustand';
import api from '../lib/api';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string | null;
  direction: 'INBOUND' | 'OUTBOUND';
  body: string;
  status: string;
  createdAt: string;
  sender?: { id: string; name: string } | null;
}

interface MessageState {
  messages: Message[];
  loading: boolean;
  fetchMessages: (conversationId: string) => Promise<void>;
  addMessage: (message: Message) => void;
  sendMessage: (conversationId: string, body: string) => Promise<void>;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: [],
  loading: false,

  fetchMessages: async (conversationId) => {
    set({ loading: true });
    try {
      const res = await api.get(`/messages/${conversationId}`, {
        params: { limit: 100 },
      });
      set({ messages: res.data.data });
    } finally {
      set({ loading: false });
    }
  },

  addMessage: (message) => {
    set((state) => {
      if (state.messages.some((m) => m.id === message.id)) return state;
      return { messages: [...state.messages, message] };
    });
  },

  sendMessage: async (conversationId, body) => {
    const res = await api.post(`/messages/${conversationId}`, { body });
    get().addMessage(res.data);
  },
}));
