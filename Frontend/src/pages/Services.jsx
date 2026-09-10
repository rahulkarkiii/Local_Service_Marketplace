import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { Search, SlidersHorizontal, MapPin, Star, Clock, X } from "lucide-react"
import client from "../api/client"
import { Card, CardContent } from "../components/ui/card"
import { Input, Select } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Skeleton } from "../components/ui/skeleton"
import { formatPrice } from "../lib/utils"

export default function Services() {
  const [params, setParams] = useSearchParams()
  const [services, setServices] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: params.get("category") || "",
    min_price: params.get("min_price") || "",
    max_price: params.get("max_price") || "",
    location: params.get("location") || "",
    min_rating: params.get("min_rating") || "",
    search: params.get("search") || "",
  })

  const fetchCategories = async () => {
    try {
      const res = await client.get("/services/categories/")
      setCategories(Array.isArray(res.data) ? res.data : res.data.results || [])
    } catch {}
  }

  const fetchServices = async () => {
    setLoading(true)
    try {
      const q = new URLSearchParams()
      if (filters.category) {
        const cat = categories.find(c=> String(c.name).toLowerCase() === filters.category.toLowerCase() || String(c.id)===filters.category)
        if (cat) q.set("category", cat.id)
      }
      if (filters.min_price) q.set("min_price", filters.min_price)
      if (filters.max_price) q.set("max_price", filters.max_price)
      if (filters.location) q.set("location", filters.location)
      if (filters.min_rating) q.set("min_rating", filters.min_rating)
      const res = await client.get(`/services/?${q.toString()}`)
      let data = Array.isArray(res.data) ? res.data : res.data.results || []
      if (filters.search) {
        const s = filters.search.toLowerCase()
        data = data.filter(x=> x.title.toLowerCase().includes(s) || x.description.toLowerCase().includes(s) || x.location.toLowerCase().includes(s))
      }
      setServices(data)
    } catch {
      setServices([])
    } finally { setLoading(false) }
  }

  useEffect(()=>{ fetchCategories() }, [])
  useEffect(()=>{ if(categories.length) fetchServices(); else fetchServices() }, [categories.length])
  // keep url in sync not needed

  const apply = () => fetchServices()
  const clear = () => {
    setFilters({ category:"", min_price:"", max_price:"", location:"", min_rating:"", search:"" })
    setTimeout(()=>fetchServices(),0)
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters */}
        <div className="lg:w-[300px] shrink-0">
          <div className="lg:sticky lg:top-[80px] space-y-4">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2"><SlidersHorizontal className="h-4 w-4"/> Filters</h3>
                <button onClick={clear} className="text-xs font-medium text-violet-600 hover:underline flex items-center gap-1"><X className="h-3 w-3"/> Clear</button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Search</label>
                  <div className="relative mt-1.5">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400"/>
                    <Input value={filters.search} onChange={e=>setFilters({...filters, search:e.target.value})} placeholder="Plumber, tutor..." className="pl-9" />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select value={filters.category} onChange={e=>setFilters({...filters, category:e.target.value})} className="mt-1.5">
                    <option value="">All categories</option>
                    {categories.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Min price</label>
                    <Input type="number" value={filters.min_price} onChange={e=>setFilters({...filters, min_price:e.target.value})} placeholder="500" className="mt-1.5" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Max price</label>
                    <Input type="number" value={filters.max_price} onChange={e=>setFilters({...filters, max_price:e.target.value})} placeholder="5000" className="mt-1.5" />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Location</label>
                  <Input value={filters.location} onChange={e=>setFilters({...filters, location:e.target.value})} placeholder="Kathmandu, Pokhara..." className="mt-1.5" />
                </div>

                <div>
                  <label className="text-sm font-medium">Min rating</label>
                  <Select value={filters.min_rating} onChange={e=>setFilters({...filters, min_rating:e.target.value})} className="mt-1.5">
                    <option value="">Any rating</option>
                    <option value="4.5">4.5+ Excellent</option>
                    <option value="4">4.0+ Very good</option>
                    <option value="3">3.0+ Good</option>
                  </Select>
                </div>

                <Button onClick={apply} className="w-full rounded-xl bg-zinc-900 hover:bg-black">Apply filters</Button>
              </div>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-violet-600 to-indigo-600 text-white border-0">
              <h4 className="font-bold">Need help choosing?</h4>
              <p className="text-sm text-violet-100 mt-1">Our support team can recommend verified pros near you.</p>
              <Button variant="secondary" size="sm" className="mt-3 rounded-xl bg-white text-violet-700 hover:bg-zinc-100">Contact support</Button>
            </Card>
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h1 className="text-2xl font-extrabold tracking-tight">Services <span className="text-muted-foreground font-medium text-lg">({services.length})</span></h1>
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <span>Trusted • Verified • Secure</span>
            </div>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {[1,2,3,4,5,6].map(i=> <Card key={i} className="p-4 space-y-3"><Skeleton className="h-36 w-full"/><Skeleton className="h-4 w-3/4"/><Skeleton className="h-3 w-1/2"/></Card>)}
            </div>
          ) : services.length===0 ? (
            <Card className="p-12 text-center">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-zinc-100 grid place-items-center text-2xl">🔍</div>
              <h3 className="font-semibold mt-4">No services found</h3>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or search term.</p>
              <Button onClick={clear} variant="outline" className="mt-4 rounded-xl">Clear filters</Button>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {services.map(s=> (
                <Link key={s.id} to={`/services/${s.id}`} className="group">
                  <Card className="overflow-hidden hover:shadow-medium hover:-translate-y-1 transition-all h-full flex flex-col">
                    <div className="h-44 bg-gradient-to-br from-violet-50 via-white to-indigo-50 relative">
                      <div className="absolute inset-0 grid place-items-center">
                        <div className="h-14 w-14 rounded-2xl bg-white shadow grid place-items-center text-xl">🛠️</div>
                      </div>
                      <div className="absolute top-3 left-3 flex gap-2">
                        <Badge className="bg-white text-zinc-900 shadow rounded-full">{s.category_detail?.name || "Service"}</Badge>
                        {!s.is_active && <Badge variant="destructive">Inactive</Badge>}
                      </div>
                      {s.average_rating && <div className="absolute top-3 right-3 bg-zinc-900 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><Star className="h-3 w-3 fill-amber-400 text-amber-400"/>{s.average_rating}</div>}
                    </div>
                    <CardContent className="p-4 flex-1 flex flex-col">
                      <h3 className="font-semibold line-clamp-2 group-hover:text-violet-600 transition-colors leading-tight">{s.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1 flex-1">{s.description}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-[18px] font-extrabold">{formatPrice(s.price)}</div>
                        <span className="text-xs px-2 py-1 rounded-full bg-zinc-100 flex items-center gap-1"><MapPin className="h-3 w-3"/>{s.location}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3"/>{s.duration} min</span>
                        {s.review_count ? <span>• {s.review_count} reviews</span> : <span>• New</span>}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
