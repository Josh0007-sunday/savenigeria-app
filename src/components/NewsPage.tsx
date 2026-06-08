import { useEffect, useState } from 'react'

interface Article {
    title: string
    description: string
    url: string
    urlToImage: string | null
    publishedAt: string
    source: { name: string }
    citationUrl?: string | null
}

export default function NewsPage() {
    const [articles, setArticles] = useState<Article[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/news')
            .then(r => r.json())
            .then(data => { setArticles(data.articles || []) })
            .catch(() => setArticles([]))
            .finally(() => setLoading(false))
    }, [])

    return (
        <div className="flex flex-col flex-1 h-full bg-[#0a0a0a] text-white px-8 py-6 pb-20 overflow-y-auto">
            <div className="flex items-center justify-between mb-8 shrink-0">
                <div>
                    <h2 className="text-2xl font-bold">All News</h2>
                    <p className="text-white/50 text-sm mt-1">Latest reports and updates</p>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center flex-1">
                    <p className="text-white/50">Loading news...</p>
                </div>
            ) : articles.length === 0 ? (
                <div className="flex items-center justify-center flex-1">
                    <p className="text-white/50">No available news.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                    {articles.map((a, i) => (
                        <a key={i} href={a.url} target="_blank" rel="noopener noreferrer"
                            className="group flex flex-col bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:bg-white/[0.07] transition-colors">
                            {a.urlToImage ? (
                                <div className="w-full h-48 overflow-hidden bg-black/50">
                                    <img src={a.urlToImage} alt=""
                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                        onError={e => (e.currentTarget.parentElement!.style.display = 'none')} />
                                </div>
                            ) : (
                                <div className="w-full h-48 bg-white/5 flex items-center justify-center">
                                    <span className="text-white/20 text-xs uppercase tracking-wider">No Image</span>
                                </div>
                            )}
                            <div className="p-5 flex flex-col flex-1">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-red-400">
                                        {a.source?.name}
                                    </span>
                                    <span className="text-white/20 text-[10px]">·</span>
                                    <span className="text-[10px] text-white/40">
                                        {new Date(a.publishedAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <h4 className="text-lg font-semibold text-white leading-snug mb-2 group-hover:text-red-300 transition-colors">
                                    {a.title}
                                </h4>
                                <p className="text-sm text-white/50 leading-relaxed line-clamp-3">
                                    {a.description}
                                </p>
                                {a.citationUrl && (
                                    <a href={a.citationUrl} target="_blank" rel="noopener noreferrer"
                                        className="mt-2 inline-block text-xs text-blue-400/60 hover:text-blue-400 transition underline underline-offset-2">
                                        View source
                                    </a>
                                )}
                            </div>
                        </a>
                    ))}
                </div>
            )}
        </div>
    )
}
