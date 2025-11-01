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
        
        console.log('WordPress connection details:', {
          hasConnection: !!connection,
          hasUsername: !!username,
          hasAppPassword: !!appPassword,
          connectionKeys: connection ? Object.keys(connection) : [],
          connectionType: connection?.type,
          connectionUrl: connection?.url
        })
        
        if (!username || !appPassword) {
          console.log('WordPress credentials incomplete', {
            username: username ? 'present' : 'missing',
            appPassword: appPassword ? 'present' : 'missing',
            connectionData: connection
          })
          storeInfo = `WordPress site connected but credentials are incomplete. Please reconnect your WordPress site in Settings.\n\nMissing: ${!username ? 'Username' : ''} ${!appPassword ? 'App Password' : ''}`
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
    // Use Google Gemini API (matching ChatTree implementation)
    const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || process.env.REACT_APP_GEMINI_API_KEY
    const apiBaseUrl = 'https://generativelanguage.googleapis.com/v1beta'
    const modelName = 'gemini-2.0-flash-exp' // Matching ChatTree model
    
    console.log('🔑 API Key Detection:', {
      hasGEMINI: !!geminiApiKey,
      keyPrefix: geminiApiKey ? geminiApiKey.substring(0, 10) : 'none',
      apiBaseUrl,
      modelName
    })
    
    // PURE LLM APPROACH - Let AI understand everything
    if (!geminiApiKey) {
      aiResponse = `❌ **Gemini API Key Missing**\n\n`
      aiResponse += `To use AI features, you need to configure a Google Gemini API key.\n\n`
      aiResponse += `**How to get a Gemini API key:**\n`
      aiResponse += `1. Go to https://aistudio.google.com/app/apikey\n`
      aiResponse += `2. Sign in with your Google account\n`
      aiResponse += `3. Click "Create API Key"\n`
      aiResponse += `4. Copy the API key\n`
      aiResponse += `5. Add to your .env file: \`GEMINI_API_KEY=your_key_here\`\n`
      aiResponse += `6. Restart your server\n\n`
      aiResponse += `**Current Status:** No API key configured`
      res.write(aiResponse)
      res.end()
      return
    }
    
    if (!userId || !contextManager) {
      aiResponse = `❌ Please sign in to use AI features.`
      res.write(aiResponse)
      res.end()
      return
    }
    
    try {
      // Get conversation history for full context
      const recentConversations = contextManager['contextWindow']?.recentConversations || []
      const conversationHistory = recentConversations.slice(-10).map((conv: any) => 
        `${conv.role}: ${conv.content}`
      ).join('\n')
      
      // Build comprehensive context for Grok to understand what actions are available
      const availableActions = `
AVAILABLE ACTIONS (for WordPress):
1. list_posts - List all WordPress posts with their status (published, draft, etc.)
2. list_plugins - List all WordPress plugins (active and inactive)
3. update_post - Update a post's status (e.g., move to draft, publish)
   - Can identify post by ID (number) or by title (partial match)
4. scan_wordpress - Perform a full site scan (posts, pages, plugins, theme)
5. get_info - Get basic information (post count, page count)

Current context:
- Store type: ${storeType}
- Has WordPress connection: ${!!connection}
- Store URL: ${connection?.url || 'Not connected'}
${storeInfo ? `- Store info: ${storeInfo.substring(0, 200)}...` : ''}
`
      
      // Let Grok understand the user's intent and decide what to do
      // Simplified prompt to avoid token limits and format issues
      const understandingPrompt = `Analyze this user request for WordPress site management.

Available actions: list_posts, list_plugins, update_post, scan_wordpress, get_info

${conversationHistory ? `Recent conversation (last 3 exchanges):\n${conversationHistory.substring(0, 800)}\n\n` : ''}User request: "${message}"

Respond with ONLY this JSON (no markdown, no extra text):
{"action":"list_posts"|"list_plugins"|"update_post"|"scan_wordpress"|"get_info"|null,"reasoning":"brief explanation","needsExecution":true|false,"postId":number|null,"postTitle":string|null,"confidence":"high"|"medium"|"low"}

Examples:
- "check posts" or "how many posts" → {"action":"get_info","reasoning":"User wants post count","needsExecution":true,"postId":null,"postTitle":null,"confidence":"high"}
- "list plugins" → {"action":"list_plugins","reasoning":"User wants plugin list","needsExecution":true,"postId":null,"postTitle":null,"confidence":"high"}
- "show all posts" → {"action":"list_posts","reasoning":"User wants to see all posts","needsExecution":true,"postId":null,"postTitle":null,"confidence":"high"}`

      console.log('🔍 AI UNDERSTANDING - Sending request to Gemini...')
      console.log('📝 User message:', message)
      console.log('💭 Conversation history length:', conversationHistory.length)
      console.log('🔑 Using API: Gemini | Model:', modelName)
      
      // Gemini API format - convert to messages array format (matching ChatTree)
      const geminiMessages = [
        {
          role: 'user',
          parts: [{ text: `You are an intelligent assistant. Always respond with valid JSON only.\n\n${understandingPrompt}` }]
        }
      ]
      
      const understandingResponse = await fetch(`${apiBaseUrl}/models/${modelName}:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: geminiMessages,
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 300,
            topP: 0.95,
            topK: 40
          }
        })
      })
      
      if (!understandingResponse.ok) {
        let errorText = ''
        try {
          errorText = await understandingResponse.text()
          const errorJson = JSON.parse(errorText)
          console.error('❌ GEMINI UNDERSTANDING FAILED - API Error:', understandingResponse.status)
          console.error('❌ Error Details:', JSON.stringify(errorJson, null, 2))
          console.error('❌ Request was:', JSON.stringify({
            model: modelName,
            api: 'Gemini',
            messageCount: understandingPrompt.split('\n').length,
            promptLength: understandingPrompt.length
          }, null, 2))
          
          // Handle specific error cases
          const errorMessage = errorJson.error?.message || errorJson.message || errorText
          
          if (errorMessage.includes('API key') || errorMessage.includes('invalid argument') || errorMessage.includes('Incorrect API key') || errorMessage.includes('API_KEY_INVALID')) {
            aiResponse = `❌ **Invalid Gemini API Key**\n\n`
            aiResponse += `The Gemini API key you're using is invalid or expired.\n\n`
            aiResponse += `**Error:** ${errorMessage}\n\n`
            aiResponse += `**How to fix:**\n`
            aiResponse += `1. Go to https://aistudio.google.com/app/apikey\n`
            aiResponse += `2. Sign in with your Google account\n`
            aiResponse += `3. Create a new API key or check existing ones\n`
            aiResponse += `4. Update the \`GEMINI_API_KEY\` environment variable in your .env file\n`
            aiResponse += `5. Restart your server\n\n`
            aiResponse += `Your current API key starts with: ${geminiApiKey ? geminiApiKey.substring(0, 10) : 'none'}...`
        } else {
            aiResponse = `❌ Failed to understand your request.\n\n`
            aiResponse += `**Error:** ${errorMessage}\n\n`
            aiResponse += `**Status:** ${understandingResponse.status}\n\n`
            aiResponse += `Please check the console logs for detailed error information.`
          }
        } catch (parseError) {
          console.error('❌ GROK UNDERSTANDING FAILED - Could not parse error:', errorText.substring(0, 500))
          aiResponse = `❌ Failed to understand your request. API error: ${understandingResponse.status}\n\nError: ${errorText.substring(0, 200)}`
        }
        res.write(aiResponse)
        res.end()
        return
      }
      
      const understandingData = await understandingResponse.json()
      // Gemini API response format is different
      const understandingText = understandingData.candidates?.[0]?.content?.parts?.[0]?.text || 
                               understandingData.text || 
                               '{}'
      
      console.log('🧠 GEMINI RAW RESPONSE:', understandingText)
      
      // Extract JSON from response
      let grokUnderstanding: any = null
      try {
        const jsonMatch = understandingText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          grokUnderstanding = JSON.parse(jsonMatch[0])
          console.log('✅ GEMINI UNDERSTANDING PARSED:', JSON.stringify(grokUnderstanding, null, 2))
          console.log('💡 GEMINI REASONING:', grokUnderstanding.reasoning || 'No reasoning provided')
          console.log('🎯 GEMINI CONFIDENCE:', grokUnderstanding.confidence || 'unknown')
          } else {
            console.error('❌ GEMINI UNDERSTANDING FAILED - No JSON found in response')
            console.error('Raw response:', understandingText)
            aiResponse = `❌ Failed to understand your request. Gemini response: ${understandingText.substring(0, 200)}`
            res.write(aiResponse)
            res.end()
            return
          }
        } catch (parseError) {
          console.error('❌ GEMINI UNDERSTANDING FAILED - JSON Parse Error:', parseError)
          console.error('Raw response:', understandingText)
          aiResponse = `❌ Failed to parse Gemini's understanding. Error: ${parseError instanceof Error ? parseError.message : 'Unknown'}`
          res.write(aiResponse)
          res.end()
          return
        }
      
      // Execute action if Gemini determined one is needed
      let actionResult = ''
      
      // Check if we have a connection (from database or frontend)
      if (!connection && grokUnderstanding.needsExecution && grokUnderstanding.action) {
        // Try to get connection from database again if userId exists
        if (userId) {
          console.log('⚠️ No connection found, trying to fetch from database for userId:', userId)
          try {
            const { data: dbConnections } = await supabase
              .from('store_connections')
              .select('*')
              .eq('user_id', userId)
              .eq('is_connected', true)
              .order('created_at', { ascending: false })
              .limit(1)
            
            if (dbConnections && dbConnections.length > 0) {
              connection = dbConnections[0]
              storeType = connection.type as 'shopify' | 'wordpress'
              console.log('✅ Found connection from database:', connection.url)
            }
          } catch (dbError) {
            console.error('Error fetching connection from database:', dbError)
          }
        }
      }
      
      // If action needs execution but no connection, provide helpful message
      if (grokUnderstanding.needsExecution && grokUnderstanding.action && !connection) {
        if (grokUnderstanding.action === 'get_info' || grokUnderstanding.action === 'list_posts' || grokUnderstanding.action === 'scan_wordpress') {
          actionResult = `❌ **No WordPress connection found.**\n\nTo get exact values, please:\n1. Go to Settings/Connections in the app\n2. Connect your WordPress site\n3. Make sure your username and application password are configured\n\nOnce connected, I can fetch exact post counts and other information directly from your site.`
        }
      }
      
      if (grokUnderstanding.needsExecution && grokUnderstanding.action && connection && storeType === 'wordpress') {
        console.log('⚡ EXECUTING ACTION:', grokUnderstanding.action)
        
        const username = connection.username || (connection as any).username || connection.user_name
        const appPassword = connection.app_password || connection.appPassword || (connection as any).appPassword || connection.app_password
        const storeUrl = connection.url
        
        console.log('🔑 WordPress credentials check:', { 
          hasUsername: !!username, 
          hasAppPassword: !!appPassword, 
          hasUrl: !!storeUrl,
          connectionKeys: Object.keys(connection),
          connectionData: JSON.stringify(connection, null, 2)
        })
        
        if (!username || !appPassword) {
          console.error('❌ WordPress credentials missing in connection:', {
            username: username || 'MISSING',
            appPassword: appPassword ? 'present' : 'MISSING',
            allKeys: Object.keys(connection)
          })
          actionResult = `❌ **WordPress Credentials Missing**\n\nYour WordPress connection exists, but the username and/or app password are not stored.\n\n**To fix this:**\n1. Go to Settings → Connections\n2. Disconnect your current WordPress connection\n3. Reconnect with your username and application password\n\nThis is needed because the database schema was updated to properly store WordPress credentials.`
        } else if (!storeUrl) {
          actionResult = `❌ **WordPress URL Missing**\n\nYour WordPress connection is missing the site URL. Please reconnect in Settings.`
        } else if (username && appPassword && storeUrl) {
          try {
            const wordpress = new WordPressAPI(storeUrl, username, appPassword)
            
            if (grokUnderstanding.action === 'list_posts') {
              console.log('📋 Action: Listing posts')
              const isConnected = await wordpress.testConnection()
              if (!isConnected) {
                actionResult = `❌ Cannot fetch posts - connection test failed. Please check your WordPress credentials.`
              } else {
                try {
                  const allPosts = await wordpress.getAllPosts()
                  
                  if (Array.isArray(allPosts) && allPosts.length > 0) {
                    const postsByStatus: Record<string, any[]> = {}
                    allPosts.forEach((post: any) => {
                      const status = post.status || 'unknown'
                      if (!postsByStatus[status]) {
                        postsByStatus[status] = []
                      }
                      postsByStatus[status].push(post)
                    })
                    
                    actionResult = `**All Posts (${allPosts.length} total):**\n\n`
                    
                    const statusOrder = ['publish', 'draft', 'pending', 'private', 'future', 'trash']
                    statusOrder.forEach(status => {
                      if (postsByStatus[status] && postsByStatus[status].length > 0) {
                        const statusLabel = status.charAt(0).toUpperCase() + status.slice(1)
                        actionResult += `**${statusLabel} (${postsByStatus[status].length}):**\n`
                        postsByStatus[status].forEach((post: any, index: number) => {
                          const title = post.title?.rendered || post.title || 'Untitled'
                          const date = post.date ? new Date(post.date).toLocaleDateString() : 'No date'
                          const id = post.id || 'N/A'
                          actionResult += `${index + 1}. [ID: ${id}] **${title}** - ${date}\n`
                        })
                        actionResult += `\n`
                      }
                    })
                    
                    Object.keys(postsByStatus).forEach(status => {
                      if (!statusOrder.includes(status)) {
                        actionResult += `**${status} (${postsByStatus[status].length}):**\n`
                        postsByStatus[status].forEach((post: any, index: number) => {
                          const title = post.title?.rendered || post.title || 'Untitled'
                          const date = post.date ? new Date(post.date).toLocaleDateString() : 'No date'
                          const id = post.id || 'N/A'
                          actionResult += `${index + 1}. [ID: ${id}] **${title}** - ${date}\n`
                        })
                        actionResult += `\n`
                      }
                    })
                  } else {
                    actionResult = `No posts found on your WordPress site.`
                  }
                } catch (fetchError) {
                  console.error('Error fetching posts:', fetchError)
                  actionResult = `❌ Error fetching posts: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`
                }
              }
            } else if (grokUnderstanding.action === 'list_plugins') {
              console.log('🔌 Action: Listing plugins')
              const isConnected = await wordpress.testConnection()
              if (!isConnected) {
                actionResult = `❌ Cannot fetch plugins - connection test failed.`
              } else {
                const plugins = await wordpress.getPlugins().catch(() => [])
                const activePlugins = Array.isArray(plugins) ? plugins.filter((p: any) => p.status === 'active') : []
                const inactivePlugins = Array.isArray(plugins) ? plugins.filter((p: any) => p.status === 'inactive') : []
                
                if (Array.isArray(plugins) && plugins.length > 0) {
                  actionResult = `**Plugin Summary:**\n- **Total Plugins:** ${plugins.length}\n- **Active Plugins:** ${activePlugins.length}\n- **Inactive Plugins:** ${inactivePlugins.length}\n\n`
                  
                  if (activePlugins.length > 0) {
                    actionResult += `**Active Plugins (${activePlugins.length}):**\n`
                    activePlugins.forEach((p: any, index: number) => {
                      const name = p.name || p.plugin || 'Unknown Plugin'
                      const version = p.version ? ` (v${p.version})` : ''
                      actionResult += `${index + 1}. **${name}**${version}\n`
                    })
                  }
                } else {
                  actionResult = `No plugins found on your WordPress site.`
                }
              }
            } else if (grokUnderstanding.action === 'update_post') {
              console.log('✏️ Action: Updating post', { postId: grokUnderstanding.postId, postTitle: grokUnderstanding.postTitle })
              const isConnected = await wordpress.testConnection()
              if (!isConnected) {
                actionResult = `❌ Cannot update post - connection test failed.`
              } else {
                try {
                  let targetPostId: number | null = null
                  let targetPost: any = null
                  
                  if (grokUnderstanding.postId) {
                    try {
                      targetPost = await wordpress.getPost(grokUnderstanding.postId)
                      targetPostId = grokUnderstanding.postId
                    } catch (err) {
                      console.error('Error fetching post by ID:', err)
                    }
                  } else if (grokUnderstanding.postTitle) {
                    const allPosts = await wordpress.getAllPosts()
                    const lowerTitle = grokUnderstanding.postTitle.toLowerCase()
                    targetPost = allPosts.find((p: any) => {
                      const postTitle = (p.title?.rendered || p.title || '').toLowerCase()
                      return postTitle.includes(lowerTitle) || lowerTitle.includes(postTitle)
                    })
                    if (targetPost) targetPostId = targetPost.id
                  }
                  
                  if (!targetPostId || !targetPost) {
                    actionResult = `❌ Couldn't identify which post to update. ${grokUnderstanding.postId ? `Post ID ${grokUnderstanding.postId} not found.` : ''} ${grokUnderstanding.postTitle ? `Post title "${grokUnderstanding.postTitle}" not found.` : ''}`
                  } else {
                    if (targetPost.status === 'draft') {
                      actionResult = `ℹ️ Post "${targetPost.title?.rendered || targetPost.title || 'Untitled'}" (ID: ${targetPostId}) is already in draft status.`
                    } else {
                      const updatedPost = await wordpress.updatePost(targetPostId, { status: 'draft' })
                      actionResult = `✅ Successfully moved post to draft!\n\n**Post Details:**\n- **Title:** ${updatedPost.title?.rendered || updatedPost.title || 'Untitled'}\n- **ID:** ${updatedPost.id}\n- **Previous Status:** ${targetPost.status}\n- **New Status:** ${updatedPost.status}`
                    }
                  }
                } catch (updateError) {
                  console.error('Error updating post:', updateError)
                  actionResult = `❌ Error updating post: ${updateError instanceof Error ? updateError.message : 'Unknown error'}`
                }
              }
            } else if (grokUnderstanding.action === 'scan_wordpress') {
              console.log('🔍 Action: Scanning WordPress site')
              const isConnected = await wordpress.testConnection()
              if (!isConnected) {
                actionResult = `❌ Cannot scan - connection test failed.`
              } else {
                const [posts, pages, plugins, theme, postsCount, pagesCount] = await Promise.all([
                  wordpress.getPosts(5).catch(() => []),
                  wordpress.getPages(5).catch(() => []),
                  wordpress.getPlugins().catch(() => []),
                  wordpress.getTheme().catch(() => null),
                  wordpress.getPostsCount().catch(() => 0),
                  wordpress.getPagesCount().catch(() => 0)
                ])
                
                actionResult = `✅ **WordPress Site Scan Complete!**\n\n**Site Overview:**\n- Site URL: ${storeUrl}\n- Total Posts: **${postsCount}**\n- Total Pages: **${pagesCount}**\n`
                
                if (theme) {
                  actionResult += `- Active Theme: **${theme.name || 'Unknown'}**\n`
                  if (theme.version) actionResult += `- Theme Version: ${theme.version}\n`
                }
                
                const activePlugins = Array.isArray(plugins) ? plugins.filter((p: any) => p.status === 'active') : []
                if (Array.isArray(plugins)) {
                  actionResult += `- Total Plugins: **${plugins.length}** (${activePlugins.length} active)\n`
                }
              }
            } else if (grokUnderstanding.action === 'get_info') {
              console.log('ℹ️ Action: Getting info')
              const isConnected = await wordpress.testConnection()
              if (!isConnected) {
                actionResult = `❌ Cannot fetch info - connection test failed.`
      } else {
                const [postsCount, pagesCount] = await Promise.all([
                  wordpress.getPostsCount().catch(() => 0),
                  wordpress.getPagesCount().catch(() => 0)
                ])
                actionResult = `**WordPress Site Information:**\n\n- 📝 Total Posts: **${postsCount}**\n- 📄 Total Pages: **${pagesCount}**\n`
              }
            }
            
            console.log('✅ Action executed. Result length:', actionResult.length)
            
          } catch (actionError) {
            console.error('❌ Action execution error:', actionError)
            actionResult = `❌ Error executing action: ${actionError instanceof Error ? actionError.message : 'Unknown error'}`
          }
        }
      }
      
      // Generate AI response using Gemini with full context
      if (geminiApiKey && userId && contextManager) {
        try {
          // Build response message
          const responseMessage = actionResult 
            ? `User said: "${message}". I executed the action "${grokUnderstanding.action}" and got this result:\n\n${actionResult}\n\nPlease respond naturally and conversationally, acknowledging what was done.`
            : `User said: "${message}". Understanding: ${grokUnderstanding.reasoning || 'No specific action needed'}. Please respond helpfully.`
          
          // Convert to Gemini message format (matching ChatTree)
          const geminiResponseMessages = [{
            role: 'user',
            parts: [{ text: `You are a helpful WordPress site management assistant. Respond naturally and conversationally. Use markdown for formatting.\n\n${responseMessage}` }]
          }]
          
          console.log('🤖 Generating AI response with Gemini...')
          
          const aiResponseCall = await fetch(`${apiBaseUrl}/models/${modelName}:generateContent?key=${geminiApiKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: geminiResponseMessages,
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1000,
                topP: 0.95,
                topK: 40
              }
            })
          })
          
          if (aiResponseCall.ok) {
            const aiData = await aiResponseCall.json()
            aiResponse = aiData.candidates?.[0]?.content?.parts?.[0]?.text || 
                        aiData.text || 
                        actionResult || 
                        `I executed: ${grokUnderstanding.reasoning || 'your request'}`
            console.log('✅ AI response generated successfully')
          } else {
            const errorText = await aiResponseCall.text()
            console.error('❌ AI response generation error:', aiResponseCall.status, errorText)
            aiResponse = actionResult || `I understand: ${grokUnderstanding.reasoning || 'your request'}, but encountered an error generating a response.`
          }
        } catch (error) {
          console.error('❌ AI response generation error:', error)
          aiResponse = actionResult || `I understand: ${grokUnderstanding.reasoning || 'your request'}, but encountered an error.`
        }
      } else {
        // No API available - use action result
        aiResponse = actionResult || `I understand: ${grokUnderstanding.reasoning || 'your request'}, but I need AI service to respond properly.`
      }
      
    } catch (error) {
      console.error('❌ MAIN ERROR:', error)
      aiResponse = `❌ An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
    
    // No fallback templates - if we got here without a response, show error
    if (!aiResponse) {
      console.error('❌ No AI response generated')
      aiResponse = `❌ I couldn't generate a response. Please check the console logs for details.`
    }

    // Send the response
    res.write(aiResponse)

    // Save conversation context and training data
    if (contextManager && fineTuningService && userId) {
      try {
        await contextManager.addConversationContext(message, aiResponse)
        
        const finalStoreType = storeType || 'shopify'
        await fineTuningService.collectTrainingData(
          message,
          aiResponse,
          'general',
          finalStoreType,
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
