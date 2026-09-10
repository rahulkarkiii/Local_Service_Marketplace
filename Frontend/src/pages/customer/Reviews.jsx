import { useEffect, useState } from "react"
import client from "../../api/client"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input, Textarea } from "../../components/ui/input"
import { Badge } from "../../components/ui/badge"
import { formatDate } from "../../lib/utils"

export default function CustomerReviews() {
  const [reviews, setReviews] = useState([])
  const [msg, setMsg] = useState("")
  const [error, setError] = useState("")

  const fetch = async () => {
    try {
      const res = await client.get("/reviews/")
      setReviews(Array.isArray(res.data)?res.data:res.data.results||[])
    } catch {}
  }
  useEffect(()=>{ fetch() }, [])

  const create = async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    setError(""); setMsg("")
    try {
      const res = await client.post("/reviews/", {
        service: Number(fd.get("service")),
        booking: Number(fd.get("booking")),
        rating: Number(fd.get("rating")),
        comment: fd.get("comment")||"",
      })
      setMsg("Review created!")
      e.target.reset()
      fetch()
    } catch (err) {
      const d = err.response?.data
      setError(typeof d==="string"?d: JSON.stringify(d))
    }
  }

  const remove = async (id) => {
    try {
      await client.delete(`/reviews/${id}/`)
      fetch()
    } catch {}
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">My Reviews</h1>
        <p className="text-muted-foreground mt-1">One review per completed booking. Rating 1–5, enforced server-side.</p>
      </div>

      {msg && <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-3">{msg}</div>}
      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 whitespace-pre-wrap">{error}</div>}

      <Card>
        <CardHeader><CardTitle className="text-base">Write a review</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={create} className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Service ID *</label>
              <Input name="service" type="number" required placeholder="Service ID" className="mt-1.5" />
            </div>
            <div>
              <label className="text-sm font-medium">Booking ID *</label>
              <Input name="booking" type="number" required placeholder="Completed booking ID" className="mt-1.5" />
            </div>
            <div>
              <label className="text-sm font-medium">Rating (1-5) *</label>
              <Input name="rating" type="number" min="1" max="5" required placeholder="5" className="mt-1.5" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium">Comment</label>
              <Textarea name="comment" placeholder="Great service, on time..." className="mt-1.5" />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" className="rounded-xl bg-zinc-900 hover:bg-black">Submit review</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {reviews.length===0 ? <Card className="p-8 text-center text-sm text-muted-foreground">No reviews yet.</Card> :
          reviews.map(r=> (
            <Card key={r.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">Service #{r.service} • Booking #{r.booking} • <span className="text-amber-600">★ {r.rating}/5</span></div>
                  <div className="text-sm mt-1">{r.comment || "No comment"}</div>
                  <div className="text-xs text-muted-foreground mt-1">{formatDate(r.created_at)}</div>
                </div>
                <Button size="sm" variant="outline" className="rounded-xl" onClick={()=>remove(r.id)}>Delete</Button>
              </div>
            </Card>
          ))
        }
      </div>
    </div>
  )
}
