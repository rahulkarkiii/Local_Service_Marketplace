import { useEffect, useState, useMemo } from "react"
import client from "../../api/client"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Input, Select } from "../../components/ui/input"
import { Search, ShieldCheck, ShieldAlert, Users, Star, MapPin, Phone, Award, X, CheckCircle2, XCircle } from "lucide-react"

function formatDate(dt) {
  if (!dt) return "—"
  try { return new Date(dt).toLocaleDateString("en-NP", { year: "numeric", month: "short", day: "numeric" }) } catch { return dt }
}

export default function AdminProviders() {
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [msg, setMsg] = useState("")
  const [search, setSearch] = useState("")
  const [verifyFilter, setVerifyFilter] = useState("")
  const [actionLoading, setActionLoading] = useState(null)

  const fetch = async () => {
    setLoading(true); setError("")
    try {
      const res = await client.get("/providers/")
      setProviders(Array.isArray(res.data) ? res.data : res.data.results || [])
    } catch (e) {
      const d = e.response?.data
      setError(d?.detail || (typeof d === "string" ? d : JSON.stringify(d)) || "Failed to load providers. Ensure you are logged in as ADMIN.")
    } finally { setLoading(false) }
  }
  useEffect(() => { fetch() }, [])

  const filtered = useMemo(() => {
    return providers.filter(p => {
      if (verifyFilter === "verified" && !p.is_verified) return false
      if (verifyFilter === "pending" && p.is_verified) return false
      if (search) {
        const q = search.toLowerCase()
        const hay = `${p.business_name} ${p.address} ${p.phone} ${p.bio} #${p.id} #${p.account}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [providers, search, verifyFilter])

  const counts = useMemo(() => ({
    total: providers.length,
    verified: providers.filter(p => p.is_verified).length,
    pending: providers.filter(p => !p.is_verified).length,
  }), [providers])

  const verify = async (id, is_verified) => {
    setActionLoading(id); setError(""); setMsg("")
    try {
      const res = await client.patch(`/providers/${id}/verify/`, { is_verified })
      setProviders(prev => prev.map(p => p.id === id ? { ...p, is_verified: res.data.is_verified } : p))
      setMsg(`Provider #${id} ${is_verified ? "verified" : "unverified"} successfully.`)
    } catch (e) {
      const d = e.response?.data
      setError(d?.detail || JSON.stringify(d) || "Failed to update verification")
    } finally { setActionLoading(null) }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2.5"><ShieldCheck className="h-7 w-7 text-violet-600" /> Provider Verification</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">Admin-only: approve or reject provider profiles. Verified providers can list services (<Badge variant="info" className="ml-1 text-[10px]">IsVerifiedProvider</Badge> gate).</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-600 text-white font-bold"><Users className="h-3 w-3" />{counts.total} total</span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-600 text-white font-bold"><CheckCircle2 className="h-3 w-3" />{counts.verified} verified</span>
          {counts.pending > 0 && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500 text-white font-bold"><ShieldAlert className="h-3 w-3" />{counts.pending} pending</span>}
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-3">
        <Card className="p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-violet-100 dark:bg-violet-900/30 grid place-items-center"><Users className="h-5 w-5 text-violet-600" /></div>
          <div><div className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Total Providers</div><div className="text-xl font-extrabold leading-none">{counts.total}</div></div>
        </Card>
        <Card className="p-4 flex items-center gap-3 border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20">
          <div className="h-9 w-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 grid place-items-center"><CheckCircle2 className="h-5 w-5 text-emerald-600" /></div>
          <div><div className="text-[11px] font-bold tracking-widest uppercase text-emerald-700 dark:text-emerald-400">Verified</div><div className="text-xl font-extrabold leading-none">{counts.verified}</div></div>
        </Card>
        <Card className="p-4 flex items-center gap-3 border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20">
          <div className="h-9 w-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 grid place-items-center"><ShieldAlert className="h-5 w-5 text-amber-600" /></div>
          <div><div className="text-[11px] font-bold tracking-widest uppercase text-amber-700 dark:text-amber-400">Pending Review</div><div className="text-xl font-extrabold leading-none">{counts.pending}</div></div>
        </Card>
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-300 dark:border-red-900/50 border border-red-200 rounded-xl p-3">{error}</div>}
      {msg && <div className="text-sm text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/50 border border-emerald-200 rounded-xl p-3">{msg}</div>}

      {/* Filters */}
      <Card className="p-4">
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Search</label>
            <div className="relative mt-1.5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Business name, address, phone..." className="pl-9" />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Verification</label>
            <Select value={verifyFilter} onChange={e => setVerifyFilter(e.target.value)} className="mt-1.5">
              <option value="">All providers</option>
              <option value="verified">Verified only</option>
              <option value="pending">Pending only</option>
            </Select>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <span>Showing {filtered.length} of {providers.length}</span>
          {(search || verifyFilter) && (
            <button onClick={() => { setSearch(""); setVerifyFilter("") }} className="inline-flex items-center gap-1 text-violet-600 dark:text-violet-400 font-semibold hover:underline"><X className="h-3 w-3" /> Clear filters</button>
          )}
        </div>
      </Card>

      {/* List */}
      {loading ? (
        <div className="p-8 text-center text-sm text-muted-foreground">Loading providers…</div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 grid place-items-center"><ShieldAlert className="h-7 w-7 text-zinc-400" /></div>
          <h3 className="font-semibold mt-4">No providers match filters</h3>
          <p className="text-sm text-muted-foreground mt-1">Try clearing search or verification filter.</p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map(p => (
            <Card key={p.id} className={`p-5 ${p.is_verified ? "border-emerald-200 dark:border-emerald-900/50" : "border-amber-200 dark:border-amber-900/50"}`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-base">{p.business_name}</span>
                    {p.is_verified ? <Badge variant="success">Verified</Badge> : <Badge variant="warning">Pending</Badge>}
                    <span className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full border">#{p.id} • Account #{p.account}</span>
                    {p.average_rating != null && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50 px-2 py-0.5 rounded-full"><Star className="h-3 w-3 fill-amber-500 text-amber-500" /> {p.average_rating} ({p.review_count})</span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                    <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {p.address}</span>
                    <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {p.phone}</span>
                    <span className="inline-flex items-center gap-1"><Award className="h-3.5 w-3.5" /> {p.experience_years} yrs experience</span>
                    <span className="inline-flex items-center gap-1">Joined {formatDate(p.created_at)}</span>
                  </div>
                  <div className="text-sm mt-2 leading-relaxed bg-zinc-50 dark:bg-zinc-800/50 border rounded-xl p-3">{p.bio || <span className="text-muted-foreground italic">No bio provided.</span>}</div>
                  {(p.latitude || p.longitude) && <div className="text-xs text-muted-foreground mt-2">📍 {p.latitude}, {p.longitude}</div>}
                  {p.geocoding_warning && <div className="text-xs text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl p-2 mt-2">{p.geocoding_warning}</div>}
                </div>
                <div className="flex gap-2 shrink-0">
                  {!p.is_verified ? (
                    <Button size="sm" className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4" onClick={() => verify(p.id, true)} disabled={actionLoading === p.id}>
                      {actionLoading === p.id ? "…" : <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> Verify</span>}
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" className="rounded-full border-2 font-bold" onClick={() => verify(p.id, false)} disabled={actionLoading === p.id}>
                      {actionLoading === p.id ? "…" : <span className="inline-flex items-center gap-1.5"><XCircle className="h-4 w-4" /> Unverify</span>}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
