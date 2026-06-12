export default function StatInsightCard({ icon, label, value, hint }) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="flex gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-lg text-neutral-700">
            {icon}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-[#8e8e93]">{label}</p>
            <p className="mt-0.5 text-base font-bold text-[#1a1a1a]">{value}</p>
            <p className="mt-1 text-[11px] leading-snug text-[#a0a0a8]">{hint}</p>
          </div>
        </div>
      </div>
    )
  }