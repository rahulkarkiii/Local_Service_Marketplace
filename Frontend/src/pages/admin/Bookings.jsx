import { useEffect, useState, useMemo } from "react"
import client from "../../api/client"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { StatusBadge, Badge } from "../../components/ui/badge"
import { Input, Select } from "../../components/ui/input"
import { Search, Calendar, Clock, X, Users, CheckCircle2, XCircle, Hourglass, Ban } from "lucide-react"
import { formatPrice } from "../../lib/utils"

function formatDate(dt) {
  if (!dt) return "—"
  try { return new Date(dt).toLocaleDateString("en-NP", { year: "numeric", month: "short", day: "numeric" }) } catch { return dt }
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  useEffect(() => {
    const run = async () => {
      setLoading(true); setError("")
      try {
        const res = await client.get("/bookings/")
        setBookings(Array.isArray(res.data) ? res.data : res.data.results || [])
      } catch (e) {
        const d = e.response?.data
        setError(d?.detail || (typeof d === "string" ? d : JSON.stringify(d)) || "Failed to load bookings. Ensure you are logged in as ADMIN.")
      } finally { setLoading(false) }
    }
    run()
  }, [])

  const filtered = useMemo(() => {
    return bookings.filter(b => {
      if (statusFilter && b.status !== statusFilter) return false
      if (search) {
        const q = search.toLowerCase()
        const hay = `#${b.id} #${b.customer} #${b.service} ${b.booking_date} ${b.booking_time||""} ${b.status} ${b.notes||""}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [bookings, search, statusFilter])

  const counts = useMemo(() => {
    const c = { total: bookings.length, PENDING: 0, ACCEPTED: 0, COMPLETED: 0, REJECTED: 0, CANCELLED: 0 }
    bookings.forEach(b => { if (c[b.status] !== undefined) c[b.status]++ })
    return c
  }, [bookings])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2.5"><Calendar className="h-7 w-7 text-violet-600" /> All Bookings</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">Admin view of every booking across the platform. Filter by status or search by ID, date, or notes.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-600 text-white font-bold"><Calendar className="h-3 w-3" />{counts.total} total</span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500 text-white font-bold"><Hourglass className="h-3 w-3" />{counts.PENDING} pending</span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-sky-600 text-white font-bold">{counts.ACCEPTED} accepted</span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-600 text-white font-bold"><CheckCircle2 className="h-3 w-3" />{counts.COMPLETED} completed</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-violet-100 dark:bg-violet-900/30 grid place-items-center"><Calendar className="h-5 w-5 text-violet-600" /></div>
          <div><div className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Total</div><div className="text-xl font-extrabold leading-none">{counts.total}</div></div>
        </Card>
        <Card className="p-4 flex items-center gap-3 border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20">
          <div className="h-9 w-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 grid place-items-center"><Hourglass className="h-5 w-5 text-amber-600" /></div>
          <div><div className="text-[11px] font-bold tracking-widest uppercase text-amber-700 dark:text-amber-400">Pending</div><div className="text-xl font-extrabold leading-none">{counts.PENDING}</div></div>
        </Card>
        <Card className="p-4 flex items-center gap-3 border-sky-200 dark:border-sky-900/50 bg-sky-50/50 dark:bg-sky-950/20">
          <div className="h-9 w-9 rounded-xl bg-sky-100 dark:bg-sky-900/30 grid place-items-center"><Users className="h-5 w-5 text-sky-600" /></div>
          <div><div className="text-[11px] font-bold tracking-widest uppercase text-sky-700 dark:text-sky-400">Accepted</div><div className="text-xl font-extrabold leading-none">{counts.ACCEPTED}</div></div>
        </Card>
        <Card className="p-4 flex items-center gap-3 border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20">
          <div className="h-9 w-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 grid place-items-center"><CheckCircle2 className="h-5 w-5 text-emerald-600" /></div>
          <div><div className="text-[11px] font-bold tracking-widest uppercase text-emerald-700 dark:text-emerald-400">Completed</div><div className="text-xl font-extrabold leading-none">{counts.COMPLETED}</div></div>
        </Card>
        <Card className="p-4 flex items-center gap-3 border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20">
          <div className="h-9 w-9 rounded-xl bg-red-100 dark:bg-red-900/30 grid place-items-center"><XCircle className="h-5 w-5 text-red-600" /></div>
          <div><div className="text-[11px] font-bold tracking-widest uppercase text-red-700 dark:text-red-400">Rejected</div><div className="text-xl font-extrabold leading-none">{counts.REJECTED}</div></div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 grid place-items-center"><Ban className="h-5 w-5 text-zinc-500" /></div>
          <div><div className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Cancelled</div><div className="text-xl font-extrabold leading-none">{counts.CANCELLED}</div></div>
        </Card>
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-300 dark:border-red-900/50 border border-red-200 rounded-xl p-3">{error}</div>}

      {/* Filters */}
      <Card className="p-4">
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Search</label>
            <div className="relative mt-1.5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Booking ID, customer ID, service ID, date, notes..." className="pl-9" />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Status</label>
            <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="mt-1.5">
              <option value="">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="REJECTED">Rejected</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </Select>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <span>Showing {filtered.length} of {bookings.length}</span>
          {(search || statusFilter) && (
            <button onClick={() => { setSearch(""); setStatusFilter("") }} className="inline-flex items-center gap-1 text-violet-600 dark:text-violet-400 font-semibold hover:underline"><X className="h-3 w-3" /> Clear filters</button>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            <span>Bookings ({filtered.length})</span>
            <span className="text-xs font-normal text-muted-foreground hidden sm:inline">ID • Customer • Service • Date • Time • Status • Created</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Loading bookings…</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto h-14 w-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 grid place-items-center"><Calendar className="h-7 w-7 text-zinc-400" /></div>
              <h3 className="font-semibold mt-4">No bookings match filters</h3>
              <p className="text-sm text-muted-foreground mt-1">Try clearing status or search.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="table-header">
                  <tr>
                    <th className="text-left py-3 px-4 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">ID</th>
                    <th className="text-left py-3 px-4 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Customer</th>
                    <th className="text-left py-3 px-4 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Service</th>
                    <th className="text-left py-3 px-4 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Time</th>
                    <th className="text-left py-3 px-4 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(b => (
                    <tr key={b.id} className="table-row">
                      <td className="py-3.5 px-4 font-mono text-xs font-bold">#{b.id}</td>
                      <td className="py-3.5 px-4"><span className="inline-flex items-center gap-1.5 font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full border">#{b.customer}</span></td>
                      <td className="py-3.5 px-4"><span className="inline-flex items-center gap-1.5 font-mono text-xs bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300 px-2 py-0.5 rounded-full border border-violet-200 dark:border-violet-900/50">#{b.service}</span></td>
                      <td className="py-3.5 px-4 whitespace-nowrap font-medium">{b.booking_date}</td>
                      <td className="py-3.5 px-4 whitespace-nowrap">{b.booking_time ? <span className="inline-flex items-center gap-1 text-xs"><Clock className="h-3 w-3 text-muted-foreground" /> {b.booking_time}</span> : <span className="text-muted-foreground">—</span>}</td>
                      <td className="py-3.5 px-4"><StatusBadge status={b.status} /></td>
                      <td className="py-3.5 px-4 text-xs text-muted-foreground whitespace-nowrap">{formatDate(b.created_at)}</td>
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
