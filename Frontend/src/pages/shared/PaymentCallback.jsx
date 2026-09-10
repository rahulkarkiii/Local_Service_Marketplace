import { useEffect, useState } from "react"
import { useSearchParams, Link, useNavigate } from "react-router-dom"
import client from "../../api/client"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Check, X, Loader2, CreditCard } from "lucide-react"

export default function PaymentCallback() {
  const [params] = useSearchParams()
  const pidx = params.get("pidx")
  const [status, setStatus] = useState("verifying") // verifying, success, failed, error
  const [detail, setDetail] = useState("")
  const navigate = useNavigate()

  useEffect(()=> {
    const run = async () => {
      if (!pidx) { setStatus("error"); setDetail("No pidx found in URL. Payment callback requires ?pidx=... from Khalti."); return }
      // Find payment by transaction_id
      try {
        const res = await client.get("/payments/")
        const arr = Array.isArray(res.data)?res.data:res.data.results||[]
        const payment = arr.find(p=> p.transaction_id === pidx)
        if (!payment) {
          setStatus("error")
          setDetail(`No local payment found with transaction_id ${pidx}. If you just initiated, try verifying from Payments page.`)
          return
        }
        // verify
        try {
          const v = await client.post(`/payments/${payment.id}/verify/`)
          if (v.data.status === "COMPLETED") {
            setStatus("success")
            setDetail(`Payment #${payment.id} verified as COMPLETED.`)
          } else if (v.data.status === "FAILED") {
            setStatus("failed")
            setDetail(`Payment #${payment.id} marked as FAILED.`)
          } else {
            setStatus("success")
            setDetail(`Payment #${payment.id} status: ${v.data.status}`)
          }
        } catch (e) {
          setStatus("error")
          setDetail(e.response?.data?.detail || JSON.stringify(e.response?.data) || "Verification failed")
        }
      } catch (e) {
        setStatus("error")
        setDetail("Failed to fetch payments.")
      }
    }
    run()
  }, [pidx])

  return (
    <div className="mx-auto max-w-[560px] px-4 py-12">
      <Card className="overflow-hidden">
        <div className={`h-2 ${status==="success"?"bg-emerald-500":status==="failed"?"bg-red-500":status==="verifying"?"bg-sky-500":"bg-amber-500"}`} />
        <CardHeader className="text-center">
          <div className={`mx-auto h-14 w-14 rounded-2xl grid place-items-center ${status==="success"?"bg-emerald-100 text-emerald-600":status==="failed"?"bg-red-100 text-red-600":status==="verifying"?"bg-sky-100 text-sky-600":"bg-amber-100 text-amber-600"}`}>
            {status==="verifying" ? <Loader2 className="h-7 w-7 animate-spin"/> : status==="success" ? <Check className="h-7 w-7"/> : status==="failed" ? <X className="h-7 w-7"/> : <CreditCard className="h-7 w-7"/>}
          </div>
          <CardTitle className="mt-3">
            {status==="verifying" && "Verifying payment…"}
            {status==="success" && "Payment successful!"}
            {status==="failed" && "Payment failed"}
            {status==="error" && "Verification issue"}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {status==="verifying" ? "Contacting Khalti server-side to confirm your payment…" : detail}
          </p>
          {pidx && <p className="text-xs text-muted-foreground mt-2">pidx: <code className="bg-zinc-100 px-1.5 py-0.5 rounded border">{pidx}</code></p>}
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {status==="success" && <Link to="/customer/payments"><Button className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700">Go to payments</Button></Link>}
          {status==="failed" && <Link to="/customer/payments"><Button variant="outline" className="w-full rounded-xl">Try again in payments</Button></Link>}
          {status==="error" && <Link to="/customer/payments"><Button variant="outline" className="w-full rounded-xl">Go to payments</Button></Link>}
          <Link to="/" className="text-center text-sm text-muted-foreground hover:text-foreground">Back to home</Link>
          <div className="rounded-xl bg-zinc-50 border p-3 text-xs leading-relaxed text-muted-foreground mt-2">
            Khalti has no webhook for KPG-2 ePayment — this verify step is the only source of truth. Client-supplied status is never trusted; backend calls <code> /epayment/lookup/</code> server-side.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
