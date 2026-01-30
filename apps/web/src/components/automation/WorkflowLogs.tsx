import { useEffect } from 'react';
import { useChatbotStore } from '../../stores/chatbotStore';
import { CheckCircle, XCircle, Loader2, BarChart3, Clock, Hash, AlertTriangle } from 'lucide-react';

function timeAgo(dateStr: string) {
  const now = Date.now();
  const d = new Date(dateStr).getTime();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function WorkflowLogs({ workflowId }: { workflowId: string }) {
  const { logs, logsLoading, fetchLogs } = useChatbotStore();

  useEffect(() => {
    fetchLogs(workflowId);
  }, [workflowId, fetchLogs]);

  if (logsLoading) {
    return (
      <div className="flex items-center justify-center py-20 animate-[fadeIn_0.3s_ease-out]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <Loader2 className="animate-spin text-gray-400" size={24} />
          </div>
          <p className="text-sm text-gray-400">Loading logs...</p>
        </div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 animate-[fadeIn_0.5s_ease-out]">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-4">
            <BarChart3 size={28} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-700 mb-1">No execution logs yet</h3>
          <p className="text-sm text-gray-400">Logs will appear here once the workflow has been triggered.</p>
        </div>
      </div>
    );
  }

  const successCount = logs.filter((l) => l.status === 'success').length;
  const failCount = logs.filter((l) => l.status !== 'success').length;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-[fadeIn_0.3s_ease-out]">
      {/* Stats header */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-lg shadow-black/[0.03] p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <BarChart3 size={18} className="text-gray-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Total</p>
            <p className="text-xl font-bold text-gray-900">{logs.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-lg shadow-black/[0.03] p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
            <CheckCircle size={18} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Success</p>
            <p className="text-xl font-bold text-emerald-600">{successCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-lg shadow-black/[0.03] p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
            <XCircle size={18} className="text-red-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Failed</p>
            <p className="text-xl font-bold text-red-600">{failCount}</p>
          </div>
        </div>
      </div>

      {/* Log cards */}
      <div className="space-y-3">
        {logs.map((log, i) => {
          const isSuccess = log.status === 'success';
          return (
            <div
              key={log.id}
              className={`bg-white rounded-2xl border border-gray-200/80 shadow-lg shadow-black/[0.03] overflow-hidden transition-all duration-300 hover:shadow-md animate-[fadeIn_0.3s_ease-out] border-l-4 ${
                isSuccess ? 'border-l-emerald-400' : 'border-l-red-400'
              }`}
              style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'both' }}
            >
              <div className="p-4 flex items-center gap-4">
                {/* Status icon */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  isSuccess
                    ? 'bg-gradient-to-br from-emerald-100 to-emerald-200'
                    : 'bg-gradient-to-br from-red-100 to-red-200'
                }`}>
                  {isSuccess ? (
                    <CheckCircle size={16} className="text-emerald-600" />
                  ) : (
                    <XCircle size={16} className="text-red-600" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm font-semibold ${isSuccess ? 'text-emerald-700' : 'text-red-700'}`}>
                      {isSuccess ? 'Success' : 'Failed'}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[10px] font-mono font-medium">
                      <Hash size={9} />
                      {log.conversationId.slice(0, 8)}
                    </span>
                  </div>
                  {log.error && (
                    <div className="flex items-start gap-1.5 mt-1.5 px-2.5 py-1.5 bg-red-50 rounded-lg border border-red-100">
                      <AlertTriangle size={12} className="text-red-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-red-600 leading-relaxed">{log.error}</p>
                    </div>
                  )}
                </div>

                {/* Timestamp */}
                <div className="flex items-center gap-1.5 text-xs text-gray-400 shrink-0">
                  <Clock size={12} />
                  {timeAgo(log.executedAt)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
