export interface Connection {
  id: string
  storeType: 'shopify' | 'wordpress'
  storeUrl: string
  accessToken?: string
  username?: string
  appPassword?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export class ConnectionService {
  static async getConnections(): Promise<Connection[]> {
    const response = await fetch('/api/connections')
    if (!response.ok) {
      throw new Error('Failed to fetch connections')
    }
    const data = await response.json()
    return data.data || []
  }

  static async getWordPressConnections(): Promise<Connection[]> {
    const response = await fetch('/api/connections?type=wordpress')
    if (!response.ok) {
      throw new Error('Failed to fetch WordPress connections')
    }
    const data = await response.json()
    return data.data || []
  }

  static async getShopifyConnections(): Promise<Connection[]> {
    const response = await fetch('/api/connections?type=shopify')
    if (!response.ok) {
      throw new Error('Failed to fetch Shopify connections')
    }
    const data = await response.json()
    return data.data || []
  }

  static async createConnection(connectionData: {
    storeType: 'shopify' | 'wordpress'
    storeUrl: string
    accessToken?: string
    username?: string
    appPassword?: string
  }): Promise<Connection> {
    const response = await fetch('/api/connections', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(connectionData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create connection')
    }

    const data = await response.json()
    return data.data
  }

  static async updateConnection(id: string, updateData: {
    storeUrl?: string
    accessToken?: string
    username?: string
    appPassword?: string
    isActive?: boolean
  }): Promise<Connection> {
    const response = await fetch(`/api/connections/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update connection')
    }

    const data = await response.json()
    return data.data
  }

  static async deleteConnection(id: string): Promise<void> {
    const response = await fetch(`/api/connections/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete connection')
    }
  }
}
