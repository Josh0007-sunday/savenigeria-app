import { useEffect, useState } from 'react'
import { apiUrl } from '../lib/api'

const THREAT = [
  { v: 0, label: 'Safe', color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)' },
  { v: 1, label: 'Low Risk', color: '#facc15', bg: 'rgba(250,204,21,0.1)', border: 'rgba(250,204,21,0.3)' },
  { v: 2, label: 'High Risk', color: '#f97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.3)' },
  { v: 3, label: 'Critical', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' },
]

interface Article {
  id: number
  title: string
  content: string
  description?: string
  imageUrl: string
  state?: string | null
  lga?: string | null
  threatLevel?: number | null
  threatLabel?: string | null
  threatColor?: string | null
  citationUrl?: string | null
  createdAt: string
}

interface Props {
  onArticleClick?: (article: Article) => void
}

export default function ArticlesPanel({ onArticleClick }: Props) {
  const [articles, setArticles] = useState<Article[]>([])
  const load = () =>
    fetch(apiUrl('/api/articles')).then(r => r.json()).then(setArticles).catch(() => { })

  useEffect(() => { load() }, [])

  async function del(id: number) {
    await fetch(`/api/articles/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <section className="flex flex-col flex-1 min-h-0 overflow-hidden bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-1 h-4 bg-blue-500 rounded-full" />
          <h3 className="m-0 text-xs font-semibold uppercase tracking-widest text-white/70">Incident Reports</h3>
        </div>
        <span className="text-[10px] text-white/30">by reporters</span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {articles.length === 0 && (
          <div className="flex items-center justify-center h-24">
            <p className="text-white/30 text-sm">No reports yet.</p>
          </div>
        )}
        {articles.map(a => {
          const threat = a.threatLevel != null ? THREAT[a.threatLevel] : null
          return (
            <div key={a.id} onClick={() => onArticleClick?.(a)}
              className="group block cursor-pointer border-b border-white/5 hover:bg-white/[0.03] transition-colors">
              {a.imageUrl && (
                <div className="w-full h-36 overflow-hidden bg-white/5">
                  <img src={a.imageUrl} alt=""
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    onError={e => (e.currentTarget.parentElement!.style.display = 'none')} />
                </div>
              )}
              <div className="px-4 py-3">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="text-[10px] text-white/40">
                    {new Date(a.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  {threat && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                      style={{ background: threat.bg, color: threat.color, border: `1px solid ${threat.border}` }}>
                      {threat.label}
                    </span>
                  )}
                  {(a.state || a.lga) && (
                    <span className="text-[10px] text-white/30">
                      📍 {[a.lga, a.state].filter(Boolean).join(', ')}
                    </span>
                  )}
                </div>
                <h4 className="m-0 mb-1 text-sm font-semibold text-white leading-snug group-hover:text-blue-300 transition-colors">
                  {a.title}
                </h4>
                {(a.description || a.content) && (
                  <p className="m-0 text-xs text-white/40 leading-relaxed line-clamp-2">
                    {a.description || a.content}
                  </p>
                )}
                {a.citationUrl && (
                  <a href={a.citationUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                    className="mt-1.5 inline-block text-[10px] text-blue-400/60 hover:text-blue-400 transition underline underline-offset-2">
                    View source
                  </a>
                )}
                <button onClick={(e) => { e.stopPropagation(); if (confirm('Delete this report?')) del(a.id) }}
                  className="mt-2 text-[10px] text-red-400/60 hover:text-red-400 transition cursor-pointer bg-transparent border-0 p-0">
                  Delete
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
