import { useEffect } from 'react';
import { useLeadStore } from '@/stores/leadStore';
import { useLeadStatusStore } from '@/stores/leadStatusStore';
import { PipelineColumn } from './PipelineColumn';
import { Loader2 } from 'lucide-react';

export function PipelineBoard() {
  const boardLeads = useLeadStore((s) => s.boardLeads);
  const boardLoading = useLeadStore((s) => s.boardLoading);
  const statuses = useLeadStatusStore((s) => s.statuses);
  const fetchStatuses = useLeadStatusStore((s) => s.fetchStatuses);

  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  if (boardLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={28} className="animate-spin mx-auto mb-3 text-gray-400" />
          <p className="text-sm text-gray-400">Loading pipeline...</p>
        </div>
      </div>
    );
  }

  const activeStatuses = statuses.filter((s) => s.isActive);

  return (
    <div className="flex-1 overflow-x-auto overflow-y-hidden">
      <div className="flex gap-3 h-full p-1 min-w-max">
        {activeStatuses.map((status) => (
          <PipelineColumn
            key={status.id}
            statusName={status.name}
            color={status.color}
            leads={boardLeads[status.name] || []}
          />
        ))}
      </div>
    </div>
  );
}
