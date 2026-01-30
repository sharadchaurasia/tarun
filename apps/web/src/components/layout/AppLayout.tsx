import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Inbox, Kanban, Users, Settings, LogOut, MessageSquare, Bot } from 'lucide-react';

const navItems = [
  { path: '/inbox', label: 'Inbox', icon: Inbox },
  { path: '/pipeline', label: 'Pipeline', icon: Kanban },
  { path: '/automation', label: 'Automation', icon: Bot },
  { path: '/contacts', label: 'Contacts', icon: Users },
  { path: '/settings', label: 'Settings', icon: Settings },
];

function UserAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
      {initials}
    </div>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <div className="w-[220px] glass-dark text-white flex flex-col">
        {/* Brand */}
        <div className="p-5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center">
              <MessageSquare size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-tight">Tarun</h1>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">WhatsApp Business</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-4 border-t border-white/10" />

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white/15 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/8'
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="mx-4 border-t border-white/10" />

        {/* User section */}
        <div className="p-4">
          <div className="flex items-center gap-3">
            {user && <UserAvatar name={user.name} />}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate text-slate-200">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-md text-slate-500 hover:text-red-400 hover:bg-white/8 transition-all duration-200"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden bg-gray-50/50">
        {children}
      </div>
    </div>
  );
}
