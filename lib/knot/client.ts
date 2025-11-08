// Knot SDK client wrapper
// This will be implemented once Knot SDK documentation is available

export class KnotClient {
  private apiKey: string
  private apiSecret?: string

  constructor(apiKey: string, _apiSecret?: string) {
    this.apiKey = apiKey
    this.apiSecret = _apiSecret
  }

  async initializeConnection(_userId: string, _merchant: string): Promise<{ id: string }> {
    // Placeholder for Knot SDK initialization
    // This will connect a user's merchant account (DoorDash, Uber Eats)
    throw new Error('Knot SDK integration pending - awaiting SDK documentation')
  }

  async getTransactions(_connectionId: string, _startDate?: Date, _endDate?: Date): Promise<unknown[]> {
    // Placeholder for fetching transaction data
    throw new Error('Knot SDK integration pending - awaiting SDK documentation')
  }

  async disconnectConnection(_connectionId: string) {
    // Placeholder for disconnecting a merchant connection
    throw new Error('Knot SDK integration pending - awaiting SDK documentation')
  }
}

export function createKnotClient(apiKey: string, _apiSecret?: string) {
  return new KnotClient(apiKey, _apiSecret)
}

