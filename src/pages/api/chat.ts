import { NextApiRequest, NextApiResponse } from 'next'
import { ShopifyAPI } from '@/lib/shopify'
import { WordPressAPI } from '@/lib/wordpress'
import { supabase } from '@/lib/supabase'
import { AIContextManager } from '@/lib/ai-context'
import { AIFineTuningService } from '@/lib/ai-fine-tuning'
import { GrokIntegration } from '@/lib/grok-integration'

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
      connection = storeData.connections.find((conn: any) => conn.accessToken) || storeData.connections[0]
      storeType = connection?.type as 'shopify' | 'wordpress'
      console.log('Using frontend store data as fallback')
    }

    if (connection) {
      const storeUrl = connection.url
      
      if (storeType === 'shopify') {
        // Shopify requires access token
        if (!connection.access_token && !connection.accessToken) {
          console.log('No access token found for Shopify')
          storeInfo = 'Store connected but access token not available. Please reconnect your Shopify store in settings.'
        } else {
          try {
            const accessToken = connection.access_token || connection.accessToken
            
            console.log('Attempting to connect to Shopify store with URL:', storeUrl)
            
            const shopify = new ShopifyAPI(storeUrl, accessToken)
            
            // Scan store data
            const products = await shopify.getProducts(10) // Get first 10 products
            const themes = await shopify.getThemes()
            
            const storeData = {
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
            
            // Update AI context with store data
            if (contextManager) {
              await contextManager.addStoreContext(storeUrl, storeType, storeData)
            }
            
            console.log('Successfully retrieved Shopify store data')
          } catch (error) {
            console.error('Error scanning Shopify store:', error)
            storeInfo = `Store connected but unable to scan data at the moment. Error: ${error instanceof Error ? error.message : 'Unknown error'}`
          }
        }
      } else {
        // WordPress requires username and app password
        const username = (connection as any).username || connection.username
        const appPassword = (connection as any).app_password || (connection as any).appPassword || connection.appPassword
        
        if (!username || !appPassword) {
          console.log('WordPress credentials incomplete')
          storeInfo = 'WordPress site connected but credentials are incomplete. Please check your WordPress username and application password in settings.'
        } else {
          try {
            console.log('Attempting to connect to WordPress site with URL:', storeUrl)
            
            const wordpress = new WordPressAPI(storeUrl, username, appPassword)
            
            // Test connection first
            const isConnected = await wordpress.testConnection()
            
            if (!isConnected) {
              storeInfo = `WordPress site connected but unable to authenticate. Please verify your username and application password in settings.`
            } else {
              // Perform quick WordPress scan to get basic info
              const [posts, pages, postsCount, pagesCount] = await Promise.all([
                wordpress.getPosts(5).catch(() => []), // Get 5 posts for display
                wordpress.getPages(5).catch(() => []), // Get 5 pages for display
                wordpress.getPostsCount().catch(() => 0), // Get total posts count
                wordpress.getPagesCount().catch(() => 0) // Get total pages count
              ])
              
              const storeData = {
                posts,
                pages,
                plugins: [],
                theme: null,
                options: {},
                performance: {},
                seo: {}
              }
              
              storeInfo = `
WordPress Site Connected:
- Site URL: ${storeUrl}
- Posts: ${postsCount} total
- Pages: ${pagesCount} total
- Status: ✅ Connected and ready
              `.trim()
              
              // Update AI context with store data
              if (contextManager) {
                await contextManager.addStoreContext(storeUrl, storeType, storeData)
              }
              
              console.log('Successfully connected to WordPress site')
            }
          } catch (wpError) {
            console.error('Error connecting to WordPress:', wpError)
            storeInfo = `WordPress connection error: ${wpError instanceof Error ? wpError.message : 'Unable to connect'}. Please check your WordPress credentials in settings.`
          }
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
    const grokApiKey = process.env.GROK_API_KEY
    
    // Try to use Grok AI if API key is available
    if (grokApiKey && userId && contextManager) {
      try {
        const grokIntegration = new GrokIntegration(
          { apiKey: grokApiKey },
          userId
        )
        
        // Build context for Grok
        const grokContext = storeInfo ? { storeInfo, storeType, hasConnection: !!connection } : null
        
        const grokResponse = await grokIntegration.sendToGrok(
          message,
          grokContext,
          0.7
        )
        
        aiResponse = grokResponse.content
        console.log('Grok AI response generated successfully')
      } catch (error) {
        console.error('Error calling Grok API, falling back to template:', error)
        // Fall through to template responses
      }
    }
    
    // Fallback to template responses if Grok wasn't used
    if (!aiResponse) {
      if (contextManager) {
        // Generate context-aware prompt
        const contextualPrompt = contextManager.generateContextualPrompt(message)
        console.log('Contextual prompt generated:', contextualPrompt.substring(0, 200) + '...')
        
        // Handle general questions
        const lowerMessage = message.toLowerCase()
        const isWordPress = storeType === 'wordpress' || lowerMessage.includes('wordpress')
        const isShopify = storeType === 'shopify' || lowerMessage.includes('shopify')
        
        if (lowerMessage.includes('who are you') || lowerMessage.includes('what are you') || lowerMessage.includes('introduce yourself')) {
          aiResponse = `Hi! I'm Fix It AI, your intelligent e-commerce optimization assistant. I specialize in helping you improve and optimize your Shopify and WordPress stores.

${storeInfo ? `I can see your store is connected: ${storeInfo.substring(0, 100)}...` : 'I can help you connect your store and then assist with various optimizations.'}

I can help you with:
- **Product Management**: Optimize descriptions, images, pricing, and inventory
- **Theme Customization**: Improve your store's design and user experience
- **SEO Optimization**: Boost your search engine rankings
- **Performance Tuning**: Speed up your store
- **Shipping & Discounts**: Configure shipping rules and create promotions

What would you like to work on today?`
        } else if (lowerMessage.includes('scan') && (lowerMessage.includes('wordpress') || lowerMessage.includes('site') || isWordPress)) {
          // Perform WordPress scan - start with connection confirmation
          if (connection && storeType === 'wordpress') {
            try {
              const username = connection.username || (connection as any).username
              const appPassword = connection.app_password || connection.appPassword || (connection as any).appPassword
              const storeUrl = connection.url
              
              if (username && appPassword && storeUrl) {
                const wordpress = new WordPressAPI(storeUrl, username, appPassword)
                
                aiResponse = `🔍 **Testing WordPress connection...**\n\n`
                
                // Step 1: Test connection and get post count
                try {
                  const isConnected = await wordpress.testConnection()
                  
                  if (!isConnected) {
                    aiResponse += `❌ **Connection Failed**\n\n`
                    aiResponse += `I wasn't able to connect to your WordPress site. Please check:\n`
                    aiResponse += `- Your WordPress site URL is correct\n`
                    aiResponse += `- Your username and application password are valid\n`
                    aiResponse += `- Your WordPress site has REST API enabled\n`
                    aiResponse += `- There are no security plugins blocking API access\n\n`
                    aiResponse += `You can try updating your WordPress credentials in Settings.`
                  } else {
                    // Connection successful - get actual post and page counts
                    const [posts, postsCount, pagesCount] = await Promise.all([
                      wordpress.getPosts(5).catch(() => []), // Get 5 posts for display
                      wordpress.getPostsCount().catch(() => 0), // Get total posts count
                      wordpress.getPagesCount().catch(() => 0) // Get total pages count
                    ])
                    
                    aiResponse += `✅ **Connection Successful!**\n\n`
                    aiResponse += `I've successfully connected to your WordPress site at: **${storeUrl}**\n\n`
                    aiResponse += `**Quick Overview:**\n`
                    aiResponse += `- 📝 Total Posts: **${postsCount}**\n`
                    aiResponse += `- 📄 Total Pages: **${pagesCount}**\n\n`
                    
                    // Show a few recent posts as confirmation
                    if (posts.length > 0) {
                      aiResponse += `**Recent Posts:**\n`
                      posts.slice(0, 5).forEach((post: any) => {
                        const title = post.title?.rendered || post.title || 'Untitled'
                        aiResponse += `- ${title}\n`
                      })
                      aiResponse += `\n`
                    }
                    
                    aiResponse += `Would you like me to perform a full site scan? This will analyze:\n`
                    aiResponse += `- All plugins (active and inactive)\n`
                    aiResponse += `- Active theme details\n`
                    aiResponse += `- All pages and posts\n`
                    aiResponse += `- Site configuration\n\n`
                    aiResponse += `Just say "scan everything" or "full scan" to proceed!`
                    
                    // Update store info with basic connection confirmation
                    storeInfo = `WordPress site connected successfully. Found ${totalPosts.length > 0 ? totalPosts.length : (posts.length > 0 ? '1+' : '0')} posts.`
                  }
                } catch (testError) {
                  console.error('Error testing WordPress connection:', testError)
                  aiResponse += `❌ **Connection Error**\n\n`
                  aiResponse += `I encountered an error while testing the connection:\n\n`
                  aiResponse += `**Error:** ${testError instanceof Error ? testError.message : 'Unknown error'}\n\n`
                  aiResponse += `Please verify:\n`
                  aiResponse += `- Your WordPress site URL: ${storeUrl}\n`
                  aiResponse += `- Your username and application password are correct\n`
                  aiResponse += `- The WordPress REST API is enabled on your site\n`
                  aiResponse += `- No security plugins are blocking API access\n\n`
                  aiResponse += `You can update your WordPress credentials in Settings.`
                }
              } else {
                aiResponse = `I need your WordPress credentials to connect. Please ensure your WordPress site is properly connected in Settings with:\n\n`
                aiResponse += `- WordPress site URL\n`
                aiResponse += `- WordPress username\n`
                aiResponse += `- Application Password (created in WordPress → Users → Profile → Application Passwords)\n\n`
                aiResponse += `Once connected, I can test the connection and show you your site details.`
              }
            } catch (scanError) {
              console.error('Error performing WordPress scan:', scanError)
              aiResponse = `I encountered an error:\n\n`
              aiResponse += `**Error:** ${scanError instanceof Error ? scanError.message : 'Unknown error'}\n\n`
              aiResponse += `Please check your WordPress connection settings in the app.`
            }
          } else {
            aiResponse = `To scan your WordPress site, I need you to connect it first. Please go to Settings and add your WordPress site with your site URL, username, and application password.\n\n`
            aiResponse += `Once connected, I can test the connection and show you your site details.`
          }
        } else if (lowerMessage.includes('full scan') || lowerMessage.includes('scan everything') || (lowerMessage.includes('scan') && lowerMessage.includes('all'))) {
          // Perform full comprehensive scan after connection confirmed
          if (connection && storeType === 'wordpress') {
            try {
              const username = connection.username || (connection as any).username
              const appPassword = connection.app_password || connection.appPassword || (connection as any).appPassword
              const storeUrl = connection.url
              
              if (username && appPassword && storeUrl) {
                const wordpress = new WordPressAPI(storeUrl, username, appPassword)
                
                // Test connection first
                const isConnected = await wordpress.testConnection()
                if (!isConnected) {
                  aiResponse = `❌ Cannot perform full scan - connection test failed. Please check your WordPress credentials.`
                } else {
                  aiResponse = `🔍 **Performing comprehensive WordPress scan...**\n\n`
                  
                  // Perform comprehensive scan
                  const [posts, pages, plugins, theme, options] = await Promise.all([
                    wordpress.getPosts(20).catch(() => []),
                    wordpress.getPages(20).catch(() => []),
                    wordpress.getPlugins().catch(() => []),
                    wordpress.getTheme().catch(() => null),
                    wordpress.getOptions().catch(() => {})
                  ])
                  
                  const activeTheme = theme ? theme.name : 'Unknown'
                  const activePlugins = Array.isArray(plugins) ? plugins.filter((p: any) => p.status === 'active') : []
                  const inactivePlugins = Array.isArray(plugins) ? plugins.filter((p: any) => p.status === 'inactive') : []
                  
                  aiResponse += `✅ **Full Scan Complete!** Here's what I found:\n\n`
                  aiResponse += `**Site Overview:**\n`
                  aiResponse += `- Active Theme: **${activeTheme}**\n`
                  if (theme && theme.version) {
                    aiResponse += `- Theme Version: ${theme.version}\n`
                  }
                  aiResponse += `- Posts: ${Array.isArray(posts) ? posts.length : 0} found\n`
                  aiResponse += `- Pages: ${Array.isArray(pages) ? pages.length : 0} found\n`
                  aiResponse += `- Total Plugins: ${Array.isArray(plugins) ? plugins.length : 0} (${activePlugins.length} active, ${inactivePlugins.length} inactive)\n\n`
                  
                  if (activePlugins.length > 0) {
                    aiResponse += `**Active Plugins:**\n`
                    activePlugins.slice(0, 10).forEach((p: any) => {
                      aiResponse += `- ${p.name || p.plugin}${p.version ? ` (v${p.version})` : ''}\n`
                    })
                    if (activePlugins.length > 10) {
                      aiResponse += `- ... and ${activePlugins.length - 10} more\n`
                    }
                    aiResponse += `\n`
                  }
                  
                  if (theme) {
                    aiResponse += `**Theme Details:**\n`
                    aiResponse += `- Name: ${theme.name || 'Unknown'}\n`
                    if (theme.version) aiResponse += `- Version: ${theme.version}\n`
                    if (theme.description) aiResponse += `- Description: ${theme.description.substring(0, 100)}...\n`
                    aiResponse += `\n`
                  }
                  
                  aiResponse += `**Recommended Next Steps:**\n`
                  aiResponse += `1. Review plugin performance - consider deactivating unused plugins\n`
                  aiResponse += `2. Check theme updates and compatibility\n`
                  aiResponse += `3. Optimize database - clean up revisions and spam\n`
                  aiResponse += `4. Review SEO settings and meta tags\n`
                  aiResponse += `5. Check site performance and caching\n\n`
                  aiResponse += `What would you like to optimize first?`
                  
                  // Update store info with scan results
                  storeInfo = aiResponse
                }
              } else {
                aiResponse = `I need your WordPress credentials to perform a full scan. Please ensure your WordPress site is properly connected in Settings.`
              }
            } catch (scanError) {
              console.error('Error performing full WordPress scan:', scanError)
              aiResponse = `I encountered an error while performing the full scan:\n\n`
              aiResponse += `**Error:** ${scanError instanceof Error ? scanError.message : 'Unknown error'}\n\n`
              aiResponse += `Please check your WordPress connection settings.`
            }
          } else {
            aiResponse = `Please connect your WordPress site first in Settings before performing a full scan.`
          }
        } else if (lowerMessage.includes('wordpress') || lowerMessage.includes('what can you help') || lowerMessage.includes('what can you do')) {
          // WordPress-specific help
          aiResponse = `Great! I can help you optimize your WordPress site in many ways:

**WordPress-Specific Features:**
- **Theme Optimization**: Analyze and improve your active theme, customize CSS, optimize layouts
- **Plugin Management**: Identify slow/problematic plugins, suggest optimizations, help with plugin conflicts
- **Content Optimization**: Optimize posts, pages, and media for better performance and SEO
- **Database Cleanup**: Help clean up revisions, spam comments, and optimize database tables
- **Security Enhancements**: Improve security settings, suggest security plugins, and best practices
- **SEO Improvements**: Optimize meta tags, permalinks, sitemaps, and content structure
- **Performance Tuning**: Optimize caching, image compression, database queries, and page load speeds
- **Site Health**: Monitor and improve WordPress site health scores

**What I can do:**
- Scan your WordPress site to identify issues
- Provide specific optimization recommendations
- Help implement changes through WordPress REST API
- Analyze your theme and plugin performance
- Optimize your content structure

${storeInfo ? `I can see your WordPress site is connected. ` : `To get started, please connect your WordPress site in the settings with your site URL and application password. `}What specific area would you like to optimize?`
        } else if (lowerMessage.includes('shopify')) {
          // Shopify-specific help
          aiResponse = `I can help you optimize your Shopify store in many ways:

**Shopify-Specific Features:**
- **Product Management**: Optimize product descriptions, images, variants, and collections
- **Theme Customization**: Customize your Shopify theme, edit liquid files, optimize layouts
- **Discounts & Promotions**: Create discount codes, automatic discounts, and promotional campaigns
- **Shipping Configuration**: Set up shipping zones, rates, and fulfillment settings
- **Store Performance**: Analyze and improve store speed, Core Web Vitals, and user experience
- **SEO Optimization**: Optimize product SEO, meta descriptions, and store structure
- **Inventory Management**: Help with product organization and inventory tracking

${storeInfo ? `I can see your Shopify store is connected. ` : `To get started, please connect your Shopify store in the settings. `}What would you like to work on?`
        } else if (storeInfo) {
          // User has store data available
          if (lowerMessage.includes('product') || lowerMessage.includes('show')) {
            if (isWordPress) {
              aiResponse = `Great! I can see your WordPress site data. Here's what I found:

${storeInfo}

For WordPress, I can help you with:
- **Posts & Pages**: Optimize your content, improve SEO, and enhance readability
- **Media Library**: Optimize images and organize your media files
- **Theme Customization**: Customize your theme and improve design
- **Plugin Optimization**: Manage and optimize your plugins
- **SEO & Performance**: Improve search rankings and site speed

What specific WordPress optimization would you like to work on?`
            } else {
              aiResponse = `Great! I can see your store data. Here's what I found:

${storeInfo}

I can help you with:
- Product management and optimization
- Theme customization and improvements
- Creating discounts and promotions
- Shipping configuration
- SEO and performance optimization

What specific changes would you like me to help you with?`
            }
          } else if (lowerMessage.includes('optimize') || lowerMessage.includes('improve')) {
            if (isWordPress) {
              aiResponse = `I'll help you optimize your WordPress site! Here are the key areas we can improve:

1. **Theme Performance**: Optimize your active theme, reduce unused code, improve CSS/JS loading
2. **Plugin Performance**: Identify slow plugins, optimize plugin usage, reduce conflicts
3. **Database Optimization**: Clean up revisions, optimize database tables, improve query performance
4. **Content SEO**: Optimize your posts and pages for better search rankings
5. **Site Speed**: Improve caching, image optimization, and overall page load times
6. **Security**: Enhance security settings and implement best practices

Let me know which area you'd like to focus on first!`
            } else {
              aiResponse = `I'll help you optimize your ${storeType} store! Based on your current setup, here are the key areas we can improve:

1. **Product Optimization**: Enhance descriptions, images, and pricing
2. **Performance**: Speed up your store loading times
3. **SEO**: Improve search engine visibility
4. **User Experience**: Enhance navigation and checkout flow

Let me know which area you'd like to focus on first!`
            }
          } else {
            if (isWordPress) {
              aiResponse = `I can see your WordPress site is connected! Here's what I found:

${storeInfo}

I can help you optimize your WordPress site with:
- **Theme & Design**: Customize and optimize your WordPress theme
- **Plugin Management**: Identify and optimize plugin performance
- **Content Optimization**: Improve posts, pages, and media
- **SEO & Performance**: Boost search rankings and site speed
- **Security & Maintenance**: Enhance security and optimize database

What WordPress optimization would you like to work on?`
            } else {
              aiResponse = `I have access to your store data and I'm ready to help! I can see:

${storeInfo}

I can assist you with product management, theme customization, creating discounts, shipping configuration, and much more. Just let me know what you'd like to work on!`
            }
          }
        } else {
          // No store data available
          if (isWordPress) {
            aiResponse = `I'd love to help you optimize your WordPress site! To provide the best assistance, I need to connect to your WordPress site.

**To connect your WordPress site:**
1. Go to Settings in the app
2. Add your WordPress site URL
3. Create an Application Password in WordPress (Users → Profile → Application Passwords)
4. Enter the credentials

Once connected, I can:
- Scan your site for optimization opportunities
- Analyze your theme and plugins
- Help with SEO improvements
- Optimize performance and security

Would you like help setting up the connection, or is there a specific WordPress question I can answer now?`
          } else {
            aiResponse = `I'd love to help you with that! However, I need to reconnect your store to access the current data. Since I'm not able to retrieve your store's information directly, could you please reconnect your store in the settings so I can get the most up-to-date information?

Once I have access to your store data, I'll be happy to show you your current setup and provide any assistance you need.`
          }
        }
      } else {
        // Fallback for non-authenticated users
        if (storeInfo) {
          aiResponse = `I have access to your store data and I'm ready to help! I can see:

${storeInfo}

I can assist you with product management, theme customization, creating discounts, shipping configuration, and much more. Just let me know what you'd like to work on!`
        } else {
          aiResponse = `Hi! I'm Fix It AI, your e-commerce optimization assistant. To get the most personalized help, please sign in and connect your store in the settings.

I can help you with:
- Product optimization
- Theme customization
- SEO improvements
- Performance enhancements
- And much more!

What would you like to work on?`
        }
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
        
        // Use 'shopify' or 'wordpress' as default if storeType is not set
        const finalStoreType = storeType || 'shopify'
        
        // Collect training data
        await fineTuningService.collectTrainingData(
          message,
          aiResponse,
          category,
          finalStoreType,
          connection?.url
        )
        
        console.log('Training data collected and context updated', { 
          userId, 
          category, 
          storeType: finalStoreType,
          hasConnection: !!connection 
        })
      } catch (error) {
        console.error('Error saving training data:', error)
        console.error('Error details:', error instanceof Error ? error.message : error)
      }
    } else {
      console.log('Skipping training data collection:', {
        hasContextManager: !!contextManager,
        hasFineTuningService: !!fineTuningService,
        hasUserId: !!userId
      })
    }

    res.end()
  } catch (error) {
    console.error('Chat API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
