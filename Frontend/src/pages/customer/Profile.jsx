import { useEffect, useState } from "react"
import client from "../../api/client"
import useAuthStore from "../../stores/authStore"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input, Textarea, Label } from "../../components/ui/input"

export default function CustomerProfile() {
  const { user } = useAuthStore()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ phone:"", address:"", bio:"" })
  const [msg, setMsg] = useState("")
  const [error, setError] = useState("")

  const fetch = async () => {
    setLoading(true)
    try {
      const res = await client.get("/customers/")
      const arr = Array.isArray(res.data)?res.data:res.data.results||[]
      const mine = arr.find(p=> String(p.account)===String(user?.id)) || arr[0] || null
      if (mine) {
        setProfile(mine)
        setForm({ phone: mine.phone||"", address: mine.address||"", bio: mine.bio||"" })
      }
    } catch {} finally { setLoading(false) }
  }
  useEffect(()=>{ if(user) fetch() }, [user])

  const save = async (e) => {
    e.preventDefault()
    setMsg(""); setError("")
    try {
      if (profile) {
        const res = await client.patch(`/customers/${profile.id}/`, form)
        setProfile(res.data)
        setMsg("Profile updated.")
      } else {
        const res = await client.post("/customers/", form)
        setProfile(res.data)
        setMsg("Profile created.")
      }
    } catch (err) {
      const d = err.response?.data
      setError(typeof d==="string"?d: JSON.stringify(d))
    }
  }

  if (loading) return <div className="text-sm text-muted-foreground">Loading profile…</div>

  return (
    <div className="space-y-6 max-w-[720px]">
      <div>
        <h1 className="page-title">Customer Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your personal details. This is linked to your customer account.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Account</CardTitle></CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4 text-sm">
          <div><div className="text-muted-foreground">Username</div><div className="font-semibold">{user?.username}</div></div>
          <div><div className="text-muted-foreground">Email</div><div className="font-semibold">{user?.email}</div></div>
          <div><div className="text-muted-foreground">Role</div><div className="font-semibold capitalize">{user?.role?.toLowerCase()}</div></div>
          <div><div className="text-muted-foreground">User ID</div><div className="font-semibold">#{user?.id}</div></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">{profile ? "Edit customer profile" : "Create customer profile"}</CardTitle><p className="text-sm text-muted-foreground">Required to personalize bookings and notifications.</p></CardHeader>
        <CardContent>
          <form onSubmit={save} className="space-y-4">
            <div>
              <Label>Phone</Label>
              <Input value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} placeholder="+977 98xxxxxxxx" className="mt-1.5" />
            </div>
            <div>
              <Label>Address</Label>
              <Input value={form.address} onChange={e=>setForm({...form, address:e.target.value})} placeholder="Kathmandu, Nepal" className="mt-1.5" />
            </div>
            <div>
              <Label>Bio</Label>
              <Textarea value={form.bio} onChange={e=>setForm({...form, bio:e.target.value})} placeholder="Tell us a bit about yourself..." className="mt-1.5" />
            </div>
            {msg && <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-3">{msg}</div>}
            {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 whitespace-pre-wrap">{error}</div>}
            <Button type="submit" className="rounded-xl">{profile ? "Update profile" : "Create profile"}</Button>
          </form>
        </CardContent>
      </Card>

      {profile && <Card className="p-4 bg-zinc-50"><div className="text-xs text-muted-foreground">Profile ID #{profile.id} • Created {new Date(profile.created_at).toLocaleString()}</div></Card>}
    </div>
  )
}
