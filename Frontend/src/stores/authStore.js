import { create } from "zustand"
import client from "../api/client"

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem("user") || "null"),
  accessToken: localStorage.getItem("access_token"),
  refreshToken: localStorage.getItem("refresh_token"),
  loading: false,
  initialized: false,

  isAuthenticated: () => !!get().accessToken && !!get().user,

  setAuth: ({ user, access, refresh }) => {
    if (access) localStorage.setItem("access_token", access)
    if (refresh) localStorage.setItem("refresh_token", refresh)
    if (user) localStorage.setItem("user", JSON.stringify(user))
    set({ user, accessToken: access || get().accessToken, refreshToken: refresh || get().refreshToken })
  },

  login: async (username, password) => {
    set({ loading: true })
    try {
      const { data } = await client.post("/accounts/login/", { username, password })
      const access = data.access
      const refresh = data.refresh
      localStorage.setItem("access_token", access)
      localStorage.setItem("refresh_token", refresh)
      // fetch me
      const meRes = await client.get("/accounts/me/", {
        headers: { Authorization: `Bearer ${access}` },
      })
      const user = meRes.data
      localStorage.setItem("user", JSON.stringify(user))
      set({ user, accessToken: access, refreshToken: refresh, loading: false })
      return user
    } catch (e) {
      set({ loading: false })
      throw e
    }
  },

  register: async (payload) => {
    const { data } = await client.post("/accounts/register/", payload)
    return data
  },

  fetchMe: async () => {
    try {
      const { data } = await client.get("/accounts/me/")
      localStorage.setItem("user", JSON.stringify(data))
      set({ user: data, initialized: true })
      return data
    } catch {
      set({ initialized: true })
      return null
    }
  },

  logout: () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("user")
    set({ user: null, accessToken: null, refreshToken: null })
  },
}))

export default useAuthStore
