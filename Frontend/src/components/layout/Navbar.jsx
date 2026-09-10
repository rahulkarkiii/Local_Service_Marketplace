import { Link, NavLink, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { Search, Bell, User, LogOut, LayoutDashboard, Menu, X, Wrench, Sparkles } from "lucide-react"
import useAuthStore from "../../stores/authStore"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import client from "../../api/client"

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifCount, setNotifCount] = useState(0)

  const role = user?.role

  useEffect(() => {
    if (isAuthenticated()) {
      client.get("/notifications/").then(res => {
        const unread = Array.isArray(res.data) ? res.data.filter(n => !n.is_read).length : (res.data.results?.filter(n => !n.is_read).length || 0)
        setNotifCount(unread)
      }).catch(()=>{})
    }
  }, [user])

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  const dashboardLink = role === "ADMIN" ? "/admin" : role === "PROVIDER" ? "/provider" : role === "CUSTOMER" ? "/customer" : "/"

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 flex h-[64px] items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-600/20">
              <Wrench className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <div className="font-display font-bold text-[17px] leading-none tracking-tight">SewaNepal</div>
              <div className="text-[11px] text-muted-foreground font-medium tracking-wide uppercase -mt-0.5">Local Services</div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            <NavLink to="/services" className={({isActive})=>`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive?"bg-zinc-900 text-white":"text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"}`}>Services</NavLink>
            <NavLink to="/providers" className={({isActive})=>`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive?"bg-zinc-900 text-white":"text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"}`}>Providers</NavLink>
            <Link to="/#how-it-works" className="px-3 py-2 rounded-lg text-sm font-medium text-zinc-600 hover:bg-zinc-100">How it works</Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/services" className="hidden md:inline-flex h-9 w-9 items-center justify-center rounded-xl border bg-white hover:bg-zinc-50 transition-colors">
            <Search className="h-4 w-4 text-zinc-600" />
          </Link>

          {isAuthenticated() ? (
            <>
              <Link to="/notifications" className="relative hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-xl border bg-white hover:bg-zinc-50 transition-colors">
                <Bell className="h-4 w-4 text-zinc-600" />
                {notifCount > 0 && <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center">{notifCount>9? "9+": notifCount}</span>}
              </Link>
              <Link to={dashboardLink} className="hidden sm:inline-flex">
                <Button variant="secondary" size="sm" className="gap-1.5 rounded-xl">
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </Button>
              </Link>
              <div className="hidden sm:flex items-center gap-2 pl-2 ml-1 border-l">
                <div className="text-right hidden md:block">
                  <div className="text-sm font-semibold leading-none">{user?.username}</div>
                  <div className="text-xs text-muted-foreground capitalize">{role?.toLowerCase()}</div>
                </div>
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                  {user?.username?.[0]?.toUpperCase()}
                </div>
                <button onClick={handleLogout} className="h-9 w-9 grid place-items-center rounded-xl hover:bg-zinc-100 text-zinc-500">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="hidden sm:inline-flex">
                <Button variant="ghost" size="sm" className="rounded-xl">Log in</Button>
              </Link>
              <Link to="/register" className="hidden sm:inline-flex">
                <Button size="sm" className="rounded-xl bg-zinc-900 hover:bg-black text-white gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Get Started</Button>
              </Link>
            </>
          )}

          <button onClick={()=>setMobileOpen(!mobileOpen)} className="lg:hidden h-9 w-9 grid place-items-center rounded-xl border bg-white">
            {mobileOpen ? <X className="h-4 w-4"/> : <Menu className="h-4 w-4"/>}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t bg-white px-4 py-4 space-y-3 animate-slide-up">
          <Link to="/services" onClick={()=>setMobileOpen(false)} className="block py-2 font-medium">Services</Link>
          <Link to="/providers" onClick={()=>setMobileOpen(false)} className="block py-2 font-medium">Providers</Link>
          {isAuthenticated() ? (
            <div className="pt-3 border-t space-y-2">
              <Link to={dashboardLink} onClick={()=>setMobileOpen(false)}><Button className="w-full justify-start gap-2"><LayoutDashboard className="h-4 w-4" /> Dashboard</Button></Link>
              <Link to="/notifications" onClick={()=>setMobileOpen(false)} className="flex items-center justify-between py-2"><span className="font-medium">Notifications</span>{notifCount>0 && <Badge variant="destructive">{notifCount}</Badge>}</Link>
              <Link to="/profile" onClick={()=>setMobileOpen(false)} className="flex items-center gap-2 py-2"><User className="h-4 w-4"/> Profile</Link>
              <button onClick={handleLogout} className="w-full text-left py-2 text-red-600 font-medium flex items-center gap-2"><LogOut className="h-4 w-4"/> Log out</button>
            </div>
          ) : (
            <div className="pt-3 border-t grid grid-cols-2 gap-2">
              <Link to="/login" onClick={()=>setMobileOpen(false)}><Button variant="outline" className="w-full">Log in</Button></Link>
              <Link to="/register" onClick={()=>setMobileOpen(false)}><Button className="w-full">Sign up</Button></Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
