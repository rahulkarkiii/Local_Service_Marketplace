import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Users, Briefcase, Calendar, CreditCard, Star, Flag, TrendingUp, ShieldCheck } from "lucide-react"
import client from "../../api/client"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { formatPrice } from "../../lib/utils"

export default function AdminOverview() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(()=> {
    const run = async () => {
      try {
        const res = await client.get("/analytics/dashboard/")
        setData(res.data)
      } catch (e) {
        setError(e.response?.data?.detail || "Failed to load dashboard. Ensure you are logged in as ADMIN.")
      } finally { setLoading(false) }
    }
    run()
  }, [])

  if (loading) return <div className="text-sm text-muted-foreground">Loading dashboard…</div>
  if (error) return <Card className="p-8 text-center"><p className="text-sm text-red-600">{error}</p><p className="text-xs text-muted-foreground mt-2">Create admin via: <code className="bg-zinc-100 px-1 rounded">python manage.py createsuperuser</code> then set role to ADMIN.</p></Card>
  if (!data) return null

  const cards = [
    { label:"Total users", value: data.users.total, sub:`${data.users.customers} customers • ${data.users.providers} providers`, icon: Users, color:"bg-violet-100 text-violet-600" },
    { label:"Verified providers", value: data.users.verified_providers, sub:`of ${data.users.providers} providers`, icon: ShieldCheck, color:"bg-emerald-100 text-emerald-600" },
    { label:"Services", value: data.services.total, sub:`${data.services.active} active • ${data.services.categories} categories`, icon: Briefcase, color:"bg-sky-100 text-sky-600" },
    { label:"Bookings", value: data.bookings.total, sub: Object.entries(data.bookings.by_status).map(([k,v])=>`${k}:${v}`).join(" • ") || "—", icon: Calendar, color:"bg-amber-100 text-amber-600" },
    { label:"Revenue", value: formatPrice(data.payments.total_revenue), sub:`${data.payments.total} payments`, icon: CreditCard, color:"bg-emerald-100 text-emerald-600" },
    { label:"Reviews", value: data.reviews.total, sub:`Avg ${data.reviews.platform_average_rating ?? "—"} / 5`, icon: Star, color:"bg-orange-100 text-orange-600" },
    { label:"Reports", value: data.reports.total, sub:`${data.reports.open} open`, icon: Flag, color:"bg-red-100 text-red-600" },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Platform-wide stats, updated live. Historical snapshots at <Link to="/admin/analytics" className="text-violet-600 underline">/analytics</Link>.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(c=> (
          <Card key={c.label} className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{c.label}</span>
              <span className={`h-9 w-9 rounded-xl grid place-items-center ${c.color}`}><c.icon className="h-5 w-5"/></span>
            </div>
            <div className="text-2xl font-extrabold mt-2">{c.value}</div>
            <div className="text-xs text-muted-foreground mt-1 line-clamp-1">{c.sub}</div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5"/> Top providers by revenue</CardTitle></CardHeader>
          <CardContent>
            {data.top_providers_by_revenue?.length ? (
              <table className="w-full text-sm">
                <thead className="table-header"><tr><th className="text-left py-3 px-4 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Provider</th><th className="text-right py-3 px-4 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Revenue</th></tr></thead>
                <tbody>
                  {data.top_providers_by_revenue.map((r,i)=> (
                    <tr key={i} className="table-row">
                      <td className="py-2 font-medium">#{i+1} {r.provider__username}</td>
                      <td className="py-2 text-right font-bold">{formatPrice(r.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p className="text-sm text-muted-foreground">No revenue data yet.</p>}
          </CardContent>
        </Card>
        <Card className="p-6 bg-zinc-900 text-white border-0">
          <h3 className="font-bold">Quick admin actions</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Link to="/admin/providers" className="rounded-xl bg-white text-zinc-900 p-3 text-sm font-semibold hover:bg-zinc-100">Verify providers</Link>
            <Link to="/admin/categories" className="rounded-xl bg-white/10 border border-white/20 p-3 text-sm font-semibold hover:bg-white/20">Manage categories</Link>
            <Link to="/admin/reports" className="rounded-xl bg-white/10 border border-white/20 p-3 text-sm font-semibold hover:bg-white/20">Handle reports</Link>
            <Link to="/admin/analytics" className="rounded-xl bg-white/10 border border-white/20 p-3 text-sm font-semibold hover:bg-white/20">View snapshots</Link>
          </div>
          <p className="text-xs text-zinc-400 mt-4">Swagger docs available at <code className="bg-white/10 px-1 rounded">/api/docs/</code> on backend.</p>
        </Card>
      </div>
    </div>
  )
}
