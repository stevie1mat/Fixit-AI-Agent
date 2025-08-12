import { NextApiRequest, NextApiResponse } from 'next'
import { ShopifyAPI } from '@/lib/shopify'
import { supabase } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { message, storeData, userId } = req.body

    if (!message) {
      return res.status(400).json({ error: 'Message is required' })
    }

    // Get store connections from database
    let storeInfo = ''
    let connection = null
    
    if (userId) {
      console.log('Fetching store connections for user:', userId)
      
      const { data: connections, error } = await supabase
        .from('store_connections')
        .select('*')
        .eq('user_id', userId)
        .eq('is_connected', true)
        .order('created_at', { ascending: false })
        .limit(1)

      if (error) {
        console.error('Error fetching store connections:', error)
      } else if (connections && connections.length > 0) {
        connection = connections[0]
        console.log('Found active store connection:', connection.url)
      }
    }

    // If no database connection found, fall back to frontend data
    if (!connection && storeData && storeData.connections && storeData.connections.length > 0) {
      connection = storeData.connections.find(conn => conn.accessToken) || storeData.connections[0]
      console.log('Using frontend store data as fallback')
    }

    if (connection) {
      if (!connection.access_token && !connection.accessToken) {
        console.log('No access token found')
        storeInfo = 'Store connected but access token not available. Please reconnect your store in settings.'
      } else {
        try {
          const accessToken = connection.access_token || connection.accessToken
          const storeUrl = connection.url
          
          console.log('Attempting to connect to Shopify with URL:', storeUrl)
          const shopify = new ShopifyAPI(storeUrl, accessToken)
          
          // Scan store data
          const products = await shopify.getProducts(10) // Get first 10 products
          const themes = await shopify.getThemes()
          
          // Store products globally for detailed responses
          global.storeProducts = products
          
          storeInfo = `
Current Store Data:
- Store URL: ${storeUrl}
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
      console.log('No store connections found in database or frontend data')
    }

    // Set up streaming response
    res.setHeader('Content-Type', 'text/plain')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    // Generate AI response based on store data and user message
    let aiResponse = ''
    
    if (storeInfo) {
      // Check if user is asking about a specific product
      const products = global.storeProducts || []
      const productQuery = message.toLowerCase()
      
      // Find if user is asking about a specific product
      const specificProduct = products.find(product => 
        product.title.toLowerCase().includes(productQuery.replace(/[^a-zA-Z0-9]/g, ' ').trim()) ||
        productQuery.includes(product.title.toLowerCase())
      )
      
      if (specificProduct) {
        // Provide detailed product information
        const variants = specificProduct.variants || []
        const firstVariant = variants[0] || {}
        
        aiResponse = `Here's detailed information about **${specificProduct.title}**:

**Product Details:**
- **Title:** ${specificProduct.title}
- **Product Type:** ${specificProduct.product_type || 'Not specified'}
- **Vendor:** ${specificProduct.vendor || 'Not specified'}
- **Status:** ${specificProduct.status || 'Active'}
- **Created:** ${new Date(specificProduct.created_at).toLocaleDateString()}

**Description:**
${specificProduct.body_html ? specificProduct.body_html.replace(/<[^>]*>/g, '') : 'No description available'}

**Variants:** ${variants.length} variant${variants.length !== 1 ? 's' : ''}
${variants.map((variant, index) => `
${index + 1}. **${variant.title}**
   - Price: $${variant.price}
   - SKU: ${variant.sku || 'Not specified'}
   - Inventory: ${variant.inventory_quantity || 0} available
   - Weight: ${variant.weight || 0} ${variant.weight_unit || 'g'}`).join('\n')}

**Tags:** ${specificProduct.tags ? specificProduct.tags.split(',').map(tag => tag.trim()).join(', ') : 'No tags'}

Would you like me to help you optimize this product, update its information, or make any other changes?`
      } else if (message.toLowerCase().includes('product') || message.toLowerCase().includes('show')) {
        // General product overview
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
