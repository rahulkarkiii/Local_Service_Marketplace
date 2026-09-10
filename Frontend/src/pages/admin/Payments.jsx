import { useEffect, useState } from "react"
import client from "../../api/client"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { StatusBadge } from "../../components/ui/badge"
import { formatPrice } from "../../lib/utils"

export default function AdminPayments() {
  const [payments, setPayments] = useState([])
  useEffect(()=> {
    client.get("/payments/").then(r=> setPayments(Array.isArray(r.data)?r.data:r.data.results||[])).catch(()=>{})
  }, [])
  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">All Payments</h1>
        <p className="text-muted-foreground mt-1">Admin view of all platform payments.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Payments ({payments.length})</CardTitle></CardHeader>
        <CardContent>
          {payments.length===0 ? <p className="text-sm text-muted-foreground">No payments.</p> :
            <div className="overflow-x-auto rounded-xl border bg-card">
              <table className="w-full text-sm">
                <thead className="table-header"><tr><th className="text-left py-3 px-4 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">ID</th><th className="text-left py-3 px-4 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Booking</th><th className="text-left py-3 px-4 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Customer</th><th className="text-left py-3 px-4 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Provider</th><th className="text-right py-3 px-4 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Amount</th><th className="text-left py-3 px-4 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Status</th></tr></thead>
                <tbody>
                  {payments.map(p=> (
                    <tr key={p.id} className="table-row">
                      <td className="py-3.5 px-4">#{p.id}</td>
                      <td className="py-3.5 px-4">#{p.booking}</td>
                      <td className="py-3.5 px-4">#{p.customer}</td>
                      <td className="py-3.5 px-4">#{p.provider}</td>
                      <td className="py-3.5 px-4 text-right font-semibold tabular-nums">{formatPrice(p.amount)}</td>
                      <td className="py-3.5 px-4"><StatusBadge status={p.status}/></td>
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
