import { useEffect, useState } from "react"
import client from "../../api/client"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { StatusBadge } from "../../components/ui/badge"

export default function AdminBookings() {
  const [bookings, setBookings] = useState([])
  useEffect(()=> {
    client.get("/bookings/").then(r=> setBookings(Array.isArray(r.data)?r.data:r.data.results||[])).catch(()=>{})
  }, [])
  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">All Bookings</h1>
        <p className="text-muted-foreground mt-1">Admin can view all bookings across platform.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Bookings ({bookings.length})</CardTitle></CardHeader>
        <CardContent>
          {bookings.length===0 ? <p className="text-sm text-muted-foreground">No bookings.</p> :
            <div className="overflow-x-auto rounded-xl border bg-card">
              <table className="w-full text-sm">
                <thead className="table-header"><tr><th className="text-left py-3 px-4 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">ID</th><th className="text-left py-3 px-4 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Customer</th><th className="text-left py-3 px-4 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Service</th><th className="text-left py-3 px-4 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Date</th><th className="text-left py-3 px-4 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Status</th></tr></thead>
                <tbody>
                  {bookings.map(b=> (
                    <tr key={b.id} className="table-row">
                      <td className="py-3.5 px-4">#{b.id}</td>
                      <td className="py-3.5 px-4">#{b.customer}</td>
                      <td className="py-3.5 px-4">#{b.service}</td>
                      <td className="py-3.5 px-4">{b.booking_date} {b.booking_time||""}</td>
                      <td className="py-3.5 px-4"><StatusBadge status={b.status}/></td>
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
