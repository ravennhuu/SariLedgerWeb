import { useMemo } from 'react';
import { TrendingUp, Users, AlertTriangle, ArrowUpRight, ShoppingBag } from 'lucide-react';
import { useSariData } from '../hooks/useSariData';
function peso(n) {
  return '₱' + Number(n).toLocaleString('en-PH', {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  });
}
function isToday(date) {
  if (!date) return false;
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}
function formatTime(date) {
  if (!date) return '—';
  return date.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit', hour12: true });
}
function formatDate(date) {
  if (!date) return '—';
  return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
}

function StatCard({ icon: Icon, label, value, sub, accent, loading }) {
  return (
    <div className="animate-fade-in rounded-[var(--radius-card)] border border-line bg-surface px-6 py-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium tracking-wide text-muted uppercase">{label}</p>
        <span
          className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={{ background: `color-mix(in srgb, ${accent} 12%, transparent)` }}
        >
          <Icon className="h-3.5 w-3.5" style={{ color: accent }} strokeWidth={2} />
        </span>
      </div>
      {loading
        ? <div className="h-8 w-28 animate-pulse rounded-md bg-line" />
        : <p className="text-3xl font-semibold tracking-tight text-ink">{value}</p>
      }
      <p className="text-[11px] text-muted">{sub}</p>
    </div>
  );
}

function ActivityRow({ tx, customerName, itemName, index }) {
  const label = customerName
    ? `${customerName}${itemName ? ` — ${itemName}` : ''}`
    : itemName || 'Transaction';
  const total = tx.manualPriceOverride * tx.quantity;
  const displayDate = tx.date;

  return (
    <li
      className="animate-fade-in flex items-center gap-4 px-5 py-3.5 border-t border-line"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ background: tx.isPaid ? 'var(--color-emerald)' : 'var(--color-coral)' }}
      />
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-ink">{label}</p>
        <p className="text-[11px] text-muted">
          {tx.isPaid ? 'Paid' : 'Unpaid'} · qty {tx.quantity}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p
          className="text-sm font-semibold"
          style={{ color: tx.isPaid ? 'var(--color-ink)' : 'var(--color-coral)' }}
        >
          {peso(total)}
        </p>
        <p className="text-[11px] text-muted">
          {isToday(displayDate) ? formatTime(displayDate) : formatDate(displayDate)}
        </p>
      </div>
    </li>
  );
}

export default function Dashboard() {
  const { items, customers, transactions, loading } = useSariData();

  const customerMap = useMemo(() =>
    Object.fromEntries(customers.map((c) => [c.id, c.name])),
    [customers]
  );
  const itemMap = useMemo(() =>
    Object.fromEntries(items.map((i) => [i.id, i.name])),
    [items]
  );

  const totalSales = useMemo(() =>
    transactions
      .filter((t) => t.isPaid)
      .reduce((sum, t) => sum + t.manualPriceOverride * t.quantity, 0),
    [transactions]
  );

  const totalDebt = useMemo(() =>
    customers.reduce((sum, c) => sum + (c.totalDebt ?? 0), 0),
    [customers]
  );

  const stockAlerts = useMemo(() =>
    items.filter((i) => i.stockCount < 5).length,
    [items]
  );

  const todaySales = useMemo(() =>
    transactions
      .filter((t) => t.isPaid && isToday(t.date))
      .reduce((sum, t) => sum + t.manualPriceOverride * t.quantity, 0),
    [transactions]
  );

  const recentActivity = useMemo(() =>
    [...transactions]
      .sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0))
      .slice(0, 10),
    [transactions]
  );

  const stats = [
    {
      icon: TrendingUp,
      label: 'Total Sales',
      value: loading ? '—' : peso(totalSales),
      sub: `Today: ${peso(todaySales)} · All paid transactions`,
      accent: 'var(--color-emerald)',
    },
    {
      icon: Users,
      label: 'Total Receivables',
      value: loading ? '—' : peso(totalDebt),
      sub: 'Sum of customer totalDebt balances',
      accent: 'var(--color-coral)',
    },
    {
      icon: AlertTriangle,
      label: 'Low Stock Items',
      value: loading ? '—' : stockAlerts,
      sub: 'Items with stockCount < 5',
      accent: 'var(--color-amber)',
    },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      {/* Stat cards */}
      <section className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => <StatCard key={s.label} {...s} loading={loading} />)}
      </section>

      {/* Recent activity */}
      <section className="animate-fade-in rounded-[var(--radius-card)] border border-line bg-surface overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <h2 className="text-sm font-semibold text-ink">Recent Transactions</h2>
          <span className="flex items-center gap-1 text-[11px] text-emerald font-medium">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald" />
            Live
          </span>
        </div>

        {loading ? (
          <ul className="divide-y divide-line">
            {[...Array(5)].map((_, i) => (
              <li key={i} className="flex items-center gap-4 px-5 py-4">
                <div className="h-2 w-2 rounded-full bg-line animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-48 rounded bg-line animate-pulse" />
                  <div className="h-2 w-20 rounded bg-line animate-pulse" />
                </div>
                <div className="space-y-2 text-right">
                  <div className="h-3 w-16 rounded bg-line animate-pulse" />
                  <div className="h-2 w-12 rounded bg-line animate-pulse" />
                </div>
              </li>
            ))}
          </ul>
        ) : recentActivity.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted">
            <ShoppingBag className="mb-2 h-8 w-8 opacity-30" />
            <p className="text-sm">No transactions yet.</p>
            <p className="text-xs mt-1">Record a sale on the mobile app to see it here.</p>
          </div>
        ) : (
          <ul>
            {recentActivity.map((tx, i) => (
              <ActivityRow
                key={tx.id}
                tx={tx}
                customerName={customerMap[tx.customerId]}
                itemName={itemMap[tx.itemId]}
                index={i}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
