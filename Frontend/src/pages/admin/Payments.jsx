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
        <h1 className="text-2xl font-extrabold tracking-tight">All Payments</h1>
        <p className="text-muted-foreground mt-1">Admin view of all platform payments.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Payments ({payments.length})</CardTitle></CardHeader>
        <CardContent>
          {payments.length===0 ? <p className="text-sm text-muted-foreground">No payments.</p> :
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground border-b"><tr><th className="text-left py-2">ID</th><th className="text-left py-2">Booking</th><th className="text-left py-2">Customer</th><th className="text-left py-2">Provider</th><th className="text-left py-2">Amount</th><th className="text-left py-2">Status</th></tr></thead>
                <tbody>
                  {payments.map(p=> (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-zinc-50">
                      <td className="py-3">#{p.id}</td>
                      <td className="py-3">#{p.booking}</td>
                      <td className="py-3">#{p.customer}</td>
                      <td className="py-3">#{p.provider}</td>
                      <td className="py-3 font-semibold">{formatPrice(p.amount)}</td>
                      <td className="py-3"><StatusBadge status={p.status}/></td>
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
