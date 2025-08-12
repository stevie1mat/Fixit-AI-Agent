import { NextApiRequest, NextApiResponse } from 'next'
import { ShopifyAPI } from '@/lib/shopify'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { storeUrl, accessToken } = req.body

    if (!storeUrl || !accessToken) {
      return res.status(400).json({ error: 'Store URL and access token are required' })
    }

    const shopify = new ShopifyAPI(storeUrl, accessToken)

    // Test the connection
    const isConnected = await shopify.testConnection()

    if (isConnected) {
      res.status(200).json({
        success: true,
        message: 'Shopify connection successful',
        storeUrl,
      })
    } else {
      res.status(401).json({
        success: false,
        error: 'Failed to connect to Shopify store. Please check your credentials and ensure your access token has the correct permissions.',
      })
    }
  } catch (error) {
    console.error('Shopify test error:', error)
    res.status(500).json({ 
      error: 'Failed to test Shopify connection',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
