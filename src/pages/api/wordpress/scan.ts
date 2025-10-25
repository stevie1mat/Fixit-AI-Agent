import { NextApiRequest, NextApiResponse } from 'next'
import { WordPressAPI } from '@/lib/wordpress'
import { LighthouseAPI } from '@/lib/lighthouse'

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
      case 'posts':
        const posts = await wordpress.getPosts(100) // Increased to get more posts
        scanData.posts = posts
        break

      case 'pages':
        const pages = await wordpress.getPages(50) // Increased to get more pages
        scanData.pages = pages
        break

      case 'plugins':
        const plugins = await wordpress.getPlugins()
        scanData.plugins = plugins
        break

      case 'theme':
        const theme = await wordpress.getTheme()
        scanData.theme = theme
        break

      case 'options':
        const options = await wordpress.getOptions()
        scanData.options = options
        break

      case 'comments':
        const comments = await wordpress.getComments(50)
        scanData.comments = comments
        break

      case 'users':
        const users = await wordpress.getUsers(50)
        scanData.users = users
        break

      case 'media':
        const media = await wordpress.getMedia(50)
        scanData.media = media
        break

      case 'categories':
        const categories = await wordpress.getCategories()
        scanData.categories = categories
        break

      case 'tags':
        const tags = await wordpress.getTags()
        scanData.tags = tags
        break

      case 'menus':
        const menus = await wordpress.getMenus()
        scanData.menus = menus
        break

      case 'widgets':
        const widgets = await wordpress.getWidgets()
        scanData.widgets = widgets
        break

      case 'site-info':
        const siteInfo = await wordpress.getSiteInfo()
        scanData.siteInfo = siteInfo
        break

      case 'site-health':
        const siteHealth = await wordpress.getSiteHealth()
        scanData.siteHealth = siteHealth
        break

      case 'speed':
        const lighthouse = new LighthouseAPI()
        try {
          const mobileSpeed = await lighthouse.runAudit(baseUrl)
          const desktopSpeed = await lighthouse.runDesktopAudit(baseUrl)
          scanData.speed = {
            mobile: mobileSpeed,
            desktop: desktopSpeed,
            mobileScore: lighthouse.getPerformanceScore(mobileSpeed),
            desktopScore: lighthouse.getPerformanceScore(desktopSpeed),
            recommendations: lighthouse.generateRecommendations(mobileSpeed)
          }
        } catch (error) {
          console.error('Error running speed test:', error)
          scanData.speed = { error: 'Speed test failed - unable to analyze performance' }
        }
        break

      case 'full':
      default:
        // Perform comprehensive scan with all available data
        // Use Promise.allSettled to handle permission errors gracefully
        const results = await Promise.allSettled([
          wordpress.getPosts(100), // Increased to get more posts
          wordpress.getPages(50), // Increased to get more pages
          wordpress.getPlugins(),
          wordpress.getTheme(),
          wordpress.getOptions(),
          wordpress.getComments(50),
          wordpress.getUsers(50),
          wordpress.getMedia(50),
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
          const mobileSpeed = await lighthouse.runAudit(baseUrl)
          const desktopSpeed = await lighthouse.runDesktopAudit(baseUrl)
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
          allPosts, 
          allPages, 
          allPlugins, 
          allTheme, 
          allOptions, 
          allComments, 
          allUsers, 
          allMedia, 
          allCategories, 
          allTags, 
          allMenus, 
          allWidgets, 
          allSiteInfo, 
          allSiteHealth
        ] = results.map((result, index) => {
          if (result.status === 'fulfilled') {
            return result.value
          } else {
            console.error(`Failed to fetch data for index ${index}:`, result.reason)
            return { error: result.reason.message || 'Permission denied or endpoint unavailable' }
          }
        })

        scanData = {
          posts: allPosts,
          pages: allPages,
          plugins: allPlugins,
          theme: allTheme,
          options: allOptions,
          comments: allComments,
          users: allUsers,
          media: allMedia,
          categories: allCategories,
          tags: allTags,
          menus: allMenus,
          widgets: allWidgets,
          siteInfo: allSiteInfo,
          siteHealth: allSiteHealth,
          speed: speedData,
          scanTimestamp: new Date().toISOString(),
        }
        break
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
