import { NextApiRequest, NextApiResponse } from 'next'
import { DatabaseService } from '@/lib/database'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await handleGetConnections(req, res)
      case 'POST':
        return await handleCreateConnection(req, res)
      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Connections API error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

async function handleGetConnections(req: NextApiRequest, res: NextApiResponse) {
  const { type } = req.query
  
  let connections
  if (type === 'wordpress') {
    connections = await DatabaseService.getWordPressConnections()
  } else if (type === 'shopify') {
    connections = await DatabaseService.getShopifyConnections()
  } else {
    connections = await DatabaseService.getConnections()
  }

  return res.status(200).json({
    success: true,
    data: connections,
  })
}

async function handleCreateConnection(req: NextApiRequest, res: NextApiResponse) {
  const { storeType, storeUrl, accessToken, username, appPassword } = req.body

  if (!storeType || !storeUrl) {
    return res.status(400).json({ 
      error: 'Store type and URL are required' 
    })
  }

  if (storeType === 'shopify' && !accessToken) {
    return res.status(400).json({ 
      error: 'Access token is required for Shopify connections' 
    })
  }

  if (storeType === 'wordpress' && (!username || !appPassword)) {
    return res.status(400).json({ 
      error: 'Username and app password are required for WordPress connections' 
    })
  }

  const connection = await DatabaseService.createConnection({
    storeType,
    storeUrl,
    accessToken,
    username,
    appPassword,
  })

  return res.status(201).json({
    success: true,
    data: connection,
    message: 'Connection created successfully',
  })
}
