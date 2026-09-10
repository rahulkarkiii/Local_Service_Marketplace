import { Navigate } from "react-router-dom"
import useAuthStore from "../stores/authStore"

export function ProtectedRoute({ children, roles }) {
  const user = useAuthStore(s=>s.user)
  const token = useAuthStore(s=>s.accessToken)
  if (!token || !user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

export function PublicOnly({ children }) {
  const token = useAuthStore(s=>s.accessToken)
  const user = useAuthStore(s=>s.user)
  if (token && user) {
    if (user.role === "ADMIN") return <Navigate to="/admin" replace />
    if (user.role === "PROVIDER") return <Navigate to="/provider" replace />
    return <Navigate to="/customer" replace />
  }
  return children
}
