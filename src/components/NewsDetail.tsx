const THREAT_LABELS: Record<number, { label: string; color: string; bg: string }> = {
    0: { label: 'Safe', color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/30' },
    1: { label: 'Low Risk', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30' },
    2: { label: 'High Risk', color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/30' },
    3: { label: 'Critical', color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/30' },
}

export interface Article {
    title: string
    description?: string
    content?: string
    url: string
    urlToImage?: string | null
    publishedAt: string
    source?: { name: string }
    state?: string | null
    lga?: string | null
    threatLevel?: number | null
    isManual?: boolean
}

interface Props {
    article: Article
}

export default function NewsDetail({ article }: Props) {
    const threat = article.threatLevel != null ? THREAT_LABELS[article.threatLevel] : null

    return (
        <div className="flex flex-col flex-1 h-full bg-[#0a0a0a] text-white overflow-y-auto">
            {article.urlToImage && (
                <div className="w-full h-[400px] shrink-0 relative">
                    <img src={article.urlToImage} alt={article.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />
                </div>
            )}
            <div className="max-w-4xl w-full mx-auto px-8 py-12 flex flex-col flex-1">

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                    {article.source?.name && (
                        <span className="text-sm font-semibold uppercase tracking-wider text-red-500">
                            {article.source.name}
                        </span>
                    )}
                    {article.source?.name && <span className="text-white/20 text-sm">·</span>}
                    <span className="text-sm text-white/50">
                        {new Date(article.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>

                    {/* Threat Level Badge */}
                    {threat && (
                        <span className={`ml-auto text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${threat.bg} ${threat.color}`}>
                            ⚠ {threat.label}
                        </span>
                    )}
                </div>

                {/* Location tag */}
                {(article.state || article.lga) && (
                    <div className="flex items-center gap-2 mb-6">
                        <span className="text-[11px] uppercase tracking-wider text-white/40">📍 Location:</span>
                        <span className="text-sm text-white/70">
                            {[article.lga, article.state].filter(Boolean).join(', ')}
                        </span>
                    </div>
                )}

                <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-8">
                    {article.title}
                </h1>

                {article.description && (
                    <p className="text-lg md:text-xl text-white/60 leading-relaxed mb-8 italic border-l-4 border-red-500/50 pl-5">
                        {article.description}
                    </p>
                )}

                {article.content && (
                    <div className="text-base md:text-lg text-white/75 leading-loose whitespace-pre-wrap mb-12">
                        {article.content}
                    </div>
                )}

                {article.url && !article.url.startsWith('manual-') && (
                    <div className="mt-auto mb-10 pt-10 border-t border-white/10">
                        <a href={article.url} target="_blank" rel="noopener noreferrer"
                            className="inline-block bg-white text-black font-semibold px-6 py-3 rounded-lg hover:bg-white/90 transition-colors">
                            Read Full Article on Source →
                        </a>
                    </div>
                )}
            </div>
        </div>
    )
}
