/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { apiUrl } from './lib/api'
import Map from './components/Map'
import StatsBar from './components/StatsBar'
import NewsPanel from './components/NewsPanel'
import ArticlesPanel from './components/ArticlesPanel'
import ArticleDetail from './components/ArticleDetail'
import NewsPage from './components/NewsPage'
import NewsDetail from './components/NewsDetail'
import LgaImages from './components/LgaImages'
import AdminPortal from './components/AdminPortal'
import AdBanner from './components/AdBanner'

interface Level { key: string; label: string; color: string }
type Levels = Record<string, Level>
type Counts = Record<string, number>

type ViewMode = 'home' | 'news' | 'news_detail' | 'article_detail' | 'articles' | 'admin'

const NAV_ITEMS: { key: ViewMode; label: string }[] = [
  { key: 'home', label: 'Map' },
  { key: 'news', label: 'News' },
  { key: 'articles', label: 'Reports' },
  { key: 'admin', label: 'Admin' },
]

export default function App() {
  const [levels, setLevels] = useState<Levels>({})
  const [counts, setCounts] = useState<Counts>({ 0: 0, 1: 0, 2: 0, 3: 0, total: 0 })
  const [statsTitle, setStatsTitle] = useState('National breakdown (774 LGAs)')
  const [viewTitle, setViewTitle] = useState('Nigeria · All States')
  const [viewHint, setViewHint] = useState('Click a state to view its Local Government Areas.')
  const [activeState, setActiveState] = useState<string | null>(null)
  const [selectedLga, setSelectedLga] = useState<Record<string, string> | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('home')
  const [activeArticle, setActiveArticle] = useState<any | null>(null)
  const [activeLocalArticle, setActiveLocalArticle] = useState<any | null>(null)

  useEffect(() => {
    fetch(apiUrl('/api/levels')).then(r => r.json()).then(setLevels)
    fetch(apiUrl('/api/states')).then(r => r.json()).then(geo => {
      const c: Counts = { 0: 0, 1: 0, 2: 0, 3: 0, total: 0 }
      geo.features.forEach((f: any) => {
        const fc = f.properties.counts
          ;[0, 1, 2, 3].forEach((l: number) => { c[l] = (c[l] || 0) + (fc[l] || 0) })
        c.total += fc.total || 0
      })
      setCounts(c)
    })
  }, [])

  function handleStateClick(stateName: string) {
    setActiveState(stateName)
    setSelectedLga(null)
    fetch(apiUrl('/api/lgas/' + encodeURIComponent(stateName)))
      .then(r => r.json())
      .then(geo => {
        const c: Counts = { 0: 0, 1: 0, 2: 0, 3: 0, total: 0 }
        geo.features.forEach((f: any) => {
          const lvl = f.properties.level
          c[lvl] = (c[lvl] || 0) + 1
          c.total++
        })
        setCounts(c)
        setStatsTitle(`${stateName} breakdown`)
        setViewTitle(`${stateName} · LGAs`)
        setViewHint(`Click an LGA for its insecurity rating. ${c.total} LGAs.`)
      })
  }

  function handleBack() {
    setActiveState(null)
    setSelectedLga(null)
    setViewTitle('Nigeria · All States')
    setViewHint('Click a state to view its Local Government Areas.')
    setStatsTitle('National breakdown (774 LGAs)')
    fetch(apiUrl('/api/states')).then(r => r.json()).then(geo => {
      const c: Counts = { 0: 0, 1: 0, 2: 0, 3: 0, total: 0 }
      geo.features.forEach((f: any) => {
        const fc = f.properties.counts
          ;[0, 1, 2, 3].forEach((l: number) => { c[l] = (c[l] || 0) + (fc[l] || 0) })
        c.total += fc.total || 0
      })
      setCounts(c)
    })
  }

  return (
    <div className="flex flex-col h-full bg-black text-white font-sans overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-3 md:px-5 py-2 md:py-3 bg-black border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <div className="w-6 md:w-8 h-4 md:h-5 rounded-sm overflow-hidden shrink-0 flex">
            <div className="flex-1 bg-[#008751]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#008751]" />
          </div>
          <div className="min-w-0">
            <h1 className="m-0 text-sm md:text-xl font-semibold tracking-wide truncate">Safe Nigeria</h1>
            <p className="m-0 text-[10px] md:text-xs text-white/50 truncate hidden md:block">Insecurity ratings by State &amp; Local Government Area</p>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {viewMode !== 'home' && viewMode !== 'admin' && (
            <button onClick={() => setViewMode('home')}
              className="bg-white/10 text-white border border-white/20 rounded-lg px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm cursor-pointer hover:bg-white/20 transition">
              ← Back
            </button>
          )}
          {viewMode === 'home' && activeState && (
            <button onClick={handleBack}
              className="bg-white/10 text-white border border-white/20 rounded-lg px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm cursor-pointer hover:bg-white/20 transition hidden lg:inline-block">
              ← Back to all states
            </button>
          )}
          <button onClick={() => setViewMode(viewMode === 'admin' ? 'home' : 'admin')}
            className={`border rounded-lg px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm cursor-pointer transition
              ${viewMode === 'admin'
                ? 'bg-[#2f6df6] border-[#2f6df6] text-white'
                : 'bg-white/5 border-white/20 text-white/60 hover:text-white hover:bg-white/10'}`}>
            ✍ Admin
          </button>
        </div>
      </header >

      {/* Main layout */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {viewMode === 'admin' ? (
          <AdminPortal />
        ) : viewMode === 'news' ? (
          <NewsPage />
        ) : viewMode === 'news_detail' && activeArticle ? (
          <NewsDetail article={activeArticle} />
        ) : viewMode === 'article_detail' && activeLocalArticle ? (
          <ArticleDetail article={activeLocalArticle} />
        ) : viewMode === 'articles' ? (
          <div className="flex flex-col flex-1 overflow-hidden">
            <ArticlesPanel onArticleClick={a => { setActiveLocalArticle(a); setViewMode('article_detail'); }} />
          </div>
        ) : (
          <>
            {/* Left: articles + bottom ad — hidden on mobile */}
            <div className="hidden lg:flex flex-col w-[360px] shrink-0 overflow-hidden border-r border-white/10">
              <ArticlesPanel onArticleClick={a => { setActiveLocalArticle(a); setViewMode('article_detail'); }} />
              <div className="shrink-0 border-t border-white/10">
                <AdBanner heightClass="h-[90px]" />
              </div>
            </div>

            {/* Center: map with overlay */}
            <div className="relative flex-1 min-w-0 overflow-hidden">
              <Map
                onStateClick={handleStateClick}
                onLgaClick={setSelectedLga}
                activeState={activeState}
              />
              {selectedLga && <LgaImages lga={selectedLga} />}
              <StatsBar
                levels={levels}
                counts={counts}
                title={statsTitle}
                viewTitle={viewTitle}
                viewHint={viewHint}
                selectedLga={selectedLga}
              />
            </div>

            {/* Right: top ad + news — hidden on mobile */}
            <div className="hidden lg:flex flex-col w-[360px] shrink-0 overflow-hidden border-l border-white/10">
              <div className="shrink-0 border-b border-white/10">
                <AdBanner heightClass="h-[120px]" />
              </div>
              <NewsPanel
                onArticleClick={(a) => { setActiveArticle(a); setViewMode('news_detail') }}
                onSeeMore={() => setViewMode('news')}
              />
            </div>
          </>
        )}
      </div>

      {/* Bottom tab bar — mobile only */}
      <nav className="lg:hidden flex items-center justify-around bg-black border-t border-white/10 shrink-0 px-2 py-1 pb-[max(0.25rem,env(safe-area-inset-bottom,0.25rem))]">
        {NAV_ITEMS.map(item => (
          <button key={item.key} onClick={() => setViewMode(item.key)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold tracking-wide transition cursor-pointer
              ${viewMode === item.key || (item.key === 'home' && !['news', 'articles', 'admin', 'news_detail', 'article_detail'].includes(viewMode))
                ? 'text-white bg-white/10'
                : 'text-white/40 hover:text-white/70'}`}>
            {item.label}
          </button>
        ))}
      </nav>
    </div >
  )
}
