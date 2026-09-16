export const formatINR = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`

export const formatCompactINR = (value) => {
  const n = Number(value || 0)
  if (Math.abs(n) >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`
  if (Math.abs(n) >= 100000) return `₹${(n / 100000).toFixed(2)}L`
  if (Math.abs(n) >= 1000) return `₹${(n / 1000).toFixed(1)}K`
  return formatINR(n)
}
