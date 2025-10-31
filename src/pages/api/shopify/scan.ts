import { NextApiRequest, NextApiResponse } from 'next'
import { ShopifyAPI } from '@/lib/shopify'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { storeUrl, accessToken, scanType } = req.body

    if (!storeUrl || !accessToken) {
      return res.status(400).json({ error: 'Store URL and access token are required' })
    }

    const shopify = new ShopifyAPI(storeUrl, accessToken)

    // Test connection first
    const isConnected = await shopify.testConnection()
    if (!isConnected) {
      return res.status(401).json({ error: 'Failed to connect to Shopify store' })
    }

    let scanData: any = {}

    // Perform different types of scans based on request
    switch (scanType) {
      case 'products': {
        const products = await shopify.getProducts(50)
        scanData.products = products
        break
      }

      case 'themes': {
        const themes = await shopify.getThemes()
        scanData.themes = themes
        break
      }

      case 'shipping': {
        const shippingZones = await shopify.getShippingZones()
        scanData.shippingZones = shippingZones
        break
      }

      case 'full':
      default: {
        // Perform comprehensive scan
        const [products, themes, shippingZones] = await Promise.all([
          shopify.getProducts(50),
          shopify.getThemes(),
          shopify.getShippingZones(),
        ])

        scanData = {
          products,
          themes,
          shippingZones,
          scanTimestamp: new Date().toISOString(),
        }
        break
      }
    }

    res.status(200).json({
      success: true,
      data: scanData,
      message: 'Shopify store scanned successfully',
    })
  } catch (error) {
    console.error('Shopify scan error:', error)
    res.status(500).json({ 
      error: 'Failed to scan Shopify store',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
