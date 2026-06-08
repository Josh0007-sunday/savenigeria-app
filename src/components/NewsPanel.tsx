import { useEffect, useState } from 'react'
import { apiUrl } from '../lib/api'

interface Article {
  title: string
  description: string
  url: string
  urlToImage: string | null
  publishedAt: string
  source: { name: string }
  citationUrl?: string | null
}

interface Props {
  onArticleClick?: (article: Article) => void
  onSeeMore?: () => void
}

export default function NewsPanel({ onArticleClick, onSeeMore }: Props) {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(apiUrl('/api/news'))
      .then(r => r.json())
      .then(data => { setArticles(data.articles || []) })
      .catch(() => setArticles([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="flex flex-col h-full overflow-hidden bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-1 h-4 bg-red-500 rounded-full" />
          <h3 className="m-0 text-xs font-semibold uppercase tracking-widest text-white/70">Latest News</h3>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center h-24">
            <p className="text-white/30 text-sm">Fetching news…</p>
          </div>
        )}
        {!loading && articles.length === 0 && (
          <div className="flex items-center justify-center h-24">
            <p className="text-white/30 text-sm">No available news.</p>
          </div>
        )}
        {articles.map((a, i) => (
          <div key={i} onClick={() => onArticleClick ? onArticleClick(a) : window.open(a.url, '_blank')}
            className="group block cursor-pointer border-b border-white/5 hover:bg-white/5 transition-colors">
            {a.urlToImage && (
              <div className="w-full h-40 overflow-hidden bg-white/5">
                <img src={a.urlToImage} alt=""
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  onError={e => (e.currentTarget.parentElement!.style.display = 'none')} />
              </div>
            )}
            <div className="px-4 py-3">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-red-400">
                  {a.source?.name}
                </span>
                <span className="text-white/20 text-[10px]">·</span>
                <span className="text-[10px] text-white/30">
                  {new Date(a.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <h4 className="m-0 mb-1.5 text-sm font-semibold text-white leading-snug group-hover:text-red-300 transition-colors">
                {a.title}
              </h4>
              {a.description && (
                <p className="m-0 text-xs text-white/40 leading-relaxed line-clamp-2">{a.description}</p>
              )}
              {a.citationUrl && (
                <a href={a.citationUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                  className="mt-1.5 inline-block text-[10px] text-blue-400/60 hover:text-blue-400 transition underline underline-offset-2">
                  View source
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Fixed bottom button */}
      <div className="shrink-0 p-4 border-t border-white/10 z-10 w-full" style={{ background: 'linear-gradient(to top, rgba(0,0,0,1) 40%, rgba(0,0,0,0.8))' }}>
        <button onClick={onSeeMore} className="w-full bg-[#1b1b1b] hover:bg-white/10 text-white font-semibold text-sm py-2.5 rounded-lg border border-white/10 transition-colors">
          See All News
        </button>
      </div>
    </section>
  )
}
