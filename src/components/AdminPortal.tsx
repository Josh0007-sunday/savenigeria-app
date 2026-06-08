import { useState, useEffect } from 'react'

type Tab = 'login' | 'register' | 'articles' | 'news' | 'ads'
type PostTab = 'articles' | 'news' | 'ads'
interface AdminUser { name: string; verified: boolean; token: string }

const THREAT = [
    { v: 0, label: 'Safe', color: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.3)' },
    { v: 1, label: 'Low Risk', color: '#facc15', bg: 'rgba(250,204,21,0.08)', border: 'rgba(250,204,21,0.3)' },
    { v: 2, label: 'High Risk', color: '#f97316', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.3)' },
    { v: 3, label: 'Critical', color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.35)' },
]

export default function AdminPortal() {
    const [tab, setTab] = useState<Tab>('login')
    const [postTab, setPostTab] = useState<PostTab>('articles')
    const [admin, setAdmin] = useState<AdminUser | null>(null)
    const [status, setStatus] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')

    const [locations, setLocations] = useState<{ states: string[]; lgasByState: Record<string, string[]> }>({ states: [], lgasByState: {} })

    const [A, setAFields] = useState({ title: '', desc: '', content: '', image: '', state: '', lga: '', threat: 2, citation: '' })
    const setAF = (k: keyof typeof A, v: string | number) => setAFields(p => ({ ...p, [k]: v }))

    const [N, setNFields] = useState({ title: '', desc: '', content: '', image: '', state: '', lga: '', threat: 2, citation: '' })
    const setNF = (k: keyof typeof N, v: string | number) => setNFields(p => ({ ...p, [k]: v }))

    const [adFields, setAdFields] = useState({ imageUrl: '', targetUrl: '' })
    const setAdF = (k: keyof typeof adFields, v: string) => setAdFields(p => ({ ...p, [k]: v }))

    useEffect(() => {
        fetch('/api/locations').then(r => r.json()).then(setLocations).catch(() => {})
    }, [])

    useEffect(() => {
        try {
            const s = localStorage.getItem('sn_admin');
            if (s) { setAdmin(JSON.parse(s)); setTab('articles') }
        } catch { }
    }, [])

    const reset = () => { setError(''); setStatus('') }

    const post = async (url: string, body: object, token?: string) => {
        const r = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            body: JSON.stringify(body),
        })
        return { ok: r.ok, data: await r.json() }
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault(); reset(); setLoading(true)
        try {
            const { ok, data } = await post('/api/admin/login', { email, password })
            if (!ok) return setError(data.error)
            const u: AdminUser = { name: data.name, verified: data.verified, token: data.token }
            setAdmin(u); localStorage.setItem('sn_admin', JSON.stringify(u))
            setTab('articles'); setStatus(`Welcome back, ${data.name}.`)
        } catch { setError('Connection failed') } finally { setLoading(false) }
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault(); reset(); setLoading(true)
        try {
            const { ok, data } = await post('/api/admin/register', { email, password, name })
            if (!ok) return setError(data.error)
            setStatus('Account created. Await verification from a super-admin.')
            setTab('login'); setEmail(''); setPassword(''); setName('')
        } catch { setError('Connection failed') } finally { setLoading(false) }
    }

    const handleArticlePublish = async (e: React.FormEvent) => {
        e.preventDefault(); reset(); setLoading(true)
        try {
            const { ok, data } = await post('/api/articles', {
                title: A.title, description: A.desc, content: A.content,
                imageUrl: A.image || undefined, state: A.state || null, lga: A.lga || null, threatLevel: A.threat,
                citationUrl: A.citation || null,
            })
            if (!ok) return setError(data.error)
            setStatus('Article published to the dashboard.')
            setAFields({ title: '', desc: '', content: '', image: '', state: '', lga: '', threat: 2, citation: '' })
        } catch { setError('Connection failed') } finally { setLoading(false) }
    }

    const handleNewsPublish = async (e: React.FormEvent) => {
        e.preventDefault(); reset(); setLoading(true)
        try {
            const { ok, data } = await post('/api/admin/post-news', {
                title: N.title, description: N.desc, content: N.content,
                urlToImage: N.image || undefined, state: N.state || null, lga: N.lga || null, threatLevel: N.threat,
                citationUrl: N.citation || null,
            }, admin!.token)
            if (!ok) return setError(data.error)
            setStatus('News report published to the feed.')
            setNFields({ title: '', desc: '', content: '', image: '', state: '', lga: '', threat: 2, citation: '' })
        } catch { setError('Connection failed') } finally { setLoading(false) }
    }

    const handleAdPublish = async (e: React.FormEvent) => {
        e.preventDefault(); reset(); setLoading(true)
        try {
            const { ok, data } = await post('/api/ads', { imageUrl: adFields.imageUrl, targetUrl: adFields.targetUrl })
            if (!ok) return setError(data.error)
            setStatus('Advertisement published.')
            setAdFields({ imageUrl: '', targetUrl: '' })
        } catch { setError('Connection failed') } finally { setLoading(false) }
    }

    const logout = () => { setAdmin(null); localStorage.removeItem('sn_admin'); setTab('login'); setStatus('') }

    const isAuthPage = !admin
    const inp = "w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/25 bg-transparent border border-white/15 focus:outline-none focus:border-white/40 focus:bg-white/[0.03] transition-all"

    if (isAuthPage) {
        return (
            <div className="flex flex-1 h-full items-center justify-center bg-black p-4">
                <div className="w-full max-w-[400px] border border-white/20 rounded-2xl p-8 bg-black">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-9 h-9 rounded-lg border border-white/30 flex items-center justify-center text-lg">🛡</div>
                        <span className="text-xs uppercase tracking-[0.2em] text-white/40 font-semibold">SafeNigeria</span>
                    </div>

                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.18em] text-white/30 font-medium mb-0.5">
                                {tab === 'login' ? 'Sign In' : 'Create Account'}
                            </p>
                            <h3 className="text-xl font-bold text-white">Reporter Portal</h3>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 bg-white/5 border border-white/20 rounded-2xl p-1 mb-7 gap-1">
                        {(['login', 'register'] as const).map(t => (
                            <button key={t} onClick={() => { setTab(t); reset() }}
                                className={`py-2.5 rounded-xl text-sm font-semibold tracking-wide transition cursor-pointer capitalize
                                ${tab === t ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white/80'}`}>
                                {t === 'login' ? 'Sign In' : 'Register'}
                            </button>
                        ))}
                    </div>

                    {status && (
                        <div className="mb-5 flex gap-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
                            <span className="shrink-0 mt-px">✓</span>{status}
                        </div>
                    )}
                    {error && (
                        <div className="mb-5 flex gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                            <span className="shrink-0 mt-px">✕</span>{error}
                        </div>
                    )}

                    {tab === 'login' && (
                        <form onSubmit={handleLogin} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] uppercase tracking-widest text-white/40 font-semibold px-1">Email</label>
                                <input className={inp} type="email" required autoComplete="email" placeholder="admin@safenigeria.ng" value={email} onChange={e => setEmail(e.target.value)} />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] uppercase tracking-widest text-white/40 font-semibold px-1">Password</label>
                                <input className={inp} type="password" required autoComplete="current-password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
                            </div>
                            <button type="submit" disabled={loading}
                                className="mt-3 w-full bg-white hover:bg-white/90 active:scale-[0.99] text-black font-bold rounded-xl py-3.5 text-sm tracking-wide transition cursor-pointer disabled:opacity-40">
                                {loading ? 'Signing in…' : 'Sign In'}
                            </button>
                        </form>
                    )}

                    {tab === 'register' && (
                        <form onSubmit={handleRegister} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] uppercase tracking-widest text-white/40 font-semibold px-1">Full Name</label>
                                <input className={inp} type="text" required placeholder="Your reporter name" value={name} onChange={e => setName(e.target.value)} />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] uppercase tracking-widest text-white/40 font-semibold px-1">Email</label>
                                <input className={inp} type="email" required autoComplete="email" placeholder="reporter@organization.ng" value={email} onChange={e => setEmail(e.target.value)} />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] uppercase tracking-widest text-white/40 font-semibold px-1">Password</label>
                                <input className={inp} type="password" required minLength={6} autoComplete="new-password" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} />
                            </div>
                            <button type="submit" disabled={loading}
                                className="mt-3 w-full bg-white hover:bg-white/90 active:scale-[0.99] text-black font-bold rounded-xl py-3.5 text-sm tracking-wide transition cursor-pointer disabled:opacity-40">
                                {loading ? 'Registering…' : 'Request Access'}
                            </button>
                            <p className="text-center text-[11px] text-white/30 mt-1">A super-admin must verify you before you can publish.</p>
                        </form>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col flex-1 h-full bg-[#0a0a0a] overflow-hidden">

            {/* ── Top bar ── */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md border border-white/20 flex items-center justify-center text-xs">🛡</div>
                        <span className="text-xs font-semibold text-white/50 uppercase tracking-widest">SafeNigeria</span>
                    </div>
                    <span className="w-px h-5 bg-white/10" />
                    <div>
                        <p className="text-[11px] text-white/30 font-medium leading-tight">
                            {admin.verified ? 'Verified Writer' : 'Pending Verification'}
                        </p>
                        <p className="text-sm font-semibold text-white leading-tight">{admin.name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {status && (
                        <span className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">✓ {status}</span>
                    )}
                    {error && (
                        <span className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-md">✕ {error}</span>
                    )}
                    <button onClick={logout}
                        className="text-xs text-white/30 hover:text-white/70 border border-white/15 hover:border-white/30 px-3 py-1.5 rounded-lg transition cursor-pointer">
                        Sign out
                    </button>
                </div>
            </div>

            {/* ── Tab bar ── */}
            {admin.verified && (
                <div className="flex gap-1 px-6 py-2 border-b border-white/10 shrink-0 bg-white/[0.02]">
                    {(['articles', 'news', 'ads'] as const).map(t => (
                        <button key={t} onClick={() => { setPostTab(t); reset() }}
                            className={`px-4 py-1.5 rounded-md text-xs font-semibold tracking-wide transition cursor-pointer
                            ${postTab === t ? 'bg-white text-black' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`}>
                            {t === 'articles' ? '✍ Articles' : t === 'news' ? '📰 News Feed' : '📢 Ads'}
                        </button>
                    ))}
                </div>
            )}

            {/* ── Scrollable form area ── */}
            <div className="flex-1 overflow-y-auto min-h-0">
                <div className="max-w-2xl mx-auto p-6">

                    {/* ── ARTICLE FORM ── */}
                    {admin.verified && postTab === 'articles' && (
                        <form onSubmit={handleArticlePublish} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 space-y-1">
                                    <label className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">Headline *</label>
                                    <input className={inp} required placeholder="Gunmen abduct 5 farmers in Zamfara…" value={A.title} onChange={e => setAF('title', e.target.value)} />
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <label className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">Short Summary</label>
                                    <input className={inp} placeholder="One-line overview" value={A.desc} onChange={e => setAF('desc', e.target.value)} />
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <label className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">Full Report *</label>
                                    <textarea className={`${inp} resize-none`} required rows={4}
                                        placeholder="Detailed account of the incident, casualties, response…"
                                        value={A.content} onChange={e => setAF('content', e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">State</label>
                                    <select className={inp} value={A.state} onChange={e => { setAF('state', e.target.value); setAF('lga', '') }}>
                                        <option value="" className="bg-[#0a0a0a] text-white/40">Select state</option>
                                        {locations.states.map(s => (
                                            <option key={s} value={s} className="bg-[#0a0a0a] text-white">{s}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">LGA</label>
                                    <select className={inp} value={A.lga} onChange={e => setAF('lga', e.target.value)} disabled={!A.state}>
                                        <option value="" className="bg-[#0a0a0a] text-white/40">Select LGA</option>
                                        {(locations.lgasByState[A.state] || []).map(l => (
                                            <option key={l} value={l} className="bg-[#0a0a0a] text-white">{l}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">Threat Level</p>
                                <div className="flex gap-2">
                                    {THREAT.map(o => (
                                        <button type="button" key={o.v} onClick={() => setAF('threat', o.v)}
                                            style={A.threat === o.v ? { background: o.bg, borderColor: o.border, color: o.color } : {}}
                                            className={`flex-1 py-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer
                                            ${A.threat === o.v ? '' : 'border-white/15 text-white/30 hover:border-white/30 hover:text-white/50'}`}>
                                            {o.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">Image URL <span className="normal-case text-white/20">(optional)</span></label>
                                <input className={inp} type="url" placeholder="https://..." value={A.image} onChange={e => setAF('image', e.target.value)} />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">Citation URL <span className="normal-case text-white/20">(optional)</span></label>
                                <input className={inp} type="url" placeholder="https://source.com/article" value={A.citation} onChange={e => setAF('citation', e.target.value)} />
                            </div>

                            <button type="submit" disabled={loading}
                                className="w-full bg-white hover:bg-white/90 text-black font-bold rounded-lg py-3 text-sm transition-all active:scale-[0.99] cursor-pointer disabled:opacity-40">
                                {loading ? 'Publishing…' : 'Publish Article'}
                            </button>
                        </form>
                    )}

                    {/* ── NEWS FORM ── */}
                    {admin.verified && postTab === 'news' && (
                        <form onSubmit={handleNewsPublish} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 space-y-1">
                                    <label className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">Headline *</label>
                                    <input className={inp} required placeholder="Gunmen abduct 5 farmers in Zamfara…" value={N.title} onChange={e => setNF('title', e.target.value)} />
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <label className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">Short Summary *</label>
                                    <input className={inp} required placeholder="One-line overview" value={N.desc} onChange={e => setNF('desc', e.target.value)} />
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <label className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">Full Report *</label>
                                    <textarea className={`${inp} resize-none`} required rows={4}
                                        placeholder="Detailed account of the incident, casualties, response…"
                                        value={N.content} onChange={e => setNF('content', e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">State</label>
                                    <select className={inp} value={N.state} onChange={e => { setNF('state', e.target.value); setNF('lga', '') }}>
                                        <option value="" className="bg-[#0a0a0a] text-white/40">Select state</option>
                                        {locations.states.map(s => (
                                            <option key={s} value={s} className="bg-[#0a0a0a] text-white">{s}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">LGA</label>
                                    <select className={inp} value={N.lga} onChange={e => setNF('lga', e.target.value)} disabled={!N.state}>
                                        <option value="" className="bg-[#0a0a0a] text-white/40">Select LGA</option>
                                        {(locations.lgasByState[N.state] || []).map(l => (
                                            <option key={l} value={l} className="bg-[#0a0a0a] text-white">{l}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">Threat Level</p>
                                <div className="flex gap-2">
                                    {THREAT.map(o => (
                                        <button type="button" key={o.v} onClick={() => setNF('threat', o.v)}
                                            style={N.threat === o.v ? { background: o.bg, borderColor: o.border, color: o.color } : {}}
                                            className={`flex-1 py-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer
                                            ${N.threat === o.v ? '' : 'border-white/15 text-white/30 hover:border-white/30 hover:text-white/50'}`}>
                                            {o.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">Cover Image URL <span className="normal-case text-white/20">(optional)</span></label>
                                <input className={inp} type="url" placeholder="https://..." value={N.image} onChange={e => setNF('image', e.target.value)} />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">Citation URL <span className="normal-case text-white/20">(optional)</span></label>
                                <input className={inp} type="url" placeholder="https://source.com/article" value={N.citation} onChange={e => setNF('citation', e.target.value)} />
                            </div>

                            <button type="submit" disabled={loading}
                                className="w-full bg-white hover:bg-white/90 text-black font-bold rounded-lg py-3 text-sm transition-all active:scale-[0.99] cursor-pointer disabled:opacity-40">
                                {loading ? 'Publishing…' : 'Publish to News Feed'}
                            </button>
                        </form>
                    )}

                    {/* ── ADS FORM ── */}
                    {admin.verified && postTab === 'ads' && (
                        <form onSubmit={handleAdPublish} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">Ad Image URL *</label>
                                <input className={inp} required type="url" placeholder="https://example.com/ad-banner.jpg"
                                    value={adFields.imageUrl} onChange={e => setAdF('imageUrl', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">Target URL *</label>
                                <input className={inp} required type="url" placeholder="https://example.com"
                                    value={adFields.targetUrl} onChange={e => setAdF('targetUrl', e.target.value)} />
                            </div>
                            <button type="submit" disabled={loading}
                                className="w-full bg-white hover:bg-white/90 text-black font-bold rounded-lg py-3 text-sm transition-all active:scale-[0.99] cursor-pointer disabled:opacity-40">
                                {loading ? 'Publishing…' : 'Publish Ad'}
                            </button>
                        </form>
                    )}

                    {/* ── PENDING ── */}
                    {!admin.verified && (
                        <div className="flex flex-col items-center gap-4 py-16 text-center">
                            <div className="w-14 h-14 rounded-xl flex items-center justify-center border border-white/20 bg-black">
                                <span className="text-3xl">🔒</span>
                            </div>
                            <div>
                                <h4 className="text-base font-bold text-white mb-1">Awaiting Verification</h4>
                                <p className="text-sm text-white/35 max-w-xs leading-relaxed">A super-admin must approve your account before you can publish.</p>
                            </div>
                            <div className="px-3 py-1.5 rounded-md border border-white/15 bg-white/[0.02] text-xs text-white/40">
                                Signed in as <span className="text-white/60">{admin.name}</span>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}
