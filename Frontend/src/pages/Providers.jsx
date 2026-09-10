import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { MapPin, Star, Search, Navigation, ShieldCheck, Briefcase } from "lucide-react"
import client from "../api/client"
import { Card, CardContent } from "../components/ui/card"
import { Input, Select } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Skeleton } from "../components/ui/skeleton"

export default function Providers() {
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ latitude:"", longitude:"", radius:"10", min_rating:"" })
  const [locStatus, setLocStatus] = useState("")

  const fetch = async (useFilters=false) => {
    setLoading(true)
    try {
      const q = new URLSearchParams()
      if (useFilters && filters.latitude && filters.longitude && filters.radius) {
        q.set("latitude", filters.latitude)
        q.set("longitude", filters.longitude)
        q.set("radius", filters.radius)
      }
      if (filters.min_rating) q.set("min_rating", filters.min_rating)
      const res = await client.get(`/providers/?${q.toString()}`)
      const data = Array.isArray(res.data) ? res.data : res.data.results || []
      setProviders(data)
    } catch { setProviders([]) } finally { setLoading(false) }
  }

  useEffect(()=>{ fetch(false) }, [])

  const useMyLocation = () => {
    if (!navigator.geolocation) { setLocStatus("Geolocation not supported"); return }
    setLocStatus("Locating…")
    navigator.geolocation.getCurrentPosition(
      pos => {
        setFilters(f=> ({...f, latitude: pos.coords.latitude.toFixed(6), longitude: pos.coords.longitude.toFixed(6)}))
        setLocStatus(`Found: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`)
      },
      ()=> setLocStatus("Failed to get location")
    )
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-8">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-extrabold tracking-tight">Find providers near you</h1>
        <p className="text-muted-foreground mt-2">Location-based radius search using real geocoding. Find verified pros within your area.</p>
      </div>

      <Card className="mt-6 p-5">
        <div className="grid md:grid-cols-5 gap-3">
          <div>
            <label className="text-sm font-medium">Latitude</label>
            <Input value={filters.latitude} onChange={e=>setFilters({...filters, latitude:e.target.value})} placeholder="27.7172" className="mt-1.5" />
          </div>
          <div>
            <label className="text-sm font-medium">Longitude</label>
            <Input value={filters.longitude} onChange={e=>setFilters({...filters, longitude:e.target.value})} placeholder="85.3240" className="mt-1.5" />
          </div>
          <div>
            <label className="text-sm font-medium">Radius (km)</label>
            <Select value={filters.radius} onChange={e=>setFilters({...filters, radius:e.target.value})} className="mt-1.5">
              <option value="5">5 km</option>
              <option value="10">10 km</option>
              <option value="25">25 km</option>
              <option value="50">50 km</option>
              <option value="100">100 km</option>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Min rating</label>
            <Select value={filters.min_rating} onChange={e=>setFilters({...filters, min_rating:e.target.value})} className="mt-1.5">
              <option value="">Any</option>
              <option value="4.5">4.5+</option>
              <option value="4">4.0+</option>
              <option value="3">3.0+</option>
            </Select>
          </div>
          <div className="flex items-end gap-2">
            <Button onClick={()=>fetch(true)} className="flex-1 rounded-xl bg-zinc-900 hover:bg-black gap-1.5"><Search className="h-4 w-4"/> Search</Button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={useMyLocation} className="rounded-xl gap-1.5"><Navigation className="h-3.5 w-3.5"/> Use my location</Button>
          <Button variant="ghost" size="sm" onClick={()=>fetch(false)} className="rounded-xl">Clear location filter</Button>
          {locStatus && <span className="text-xs text-muted-foreground">{locStatus}</span>}
          <span className="text-xs text-muted-foreground ml-auto">Tip: Try Kathmandu (27.7172, 85.3240) for demo data</span>
        </div>
      </Card>

      <div className="mt-6">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3,4,5,6].map(i=> <Card key={i} className="p-5 space-y-3"><Skeleton className="h-20"/><Skeleton className="h-4 w-3/4"/></Card>)}
          </div>
        ) : providers.length===0 ? (
          <Card className="p-12 text-center">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-zinc-100 grid place-items-center text-2xl">📍</div>
            <h3 className="font-semibold mt-4">No providers found</h3>
            <p className="text-sm text-muted-foreground mt-1">Try a larger radius or clear the location filter.</p>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {providers.map(p=> (
              <Card key={p.id} className="p-5 hover:shadow-medium hover:-translate-y-1 transition-all">
                <div className="flex gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 grid place-items-center text-white font-bold text-lg shrink-0">
                    {p.business_name?.[0]?.toUpperCase() || "P"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold leading-tight truncate">{p.business_name}</h3>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 truncate"><MapPin className="h-3 w-3"/>{p.address || "Address not set"}</div>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {p.is_verified ? <Badge variant="success" className="gap-1"><ShieldCheck className="h-3 w-3"/> Verified</Badge> : <Badge variant="secondary">Unverified</Badge>}
                      {p.distance_km !== undefined && <Badge variant="outline" className="rounded-full">{p.distance_km} km away</Badge>}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-3 min-h-[40px]">{p.bio || "Experienced professional ready to help you."}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm">
                    {p.average_rating ? <span className="flex items-center gap-1 font-bold"><Star className="h-4 w-4 fill-amber-400 text-amber-400"/>{p.average_rating}</span> : <span className="text-muted-foreground text-xs">No ratings</span>}
                    {p.review_count ? <span className="text-xs text-muted-foreground">({p.review_count} reviews)</span> : null}
                    <span className="text-xs flex items-center gap-1"><Briefcase className="h-3 w-3"/>{p.experience_years} yrs</span>
                  </div>
                  <Link to={`/providers/${p.id}`} className="text-sm font-semibold text-violet-600 hover:underline">View →</Link>
                </div>
                {p.phone && <div className="mt-2 text-xs text-muted-foreground">📞 {p.phone}</div>}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
