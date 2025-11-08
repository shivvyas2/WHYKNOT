export interface KnotTransaction {
  id: string
  merchant: string
  amount: number
  currency: string
  date: string
  items?: KnotTransactionItem[]
  category?: string
}

export interface KnotTransactionItem {
  name: string
  quantity: number
  price: number
  category?: string
}

export interface KnotConnection {
  id: string
  merchant: string
  status: 'active' | 'inactive' | 'error'
  connectedAt: string
  lastSync?: string
}

