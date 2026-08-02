export function Footer() {
  return (
    <footer className="mt-12 border-t border-white/10 bg-surface/50 p-12">
      <div className="flex flex-col items-start justify-between gap-12 md:flex-row md:items-end">
        <div className="space-y-6">
          <span className="font-display text-4xl font-black italic tracking-tighter text-brand">
            MJR IMPORTS
          </span>
          <div className="max-w-xs">
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
              Edge Delivery
            </p>
            <p className="text-[10px] uppercase leading-relaxed tracking-widest text-white/60">
              Real-time inventory sync.
              <br />
              Authorized global distribution hub.
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
            &copy; 2024 MJR. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
