import { supabase } from './supabase'

export interface StoreContext {
  url: string
  type: 'shopify' | 'wordpress'
  products: any[]
  themes: any[]
  performance: any
  seo: any
  currentIssues: string[]
}

export interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  context?: any
}

export interface OptimizationAction {
  action: string
  result: any
  timestamp: Date
  storeData: any
  success: boolean
}

export class AIContextManager {
  private userId: string
  private contextWindow: {
    storeData: StoreContext | null
    recentConversations: ConversationMessage[]
    currentIssues: string[]
    optimizationHistory: OptimizationAction[]
  }

  constructor(userId: string) {
    this.userId = userId
    this.contextWindow = {
      storeData: null,
      recentConversations: [],
      currentIssues: [],
      optimizationHistory: []
    }
  }

  // Load context from database
  async loadContext(storeConnectionId?: string) {
    try {
      const { data: contextData, error } = await supabase
        .from('AIContextWindow')
        .select('*')
        .eq('userId', this.userId)
        .eq('storeConnectionId', storeConnectionId || null)
        .single()

      if (contextData && !error) {
        this.contextWindow = {
          storeData: contextData.storeData ? JSON.parse(contextData.storeData) : null,
          recentConversations: contextData.recentMessages ? JSON.parse(contextData.recentMessages) : [],
          currentIssues: contextData.currentIssues ? JSON.parse(contextData.currentIssues) : [],
          optimizationHistory: contextData.optimizationHistory ? JSON.parse(contextData.optimizationHistory) : []
        }
      }
    } catch (error) {
      console.error('Error loading AI context:', error)
    }
  }

  // Save context to database
  async saveContext(storeConnectionId?: string) {
    try {
      const { error } = await supabase
        .from('AIContextWindow')
        .upsert({
          userId: this.userId,
          storeConnectionId: storeConnectionId || null,
          recentMessages: JSON.stringify(this.contextWindow.recentConversations),
          currentIssues: JSON.stringify(this.contextWindow.currentIssues),
          optimizationHistory: JSON.stringify(this.contextWindow.optimizationHistory),
          storeData: this.contextWindow.storeData ? JSON.stringify(this.contextWindow.storeData) : null,
          updatedAt: new Date()
        })

      if (error) {
        console.error('Error saving AI context:', error)
      }
    } catch (error) {
      console.error('Error saving AI context:', error)
    }
  }

  // Add store-specific context
  async addStoreContext(storeUrl: string, storeType: 'shopify' | 'wordpress', storeData: any) {
    this.contextWindow.storeData = {
      url: storeUrl,
      type: storeType,
      products: storeData.products || [],
      themes: storeData.themes || [],
      performance: storeData.performance || {},
      seo: storeData.seo || {},
      currentIssues: this.contextWindow.currentIssues
    }

    await this.saveContext()
  }

  // Add conversation context
  async addConversationContext(message: string, response: string, context?: any) {
    const conversation: ConversationMessage = {
      role: 'user',
      content: message,
      timestamp: new Date(),
      context
    }

    const assistantResponse: ConversationMessage = {
      role: 'assistant',
      content: response,
      timestamp: new Date(),
      context: this.contextWindow.storeData
    }

    this.contextWindow.recentConversations.push(conversation, assistantResponse)
    
    // Keep only last 10 conversations (20 messages)
    if (this.contextWindow.recentConversations.length > 20) {
      this.contextWindow.recentConversations = this.contextWindow.recentConversations.slice(-20)
    }

    await this.saveContext()
  }

  // Add optimization action
  async addOptimizationAction(action: string, result: any, success: boolean) {
    const optimizationAction: OptimizationAction = {
      action,
      result,
      timestamp: new Date(),
      storeData: this.contextWindow.storeData,
      success
    }

    this.contextWindow.optimizationHistory.push(optimizationAction)
    
    // Keep only last 50 optimizations
    if (this.contextWindow.optimizationHistory.length > 50) {
      this.contextWindow.optimizationHistory = this.contextWindow.optimizationHistory.slice(-50)
    }

    await this.saveContext()
  }

  // Update current issues
  async updateCurrentIssues(issues: string[]) {
    this.contextWindow.currentIssues = issues
    if (this.contextWindow.storeData) {
      this.contextWindow.storeData.currentIssues = issues
    }
    await this.saveContext()
  }

  // Generate context-aware prompt for AI
  generateContextualPrompt(userMessage: string): string {
    const context = this.contextWindow
    
    let prompt = `You are an e-commerce optimization expert. Use the provided store context to give personalized, actionable advice.\n\n`

    if (context.storeData) {
      prompt += `Store Context:
- URL: ${context.storeData.url}
- Type: ${context.storeData.type}
- Products: ${context.storeData.products.length} products
- Themes: ${context.storeData.themes.length} themes
- Current Issues: ${context.currentIssues.join(', ') || 'None identified'}\n\n`
    }

    if (context.recentConversations.length > 0) {
      prompt += `Recent Conversations:
${context.recentConversations.slice(-6).map(conv => 
  `- ${conv.role}: ${conv.content.substring(0, 100)}${conv.content.length > 100 ? '...' : ''}`
).join('\n')}\n\n`
    }

    if (context.optimizationHistory.length > 0) {
      const recentOptimizations = context.optimizationHistory.slice(-5)
      prompt += `Recent Optimizations:
${recentOptimizations.map(opt => 
  `- ${opt.action}: ${opt.success ? 'Success' : 'Failed'}`
).join('\n')}\n\n`
    }

    prompt += `User Message: ${userMessage}\n\nProvide a context-aware response based on the store's specific situation and optimization history.`

    return prompt
  }

  // Get optimization patterns for this store type
  async getOptimizationPatterns(storeType: 'shopify' | 'wordpress', category?: string) {
    try {
      let query = supabase
        .from('OptimizationPattern')
        .select('*')
        .eq('storeType', storeType)
        .order('successRate', { ascending: false })

      if (category) {
        query = query.eq('category', category)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching optimization patterns:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching optimization patterns:', error)
      return []
    }
  }

  // Save training example for AI fine-tuning
  async saveTrainingExample(
    input: string, 
    output: string, 
    category: string, 
    storeType: 'shopify' | 'wordpress',
    storeUrl?: string
  ) {
    try {
      const { error } =         await supabase
          .from('AITrainingExample')
          .insert({
            input,
            output,
            context: JSON.stringify(this.contextWindow.storeData),
            category,
            storeType,
            storeUrl,
            userId: this.userId
          })

      if (error) {
        console.error('Error saving training example:', error)
      }
    } catch (error) {
      console.error('Error saving training example:', error)
    }
  }

  // Get context summary for AI
  getContextSummary() {
    return {
      storeData: this.contextWindow.storeData,
      conversationCount: this.contextWindow.recentConversations.length,
      issueCount: this.contextWindow.currentIssues.length,
      optimizationCount: this.contextWindow.optimizationHistory.length,
      recentOptimizations: this.contextWindow.optimizationHistory.slice(-3)
    }
  }
}
