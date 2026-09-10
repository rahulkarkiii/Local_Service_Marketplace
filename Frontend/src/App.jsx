import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useEffect } from "react"
import Layout from "./components/layout/Layout"
import DashboardLayout from "./components/layout/DashboardLayout"
import Home from "./pages/Home"
import Services from "./pages/Services"
import ServiceDetail from "./pages/ServiceDetail"
import Providers from "./pages/Providers"
import ProviderDetail from "./pages/ProviderDetail"
import Login from "./pages/Login"
import Register from "./pages/Register"
import { ProtectedRoute, PublicOnly } from "./hooks/useRequireAuth"
import useAuthStore from "./stores/authStore"

// customer
import CustomerOverview from "./pages/customer/Overview"
import CustomerBookings from "./pages/customer/Bookings"
import CustomerPayments from "./pages/customer/Payments"
import CustomerReviews from "./pages/customer/Reviews"
import CustomerProfile from "./pages/customer/Profile"

// provider
import ProviderOverview from "./pages/provider/Overview"
import ProviderServices from "./pages/provider/Services"
import ProviderAvailability from "./pages/provider/Availability"
import ProviderBookings from "./pages/provider/Bookings"
import ProviderEarnings from "./pages/provider/Earnings"
import ProviderProfile from "./pages/provider/Profile"

// admin
import AdminOverview from "./pages/admin/Overview"
import AdminProviders from "./pages/admin/Providers"
import AdminCategories from "./pages/admin/Categories"
import AdminAnalytics from "./pages/admin/Analytics"
import AdminReports from "./pages/admin/Reports"
import AdminBookings from "./pages/admin/Bookings"
import AdminPayments from "./pages/admin/Payments"

// shared
import Notifications from "./pages/shared/Notifications"
import Reports from "./pages/shared/Reports"
import PaymentCallback from "./pages/shared/PaymentCallback"

function RoleRedirect() {
  const user = useAuthStore(s=>s.user)
  const token = useAuthStore(s=>s.accessToken)
  if (!token || !user) return <Navigate to="/login" replace />
  if (user.role === "ADMIN") return <Navigate to="/admin" replace />
  if (user.role === "PROVIDER") return <Navigate to="/provider" replace />
  return <Navigate to="/customer" replace />
}

export default function App() {
  const fetchMe = useAuthStore(s=>s.fetchMe)
  const token = useAuthStore(s=>s.accessToken)
  useEffect(()=> {
    if (token) fetchMe()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        {/* public layout */}
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="services" element={<Services />} />
          <Route path="services/:id" element={<ServiceDetail />} />
          <Route path="providers" element={<Providers />} />
          <Route path="providers/:id" element={<ProviderDetail />} />
          <Route path="payment/callback" element={<PaymentCallback />} />
          <Route path="notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          {/* fallback */}
          <Route path="profile" element={<RoleRedirect />} />
        </Route>

        {/* auth */}
        <Route path="login" element={<PublicOnly><Login /></PublicOnly>} />
        <Route path="register" element={<PublicOnly><Register /></PublicOnly>} />

        {/* customer dashboard */}
        <Route path="customer" element={<ProtectedRoute roles={["CUSTOMER"]}><DashboardLayout role="CUSTOMER" /></ProtectedRoute>}>
          <Route index element={<CustomerOverview />} />
          <Route path="bookings" element={<CustomerBookings />} />
          <Route path="payments" element={<CustomerPayments />} />
          <Route path="reviews" element={<CustomerReviews />} />
          <Route path="profile" element={<CustomerProfile />} />
        </Route>

        {/* provider dashboard */}
        <Route path="provider" element={<ProtectedRoute roles={["PROVIDER"]}><DashboardLayout role="PROVIDER" /></ProtectedRoute>}>
          <Route index element={<ProviderOverview />} />
          <Route path="services" element={<ProviderServices />} />
          <Route path="availability" element={<ProviderAvailability />} />
          <Route path="bookings" element={<ProviderBookings />} />
          <Route path="earnings" element={<ProviderEarnings />} />
          <Route path="profile" element={<ProviderProfile />} />
        </Route>

        {/* admin dashboard */}
        <Route path="admin" element={<ProtectedRoute roles={["ADMIN"]}><DashboardLayout role="ADMIN" /></ProtectedRoute>}>
          <Route index element={<AdminOverview />} />
          <Route path="providers" element={<AdminProviders />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="analytics" element={<AdminAnalytics />} />
        </Route>

        {/* catch all */}
        <Route path="*" element={<div className="min-h-[60vh] grid place-items-center p-8 text-center"><div><h1 className="text-4xl font-extrabold">404</h1><p className="text-muted-foreground mt-2">Page not found.</p><a href="/" className="text-violet-600 underline mt-4 inline-block">Go home</a></div></div>} />
      </Routes>
    </BrowserRouter>
  )
}
