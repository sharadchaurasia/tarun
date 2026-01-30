import { useEffect, useState } from 'react';
import { useChatbotStore, Workflow } from '../stores/chatbotStore';
import { WorkflowCard } from '../components/automation/WorkflowCard';
import { WorkflowBuilder } from '../components/automation/WorkflowBuilder';
import { WorkflowLogs } from '../components/automation/WorkflowLogs';
import { Plus, Bot, Loader2, ArrowLeft, Sparkles } from 'lucide-react';

type View = 'list' | 'create' | 'edit' | 'logs';

export function AutomationPage() {
  const { workflows, loading, fetchWorkflows, deleteWorkflow, toggleActive } = useChatbotStore();
  const [view, setView] = useState<View>('list');
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);
  const [logsWorkflow, setLogsWorkflow] = useState<Workflow | null>(null);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  const handleEdit = (workflow: Workflow) => {
    setEditingWorkflow(workflow);
    setView('edit');
  };

  const handleLogs = (workflow: Workflow) => {
    setLogsWorkflow(workflow);
    setView('logs');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this workflow?')) return;
    await deleteWorkflow(id);
  };

  const handleBack = () => {
    setView('list');
    setEditingWorkflow(null);
    setLogsWorkflow(null);
    fetchWorkflows();
  };

  if (view === 'create') {
    return (
      <div className="h-full flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200/60 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 backdrop-blur-xl flex items-center gap-3">
          <button onClick={handleBack} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-300 transition-all duration-300">
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Plus size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">New Workflow</h1>
              <p className="text-xs text-gray-400">Configure your automation</p>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
          <WorkflowBuilder onSave={handleBack} />
        </div>
      </div>
    );
  }

  if (view === 'edit' && editingWorkflow) {
    return (
      <div className="h-full flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200/60 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 backdrop-blur-xl flex items-center gap-3">
          <button onClick={handleBack} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-300 transition-all duration-300">
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">Edit: {editingWorkflow.name}</h1>
              <p className="text-xs text-gray-400">Modify workflow settings</p>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
          <WorkflowBuilder workflow={editingWorkflow} onSave={handleBack} />
        </div>
      </div>
    );
  }

  if (view === 'logs' && logsWorkflow) {
    return (
      <div className="h-full flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200/60 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 backdrop-blur-xl flex items-center gap-3">
          <button onClick={handleBack} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-300 transition-all duration-300">
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Bot size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">Logs: {logsWorkflow.name}</h1>
              <p className="text-xs text-gray-400">Execution history</p>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
          <WorkflowLogs workflowId={logsWorkflow.id} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Glass-dark gradient header */}
      <div className="px-6 py-5 border-b border-gray-200/60 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 backdrop-blur-xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <Bot size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Automation</h1>
            <p className="text-xs text-gray-400 mt-0.5">Manage chatbot workflows</p>
          </div>
          {workflows.length > 0 && (
            <span className="ml-2 px-2.5 py-1 bg-white/10 backdrop-blur-sm text-white/80 rounded-full text-xs font-medium border border-white/10 animate-[fadeIn_0.3s_ease-out]">
              {workflows.length} workflow{workflows.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <button
          onClick={() => setView('create')}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl text-sm font-semibold hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus size={16} />
          New Workflow
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50 to-white">
        {loading ? (
          <div className="flex items-center justify-center py-20 animate-[fadeIn_0.3s_ease-out]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <Loader2 className="animate-spin text-gray-400" size={24} />
              </div>
              <p className="text-sm text-gray-400">Loading workflows...</p>
            </div>
          </div>
        ) : workflows.length === 0 ? (
          <div className="flex items-center justify-center py-20 animate-[fadeIn_0.5s_ease-out]">
            <div className="text-center max-w-sm">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-emerald-100 via-emerald-50 to-teal-100 flex items-center justify-center mb-6 shadow-lg shadow-emerald-100/50 animate-[scaleIn_0.4s_ease-out]">
                <Bot size={36} className="text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No workflows yet</h3>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                Create your first automation workflow to handle incoming messages automatically.
              </p>
              <button
                onClick={() => setView('create')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl text-sm font-semibold hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus size={16} />
                Create Workflow
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 max-w-5xl lg:grid-cols-2">
            {workflows.map((workflow, i) => (
              <div key={workflow.id} className="animate-[fadeIn_0.3s_ease-out]" style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}>
                <WorkflowCard
                  workflow={workflow}
                  onEdit={() => handleEdit(workflow)}
                  onDelete={() => handleDelete(workflow.id)}
                  onLogs={() => handleLogs(workflow)}
                  onToggle={(active) => toggleActive(workflow.id, active)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
