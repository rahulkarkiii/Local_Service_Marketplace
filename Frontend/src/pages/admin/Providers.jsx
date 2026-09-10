import { useEffect, useState } from "react"
import client from "../../api/client"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"

export default function AdminProviders() {
  const [providers, setProviders] = useState([])
  const [msg, setMsg] = useState("")

  const fetch = async () => {
    try {
      const res = await client.get("/providers/")
      setProviders(Array.isArray(res.data)?res.data:res.data.results||[])
    } catch {}
  }
  useEffect(()=>{ fetch() }, [])

  const verify = async (id, is_verified) => {
    try {
      await client.patch(`/providers/${id}/verify/`, { is_verified })
      setMsg(`Provider #${id} ${is_verified ? "verified" : "unverified"}.`)
      fetch()
    } catch (e) {
      setMsg(e.response?.data?.detail || "Failed")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Provider Verification</h1>
        <p className="text-muted-foreground mt-1">Admin-only: approve or reject provider profiles. IsVerifiedProvider gate controls who can list services.</p>
      </div>
      {msg && <div className="text-sm bg-zinc-900 text-white rounded-xl p-3">{msg}</div>}
      <div className="grid gap-4">
        {providers.length===0 ? <Card className="p-8 text-center text-sm text-muted-foreground">No providers found.</Card> :
          providers.map(p=> (
            <Card key={p.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{p.business_name} <Badge variant={p.is_verified?"success":"warning"} className="ml-2">{p.is_verified?"Verified":"Pending"}</Badge></div>
                  <div className="text-sm text-muted-foreground">Account #{p.account} • {p.address} • {p.phone} • {p.experience_years} yrs</div>
                  <div className="text-sm mt-1 line-clamp-2">{p.bio || "No bio"}</div>
                  {p.latitude && <div className="text-xs text-muted-foreground">📍 {p.latitude}, {p.longitude}</div>}
                </div>
                <div className="flex gap-2 shrink-0">
                  {!p.is_verified ? <Button size="sm" className="rounded-xl bg-emerald-600 hover:bg-emerald-700" onClick={()=>verify(p.id, true)}>Verify</Button> : <Button size="sm" variant="outline" className="rounded-xl" onClick={()=>verify(p.id, false)}>Unverify</Button>}
                </div>
              </div>
            </Card>
          ))
        }
      </div>
    </div>
  )
}
