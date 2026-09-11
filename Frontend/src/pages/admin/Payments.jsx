import { useEffect, useState, useMemo } from "react"
import client from "../../api/client"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { StatusBadge, Badge } from "../../components/ui/badge"
import { Input, Select } from "../../components/ui/input"
import { Search, CreditCard, DollarSign, TrendingUp, X, CheckCircle2, Hourglass, XCircle, RefreshCcw } from "lucide-react"
import { formatPrice } from "../../lib/utils"

function formatDate(dt) {
  if (!dt) return "—"
  try { return new Date(dt).toLocaleDateString("en-NP", { year: "numeric", month: "short", day: "numeric" }) } catch { return dt }
}

export default function AdminPayments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [methodFilter, setMethodFilter] = useState("")

  useEffect(() => {
    const run = async () => {
      setLoading(true); setError("")
      try {
        const res = await client.get("/payments/")
        setPayments(Array.isArray(res.data) ? res.data : res.data.results || [])
      } catch (e) {
        const d = e.response?.data
        setError(d?.detail || (typeof d === "string" ? d : JSON.stringify(d)) || "Failed to load payments. Ensure you are logged in as ADMIN.")
      } finally { setLoading(false) }
    }
    run()
  }, [])

  const filtered = useMemo(() => {
    return payments.filter(p => {
      if (statusFilter && p.status !== statusFilter) return false
      if (methodFilter && p.payment_method !== methodFilter) return false
      if (search) {
        const q = search.toLowerCase()
        const hay = `#${p.id} #${p.booking} #${p.customer} #${p.provider} ${p.status} ${p.payment_method} ${p.transaction_id||""} ${p.amount}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [payments, search, statusFilter, methodFilter])

  const stats = useMemo(() => {
    const total = payments.length
    const completed = payments.filter(p => p.status === "COMPLETED").length
    const pending = payments.filter(p => p.status === "PENDING").length
    const failed = payments.filter(p => p.status === "FAILED").length
    const refunded = payments.filter(p => p.status === "REFUNDED").length
    const revenue = payments.filter(p => p.status === "COMPLETED").reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)
    return { total, completed, pending, failed, refunded, revenue }
  }, [payments])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2.5"><CreditCard className="h-7 w-7 text-violet-600" /> All Payments</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">Admin view of every payment across the platform. Revenue reflects <Badge variant="success" className="text-[10px]">COMPLETED</Badge> only.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-600 text-white font-bold"><CreditCard className="h-3 w-3" />{stats.total} total</span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-600 text-white font-bold"><CheckCircle2 className="h-3 w-3" />{stats.completed} completed</span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-700 text-white font-bold"><DollarSign className="h-3 w-3" />{formatPrice(stats.revenue)}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-violet-100 dark:bg-violet-900/30 grid place-items-center"><CreditCard className="h-5 w-5 text-violet-600" /></div>
          <div><div className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Total</div><div className="text-xl font-extrabold leading-none">{stats.total}</div></div>
        </Card>
        <Card className="p-4 flex items-center gap-3 border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20">
          <div className="h-9 w-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 grid place-items-center"><CheckCircle2 className="h-5 w-5 text-emerald-600" /></div>
          <div><div className="text-[11px] font-bold tracking-widest uppercase text-emerald-700 dark:text-emerald-400">Completed</div><div className="text-xl font-extrabold leading-none">{stats.completed}</div></div>
        </Card>
        <Card className="p-4 flex items-center gap-3 border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20">
          <div className="h-9 w-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 grid place-items-center"><Hourglass className="h-5 w-5 text-amber-600" /></div>
          <div><div className="text-[11px] font-bold tracking-widest uppercase text-amber-700 dark:text-amber-400">Pending</div><div className="text-xl font-extrabold leading-none">{stats.pending}</div></div>
        </Card>
        <Card className="p-4 flex items-center gap-3 border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20">
          <div className="h-9 w-9 rounded-xl bg-red-100 dark:bg-red-900/30 grid place-items-center"><XCircle className="h-5 w-5 text-red-600" /></div>
          <div><div className="text-[11px] font-bold tracking-widest uppercase text-red-700 dark:text-red-400">Failed</div><div className="text-xl font-extrabold leading-none">{stats.failed}</div></div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 grid place-items-center"><RefreshCcw className="h-5 w-5 text-zinc-500" /></div>
          <div><div className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Refunded</div><div className="text-xl font-extrabold leading-none">{stats.refunded}</div></div>
        </Card>
        <Card className="p-4 flex items-center gap-3 border-emerald-300 dark:border-emerald-900/50 bg-emerald-600 text-white dark:bg-emerald-700">
          <div className="h-9 w-9 rounded-xl bg-white/20 grid place-items-center"><TrendingUp className="h-5 w-5 text-white" /></div>
          <div><div className="text-[11px] font-bold tracking-widest uppercase text-emerald-100">Revenue</div><div className="text-lg font-extrabold leading-none">{formatPrice(stats.revenue)}</div></div>
        </Card>
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-300 dark:border-red-900/50 border border-red-200 rounded-xl p-3">{error}</div>}

      {/* Filters */}
      <Card className="p-4">
        <div className="grid sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <label className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Search</label>
            <div className="relative mt-1.5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Payment, booking, customer, transaction ID..." className="pl-9" />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Status</label>
            <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="mt-1.5">
              <option value="">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </Select>
          </div>
          <div>
            <label className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Method</label>
            <Select value={methodFilter} onChange={e => setMethodFilter(e.target.value)} className="mt-1.5">
              <option value="">All methods</option>
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
              <option value="ONLINE">Online</option>
            </Select>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <span>Showing {filtered.length} of {payments.length}</span>
          {(search || statusFilter || methodFilter) && (
            <button onClick={() => { setSearch(""); setStatusFilter(""); setMethodFilter("") }} className="inline-flex items-center gap-1 text-violet-600 dark:text-violet-400 font-semibold hover:underline"><X className="h-3 w-3" /> Clear filters</button>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            <span>Payments ({filtered.length})</span>
            <span className="text-xs font-normal text-muted-foreground hidden sm:inline">ID • Booking • Customer • Provider • Amount • Method • Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Loading payments…</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto h-14 w-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 grid place-items-center"><CreditCard className="h-7 w-7 text-zinc-400" /></div>
              <h3 className="font-semibold mt-4">No payments match filters</h3>
              <p className="text-sm text-muted-foreground mt-1">Try clearing status, method, or search.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="table-header">
                  <tr>
                    <th className="text-left py-3 px-4 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">ID</th>
                    <th className="text-left py-3 px-4 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Booking</th>
                    <th className="text-left py-3 px-4 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Customer</th>
                    <th className="text-left py-3 px-4 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Provider</th>
                    <th className="text-right py-3 px-4 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Amount</th>
                    <th className="text-left py-3 px-4 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Method</th>
                    <th className="text-left py-3 px-4 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Txn ID</th>
                    <th className="text-left py-3 px-4 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.id} className="table-row">
                      <td className="py-3.5 px-4 font-mono text-xs font-bold">#{p.id}</td>
                      <td className="py-3.5 px-4"><span className="font-mono text-xs bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300 px-2 py-0.5 rounded-full border border-violet-200 dark:border-violet-900/50">#{p.booking}</span></td>
                      <td className="py-3.5 px-4"><span className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full border">#{p.customer}</span></td>
                      <td className="py-3.5 px-4"><span className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full border">#{p.provider}</span></td>
                      <td className="py-3.5 px-4 text-right font-bold tabular-nums">{formatPrice(p.amount)}</td>
                      <td className="py-3.5 px-4"><Badge variant="outline" className="text-[10px]">{p.payment_method}</Badge></td>
                      <td className="py-3.5 px-4"><StatusBadge status={p.status} /></td>
                      <td className="py-3.5 px-4 font-mono text-xs max-w-[140px] truncate" title={p.transaction_id || ""}>{p.transaction_id || <span className="text-muted-foreground">—</span>}</td>
                      <td className="py-3.5 px-4 text-xs text-muted-foreground whitespace-nowrap">{formatDate(p.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
