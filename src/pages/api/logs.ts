import { NextApiRequest, NextApiResponse } from 'next'

// Mock database for now - in production, this would use Prisma
let logs: any[] = []

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Get all logs
    try {
      res.status(200).json({
        success: true,
        logs: logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
      })
    } catch (error) {
      console.error('Error fetching logs:', error)
      res.status(500).json({ error: 'Failed to fetch logs' })
    }
  } else if (req.method === 'POST') {
    // Create new log
    try {
      const { action, operation, description, beforeState, afterState, status, error, metadata } = req.body

      const newLog = {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        action,
        operation,
        description,
        beforeState,
        afterState,
        status,
        error,
        metadata,
      }

      logs.push(newLog)

      res.status(201).json({
        success: true,
        log: newLog,
        message: 'Log created successfully',
      })
    } catch (error) {
      console.error('Error creating log:', error)
      res.status(500).json({ error: 'Failed to create log' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
