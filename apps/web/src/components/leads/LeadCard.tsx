import { MessageSquare, Phone, Clock } from 'lucide-react';
import { Lead, useLeadStore } from '@/stores/leadStore';

const avatarColors = [
  'from-violet-400 to-purple-600',
  'from-blue-400 to-indigo-600',
  'from-emerald-400 to-teal-600',
  'from-orange-400 to-red-500',
  'from-pink-400 to-rose-600',
  'from-cyan-400 to-blue-600',
  'from-amber-400 to-orange-600',
  'from-teal-400 to-emerald-600',
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

interface LeadCardProps {
  lead: Lead;
  status: string;
}

export function LeadCard({ lead, status }: LeadCardProps) {
  const fetchLeadDetail = useLeadStore((s) => s.fetchLeadDetail);
  const displayName = lead.contact.name || lead.contact.phone;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('leadId', lead.id);
    e.dataTransfer.setData('fromStatus', status);
    e.dataTransfer.effectAllowed = 'move';
    (e.currentTarget as HTMLElement).style.opacity = '0.4';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).style.opacity = '1';
  };

  const handleClick = () => {
    fetchLeadDetail(lead.id);
  };

  return (
    <div
      draggable="true"
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      className="bg-white rounded-xl border border-gray-200/80 shadow-sm hover:shadow-md transition-all duration-200 p-3.5 cursor-grab active:cursor-grabbing"
    >
      {/* Contact */}
      <div className="flex items-center gap-2.5 mb-2.5">
        <div
          className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarColor(displayName)} flex items-center justify-center text-white text-[11px] font-semibold shrink-0`}
        >
          {getInitials(displayName)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900 truncate">{lead.contact.name || lead.contact.phone}</p>
          {lead.contact.email && (
            <p className="text-xs text-gray-400 truncate">{lead.contact.email}</p>
          )}
        </div>
      </div>

      {/* Agent */}
      {lead.assignedAgent && (
        <p className="text-xs text-gray-500 mb-2 truncate">
          <span className="text-gray-400">Agent:</span> {lead.assignedAgent.name}
        </p>
      )}

      {/* Meta row */}
      <div className="flex items-center gap-3 text-xs text-gray-400">
        {lead._count.messages > 0 && (
          <span className="flex items-center gap-1">
            <MessageSquare size={12} />
            {lead._count.messages}
          </span>
        )}
        {lead._count.callLogs > 0 && (
          <span className="flex items-center gap-1">
            <Phone size={12} />
            {lead._count.callLogs}
          </span>
        )}
        {lead.lastMessageAt && (
          <span className="flex items-center gap-1 ml-auto">
            <Clock size={12} />
            {timeAgo(lead.lastMessageAt)}
          </span>
        )}
      </div>
    </div>
  );
}
