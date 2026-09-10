import { useEffect, useState } from "react"
import client from "../../api/client"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { StatusBadge } from "../../components/ui/badge"

export default function ProviderBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState("")
  const [error, setError] = useState("")

  const fetch = async () => {
    setLoading(true)
    try {
      const res = await client.get("/bookings/")
      setBookings(Array.isArray(res.data)?res.data:res.data.results||[])
    } catch {} finally { setLoading(false) }
  }
  useEffect(()=>{ fetch() }, [])

  const updateStatus = async (id, status) => {
    setError(""); setMsg("")
    try {
      await client.put(`/bookings/${id}/status/`, { status })
      setMsg(`Booking #${id} marked as ${status}`)
      fetch()
    } catch (e) {
      setError(e.response?.data?.detail || JSON.stringify(e.response?.data) || "Failed")
    }
  }
  const complete = async (id) => {
    setError(""); setMsg("")
    try {
      await client.put(`/bookings/${id}/complete/`, {})
      setMsg(`Booking #${id} completed. Customer can now review & pay.`)
      fetch()
    } catch (e) {
      setError(e.response?.data?.detail || JSON.stringify(e.response?.data) || "Failed")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Bookings</h1>
        <p className="text-muted-foreground mt-1">Accept or reject pending requests. Completed bookings can be reviewed and paid by customers.</p>
      </div>

      {msg && <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-3">{msg}</div>}
      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 whitespace-pre-wrap">{error}</div>}

      <Card>
        <CardHeader><CardTitle>All bookings ({bookings.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : bookings.length===0 ? <p className="text-sm text-muted-foreground">No bookings yet.</p> :
            <div className="overflow-x-auto rounded-xl border bg-card">
              <table className="w-full text-sm">
                <thead className="table-header"><tr><th className="text-left py-3 px-4 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">ID</th><th className="text-left py-3 px-4 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Service</th><th className="text-left py-3 px-4 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Customer</th><th className="text-left py-3 px-4 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Date</th><th className="text-left py-3 px-4 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Status</th><th className="text-left py-3 px-4 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Actions</th></tr></thead>
                <tbody>
                  {bookings.map(b=> (
                    <tr key={b.id} className="table-row">
                      <td className="py-3.5 px-4 font-medium">#{b.id}</td>
                      <td className="py-3.5 px-4">#{b.service}</td>
                      <td className="py-3.5 px-4">#{b.customer}</td>
                      <td className="py-3.5 px-4">{b.booking_date} {b.booking_time||""}</td>
                      <td className="py-3.5 px-4"><StatusBadge status={b.status}/></td>
                      <td className="py-3.5 px-4 flex flex-wrap gap-1">
                        {b.status==="PENDING" && (
                          <>
                            <Button size="sm" className="h-7 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs" onClick={()=>updateStatus(b.id,"ACCEPTED")}>Accept</Button>
                            <Button size="sm" variant="outline" className="h-7 rounded-xl text-xs" onClick={()=>updateStatus(b.id,"REJECTED")}>Reject</Button>
                          </>
                        )}
                        {b.status==="ACCEPTED" && <Button size="sm" className="h-7 rounded-xl bg-violet-600 hover:bg-violet-700 text-xs" onClick={()=>complete(b.id)}>Complete</Button>}
                        {!["PENDING","ACCEPTED"].includes(b.status) && <span className="text-xs text-muted-foreground">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          }
        </CardContent>
      </Card>
    </div>
  )
}
