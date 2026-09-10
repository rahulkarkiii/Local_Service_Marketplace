import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price) {
  const n = Number(price)
  if (isNaN(n)) return price
  return new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    maximumFractionDigits: 0,
  }).format(n)
}

export function formatDate(dateStr) {
  if (!dateStr) return "-"
  try {
    return new Date(dateStr).toLocaleDateString("en-NP", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch { return dateStr }
}

export function formatDateTime(dateStr) {
  if (!dateStr) return "-"
  try {
    return new Date(dateStr).toLocaleString("en-NP", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch { return dateStr }
}
