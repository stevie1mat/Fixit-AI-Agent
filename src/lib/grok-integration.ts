import { AIContextManager } from './ai-context'

export interface GrokConfig {
  apiKey: string
  modelName?: string
  baseUrl?: string
}

export interface GrokResponse {
  content: string
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export class GrokIntegration {
  private config: GrokConfig
  private contextManager: AIContextManager

  constructor(config: GrokConfig, userId: string) {
    this.config = {
      baseUrl: 'https://api.x.ai',
      modelName: 'grok-beta',
      ...config
    }
    this.contextManager = new AIContextManager(userId)
  }

  // Send context-aware request to Grok
  async sendToGrok(
    userMessage: string,
    storeContext?: any,
    temperature: number = 0.7
  ): Promise<GrokResponse> {
    try {
      // Load context if available
      await this.contextManager.loadContext()
      
      // Generate contextual prompt
      const contextualPrompt = this.contextManager.generateContextualPrompt(userMessage)
      
      // Get conversation history for context-aware responses
      const contextWindow = (this.contextManager as any).contextWindow
      const recentMessages = contextWindow?.recentConversations || []
      
      // Build messages array with conversation history
      const messages: any[] = [
        {
          role: 'system',
          content: `You are an e-commerce optimization expert specializing in Shopify and WordPress stores. Use the provided store context and conversation history to give personalized, actionable advice. Always provide specific, implementable solutions. Remember previous messages and maintain conversation context.`
        }
      ]
      
      // Add recent conversation history (last 6 exchanges = 12 messages max)
      if (recentMessages.length > 0) {
        const historyToInclude = recentMessages.slice(-12) // Last 6 conversations
        historyToInclude.forEach((msg: any) => {
          messages.push({
            role: msg.role,
            content: msg.content
          })
        })
      }
      
      // Add current user message
      messages.push({
        role: 'user',
        content: contextualPrompt
      })
      
      const response = await fetch(`${this.config.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.modelName,
          messages: messages,
          temperature,
          max_tokens: 2000,
          stream: false
        })
      })

      if (!response.ok) {
        throw new Error(`Grok API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        content: data.choices[0]?.message?.content || 'No response from Grok',
        usage: data.usage || {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0
        }
      }
    } catch (error) {
      console.error('Error calling Grok API:', error)
      throw error
    }
  }

  // Fine-tune Grok model with collected data
  async fineTuneModel(
    trainingData: any[],
    modelName: string = 'grok-ecommerce-optimizer'
  ): Promise<string> {
    try {
      const response = await fetch(`${this.config.baseUrl}/v1/fine_tuning/jobs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.modelName,
          training_file: await this.uploadTrainingFile(trainingData),
          hyperparameters: {
            n_epochs: 3,
            batch_size: 4,
            learning_rate_multiplier: 0.1
          },
          suffix: modelName
        })
      })

      if (!response.ok) {
        throw new Error(`Fine-tuning error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data.id
    } catch (error) {
      console.error('Error fine-tuning Grok model:', error)
      throw error
    }
  }

  // Upload training file to Grok
  private async uploadTrainingFile(trainingData: any[]): Promise<string> {
    try {
      // Format training data for Grok
      const formattedData = trainingData.map(example => ({
        messages: [
          {
            role: 'system',
            content: `You are an e-commerce optimization expert specializing in ${example.storeType} stores.`
          },
          {
            role: 'user',
            content: example.input
          },
          {
            role: 'assistant',
            content: example.output
          }
        ]
      }))

      const fileContent = JSON.stringify(formattedData, null, 2)
      const blob = new Blob([fileContent], { type: 'application/json' })
      
      const formData = new FormData()
      formData.append('file', blob, 'training_data.jsonl')
      formData.append('purpose', 'fine-tune')

      const response = await fetch(`${this.config.baseUrl}/v1/files`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error(`File upload error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data.id
    } catch (error) {
      console.error('Error uploading training file:', error)
      throw error
    }
  }

  // Get fine-tuning job status
  async getFineTuningStatus(jobId: string): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseUrl}/v1/fine_tuning/jobs/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        }
      })

      if (!response.ok) {
        throw new Error(`Status check error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error checking fine-tuning status:', error)
      throw error
    }
  }

  // List fine-tuned models
  async listFineTunedModels(): Promise<any[]> {
    try {
      const response = await fetch(`${this.config.baseUrl}/v1/models`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        }
      })

      if (!response.ok) {
        throw new Error(`Model list error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data.data.filter((model: any) => model.id.includes('ft:'))
    } catch (error) {
      console.error('Error listing fine-tuned models:', error)
      throw error
    }
  }

  // Use fine-tuned model
  async useFineTunedModel(
    modelId: string,
    userMessage: string,
    temperature: number = 0.7
  ): Promise<GrokResponse> {
    try {
      await this.contextManager.loadContext()
      const contextualPrompt = this.contextManager.generateContextualPrompt(userMessage)
      
      const response = await fetch(`${this.config.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelId,
          messages: [
            {
              role: 'user',
              content: contextualPrompt
            }
          ],
          temperature,
          max_tokens: 2000,
          stream: false
        })
      })

      if (!response.ok) {
        throw new Error(`Fine-tuned model error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        content: data.choices[0]?.message?.content || 'No response from fine-tuned model',
        usage: data.usage || {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0
        }
      }
    } catch (error) {
      console.error('Error using fine-tuned model:', error)
      throw error
    }
  }

  // Analyze conversation for optimization patterns
  async analyzeConversation(conversation: any[]): Promise<any> {
    try {
      const analysisPrompt = `Analyze this e-commerce optimization conversation and identify:
1. The main optimization category (product, SEO, performance, theme)
2. The specific issues discussed
3. The solutions provided
4. The success likelihood of the solutions
5. Any patterns that could be reused

Conversation:
${conversation.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Provide your analysis in JSON format.`

      const response = await fetch(`${this.config.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.modelName,
          messages: [
            {
              role: 'user',
              content: analysisPrompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1000
        })
      })

      if (!response.ok) {
        throw new Error(`Analysis error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const analysisText = data.choices[0]?.message?.content || '{}'
      
      try {
        return JSON.parse(analysisText)
      } catch {
        return { error: 'Failed to parse analysis response' }
      }
    } catch (error) {
      console.error('Error analyzing conversation:', error)
      throw error
    }
  }
}
