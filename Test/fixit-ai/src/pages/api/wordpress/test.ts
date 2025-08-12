import { NextApiRequest, NextApiResponse } from 'next'
import { WordPressAPI } from '@/lib/wordpress'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { baseUrl, username, appPassword } = req.body

    if (!baseUrl || !username || !appPassword) {
      return res.status(400).json({ error: 'Base URL, username, and app password are required' })
    }

    const wordpress = new WordPressAPI(baseUrl, username, appPassword)

    // Test the connection
    const isConnected = await wordpress.testConnection()

    if (isConnected) {
      res.status(200).json({
        success: true,
        message: 'WordPress connection successful',
        baseUrl,
      })
    } else {
      res.status(401).json({
        success: false,
        error: 'Failed to connect to WordPress site. Please check your credentials.',
      })
    }
  } catch (error) {
    console.error('WordPress test error:', error)
    res.status(500).json({ 
      error: 'Failed to test WordPress connection',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
