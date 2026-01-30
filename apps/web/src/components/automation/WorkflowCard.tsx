import { Workflow } from '../../stores/chatbotStore';
import { Pencil, Trash2, FileText, Zap, MessageSquare, Tag, UserPlus, StickyNote, Timer, BarChart3 } from 'lucide-react';

const TRIGGER_LABELS: Record<string, string> = {
  new_message: 'Every new message',
  keyword_match: 'Keyword match',
  new_conversation: 'New conversation',
};

const TRIGGER_COLORS: Record<string, string> = {
  new_message: 'bg-amber-50 text-amber-700 border-amber-200',
  keyword_match: 'bg-violet-50 text-violet-700 border-violet-200',
  new_conversation: 'bg-blue-50 text-blue-700 border-blue-200',
};

const ACTION_ICONS: Record<string, typeof Zap> = {
  send_reply: MessageSquare,
  change_lead_status: Tag,
  assign_agent: UserPlus,
  add_note: StickyNote,
  delay: Timer,
};

const ACTION_COLORS: Record<string, string> = {
  send_reply: 'bg-blue-100 text-blue-600',
  change_lead_status: 'bg-amber-100 text-amber-600',
  assign_agent: 'bg-violet-100 text-violet-600',
  add_note: 'bg-rose-100 text-rose-600',
  delay: 'bg-slate-100 text-slate-600',
};

interface Props {
  workflow: Workflow;
  onEdit: () => void;
  onDelete: () => void;
  onLogs: () => void;
  onToggle: (active: boolean) => void;
}

export function WorkflowCard({ workflow, onEdit, onDelete, onLogs, onToggle }: Props) {
  const triggerLabel = TRIGGER_LABELS[workflow.trigger?.type] || workflow.trigger?.type || 'Unknown';
  const triggerColor = TRIGGER_COLORS[workflow.trigger?.type] || 'bg-gray-50 text-gray-600 border-gray-200';
  const keywords = workflow.trigger?.config?.keywords;

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-200/80 shadow-lg shadow-black/[0.03] hover:shadow-xl hover:shadow-black/[0.06] hover:scale-[1.01] transition-all duration-300 overflow-hidden">
      {/* Gradient left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${workflow.isActive ? 'bg-gradient-to-b from-emerald-400 to-emerald-600' : 'bg-gradient-to-b from-gray-200 to-gray-300'}`} />

      <div className="p-5 pl-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Title + Status */}
            <div className="flex items-center gap-3 mb-1.5">
              <h3 className="text-base font-bold text-gray-900 truncate">{workflow.name}</h3>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  workflow.isActive
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-gray-100 text-gray-500 border border-gray-200'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${workflow.isActive ? 'bg-emerald-500 shadow-sm shadow-emerald-400' : 'bg-gray-400'}`} />
                {workflow.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            {workflow.description && (
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">{workflow.description}</p>
            )}

            {/* Trigger badge */}
            <div className="flex items-center gap-3 mb-3">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${triggerColor}`}>
                <Zap size={12} />
                {triggerLabel}
              </span>
              {keywords && keywords.length > 0 && (
                <span className="text-xs text-gray-400 italic">
                  ({keywords.join(', ')})
                </span>
              )}
            </div>

            {/* Action icon badges */}
            {workflow.actions && workflow.actions.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                {workflow.actions.map((action, i) => {
                  const Icon = ACTION_ICONS[action.type] || Zap;
                  const colorClass = ACTION_COLORS[action.type] || 'bg-gray-100 text-gray-500';
                  return (
                    <span
                      key={i}
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-full ${colorClass}`}
                      title={action.type.replace(/_/g, ' ')}
                    >
                      <Icon size={13} />
                    </span>
                  );
                })}
                <span className="text-xs text-gray-400 ml-1">
                  {workflow.actions.length} action{workflow.actions.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            {/* Execution stats */}
            {workflow._count?.logs != null && workflow._count.logs > 0 && (
              <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-400">
                <BarChart3 size={12} />
                <span>{workflow._count.logs} execution{workflow._count.logs !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>

          {/* Right controls */}
          <div className="flex flex-col items-end gap-3 shrink-0">
            {/* Toggle */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={workflow.isActive}
                onChange={(e) => onToggle(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:shadow-sm after:transition-all duration-300 peer-checked:bg-gradient-to-r peer-checked:from-emerald-400 peer-checked:to-emerald-500" />
            </label>

            {/* Action buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={onLogs}
                className="p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                title="Logs"
              >
                <FileText size={15} />
              </button>
              <button
                onClick={onEdit}
                className="p-2 rounded-xl text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200"
                title="Edit"
              >
                <Pencil size={15} />
              </button>
              <button
                onClick={onDelete}
                className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                title="Delete"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
