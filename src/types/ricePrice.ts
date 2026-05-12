export interface RicePricePoint {
  month: string   // "YYYY-MM"
  label: string   // "Mai '25"
  eurPerKg: number
  irrPerKg: number
}

export interface RicePriceCache {
  points: RicePricePoint[]
  fetchedAt: number
}
