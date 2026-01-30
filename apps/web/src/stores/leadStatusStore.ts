import { create } from 'zustand';
import api from '../lib/api';

export interface CustomLeadStatus {
  id: string;
  tenantId: string;
  name: string;
  color: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface LeadStatusState {
  statuses: CustomLeadStatus[];
  loading: boolean;
  fetchStatuses: () => Promise<void>;
  createStatus: (data: { name: string; color?: string }) => Promise<void>;
  updateStatus: (id: string, data: { name?: string; color?: string; sortOrder?: number; isActive?: boolean }) => Promise<void>;
  deleteStatus: (id: string) => Promise<void>;
}

export const useLeadStatusStore = create<LeadStatusState>((set, get) => ({
  statuses: [],
  loading: false,

  fetchStatuses: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/lead-statuses');
      set({ statuses: res.data });
    } finally {
      set({ loading: false });
    }
  },

  createStatus: async (data) => {
    await api.post('/lead-statuses', data);
    get().fetchStatuses();
  },

  updateStatus: async (id, data) => {
    await api.patch(`/lead-statuses/${id}`, data);
    get().fetchStatuses();
  },

  deleteStatus: async (id) => {
    await api.delete(`/lead-statuses/${id}`);
    get().fetchStatuses();
  },
}));
