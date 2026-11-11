'use client';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContainerProps {
  toasts: Toast[];
}

export default function ToastContainer({ toasts }: ToastContainerProps) {
  return (
    <div className="fixed top-3 z-50 flex flex-col gap-2 w-full max-w-sm px-3 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto p-3 rounded-2xl text-xs font-semibold shadow-2xl backdrop-blur-xl border flex items-center gap-2 ${
            t.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200' :
            t.type === 'error' ? 'bg-red-950/90 border-red-500/40 text-red-200' :
            'bg-blue-950/90 border-blue-500/40 text-blue-200'
          }`}
        >
          <span>{t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : 'ℹ️'}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
