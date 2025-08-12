import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Store a new connection
    try {
      const { userId, type, url, accessToken } = req.body

      if (!userId || !type || !url || !accessToken) {
        return res.status(400).json({ error: 'Missing required fields' })
      }

      const { data, error } = await supabase
        .from('store_connections')
        .insert({
          user_id: userId,
          type,
          url,
          access_token: accessToken,
          is_connected: true,
        })
        .select()
        .single()

      if (error) {
        console.error('Error storing connection:', error)
        return res.status(500).json({ error: 'Failed to store connection' })
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

      if (!connectionId) {
        return res.status(400).json({ error: 'Connection ID is required' })
      }

      const { error } = await supabase
        .from('store_connections')
        .delete()
        .eq('id', connectionId)

      if (error) {
        console.error('Error deleting connection:', error)
        return res.status(500).json({ error: 'Failed to delete connection' })
      }

      res.status(200).json({ message: 'Connection deleted successfully' })
    } catch (error) {
      console.error('Store connections API error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
