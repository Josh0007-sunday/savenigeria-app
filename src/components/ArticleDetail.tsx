const THREAT_LABELS: Record<number, { label: string; color: string; bg: string }> = {
    0: { label: 'Safe', color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/30' },
    1: { label: 'Low Risk', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30' },
    2: { label: 'High Risk', color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/30' },
    3: { label: 'Critical', color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/30' },
}

export interface LocalArticle {
    id: number
    title: string
    content: string
    imageUrl: string
    createdAt: string
    state?: string | null
    lga?: string | null
    threatLevel?: number | null
    citationUrl?: string | null
}

interface Props {
    article: LocalArticle
}

export default function ArticleDetail({ article }: Props) {
    const threat = article.threatLevel != null ? THREAT_LABELS[article.threatLevel] : null

    return (
        <div className="flex flex-col flex-1 h-full bg-[#0a0a0a] text-white overflow-y-auto">
            {article.imageUrl && (
                <div className="w-full h-[400px] shrink-0 relative">
                    <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />
                </div>
            )}
            <div className="max-w-4xl w-full mx-auto px-8 py-12 flex flex-col flex-1">

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                    <span className="text-sm font-semibold uppercase tracking-wider text-blue-500">
                        Reporter Article
                    </span>
                    <span className="text-white/20 text-sm">·</span>
                    <span className="text-sm text-white/50">
                        {new Date(article.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
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
                <div className="text-base md:text-lg text-white/75 leading-loose whitespace-pre-wrap mb-12">
                    {article.content}
                </div>

                {article.citationUrl && (
                    <div className="mb-12 text-sm text-white/40">
                        Source:{' '}
                        <a href={article.citationUrl} target="_blank" rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 underline underline-offset-2">
                            {article.citationUrl}
                        </a>
                    </div>
                )}
            </div>
        </div>
    )
}
