import { Message } from '@/stores/messageStore';
import { Check, CheckCheck } from 'lucide-react';

interface Props {
  message: Message;
}

export function MessageBubble({ message }: Props) {
  const isOutbound = message.direction === 'OUTBOUND';

  return (
    <div className={`flex ${isOutbound ? 'justify-end' : 'justify-start'} mb-1`}>
      <div
        className={`max-w-[70%] rounded-2xl px-3.5 py-2 relative shadow-sm ${
          isOutbound
            ? 'bg-emerald-600 text-white rounded-br-md'
            : 'bg-white text-gray-900 rounded-bl-md'
        }`}
      >
        {isOutbound && message.sender && (
          <p className="text-[11px] font-medium opacity-80 mb-0.5">{message.sender.name}</p>
        )}
        <p className="text-[13px] leading-relaxed whitespace-pre-wrap break-words">{message.body}</p>
        <div className={`flex items-center justify-end gap-1 mt-0.5 ${isOutbound ? 'text-emerald-200' : 'text-gray-400'}`}>
          <span className="text-[10px]">
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {isOutbound && (
            message.status === 'READ' ? (
              <CheckCheck size={13} className="text-sky-300" />
            ) : message.status === 'DELIVERED' ? (
              <CheckCheck size={13} />
            ) : (
              <Check size={13} />
            )
          )}
        </div>
      </div>
    </div>
  );
}
