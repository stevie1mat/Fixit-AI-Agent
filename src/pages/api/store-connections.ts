import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Store a new connection
    try {
      const { userId, type, url, accessToken, username, appPassword } = req.body

      if (!userId || !type || !url) {
        return res.status(400).json({ error: 'Missing required fields: userId, type, and url are required' })
      }

      // Validate based on store type
      if (type === 'shopify' && !accessToken) {
        return res.status(400).json({ error: 'Access token is required for Shopify connections' })
      }

      if (type === 'wordpress' && (!username || !appPassword)) {
        return res.status(400).json({ error: 'Username and app password are required for WordPress connections' })
      }

      // Prepare connection data
      const connectionData: any = {
        user_id: userId,
        type,
        url,
        is_connected: true,
      }

      // Add credentials based on type
      if (type === 'shopify') {
        connectionData.access_token = accessToken
      } else if (type === 'wordpress') {
        connectionData.username = username
        connectionData.app_password = appPassword
      }

      const { data, error } = await supabase
        .from('store_connections')
        .insert(connectionData)
        .select()
        .single()

      if (error) {
        console.error('Error storing connection:', error)
        return res.status(500).json({ error: 'Failed to store connection', details: error.message })
      }

      res.status(201).json({ connection: data })
    } catch (error) {
      console.error('Store connections API error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else if (req.method === 'GET') {
    // Get connections for a user
    try {
      const { userId } = req.query

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' })
      }

      const { data, error } = await supabase
        .from('store_connections')
        .select('*')
        .eq('user_id', userId)
        .eq('is_connected', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching connections:', error)
        return res.status(500).json({ error: 'Failed to fetch connections' })
      }

      res.status(200).json({ connections: data })
    } catch (error) {
      console.error('Store connections API error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else if (req.method === 'DELETE') {
    // Delete a connection
    try {
      const { connectionId } = req.query

      if (!connectionId || typeof connectionId !== 'string') {
        console.error('DELETE: Missing or invalid connectionId:', connectionId)
        return res.status(400).json({ error: 'Connection ID is required' })
      }

      console.log('Attempting to delete connection:', connectionId)

      // First, verify the connection exists and get user_id for security check
      const { data: existingConnection, error: fetchError } = await supabase
        .from('store_connections')
        .select('id, user_id')
        .eq('id', connectionId)
        .single()

      if (fetchError) {
        console.error('Error fetching connection to delete:', fetchError)
        return res.status(404).json({ 
          error: 'Connection not found',
          details: fetchError.message 
        })
      }

      if (!existingConnection) {
        console.error('Connection not found:', connectionId)
        return res.status(404).json({ error: 'Connection not found' })
      }

      console.log('Found connection to delete:', existingConnection)

      // Delete the connection
      const { data, error } = await supabase
        .from('store_connections')
        .delete()
        .eq('id', connectionId)
        .select()

      if (error) {
        console.error('Error deleting connection:', error)
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        return res.status(500).json({ 
          error: 'Failed to delete connection',
          details: error.message,
          code: error.code
        })
      }

      console.log('Successfully deleted connection:', connectionId)
      res.status(200).json({ 
        message: 'Connection deleted successfully',
        deletedId: connectionId
      })
    } catch (error) {
      console.error('Store connections API error:', error)
      res.status(500).json({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
