import { useEffect, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { MapPin, Star, Clock, ShieldCheck, ArrowLeft, Calendar, User, MessageSquare } from "lucide-react"
import client from "../api/client"
import useAuthStore from "../stores/authStore"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Input, Textarea } from "../components/ui/input"
import { Skeleton } from "../components/ui/skeleton"
import { formatPrice, formatDate } from "../lib/utils"

export default function ServiceDetail() {
  const { id } = useParams()
  const [service, setService] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [bookingDate, setBookingDate] = useState("")
  const [bookingTime, setBookingTime] = useState("")
  const [notes, setNotes] = useState("")
  const [bookingLoading, setBookingLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const { user, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  useEffect(()=> {
    const fetch = async () => {
      try {
        const res = await client.get(`/services/${id}/`)
        setService(res.data)
        const rev = await client.get(`/reviews/`).then(r=> {
          const arr = Array.isArray(r.data) ? r.data : r.data.results || []
          return arr.filter(x=> x.service === Number(id))
        }).catch(()=>[])
        setReviews(rev)
      } catch {} finally { setLoading(false) }
    }
    fetch()
  }, [id])

  const handleBook = async (e) => {
    e.preventDefault()
    setError(""); setSuccess("")
    if (!isAuthenticated()) { navigate("/login"); return }
    if (user?.role !== "CUSTOMER") { setError("Only customers can book services. Please log in as a customer."); return }
    if (!bookingDate) { setError("Please select a booking date."); return }
    setBookingLoading(true)
    try {
      const res = await client.post("/bookings/", {
        service: Number(id),
        booking_date: bookingDate,
        booking_time: bookingTime || null,
        notes,
      })
      setSuccess("Booking request sent! The provider will accept or reject shortly.")
      setNotes("")
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.non_field_errors?.[0] || JSON.stringify(err.response?.data) || "Booking failed. Provider may be unavailable at that time."
      setError(typeof msg === "string" ? msg : JSON.stringify(msg))
    } finally { setBookingLoading(false) }
  }

  if (loading) {
    return <div className="mx-auto max-w-[1080px] px-4 sm:px-6 py-8 space-y-4"><Skeleton className="h-64"/><Skeleton className="h-32"/></div>
  }
  if (!service) return <div className="mx-auto max-w-[1080px] px-4 py-12 text-center">Service not found. <Link to="/services" className="text-violet-600 underline">Browse services</Link></div>

  return (
    <div className="mx-auto max-w-[1080px] px-4 sm:px-6 py-6">
      <Link to="/services" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="h-4 w-4"/> Back to services</Link>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="h-64 bg-gradient-to-br from-violet-100 via-indigo-50 to-white grid place-items-center relative">
              <div className="h-20 w-20 rounded-3xl bg-white shadow-xl grid place-items-center text-3xl">🛠️</div>
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge className="bg-white text-zinc-900 rounded-full shadow">{service.category_detail?.name}</Badge>
                <Badge variant={service.is_active ? "success":"secondary"}>{service.is_active?"Active":"Inactive"}</Badge>
              </div>
              {service.average_rating && <div className="absolute top-4 right-4 bg-zinc-900 text-white px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5"><Star className="h-4 w-4 fill-amber-400 text-amber-400"/>{service.average_rating} <span className="font-normal text-zinc-300">({service.review_count})</span></div>}
            </div>
            <CardContent className="p-6">
              <h1 className="text-2xl font-extrabold tracking-tight">{service.title}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4"/>{service.location}</span>
                <span className="flex items-center gap-1"><Clock className="h-4 w-4"/>{service.duration} minutes</span>
                <span className="flex items-center gap-1"><User className="h-4 w-4"/> Provider #{service.provider}</span>
                {service.created_at && <span>• Listed {formatDate(service.created_at)}</span>}
              </div>
              <div className="mt-4 flex items-baseline gap-3">
                <div className="text-3xl font-extrabold tracking-tight">{formatPrice(service.price)}</div>
                <div className="text-sm text-muted-foreground">per service • duration {service.duration} min</div>
              </div>
              <div className="mt-6">
                <h3 className="font-semibold">About this service</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mt-2 whitespace-pre-wrap">{service.description}</p>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"><ShieldCheck className="h-3.5 w-3.5"/> Verified provider</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200"><Clock className="h-3.5 w-3.5"/> Quick response</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5"/> Reviews ({reviews.length})</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {reviews.length===0 ? <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review after a completed booking.</p> :
                reviews.map(r=> (
                  <div key={r.id} className="border rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-zinc-900 text-white grid place-items-center text-xs font-bold">{r.customer}</div>
                        <span className="text-sm font-semibold">Customer #{r.customer}</span>
                      </div>
                      <span className="flex items-center gap-1 text-sm font-bold"><Star className="h-4 w-4 fill-amber-400 text-amber-400"/>{r.rating}/5</span>
                    </div>
                    <p className="text-sm mt-2">{r.comment || "No comment."}</p>
                    <div className="text-xs text-muted-foreground mt-1">{formatDate(r.created_at)}</div>
                  </div>
                ))
              }
            </CardContent>
          </Card>
        </div>

        <div className="lg:sticky lg:top-[80px] space-y-4">
          <Card className="shadow-medium">
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5"/> Book this service</CardTitle><p className="text-sm text-muted-foreground">Choose a date & time. Provider will confirm.</p></CardHeader>
            <CardContent>
              <form onSubmit={handleBook} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Booking date *</label>
                  <Input type="date" value={bookingDate} onChange={e=>setBookingDate(e.target.value)} className="mt-1.5" min={new Date().toISOString().split("T")[0]} />
                </div>
                <div>
                  <label className="text-sm font-medium">Booking time (optional)</label>
                  <Input type="time" value={bookingTime} onChange={e=>setBookingTime(e.target.value)} className="mt-1.5" />
                  <p className="text-xs text-muted-foreground mt-1">Must be within provider's availability.</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Notes</label>
                  <Textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Describe the issue, address details, etc." className="mt-1.5" />
                </div>
                {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</div>}
                {success && <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-3">{success}</div>}
                <Button type="submit" disabled={bookingLoading} className="w-full rounded-xl bg-violet-600 hover:bg-violet-700 h-11 text-base">
                  {bookingLoading ? "Booking..." : "Request booking"}
                </Button>
                <p className="text-xs text-center text-muted-foreground">No payment required now. Pay after acceptance via Khalti.</p>
              </form>
            </CardContent>
          </Card>

          <Card className="p-4 bg-zinc-900 text-white border-0">
            <h4 className="font-semibold">Why book on SewaNepal?</h4>
            <ul className="mt-3 space-y-2 text-sm text-zinc-300">
              <li className="flex gap-2"><ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0"/> Verified & reviewed providers</li>
              <li className="flex gap-2"><Clock className="h-4 w-4 text-sky-400 shrink-0"/> Instant confirmation & reminders</li>
              <li className="flex gap-2"><Star className="h-4 w-4 text-amber-400 shrink-0"/> Secure Khalti payments, server-verified</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}
