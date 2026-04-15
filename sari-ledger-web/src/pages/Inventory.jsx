import { useState, useMemo } from 'react';
import {
  Plus, Search, X, Check, Package,
  AlertTriangle, ChevronUp, ChevronDown, ListFilter
} from 'lucide-react';
import {
  collection, doc, updateDoc, addDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useSariData } from '../hooks/useSariData';

function peso(n) {
  return '₱' + Number(n).toLocaleString('en-PH', {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  });
}

function StockCell({ item }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(item.stockCount));
  const [saving, setSaving] = useState(false);
  const isLow = item.stockCount < 5;

  function startEdit() { setDraft(String(item.stockCount)); setEditing(true); }

  async function save() {
    const newStock = parseInt(draft, 10);
    if (isNaN(newStock) || newStock < 0) { cancel(); return; }
    if (newStock === item.stockCount) { setEditing(false); return; }
    setSaving(true);
    try {
      await updateDoc(doc(db, 'items', item.id), { stockCount: newStock });
    } catch (e) {
      console.error('[Inventory] stockCount update failed:', e);
    } finally {
      setSaving(false);
      setEditing(false);
    }
  }

  function cancel() { setDraft(String(item.stockCount)); setEditing(false); }
  function handleKey(e) { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel(); }
  function nudge(delta) {
    setDraft((prev) => String(Math.max(0, (parseInt(prev, 10) || 0) + delta)));
  }

  if (editing) return (
    <div className="flex items-center justify-end gap-1">
      <button
        onClick={() => nudge(-1)}
        className="flex h-6 w-6 items-center justify-center rounded-md bg-line text-body hover:bg-muted/20 transition-colors"
      >
        <ChevronDown className="h-3 w-3" />
      </button>
      <input
        type="number" min="0" autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKey}
        className="w-16 rounded-[var(--radius-input)] border border-emerald bg-surface px-2 py-1
                   text-center text-sm font-semibold text-ink outline-none ring-2 ring-emerald/20
                   [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none
                   [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button
        onClick={() => nudge(1)}
        className="flex h-6 w-6 items-center justify-center rounded-md bg-line text-body hover:bg-muted/20 transition-colors"
      >
        <ChevronUp className="h-3 w-3" />
      </button>
      <button
        onClick={save} disabled={saving}
        className="ml-1 flex h-6 w-6 items-center justify-center rounded-md bg-emerald text-white
                   hover:bg-emerald-dim transition-colors disabled:opacity-50"
      >
        <Check className="h-3 w-3" />
      </button>
      <button
        onClick={cancel}
        className="flex h-6 w-6 items-center justify-center rounded-md bg-line text-body hover:bg-muted/20 transition-colors"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );

  return (
    <button
      onClick={startEdit}
      title="Click to edit stock"
      className={[
        'rounded-[6px] px-2.5 py-1 text-sm font-semibold transition-all cursor-pointer',
        'hover:ring-2 hover:ring-emerald/30 hover:bg-emerald/5',
        isLow ? 'text-coral bg-coral/8' : 'text-ink bg-transparent',
      ].join(' ')}
    >
      {item.stockCount}
    </button>
  );
}

const EMPTY_FORM = {
  name: '', buyingPrice: '', sellingPrice: '', stockCount: '',
};

function AddItemModal({ onClose }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function set(key, val) { setForm((prev) => ({ ...prev, [key]: val })); setError(''); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Item name is required.'); return; }
    const buyingPrice = parseFloat(form.buyingPrice);
    const sellingPrice = parseFloat(form.sellingPrice);
    const stockCount = parseInt(form.stockCount, 10);
    if (isNaN(buyingPrice) || buyingPrice < 0) { setError('Enter a valid buying price.'); return; }
    if (isNaN(sellingPrice) || sellingPrice < 0) { setError('Enter a valid selling price.'); return; }
    if (isNaN(stockCount) || stockCount < 0) { setError('Enter a valid stock quantity.'); return; }

    setSaving(true);
    try {
      await addDoc(collection(db, 'items'), {
        name: form.name.trim(),
        buyingPrice,
        sellingPrice,
        stockCount,
        createdAt: serverTimestamp(),
      });
      onClose();
    } catch (err) {
      console.error('[Inventory] add item failed:', err);
      setError('Failed to save. Check your connection.');
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    'h-10 w-full rounded-[var(--radius-input)] border border-line bg-canvas px-3 text-sm ' +
    'text-ink placeholder:text-muted outline-none focus:border-emerald focus:ring-2 ' +
    'focus:ring-emerald/20 transition-all [appearance:textfield] ' +
    '[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="animate-slide-up w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-semibold text-ink">Add New Item</h3>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-canvas hover:text-ink transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Item name */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-body">Item Name</label>
            <input
              type="text" placeholder="e.g. Sardines (can)"
              value={form.name} onChange={(e) => set('name', e.target.value)}
              className={inputCls}
            />
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-body">Buying Price (₱)</label>
              <input
                type="number" min="0" step="0.01" placeholder="0.00"
                value={form.buyingPrice} onChange={(e) => set('buyingPrice', e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-body">Selling Price (₱)</label>
              <input
                type="number" min="0" step="0.01" placeholder="0.00"
                value={form.sellingPrice} onChange={(e) => set('sellingPrice', e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          {/* Stock count */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-body">Stock Count</label>
            <input
              type="number" min="0" placeholder="0"
              value={form.stockCount} onChange={(e) => set('stockCount', e.target.value)}
              className={inputCls}
            />
            <p className="mt-1 text-[11px] text-muted">Rows with stockCount &lt; 5 will be highlighted</p>
          </div>

          {error && (
            <p className="rounded-lg bg-coral/8 px-3 py-2 text-xs font-medium text-coral">{error}</p>
          )}
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
              {saving ? 'Saving…' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Inventory() {
  const { items, loading } = useSariData();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [showModal, setShowModal] = useState(false);

  const filtered = useMemo(() => {
    let result = [...items];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((item) => item.name.toLowerCase().includes(q));
    }
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc': return a.name.localeCompare(b.name);
        case 'name-desc': return b.name.localeCompare(a.name);
        case 'price-asc': return (a.sellingPrice || 0) - (b.sellingPrice || 0);
        case 'price-desc': return (b.sellingPrice || 0) - (a.sellingPrice || 0);
        case 'stock-asc': return (a.stockCount || 0) - (b.stockCount || 0);
        case 'stock-desc': return (b.stockCount || 0) - (a.stockCount || 0);
        default: return 0;
      }
    });

    return result;
  }, [items, search, sortBy]);

  const lowCount = items.filter((i) => i.stockCount < 5).length;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink">Inventory</h1>
          {!loading && lowCount > 0 && (
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-coral font-medium">
              <AlertTriangle className="h-3 w-3" />
              {lowCount} item{lowCount !== 1 ? 's' : ''} low on stock (stockCount &lt; 5)
            </p>
          )}
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-[var(--radius-input)] bg-emerald px-4 py-2.5
                     text-sm font-semibold text-white hover:bg-emerald-dim transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          Add Item
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative max-w-xs w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text" placeholder="Search items…"
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-[var(--radius-input)] border border-line bg-surface
                       pl-9 pr-3 text-sm text-ink placeholder:text-muted outline-none
                       focus:border-emerald focus:ring-2 focus:ring-emerald/20 transition-all"
          />
        </div>

        <div className="relative w-full sm:w-48 shrink-0">
          <ListFilter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-9 w-full appearance-none rounded-[var(--radius-input)] border border-line bg-surface
                       pl-9 pr-8 text-sm text-ink outline-none focus:border-emerald focus:ring-2
                       focus:ring-emerald/20 transition-all cursor-pointer"
          >
            <option value="name-asc">Alphabetically A-Z</option>
            <option value="name-desc">Alphabetically Z-A</option>
            <option value="price-asc">Lowest Price first</option>
            <option value="price-desc">Highest Price first</option>
            <option value="stock-asc">Lowest Stock first</option>
            <option value="stock-desc">Highest Stock first</option>
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            <ChevronDown className="h-4 w-4 text-muted" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        <div className="overflow-x-auto pb-2">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-canvas">
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted min-w-[180px]">
                  Item
                </th>
                <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted min-w-[110px]">
                  Buying Price
                </th>
                <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted min-w-[110px]">
                  Selling Price
                </th>
                <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted min-w-[90px]">
                  Stock
                </th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-t border-line">
                    <td className="px-5 py-4"><div className="h-3 w-40 rounded bg-line animate-pulse" /></td>
                    <td className="px-5 py-4 text-right"><div className="ml-auto h-3 w-16 rounded bg-line animate-pulse" /></td>
                    <td className="px-5 py-4 text-right"><div className="ml-auto h-3 w-16 rounded bg-line animate-pulse" /></td>
                    <td className="px-5 py-4 text-right"><div className="ml-auto h-3 w-10 rounded bg-line animate-pulse" /></td>
                  </tr>
                ))
                : filtered.length === 0
                  ? (
                    <tr>
                      <td colSpan={4} className="py-16 text-center">
                        <Package className="mx-auto mb-2 h-8 w-8 text-muted opacity-40" />
                        <p className="text-sm text-muted">
                          {search ? 'No items match your search.' : 'No inventory items yet.'}
                        </p>
                      </td>
                    </tr>
                  )
                  : filtered.map((item) => {
                    const isLow = item.stockCount < 5;
                    return (
                      <tr
                        key={item.id}
                        className={[
                          'border-t border-line transition-colors',
                          isLow ? 'bg-coral/[0.04] hover:bg-coral/[0.08]' : 'hover:bg-canvas',
                        ].join(' ')}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            {isLow && (
                              <span className="inline-block h-1.5 w-1.5 rounded-full bg-coral" />
                            )}
                            <span className="font-medium text-ink">{item.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono text-muted">
                          {peso(item.buyingPrice)}
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono text-body">
                          {peso(item.sellingPrice)}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <StockCell item={item} />
                        </td>
                      </tr>
                    );
                  })
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer hint */}
      {!loading && filtered.length > 0 && (
        <p className="text-[11px] text-muted">
          {filtered.length} item{filtered.length !== 1 ? 's' : ''}
          {search ? ` matching "${search}"` : ' in inventory'}
          {' '}&middot; Click any stock number to edit inline
        </p>
      )}

      {showModal && <AddItemModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
