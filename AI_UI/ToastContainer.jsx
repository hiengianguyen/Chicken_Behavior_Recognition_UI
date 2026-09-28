import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, X } from 'lucide-react';

const severityStyles = {
  critical: {
    icon: AlertCircle,
    accent: 'text-rose-300',
    border: 'border-rose-500/30'
  },
  warning: {
    icon: AlertTriangle,
    accent: 'text-amber-300',
    border: 'border-amber-500/30'
  },
  info: {
    icon: CheckCircle2,
    accent: 'text-emerald-300',
    border: 'border-emerald-500/30'
  }
};

export default function ToastContainer({ toasts = [], onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div
      aria-live="polite"
      aria-relevant="additions"
      className="pointer-events-none fixed right-4 top-20 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3 sm:right-6"
    >
      {toasts.map((toast) => {
        const style = severityStyles[toast.severity] || severityStyles.info;
        const Icon = style.icon;

        return (
          <article
            key={toast.toastId}
            role={toast.severity === 'critical' ? 'alert' : 'status'}
            className={`toast-enter pointer-events-auto flex items-start gap-3 rounded-xl border ${style.border} bg-[#1e293b] p-4 text-slate-100 shadow-2xl`}
          >
            <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${style.accent}`} />
            <div className="min-w-0 flex-1 space-y-1">
              <p className={`text-[11px] font-bold uppercase ${style.accent}`}>{toast.label || 'Thông báo mới'}</p>
              <h2 className="text-sm font-semibold leading-snug text-white">{toast.title}</h2>
              {toast.description && <p className="text-xs leading-relaxed text-slate-400">{toast.description}</p>}
            </div>
            {onDismiss && (
              <button
                type="button"
                onClick={() => onDismiss(toast.toastId)}
                aria-label="Đóng thông báo"
                className="-mr-1 -mt-1 rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </article>
        );
      })}
    </div>
  );
}
