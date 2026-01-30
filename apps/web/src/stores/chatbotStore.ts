import { create } from 'zustand';
import api from '../lib/api';

export interface WorkflowTrigger {
  type: 'new_message' | 'keyword_match' | 'new_conversation';
  config: {
    keywords?: string[];
    matchMode?: 'any' | 'all';
  };
}

export interface WorkflowAction {
  type: 'send_reply' | 'change_lead_status' | 'assign_agent' | 'add_note' | 'delay';
  config: {
    body?: string;
    status?: string;
    agentId?: string;
    content?: string;
    seconds?: number;
  };
}

export interface Workflow {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  isActive: boolean;
  trigger: WorkflowTrigger;
  actions: WorkflowAction[];
  createdAt: string;
  updatedAt: string;
  _count?: { logs: number };
}

export interface WorkflowLog {
  id: string;
  workflowId: string;
  conversationId: string;
  status: string;
  error?: string;
  executedAt: string;
}

interface ChatbotState {
  workflows: Workflow[];
  selectedWorkflow: Workflow | null;
  logs: WorkflowLog[];
  loading: boolean;
  logsLoading: boolean;
  fetchWorkflows: () => Promise<void>;
  fetchWorkflow: (id: string) => Promise<void>;
  createWorkflow: (data: { name: string; description?: string; trigger: WorkflowTrigger; actions: WorkflowAction[] }) => Promise<Workflow>;
  updateWorkflow: (id: string, data: Partial<{ name: string; description: string; trigger: WorkflowTrigger; actions: WorkflowAction[]; isActive: boolean }>) => Promise<void>;
  deleteWorkflow: (id: string) => Promise<void>;
  toggleActive: (id: string, isActive: boolean) => Promise<void>;
  fetchLogs: (workflowId: string) => Promise<void>;
  clearSelected: () => void;
}

export const useChatbotStore = create<ChatbotState>((set, get) => ({
  workflows: [],
  selectedWorkflow: null,
  logs: [],
  loading: false,
  logsLoading: false,

  fetchWorkflows: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/chatbot/workflows');
      set({ workflows: res.data });
    } finally {
      set({ loading: false });
    }
  },

  fetchWorkflow: async (id) => {
    const res = await api.get(`/chatbot/workflows/${id}`);
    set({ selectedWorkflow: res.data });
  },

  createWorkflow: async (data) => {
    const res = await api.post('/chatbot/workflows', data);
    get().fetchWorkflows();
    return res.data;
  },

  updateWorkflow: async (id, data) => {
    await api.patch(`/chatbot/workflows/${id}`, data);
    get().fetchWorkflows();
  },

  deleteWorkflow: async (id) => {
    await api.delete(`/chatbot/workflows/${id}`);
    set((s) => ({ workflows: s.workflows.filter((w) => w.id !== id), selectedWorkflow: null }));
  },

  toggleActive: async (id, isActive) => {
    await api.patch(`/chatbot/workflows/${id}`, { isActive });
    set((s) => ({
      workflows: s.workflows.map((w) => (w.id === id ? { ...w, isActive } : w)),
    }));
  },

  fetchLogs: async (workflowId) => {
    set({ logsLoading: true });
    try {
      const res = await api.get(`/chatbot/workflows/${workflowId}/logs`);
      set({ logs: res.data });
    } finally {
      set({ logsLoading: false });
    }
  },

  clearSelected: () => set({ selectedWorkflow: null, logs: [] }),
}));
