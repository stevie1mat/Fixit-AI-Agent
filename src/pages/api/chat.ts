import { NextApiRequest, NextApiResponse } from 'next'
import { ShopifyAPI } from '@/lib/shopify'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { message, storeData } = req.body

    if (!message) {
      return res.status(400).json({ error: 'Message is required' })
    }

    // If store data is provided, use it; otherwise, scan the store
    let storeInfo = ''
    console.log('Received store data:', JSON.stringify(storeData, null, 2))
    
    if (storeData && storeData.connections && storeData.connections.length > 0) {
      // Find the first connection with an access token
      const connection = storeData.connections.find(conn => conn.accessToken) || storeData.connections[0]
      console.log('Connection found:', connection)
      
      if (!connection.accessToken) {
        console.log('No access token found')
        storeInfo = 'Store connected but access token not available. Please reconnect your store in settings.'
      } else {
        try {
          console.log('Attempting to connect to Shopify with URL:', connection.url)
          const shopify = new ShopifyAPI(connection.url, connection.accessToken)
          
          // Scan store data
          const products = await shopify.getProducts(10) // Get first 10 products
          const themes = await shopify.getThemes()
          
          storeInfo = `
Current Store Data:
- Store URL: ${connection.url}
- Products: ${products.length} products found
- Themes: ${themes.length} themes found
- Main theme: ${themes.find(t => t.role === 'main')?.name || 'Unknown'}

Recent Products:
${products.slice(0, 5).map(p => `- ${p.title} (${p.variants.length} variants)`).join('\n')}
          `.trim()
          console.log('Successfully retrieved store data')
        } catch (error) {
          console.error('Error scanning store:', error)
          storeInfo = `Store connected but unable to scan data at the moment. Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      }
    } else {
      console.log('No store data or connections found')
    }

    // Set up streaming response
    res.setHeader('Content-Type', 'text/plain')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    // Generate AI response based on store data and user message
    let aiResponse = ''
    
    if (storeInfo) {
      // User has store data available
      if (message.toLowerCase().includes('product') || message.toLowerCase().includes('show')) {
        aiResponse = `Great! I can see your store data. Here's what I found:

${storeInfo}

I can help you with:
- Product management and optimization
- Theme customization and improvements
- Creating discounts and promotions
- Shipping configuration
- SEO and performance optimization

What specific changes would you like me to help you with?`
      } else {
        aiResponse = `I have access to your store data and I'm ready to help! I can see:

${storeInfo}

I can assist you with product management, theme customization, creating discounts, shipping configuration, and much more. Just let me know what you'd like to work on!`
      }
    } else {
      // No store data available
      aiResponse = `I'd love to help you with that! However, I need to reconnect your store to access the current data. Since I'm not able to retrieve your store's information directly, could you please reconnect your store in the settings so I can get the most up-to-date information about your products?

Once I have access to your store data, I'll be happy to show you your current products and provide any assistance you need.`
    }

    // Send the response
    res.write(aiResponse)

    res.end()
  } catch (error) {
    console.error('Chat API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
