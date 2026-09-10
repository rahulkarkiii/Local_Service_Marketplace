import { useEffect, useState } from "react"
import client from "../../api/client"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { formatPrice } from "../../lib/utils"

export default function ProviderEarnings() {
  const [data, setData] = useState(null)
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=> {
    const run = async () => {
      try {
        const e = await client.get("/payments/earnings/")
        setData(e.data)
        const p = await client.get("/payments/")
        const arr = Array.isArray(p.data)?p.data:p.data.results||[]
        setPayments(arr)
      } catch {} finally { setLoading(false) }
    }
    run()
  }, [])

  if (loading) return <div className="text-sm text-muted-foreground">Loading earnings…</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Earnings</h1>
        <p className="text-muted-foreground mt-1">Track your revenue from completed payments.</p>
      </div>

      {data ? (
        <div className="grid sm:grid-cols-3 gap-4">
          <Card className="p-5">
            <div className="text-sm text-muted-foreground">Total earnings</div>
            <div className="text-3xl font-extrabold mt-2">{formatPrice(data.total_earnings)}</div>
            <div className="text-xs text-muted-foreground mt-1">{data.total_completed_payments} completed</div>
          </Card>
          <Card className="p-5">
            <div className="text-sm text-muted-foreground">This month</div>
            <div className="text-3xl font-extrabold mt-2">{formatPrice(data.this_month_earnings)}</div>
            <div className="text-xs text-muted-foreground mt-1">Current month revenue</div>
          </Card>
          <Card className="p-5 bg-amber-50 border-amber-200">
            <div className="text-sm text-amber-700">Pending amount</div>
            <div className="text-3xl font-extrabold mt-2 text-amber-900">{formatPrice(data.pending_amount)}</div>
            <div className="text-xs text-amber-700 mt-1">Awaiting verification</div>
          </Card>
        </div>
      ) : <Card className="p-6 text-sm text-muted-foreground">No earnings data. Earnings endpoint requires provider auth.</Card>}

      <Card>
        <CardHeader><CardTitle>Recent payments ({payments.length})</CardTitle></CardHeader>
        <CardContent>
          {payments.length===0 ? <p className="text-sm text-muted-foreground">No payments yet.</p> :
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground border-b"><tr><th className="text-left py-2">ID</th><th className="text-left py-2">Booking</th><th className="text-left py-2">Amount</th><th className="text-left py-2">Status</th><th className="text-left py-2">Date</th></tr></thead>
                <tbody>
                  {payments.slice(0,10).map(p=> (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-zinc-50">
                      <td className="py-3">#{p.id}</td>
                      <td className="py-3">#{p.booking}</td>
                      <td className="py-3 font-semibold">{formatPrice(p.amount)}</td>
                      <td className="py-3">{p.status}</td>
                      <td className="py-3 text-xs text-muted-foreground">{new Date(p.created_at).toLocaleString()}</td>
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
