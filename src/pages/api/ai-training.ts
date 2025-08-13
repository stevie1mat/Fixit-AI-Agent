import { NextApiRequest, NextApiResponse } from 'next'
import { AIFineTuningService } from '@/lib/ai-fine-tuning'
import { AIContextManager } from '@/lib/ai-context'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Get training data or patterns
    try {
      const { userId, type, storeType, category, limit } = req.query

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' })
      }

      const fineTuningService = new AIFineTuningService(userId as string)

      if (type === 'training-data') {
        const trainingData = await fineTuningService.getTrainingDataForFineTuning(
          storeType as 'shopify' | 'wordpress',
          category as string,
          limit ? parseInt(limit as string) : 1000
        )
        return res.status(200).json({ trainingData })
      }

      if (type === 'patterns') {
        const patterns = await fineTuningService.getRelevantPatterns(
          storeType as 'shopify' | 'wordpress',
          category as string,
          req.query.conditions ? JSON.parse(req.query.conditions as string) : {}
        )
        return res.status(200).json({ patterns })
      }

      if (type === 'export') {
        const exportData = await fineTuningService.exportTrainingDataForFineTuning()
        return res.status(200).json({ exportData })
      }

      return res.status(400).json({ error: 'Invalid type parameter' })
    } catch (error) {
      console.error('AI training API error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'POST') {
    // Save training data or patterns
    try {
      const { userId, action, data } = req.body

      if (!userId || !action) {
        return res.status(400).json({ error: 'User ID and action are required' })
      }

      const fineTuningService = new AIFineTuningService(userId)

      if (action === 'save-pattern') {
        await fineTuningService.saveOptimizationPattern(data)
        return res.status(200).json({ message: 'Pattern saved successfully' })
      }

      if (action === 'update-pattern-success') {
        const { patternId, success } = data
        await fineTuningService.updatePatternSuccessRate(patternId, success)
        return res.status(200).json({ message: 'Pattern success rate updated' })
      }

      if (action === 'generate-examples') {
        const { storeUrl, storeType } = data
        const examples = await fineTuningService.generateTrainingExamplesFromStore(storeUrl, storeType)
        return res.status(200).json({ examples })
      }

      return res.status(400).json({ error: 'Invalid action' })
    } catch (error) {
      console.error('AI training API error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
