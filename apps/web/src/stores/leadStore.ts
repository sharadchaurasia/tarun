import { create } from 'zustand';
import api from '../lib/api';

export interface Lead {
  id: string;
  tenantId: string;
  contactId: string;
  assignedAgentId: string | null;
  channel: string;
  status: string;
  leadStatus: string;
  lastMessageAt: string | null;
  createdAt: string;
  contact: { id: string; name: string | null; phone: string; email: string | null };
  assignedAgent: { id: string; name: string; email: string } | null;
  _count: { callLogs: number; messages: number };
  messages: { body: string; direction: string; createdAt: string }[];
}

export interface CallLog {
  id: string;
  notes: string;
  outcome: string;
  duration: number | null;
  createdAt: string;
  user: { id: string; name: string };
}

export interface LeadDetail extends Lead {
  callLogs: CallLog[];
}

interface LeadState {
  leads: Lead[];
  total: number;
  page: number;
  search: string;
  leadStatusFilter: string;
  agentFilter: string;
  loading: boolean;
  stats: Record<string, number> | null;
  selectedLead: LeadDetail | null;
  selectedLoading: boolean;
  boardLeads: Record<string, Lead[]>;
  boardLoading: boolean;

  setSearch: (search: string) => void;
  setPage: (page: number) => void;
  setLeadStatusFilter: (status: string) => void;
  setAgentFilter: (agentId: string) => void;
  fetchLeads: () => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchLeadDetail: (id: string) => Promise<void>;
  updateLeadStatus: (id: string, leadStatus: string) => Promise<void>;
  addCallLog: (id: string, data: { notes: string; outcome: string; duration?: number }) => Promise<void>;
  reassignLead: (id: string, agentId: string) => Promise<void>;
  clearSelected: () => void;
  fetchBoardLeads: () => Promise<void>;
  moveLead: (leadId: string, fromStatus: string, toStatus: string) => Promise<void>;
}

export const useLeadStore = create<LeadState>((set, get) => ({
  leads: [],
  total: 0,
  page: 1,
  search: '',
  leadStatusFilter: '',
  agentFilter: '',
  loading: false,
  stats: null,
  selectedLead: null,
  selectedLoading: false,
  boardLeads: {},
  boardLoading: false,

  setSearch: (search) => set({ search, page: 1 }),
  setPage: (page) => set({ page }),
  setLeadStatusFilter: (leadStatusFilter) => set({ leadStatusFilter, page: 1 }),
  setAgentFilter: (agentFilter) => set({ agentFilter, page: 1 }),
  clearSelected: () => set({ selectedLead: null }),

  fetchLeads: async () => {
    set({ loading: true });
    try {
      const { search, page, leadStatusFilter, agentFilter } = get();
      const res = await api.get('/leads', {
        params: {
          search: search || undefined,
          page,
          limit: 20,
          leadStatus: leadStatusFilter || undefined,
          agentId: agentFilter || undefined,
        },
      });
      set({ leads: res.data.data, total: res.data.total });
    } finally {
      set({ loading: false });
    }
  },

  fetchStats: async () => {
    const res = await api.get('/leads/stats');
    set({ stats: res.data });
  },

  fetchLeadDetail: async (id) => {
    set({ selectedLoading: true });
    try {
      const res = await api.get(`/leads/${id}`);
      set({ selectedLead: res.data });
    } finally {
      set({ selectedLoading: false });
    }
  },

  updateLeadStatus: async (id, leadStatus) => {
    await api.patch(`/leads/${id}/status`, { leadStatus });
    set((state) => ({
      leads: state.leads.map((l) => (l.id === id ? { ...l, leadStatus } : l)),
    }));
    const { selectedLead } = get();
    if (selectedLead?.id === id) {
      set({ selectedLead: { ...selectedLead, leadStatus } });
    }
    get().fetchStats();
  },

  addCallLog: async (id, data) => {
    const res = await api.post(`/leads/${id}/call-log`, data);
    const { selectedLead } = get();
    if (selectedLead?.id === id) {
      set({
        selectedLead: {
          ...selectedLead,
          callLogs: [res.data, ...selectedLead.callLogs],
          leadStatus: selectedLead.leadStatus === 'New lead' ? 'Connected' : selectedLead.leadStatus,
          _count: { ...selectedLead._count, callLogs: selectedLead._count.callLogs + 1 },
        },
      });
    }
    set((state) => ({
      leads: state.leads.map((l) =>
        l.id === id
          ? {
              ...l,
              leadStatus: l.leadStatus === 'New lead' ? 'Connected' : l.leadStatus,
              _count: { ...l._count, callLogs: l._count.callLogs + 1 },
            }
          : l,
      ),
    }));
    get().fetchStats();
  },

  reassignLead: async (id, agentId) => {
    const res = await api.patch(`/leads/${id}/assign`, { agentId });
    set((state) => ({
      leads: state.leads.map((l) => (l.id === id ? { ...l, assignedAgent: res.data.assignedAgent } : l)),
    }));
    const { selectedLead } = get();
    if (selectedLead?.id === id) {
      set({ selectedLead: { ...selectedLead, assignedAgent: res.data.assignedAgent, assignedAgentId: agentId } });
    }
  },

  fetchBoardLeads: async () => {
    set({ boardLoading: true });
    try {
      const { search } = get();
      const res = await api.get('/leads', {
        params: { limit: 200, search: search || undefined },
      });
      const grouped: Record<string, Lead[]> = {};
      for (const lead of res.data.data as Lead[]) {
        const status = lead.leadStatus || 'Unknown';
        if (!grouped[status]) grouped[status] = [];
        grouped[status].push(lead);
      }
      set({ boardLeads: grouped });
    } finally {
      set({ boardLoading: false });
    }
  },

  moveLead: async (leadId, fromStatus, toStatus) => {
    if (fromStatus === toStatus) return;

    const prev = get().boardLeads;
    const fromCol = prev[fromStatus] || [];
    const toCol = prev[toStatus] || [];
    const card = fromCol.find((l) => l.id === leadId);
    if (!card) return;

    set({
      boardLeads: {
        ...prev,
        [fromStatus]: fromCol.filter((l) => l.id !== leadId),
        [toStatus]: [{ ...card, leadStatus: toStatus }, ...toCol],
      },
    });

    try {
      await api.patch(`/leads/${leadId}/status`, { leadStatus: toStatus });
      const { selectedLead } = get();
      if (selectedLead?.id === leadId) {
        set({ selectedLead: { ...selectedLead, leadStatus: toStatus } });
      }
      get().fetchStats();
    } catch {
      set({ boardLeads: prev });
    }
  },
}));
