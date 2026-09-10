import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { LayoutDashboard, Calendar, Briefcase, CreditCard, Star, User, Clock, BarChart3, ShieldCheck, Flag, Bell, Settings, LogOut, Menu, X } from "lucide-react"
import { useState } from "react"
import useAuthStore from "../../stores/authStore"
import { Button } from "../ui/button"

function SidebarLink({ to, icon: Icon, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
          isActive ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
        }`
      }
    >
      <Icon className="h-[18px] w-[18px]" />
      {label}
    </NavLink>
  )
}

export default function DashboardLayout({ role }) {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  const customerLinks = [
    { to: "/customer", icon: LayoutDashboard, label: "Overview", end: true },
    { to: "/customer/bookings", icon: Calendar, label: "My Bookings" },
    { to: "/customer/payments", icon: CreditCard, label: "Payments" },
    { to: "/customer/reviews", icon: Star, label: "My Reviews" },
    { to: "/customer/profile", icon: User, label: "Profile" },
    { to: "/notifications", icon: Bell, label: "Notifications" },
    { to: "/reports", icon: Flag, label: "Reports" },
  ]

  const providerLinks = [
    { to: "/provider", icon: LayoutDashboard, label: "Overview", end: true },
    { to: "/provider/services", icon: Briefcase, label: "My Services" },
    { to: "/provider/bookings", icon: Calendar, label: "Bookings" },
    { to: "/provider/availability", icon: Clock, label: "Availability" },
    { to: "/provider/earnings", icon: CreditCard, label: "Earnings" },
    { to: "/provider/profile", icon: User, label: "Profile" },
    { to: "/notifications", icon: Bell, label: "Notifications" },
    { to: "/reports", icon: Flag, label: "Reports" },
  ]

  const adminLinks = [
    { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
    { to: "/admin/providers", icon: ShieldCheck, label: "Providers" },
    { to: "/admin/categories", icon: Briefcase, label: "Categories" },
    { to: "/admin/bookings", icon: Calendar, label: "Bookings" },
    { to: "/admin/payments", icon: CreditCard, label: "Payments" },
    { to: "/admin/reports", icon: Flag, label: "Reports" },
    { to: "/admin/analytics", icon: BarChart3, label: "Analytics" },
    { to: "/notifications", icon: Bell, label: "Notifications" },
  ]

  const links = role === "ADMIN" ? adminLinks : role === "PROVIDER" ? providerLinks : customerLinks
  const title = role === "ADMIN" ? "Admin Panel" : role === "PROVIDER" ? "Provider Hub" : "Customer Dashboard"

  return (
    <div className="min-h-[calc(100vh-64px)] bg-zinc-50 flex">
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={()=>setOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-[64px] lg:top-0 z-50 h-[calc(100vh-64px)] lg:h-[calc(100vh-64px)] w-[280px] bg-white border-r flex flex-col transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-display font-bold text-[15px]">{title}</div>
              <div className="text-xs text-muted-foreground">Welcome, {user?.username}</div>
            </div>
            <button onClick={()=>setOpen(false)} className="lg:hidden h-8 w-8 grid place-items-center rounded-lg hover:bg-zinc-100"><X className="h-4 w-4"/></button>
          </div>
          <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-zinc-50 border">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 grid place-items-center text-white font-bold">{user?.username?.[0]?.toUpperCase()}</div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">{user?.username}</div>
              <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
              <span className="inline-flex mt-1 text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">{role}</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {links.map(l => <SidebarLink key={l.to} {...l} />)}
        </nav>

        <div className="p-3 border-t space-y-2">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-600 hover:bg-red-50 hover:text-red-600 transition-colors">
            <LogOut className="h-[18px] w-[18px]" /> Log out
          </button>
          <div className="text-[11px] text-center text-muted-foreground">SewaNepal • Secure • Verified</div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0">
        <div className="lg:hidden sticky top-[64px] z-30 bg-white border-b px-4 py-3 flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={()=>setOpen(true)}><Menu className="h-4 w-4"/> Menu</Button>
          <span className="font-semibold text-sm">{title}</span>
        </div>
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
