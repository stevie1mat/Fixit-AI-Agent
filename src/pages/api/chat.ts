import { NextApiRequest, NextApiResponse } from 'next'
import { ShopifyAPI } from '@/lib/shopify'
import { WordPressAPI } from '@/lib/wordpress'
import { formatMarkdownToHtml } from '@/lib/textFormatter'
import { DatabaseService } from '@/lib/database'
import { LighthouseAPI } from '@/lib/lighthouse'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Chat API called with method:', req.method)
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('Request body:', req.body)
    const { message, messages, storeData } = req.body

    if (!message) {
      console.log('No message provided')
      return res.status(400).json({ error: 'Message is required' })
    }

    console.log('Processing message:', message)
    console.log('Conversation history:', messages?.length || 0, 'messages')

    // Get connections from database instead of localStorage
    let storeInfo = ''
    const connections = await DatabaseService.getConnections()
    console.log('Database connections:', connections)

    if (connections && connections.length > 0) {
      // Prefer WordPress connections over Shopify if both are available
      const wordpressConnection = connections.find(conn => conn.storeType === 'wordpress')
      const shopifyConnection = connections.find(conn => conn.storeType === 'shopify')
      const connection = wordpressConnection || shopifyConnection || connections[0]
      console.log('Selected connection:', JSON.stringify(connection, null, 2))
      
      if (connection.storeType === 'shopify') {
        if (!connection.accessToken) {
          storeInfo = 'Shopify store connected but access token not available. Please reconnect your store in settings.'
        } else {
          try {
            const shopify = new ShopifyAPI(connection.storeUrl, connection.accessToken)
          
            // Scan store data
            const products = await shopify.getProducts(50) // Get more products
            const themes = await shopify.getThemes()
            
            // Provide complete raw data to AI instead of pre-formatted summaries
            storeInfo = `
Shopify Store Data for ${connection.storeUrl}:

PRODUCTS (${products.length} total):
${JSON.stringify(products, null, 2)}

THEMES (${themes.length} total):
${JSON.stringify(themes, null, 2)}
            `.trim()
          } catch (error) {
            console.error('Error scanning Shopify store:', error)
            storeInfo = 'Shopify store connected but unable to scan data at the moment.'
          }
        }
      } else if (connection.storeType === 'wordpress') {
        if (!connection.username || !connection.appPassword) {
          storeInfo = 'WordPress site connected but credentials not available. Please reconnect your site in settings.'
        } else {
          try {
            const wordpress = new WordPressAPI(connection.storeUrl, connection.username, connection.appPassword)
          
            // Scan comprehensive WordPress data including all dashboard tabs
            // Use Promise.allSettled to handle permission errors gracefully
            const results = await Promise.allSettled([
              wordpress.getPosts(50), // Increased to get more posts
              wordpress.getPages(20), // Increased to get more pages
              wordpress.getPlugins(),
              wordpress.getTheme(),
              wordpress.getOptions(),
              wordpress.getComments(30),
              wordpress.getUsers(20),
              wordpress.getMedia(30),
              wordpress.getCategories(),
              wordpress.getTags(),
              wordpress.getMenus(),
              wordpress.getWidgets(),
              wordpress.getSiteInfo(),
              wordpress.getSiteHealth(),
            ])

            // Run speed test separately since it's external API
            let speedData = null
            try {
              const lighthouse = new LighthouseAPI()
              const mobileSpeed = await lighthouse.runAudit(connection.storeUrl)
              const desktopSpeed = await lighthouse.runDesktopAudit(connection.storeUrl)
              speedData = {
                mobile: mobileSpeed,
                desktop: desktopSpeed,
                mobileScore: lighthouse.getPerformanceScore(mobileSpeed),
                desktopScore: lighthouse.getPerformanceScore(desktopSpeed),
                recommendations: lighthouse.generateRecommendations(mobileSpeed)
              }
            } catch (error) {
              console.error('Error running speed test:', error)
              speedData = { error: 'Speed test failed - unable to analyze performance' }
            }

            // Extract successful results and handle failures
            const [
              posts, 
              pages, 
              plugins, 
              theme, 
              options, 
              comments, 
              users, 
              media, 
              categories, 
              tags, 
              menus, 
              widgets, 
              siteInfo, 
              siteHealth
            ] = results.map((result, index) => {
              if (result.status === 'fulfilled') {
                return result.value
              } else {
                console.error(`Failed to fetch WordPress data for index ${index}:`, result.reason)
                return { error: result.reason.message || 'Permission denied or endpoint unavailable' }
              }
            })
            
            // Provide comprehensive data to AI with key information highlighted
            // Handle error cases gracefully
            const pluginNames = plugins.error ? 'Permission denied' : plugins.map((p: any) => p.name || p.plugin || 'Unknown').join(', ')
            const recentPosts = posts.error ? [] : posts.slice(0, 5).map((p: any) => ({
              title: p.title.rendered,
              date: p.date,
              status: p.status,
              slug: p.slug
            }))
            
            // Format theme information properly
            let themeInfo = 'Unknown'
            if (theme.error) {
              themeInfo = 'Permission denied'
            } else if (Array.isArray(theme)) {
              themeInfo = theme.map(t => t.name || t.title || 'Unknown Theme').join(', ')
            } else if (theme && theme.name) {
              themeInfo = theme.name
            } else if (theme) {
              themeInfo = JSON.stringify(theme)
            }

            // Format comments information
            const pendingComments = comments.error ? 0 : comments.filter((c: any) => c.status === 'hold').length
            const approvedComments = comments.error ? 0 : comments.filter((c: any) => c.status === 'approved').length
            
            // Format users information
            const adminUsers = users.error ? 0 : users.filter((u: any) => u.roles && u.roles.includes('administrator')).length
            const editorUsers = users.error ? 0 : users.filter((u: any) => u.roles && u.roles.includes('editor')).length
            
            // Format media information
            const totalMediaSize = media.error ? 0 : media.reduce((total: any, m: any) => total + (m.media_details?.filesize || 0), 0)
            const mediaSizeMB = Math.round(totalMediaSize / 1024 / 1024 * 100) / 100
            
            storeInfo = `
WordPress Site Data for ${connection.storeUrl}:

SITE OVERVIEW:
- Total Posts: ${posts.error ? 'Permission denied' : posts.length}
- Total Pages: ${pages.error ? 'Permission denied' : pages.length}  
- Total Plugins: ${plugins.error ? 'Permission denied' : plugins.length}
- Themes: ${themeInfo}
- Total Comments: ${comments.error ? 'Permission denied' : comments.length} (${approvedComments} approved, ${pendingComments} pending)
- Total Users: ${users.error ? 'Permission denied' : users.length} (${adminUsers} admins, ${editorUsers} editors)
- Total Media: ${media.error ? 'Permission denied' : media.length} files (${(mediaSizeMB).toFixed(2)} MB total)

DASHBOARD TABS DATA:
📝 POSTS: ${posts.error ? 'Permission denied' : `${posts.length} posts with titles, dates, content, status, slugs`}
📄 PAGES: ${pages.error ? 'Permission denied' : `${pages.length} pages with complete metadata`}
💬 COMMENTS: ${comments.error ? 'Permission denied' : `${comments.length} comments (${approvedComments} approved, ${pendingComments} pending moderation)`}
👥 USERS: ${users.error ? 'Permission denied' : `${users.length} users (${adminUsers} administrators, ${editorUsers} editors)`}
📁 MEDIA: ${media.error ? 'Permission denied' : `${media.length} media files (${(mediaSizeMB).toFixed(2)} MB total size)`}
🔌 PLUGINS: ${plugins.error ? 'Permission denied' : `${plugins.length} plugins - ${pluginNames}`}
🎨 APPEARANCE: Theme data and customization options
⚙️ SETTINGS: Site options and configuration data
📊 SITE HEALTH: Performance and security status
📂 CATEGORIES: ${categories.error ? 'Permission denied' : `${categories.length} post categories`}
🏷️ TAGS: ${tags.error ? 'Permission denied' : `${tags.length} post tags`}
🍔 MENUS: ${menus.error ? 'Permission denied' : `${menus.length} navigation menus`}
🧩 WIDGETS: ${widgets.error ? 'Permission denied' : `${widgets.length} sidebar widgets`}

PLUGIN LIST (${plugins.error ? 'Permission denied' : `${plugins.length} plugins`}):
${pluginNames}

RECENT POSTS (${posts.error ? 'Permission denied' : `${posts.length} total`}):
${recentPosts.map((p: any) => `- ${p.title} (${new Date(p.date).toLocaleDateString()}, ${p.status})`).join('\n')}

COMMENTS SUMMARY:
- Total: ${comments.error ? 'Permission denied' : comments.length}
- Approved: ${approvedComments}
- Pending: ${pendingComments}
- Recent comments: ${comments.error ? 'Permission denied' : comments.slice(0, 3).map((c: any) => `"${c.content?.rendered?.substring(0, 50)}..." by ${c.author_name}`).join(', ')}

USERS SUMMARY:
- Total: ${users.error ? 'Permission denied' : users.length}
- Administrators: ${adminUsers}
- Editors: ${editorUsers}
- Recent users: ${users.error ? 'Permission denied' : users.slice(0, 3).map((u: any) => `${u.name} (${u.roles?.join(', ') || 'no roles'})`).join(', ')}

COMPLETE DATA AVAILABLE:
- All ${posts.error ? 'Permission denied' : `${posts.length} posts with complete metadata (titles, dates, content, status, slugs)`}
- All ${pages.error ? 'Permission denied' : `${pages.length} pages with complete metadata`}  
- All ${plugins.error ? 'Permission denied' : `${plugins.length} plugins with names and details`}
- All ${comments.error ? 'Permission denied' : `${comments.length} comments with content, author, status`}
- All ${users.error ? 'Permission denied' : `${users.length} users with roles and permissions`}
- All ${media.error ? 'Permission denied' : `${media.length} media files with metadata and file sizes`}
- Complete theme information with names and details
- Site settings and configuration options
- Navigation menus and widget areas
- Post categories and tags
- Site health and performance data

HOMEPAGE SPEED TEST RESULTS:
${speedData?.error ? `❌ Speed test failed: ${speedData.error}` : `
📱 MOBILE PERFORMANCE: ${speedData?.mobileScore || 'Unknown'} (${speedData?.mobile?.performance || 0}/100)
🖥️ DESKTOP PERFORMANCE: ${speedData?.desktopScore || 'Unknown'} (${speedData?.desktop?.performance || 0}/100)

KEY METRICS:
- First Contentful Paint: ${speedData?.mobile?.firstContentfulPaint ? `${(speedData.mobile.firstContentfulPaint / 1000).toFixed(2)}s` : 'N/A'}
- Largest Contentful Paint: ${speedData?.mobile?.largestContentfulPaint ? `${(speedData.mobile.largestContentfulPaint / 1000).toFixed(2)}s` : 'N/A'}
- Speed Index: ${speedData?.mobile?.speedIndex ? `${(speedData.mobile.speedIndex / 1000).toFixed(2)}s` : 'N/A'}
- Total Blocking Time: ${speedData?.mobile?.totalBlockingTime ? `${speedData.mobile.totalBlockingTime.toFixed(0)}ms` : 'N/A'}

RECOMMENDATIONS:
${speedData?.recommendations ? speedData.recommendations.map(rec => `- ${rec}`).join('\n') : 'No specific recommendations available'}
`}
- All data accessible for detailed analysis and recommendations
            `.trim()
          } catch (error) {
            console.error('Error scanning WordPress site:', error)
            storeInfo = 'WordPress site connected but unable to scan data at the moment.'
          }
        }
      }
    }

    // Set up streaming response
    res.setHeader('Content-Type', 'text/plain')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    // Build conversation history for context
    const conversationHistory = messages ? messages.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    })) : []

    // Add current message to conversation
    conversationHistory.push({
      role: 'user',
      parts: [{ text: message }]
    })

    // Call Gemini API for AI analysis with conversation history
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: conversationHistory,
        systemInstruction: {
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

Remember the conversation context and refer to previous messages when relevant.`
            }
          ]
        },
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
      const aiResponse = responseData.candidates[0].content.parts[0].text
      
      // Check if the response contains action keywords
      const actionKeywords = [
        'deactivate', 'activate', 'install', 'uninstall', 'update',
        'clear cache', 'flush cache', 'optimize', 'fix', 'create',
        'delete', 'modify', 'change', 'configure'
      ]
      
      const hasAction = actionKeywords.some(keyword => 
        aiResponse.toLowerCase().includes(keyword)
      )
      
      let finalResponse = aiResponse
      
      // If action is detected, try to execute it
      if (hasAction && connections && connections.length > 0) {
        try {
          const connection = connections.find(conn => conn.storeType === 'wordpress') || connections[0]
          
          if (connection && connection.storeType === 'wordpress') {
            const wordpress = new WordPressAPI(connection.storeUrl, connection.username, connection.appPassword)
            
            // Handle specific actions
            if (aiResponse.toLowerCase().includes('deactivate') && aiResponse.toLowerCase().includes('w3 total cache')) {
              try {
                // First check if plugin management is supported
                const pluginSupport = await wordpress.checkPluginManagementSupport()
                
                if (!pluginSupport.supported) {
                  // Get detailed instructions for manual plugin management
                  const instructions = await wordpress.getPluginManagementInstructions('W3 Total Cache', 'deactivate')
                  
                  if (instructions.success) {
                    finalResponse += `\n\n⚠️ **Plugin Management Not Available via REST API**\n\n${instructions.message}\n\n**Step-by-Step Instructions:**\n${instructions.instructions.map(step => `- ${step}`).join('\n')}\n\n**Alternative Methods:**\n${instructions.alternatives.map(alt => `- ${alt}`).join('\n')}`
                  } else {
                    finalResponse += `\n\n⚠️ **Plugin Management Not Available**\n\n${pluginSupport.message}\n\n**Alternative Solutions:**\n- Install a plugin management plugin\n- Use WP-CLI: \`wp plugin deactivate w3-total-cache\`\n- Deactivate manually in WordPress admin`
                  }
                  
                  // Log the limitation
                  await DatabaseService.createChangeLog({
                    action: 'plugin_deactivation',
                    operation: 'deactivate_plugin',
                    description: 'Plugin management not supported via REST API',
                    status: 'failed',
                    error: 'REST API plugin management not available'
                  })
                } else {
                  // Try to find the plugin first
                  const pluginInfo = await wordpress.getPluginByName('W3 Total Cache')
                  
                  if (!pluginInfo) {
                    finalResponse += `\n\n❌ **W3 Total Cache plugin not found** in your installed plugins.`
                  } else {
                    const result = await wordpress.deactivatePlugin('W3 Total Cache')
                    finalResponse += `\n\n✅ **W3 Total Cache has been deactivated successfully!**`
                    
                    // Log the action
                    await DatabaseService.createChangeLog({
                      action: 'plugin_deactivation',
                      operation: 'deactivate_plugin',
                      description: 'Deactivated W3 Total Cache plugin',
                      status: 'success',
                      metadata: { plugin: 'W3 Total Cache', result }
                    })
                  }
                }
              } catch (error) {
                finalResponse += `\n\n❌ **Failed to deactivate W3 Total Cache:** ${error instanceof Error ? error.message : 'Unknown error'}`
                
                // Log the error
                await DatabaseService.createChangeLog({
                  action: 'plugin_deactivation',
                  operation: 'deactivate_plugin',
                  description: 'Failed to deactivate W3 Total Cache plugin',
                  status: 'failed',
                  error: error instanceof Error ? error.message : 'Unknown error'
                })
              }
            } else if (aiResponse.toLowerCase().includes('clear cache') || aiResponse.toLowerCase().includes('flush cache')) {
              try {
                const cacheResult = await wordpress.clearCache()
                finalResponse += `\n\n✅ **Cache cleared successfully!**\n\n**Result:** ${cacheResult.message}`
                
                // Log the action
                await DatabaseService.createChangeLog({
                  action: 'cache_clear',
                  operation: 'clear_cache',
                  description: 'Cleared WordPress cache',
                  status: cacheResult.success ? 'success' : 'failed',
                  metadata: { result: cacheResult }
                })
              } catch (error) {
                finalResponse += `\n\n❌ **Failed to clear cache:** ${error instanceof Error ? error.message : 'Unknown error'}`
              }
            } else {
              finalResponse += `\n\n⚠️ **Action detected but not implemented yet.** I can help with:\n- Deactivating plugins (like W3 Total Cache)\n- Clearing cache\n- Other WordPress actions (coming soon!)`
            }
          }
        } catch (error) {
          console.error('Error executing action:', error)
          finalResponse += `\n\n⚠️ **Action execution error:** ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      }
      
      const formattedResponse = formatMarkdownToHtml(finalResponse)
      res.write(formattedResponse)
    } else {
      res.write('Sorry, I could not generate a response.')
    }

    res.end()
  } catch (error) {
    console.error('Chat API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
