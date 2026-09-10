import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Wrench, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react"
import useAuthStore from "../stores/authStore"
import { Button } from "../components/ui/button"
import { Input, Label } from "../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card"

export default function Login() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [show, setShow] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const login = useAuthStore(s=>s.login)
  const navigate = useNavigate()

  const handle = async (e) => {
    e.preventDefault()
    setError("")
    if (!username || !password) { setError("Please fill in all fields."); return }
    setLoading(true)
    try {
      const user = await login(username, password)
      if (user.role === "ADMIN") navigate("/admin")
      else if (user.role === "PROVIDER") navigate("/provider")
      else navigate("/customer")
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.non_field_errors?.[0] || "Invalid credentials. Please try again."
      setError(typeof msg==="string"?msg:JSON.stringify(msg))
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-6 sm:p-10 bg-white">
        <div className="w-full max-w-[420px]">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 grid place-items-center"><Wrench className="h-5 w-5 text-white"/></div>
            <span className="font-display font-bold">SewaNepal</span>
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground mt-2">Log in to manage your bookings and services.</p>

          <form onSubmit={handle} className="mt-8 space-y-4">
            <div>
              <Label>Username</Label>
              <Input value={username} onChange={e=>setUsername(e.target.value)} placeholder="your_username" className="mt-1.5 h-11" autoComplete="username" />
            </div>
            <div>
              <Label>Password</Label>
              <div className="relative mt-1.5">
                <Input type={show?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" className="h-11 pr-10" autoComplete="current-password" />
                <button type="button" onClick={()=>setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700">
                  {show? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                </button>
              </div>
            </div>
            {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</div>}
            <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl bg-zinc-900 hover:bg-black text-base gap-2">
              {loading ? "Signing in..." : "Sign in"} <ArrowRight className="h-4 w-4"/>
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              Don't have an account? <Link to="/register" className="font-semibold text-violet-600 hover:underline">Create account</Link>
            </div>
            <div className="rounded-xl bg-zinc-50 border p-3 text-xs leading-relaxed text-muted-foreground">
              <div className="font-semibold text-zinc-900">Demo accounts</div>
              Create a new Customer / Provider account, or use an existing Admin via Django createsuperuser. JWT auth with refresh.
            </div>
          </form>
        </div>
      </div>

      <div className="hidden lg:flex relative overflow-hidden bg-zinc-900 text-white p-10 flex-col justify-between">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/30 via-transparent to-indigo-600/30" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-medium backdrop-blur"><ShieldCheck className="h-3.5 w-3.5"/> Trusted by 12,000+ Nepali families</div>
          <h2 className="text-4xl font-extrabold tracking-tight mt-6 leading-[1.05]">Your next <br/><span className="text-violet-300">trusted pro</span> is<br/>one tap away.</h2>
          <p className="text-zinc-300 mt-4 max-w-md">Join thousands of customers and verified providers. Secure bookings, Khalti payments, and 24/7 support.</p>
        </div>
        <div className="relative grid grid-cols-3 gap-3">
          {[
            {k:"4.9/5", v:"Avg rating"},
            {k:"2.4k+", v:"Verified pros"},
            {k:"Secure", v:"Khalti payments"},
          ].map(s=> (
            <div key={s.k} className="rounded-2xl bg-white/10 border border-white/20 backdrop-blur p-4 text-center">
              <div className="text-xl font-extrabold">{s.k}</div>
              <div className="text-xs text-zinc-300">{s.v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
