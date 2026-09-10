import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Briefcase, Calendar, CreditCard, Star, Clock, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react"
import client from "../../api/client"
import useAuthStore from "../../stores/authStore"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { formatPrice } from "../../lib/utils"

export default function ProviderOverview() {
  const [bookings, setBookings] = useState([])
  const [services, setServices] = useState([])
  const [earnings, setEarnings] = useState(null)
  const [profile, setProfile] = useState(null)
  const { user } = useAuthStore()

  useEffect(()=> {
    client.get("/bookings/").then(r=> setBookings(Array.isArray(r.data)?r.data:r.data.results||[])).catch(()=>{})
    client.get("/services/").then(r=> {
      const arr = Array.isArray(r.data)?r.data:r.data.results||[]
      setServices(arr.filter(s=> String(s.provider)===String(user?.id)))
    }).catch(()=>{})
    client.get("/payments/earnings/").then(r=> setEarnings(r.data)).catch(()=>{})
    client.get("/providers/").then(r=>{
      const arr = Array.isArray(r.data)?r.data:r.data.results||[]
      const mine = arr.find(p=> String(p.account)===String(user?.id))
      if (mine) setProfile(mine)
    }).catch(()=>{})
  }, [])

  const pending = bookings.filter(b=>b.status==="PENDING").length

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Provider Hub</h1>
          <p className="text-muted-foreground mt-1">Manage services, bookings, and earnings.</p>
        </div>
        {profile && (
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${profile.is_verified ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
            {profile.is_verified ? <><ShieldCheck className="h-4 w-4"/> Verified provider</> : <><AlertCircle className="h-4 w-4"/> Pending verification</>}
          </div>
        )}
      </div>

      {!profile && (
        <Card className="border-amber-200 bg-amber-50 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="font-semibold text-amber-900">Create your provider profile to get started</div>
            <div className="text-sm text-amber-700">Add business name, address, and get verified by admin. Services require verification.</div>
          </div>
          <Link to="/provider/profile"><Button className="rounded-xl bg-amber-600 hover:bg-amber-700">Create profile</Button></Link>
        </Card>
      )}
      {profile && !profile.is_verified && (
        <Card className="border-sky-200 bg-sky-50 p-4">
          <div className="font-semibold text-sky-900">Verification pending</div>
          <div className="text-sm text-sky-700">Admin will verify your profile soon. You can still create availability slots, but services require verification to be listed.</div>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Bookings</span><Calendar className="h-4 w-4 text-violet-600"/></div>
          <div className="text-3xl font-extrabold mt-2">{bookings.length}</div>
          <div className="text-xs text-muted-foreground mt-1">{pending} pending requests</div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Services</span><Briefcase className="h-4 w-4 text-sky-600"/></div>
          <div className="text-3xl font-extrabold mt-2">{services.length}</div>
          <div className="text-xs text-muted-foreground mt-1">{services.filter(s=>s.is_active).length} active</div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Total earnings</span><CreditCard className="h-4 w-4 text-emerald-600"/></div>
          <div className="text-3xl font-extrabold mt-2">{earnings ? formatPrice(earnings.total_earnings) : "—"}</div>
          <div className="text-xs text-muted-foreground mt-1">{earnings?.total_completed_payments || 0} completed payments</div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">This month</span><Star className="h-4 w-4 text-amber-500"/></div>
          <div className="text-3xl font-extrabold mt-2">{earnings ? formatPrice(earnings.this_month_earnings) : "—"}</div>
          <div className="text-xs text-muted-foreground mt-1">Pending: {earnings ? formatPrice(earnings.pending_amount) : "—"}</div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Recent bookings</CardTitle><Link to="/provider/bookings" className="text-sm font-semibold text-violet-600">View all →</Link></CardHeader>
          <CardContent className="space-y-3">
            {bookings.slice(0,3).length===0 ? <p className="text-sm text-muted-foreground">No bookings yet.</p> :
              bookings.slice(0,3).map(b=> (
                <div key={b.id} className="border rounded-xl p-3 flex items-center justify-between">
                  <div><div className="text-sm font-semibold">Booking #{b.id} • {b.booking_date}</div><div className="text-xs text-muted-foreground">{b.status} • {b.booking_time||"no time"}</div></div>
                  <Badge variant={b.status==="PENDING"?"warning":b.status==="ACCEPTED"?"info":"secondary"}>{b.status}</Badge>
                </div>
              ))
            }
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Quick actions</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Link to="/provider/services" className="rounded-2xl border p-4 hover:bg-muted/40"><div className="h-9 w-9 rounded-xl bg-violet-100 grid place-items-center"><Briefcase className="h-5 w-5 text-violet-600"/></div><div className="text-sm font-semibold mt-2">Manage services</div><div className="text-xs text-muted-foreground">Create & edit listings</div></Link>
            <Link to="/provider/availability" className="rounded-2xl border p-4 hover:bg-muted/40"><div className="h-9 w-9 rounded-xl bg-emerald-100 grid place-items-center"><Clock className="h-5 w-5 text-emerald-600"/></div><div className="text-sm font-semibold mt-2">Set availability</div><div className="text-xs text-muted-foreground">Weekly time slots</div></Link>
            <Link to="/provider/bookings" className="rounded-2xl border p-4 hover:bg-muted/40"><div className="h-9 w-9 rounded-xl bg-sky-100 grid place-items-center"><Calendar className="h-5 w-5 text-sky-600"/></div><div className="text-sm font-semibold mt-2">Handle bookings</div><div className="text-xs text-muted-foreground">Accept / complete</div></Link>
            <Link to="/provider/earnings" className="rounded-2xl border p-4 hover:bg-muted/40"><div className="h-9 w-9 rounded-xl bg-amber-100 grid place-items-center"><CreditCard className="h-5 w-5 text-amber-600"/></div><div className="text-sm font-semibold mt-2">Earnings</div><div className="text-xs text-muted-foreground">Track revenue</div></Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
