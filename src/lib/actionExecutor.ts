import { AIFunctionRegistry } from './aiFunctionRegistry'
import { WordPressAPI } from './wordpress'
import { DatabaseService } from './database'

export interface ActionResult {
  success: boolean
  output?: any
  error?: string
  functionName?: string
  executionTime?: number
}

export class ActionExecutor {
  private functionRegistry: AIFunctionRegistry

  constructor() {
    this.functionRegistry = new AIFunctionRegistry()
  }

  // Main method to execute any WordPress action
  async executeAction(
    action: string,
    connection: any,
    context?: any
  ): Promise<ActionResult> {
    try {
      console.log(`Executing action: ${action}`)
      
      // First, try to find a similar existing function
      const similarFunction = await this.functionRegistry.findSimilarFunction(action)
      
      if (similarFunction) {
        console.log(`Found similar function: ${similarFunction}`)
        return await this.functionRegistry.executeFunction(similarFunction, connection, context)
      }
      
      // If no similar function found, generate a new one
      console.log('No similar function found, generating new one...')
      const generatedFunction = await this.functionRegistry.generateFunction(action, context, connection)
      
      // Execute the newly generated function
      return await this.functionRegistry.executeFunction(generatedFunction.name, connection, context)
      
    } catch (error) {
      console.error('Error executing action:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Parse action intent using AI
  async parseActionIntent(action: string): Promise<{
    type: string
    action: string
    target: string
    parameters: any
  }> {
    try {
      const prompt = `
      Parse this WordPress action request and return JSON:
      
      Action: "${action}"
      
      Return JSON with:
      {
        "type": "plugin_management|cache_management|content_management|settings_management",
        "action": "deactivate|activate|install|uninstall|clear|create|update|delete",
        "target": "plugin_name|post_id|setting_name",
        "parameters": {}
      }
      `
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to parse action intent')
      }
      
      const result = await response.json()
      const responseText = result.candidates[0].content.parts[0].text
      
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      
      throw new Error('Could not parse JSON from AI response')
    } catch (error) {
      console.error('Error parsing action intent:', error)
      // Return a default structure
      return {
        type: 'unknown',
        action: 'unknown',
        target: 'unknown',
        parameters: {}
      }
    }
  }

  // Execute specific types of actions
  async executePluginAction(intent: any, connection: any): Promise<ActionResult> {
    const wordpress = new WordPressAPI(connection.storeUrl, connection.username, connection.appPassword)
    
    try {
      switch (intent.action) {
        case 'deactivate':
          const deactivateResult = await wordpress.deactivatePlugin(intent.target)
          return {
            success: true,
            output: deactivateResult,
            functionName: 'deactivate_plugin'
          }
        case 'activate':
          const activateResult = await wordpress.activatePlugin(intent.target)
          return {
            success: true,
            output: activateResult,
            functionName: 'activate_plugin'
          }
        default:
          return {
            success: false,
            error: `Unsupported plugin action: ${intent.action}`
          }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Execute cache actions
  async executeCacheAction(intent: any, connection: any): Promise<ActionResult> {
    const wordpress = new WordPressAPI(connection.storeUrl, connection.username, connection.appPassword)
    
    try {
      const cacheResult = await wordpress.clearCache()
      return {
        success: cacheResult.success,
        output: cacheResult.message,
        functionName: 'clear_cache'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Get available functions
  async getAvailableFunctions() {
    return await this.functionRegistry.getAvailableFunctions()
  }

  // Execute action with safety checks
  async executeActionSafely(
    action: string,
    connection: any,
    context?: any
  ): Promise<ActionResult> {
    // Safety checks
    const safetyResult = await this.validateActionSafety(action)
    if (!safetyResult.safe) {
      return {
        success: false,
        error: safetyResult.reason
      }
    }

    // Execute the action
    const result = await this.executeAction(action, connection, context)
    
    // Log the action
    await DatabaseService.createChangeLog({
      action: 'ai_executed_action',
      operation: result.functionName || 'unknown',
      description: `AI executed: ${action}`,
      status: result.success ? 'success' : 'failed',
      error: result.error,
      metadata: {
        action,
        result,
        executionTime: result.executionTime
      }
    })

    return result
  }

  // Validate action safety
  private async validateActionSafety(action: string): Promise<{ safe: boolean; reason?: string }> {
    const dangerousActions = ['delete', 'uninstall', 'deactivate_critical']
    const criticalPlugins = ['woocommerce', 'elementor', 'yoast-seo']
    
    const lowerAction = action.toLowerCase()
    
    for (const dangerous of dangerousActions) {
      if (lowerAction.includes(dangerous)) {
        for (const critical of criticalPlugins) {
          if (lowerAction.includes(critical)) {
            return {
              safe: false,
              reason: `Critical plugin operation (${critical}) requires manual confirmation`
            }
          }
        }
      }
    }
    
    return { safe: true }
  }
}
