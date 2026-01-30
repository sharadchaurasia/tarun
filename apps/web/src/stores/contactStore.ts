import { create } from 'zustand';
import api from '../lib/api';

export interface Contact {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  tags: string[];
  createdAt: string;
  _count?: { conversations: number };
}

interface ContactState {
  contacts: Contact[];
  total: number;
  page: number;
  search: string;
  loading: boolean;
  setSearch: (search: string) => void;
  setPage: (page: number) => void;
  fetchContacts: () => Promise<void>;
  createContact: (data: { phone: string; name?: string; email?: string; tags?: string[] }) => Promise<void>;
  updateContact: (id: string, data: { name?: string; email?: string; tags?: string[] }) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
}

export const useContactStore = create<ContactState>((set, get) => ({
  contacts: [],
  total: 0,
  page: 1,
  search: '',
  loading: false,

  setSearch: (search) => set({ search, page: 1 }),
  setPage: (page) => set({ page }),

  fetchContacts: async () => {
    set({ loading: true });
    try {
      const { search, page } = get();
      const res = await api.get('/contacts', {
        params: { search: search || undefined, page, limit: 20 },
      });
      set({ contacts: res.data.data, total: res.data.total });
    } finally {
      set({ loading: false });
    }
  },

  createContact: async (data) => {
    await api.post('/contacts', data);
    get().fetchContacts();
  },

  updateContact: async (id, data) => {
    await api.patch(`/contacts/${id}`, data);
    get().fetchContacts();
  },

  deleteContact: async (id) => {
    await api.delete(`/contacts/${id}`);
    get().fetchContacts();
  },
}));
