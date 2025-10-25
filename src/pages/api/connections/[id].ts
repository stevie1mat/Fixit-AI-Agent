import { NextApiRequest, NextApiResponse } from 'next'
import { DatabaseService } from '@/lib/database'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Connection ID is required' })
  }

  try {
    switch (req.method) {
      case 'GET':
        return await handleGetConnection(req, res, id)
      case 'PUT':
        return await handleUpdateConnection(req, res, id)
      case 'DELETE':
        return await handleDeleteConnection(req, res, id)
      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Connection API error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

async function handleGetConnection(req: NextApiRequest, res: NextApiResponse, id: string) {
  const connection = await DatabaseService.getConnection(id)
  
  if (!connection) {
    return res.status(404).json({ error: 'Connection not found' })
  }

  return res.status(200).json({
    success: true,
    data: connection,
  })
}

async function handleUpdateConnection(req: NextApiRequest, res: NextApiResponse, id: string) {
  const { storeUrl, accessToken, username, appPassword, isActive } = req.body

  const updateData: any = {}
  if (storeUrl !== undefined) updateData.storeUrl = storeUrl
  if (accessToken !== undefined) updateData.accessToken = accessToken
  if (username !== undefined) updateData.username = username
  if (appPassword !== undefined) updateData.appPassword = appPassword
  if (isActive !== undefined) updateData.isActive = isActive

  const connection = await DatabaseService.updateConnection(id, updateData)

  return res.status(200).json({
    success: true,
    data: connection,
    message: 'Connection updated successfully',
  })
}

async function handleDeleteConnection(req: NextApiRequest, res: NextApiResponse, id: string) {
  await DatabaseService.deleteConnection(id)

  return res.status(200).json({
    success: true,
    message: 'Connection deleted successfully',
  })
}
