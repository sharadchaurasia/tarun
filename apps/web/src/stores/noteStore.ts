import { create } from 'zustand';
import api from '../lib/api';

export interface ConversationNote {
  id: string;
  conversationId: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string };
}

interface NoteState {
  notes: ConversationNote[];
  loading: boolean;
  fetchNotes: (conversationId: string) => Promise<void>;
  addNote: (conversationId: string, content: string) => Promise<void>;
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  loading: false,

  fetchNotes: async (conversationId) => {
    set({ loading: true });
    try {
      const res = await api.get(`/conversations/${conversationId}/notes`);
      set({ notes: res.data });
    } finally {
      set({ loading: false });
    }
  },

  addNote: async (conversationId, content) => {
    const res = await api.post(`/conversations/${conversationId}/notes`, { content });
    set((state) => ({ notes: [res.data, ...state.notes] }));
  },
}));
