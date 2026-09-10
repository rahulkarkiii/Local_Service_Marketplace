import { useEffect, useState } from "react"
import client from "../../api/client"
import useAuthStore from "../../stores/authStore"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input, Textarea, Label } from "../../components/ui/input"
import { Badge } from "../../components/ui/badge"

export default function ProviderProfile() {
  const { user } = useAuthStore()
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({ business_name:"", bio:"", experience_years:0, phone:"", address:"", latitude:"", longitude:"" })
  const [msg, setMsg] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  const fetch = async () => {
    setLoading(true)
    try {
      const res = await client.get("/providers/")
      const arr = Array.isArray(res.data)?res.data:res.data.results||[]
      const mine = arr.find(p=> String(p.account)===String(user?.id))
      if (mine) {
        setProfile(mine)
        setForm({
          business_name: mine.business_name||"",
          bio: mine.bio||"",
          experience_years: mine.experience_years||0,
          phone: mine.phone||"",
          address: mine.address||"",
          latitude: mine.latitude||"",
          longitude: mine.longitude||"",
        })
      }
    } catch {} finally { setLoading(false) }
  }
  useEffect(()=>{ if(user) fetch() }, [user])

  const save = async (e) => {
    e.preventDefault()
    setMsg(""); setError("")
    const payload = {
      business_name: form.business_name,
      bio: form.bio,
      experience_years: Number(form.experience_years),
      phone: form.phone,
      address: form.address,
    }
    if (form.latitude) payload.latitude = String(form.latitude)
    if (form.longitude) payload.longitude = String(form.longitude)

    try {
      if (profile) {
        const res = await client.patch(`/providers/${profile.id}/`, payload)
        setProfile(res.data)
        setMsg("Profile updated. " + (res.data.geocoding_warning || ""))
      } else {
        const res = await client.post("/providers/", payload)
        setProfile(res.data)
        setMsg("Profile created. " + (res.data.geocoding_warning || "Awaiting admin verification."))
      }
    } catch (err) {
      const d = err.response?.data
      setError(typeof d==="string"?d: JSON.stringify(d, null, 2))
    }
  }

  if (loading) return <div className="text-sm text-muted-foreground">Loading…</div>

  return (
    <div className="space-y-6 max-w-[720px]">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Provider Profile</h1>
        <p className="text-muted-foreground mt-1">Business profile with auto-geocoding via OpenStreetMap. Latitude/longitude optional — will be inferred from address.</p>
      </div>

      {profile && (
        <Card className="p-4 flex items-center justify-between">
          <div className="text-sm">
            <div className="font-semibold">{profile.business_name} <Badge variant={profile.is_verified?"success":"secondary"} className="ml-2">{profile.is_verified?"Verified":"Pending verification"}</Badge></div>
            <div className="text-muted-foreground">{profile.address} • {profile.phone}</div>
            {profile.latitude && profile.longitude && <div className="text-xs text-muted-foreground">📍 {profile.latitude}, {profile.longitude} {profile.distance_km!==undefined ? `• ${profile.distance_km} km`:""}</div>}
          </div>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">{profile?"Edit profile":"Create provider profile"}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={save} className="space-y-4">
            <div>
              <Label>Business name *</Label>
              <Input value={form.business_name} onChange={e=>setForm({...form, business_name:e.target.value})} required placeholder="e.g. Rajesh Electrical Works" className="mt-1.5" />
            </div>
            <div>
              <Label>Bio</Label>
              <Textarea value={form.bio} onChange={e=>setForm({...form, bio:e.target.value})} placeholder="Experience, specialties..." className="mt-1.5" />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label>Experience (years)</Label>
                <Input type="number" value={form.experience_years} onChange={e=>setForm({...form, experience_years:e.target.value})} className="mt-1.5" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} placeholder="98xxxxxxxx" className="mt-1.5" />
              </div>
            </div>
            <div>
              <Label>Address</Label>
              <Input value={form.address} onChange={e=>setForm({...form, address:e.target.value})} placeholder="Thamel, Kathmandu" className="mt-1.5" />
              <p className="text-xs text-muted-foreground mt-1">Used for geocoding to enable radius search for customers.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label>Latitude (optional)</Label>
                <Input value={form.latitude} onChange={e=>setForm({...form, latitude:e.target.value})} placeholder="27.7172" className="mt-1.5" />
              </div>
              <div>
                <Label>Longitude (optional)</Label>
                <Input value={form.longitude} onChange={e=>setForm({...form, longitude:e.target.value})} placeholder="85.3240" className="mt-1.5" />
              </div>
            </div>
            {msg && <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-3 whitespace-pre-wrap">{msg}</div>}
            {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 whitespace-pre-wrap">{error}</div>}
            <Button type="submit" className="rounded-xl bg-zinc-900 hover:bg-black">{profile?"Update profile":"Create profile"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
