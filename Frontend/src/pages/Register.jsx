import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Wrench, ArrowRight, Check, ShieldCheck } from "lucide-react"
import useAuthStore from "../stores/authStore"
import { Button } from "../components/ui/button"
import { Input, Label, Select } from "../components/ui/input"
import { ThemeToggle } from "../components/ui/theme-toggle"

export default function Register() {
  const [form, setForm] = useState({ username:"", email:"", password:"", role:"CUSTOMER" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const register = useAuthStore(s=>s.register)
  const login = useAuthStore(s=>s.login)
  const navigate = useNavigate()

  const handle = async (e) => {
    e.preventDefault()
    setError("")
    if (!form.username || !form.email || !form.password) { setError("Please fill all fields."); return }
    if (form.password.length < 8) { setError("Password must be at least 8 characters."); return }
    setLoading(true)
    try {
      await register(form)
      const user = await login(form.username, form.password)
      if (user.role === "PROVIDER") navigate("/provider")
      else navigate("/customer")
    } catch (err) {
      const data = err.response?.data
      let msg = "Registration failed."
      if (data) {
        if (typeof data === "string") msg = data
        else if (data.detail) msg = data.detail
        else msg = Object.entries(data).map(([k,v])=> `${k}: ${Array.isArray(v)?v.join(", "):v}`).join(" | ")
      }
      setError(msg)
    } finally { setLoading(false) }
  }

  const roleInfo = form.role === "PROVIDER"
    ? "As a provider you'll create a business profile, get verified by admin, then list services and manage bookings."
    : "As a customer you can instantly book services, pay via Khalti, and leave reviews."

  return (
    <div className="min-h-[calc(100vh-64px)] grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-6 sm:p-10 bg-white dark:bg-zinc-900 relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-[460px]">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 grid place-items-center"><Wrench className="h-5 w-5 text-white"/></div>
            <span className="font-display font-bold">SewaNepal</span>
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight">Create your account</h1>
          <p className="text-muted-foreground mt-2">Join Nepal's trusted service marketplace in 30 seconds.</p>

          <form onSubmit={handle} className="mt-8 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Username *</Label>
                <Input value={form.username} onChange={e=>setForm({...form, username:e.target.value})} placeholder="ram_sharma" className="mt-1.5 h-11" autoComplete="username" />
              </div>
              <div>
                <Label>Role *</Label>
                <Select value={form.role} onChange={e=>setForm({...form, role:e.target.value})} className="mt-1.5 h-11">
                  <option value="CUSTOMER">Customer</option>
                  <option value="PROVIDER">Provider</option>
                </Select>
              </div>
            </div>
            <div>
              <Label>Email *</Label>
              <Input type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} placeholder="you@example.com" className="mt-1.5 h-11" autoComplete="email" />
            </div>
            <div>
              <Label>Password *</Label>
              <Input type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} placeholder="Min. 8 characters" className="mt-1.5 h-11" autoComplete="new-password" />
              <p className="text-xs text-muted-foreground mt-1">Must be at least 8 characters. Avoid common passwords.</p>
            </div>

            <div className="rounded-xl bg-violet-50 border border-violet-200 p-3 text-xs leading-relaxed">
              <div className="font-semibold text-violet-900 flex items-center gap-1.5"><ShieldCheck className="h-4 w-4"/> {form.role === "PROVIDER" ? "Provider path" : "Customer path"}</div>
              <div className="text-violet-700 mt-1">{roleInfo}</div>
            </div>

            {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 whitespace-pre-wrap">{error}</div>}

            <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl bg-zinc-900 hover:bg-black text-base gap-2">
              {loading ? "Creating account..." : "Create account"} <ArrowRight className="h-4 w-4"/>
            </Button>

            <div className="text-sm text-center text-muted-foreground">
              Already have an account? <Link to="/login" className="font-semibold text-violet-600 hover:underline">Log in</Link>
            </div>

            <div className="text-xs text-muted-foreground text-center">Admin accounts are created via Django createsuperuser — not via public signup.</div>
          </form>
        </div>
      </div>

      <div className="hidden lg:flex relative overflow-hidden bg-zinc-900 text-white p-10 flex-col">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/30 to-indigo-600/30" />
        <div className="relative flex-1">
          <h2 className="text-4xl font-extrabold tracking-tight leading-[1.05]">Built for <span className="text-violet-300">trust.</span><br/>Designed for growth.</h2>
          <ul className="mt-8 space-y-3">
            {[
              "Verified provider profiles with admin approval",
              "Location-based search with real geocoding",
              "Booking lifecycle: request → accept → complete → pay → review",
              "Real Khalti KPG-2 integration, server-verified",
            ].map(t=> (
              <li key={t} className="flex gap-3 text-sm text-zinc-300"><span className="h-6 w-6 rounded-full bg-emerald-500 grid place-items-center shrink-0 mt-0.5"><Check className="h-3.5 w-3.5 text-white"/></span>{t}</li>
            ))}
          </ul>
        </div>
        <div className="relative mt-10 rounded-2xl bg-white text-zinc-900 p-5">
          <div className="text-sm font-semibold">“SewaNepal helped me double my monthly bookings. The verification badge builds instant trust.”</div>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-zinc-900 text-white grid place-items-center font-bold">R</div>
            <div><div className="text-sm font-semibold">Rajesh K.</div><div className="text-xs text-muted-foreground">Electrician • Kathmandu • 312 jobs</div></div>
            <div className="ml-auto text-amber-500">★★★★★</div>
          </div>
        </div>
      </div>
    </div>
  )
}
