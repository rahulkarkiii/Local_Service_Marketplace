import { useEffect, useState } from "react"
import client from "../../api/client"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input, Textarea, Label } from "../../components/ui/input"

export default function AdminCategories() {
  const [cats, setCats] = useState([])
  const [form, setForm] = useState({ name:"", slug:"", description:"", parent:"" })
  const [editing, setEditing] = useState(null)
  const [msg, setMsg] = useState("")
  const [error, setError] = useState("")

  const fetch = async () => {
    try {
      const res = await client.get("/services/categories/")
      setCats(Array.isArray(res.data)?res.data:res.data.results||[])
    } catch {}
  }
  useEffect(()=>{ fetch() }, [])

  const submit = async (e) => {
    e.preventDefault()
    setError(""); setMsg("")
    const payload = { name: form.name, slug: form.slug, description: form.description }
    if (form.parent) payload.parent = Number(form.parent)
    else payload.parent = null
    try {
      if (editing) {
        await client.patch(`/services/categories/${editing}/`, payload)
        setMsg("Category updated.")
        setEditing(null)
      } else {
        await client.post("/services/categories/", payload)
        setMsg("Category created.")
      }
      setForm({ name:"", slug:"", description:"", parent:"" })
      fetch()
    } catch (err) {
      const d = err.response?.data
      setError(typeof d==="string"?d: JSON.stringify(d, null, 2))
    }
  }

  const edit = (c) => {
    setEditing(c.id)
    setForm({ name:c.name, slug:c.slug, description:c.description||"", parent: c.parent?String(c.parent):"" })
    window.scrollTo({top:0, behavior:"smooth"})
  }
  const remove = async (id) => {
    if (!confirm("Delete category? Services using it will block deletion (PROTECT).")) return
    try { await client.delete(`/services/categories/${id}/`); fetch() } catch (e){ setError(JSON.stringify(e.response?.data)) }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Service Categories</h1>
        <p className="text-muted-foreground mt-1">Admin-only CRUD. Parent field enables subcategories (e.g. Plumbing → Pipe Repair).</p>
      </div>

      {msg && <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-3">{msg}</div>}
      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 whitespace-pre-wrap">{error}</div>}

      <Card>
        <CardHeader><CardTitle className="text-base">{editing?`Edit category #${editing}`:"Create category"}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Name *</Label>
              <Input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required placeholder="Plumbing" className="mt-1.5" />
            </div>
            <div>
              <Label>Slug *</Label>
              <Input value={form.slug} onChange={e=>setForm({...form, slug:e.target.value})} required placeholder="plumbing" className="mt-1.5" />
            </div>
            <div className="sm:col-span-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e=>setForm({...form, description:e.target.value})} placeholder="Category description..." className="mt-1.5" />
            </div>
            <div>
              <Label>Parent ID (optional)</Label>
              <Input value={form.parent} onChange={e=>setForm({...form, parent:e.target.value})} placeholder="e.g. 1" className="mt-1.5" />
              <p className="text-xs text-muted-foreground mt-1">Link to parent category for subcategories.</p>
            </div>
            <div className="flex items-end gap-2">
              <Button type="submit" className="rounded-xl flex-1">{editing?"Update":"Create"}</Button>
              {editing && <Button type="button" variant="outline" className="rounded-xl" onClick={()=>{setEditing(null); setForm({name:"",slug:"",description:"",parent:""})}}>Cancel</Button>}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-2 gap-3">
        {cats.map(c=> (
          <Card key={c.id} className="p-4">
            <div className="font-semibold">{c.name} <span className="text-xs text-muted-foreground">/{c.slug}</span> {c.parent && <span className="text-xs bg-zinc-100 px-2 py-0.5 rounded-full">parent #{c.parent}</span>}</div>
            <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{c.description || "No description"}</div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="outline" className="rounded-xl" onClick={()=>edit(c)}>Edit</Button>
              <Button size="sm" variant="ghost" className="rounded-xl text-red-600" onClick={()=>remove(c.id)}>Delete</Button>
              <span className="ml-auto text-xs text-muted-foreground">#{c.id}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
