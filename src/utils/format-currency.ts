export const formatCurrency = (value: number, currency: string = "VND") => {
  try {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value ?? 0)
  } catch {
    const fallback = Number.isFinite(value) ? Math.round(value) : 0
    return `${fallback.toLocaleString("vi-VN")} ${currency}`
  }
}

