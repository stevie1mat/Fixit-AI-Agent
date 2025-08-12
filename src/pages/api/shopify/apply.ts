import { NextApiRequest, NextApiResponse } from 'next'
import { ShopifyAPI } from '@/lib/shopify'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { storeUrl, accessToken, changes, previewId } = req.body

    if (!storeUrl || !accessToken || !changes) {
      return res.status(400).json({ error: 'Store URL, access token, and changes are required' })
    }

    const shopify = new ShopifyAPI(storeUrl, accessToken)

    // Test connection first
    const isConnected = await shopify.testConnection()
    if (!isConnected) {
      return res.status(401).json({ error: 'Failed to connect to Shopify store' })
    }

    const results: any[] = []
    const errors: any[] = []

    // Apply changes based on the type
    for (const change of changes) {
      try {
        switch (change.type) {
          case 'product_update':
            const updatedProduct = await shopify.updateProduct(change.productId, change.data)
            results.push({
              type: 'product_update',
              id: change.productId,
              result: updatedProduct,
            })
            break

          case 'theme_asset_update':
            const updatedAsset = await shopify.updateThemeAsset(
              change.themeId,
              change.assetKey,
              change.content
            )
            results.push({
              type: 'theme_asset_update',
              themeId: change.themeId,
              assetKey: change.assetKey,
              result: updatedAsset,
            })
            break

          case 'discount_create':
            const newDiscount = await shopify.createDiscount(change.data)
            results.push({
              type: 'discount_create',
              result: newDiscount,
            })
            break

          case 'shipping_update':
            const updatedShipping = await shopify.updateShippingZone(
              change.zoneId,
              change.data
            )
            results.push({
              type: 'shipping_update',
              zoneId: change.zoneId,
              result: updatedShipping,
            })
            break

          default:
            errors.push({
              type: change.type,
              error: 'Unknown change type',
            })
        }
      } catch (error) {
        errors.push({
          type: change.type,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    // Log the changes
    if (results.length > 0) {
      try {
        await fetch('/api/logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'shopify',
            operation: 'apply',
            description: `Applied ${results.length} changes to Shopify store`,
            beforeState: null, // Could store previous state if needed
            afterState: results,
            status: errors.length > 0 ? 'partial' : 'success',
            error: errors.length > 0 ? JSON.stringify(errors) : null,
            metadata: {
              previewId,
              storeUrl,
              changesCount: results.length,
              errorsCount: errors.length,
            },
          }),
        })
      } catch (logError) {
        console.error('Failed to log changes:', logError)
      }
    }

    res.status(200).json({
      success: true,
      results,
      errors,
      message: `Applied ${results.length} changes successfully${errors.length > 0 ? ` with ${errors.length} errors` : ''}`,
    })
  } catch (error) {
    console.error('Shopify apply error:', error)
    res.status(500).json({ 
      error: 'Failed to apply changes to Shopify store',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
