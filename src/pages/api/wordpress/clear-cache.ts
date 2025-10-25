import { NextApiRequest, NextApiResponse } from 'next'
import { WordPressAPI } from '@/lib/wordpress'
import { DatabaseService } from '@/lib/database'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get WordPress connections
    const connections = await DatabaseService.getWordPressConnections()
    
    if (connections.length === 0) {
      return res.status(400).json({ 
        error: 'No WordPress connections found. Please connect your WordPress site first.' 
      })
    }

    // Use the first active WordPress connection
    const connection = connections[0]
    
    if (!connection.username || !connection.appPassword) {
      return res.status(400).json({ 
        error: 'WordPress credentials not available. Please reconnect your site.' 
      })
    }

    const wordpress = new WordPressAPI(
      connection.storeUrl, 
      connection.username, 
      connection.appPassword
    )

    // Step 1: Get list of active plugins
    const activePlugins = await wordpress.getActivePlugins()

    // Step 2: Clear cache using the WordPress API method
    const cacheResult = await wordpress.clearCache()
    const { success: cacheCleared, message, plugin } = cacheResult

    // Log the cache clearing attempt
    await DatabaseService.createChangeLog({
      action: 'cache_clear',
      operation: 'wordpress_cache_clear',
      description: `Attempted to clear WordPress cache. Plugin: ${plugin || 'N/A'}`,
      status: cacheCleared ? 'success' : 'failed',
      metadata: {
        activePlugins,
        plugin,
        message
      }
    })

    return res.status(200).json({
      success: cacheCleared,
      message,
      activePlugins,
      plugin,
      supportedPlugins: ['w3-total-cache', 'wp-rocket', 'wp-super-cache']
    })

  } catch (error) {
    console.error('Error clearing WordPress cache:', error)
    
    // Log the error
    await DatabaseService.createChangeLog({
      action: 'cache_clear',
      operation: 'wordpress_cache_clear',
      description: 'Failed to clear WordPress cache',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    return res.status(500).json({ 
      error: 'Failed to clear cache. Please try again or clear cache manually from your WordPress admin dashboard.' 
    })
  }
}
