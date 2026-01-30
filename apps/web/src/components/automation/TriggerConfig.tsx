import { WorkflowTrigger } from '../../stores/chatbotStore';
import { Zap, Search, MessageCirclePlus, X, Check } from 'lucide-react';

const TRIGGER_TYPES = [
  { value: 'new_message', label: 'Every New Message', icon: Zap, desc: 'Fires on every incoming message', color: 'amber' },
  { value: 'keyword_match', label: 'Keyword Match', icon: Search, desc: 'Fires when message contains specific keywords', color: 'violet' },
  { value: 'new_conversation', label: 'New Conversation', icon: MessageCirclePlus, desc: 'Fires only on the first message of a conversation', color: 'blue' },
] as const;

const COLOR_MAP: Record<string, { bg: string; iconBg: string; iconText: string; border: string; glow: string; text: string }> = {
  amber: {
    bg: 'bg-amber-50/50',
    iconBg: 'bg-gradient-to-br from-amber-400 to-amber-600',
    iconText: 'text-white',
    border: 'border-amber-400 ring-2 ring-amber-200/60',
    glow: 'shadow-amber-200/50',
    text: 'text-amber-700',
  },
  violet: {
    bg: 'bg-violet-50/50',
    iconBg: 'bg-gradient-to-br from-violet-400 to-violet-600',
    iconText: 'text-white',
    border: 'border-violet-400 ring-2 ring-violet-200/60',
    glow: 'shadow-violet-200/50',
    text: 'text-violet-700',
  },
  blue: {
    bg: 'bg-blue-50/50',
    iconBg: 'bg-gradient-to-br from-blue-400 to-blue-600',
    iconText: 'text-white',
    border: 'border-blue-400 ring-2 ring-blue-200/60',
    glow: 'shadow-blue-200/50',
    text: 'text-blue-700',
  },
};

interface Props {
  trigger: WorkflowTrigger;
  onChange: (trigger: WorkflowTrigger) => void;
}

export function TriggerConfig({ trigger, onChange }: Props) {
  const handleTypeChange = (type: WorkflowTrigger['type']) => {
    const config = type === 'keyword_match' ? { keywords: [], matchMode: 'any' as const } : {};
    onChange({ type, config });
  };

  const addKeyword = (keyword: string) => {
    if (!keyword.trim()) return;
    const keywords = [...(trigger.config.keywords || []), keyword.trim()];
    onChange({ ...trigger, config: { ...trigger.config, keywords } });
  };

  const removeKeyword = (index: number) => {
    const keywords = (trigger.config.keywords || []).filter((_: string, i: number) => i !== index);
    onChange({ ...trigger, config: { ...trigger.config, keywords } });
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        {TRIGGER_TYPES.map((t) => {
          const Icon = t.icon;
          const isSelected = trigger.type === t.value;
          const colors = COLOR_MAP[t.color];
          return (
            <button
              key={t.value}
              onClick={() => handleTypeChange(t.value)}
              className={`relative flex flex-col items-center p-5 rounded-2xl border-2 text-center transition-all duration-300 ${
                isSelected
                  ? `${colors.bg} ${colors.border} shadow-lg ${colors.glow}`
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              {/* Checkmark overlay */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm animate-[scaleIn_0.2s_ease-out]">
                  <Check size={12} className="text-white" />
                </div>
              )}

              {/* Icon in circle */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 ${
                isSelected
                  ? `${colors.iconBg} shadow-lg`
                  : 'bg-gray-100'
              }`}>
                <Icon size={22} className={isSelected ? colors.iconText : 'text-gray-400'} />
              </div>

              <p className={`text-sm font-bold mb-1 ${isSelected ? colors.text : 'text-gray-700'}`}>
                {t.label}
              </p>
              <p className="text-[11px] text-gray-400 leading-tight">{t.desc}</p>
            </button>
          );
        })}
      </div>

      {trigger.type === 'keyword_match' && (
        <div className="space-y-4 pt-2 animate-[fadeIn_0.3s_ease-out]">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Match Mode</label>
            <select
              value={trigger.config.matchMode || 'any'}
              onChange={(e) =>
                onChange({ ...trigger, config: { ...trigger.config, matchMode: e.target.value as 'any' | 'all' } })
              }
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none bg-gray-50/50 hover:bg-white transition-all duration-200"
            >
              <option value="any">Match ANY keyword</option>
              <option value="all">Match ALL keywords</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Keywords</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {(trigger.config.keywords || []).map((kw: string, i: number) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 rounded-full text-xs font-semibold border border-violet-200/60 shadow-sm"
                >
                  {kw}
                  <button
                    onClick={() => removeKeyword(i)}
                    className="w-4 h-4 rounded-full hover:bg-red-100 hover:text-red-500 flex items-center justify-center transition-colors"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Type keyword and press Enter"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none bg-gray-50/50 hover:bg-white transition-all duration-200"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addKeyword(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
