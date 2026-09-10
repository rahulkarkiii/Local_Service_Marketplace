import { useEffect, useState } from "react"
import client from "../../api/client"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input, Select } from "../../components/ui/input"
import { Badge, StatusBadge } from "../../components/ui/badge"
import { formatPrice, formatDateTime } from "../../lib/utils"

export default function CustomerPayments() {
  const [payments, setPayments] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState("")
  const [error, setError] = useState("")

  const fetch = async () => {
    setLoading(true)
    try {
      const [pRes, bRes] = await Promise.all([
        client.get("/payments/"),
        client.get("/bookings/"),
      ])
      setPayments(Array.isArray(pRes.data)?pRes.data:pRes.data.results||[])
      setBookings(Array.isArray(bRes.data)?bRes.data:bRes.data.results||[])
    } catch {} finally { setLoading(false) }
  }
  useEffect(()=>{ fetch() }, [])

  const createPayment = async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    setError(""); setMsg("")
    try {
      const res = await client.post("/payments/", {
        booking: Number(fd.get("booking")),
        payment_method: fd.get("payment_method"),
      })
      setMsg(`Payment #${res.data.id} created. Initiate via Khalti if online.`)
      e.target.reset()
      fetch()
    } catch (err) {
      const d = err.response?.data
      setError(typeof d==="string"?d: JSON.stringify(d))
    }
  }

  const initiate = async (id) => {
    setError(""); setMsg("")
    try {
      const res = await client.post(`/payments/${id}/initiate/`)
      const url = res.data.payment_url
      if (url) {
        setMsg(`Redirecting to Khalti checkout…`)
        window.open(url, "_blank")
      } else {
        setMsg(`Initiated: ${JSON.stringify(res.data)}`)
      }
      fetch()
    } catch (err) {
      setError(err.response?.data?.detail || JSON.stringify(err.response?.data) || "Initiate failed. Check Khalti sandbox config.")
    }
  }

  const verify = async (id) => {
    setError(""); setMsg("")
    try {
      const res = await client.post(`/payments/${id}/verify/`)
      setMsg(`Verified: status is now ${res.data.status}`)
      fetch()
    } catch (err) {
      setError(err.response?.data?.detail || JSON.stringify(err.response?.data) || "Verify failed.")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Payments</h1>
        <p className="text-muted-foreground mt-1">Pay for accepted/completed bookings. Khalti flow is server-verified: initiate → pay on Khalti → verify.</p>
      </div>

      {msg && <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-3">{msg}</div>}
      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 whitespace-pre-wrap">{error}</div>}

      <Card>
        <CardHeader><CardTitle className="text-base">Create payment</CardTitle><p className="text-sm text-muted-foreground">Only accepted or completed bookings can be paid. Amount is auto-filled from service price.</p></CardHeader>
        <CardContent>
          <form onSubmit={createPayment} className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium">Booking ID *</label>
              <Input name="booking" type="number" required placeholder="Booking ID" className="mt-1.5" />
              <p className="text-xs text-muted-foreground mt-1">Eligible: {bookings.filter(b=>["ACCEPTED","COMPLETED"].includes(b.status)).slice(0,3).map(b=>`#${b.id}(${b.status})`).join(", ") || "none yet"}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Method *</label>
              <Select name="payment_method" defaultValue="ONLINE" className="mt-1.5">
                <option value="ONLINE">ONLINE (Khalti)</option>
                <option value="CASH">CASH</option>
                <option value="CARD">CARD</option>
              </Select>
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full rounded-xl">Create payment</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Payment history ({payments.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : payments.length===0 ? <p className="text-sm text-muted-foreground">No payments yet.</p> :
            <div className="overflow-x-auto rounded-xl border bg-card">
              <table className="w-full text-sm">
                <thead className="table-header"><tr><th className="text-left py-3 px-4 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">ID</th><th className="text-left py-3 px-4 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Booking</th><th className="text-right py-3 px-4 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Amount</th><th className="text-left py-3 px-4 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Method</th><th className="text-left py-3 px-4 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Status</th><th className="text-left py-3 px-4 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Txn</th><th className="text-left py-3 px-4 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Actions</th></tr></thead>
                <tbody>
                  {payments.map(p=> (
                    <tr key={p.id} className="table-row">
                      <td className="py-3.5 px-4 font-medium">#{p.id}</td>
                      <td className="py-3.5 px-4">#{p.booking}</td>
                      <td className="py-3.5 px-4 text-right font-semibold tabular-nums">{formatPrice(p.amount)}</td>
                      <td className="py-3.5 px-4"><Badge variant="secondary">{p.payment_method}</Badge></td>
                      <td className="py-3.5 px-4"><StatusBadge status={p.status}/></td>
                      <td className="py-3.5 px-4 text-xs truncate max-w-[140px]">{p.transaction_id || "—"}</td>
                      <td className="py-3.5 px-4 flex flex-wrap gap-1">
                        {p.status==="PENDING" && p.payment_method==="ONLINE" && (
                          <>
                            <Button size="sm" className="h-7 rounded-xl text-xs bg-violet-600 hover:bg-violet-700" onClick={()=>initiate(p.id)}>Initiate</Button>
                            <Button size="sm" variant="outline" className="h-7 rounded-xl text-xs" onClick={()=>verify(p.id)} disabled={!p.transaction_id}>Verify</Button>
                          </>
                        )}
                        {p.status!=="PENDING" && <span className="text-xs text-muted-foreground">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          }
          <div className="mt-4 rounded-xl bg-zinc-50 border p-3 text-xs text-muted-foreground leading-relaxed">
            <div className="font-semibold text-zinc-900">Khalti sandbox testing</div>
            Use Khalti ID 9800000000–9800000005, MPIN 1111, OTP 987654. Choose "Khalti Wallet". E-Banking/card not supported in sandbox. Flow: Initiate → pay on Khalti hosted page → return to <code className="bg-white px-1 rounded border">/payment/callback?pidx=...</code> → Verify.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
