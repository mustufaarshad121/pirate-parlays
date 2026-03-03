const DemoBadge = ({ label = 'Demo Mode' }: { label?: string }) => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-warning/20 text-warning border border-warning/30">
    ⚠️ {label}
  </span>
);

export default DemoBadge;
