import { useEffect, useState } from 'react';
import { useContactStore, Contact } from '@/stores/contactStore';
import { Search, Plus, X, Pencil, Trash2, Phone, Mail, Tag, Users, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

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

export function ContactsPage() {
  const { contacts, total, page, search, loading, setSearch, setPage, fetchContacts, createContact, updateContact, deleteContact } = useContactStore();
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [form, setForm] = useState({ phone: '', name: '', email: '', tags: '' });

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts, page, search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      phone: form.phone,
      name: form.name || undefined,
      email: form.email || undefined,
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()) : [],
    };
    if (editingContact) {
      await updateContact(editingContact.id, data);
    } else {
      await createContact(data);
    }
    resetForm();
  };

  const resetForm = () => {
    setForm({ phone: '', name: '', email: '', tags: '' });
    setShowForm(false);
    setEditingContact(null);
  };

  const startEdit = (c: Contact) => {
    setEditingContact(c);
    setForm({
      phone: c.phone,
      name: c.name || '',
      email: c.email || '',
      tags: c.tags.join(', '),
    });
    setShowForm(true);
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} total contacts</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 text-sm font-medium shadow-sm transition-all duration-200 flex items-center gap-2"
        >
          <Plus size={16} />
          Add Contact
        </button>
      </div>

      {/* Search */}
      <div className="mb-5">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or phone..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-300 transition-all duration-200 text-sm"
          />
        </div>
      </div>

      {/* Slide-over panel for create/edit */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={resetForm} />
          <div className="relative w-full max-w-md bg-white shadow-2xl animate-slide-in-right flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">{editingContact ? 'Edit Contact' : 'New Contact'}</h3>
              <button onClick={resetForm} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+1234567890"
                    required
                    disabled={!!editingContact}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm disabled:bg-gray-50 disabled:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-300 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-300 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-300 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags</label>
                <div className="relative">
                  <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    placeholder="vip, customer (comma-separated)"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-300 transition-all"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm">
                  {editingContact ? 'Update Contact' : 'Create Contact'}
                </button>
                <button type="button" onClick={resetForm} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors text-gray-700">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contacts table */}
      <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/80">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tags</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Convos</th>
              <th className="px-5 py-3.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center">
                  <Loader2 size={24} className="animate-spin mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-400">Loading contacts...</p>
                </td>
              </tr>
            )}
            {!loading && contacts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center">
                  <Users size={32} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm font-medium text-gray-500">No contacts found</p>
                  <p className="text-xs text-gray-400 mt-1">Try a different search or add a new contact</p>
                </td>
              </tr>
            )}
            {contacts.map((c) => {
              const displayName = c.name || c.phone;
              return (
                <tr key={c.id} className="hover:bg-gray-50/60 transition-colors group">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarColor(displayName)} flex items-center justify-center text-white text-[11px] font-semibold shrink-0`}>
                        {getInitials(displayName)}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{c.name || '-'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600 font-mono">{c.phone}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{c.email || '-'}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-1.5">
                      {c.tags.map((t) => (
                        <span key={t} className="inline-block bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-medium">
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{c._count?.conversations || 0}</td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEdit(c)}
                        className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => deleteContact(c.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-5 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-all duration-200 ${
                p === page
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
