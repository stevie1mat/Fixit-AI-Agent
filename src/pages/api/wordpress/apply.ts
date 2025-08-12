import { NextApiRequest, NextApiResponse } from 'next'
import { WordPressAPI } from '@/lib/wordpress'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { baseUrl, username, appPassword, changes, previewId } = req.body

    if (!baseUrl || !username || !appPassword || !changes) {
      return res.status(400).json({ error: 'Base URL, username, app password, and changes are required' })
    }

    const wordpress = new WordPressAPI(baseUrl, username, appPassword)

    // Test connection first
    const isConnected = await wordpress.testConnection()
    if (!isConnected) {
      return res.status(401).json({ error: 'Failed to connect to WordPress site' })
    }

    const results: any[] = []
    const errors: any[] = []

    // Apply changes based on the type
    for (const change of changes) {
      try {
        switch (change.type) {
          case 'post_update':
            const updatedPost = await wordpress.updatePost(change.postId, change.data)
            results.push({
              type: 'post_update',
              id: change.postId,
              result: updatedPost,
            })
            break

          case 'page_update':
            const updatedPage = await wordpress.updatePage(change.pageId, change.data)
            results.push({
              type: 'page_update',
              id: change.pageId,
              result: updatedPage,
            })
            break

          case 'plugin_activate':
            const activatedPlugin = await wordpress.activatePlugin(change.plugin)
            results.push({
              type: 'plugin_activate',
              plugin: change.plugin,
              result: activatedPlugin,
            })
            break

          case 'plugin_deactivate':
            const deactivatedPlugin = await wordpress.deactivatePlugin(change.plugin)
            results.push({
              type: 'plugin_deactivate',
              plugin: change.plugin,
              result: deactivatedPlugin,
            })
            break

          case 'theme_update':
            const updatedTheme = await wordpress.updateTheme(change.data)
            results.push({
              type: 'theme_update',
              result: updatedTheme,
            })
            break

          case 'option_update':
            const updatedOption = await wordpress.updateOption(change.option, change.value)
            results.push({
              type: 'option_update',
              option: change.option,
              result: updatedOption,
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
            action: 'wordpress',
            operation: 'apply',
            description: `Applied ${results.length} changes to WordPress site`,
            beforeState: null, // Could store previous state if needed
            afterState: results,
            status: errors.length > 0 ? 'partial' : 'success',
            error: errors.length > 0 ? JSON.stringify(errors) : null,
            metadata: {
              previewId,
              baseUrl,
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
    console.error('WordPress apply error:', error)
    res.status(500).json({ 
      error: 'Failed to apply changes to WordPress site',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
