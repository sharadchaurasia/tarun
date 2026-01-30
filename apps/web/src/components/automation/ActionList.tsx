import { WorkflowAction } from '../../stores/chatbotStore';
import { ActionStep } from './ActionStep';
import { Plus, ChevronUp, ChevronDown } from 'lucide-react';

interface Props {
  actions: WorkflowAction[];
  onChange: (actions: WorkflowAction[]) => void;
}

export function ActionList({ actions, onChange }: Props) {
  const addAction = () => {
    onChange([...actions, { type: 'send_reply', config: { body: '' } }]);
  };

  const updateAction = (index: number, action: WorkflowAction) => {
    const updated = [...actions];
    updated[index] = action;
    onChange(updated);
  };

  const removeAction = (index: number) => {
    onChange(actions.filter((_, i) => i !== index));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...actions];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    onChange(updated);
  };

  const moveDown = (index: number) => {
    if (index === actions.length - 1) return;
    const updated = [...actions];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    onChange(updated);
  };

  return (
    <div className="space-y-0">
      {actions.map((action, i) => (
        <div key={i} className="relative">
          {/* Connector line between steps */}
          {i > 0 && (
            <div className="flex justify-center py-2">
              <div className="flex flex-col items-center">
                <div className="w-0.5 h-4 border-l-2 border-dashed border-gray-300" />
                <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-gray-300 flex items-center justify-center">
                  <span className="text-[9px] font-bold text-gray-500">{i + 1}</span>
                </div>
                <div className="w-0.5 h-4 border-l-2 border-dashed border-gray-300" />
              </div>
            </div>
          )}

          {/* Step card with reorder controls */}
          <div className="relative flex gap-2">
            {/* Reorder buttons */}
            {actions.length > 1 && (
              <div className="flex flex-col items-center justify-center gap-1 pt-12">
                <button
                  onClick={() => moveUp(i)}
                  disabled={i === 0}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
                    i === 0
                      ? 'text-gray-200 cursor-not-allowed'
                      : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100 hover:shadow-sm'
                  }`}
                  title="Move up"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  onClick={() => moveDown(i)}
                  disabled={i === actions.length - 1}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
                    i === actions.length - 1
                      ? 'text-gray-200 cursor-not-allowed'
                      : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100 hover:shadow-sm'
                  }`}
                  title="Move down"
                >
                  <ChevronDown size={14} />
                </button>
              </div>
            )}

            <div className="flex-1">
              <ActionStep
                action={action}
                index={i}
                onChange={(a) => updateAction(i, a)}
                onRemove={() => removeAction(i)}
              />
            </div>
          </div>
        </div>
      ))}

      {/* Add action button */}
      <div className="pt-4">
        {actions.length > 0 && (
          <div className="flex justify-center pb-3">
            <div className="w-0.5 h-6 border-l-2 border-dashed border-gray-300" />
          </div>
        )}
        <button
          onClick={addAction}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-4 border-2 border-dashed border-gray-300 rounded-2xl text-sm font-semibold text-gray-400 hover:text-emerald-600 hover:border-emerald-400 hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-teal-50/50 transition-all duration-300 group"
        >
          <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-emerald-100 flex items-center justify-center transition-all duration-300">
            <Plus size={16} className="group-hover:text-emerald-600 transition-colors" />
          </div>
          Add Action Step
        </button>
      </div>
    </div>
  );
}
