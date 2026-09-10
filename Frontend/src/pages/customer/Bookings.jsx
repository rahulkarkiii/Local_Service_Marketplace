import { useEffect, useState } from "react"
import client from "../../api/client"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge, StatusBadge } from "../../components/ui/badge"
import { Input, Textarea } from "../../components/ui/input"

export default function CustomerBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const fetch = async () => {
    setLoading(true)
    try {
      const res = await client.get("/bookings/")
      setBookings(Array.isArray(res.data) ? res.data : res.data.results || [])
    } catch {} finally { setLoading(false) }
  }
  useEffect(()=>{ fetch() }, [])

  const cancel = async (id) => {
    setError(""); setSuccess("")
    try {
      await client.put(`/bookings/${id}/cancel/`)
      setSuccess(`Booking #${id} cancelled.`)
      fetch()
    } catch (e) {
      setError(e.response?.data?.detail || "Cancel failed.")
    }
  }

  const createBooking = async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    const payload = {
      service: Number(fd.get("service")),
      booking_date: fd.get("booking_date"),
      booking_time: fd.get("booking_time") || null,
      notes: fd.get("notes") || "",
    }
    setError(""); setSuccess("")
    try {
      await client.post("/bookings/", payload)
      setSuccess("Booking created!")
      e.target.reset()
      fetch()
    } catch (err) {
      const d = err.response?.data
      setError(typeof d==="string"?d: JSON.stringify(d))
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">My Bookings</h1>
        <p className="text-muted-foreground mt-1">Track and manage your service bookings. Only pending bookings can be cancelled.</p>
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</div>}
      {success && <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-3">{success}</div>}

      <Card>
        <CardHeader><CardTitle className="text-base">Create a booking (quick)</CardTitle><p className="text-sm text-muted-foreground">You can also book directly from a service page. Provider availability is validated server-side.</p></CardHeader>
        <CardContent>
          <form onSubmit={createBooking} className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Service ID *</label>
              <Input name="service" type="number" required placeholder="e.g. 1" className="mt-1.5" />
            </div>
            <div>
              <label className="text-sm font-medium">Booking date *</label>
              <Input name="booking_date" type="date" required className="mt-1.5" />
            </div>
            <div>
              <label className="text-sm font-medium">Booking time</label>
              <Input name="booking_time" type="time" className="mt-1.5" />
            </div>
            <div>
              <label className="text-sm font-medium">Notes</label>
              <Input name="notes" placeholder="Address, details..." className="mt-1.5" />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" className="rounded-xl bg-zinc-900 hover:bg-black">Create booking</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>All bookings ({bookings.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p className="text-sm text-muted-foreground">Loading...</p> : bookings.length===0 ? <p className="text-sm text-muted-foreground">No bookings yet.</p> :
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground border-b">
                  <tr><th className="text-left py-2 font-medium">ID</th><th className="text-left py-2 font-medium">Service</th><th className="text-left py-2 font-medium">Date</th><th className="text-left py-2 font-medium">Time</th><th className="text-left py-2 font-medium">Status</th><th className="text-left py-2 font-medium">Actions</th></tr>
                </thead>
                <tbody>
                  {bookings.map(b=> (
                    <tr key={b.id} className="border-b last:border-0 hover:bg-zinc-50">
                      <td className="py-3 font-medium">#{b.id}</td>
                      <td className="py-3">#{b.service}</td>
                      <td className="py-3">{b.booking_date}</td>
                      <td className="py-3">{b.booking_time || "—"}</td>
                      <td className="py-3"><StatusBadge status={b.status}/></td>
                      <td className="py-3">
                        {b.status==="PENDING" ? <Button size="sm" variant="outline" className="rounded-xl h-7 text-xs" onClick={()=>cancel(b.id)}>Cancel</Button> : <span className="text-xs text-muted-foreground">—</span>}
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
