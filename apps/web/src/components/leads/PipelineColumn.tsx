import { useState } from 'react';
import { Lead, useLeadStore } from '@/stores/leadStore';
import { LeadCard } from './LeadCard';

interface PipelineColumnProps {
  statusName: string;
  color: string;
  leads: Lead[];
}

export function PipelineColumn({ statusName, color, leads }: PipelineColumnProps) {
  const moveLead = useLeadStore((s) => s.moveLead);
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const leadId = e.dataTransfer.getData('leadId');
    const fromStatus = e.dataTransfer.getData('fromStatus');
    if (leadId && fromStatus) {
      moveLead(leadId, fromStatus, statusName);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`w-[260px] shrink-0 flex flex-col rounded-2xl transition-all duration-200 ${
        dragOver ? 'ring-2 ring-emerald-400/50 bg-emerald-50/30' : 'bg-gray-100/60'
      }`}
    >
      {/* Header */}
      <div className="px-3.5 py-3 flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <span className="text-sm font-semibold text-gray-700 truncate">{statusName}</span>
        <span className="ml-auto text-xs font-medium text-gray-400 bg-white/80 rounded-full px-2 py-0.5">
          {leads.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2 min-h-0">
        {leads.length === 0 && (
          <div className="text-center py-8">
            <p className="text-xs text-gray-400">No leads</p>
          </div>
        )}
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} status={statusName} />
        ))}
      </div>
    </div>
  );
}
