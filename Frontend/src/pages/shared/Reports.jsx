import { useEffect, useState } from "react"
import client from "../../api/client"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input, Select, Label, Textarea } from "../../components/ui/input"
import { Badge, StatusBadge } from "../../components/ui/badge"

export default function Reports() {
  const [reports, setReports] = useState([])
  const [form, setForm] = useState({ report_type:"OTHER", title:"", description:"" })
  const [msg, setMsg] = useState("")
  const [error, setError] = useState("")

  const fetch = async () => {
    try {
      const res = await client.get("/reports/")
      setReports(Array.isArray(res.data)?res.data:res.data.results||[])
    } catch {}
  }
  useEffect(()=>{ fetch() }, [])

  const submit = async (e) => {
    e.preventDefault()
    setMsg(""); setError("")
    try {
      const res = await client.post("/reports/", form)
      setMsg("Report submitted. Admin will review shortly.")
      setForm({ report_type:"OTHER", title:"", description:"" })
      fetch()
    } catch (err) {
      const d = err.response?.data
      setError(typeof d==="string"?d: JSON.stringify(d))
    }
  }

  const remove = async (id) => {
    try { await client.delete(`/reports/${id}/`); fetch() } catch {}
  }

  return (
    <div className="mx-auto max-w-[720px] space-y-6">
      <div>
        <h1 className="page-title">Reports & Complaints</h1>
        <p className="text-muted-foreground mt-1">Submit an issue about a booking, payment, service, or user. Admin will update status to REVIEWED/RESOLVED/REJECTED.</p>
      </div>

      {msg && <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-3">{msg}</div>}
      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 whitespace-pre-wrap">{error}</div>}

      <Card>
        <CardHeader><CardTitle className="text-base">Submit a report</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label>Type</Label>
              <Select value={form.report_type} onChange={e=>setForm({...form, report_type:e.target.value})} className="mt-1.5">
                <option value="BOOKING">BOOKING</option>
                <option value="PAYMENT">PAYMENT</option>
                <option value="SERVICE">SERVICE</option>
                <option value="USER">USER</option>
                <option value="OTHER">OTHER</option>
              </Select>
            </div>
            <div>
              <Label>Title *</Label>
              <Input value={form.title} onChange={e=>setForm({...form, title:e.target.value})} required placeholder="Issue summary" className="mt-1.5" />
            </div>
            <div>
              <Label>Description *</Label>
              <Textarea value={form.description} onChange={e=>setForm({...form, description:e.target.value})} required placeholder="Describe the issue in detail..." className="mt-1.5" />
            </div>
            <Button type="submit" className="rounded-xl">Submit report</Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h3 className="font-semibold">Your reports ({reports.length})</h3>
        {reports.length===0 ? <Card className="p-8 text-center text-sm text-muted-foreground">No reports yet.</Card> :
          reports.map(r=> (
            <Card key={r.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{r.title} <Badge variant="secondary" className="ml-2">{r.report_type}</Badge> <StatusBadge status={r.status}/></div>
                  <div className="text-sm text-muted-foreground mt-1">{r.description}</div>
                  <div className="text-xs text-muted-foreground mt-1">{new Date(r.created_at).toLocaleString()}</div>
                </div>
                <Button size="sm" variant="ghost" className="rounded-xl text-red-600" onClick={()=>remove(r.id)}>Delete</Button>
              </div>
            </Card>
          ))
        }
      </div>
    </div>
  )
}
