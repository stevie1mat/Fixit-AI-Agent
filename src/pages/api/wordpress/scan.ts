import { NextApiRequest, NextApiResponse } from 'next'
import { WordPressAPI } from '@/lib/wordpress'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { baseUrl, username, appPassword, scanType } = req.body

    if (!baseUrl || !username || !appPassword) {
      return res.status(400).json({ error: 'Base URL, username, and app password are required' })
    }

    const wordpress = new WordPressAPI(baseUrl, username, appPassword)

    // Test connection first
    const isConnected = await wordpress.testConnection()
    if (!isConnected) {
      return res.status(401).json({ error: 'Failed to connect to WordPress site' })
    }

    let scanData: any = {}

    // Perform different types of scans based on request
    switch (scanType) {
      case 'posts': {
        const posts = await wordpress.getPosts(20)
        scanData.posts = posts
        break
      }

      case 'pages': {
        const pages = await wordpress.getPages(20)
        scanData.pages = pages
        break
      }

      case 'plugins': {
        const plugins = await wordpress.getPlugins()
        scanData.plugins = plugins
        break
      }

      case 'theme': {
        const theme = await wordpress.getTheme()
        scanData.theme = theme
        break
      }

      case 'options': {
        const options = await wordpress.getOptions()
        scanData.options = options
        break
      }

      case 'full':
      default: {
        // Perform comprehensive scan
        const [posts, pages, plugins, theme, options] = await Promise.all([
          wordpress.getPosts(20),
          wordpress.getPages(20),
          wordpress.getPlugins(),
          wordpress.getTheme(),
          wordpress.getOptions(),
        ])

        scanData = {
          posts,
          pages,
          plugins,
          theme,
          options,
          scanTimestamp: new Date().toISOString(),
        }
        break
      }
    }

    res.status(200).json({
      success: true,
      data: scanData,
      message: 'WordPress site scanned successfully',
    })
  } catch (error) {
    console.error('WordPress scan error:', error)
    res.status(500).json({ 
      error: 'Failed to scan WordPress site',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
