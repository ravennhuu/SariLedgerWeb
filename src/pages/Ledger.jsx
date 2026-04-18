import { useMemo, useState } from 'react';
import { ScrollText, ArrowUpRight, ArrowDownLeft, Trash2 } from 'lucide-react';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useSariData } from '../hooks/useSariData';

function peso(n) {
  return '₱' + Number(n).toLocaleString('en-PH', {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  });
}
function formatDate(date) {
  if (!date) return '—';
  return date.toLocaleDateString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}
function formatTime(date) {
  if (!date) return '';
  return date.toLocaleTimeString('en-PH', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

const STATUS_TABS = ['all', 'paid', 'unpaid'];

export default function Ledger() {
  const { transactions, customers, items, loading } = useSariData();
  const [tab, setTab] = useState('all');
  const [deletingId, setDeletingId] = useState(null);

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, 'transactions', id));
    } catch (e) {
      console.error('[Ledger] failed to delete transaction:', e);
    } finally {
      setDeletingId(null);
    }
  }

  const customerMap = useMemo(() =>
    Object.fromEntries(customers.map((c) => [c.id, c.name])),
    [customers]
  );
  const itemMap = useMemo(() =>
    Object.fromEntries(items.map((i) => [i.id, i.name])),
    [items]
  );

  const filtered = useMemo(() => {
    const sorted = [...transactions].sort(
      (a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0)
    );
    if (tab === 'paid') return sorted.filter((t) => t.isPaid);
    if (tab === 'unpaid') return sorted.filter((t) => !t.isPaid);
    return sorted;
  }, [transactions, tab]);

  const totalPaid = useMemo(() =>
    transactions
      .filter((t) => t.isPaid)
      .reduce((s, t) => s + t.manualPriceOverride * t.quantity, 0),
    [transactions]
  );
  const totalPending = useMemo(() =>
    transactions
      .filter((t) => !t.isPaid)
      .reduce((s, t) => s + t.manualPriceOverride * t.quantity, 0),
    [transactions]
  );

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-line bg-surface px-5 py-4">
          <p className="text-xs font-medium text-muted uppercase tracking-wide mb-2">
            Total Received
          </p>
          {loading
            ? <div className="h-7 w-28 rounded bg-line animate-pulse" />
            : <p className="text-2xl font-semibold text-emerald">{peso(totalPaid)}</p>
          }
          <p className="mt-1 text-[11px] text-muted">From paid transactions</p>
        </div>
        <div className="rounded-2xl border border-line bg-surface px-5 py-4">
          <p className="text-xs font-medium text-muted uppercase tracking-wide mb-2">
            Outstanding
          </p>
          {loading
            ? <div className="h-7 w-28 rounded bg-line animate-pulse" />
            : <p className="text-2xl font-semibold text-coral">{peso(totalPending)}</p>
          }
          <p className="mt-1 text-[11px] text-muted">Unpaid / on credit</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 rounded-[var(--radius-input)] bg-canvas p-1 w-fit border border-line">
        {STATUS_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              'rounded-[6px] px-4 py-1.5 text-xs font-semibold capitalize transition-all',
              tab === t
                ? 'bg-surface text-ink shadow-sm border border-line'
                : 'text-muted hover:text-body',
            ].join(' ')}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Transaction list */}
      <div className="rounded-2xl border border-line bg-surface overflow-hidden">
        {loading ? (
          <ul className="divide-y divide-line">
            {[...Array(6)].map((_, i) => (
              <li key={i} className="flex items-center gap-4 px-5 py-4">
                <div className="h-8 w-8 rounded-lg bg-line animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-44 rounded bg-line animate-pulse" />
                  <div className="h-2 w-24 rounded bg-line animate-pulse" />
                </div>
                <div className="h-4 w-16 rounded bg-line animate-pulse" />
              </li>
            ))}
          </ul>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted">
            <ScrollText className="mb-2 h-8 w-8 opacity-30" />
            <p className="text-sm">No entries found.</p>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {filtered.map((tx, i) => {
              const isPaid = tx.isPaid;
              const customerName = customerMap[tx.customerId] ?? null;
              const itemName = itemMap[tx.itemId] ?? null;
              const label = customerName
                ? `${customerName}${itemName ? ` — ${itemName}` : ''}`
                : itemName || 'Transaction';
              const total = tx.manualPriceOverride * tx.quantity;
              const displayDate = isPaid ? (tx.paidDate ?? tx.date) : tx.date;

              return (
                <li
                  key={tx.id}
                  className="animate-fade-in flex items-center gap-4 px-5 py-4 hover:bg-canvas transition-colors"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  {/* Icon */}
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{
                      background: isPaid
                        ? 'color-mix(in srgb, var(--color-emerald) 12%, transparent)'
                        : 'color-mix(in srgb, var(--color-coral) 12%, transparent)',
                    }}
                  >
                    {isPaid
                      ? <ArrowUpRight className="h-3.5 w-3.5 text-emerald" />
                      : <ArrowDownLeft className="h-3.5 w-3.5 text-coral" />
                    }
                  </div>

                  {/* Label + date */}
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{label}</p>
                    <p className="text-[11px] text-muted">
                      {formatDate(displayDate)}
                      {formatTime(displayDate) ? ` · ${formatTime(displayDate)}` : ''}
                      {tx.quantity > 1 ? ` · qty ${tx.quantity}` : ''}
                    </p>
                  </div>

                  {/* Status badge */}
                  <span
                    className={[
                      'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                      isPaid ? 'bg-emerald/10 text-emerald' : 'bg-coral/10 text-coral',
                    ].join(' ')}
                  >
                    {isPaid ? 'Paid' : 'Unpaid'}
                  </span>

                  {/* Amount */}
                  <p
                    className={[
                      'shrink-0 text-sm font-semibold font-mono',
                      isPaid ? 'text-ink' : 'text-coral',
                    ].join(' ')}
                  >
                    {peso(total)}
                  </p>

                  {/* Options (Delete) */}
                  <button
                    onClick={() => handleDelete(tx.id)}
                    disabled={deletingId === tx.id}
                    className="ml-2 flex flex-shrink-0 h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-coral/10 hover:text-coral transition-colors disabled:opacity-50"
                    title="Delete transaction"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
