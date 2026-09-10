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
        <h1 className="text-2xl font-extrabold tracking-tight">All Bookings</h1>
        <p className="text-muted-foreground mt-1">Admin can view all bookings across platform.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Bookings ({bookings.length})</CardTitle></CardHeader>
        <CardContent>
          {bookings.length===0 ? <p className="text-sm text-muted-foreground">No bookings.</p> :
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground border-b"><tr><th className="text-left py-2">ID</th><th className="text-left py-2">Customer</th><th className="text-left py-2">Service</th><th className="text-left py-2">Date</th><th className="text-left py-2">Status</th></tr></thead>
                <tbody>
                  {bookings.map(b=> (
                    <tr key={b.id} className="border-b last:border-0 hover:bg-zinc-50">
                      <td className="py-3">#{b.id}</td>
                      <td className="py-3">#{b.customer}</td>
                      <td className="py-3">#{b.service}</td>
                      <td className="py-3">{b.booking_date} {b.booking_time||""}</td>
                      <td className="py-3"><StatusBadge status={b.status}/></td>
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
