import { NextApiRequest, NextApiResponse } from 'next'
import { ShopifyAPI } from '@/lib/shopify'
import { supabase } from '@/lib/supabase'
import { AIContextManager } from '@/lib/ai-context'
import { AIFineTuningService } from '@/lib/ai-fine-tuning'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { message, storeData, userId } = req.body

    if (!message) {
      return res.status(400).json({ error: 'Message is required' })
    }

    // Initialize AI context manager and fine-tuning service
    let contextManager: AIContextManager | null = null
    let fineTuningService: AIFineTuningService | null = null
    
    if (userId) {
      contextManager = new AIContextManager(userId)
      fineTuningService = new AIFineTuningService(userId)
      await contextManager.loadContext()
    }

    // Get store connections from database
    let storeInfo = ''
    let connection = null
    let storeType: 'shopify' | 'wordpress' = 'shopify'
    
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
        storeType = connection.type as 'shopify' | 'wordpress'
        console.log('Found active store connection:', connection.url)
      }
    }

    // If no database connection found, fall back to frontend data
    if (!connection && storeData && storeData.connections && storeData.connections.length > 0) {
      connection = storeData.connections.find(conn => conn.accessToken) || storeData.connections[0]
      storeType = connection.type as 'shopify' | 'wordpress'
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
          
          console.log('Attempting to connect to store with URL:', storeUrl)
          
          let storeData: any = {}
          
          if (storeType === 'shopify') {
            const shopify = new ShopifyAPI(storeUrl, accessToken)
            
            // Scan store data
            const products = await shopify.getProducts(10) // Get first 10 products
            const themes = await shopify.getThemes()
            
            storeData = {
              products,
              themes,
              performance: {},
              seo: {}
            }
            
            storeInfo = `
Current Store Data:
- Store URL: ${storeUrl}
- Products: ${products.length} products found
- Themes: ${themes.length} themes found
- Main theme: ${themes.find(t => t.role === 'main')?.name || 'Unknown'}

Recent Products:
${products.slice(0, 5).map(p => `- ${p.title} (${p.variants.length} variants)`).join('\n')}
            `.trim()
          } else {
            // WordPress store data
            storeData = {
              products: [],
              themes: [],
              performance: {},
              seo: {}
            }
            
            storeInfo = `
Current Store Data:
- Store URL: ${storeUrl}
- Type: WordPress
- Connected and ready for optimization
            `.trim()
          }
          
          // Update AI context with store data
          if (contextManager) {
            await contextManager.addStoreContext(storeUrl, storeType, storeData)
          }
          
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

    // Generate context-aware AI response
    let aiResponse = ''
    
    if (contextManager) {
      // Generate context-aware prompt
      const contextualPrompt = contextManager.generateContextualPrompt(message)
      console.log('Contextual prompt generated:', contextualPrompt.substring(0, 200) + '...')
      
      // For now, we'll use the existing logic but with context awareness
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
        } else if (message.toLowerCase().includes('optimize') || message.toLowerCase().includes('improve')) {
          aiResponse = `I'll help you optimize your ${storeType} store! Based on your current setup, here are the key areas we can improve:

1. **Product Optimization**: Enhance descriptions, images, and pricing
2. **Performance**: Speed up your store loading times
3. **SEO**: Improve search engine visibility
4. **User Experience**: Enhance navigation and checkout flow

Let me know which area you'd like to focus on first!`
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
    } else {
      // Fallback for non-authenticated users
      if (storeInfo) {
        aiResponse = `I have access to your store data and I'm ready to help! I can see:

${storeInfo}

I can assist you with product management, theme customization, creating discounts, shipping configuration, and much more. Just let me know what you'd like to work on!`
      } else {
        aiResponse = `I'd love to help you with that! However, I need to reconnect your store to access the current data. Since I'm not able to retrieve your store's information directly, could you please reconnect your store in the settings so I can get the most up-to-date information about your products?

Once I have access to your store data, I'll be happy to show you your current products and provide any assistance you need.`
      }
    }

    // Send the response
    res.write(aiResponse)

    // Save conversation context and training data
    if (contextManager && fineTuningService && userId) {
      try {
        // Add conversation to context
        await contextManager.addConversationContext(message, aiResponse)
        
        // Determine category for training data
        let category = 'general'
        if (message.toLowerCase().includes('product')) category = 'product_optimization'
        else if (message.toLowerCase().includes('seo')) category = 'seo_optimization'
        else if (message.toLowerCase().includes('performance') || message.toLowerCase().includes('speed')) category = 'performance'
        else if (message.toLowerCase().includes('theme')) category = 'theme_optimization'
        
        // Collect training data
        await fineTuningService.collectTrainingData(
          message,
          aiResponse,
          category,
          storeType,
          connection?.url
        )
        
        console.log('Training data collected and context updated')
      } catch (error) {
        console.error('Error saving training data:', error)
      }
    }

    res.end()
  } catch (error) {
    console.error('Chat API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
