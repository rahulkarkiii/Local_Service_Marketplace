import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { Search, MapPin, Star, ShieldCheck, Clock, CreditCard, ArrowRight, Wrench, Zap, GraduationCap, Paintbrush, Scissors, Truck, HeartPulse, Check } from "lucide-react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import client from "../api/client"
import { formatPrice } from "../lib/utils"

const categories = [
  { name: "Plumbing", icon: Wrench, color: "bg-blue-500" },
  { name: "Electrical", icon: Zap, color: "bg-amber-500" },
  { name: "Tutoring", icon: GraduationCap, color: "bg-violet-500" },
  { name: "Cleaning", icon: Paintbrush, color: "bg-emerald-500" },
  { name: "Beauty", icon: Scissors, color: "bg-pink-500" },
  { name: "Moving", icon: Truck, color: "bg-orange-500" },
  { name: "Health", icon: HeartPulse, color: "bg-red-500" },
]

export default function Home() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [location, setLocation] = useState("")

  const fetchFeatured = async () => {
    setLoading(true)
    setError("")
    try {
      const r = await client.get("/services/")
      const data = Array.isArray(r.data) ? r.data : r.data.results || []
      setServices(data.slice(0, 6))
    } catch (err) {
      setError("Unable to load featured services. Please try again later.")
      setServices([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFeatured()
  }, [])

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-zinc-900 via-zinc-900 to-violet-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(120,90,255,0.25),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,_rgba(255,255,255,0.06)_1px,_transparent_1px),linear-gradient(to_bottom,_rgba(255,255,255,0.06)_1px,_transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 py-16 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6 animate-fade-in">
              <Badge className="bg-white/10 text-white border-white/20 backdrop-blur rounded-full px-3 py-1 gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> 2,400+ verified providers across Nepal
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold leading-[0.95] tracking-tight text-balance">
                Find trusted<br />
                <span className="bg-gradient-to-r from-violet-400 to-indigo-300 bg-clip-text text-transparent">local experts</span><br />
                in minutes
              </h1>
              <p className="text-lg text-zinc-300 max-w-xl leading-relaxed">
                Book plumbers, electricians, tutors & more. Verified profiles, upfront pricing, and secure Khalti payments — all in one place.
              </p>

              {/* Search bar */}
              <div className="bg-white rounded-2xl p-2 shadow-2xl flex flex-col sm:flex-row gap-2 max-w-[560px]">
                <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-50 border">
                  <Search className="h-4 w-4 text-zinc-500 shrink-0" />
                  <input
                    value={search}
                    onChange={e=>setSearch(e.target.value)}
                    placeholder="What service do you need?"
                    className="flex-1 bg-transparent outline-none text-sm text-zinc-900 placeholder:text-zinc-500"
                  />
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-50 border sm:w-[180px]">
                  <MapPin className="h-4 w-4 text-zinc-500 shrink-0" />
                  <input
                    value={location}
                    onChange={e=>setLocation(e.target.value)}
                    placeholder="Kathmandu"
                    className="flex-1 bg-transparent outline-none text-sm text-zinc-900 placeholder:text-zinc-500"
                  />
                </div>
                <Link to={`/services?search=${encodeURIComponent(search)}&location=${encodeURIComponent(location)}`} className="shrink-0">
                  <Button size="lg" className="w-full sm:w-auto rounded-xl bg-violet-600 hover:bg-violet-700 text-white h-[44px] px-6">
                    Search <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-400">
                <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-400"/> Verified pros</span>
                <span className="h-3 w-px bg-white/20" />
                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-sky-400"/> Same-day booking</span>
                <span className="h-3 w-px bg-white/20" />
                <span className="flex items-center gap-1.5"><CreditCard className="h-4 w-4 text-amber-400"/> Khalti secured</span>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="relative rounded-[28px] overflow-hidden bg-gradient-to-br from-white to-zinc-100 p-2 shadow-2xl rotate-[-1deg]">
                <div className="rounded-[20px] overflow-hidden bg-white">
                  <div className="h-[420px] bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-6 flex flex-col">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-zinc-900 grid place-items-center"><Wrench className="h-4 w-4 text-white"/></div>
                        <span className="font-semibold text-zinc-900">Top rated this week</span>
                      </div>
                      <Badge variant="success" className="rounded-full">Live</Badge>
                    </div>
                    <div className="mt-6 space-y-3">
                      {[
                        { name: "Rajesh • Electrician", rating: "4.9", jobs: "312 jobs", price: "Rs. 1,200/hr", img: "⚡" },
                        { name: "Sita • Plumbing Expert", rating: "4.8", jobs: "198 jobs", price: "Rs. 900/hr", img: "🔧" },
                        { name: "Amit • Math Tutor", rating: "5.0", jobs: "88 jobs", price: "Rs. 1,500/hr", img: "📚" },
                      ].map((p,i)=> (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border bg-white shadow-sm">
                          <div className="h-11 w-11 rounded-xl bg-zinc-100 grid place-items-center text-xl">{p.img}</div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold truncate">{p.name}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1"><Star className="h-3 w-3 fill-amber-400 text-amber-400"/>{p.rating} • {p.jobs}</div>
                          </div>
                          <div className="text-sm font-bold text-violet-600">{p.price}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-auto p-3 rounded-2xl bg-zinc-900 text-white flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold">Next available slot</div>
                        <div className="text-xs text-zinc-400">Today, 3:00 PM • Kathmandu</div>
                      </div>
                      <Button size="sm" className="rounded-xl bg-white text-zinc-900 hover:bg-zinc-100">Book now</Button>
                    </div>
                  </div>
                </div>
              </div>
              {/* floating badges */}
              <div className="absolute -left-6 top-10 bg-white rounded-2xl shadow-xl border p-3 flex items-center gap-2.5 animate-slide-up">
                <div className="h-9 w-9 rounded-xl bg-emerald-100 grid place-items-center"><Check className="h-5 w-5 text-emerald-600"/></div>
                <div><div className="text-sm font-bold leading-none">Booking confirmed</div><div className="text-xs text-muted-foreground">Electrician • 2:30 PM</div></div>
              </div>
              <div className="absolute -right-2 bottom-6 bg-white rounded-2xl shadow-xl border p-3 animate-slide-up" style={{animationDelay:"0.15s"}}>
                <div className="text-xs text-muted-foreground">Average rating</div>
                <div className="text-2xl font-extrabold flex items-center gap-1">4.9 <Star className="h-5 w-5 fill-amber-400 text-amber-400"/></div>
                <div className="text-xs text-muted-foreground">from 12,480 reviews</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-[1280px] px-4 sm:px-6 py-12">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Popular categories</h2>
            <p className="text-sm text-muted-foreground mt-1">Choose from 40+ services — all verified and reviewed</p>
          </div>
          <Link to="/services" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-violet-600 hover:gap-2 transition-all">View all <ArrowRight className="h-4 w-4"/></Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {categories.map(c=> (
            <Link key={c.name} to={`/services?category=${encodeURIComponent(c.name)}`} className="group">
              <Card className="hover:shadow-medium hover:-translate-y-1 transition-all duration-200 p-4 text-center">
                <div className={`mx-auto h-12 w-12 rounded-2xl ${c.color} grid place-items-center text-white shadow-sm group-hover:scale-110 transition-transform`}>
                  <c.icon className="h-6 w-6" />
                </div>
                <div className="mt-3 text-sm font-semibold">{c.name}</div>
                <div className="text-xs text-muted-foreground">120+ pros</div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured services */}
      <section className="mx-auto max-w-[1280px] px-4 sm:px-6 pb-12">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Featured services</h2>
            <p className="text-sm text-muted-foreground mt-1">Handpicked, highly-rated professionals near you</p>
          </div>
          <Link to="/services" className="text-sm font-semibold text-violet-600 inline-flex items-center gap-1 hover:gap-2 transition-all">Browse all <ArrowRight className="h-4 w-4"/></Link>
        </div>
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i=> <Card key={i} className="p-6 animate-pulse"><div className="h-24 bg-zinc-100 rounded-xl"/><div className="h-4 bg-zinc-100 rounded mt-4 w-3/4"/><div className="h-3 bg-zinc-100 rounded mt-2 w-1/2"/></Card>)}
          </div>
        ) : error ? (
          <Card className="p-8 text-center">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-red-50 grid place-items-center text-xl">⚠️</div>
            <h3 className="font-semibold mt-4">Failed to load featured services</h3>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
            <Button onClick={fetchFeatured} variant="outline" className="mt-4 rounded-xl">Try again</Button>
          </Card>
        ) : services.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-zinc-100 grid place-items-center text-2xl">✨</div>
            <h3 className="font-semibold mt-4">No featured services available yet</h3>
            <p className="text-sm text-muted-foreground mt-1">Check back soon — our providers are adding new services every day.</p>
            <Link to="/services"><Button variant="outline" className="mt-4 rounded-xl">Browse all services</Button></Link>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map(s=> (
              <Link key={s.id} to={`/services/${s.id}`} className="group">
                <Card className="overflow-hidden hover:shadow-medium hover:-translate-y-1 transition-all duration-200 h-full flex flex-col">
                  <div className="h-40 bg-gradient-to-br from-violet-50 to-indigo-50 relative overflow-hidden">
                    <div className="absolute inset-0 grid place-items-center">
                      <div className="h-16 w-16 rounded-2xl bg-white shadow-sm grid place-items-center text-2xl">🛠️</div>
                    </div>
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-white text-zinc-900 shadow-sm rounded-full">{s.category_detail?.name || "Service"}</Badge>
                    </div>
                    {s.average_rating && (
                      <div className="absolute top-3 right-3 bg-zinc-900 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400"/> {s.average_rating}
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold leading-tight line-clamp-2 group-hover:text-violet-600 transition-colors">{s.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1 flex-1">{s.description}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-lg font-extrabold tracking-tight">{formatPrice(s.price)}</div>
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3"/>{s.location}</span>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3"/>{s.duration} min</span>
                      {s.review_count ? <span>• {s.review_count} reviews</span> : null}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-white border-y">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-16">
          <div className="text-center max-w-2xl mx-auto">
            <Badge variant="secondary" className="rounded-full">How it works</Badge>
            <h2 className="text-3xl font-extrabold tracking-tight mt-3">Book a pro in 3 simple steps</h2>
            <p className="text-muted-foreground mt-2">Fast, transparent, and secure — from search to payment.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mt-10">
            {[
              { step:"01", title:"Search & compare", desc:"Filter by category, price, location and ratings. View verified profiles and real reviews.", icon: Search },
              { step:"02", title:"Book instantly", desc:"Pick a date & time that works. Providers confirm within minutes, with automated reminders.", icon: Clock },
              { step:"03", title:"Pay securely", desc:"Complete your service and pay via Khalti — verified server-side, never client-trusted.", icon: CreditCard },
            ].map(item=> (
              <Card key={item.step} className="p-6 relative overflow-hidden">
                <div className="absolute -right-6 -top-6 text-[84px] font-black text-zinc-100 leading-none select-none">{item.step}</div>
                <div className="relative">
                  <div className="h-11 w-11 rounded-xl bg-zinc-900 text-white grid place-items-center"><item.icon className="h-5 w-5"/></div>
                  <h3 className="font-bold text-lg mt-4">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="mx-auto max-w-[1280px] px-4 sm:px-6 py-16">
        <div className="rounded-[28px] bg-zinc-900 text-white p-8 sm:p-10 flex flex-col lg:flex-row items-center gap-8 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-transparent" />
          <div className="relative flex-1">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Are you a skilled professional?</h3>
            <p className="text-zinc-300 mt-2 max-w-xl">Join SewaNepal, get verified, and start receiving bookings. Set your own prices, manage availability, and get paid directly.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/register"><Button size="lg" className="rounded-xl bg-white text-zinc-900 hover:bg-zinc-100">Become a provider <ArrowRight className="h-4 w-4"/></Button></Link>
              <Link to="/providers"><Button variant="outline" size="lg" className="rounded-xl bg-transparent border-white/20 text-white hover:bg-white/10">Learn more</Button></Link>
            </div>
          </div>
          <div className="relative grid grid-cols-3 gap-4 text-center">
            {[
              { k: "NPR 45K+", v: "Avg monthly earnings" },
              { k: "4.8/5", v: "Provider satisfaction" },
              { k: "24h", v: "Avg payout time" },
            ].map(s=> (
              <div key={s.k} className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10">
                <div className="text-xl font-extrabold">{s.k}</div>
                <div className="text-xs text-zinc-300">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
