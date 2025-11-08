// Types for Knot API responses
// These will be updated once Knot SDK documentation is available

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
  connected_at: string
  last_sync?: string
}

export interface KnotConnectionResponse {
  connection: KnotConnection
  link_token?: string
}

