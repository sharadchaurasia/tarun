import { useState } from 'react';
import { Send, Paperclip } from 'lucide-react';

interface Props {
  onSend: (body: string) => void;
}

export function MessageInput({ onSend }: Props) {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-gray-100 bg-white flex items-end gap-2">
      <button
        type="button"
        className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors shrink-0"
        title="Attach file"
      >
        <Paperclip size={18} />
      </button>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        rows={1}
        className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-300 focus:bg-white transition-all duration-200 text-sm"
      />
      <button
        type="submit"
        disabled={!text.trim()}
        className="p-2.5 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 disabled:opacity-40 disabled:hover:bg-emerald-600 transition-all duration-200 shadow-sm shrink-0"
      >
        <Send size={16} />
      </button>
    </form>
  );
}
