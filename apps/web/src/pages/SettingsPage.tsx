import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import { User, Users, Layers, GitBranch, MessageCircle, Shield, Mail, ChevronRight, Plus, Pencil, Trash2, Tag, Loader2 } from 'lucide-react';
import { useLeadStatusStore, CustomLeadStatus } from '@/stores/leadStatusStore';

export function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState('profile');
  const [teams, setTeams] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const { statuses: leadStatuses, loading: leadStatusLoading, fetchStatuses, createStatus, updateStatus: updateLeadStatus, deleteStatus } = useLeadStatusStore();
  const [statusForm, setStatusForm] = useState({ name: '', color: '#3b82f6' });
  const [editingStatus, setEditingStatus] = useState<CustomLeadStatus | null>(null);
  const [showStatusForm, setShowStatusForm] = useState(false);

  useEffect(() => {
    if (activeTab === 'teams') {
      api.get('/teams').then((r) => setTeams(r.data));
    }
    if (activeTab === 'rules') {
      api.get('/assignment-rules').then((r) => setRules(r.data));
    }
    if (activeTab === 'team') {
      api.get('/users').then((r) => setUsers(r.data));
    }
    if (activeTab === 'leadStatuses') {
      fetchStatuses();
    }
  }, [activeTab, fetchStatuses]);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'team', label: 'Team Members', icon: Users },
    { id: 'teams', label: 'Teams', icon: Layers },
    { id: 'rules', label: 'Assignment Rules', icon: GitBranch },
    { id: 'leadStatuses', label: 'Lead Statuses', icon: Tag },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  ];

  const roleColors: Record<string, string> = {
    OWNER: 'bg-purple-50 text-purple-700 border-purple-200',
    ADMIN: 'bg-blue-50 text-blue-700 border-blue-200',
    AGENT: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  const availabilityColors: Record<string, string> = {
    ONLINE: 'bg-emerald-500',
    AWAY: 'bg-amber-500',
    OFFLINE: 'bg-gray-400',
  };

  return (
    <div className="flex h-full animate-fade-in">
      {/* Vertical sidebar tabs */}
      <div className="w-56 border-r border-gray-100 bg-white py-6 px-3 shrink-0">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">Settings</h2>
        <nav className="space-y-0.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-left ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} />
                {tab.label}
                {isActive && <ChevronRight size={14} className="ml-auto text-emerald-400" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content area */}
      <div className="flex-1 p-8 overflow-y-auto bg-gray-50/50">
        {activeTab === 'profile' && (
          <div className="max-w-lg animate-fade-in">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">Profile</h2>
            <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm">
              {/* Avatar */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-lg font-semibold">
                  {user?.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{user?.name}</p>
                  <p className="text-sm text-gray-500">{user?.role}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                    <User size={15} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Full Name</p>
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Mail size={15} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Shield size={15} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Role</p>
                    <span className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full border ${roleColors[user?.role || ''] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                      {user?.role}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="max-w-3xl animate-fade-in">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">Team Members</h2>
            <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/80">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Member</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u: any) => (
                    <tr key={u.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-[11px] font-semibold">
                            {u.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">{u.email}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${roleColors[u.role] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${availabilityColors[u.availability] || 'bg-gray-400'}`} />
                          <span className="text-sm text-gray-600">{u.availability}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'teams' && (
          <div className="max-w-2xl animate-fade-in">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">Teams</h2>
            <div className="space-y-3">
              {teams.map((team: any) => (
                <div key={team.id} className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{team.name}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{team._count?.members || 0} members</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <Users size={15} className="text-emerald-600" />
                    </div>
                  </div>
                  {team.members?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {team.members.map((m: any) => (
                        <span key={m.id} className="inline-flex items-center gap-1.5 bg-gray-50 text-sm px-3 py-1 rounded-full text-gray-700 border border-gray-200/80">
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-[8px] font-semibold">
                            {m.user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                          {m.user.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {teams.length === 0 && (
                <div className="text-center py-12">
                  <Layers size={32} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm text-gray-500 font-medium">No teams configured</p>
                  <p className="text-xs text-gray-400 mt-1">Create teams to organize your agents</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="max-w-2xl animate-fade-in">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">Assignment Rules</h2>
            <div className="space-y-3">
              {rules.map((rule: any) => (
                <div key={rule.id} className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{rule.name}</h3>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          Strategy: {rule.strategy}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          Priority: {rule.priority}
                        </span>
                        {rule.team && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            Team: {rule.team.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      rule.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {rule.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {rule.conditions && Object.keys(rule.conditions).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-400 font-mono bg-gray-50 px-3 py-2 rounded-lg">
                        {JSON.stringify(rule.conditions, null, 2)}
                      </p>
                    </div>
                  )}
                </div>
              ))}
              {rules.length === 0 && (
                <div className="text-center py-12">
                  <GitBranch size={32} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm text-gray-500 font-medium">No assignment rules configured</p>
                  <p className="text-xs text-gray-400 mt-1">Rules help auto-assign conversations to agents</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'leadStatuses' && (
          <div className="max-w-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">Lead Statuses</h2>
              <button
                onClick={() => { setEditingStatus(null); setStatusForm({ name: '', color: '#3b82f6' }); setShowStatusForm(true); }}
                className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 text-sm font-medium shadow-sm transition-all duration-200 flex items-center gap-2"
              >
                <Plus size={16} />
                Add Status
              </button>
            </div>

            {/* Add/Edit form */}
            {showStatusForm && (
              <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm mb-4">
                <h3 className="font-semibold text-gray-900 mb-3">{editingStatus ? 'Edit Status' : 'New Status'}</h3>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!statusForm.name.trim()) return;
                    if (editingStatus) {
                      await updateLeadStatus(editingStatus.id, { name: statusForm.name, color: statusForm.color });
                    } else {
                      await createStatus({ name: statusForm.name, color: statusForm.color });
                    }
                    setShowStatusForm(false);
                    setEditingStatus(null);
                    setStatusForm({ name: '', color: '#3b82f6' });
                  }}
                  className="flex items-end gap-3"
                >
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
                    <input
                      type="text"
                      value={statusForm.name}
                      onChange={(e) => setStatusForm({ ...statusForm, name: e.target.value })}
                      placeholder="Status name..."
                      required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-300 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Color</label>
                    <input
                      type="color"
                      value={statusForm.color}
                      onChange={(e) => setStatusForm({ ...statusForm, color: e.target.value })}
                      className="w-12 h-[42px] rounded-xl border border-gray-200 cursor-pointer"
                    />
                  </div>
                  <button type="submit" className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm">
                    {editingStatus ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowStatusForm(false); setEditingStatus(null); }}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors text-gray-700"
                  >
                    Cancel
                  </button>
                </form>
              </div>
            )}

            {leadStatusLoading ? (
              <div className="text-center py-12">
                <Loader2 size={24} className="animate-spin mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-400">Loading...</p>
              </div>
            ) : (
              <div className="space-y-2">
                {leadStatuses.map((s, i) => (
                  <div key={s.id} className="bg-white border border-gray-200/80 rounded-2xl px-5 py-3.5 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow group">
                    <span className="text-sm font-medium text-gray-400 w-6">{i + 1}</span>
                    <div className="w-4 h-4 rounded-full shrink-0 border border-gray-200" style={{ backgroundColor: s.color }} />
                    <span className="text-sm font-medium text-gray-900 flex-1">{s.name}</span>
                    {!s.isActive && (
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Inactive</span>
                    )}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingStatus(s);
                          setStatusForm({ name: s.name, color: s.color });
                          setShowStatusForm(true);
                        }}
                        className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => { if (confirm(`Delete "${s.name}"?`)) deleteStatus(s.id); }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
                {leadStatuses.length === 0 && (
                  <div className="text-center py-12">
                    <Tag size={32} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-sm text-gray-500 font-medium">No lead statuses configured</p>
                    <p className="text-xs text-gray-400 mt-1">Add statuses to track your leads through the pipeline</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'whatsapp' && (
          <div className="max-w-lg animate-fade-in">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">WhatsApp Configuration</h2>
            <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <MessageCircle size={20} className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">WhatsApp Business API</h3>
                  <p className="text-xs text-gray-500">Configure your messaging provider</p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5">
                <p className="text-sm text-amber-800 font-medium">Mock Provider Active</p>
                <p className="text-xs text-amber-700 mt-0.5">Messages are logged to the API console for development.</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Webhook URL</span>
                  <code className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg text-xs font-mono">POST /api/webhooks/whatsapp</code>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-gray-500">Verify endpoint</span>
                  <code className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg text-xs font-mono">GET /api/webhooks/whatsapp</code>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
