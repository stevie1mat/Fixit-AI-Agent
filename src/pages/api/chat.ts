import { NextApiRequest, NextApiResponse } from 'next'
import { ShopifyAPI } from '@/lib/shopify'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Chat API called with method:', req.method)
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('Request body:', req.body)
    const { message, storeData } = req.body

    if (!message) {
      console.log('No message provided')
      return res.status(400).json({ error: 'Message is required' })
    }

    console.log('Processing message:', message)

    // If store data is provided, use it; otherwise, scan the store
    let storeInfo = ''
    if (storeData && storeData.connections && storeData.connections.length > 0) {
      const connection = storeData.connections[0] // Use first connection
      
      if (!connection.accessToken) {
        storeInfo = 'Store connected but access token not available. Please reconnect your store in settings.'
      } else {
        try {
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
        } catch (error) {
          console.error('Error scanning store:', error)
          storeInfo = 'Store connected but unable to scan data at the moment.'
        }
      }
    }

    // Set up streaming response
    res.setHeader('Content-Type', 'text/plain')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    // Call Gemini API for AI analysis (non-streaming first to test)
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are Fix It AI, an expert e-commerce assistant that helps fix issues in Shopify and WordPress stores.

Your capabilities include:
- Shopify: Product management, theme editing, discount creation, shipping configuration
- WordPress: Content editing, SEO optimization, plugin management, performance improvements
- Analysis: Performance audits, SEO analysis, accessibility improvements

${storeInfo ? `Current Store Information:
${storeInfo}

You have access to the user's store data above. Use this information to provide specific, actionable advice.` : 'No store data available. Ask the user to connect their store first.'}

When a user asks for help, analyze their request and determine:
1. What platform they're working with (Shopify/WordPress)
2. What specific action is needed
3. What changes should be made based on their current store data

Respond in a helpful, conversational tone. If you need to make changes, explain what you'll do and ask for confirmation.

Example responses:
- "I can see you have ${storeInfo ? 'X products' : 'a Shopify store'}. I'll help you add a red badge to discounted products."
- "Based on your current theme setup, I can optimize your homepage for better performance."
- "I'll create a discount rule to exclude discounted items from free shipping in Canada."

User message: ${message}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        },
      }),
    })

    console.log('Gemini API response status:', geminiResponse.status)

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text()
      console.error('Gemini API error:', errorText)
      throw new Error(`Failed to get AI response: ${geminiResponse.status} ${errorText}`)
    }

    const responseData = await geminiResponse.json()
    console.log('Gemini API response data:', JSON.stringify(responseData, null, 2))

    if (responseData.candidates?.[0]?.content?.parts?.[0]?.text) {
      res.write(responseData.candidates[0].content.parts[0].text)
    } else {
      res.write('Sorry, I could not generate a response.')
    }

    res.end()
  } catch (error) {
    console.error('Chat API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
