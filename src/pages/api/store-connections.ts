import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

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

      console.log('GET /api/store-connections - Request:', { 
        userId, 
        userIdType: typeof userId,
        query: req.query,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing'
      })

      if (!userId || typeof userId !== 'string') {
        console.error('GET /api/store-connections - Missing or invalid userId:', userId)
        return res.status(400).json({ error: 'User ID is required' })
      }

      console.log('GET /api/store-connections - Fetching from Supabase for userId:', userId)
      const { data, error } = await supabase
        .from('store_connections')
        .select('*')
        .eq('user_id', userId)
        .eq('is_connected', true)
        .order('created_at', { ascending: false })

      console.log('GET /api/store-connections - Supabase response:', {
        dataCount: data?.length || 0,
        data: data,
        error: error ? {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        } : null
      })

      if (error) {
        console.error('Error fetching connections:', error)
        return res.status(500).json({ 
          error: 'Failed to fetch connections',
          details: error.message,
          code: error.code
        })
      }

      console.log('GET /api/store-connections - Returning connections:', data?.length || 0)
      res.status(200).json({ connections: data || [] })
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
      
      // Create a dedicated client with service role key for DELETE operations
      // This ensures RLS is bypassed even if the main client uses anon key
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      
      let deleteClient = supabase
      if (supabaseUrl && supabaseServiceKey) {
        // Use service role key client for DELETE (bypasses RLS)
        deleteClient = createClient(supabaseUrl, supabaseServiceKey)
        console.log('✅ Using SERVICE_ROLE_KEY client for delete (bypasses RLS)')
      } else {
        console.warn('⚠️ SERVICE_ROLE_KEY not found, using default client (may be subject to RLS)')
        console.warn('⚠️ Add SUPABASE_SERVICE_ROLE_KEY to Vercel environment variables')
      }

      // First, check if connection exists (for diagnostics)
      const { data: existing, error: checkError } = await deleteClient
        .from('store_connections')
        .select('id, user_id, type, url')
        .eq('id', connectionId)
        .maybeSingle()

      if (checkError) {
        console.error('Error checking connection:', checkError)
      } else if (existing) {
        console.log('Connection found:', existing)
      } else {
        console.warn('Connection not found with ID:', connectionId)
      }

      // Try to delete directly
      const { data, error } = await deleteClient
        .from('store_connections')
        .delete()
        .eq('id', connectionId)
        .select()

      console.log('Delete result:', {
        data: data ? `${data.length} rows` : 'null',
        error: error ? error.message : 'none',
        errorCode: error?.code,
        errorDetails: error?.details
      })

      if (error) {
        console.error('Error deleting connection:', error)
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        
        // If it's a RLS/permission error, provide helpful message
        if (error.code === '42501' || error.message?.includes('permission') || error.message?.includes('policy')) {
          return res.status(403).json({ 
            error: 'Permission denied - RLS policy blocking delete',
            details: 'The Row Level Security policy is preventing deletion. Please check RLS policies or use service role key.',
            code: error.code
          })
        }
        
        return res.status(500).json({ 
          error: 'Failed to delete connection',
          details: error.message,
          code: error.code
        })
      }

      // Check if anything was actually deleted
      if (!data || data.length === 0) {
        console.warn('No connection deleted - connection may not exist or RLS blocked:', connectionId)
        console.warn('Existing connection check result:', existing ? 'Found' : 'Not found')
        return res.status(404).json({ 
          error: 'Connection not found or could not be deleted',
          details: existing 
            ? 'Connection exists but delete returned 0 rows. Possible RLS or constraint issue.'
            : 'Connection does not exist with the provided ID.',
          connectionExists: !!existing
        })
      }

      console.log('Successfully deleted connection:', connectionId, 'Rows deleted:', data.length)
      res.status(200).json({ 
        message: 'Connection deleted successfully',
        deletedId: connectionId,
        deleted: data[0]
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
