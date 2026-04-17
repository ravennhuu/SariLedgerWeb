import { useState, useMemo } from 'react';
import { Users, Search, Contact, FileText, CheckCircle2, ChevronRight, X, Plus } from 'lucide-react';
import { doc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useSariData } from '../hooks/useSariData';

function peso(n) {
  return '₱' + Number(n).toLocaleString('en-PH', {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  });
}

function NotesModal({ customer, onClose }) {
  const notesString = customer.notes || 'No historical notes recorded.';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="animate-slide-up w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between border-b border-line pb-4">
          <div>
            <h3 className="text-base font-semibold text-ink">Customer History (Listahan)</h3>
            <p className="text-xs text-muted">{customer.name}</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-canvas hover:text-ink transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto rounded-[var(--radius-input)] bg-canvas p-4 text-sm text-body whitespace-pre-wrap border border-line">
          {notesString}
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-[var(--radius-input)] bg-emerald px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-dim transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function AddCustomerModal({ onClose }) {
  const [form, setForm] = useState({ name: '', contact: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function set(key, val) { setForm((prev) => ({ ...prev, [key]: val })); setError(''); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Customer name is required.'); return; }

    setSaving(true);
    try {
      await addDoc(collection(db, 'customers'), {
        name: form.name.trim(),
        contact: form.contact.trim() || '',
        totalDebt: 0,
        notes: '',
        createdAt: serverTimestamp(),
      });
      onClose();
    } catch (err) {
      console.error('[Customers] add customer failed:', err);
      setError('Failed to save. Check your connection.');
    } finally {
      setSaving(false);
    }
  }

  const inputCls = "h-10 w-full rounded-[var(--radius-input)] border border-line bg-canvas px-3 text-sm text-ink placeholder:text-muted outline-none focus:border-emerald focus:ring-2 focus:ring-emerald/20 transition-all";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="animate-slide-up w-full max-w-sm rounded-2xl border border-line bg-surface p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-semibold text-ink">Add New Customer</h3>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-canvas hover:text-ink transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-body">Customer Name</label>
            <input
              type="text" placeholder="e.g. Juan De La Cruz"
              value={form.name} onChange={(e) => set('name', e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-body">Contact Details (Optional)</label>
            <input
              type="text" placeholder="e.g. 09123456789"
              value={form.contact} onChange={(e) => set('contact', e.target.value)}
              className={inputCls}
            />
          </div>

          {error && <p className="rounded-lg bg-coral/8 px-3 py-2 text-xs font-medium text-coral">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button
              type="button" onClick={onClose}
              className="flex-1 rounded-[var(--radius-input)] border border-line py-2.5 text-sm font-medium text-body hover:bg-canvas transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={saving}
              className="flex-1 rounded-[var(--radius-input)] bg-emerald py-2.5 text-sm font-semibold text-white hover:bg-emerald-dim transition-colors disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Add Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Customers() {
  const { customers, loading } = useSariData();
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [settlingId, setSettlingId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return [...customers]
      .filter((c) => c.name.toLowerCase().includes(q) || (c.contact || '').toLowerCase().includes(q))
      .sort((a, b) => {
        const aDebt = Math.max(0, a.totalDebt || 0);
        const bDebt = Math.max(0, b.totalDebt || 0);
        if (bDebt !== aDebt) return bDebt - aDebt;
        return a.name.localeCompare(b.name);
      });
  }, [customers, search]);

  async function handleSettleDebt(id) {
    setSettlingId(id);
    try {
      await updateDoc(doc(db, 'customers', id), { totalDebt: 0 });
    } catch (e) {
      console.error('[Customers] failed to settle debt:', e);
    } finally {
      setSettlingId(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink">Customers</h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative max-w-xs w-full sm:w-64 shrink-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text" placeholder="Search names or contact…"
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-[var(--radius-input)] border border-line bg-surface
                         pl-9 pr-3 text-sm text-ink placeholder:text-muted outline-none
                         focus:border-emerald focus:ring-2 focus:ring-emerald/20 transition-all"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex h-9 shrink-0 items-center justify-center gap-2 rounded-[var(--radius-input)] bg-emerald px-4 text-sm font-semibold text-white hover:bg-emerald-dim transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Add Customer
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
        <div className="overflow-x-auto pb-2">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-canvas">
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted min-w-[200px]">Customer Detail</th>
                <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted min-w-[120px]">Current Debt</th>
                <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted min-w-[180px]">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <div className="h-4 w-32 rounded bg-line" />
                        <div className="h-3 w-24 rounded bg-line" />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right"><div className="ml-auto h-4 w-16 rounded bg-line" /></td>
                    <td className="px-6 py-4"><div className="ml-auto h-8 w-20 rounded bg-line" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-20 text-center">
                    <Users className="mx-auto mb-3 h-8 w-8 text-muted opacity-30" />
                    <p className="text-sm font-medium text-ink">No customers found</p>
                    <p className="text-xs mt-1 text-muted">Transactions from new customers on mobile will appear here.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((customer) => {
                  const hasDebt = (customer.totalDebt || 0) > 0;
                  const isSettling = settlingId === customer.id;

                  return (
                    <tr key={customer.id} className="hover:bg-canvas transition-colors">
                      {/* Customer Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald/10 text-emerald font-semibold uppercase tracking-wide">
                            {customer.name.slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-semibold text-ink">{customer.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-muted">
                              <Contact className="h-3 w-3" />
                              {customer.contact || 'No contact provided'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Outstanding Debt */}
                      <td className="px-6 py-4 text-right align-middle">
                        <p className={[
                          'text-base font-semibold font-mono tracking-tight',
                          hasDebt ? 'text-coral' : 'text-emerald'
                        ].join(' ')}>
                          {peso(customer.totalDebt || 0)}
                        </p>
                        <p className="text-[10px] uppercase tracking-wider text-muted mt-0.5">
                          {hasDebt ? 'Outstanding' : 'Cleared'}
                        </p>
                      </td>

                      {/* Quick Actions */}
                      <td className="px-6 py-4 text-right align-middle">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedCustomer(customer)}
                            className="group flex items-center gap-1.5 rounded-[var(--radius-input)] border border-line bg-surface px-3 py-1.5 text-xs font-medium text-body transition-all hover:bg-canvas hover:text-ink"
                          >
                            <FileText className="h-3.5 w-3.5 text-muted group-hover:text-ink transition-colors" />
                            Listahan
                          </button>
                          <button
                            onClick={() => handleSettleDebt(customer.id)}
                            disabled={!hasDebt || isSettling}
                            className={[
                              'flex shrink-0 items-center gap-1.5 rounded-[var(--radius-input)] px-3 py-1.5 text-xs font-semibold transition-all',
                              hasDebt && !isSettling
                                ? 'bg-emerald text-white hover:bg-emerald-dim shadow-sm'
                                : 'bg-canvas text-muted opacity-60 cursor-not-allowed border border-line'
                            ].join(' ')}
                          >
                            {isSettling ? (
                              <span className="flex items-center gap-1">Settling...</span>
                            ) : (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Settle
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer hint */}
      {!loading && filtered.length > 0 && (
        <p className="text-[11px] text-muted text-center pt-2">
          {filtered.length} customer records loaded &middot; Sorted by highest outstanding debt
        </p>
      )}

      {selectedCustomer && (
        <NotesModal customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />
      )}

      {showAddModal && (
        <AddCustomerModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}
