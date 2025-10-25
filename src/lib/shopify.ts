import axios from 'axios'

export interface ShopifyProduct {
  id: number
  title: string
  handle: string
  tags: string[]
  variants: any[]
  images: any[]
  price: string
  compare_at_price?: string
}

export interface ShopifyTheme {
  id: number
  name: string
  role: string
  previewable: boolean
}

export class ShopifyAPI {
  private storeUrl: string
  private accessToken: string
  private baseUrl: string

  constructor(storeUrl: string, accessToken: string) {
    this.storeUrl = storeUrl
    this.accessToken = accessToken
    // Clean the store URL and use the latest API version
    const cleanStoreUrl = storeUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')
    this.baseUrl = `https://${cleanStoreUrl}/admin/api/2025-01`
  }

  private getHeaders() {
    return {
      'X-Shopify-Access-Token': this.accessToken,
      'Content-Type': 'application/json',
    }
  }

  async getProducts(limit = 50): Promise<ShopifyProduct[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/products.json`, {
        headers: this.getHeaders(),
        params: { limit },
      })
      return response.data.products
    } catch (error) {
      console.error('Error fetching Shopify products:', error)
      throw error
    }
  }

  async getProduct(id: number): Promise<ShopifyProduct> {
    try {
      const response = await axios.get(`${this.baseUrl}/products/${id}.json`, {
        headers: this.getHeaders(),
      })
      return response.data.product
    } catch (error) {
      console.error('Error fetching Shopify product:', error)
      throw error
    }
  }

  async updateProduct(id: number, productData: Partial<ShopifyProduct>): Promise<ShopifyProduct> {
    try {
      const response = await axios.put(`${this.baseUrl}/products/${id}.json`, {
        product: productData,
      }, {
        headers: this.getHeaders(),
      })
      return response.data.product
    } catch (error) {
      console.error('Error updating Shopify product:', error)
      throw error
    }
  }

  async getThemes(): Promise<ShopifyTheme[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/themes.json`, {
        headers: this.getHeaders(),
      })
      return response.data.themes
    } catch (error) {
      console.error('Error fetching Shopify themes:', error)
      throw error
    }
  }

  async getThemeAssets(themeId: number): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/themes/${themeId}/assets.json`, {
        headers: this.getHeaders(),
      })
      return response.data.assets
    } catch (error) {
      console.error('Error fetching theme assets:', error)
      throw error
    }
  }

  async updateThemeAsset(themeId: number, assetKey: string, content: string): Promise<any> {
    try {
      const response = await axios.put(`${this.baseUrl}/themes/${themeId}/assets.json`, {
        asset: {
          key: assetKey,
          value: content,
        },
      }, {
        headers: this.getHeaders(),
      })
      return response.data.asset
    } catch (error) {
      console.error('Error updating theme asset:', error)
      throw error
    }
  }

  async createDiscount(discountData: any): Promise<any> {
    try {
      const response = await axios.post(`${this.baseUrl}/price_rules.json`, {
        price_rule: discountData,
      }, {
        headers: this.getHeaders(),
      })
      return response.data.price_rule
    } catch (error) {
      console.error('Error creating discount:', error)
      throw error
    }
  }

  async getShippingZones(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/shipping_zones.json`, {
        headers: this.getHeaders(),
      })
      return response.data.shipping_zones
    } catch (error) {
      console.error('Error fetching shipping zones:', error)
      throw error
    }
  }

  async updateShippingZone(zoneId: number, zoneData: any): Promise<any> {
    try {
      const response = await axios.put(`${this.baseUrl}/shipping_zones/${zoneId}.json`, {
        shipping_zone: zoneData,
      }, {
        headers: this.getHeaders(),
      })
      return response.data.shipping_zone
    } catch (error) {
      console.error('Error updating shipping zone:', error)
      throw error
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing Shopify connection to:', this.baseUrl)
      const response = await axios.get(`${this.baseUrl}/shop.json`, {
        headers: this.getHeaders(),
        timeout: 10000, // 10 second timeout
      })
      console.log('Shopify connection successful:', response.status)
      return true
    } catch (error) {
      console.error('Shopify connection test failed:', error)
      if (axios.isAxiosError(error)) {
        console.error('Response status:', error.response?.status)
        console.error('Response data:', error.response?.data)
      }
      return false
    }
  }
}
