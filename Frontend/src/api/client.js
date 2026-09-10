import axios from "axios"

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api"

const client = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
})

// request interceptor: attach access token
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token")
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// response interceptor: handle 401 refresh
let isRefreshing = false
let failedQueue = []

function processQueue(error, token = null) {
  failedQueue.forEach((p) => {
    if (error) p.reject(error)
    else p.resolve(token)
  })
  failedQueue = []
}

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      const refresh = localStorage.getItem("refresh_token")
      if (!refresh) {
        localStorage.clear()
        window.location.href = "/login"
        return Promise.reject(error)
      }
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`
          return client(original)
        })
      }
      original._retry = true
      isRefreshing = true
      try {
        const { data } = await axios.post(`${API_BASE}/accounts/token/refresh/`, {
          refresh,
        })
        const newAccess = data.access
        localStorage.setItem("access_token", newAccess)
        if (data.refresh) localStorage.setItem("refresh_token", data.refresh)
        client.defaults.headers.Authorization = `Bearer ${newAccess}`
        processQueue(null, newAccess)
        original.headers.Authorization = `Bearer ${newAccess}`
        return client(original)
      } catch (e) {
        processQueue(e, null)
        localStorage.clear()
        window.location.href = "/login"
        return Promise.reject(e)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)

export default client
export { API_BASE }
