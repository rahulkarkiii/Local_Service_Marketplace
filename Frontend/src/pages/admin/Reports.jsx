import { useEffect, useState } from "react"
import client from "../../api/client"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input, Select, Label, Textarea } from "../../components/ui/input"
import { Badge, StatusBadge } from "../../components/ui/badge"

export default function AdminReports() {
  const [reports, setReports] = useState([])
  const [filter, setFilter] = useState({ status:"", report_type:"" })
  const [msg, setMsg] = useState("")

  const fetch = async () => {
    try {
      const q = new URLSearchParams()
      if (filter.status) q.set("status", filter.status)
      if (filter.report_type) q.set("report_type", filter.report_type)
      const res = await client.get(`/reports/?${q.toString()}`)
      setReports(Array.isArray(res.data)?res.data:res.data.results||[])
    } catch {}
  }
  useEffect(()=>{ fetch() }, [])

  const update = async (id, patch) => {
    try {
      await client.patch(`/reports/${id}/`, patch)
      setMsg(`Report #${id} updated.`)
      fetch()
    } catch {}
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Reports & Complaints</h1>
        <p className="text-muted-foreground mt-1">Filter by status/type (admin). Users can only see their own reports.</p>
      </div>
      {msg && <div className="text-sm bg-zinc-900 text-white rounded-xl p-3">{msg}</div>}
      <Card className="p-4 flex flex-wrap gap-3 items-end">
        <div>
          <Label>Status filter</Label>
          <Select value={filter.status} onChange={e=>setFilter({...filter, status:e.target.value})} className="mt-1.5">
            <option value="">All statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="REVIEWED">REVIEWED</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="REJECTED">REJECTED</option>
          </Select>
        </div>
        <div>
          <Label>Type filter</Label>
          <Select value={filter.report_type} onChange={e=>setFilter({...filter, report_type:e.target.value})} className="mt-1.5">
            <option value="">All types</option>
            <option value="BOOKING">BOOKING</option>
            <option value="PAYMENT">PAYMENT</option>
            <option value="SERVICE">SERVICE</option>
            <option value="USER">USER</option>
            <option value="OTHER">OTHER</option>
          </Select>
        </div>
        <Button onClick={fetch} className="rounded-xl">Filter</Button>
        <Button variant="outline" className="rounded-xl" onClick={()=>{setFilter({status:"",report_type:""}); setTimeout(fetch,0)}}>Clear</Button>
      </Card>

      <div className="grid gap-3">
        {reports.length===0 ? <Card className="p-8 text-center text-sm text-muted-foreground">No reports.</Card> :
          reports.map(r=> (
            <Card key={r.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{r.title} <Badge variant="secondary" className="ml-2">{r.report_type}</Badge> <StatusBadge status={r.status}/></div>
                  <div className="text-sm text-muted-foreground mt-1">{r.description}</div>
                  <div className="text-xs text-muted-foreground mt-1">Reporter #{r.reporter} • {new Date(r.created_at).toLocaleString()}</div>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {["PENDING","REVIEWED","RESOLVED","REJECTED"].map(s=> (
                    <Button key={s} size="sm" variant={r.status===s?"default":"outline"} className="h-7 rounded-xl text-xs" onClick={()=>update(r.id,{status:s})}>{s}</Button>
                  ))}
                </div>
              </div>
            </Card>
          ))
        }
      </div>
    </div>
  )
}
