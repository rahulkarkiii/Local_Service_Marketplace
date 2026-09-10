import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, MapPin, Star, ShieldCheck, Briefcase, Phone, Mail, Clock } from "lucide-react"
import client from "../api/client"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Skeleton } from "../components/ui/skeleton"
import { formatPrice } from "../lib/utils"

export default function ProviderDetail() {
  const { id } = useParams()
  const [provider, setProvider] = useState(null)
  const [services, setServices] = useState([])
  const [availability, setAvailability] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=> {
    const run = async () => {
      try {
        const res = await client.get(`/providers/${id}/`)
        setProvider(res.data)
        const [svcRes, availRes] = await Promise.all([
          client.get(`/services/`).catch(()=>({data:[]})),
          client.get(`/providers/availability/?provider=${id}`).catch(()=>({data:[]})),
        ])
        const allSvc = Array.isArray(svcRes.data) ? svcRes.data : svcRes.data.results || []
        setServices(allSvc.filter(s=> String(s.provider)===String(res.data.account) ))
        const av = Array.isArray(availRes.data) ? availRes.data : availRes.data.results || []
        setAvailability(av)
      } catch {} finally { setLoading(false) }
    }
    run()
  }, [id])

  if (loading) return <div className="mx-auto max-w-[1080px] px-4 py-8"><Skeleton className="h-64"/></div>
  if (!provider) return <div className="mx-auto max-w-[1080px] px-4 py-12 text-center">Provider not found.</div>

  const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]

  return (
    <div className="mx-auto max-w-[1080px] px-4 sm:px-6 py-6">
      <Link to="/providers" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="h-4 w-4"/> Back to providers</Link>

      <Card className="overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-violet-600 to-indigo-600" />
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="h-20 w-20 rounded-3xl bg-white shadow-xl border grid place-items-center text-2xl font-black -mt-12 sm:-mt-16 shrink-0">
              {provider.business_name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="page-title">{provider.business_name}</h1>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    {provider.is_verified ? <Badge variant="success" className="gap-1"><ShieldCheck className="h-3 w-3"/> Verified</Badge> : <Badge variant="secondary">Unverified</Badge>}
                    {provider.average_rating && <span className="flex items-center gap-1 text-sm font-bold"><Star className="h-4 w-4 fill-amber-400 text-amber-400"/>{provider.average_rating} <span className="font-normal text-muted-foreground">({provider.review_count} reviews)</span></span>}
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground flex flex-wrap gap-3">
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4"/>{provider.address || "—"}</span>
                    <span className="flex items-center gap-1"><Briefcase className="h-4 w-4"/>{provider.experience_years} years experience</span>
                    {provider.phone && <span className="flex items-center gap-1"><Phone className="h-4 w-4"/>{provider.phone}</span>}
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mt-4 max-w-2xl">{provider.bio || "This provider hasn't added a bio yet."}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6 mt-6">
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Services offered ({services.length})</CardTitle></CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              {services.length===0 ? <p className="text-sm text-muted-foreground col-span-2">No services listed yet.</p> :
                services.map(s=> (
                  <Link key={s.id} to={`/services/${s.id}`} className="border rounded-2xl p-4 hover:shadow-sm hover:border-violet-200 transition-colors">
                    <div className="text-sm font-semibold line-clamp-2">{s.title}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2 mt-1">{s.description}</div>
                    <div className="mt-2 flex items-center justify-between"><span className="font-extrabold">{formatPrice(s.price)}</span><span className="text-xs text-muted-foreground">{s.duration} min • {s.location}</span></div>
                  </Link>
                ))
              }
            </CardContent>
          </Card>
        </div>
        <Card className="h-fit">
          <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5"/> Availability</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {availability.length===0 ? <p className="text-sm text-muted-foreground">No availability set.</p> :
              availability.map(a=> (
                <div key={a.id} className="flex items-center justify-between border rounded-xl px-3 py-2 text-sm">
                  <span className="font-medium">{days[a.weekday] || a.weekday_display || `Day ${a.weekday}`}</span>
                  <span className="text-muted-foreground">{a.start_time} – {a.end_time}</span>
                </div>
              ))
            }
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
