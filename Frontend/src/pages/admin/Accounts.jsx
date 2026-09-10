import { useEffect, useState, useMemo } from "react"
import client from "../../api/client"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Input, Select } from "../../components/ui/input"
import { Search, Users, Shield, UserCheck, UserX, Trash2, X, AlertTriangle } from "lucide-react"

function RoleBadge({ role }) {
  const map = {
    CUSTOMER: "info",
    PROVIDER: "default",
    ADMIN: "secondary",
  }
  return <Badge variant={map[role] || "neutral"}>{role}</Badge>
}

function StatusBadge({ is_active }) {
  return is_active ? <Badge variant="success">Active</Badge> : <Badge variant="destructive">Suspended</Badge>
}

function formatDate(dt) {
  if (!dt) return "—"
  try {
    return new Date(dt).toLocaleDateString("en-NP", { year: "numeric", month: "short", day: "numeric" })
  } catch { return dt }
}
function formatDateTime(dt) {
  if (!dt) return "—"
  try {
    return new Date(dt).toLocaleString("en-NP", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
  } catch { return dt }
}

export default function AdminAccounts() {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [msg, setMsg] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [search, setSearch] = useState("")
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)

  const fetch = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await client.get("/accounts/accounts/")
      const data = Array.isArray(res.data) ? res.data : res.data.results || []
      setAccounts(data)
    } catch (e) {
      const d = e.response?.data
      setError(d?.detail || (typeof d === "string" ? d : JSON.stringify(d)) || "Failed to load accounts. Ensure you are logged in as ADMIN.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch() }, [])

  const filtered = useMemo(() => {
    return accounts.filter(a => {
      if (roleFilter && a.role !== roleFilter) return false
      if (statusFilter === "active" && !a.is_active) return false
      if (statusFilter === "suspended" && a.is_active) return false
      if (search) {
        const q = search.toLowerCase()
        if (!`${a.username} ${a.email} ${a.first_name} ${a.last_name}`.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [accounts, roleFilter, statusFilter, search])

  const toggleActive = async (acc) => {
    const newActive = !acc.is_active
    setActionLoading(acc.id)
    setError(""); setMsg("")
    try {
      const res = await client.patch(`/accounts/accounts/${acc.id}/`, { is_active: newActive })
      setAccounts(prev => prev.map(x => x.id === acc.id ? { ...x, is_active: res.data.is_active } : x))
      setMsg(`User @${acc.username} has been ${newActive ? "reactivated" : "suspended"}.`)
    } catch (e) {
      const d = e.response?.data
      setError(d?.detail || JSON.stringify(d) || "Failed to update status")
    } finally {
      setActionLoading(null)
    }
  }

  const changeRole = async (acc, newRole) => {
    if (newRole === acc.role) return
    setActionLoading(acc.id)
    setError(""); setMsg("")
    try {
      const res = await client.patch(`/accounts/accounts/${acc.id}/`, { role: newRole })
      setAccounts(prev => prev.map(x => x.id === acc.id ? { ...x, role: res.data.role } : x))
      setMsg(`Role for @${acc.username} changed to ${newRole}.`)
    } catch (e) {
      const d = e.response?.data
      setError(d?.detail || JSON.stringify(d) || "Failed to change role")
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setActionLoading(deleteTarget.id)
    setError(""); setMsg("")
    try {
      await client.delete(`/accounts/accounts/${deleteTarget.id}/`)
      setAccounts(prev => prev.filter(x => x.id !== deleteTarget.id))
      setMsg(`Account @${deleteTarget.username} deleted.`)
      setDeleteTarget(null)
    } catch (e) {
      const d = e.response?.data
      setError(d?.detail || JSON.stringify(d) || "Failed to delete")
    } finally {
      setActionLoading(null)
    }
  }

  const counts = useMemo(() => {
    return {
      total: accounts.length,
      customers: accounts.filter(a => a.role === "CUSTOMER").length,
      providers: accounts.filter(a => a.role === "PROVIDER").length,
      admins: accounts.filter(a => a.role === "ADMIN").length,
      active: accounts.filter(a => a.is_active).length,
      suspended: accounts.filter(a => !a.is_active).length,
    }
  }, [accounts])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2.5"><Users className="h-7 w-7 text-violet-600" /> Accounts</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">Manage all platform users. Suspend, change roles, or remove accounts. Admin-only via <code className="px-1.5 py-0.5 rounded bg-muted border text-xs">GET /api/accounts/accounts/</code>.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-600 text-white font-bold"><Users className="h-3 w-3" />{counts.total} total</span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-600 text-white font-bold">{counts.active} active</span>
          {counts.suspended > 0 && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-600 text-white font-bold">{counts.suspended} suspended</span>}
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-violet-100 dark:bg-violet-900/30 grid place-items-center"><Users className="h-5 w-5 text-violet-600" /></div>
          <div><div className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Total</div><div className="text-xl font-extrabold leading-none">{counts.total}</div></div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-sky-100 dark:bg-sky-900/30 grid place-items-center"><UserCheck className="h-5 w-5 text-sky-600" /></div>
          <div><div className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Customers</div><div className="text-xl font-extrabold leading-none">{counts.customers}</div></div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-violet-100 dark:bg-violet-900/30 grid place-items-center"><Shield className="h-5 w-5 text-violet-600" /></div>
          <div><div className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Providers</div><div className="text-xl font-extrabold leading-none">{counts.providers}</div></div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 grid place-items-center"><Shield className="h-5 w-5 text-zinc-600 dark:text-zinc-300" /></div>
          <div><div className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Admins</div><div className="text-xl font-extrabold leading-none">{counts.admins}</div></div>
        </Card>
        <Card className="p-4 flex items-center gap-3 border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20">
          <div className="h-9 w-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 grid place-items-center"><UserCheck className="h-5 w-5 text-emerald-600" /></div>
          <div><div className="text-[11px] font-bold tracking-widest uppercase text-emerald-700 dark:text-emerald-400">Active</div><div className="text-xl font-extrabold leading-none">{counts.active}</div></div>
        </Card>
        <Card className="p-4 flex items-center gap-3 border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20">
          <div className="h-9 w-9 rounded-xl bg-red-100 dark:bg-red-900/30 grid place-items-center"><UserX className="h-5 w-5 text-red-600" /></div>
          <div><div className="text-[11px] font-bold tracking-widest uppercase text-red-700 dark:text-red-400">Suspended</div><div className="text-xl font-extrabold leading-none">{counts.suspended}</div></div>
        </Card>
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-300 dark:border-red-900/50 border border-red-200 rounded-xl p-3">{error}</div>}
      {msg && <div className="text-sm text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/50 border border-emerald-200 rounded-xl p-3">{msg}</div>}

      {/* Filters */}
      <Card className="p-4">
        <div className="grid sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2 relative">
            <label className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Search</label>
            <div className="relative mt-1.5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Username or email..." className="pl-9" />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Role</label>
            <Select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="mt-1.5">
              <option value="">All roles</option>
              <option value="CUSTOMER">Customer</option>
              <option value="PROVIDER">Provider</option>
              <option value="ADMIN">Admin</option>
            </Select>
          </div>
          <div>
            <label className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Status</label>
            <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="mt-1.5">
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </Select>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <span>Showing {filtered.length} of {accounts.length}</span>
          {(roleFilter || statusFilter || search) && (
            <button
              onClick={() => { setRoleFilter(""); setStatusFilter(""); setSearch("") }}
              className="inline-flex items-center gap-1 text-violet-600 dark:text-violet-400 font-semibold hover:underline"
            >
              <X className="h-3 w-3" /> Clear filters
            </button>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            <span>All accounts ({filtered.length})</span>
            <span className="text-xs font-normal text-muted-foreground hidden sm:inline">ID • Username • Email • Role • Status • Joined • Last login</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Loading accounts…</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto h-14 w-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 grid place-items-center"><Users className="h-7 w-7 text-zinc-400" /></div>
              <h3 className="font-semibold mt-4">No accounts match filters</h3>
              <p className="text-sm text-muted-foreground mt-1">Try clearing role/status or search.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="table-header">
                  <tr>
                    <th className="text-left py-3 px-4 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">ID</th>
                    <th className="text-left py-3 px-4 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Username</th>
                    <th className="text-left py-3 px-4 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Email</th>
                    <th className="text-left py-3 px-4 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Role</th>
                    <th className="text-left py-3 px-4 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Date joined</th>
                    <th className="text-left py-3 px-4 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Last login</th>
                    <th className="text-right py-3 px-4 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(acc => (
                    <tr key={acc.id} className="table-row">
                      <td className="py-3.5 px-4 font-mono text-xs font-bold">#{acc.id}</td>
                      <td className="py-3.5 px-4 font-semibold">{acc.username}</td>
                      <td className="py-3.5 px-4 text-muted-foreground max-w-[180px] truncate" title={acc.email}>{acc.email}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <RoleBadge role={acc.role} />
                          <Select
                            value={acc.role}
                            onChange={e => changeRole(acc, e.target.value)}
                            className="h-7 text-xs py-0 px-2 w-[130px] rounded-full border-2"
                            disabled={actionLoading === acc.id}
                          >
                            <option value="CUSTOMER">CUSTOMER</option>
                            <option value="PROVIDER">PROVIDER</option>
                            <option value="ADMIN">ADMIN</option>
                          </Select>
                        </div>
                      </td>
                      <td className="py-3.5 px-4"><StatusBadge is_active={acc.is_active} /></td>
                      <td className="py-3.5 px-4 text-xs whitespace-nowrap">{formatDate(acc.date_joined)}</td>
                      <td className="py-3.5 px-4 text-xs whitespace-nowrap text-muted-foreground">{formatDateTime(acc.last_login)}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant={acc.is_active ? "destructive" : "default"}
                            className={`h-7 rounded-full text-xs font-bold px-3 ${acc.is_active ? "" : "bg-emerald-600 hover:bg-emerald-700 border-emerald-600 text-white"}`}
                            onClick={() => toggleActive(acc)}
                            disabled={actionLoading === acc.id}
                          >
                            {actionLoading === acc.id ? "…" : acc.is_active ? (
                              <span className="inline-flex items-center gap-1"><UserX className="h-3 w-3" /> Suspend</span>
                            ) : (
                              <span className="inline-flex items-center gap-1"><UserCheck className="h-3 w-3" /> Reactivate</span>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 p-0 rounded-full border-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40 dark:border-red-900/50"
                            onClick={() => setDeleteTarget(acc)}
                            disabled={actionLoading === acc.id}
                            title="Delete account"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-card border-2 shadow-soft rounded-2xl w-full max-w-md p-6 animate-slide-up">
            <div className="h-12 w-12 rounded-2xl bg-red-100 dark:bg-red-900/30 grid place-items-center mx-auto">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-center font-bold text-lg mt-4">Delete account?</h3>
            <p className="text-center text-sm text-muted-foreground mt-2">
              This will permanently delete <span className="font-semibold text-foreground">@{deleteTarget.username}</span> ({deleteTarget.email}) and cannot be undone.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button variant="outline" className="rounded-xl" onClick={() => setDeleteTarget(null)} disabled={actionLoading === deleteTarget.id}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="rounded-xl"
                onClick={handleDelete}
                disabled={actionLoading === deleteTarget.id}
              >
                {actionLoading === deleteTarget.id ? "Deleting…" : <span className="inline-flex items-center gap-1.5"><Trash2 className="h-4 w-4" /> Delete</span>}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
