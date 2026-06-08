interface Level { key: string; label: string; color: string }
interface Counts { [k: string]: number }

interface Props {
  levels: Record<string, Level>
  counts: Counts
  title: string
  viewTitle: string
  viewHint: string
  selectedLga: Record<string, string> | null
}

export default function StatsOverlay({ levels, counts, title, viewTitle, viewHint, selectedLga }: Props) {
  const total = counts.total || 0

  return (
    <div className="absolute bottom-1 md:bottom-3 left-1 md:left-3 right-1 md:right-auto z-[1000] flex flex-col gap-1 md:gap-2 pointer-events-none">

      {/* View title + hint */}
      <div className="bg-black/70 backdrop-blur-sm rounded-lg px-2 md:px-3 py-1.5 md:py-2">
        <p className="m-0 text-[11px] md:text-sm font-semibold text-white">{viewTitle}</p>
        <p className="m-0 text-[10px] md:text-[11px] text-white/60">{viewHint}</p>
      </div>

      {/* Legend + breakdown side by side */}
      <div className="flex gap-1 md:gap-2">
        {/* Legend */}
        <div className="bg-black/70 backdrop-blur-sm rounded-lg px-2 md:px-3 py-1.5 md:py-2">
          <p className="m-0 mb-1 text-[9px] md:text-[10px] uppercase tracking-wider text-white/50">Rating</p>
          <ul className="list-none m-0 p-0 space-y-0.5 md:space-y-1">
            {[3, 2, 1, 0].map(lvl => {
              const d = levels[lvl]
              if (!d) return null
              return (
                <li key={lvl} className="flex items-center gap-1 md:gap-1.5 text-[10px] md:text-[11px] text-white">
                  <span className="w-2 md:w-3 h-2 md:h-3 rounded-sm shrink-0 border border-white/20"
                    style={{ background: lvl === 0 ? 'transparent' : d.color }} />
                  {d.label}
                </li>
              )
            })}
          </ul>
        </div>

        {/* Breakdown */}
        <div className="bg-black/70 backdrop-blur-sm rounded-lg px-2 md:px-3 py-1.5 md:py-2 min-w-[120px] md:min-w-[160px]">
          <p className="m-0 mb-1 text-[9px] md:text-[10px] uppercase tracking-wider text-white/50">{title}</p>
          <ul className="list-none m-0 p-0 space-y-0.5 md:space-y-1">
            {[3, 2, 1, 0].map(lvl => {
              const d = levels[lvl]
              const c = counts[lvl] || 0
              const pct = total ? Math.round((c / total) * 100) : 0
              if (!d) return null
              return (
                <li key={lvl} className="flex items-center gap-1 md:gap-1.5 text-[10px] md:text-[11px] text-white">
                  <span className="w-2 md:w-3 h-2 md:h-3 rounded-sm shrink-0 border border-white/20"
                    style={{ background: lvl === 0 ? 'transparent' : d.color }} />
                  <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: lvl === 0 ? '#ffffff40' : d.color }} />
                  </div>
                  <span className="text-white/60 w-3 md:w-4 text-right text-[10px] md:text-[11px]">{c}</span>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      {/* Selected LGA */}
      {selectedLga && (
        <div className="bg-black/70 backdrop-blur-sm rounded-lg px-2 md:px-3 py-1.5 md:py-2">
          <p className="m-0 text-[11px] md:text-xs font-semibold" style={{ color: selectedLga.color }}>{selectedLga.lga}</p>
          <p className="m-0 text-[10px] md:text-[11px] text-white/60">
            {selectedLga.state} · <span style={{ color: selectedLga.color }}>{selectedLga.label}</span>
          </p>
        </div>
      )}
    </div>
  )
}
