import { prisma } from './database'

export interface FunctionExecutionResult {
  success: boolean
  output?: any
  error?: string
  executionTime?: number
}

export class AIFunctionRegistry {
  private functionCache = new Map<string, Function>()

  // Register a new AI-generated function
  async registerFunction(
    name: string,
    functionCode: string,
    description?: string,
    parameters?: any
  ) {
    try {
      // Create the function dynamically
      const dynamicFunction = new Function('connection', 'data', functionCode)
      
      // Store in database
      const aiFunction = await prisma.aIFunction.upsert({
        where: { name },
        update: {
          functionCode,
          description,
          parameters: parameters ? JSON.stringify(parameters) : null,
          updatedAt: new Date(),
        },
        create: {
          name,
          functionCode,
          description,
          parameters: parameters ? JSON.stringify(parameters) : null,
        },
      })

      // Cache the function
      this.functionCache.set(name, dynamicFunction)
      
      return aiFunction
    } catch (error) {
      console.error('Error registering function:', error)
      throw error
    }
  }

  // Execute a function by name
  async executeFunction(
    name: string,
    connection: any,
    data: any
  ): Promise<FunctionExecutionResult> {
    const startTime = Date.now()
    
    try {
      // Check cache first
      let functionToExecute = this.functionCache.get(name)
      
      if (!functionToExecute) {
        // Load from database
        const aiFunction = await prisma.aIFunction.findUnique({
          where: { name, isActive: true }
        })
        
        if (!aiFunction) {
          throw new Error(`Function '${name}' not found`)
        }
        
        // Create function from stored code
        functionToExecute = new Function('connection', 'data', aiFunction.functionCode)
        this.functionCache.set(name, functionToExecute)
      }

      // Execute the function
      const output = await functionToExecute(connection, data)
      const executionTime = Date.now() - startTime

      // Log successful execution
      await this.logExecution(name, data, output, true, executionTime)
      
      // Update usage stats
      await this.updateFunctionStats(name, true)

      return {
        success: true,
        output,
        executionTime
      }
    } catch (error) {
      const executionTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      // Log failed execution
      await this.logExecution(name, data, null, false, executionTime, errorMessage)
      
      // Update usage stats
      await this.updateFunctionStats(name, false)

      return {
        success: false,
        error: errorMessage,
        executionTime
      }
    }
  }

  // Generate a function using AI
  async generateFunction(
    action: string,
    context: any,
    connection: any
  ): Promise<{ name: string; function: any }> {
    try {
      // Use Gemini to generate function code
      const functionCode = await this.generateFunctionCode(action, context)
      
      // Create a unique function name
      const functionName = this.generateFunctionName(action)
      
      // Register the function
      await this.registerFunction(
        functionName,
        functionCode,
        `AI-generated function for: ${action}`,
        { action, context }
      )
      
      return {
        name: functionName,
        function: new Function('connection', 'data', functionCode)
      }
    } catch (error) {
      console.error('Error generating function:', error)
      throw error
    }
  }

  // Find similar existing functions
  async findSimilarFunction(action: string): Promise<string | null> {
    const functions = await prisma.aIFunction.findMany({
      where: { isActive: true },
      select: { name: true, description: true }
    })
    
    // Simple similarity check (can be enhanced with AI)
    for (const func of functions) {
      if (func.description && func.description.toLowerCase().includes(action.toLowerCase())) {
        return func.name
      }
    }
    
    return null
  }

  // Get all available functions
  async getAvailableFunctions() {
    return await prisma.aIFunction.findMany({
      where: { isActive: true },
      orderBy: { usageCount: 'desc' }
    })
  }

  // Private helper methods
  private async generateFunctionCode(action: string, context: any): Promise<string> {
    const prompt = `
    Generate JavaScript function code for this WordPress action: "${action}"
    
    Context: ${JSON.stringify(context)}
    
    The function should:
    1. Take connection and data parameters
    2. Make appropriate WordPress API calls
    3. Handle errors gracefully
    4. Return meaningful results
    
    Return only the function body code (without function declaration).
    `
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    })
    
    if (!response.ok) {
      throw new Error('Failed to generate function code')
    }
    
    const result = await response.json()
    return result.candidates[0].content.parts[0].text
  }

  private generateFunctionName(action: string): string {
    const timestamp = Date.now()
    const sanitized = action.toLowerCase().replace(/[^a-z0-9]/g, '_')
    return `ai_function_${sanitized}_${timestamp}`
  }

  private async logExecution(
    functionName: string,
    inputData: any,
    outputData: any,
    success: boolean,
    executionTime: number,
    error?: string
  ) {
    const aiFunction = await prisma.aIFunction.findUnique({
      where: { name: functionName }
    })
    
    if (aiFunction) {
      await prisma.functionExecution.create({
        data: {
          functionId: aiFunction.id,
          inputData: JSON.stringify(inputData),
          outputData: outputData ? JSON.stringify(outputData) : null,
          success,
          executionTime,
          error
        }
      })
    }
  }

  private async updateFunctionStats(functionName: string, success: boolean) {
    const aiFunction = await prisma.aIFunction.findUnique({
      where: { name: functionName }
    })
    
    if (aiFunction) {
      const newUsageCount = aiFunction.usageCount + 1
      const newSuccessCount = success ? 
        (aiFunction.successRate * aiFunction.usageCount) + 1 : 
        (aiFunction.successRate * aiFunction.usageCount)
      const newSuccessRate = newSuccessCount / newUsageCount

      await prisma.aIFunction.update({
        where: { name: functionName },
        data: {
          usageCount: newUsageCount,
          successRate: newSuccessRate
        }
      })
    }
  }
}
