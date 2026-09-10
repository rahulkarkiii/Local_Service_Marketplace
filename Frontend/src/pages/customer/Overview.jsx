import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Calendar, CreditCard, Star, Clock, ArrowRight, MapPin } from "lucide-react"
import client from "../../api/client"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge, StatusBadge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { formatPrice, formatDate } from "../../lib/utils"
import useAuthStore from "../../stores/authStore"

export default function CustomerOverview() {
  const [bookings, setBookings] = useState([])
  const [payments, setPayments] = useState([])
  const { user } = useAuthStore()

  useEffect(()=> {
    client.get("/bookings/").then(r=> setBookings(Array.isArray(r.data)?r.data:r.data.results||[])).catch(()=>{})
    client.get("/payments/").then(r=> setPayments(Array.isArray(r.data)?r.data:r.data.results||[])).catch(()=>{})
  }, [])

  const pending = bookings.filter(b=>b.status==="PENDING").length
  const accepted = bookings.filter(b=>b.status==="ACCEPTED").length
  const completed = bookings.filter(b=>b.status==="COMPLETED").length
  const totalPaid = payments.filter(p=>p.status==="COMPLETED").reduce((s,p)=>s+Number(p.amount),0)

  const recent = bookings.slice(0,3)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Welcome back, {user?.username} 👋</h1>
        <p className="text-muted-foreground mt-1">Here's what's happening with your bookings.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Total bookings</span><Calendar className="h-4 w-4 text-violet-600"/></div>
          <div className="text-3xl font-extrabold mt-2">{bookings.length}</div>
          <div className="text-xs text-muted-foreground mt-1">{pending} pending • {accepted} accepted</div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Completed</span><Clock className="h-4 w-4 text-emerald-600"/></div>
          <div className="text-3xl font-extrabold mt-2">{completed}</div>
          <div className="text-xs text-muted-foreground mt-1">Ready to review & pay</div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Total paid</span><CreditCard className="h-4 w-4 text-sky-600"/></div>
          <div className="text-3xl font-extrabold mt-2">{formatPrice(totalPaid)}</div>
          <div className="text-xs text-muted-foreground mt-1">{payments.length} payments</div>
        </Card>
        <Card className="p-5 bg-gradient-to-br from-violet-600 to-indigo-600 text-white border-0">
          <div className="text-sm text-violet-100">Need a service?</div>
          <div className="text-lg font-bold mt-1">Find trusted pros near you</div>
          <Link to="/services"><Button size="sm" className="mt-3 bg-white text-violet-700 hover:bg-zinc-100 rounded-xl gap-1">Browse services <ArrowRight className="h-3.5 w-3.5"/></Button></Link>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent bookings</CardTitle>
            <Link to="/customer/bookings" className="text-sm font-semibold text-violet-600 hover:underline">View all →</Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recent.length===0 ? <p className="text-sm text-muted-foreground">No bookings yet. <Link to="/services" className="text-violet-600 underline">Browse services</Link></p> :
              recent.map(b=> (
                <div key={b.id} className="flex items-center justify-between border rounded-xl p-3">
                  <div>
                    <div className="text-sm font-semibold">Booking #{b.id} • Service #{b.service}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2"><Calendar className="h-3 w-3"/>{b.booking_date} {b.booking_time||""} <MapPin className="h-3 w-3"/>{b.status}</div>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
              ))
            }
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Quick actions</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Link to="/services" className="rounded-2xl border p-4 hover:bg-zinc-50 transition-colors">
              <div className="h-9 w-9 rounded-xl bg-violet-100 grid place-items-center"><Calendar className="h-5 w-5 text-violet-600"/></div>
              <div className="text-sm font-semibold mt-2">Book a service</div>
              <div className="text-xs text-muted-foreground">Find & book in minutes</div>
            </Link>
            <Link to="/customer/payments" className="rounded-2xl border p-4 hover:bg-zinc-50 transition-colors">
              <div className="h-9 w-9 rounded-xl bg-emerald-100 grid place-items-center"><CreditCard className="h-5 w-5 text-emerald-600"/></div>
              <div className="text-sm font-semibold mt-2">Pay with Khalti</div>
              <div className="text-xs text-muted-foreground">Secure, server-verified</div>
            </Link>
            <Link to="/providers" className="rounded-2xl border p-4 hover:bg-zinc-50 transition-colors">
              <div className="h-9 w-9 rounded-xl bg-sky-100 grid place-items-center"><Star className="h-5 w-5 text-sky-600"/></div>
              <div className="text-sm font-semibold mt-2">Find providers</div>
              <div className="text-xs text-muted-foreground">Nearby & verified</div>
            </Link>
            <Link to="/reports" className="rounded-2xl border p-4 hover:bg-zinc-50 transition-colors">
              <div className="h-9 w-9 rounded-xl bg-amber-100 grid place-items-center"><Clock className="h-5 w-5 text-amber-600"/></div>
              <div className="text-sm font-semibold mt-2">Get help</div>
              <div className="text-xs text-muted-foreground">Report an issue</div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
