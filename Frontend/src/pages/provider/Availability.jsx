import { useEffect, useState } from "react"
import client from "../../api/client"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input, Select, Label } from "../../components/ui/input"

const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]

export default function Availability() {
  const [slots, setSlots] = useState([])
  const [form, setForm] = useState({ weekday:"0", start_time:"09:00", end_time:"17:00" })
  const [editing, setEditing] = useState(null)
  const [msg, setMsg] = useState("")
  const [error, setError] = useState("")

  const fetch = async () => {
    try {
      const res = await client.get("/providers/availability/")
      setSlots(Array.isArray(res.data)?res.data:res.data.results||[])
    } catch {}
  }
  useEffect(()=>{ fetch() }, [])

  const submit = async (e) => {
    e.preventDefault()
    setError(""); setMsg("")
    const payload = { weekday: Number(form.weekday), start_time: form.start_time, end_time: form.end_time }
    try {
      if (editing) {
        await client.patch(`/providers/availability/${editing}/`, payload)
        setMsg("Slot updated.")
        setEditing(null)
      } else {
        await client.post("/providers/availability/", payload)
        setMsg("Slot created.")
      }
      setForm({ weekday:"0", start_time:"09:00", end_time:"17:00" })
      fetch()
    } catch (err) {
      const d = err.response?.data
      setError(typeof d==="string"?d: JSON.stringify(d, null, 2))
    }
  }

  const edit = (s) => {
    setEditing(s.id)
    setForm({ weekday: String(s.weekday), start_time: s.start_time.slice(0,5), end_time: s.end_time.slice(0,5) })
  }

  const remove = async (id) => {
    if (!confirm("Delete this slot?")) return
    try { await client.delete(`/providers/availability/${id}/`); fetch() } catch {}
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Availability</h1>
        <p className="text-muted-foreground mt-1">Set your weekly working hours. Bookings outside these slots are rejected server-side. Overlapping slots are not allowed.</p>
      </div>

      {msg && <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-3">{msg}</div>}
      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 whitespace-pre-wrap">{error}</div>}

      <Card>
        <CardHeader><CardTitle className="text-base">{editing?`Edit slot #${editing}`:"Add availability slot"}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid sm:grid-cols-4 gap-3">
            <div>
              <Label>Weekday</Label>
              <Select value={form.weekday} onChange={e=>setForm({...form, weekday:e.target.value})} className="mt-1.5">
                {days.map((d,i)=> <option key={i} value={i}>{d}</option>)}
              </Select>
            </div>
            <div>
              <Label>Start time</Label>
              <Input type="time" value={form.start_time} onChange={e=>setForm({...form, start_time:e.target.value})} required className="mt-1.5" />
            </div>
            <div>
              <Label>End time</Label>
              <Input type="time" value={form.end_time} onChange={e=>setForm({...form, end_time:e.target.value})} required className="mt-1.5" />
            </div>
            <div className="flex items-end gap-2">
              <Button type="submit" className="flex-1 rounded-xl">{editing?"Update":"Add slot"}</Button>
              {editing && <Button type="button" variant="outline" className="rounded-xl" onClick={()=>{setEditing(null); setForm({ weekday:"0", start_time:"09:00", end_time:"17:00"})}}>Cancel</Button>}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Your slots ({slots.length})</CardTitle></CardHeader>
        <CardContent>
          {slots.length===0 ? <p className="text-sm text-muted-foreground">No slots yet. Add your working hours above.</p> :
            <div className="overflow-x-auto rounded-xl border bg-card">
              <table className="w-full text-sm">
                <thead className="table-header"><tr><th className="text-left py-3 px-4 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Day</th><th className="text-left py-3 px-4 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Start</th><th className="text-left py-3 px-4 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">End</th><th className="text-left py-3 px-4 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Actions</th></tr></thead>
                <tbody>
                  {slots.map(s=> (
                    <tr key={s.id} className="table-row">
                      <td className="py-3.5 px-4 font-medium">{days[s.weekday]} <span className="text-muted-foreground font-normal">({s.weekday_display})</span></td>
                      <td className="py-3.5 px-4">{s.start_time}</td>
                      <td className="py-3.5 px-4">{s.end_time}</td>
                      <td className="py-3.5 px-4 flex gap-1">
                        <Button size="sm" variant="outline" className="h-7 rounded-xl text-xs" onClick={()=>edit(s)}>Edit</Button>
                        <Button size="sm" variant="ghost" className="h-7 rounded-xl text-xs text-red-600 hover:bg-red-50" onClick={()=>remove(s.id)}>Delete</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          }
        </CardContent>
      </Card>
    </div>
  )
}
