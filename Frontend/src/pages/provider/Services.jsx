import { useEffect, useState } from "react"
import client from "../../api/client"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input, Textarea, Select, Label } from "../../components/ui/input"
import { Badge } from "../../components/ui/badge"
import { formatPrice } from "../../lib/utils"

export default function ProviderServices() {
  const [services, setServices] = useState([])
  const [categories, setCategories] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title:"", description:"", category:"", price:"", duration:"60", location:"", is_active:true })
  const [msg, setMsg] = useState("")
  const [error, setError] = useState("")

  const fetch = async () => {
    try {
      const res = await client.get("/services/")
      setServices(Array.isArray(res.data)?res.data:res.data.results||[])
    } catch {}
  }
  const fetchCats = async () => {
    try {
      const res = await client.get("/services/categories/")
      setCategories(Array.isArray(res.data)?res.data:res.data.results||[])
    } catch {}
  }
  useEffect(()=>{ fetch(); fetchCats() }, [])

  const myServices = services // provider's services filtered server-side via token if implemented; show all for now with provider check

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(""); setMsg("")
    const payload = { ...form, category: Number(form.category), price: String(form.price), duration: Number(form.duration) }
    try {
      if (editing) {
        const res = await client.patch(`/services/${editing}/`, payload)
        setMsg("Service updated.")
        setEditing(null)
      } else {
        const res = await client.post("/services/", payload)
        setMsg("Service created.")
      }
      setForm({ title:"", description:"", category:"", price:"", duration:"60", location:"", is_active:true })
      fetch()
    } catch (err) {
      const d = err.response?.data
      setError(typeof d==="string"?d: JSON.stringify(d))
    }
  }

  const edit = (s) => {
    setEditing(s.id)
    setForm({ title:s.title, description:s.description, category:String(s.category), price:s.price, duration:String(s.duration), location:s.location, is_active:s.is_active })
    window.scrollTo({top:0, behavior:"smooth"})
  }

  const remove = async (id) => {
    if (!confirm("Delete this service?")) return
    try {
      await client.delete(`/services/${id}/`)
      fetch()
    } catch {}
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">My Services</h1>
        <p className="text-muted-foreground mt-1">Create listings. Requires verified provider profile (IsVerifiedProvider). Price and duration validated server-side.</p>
      </div>

      {msg && <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-3">{msg}</div>}
      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 whitespace-pre-wrap">{error}</div>}

      <Card>
        <CardHeader><CardTitle className="text-base">{editing ? `Edit service #${editing}` : "Create new service"}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label>Title *</Label>
              <Input value={form.title} onChange={e=>setForm({...form, title:e.target.value})} required placeholder="e.g. Emergency Plumbing Repair" className="mt-1.5" />
            </div>
            <div className="sm:col-span-2">
              <Label>Description *</Label>
              <Textarea value={form.description} onChange={e=>setForm({...form, description:e.target.value})} required placeholder="Describe your service, what's included..." className="mt-1.5" />
            </div>
            <div>
              <Label>Category *</Label>
              <Select value={form.category} onChange={e=>setForm({...form, category:e.target.value})} required className="mt-1.5">
                <option value="">Select category</option>
                {categories.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </div>
            <div>
              <Label>Price (NPR) *</Label>
              <Input type="number" step="0.01" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} required placeholder="1200" className="mt-1.5" />
            </div>
            <div>
              <Label>Duration (minutes) *</Label>
              <Input type="number" value={form.duration} onChange={e=>setForm({...form, duration:e.target.value})} required placeholder="60" className="mt-1.5" />
            </div>
            <div>
              <Label>Location *</Label>
              <Input value={form.location} onChange={e=>setForm({...form, location:e.target.value})} required placeholder="Kathmandu" className="mt-1.5" />
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input type="checkbox" checked={form.is_active} onChange={e=>setForm({...form, is_active:e.target.checked})} className="h-4 w-4 rounded" />
              <span className="text-sm font-medium">Active (visible to customers)</span>
            </div>
            <div className="sm:col-span-2 flex gap-2">
              <Button type="submit" className="rounded-xl">{editing ? "Update service" : "Create service"}</Button>
              {editing && <Button type="button" variant="outline" className="rounded-xl" onClick={()=>{setEditing(null); setForm({ title:"", description:"", category:"", price:"", duration:"60", location:"", is_active:true })}}>Cancel</Button>}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-2 gap-4">
        {myServices.length===0 ? <Card className="p-8 text-center text-sm text-muted-foreground sm:col-span-2">No services yet. Create your first listing above.</Card> :
          myServices.map(s=> (
            <Card key={s.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold leading-tight">{s.title}</h3>
                <Badge variant={s.is_active?"success":"secondary"}>{s.is_active?"Active":"Inactive"}</Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{s.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-extrabold">{formatPrice(s.price)}</span>
                <span className="text-xs text-muted-foreground">{s.duration} min • {s.location}</span>
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" className="rounded-xl" onClick={()=>edit(s)}>Edit</Button>
                <Button size="sm" variant="ghost" className="rounded-xl text-red-600 hover:bg-red-50" onClick={()=>remove(s.id)}>Delete</Button>
                <span className="ml-auto text-xs text-muted-foreground">#{s.id} • {s.category_detail?.name}</span>
              </div>
            </Card>
          ))
        }
      </div>
    </div>
  )
}
