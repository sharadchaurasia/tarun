import { useEffect } from 'react';
import { Search } from 'lucide-react';
import { useLeadStore } from '@/stores/leadStore';
import { PipelineBoard } from '@/components/leads/PipelineBoard';
import { LeadDetailSlideOver } from '@/components/leads/LeadDetailSlideOver';

export function PipelinePage() {
  const search = useLeadStore((s) => s.search);
  const setSearch = useLeadStore((s) => s.setSearch);
  const stats = useLeadStore((s) => s.stats);
  const fetchBoardLeads = useLeadStore((s) => s.fetchBoardLeads);
  const fetchStats = useLeadStore((s) => s.fetchStats);

  useEffect(() => {
    fetchBoardLeads();
    fetchStats();
  }, [fetchBoardLeads, fetchStats]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBoardLeads();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, fetchBoardLeads]);

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pipeline</h1>
          {stats && (
            <p className="text-sm text-gray-500 mt-0.5">{stats.TOTAL} total leads</p>
          )}
        </div>
        <div className="relative w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-300 transition-all duration-200 text-sm"
          />
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 px-5 pb-5 min-h-0">
        <PipelineBoard />
      </div>

      {/* Detail slide-over */}
      <LeadDetailSlideOver />
    </div>
  );
}
