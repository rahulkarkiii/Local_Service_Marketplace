import { useEffect, useState } from "react"
import client from "../../api/client"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { formatDateTime } from "../../lib/utils"

export default function Notifications() {
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = async () => {
    setLoading(true)
    try {
      const res = await client.get("/notifications/")
      setNotifs(Array.isArray(res.data)?res.data:res.data.results||[])
    } catch {} finally { setLoading(false) }
  }
  useEffect(()=>{ fetch() }, [])

  const markRead = async (n) => {
    try {
      await client.patch(`/notifications/${n.id}/`, { is_read: true })
      fetch()
    } catch {}
  }
  const markAllRead = async () => {
    try {
      await Promise.all(notifs.filter(n=>!n.is_read).map(n=> client.patch(`/notifications/${n.id}/`, { is_read: true })))
      fetch()
    } catch {}
  }

  const typeColor = { BOOKING:"bg-sky-500", PAYMENT:"bg-emerald-500", REVIEW:"bg-amber-500", GENERAL:"bg-zinc-500" }

  return (
    <div className="mx-auto max-w-[720px] space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="text-muted-foreground mt-1">Auto-created on booking, payment, and review events.</p>
        </div>
        {notifs.some(n=>!n.is_read) && <Button variant="outline" className="rounded-xl" onClick={markAllRead}>Mark all read</Button>}
      </div>

      {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : notifs.length===0 ? <Card className="p-12 text-center"><div className="mx-auto h-14 w-14 rounded-2xl bg-zinc-100 grid place-items-center text-xl">🔔</div><p className="text-sm text-muted-foreground mt-3">No notifications yet.</p></Card> :
        <div className="space-y-3">
          {notifs.map(n=> (
            <Card key={n.id} className={`${!n.is_read ? "border-violet-200 bg-violet-50/50" : ""}`}>
              <CardContent className="p-4 flex gap-3">
                <div className={`h-9 w-9 rounded-xl grid place-items-center text-white shrink-0 ${typeColor[n.notification_type]||"bg-zinc-500"}`}>
                  <span className="text-xs font-bold">{n.notification_type[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold text-sm">{n.title} {!n.is_read && <Badge className="ml-2 bg-violet-600">New</Badge>}</div>
                    <span className="text-xs text-muted-foreground shrink-0">{formatDateTime(n.created_at)}</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{n.message}</div>
                  <div className="mt-2 flex gap-2">
                    <Badge variant="secondary" className="rounded-full text-[11px]">{n.notification_type}</Badge>
                    {!n.is_read && <Button size="sm" variant="outline" className="h-7 rounded-xl text-xs" onClick={()=>markRead(n)}>Mark read</Button>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      }
    </div>
  )
}
