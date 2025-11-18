export interface GroceryItem {
  id: string
  name: string
  brand: string
  price: number
  weight: string
  quantity: number
  timestamp: number
  imageUrl?: string
  priceTagImage?: string | null
  isAnalyzing?: boolean
}

export interface PriceTagAnalysisResponse {
  name: string
  brand: string
  price: number
  weight: number
  ocrText?: string
  allPrices?: string[]
  allItems?: string[]
}

export interface ShopSession {
  id: string
  shopName: string
  location: string
  date: string
  description?: string | null
  expectedDurationDays?: number | null
  shopType?: string | null
  budgetEstimate?: number | null
  budgetVariance?: number | null
  isOverBudget?: boolean | null
  displayBudget?: boolean
  debugMode?: boolean
  items: ShopItem[]
  status: 'active' | 'finalized'
  startedAt: number
  finalizedAt?: number | null
  satisfactionRating?: number | null
  comments?: string | null
  totalItems: number
  totalCost: number
}

export interface ShoppingSession extends ShopSession {
  items: ShoppingSessionItem[]
}

export interface ShopItem {
  id: string
  name: string
  brand: string
  price: number
  weight: number
  quantity: number
  timestamp: number
  priceTagImage?: string | null
  incorrectScan?: boolean | null
}

export interface ShoppingSessionItem extends ShopItem {
  addedAt?: string
}

export interface StartSessionRequest {
  shopName: string
  location: string
  date?: string
  description?: string
  expectedDurationDays?: number
  shopType?: string
  budgetEstimate?: number
}

export interface AddItemRequest {
  name: string
  brand: string
  price: number
  weight: number
  quantity: number
  priceTagImage?: string | null
  incorrectScan?: boolean | null
}

export interface ShopName {
  id: string
  name: string
  isApproved: boolean
  submittedBy: string | null
  submittedAt: number
  approvedAt: number | null
  approvedBy: string | null
}

export interface ShopNameSubmission {
  name: string
}
