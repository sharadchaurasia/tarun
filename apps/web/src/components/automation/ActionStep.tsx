import { WorkflowAction } from '../../stores/chatbotStore';
import { MessageSquare, Tag, UserPlus, StickyNote, Timer, Trash2 } from 'lucide-react';

const ACTION_TYPES = [
  { value: 'send_reply', label: 'Send Reply', icon: MessageSquare, color: 'blue' },
  { value: 'change_lead_status', label: 'Change Lead Status', icon: Tag, color: 'amber' },
  { value: 'assign_agent', label: 'Assign Agent', icon: UserPlus, color: 'violet' },
  { value: 'add_note', label: 'Add Note', icon: StickyNote, color: 'rose' },
  { value: 'delay', label: 'Delay', icon: Timer, color: 'slate' },
] as const;

const COLOR_STYLES: Record<string, { border: string; bg: string; badge: string; badgeText: string }> = {
  blue: { border: 'border-l-blue-400', bg: 'bg-blue-50', badge: 'bg-blue-100', badgeText: 'text-blue-700' },
  amber: { border: 'border-l-amber-400', bg: 'bg-amber-50', badge: 'bg-amber-100', badgeText: 'text-amber-700' },
  violet: { border: 'border-l-violet-400', bg: 'bg-violet-50', badge: 'bg-violet-100', badgeText: 'text-violet-700' },
  rose: { border: 'border-l-rose-400', bg: 'bg-rose-50', badge: 'bg-rose-100', badgeText: 'text-rose-700' },
  slate: { border: 'border-l-slate-400', bg: 'bg-slate-50', badge: 'bg-slate-100', badgeText: 'text-slate-700' },
};

interface Props {
  action: WorkflowAction;
  index: number;
  onChange: (action: WorkflowAction) => void;
  onRemove: () => void;
}

export function ActionStep({ action, index, onChange, onRemove }: Props) {
  const handleTypeChange = (type: WorkflowAction['type']) => {
    const defaults: Record<string, WorkflowAction['config']> = {
      send_reply: { body: '' },
      change_lead_status: { status: '' },
      assign_agent: { agentId: '' },
      add_note: { content: '' },
      delay: { seconds: 5 },
    };
    onChange({ type, config: defaults[type] || {} });
  };

  const updateConfig = (partial: Partial<WorkflowAction['config']>) => {
    onChange({ ...action, config: { ...action.config, ...partial } });
  };

  const currentType = ACTION_TYPES.find((t) => t.value === action.type);
  const Icon = currentType?.icon || MessageSquare;
  const colorKey = currentType?.color || 'blue';
  const styles = COLOR_STYLES[colorKey];

  return (
    <div className={`bg-white rounded-2xl border border-gray-200/80 border-l-4 ${styles.border} shadow-lg shadow-black/[0.03] overflow-hidden transition-all duration-300 hover:shadow-md`}>
      {/* Header */}
      <div className={`px-4 py-3 ${styles.bg} border-b border-gray-100/80 flex items-center justify-between`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-lg ${styles.badge} flex items-center justify-center`}>
            <span className={`text-xs font-bold ${styles.badgeText}`}>{index + 1}</span>
          </div>
          <Icon size={14} className={styles.badgeText} />
          <span className={`text-xs font-bold uppercase tracking-wide ${styles.badgeText}`}>
            {currentType?.label || 'Action'}
          </span>
        </div>
        <button
          onClick={onRemove}
          className="p-1.5 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-500 transition-all duration-200"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Type selector as pill buttons */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Action Type</label>
          <div className="flex flex-wrap gap-1.5">
            {ACTION_TYPES.map((t) => {
              const TIcon = t.icon;
              const isActive = action.type === t.value;
              const tStyles = COLOR_STYLES[t.color];
              return (
                <button
                  key={t.value}
                  onClick={() => handleTypeChange(t.value)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? `${tStyles.badge} ${tStyles.badgeText} shadow-sm`
                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <TIcon size={12} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Config inputs */}
        {action.type === 'send_reply' && (
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              <MessageSquare size={11} className="inline mr-1 -mt-0.5" />
              Reply Message
            </label>
            <textarea
              value={action.config.body || ''}
              onChange={(e) => updateConfig({ body: e.target.value })}
              placeholder="Type the auto-reply message..."
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none resize-none bg-gray-50/50 hover:bg-white transition-all duration-200"
            />
          </div>
        )}

        {action.type === 'change_lead_status' && (
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              <Tag size={11} className="inline mr-1 -mt-0.5" />
              Lead Status
            </label>
            <input
              type="text"
              value={action.config.status || ''}
              onChange={(e) => updateConfig({ status: e.target.value })}
              placeholder="e.g. Connected, Follow up"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 outline-none bg-gray-50/50 hover:bg-white transition-all duration-200"
            />
          </div>
        )}

        {action.type === 'assign_agent' && (
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              <UserPlus size={11} className="inline mr-1 -mt-0.5" />
              Agent ID
            </label>
            <input
              type="text"
              value={action.config.agentId || ''}
              onChange={(e) => updateConfig({ agentId: e.target.value })}
              placeholder="Paste agent user ID"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none bg-gray-50/50 hover:bg-white transition-all duration-200"
            />
          </div>
        )}

        {action.type === 'add_note' && (
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              <StickyNote size={11} className="inline mr-1 -mt-0.5" />
              Note Content
            </label>
            <textarea
              value={action.config.content || ''}
              onChange={(e) => updateConfig({ content: e.target.value })}
              placeholder="Note to add to conversation..."
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 outline-none resize-none bg-gray-50/50 hover:bg-white transition-all duration-200"
            />
          </div>
        )}

        {action.type === 'delay' && (
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              <Timer size={11} className="inline mr-1 -mt-0.5" />
              Delay (seconds)
            </label>
            <input
              type="number"
              value={action.config.seconds || 5}
              onChange={(e) => updateConfig({ seconds: parseInt(e.target.value) || 1 })}
              min={1}
              max={300}
              className="w-32 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-500/20 focus:border-slate-400 outline-none bg-gray-50/50 hover:bg-white transition-all duration-200"
            />
          </div>
        )}
      </div>
    </div>
  );
}
