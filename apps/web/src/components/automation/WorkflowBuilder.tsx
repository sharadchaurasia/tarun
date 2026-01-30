import { useState } from 'react';
import { useChatbotStore, Workflow, WorkflowTrigger, WorkflowAction } from '../../stores/chatbotStore';
import { TriggerConfig } from './TriggerConfig';
import { ActionList } from './ActionList';
import { Save, Loader2, FileText, Zap, Play } from 'lucide-react';

interface Props {
  workflow?: Workflow;
  onSave: () => void;
}

export function WorkflowBuilder({ workflow, onSave }: Props) {
  const { createWorkflow, updateWorkflow } = useChatbotStore();
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(workflow?.name || '');
  const [description, setDescription] = useState(workflow?.description || '');
  const [trigger, setTrigger] = useState<WorkflowTrigger>(
    workflow?.trigger || { type: 'new_message', config: {} },
  );
  const [actions, setActions] = useState<WorkflowAction[]>(
    workflow?.actions || [{ type: 'send_reply', config: { body: '' } }],
  );

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (workflow) {
        await updateWorkflow(workflow.id, { name, description, trigger, actions });
      } else {
        await createWorkflow({ name, description, trigger, actions });
      }
      onSave();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Step connector layout */}
      <div className="relative">
        {/* Vertical connector line */}
        <div className="absolute left-[19px] top-10 bottom-32 w-0.5 bg-gradient-to-b from-blue-200 via-amber-200 to-purple-200" />

        {/* Section 1: Details */}
        <div className="relative pl-12 pb-8 animate-[fadeIn_0.3s_ease-out]">
          {/* Step circle */}
          <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25 z-10">
            <FileText size={16} className="text-white" />
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-lg shadow-black/[0.03] overflow-hidden">
            {/* Header bar */}
            <div className="px-5 py-3 bg-gradient-to-r from-blue-50 to-blue-50/30 border-b border-blue-100/60">
              <h2 className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Details
              </h2>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Welcome Message"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all duration-200 bg-gray-50/50 hover:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all duration-200 bg-gray-50/50 hover:bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Trigger */}
        <div className="relative pl-12 pb-8 animate-[fadeIn_0.4s_ease-out]" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
          {/* Step circle */}
          <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/25 z-10">
            <Zap size={16} className="text-white" />
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-lg shadow-black/[0.03] overflow-hidden">
            {/* Header bar */}
            <div className="px-5 py-3 bg-gradient-to-r from-amber-50 to-amber-50/30 border-b border-amber-100/60">
              <h2 className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Trigger
              </h2>
            </div>

            <div className="p-5">
              <TriggerConfig trigger={trigger} onChange={setTrigger} />
            </div>
          </div>
        </div>

        {/* Section 3: Actions */}
        <div className="relative pl-12 pb-8 animate-[fadeIn_0.5s_ease-out]" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
          {/* Step circle */}
          <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/25 z-10">
            <Play size={16} className="text-white" />
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-lg shadow-black/[0.03] overflow-hidden">
            {/* Header bar */}
            <div className="px-5 py-3 bg-gradient-to-r from-purple-50 to-purple-50/30 border-b border-purple-100/60">
              <h2 className="text-xs font-bold text-purple-700 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                Actions
              </h2>
            </div>

            <div className="p-5">
              <ActionList actions={actions} onChange={setActions} />
            </div>
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="pl-12 animate-[fadeIn_0.5s_ease-out]" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
        <button
          onClick={handleSave}
          disabled={!name.trim() || saving}
          className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl text-sm font-bold hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.01] active:scale-[0.99] group"
        >
          {saving ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Save size={18} className="group-hover:rotate-[-8deg] transition-transform duration-300" />
          )}
          {workflow ? 'Update Workflow' : 'Create Workflow'}
        </button>
      </div>
    </div>
  );
}
