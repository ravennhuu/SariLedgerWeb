import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../sari-ledger-web/src/hooks/useTheme';

export default function Settings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-ink">Settings</h1>
        <p className="mt-0.5 text-xs text-muted">Manage your application preferences</p>
      </div>

      <div className="rounded-2xl border border-line bg-surface overflow-hidden shadow-sm">
        <div className="p-6">
          <h2 className="text-sm font-semibold text-ink mb-1">Appearance</h2>
          <p className="text-xs text-muted mb-6">Customize how SariLedger looks on your device.</p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setTheme('light')}
              className={[
                'flex flex-1 flex-col items-center justify-center gap-3 rounded-[var(--radius-card)] border p-4 transition-all',
                theme === 'light'
                  ? 'border-emerald bg-emerald/5 ring-1 ring-emerald/20'
                  : 'border-line bg-canvas text-muted hover:border-emerald/50'
              ].join(' ')}
            >
              <Sun className={['h-6 w-6', theme === 'light' ? 'text-emerald' : 'text-body'].join(' ')} />
              <span className={['text-sm font-medium', theme === 'light' ? 'text-emerald' : 'text-body'].join(' ')}>Light</span>
            </button>

            <button
              onClick={() => setTheme('dark')}
              className={[
                'flex flex-1 flex-col items-center justify-center gap-3 rounded-[var(--radius-card)] border p-4 transition-all',
                theme === 'dark'
                  ? 'border-emerald bg-emerald/5 ring-1 ring-emerald/20'
                  : 'border-line bg-canvas text-muted hover:border-emerald/50'
              ].join(' ')}
            >
              <Moon className={['h-6 w-6', theme === 'dark' ? 'text-emerald' : 'text-body'].join(' ')} />
              <span className={['text-sm font-medium', theme === 'dark' ? 'text-emerald' : 'text-body'].join(' ')}>Dark</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
