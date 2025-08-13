import { supabase } from './supabase'
import { AIContextManager } from './ai-context'

export interface TrainingData {
  input: string
  output: string
  context: any
  category: string
  storeType: 'shopify' | 'wordpress'
  storeUrl?: string
  rating?: number
}

export interface OptimizationPattern {
  pattern: string
  description: string
  category: string
  storeType: 'shopify' | 'wordpress'
  conditions: any
  solution: any
  successRate: number
}

export class AIFineTuningService {
  private contextManager: AIContextManager

  constructor(userId: string) {
    this.contextManager = new AIContextManager(userId)
  }

  // Collect training data from real conversations
  async collectTrainingData(
    input: string,
    output: string,
    category: string,
    storeType: 'shopify' | 'wordpress',
    storeUrl?: string
  ) {
    try {
      // Save to database
      await this.contextManager.saveTrainingExample(
        input,
        output,
        category,
        storeType,
        storeUrl
      )

      // Also save to training examples table
      const { error } =         await supabase
          .from('AITrainingExample')
          .insert({
            input,
            output,
            context: JSON.stringify(this.contextManager.getContextSummary()),
            category,
            storeType,
            storeUrl,
            userId: this.contextManager['userId']
          })

      if (error) {
        console.error('Error saving training data:', error)
      }
    } catch (error) {
      console.error('Error collecting training data:', error)
    }
  }

  // Generate training examples from store analysis
  async generateTrainingExamplesFromStore(storeUrl: string, storeType: 'shopify' | 'wordpress') {
    const examples: TrainingData[] = []

    try {
      // Get store analysis data
      const { data: analysisData, error } = await supabase
        .from('StoreAnalysis')
        .select('*')
        .eq('storeConnectionId', storeUrl)
        .order('createdAt', { ascending: false })

      if (analysisData && !error) {
        for (const analysis of analysisData) {
          // Generate product optimization examples
          if (analysis.analysisType === 'products') {
            const productIssues = analysis.issues || []
            
            productIssues.forEach((issue: any) => {
              examples.push({
                input: `How to fix ${issue.type} for my products?`,
                output: this.generateProductOptimizationResponse(issue, analysis.recommendations),
                context: analysis.data,
                category: 'product_optimization',
                storeType,
                storeUrl
              })
            })
          }

          // Generate SEO optimization examples
          if (analysis.analysisType === 'seo') {
            const seoIssues = analysis.issues || []
            
            seoIssues.forEach((issue: any) => {
              examples.push({
                input: `How to improve my SEO for ${issue.keyword || 'my store'}?`,
                output: this.generateSEOOptimizationResponse(issue, analysis.recommendations),
                context: analysis.data,
                category: 'seo_optimization',
                storeType,
                storeUrl
              })
            })
          }

          // Generate performance optimization examples
          if (analysis.analysisType === 'performance') {
            const performanceIssues = analysis.issues || []
            
            performanceIssues.forEach((issue: any) => {
              examples.push({
                input: `How to fix ${issue.type} performance issue?`,
                output: this.generatePerformanceOptimizationResponse(issue, analysis.recommendations),
                context: analysis.data,
                category: 'performance',
                storeType,
                storeUrl
              })
            })
          }
        }
      }

      // Save generated examples
      for (const example of examples) {
        await this.collectTrainingData(
          example.input,
          example.output,
          example.category,
          example.storeType,
          example.storeUrl
        )
      }

      return examples
    } catch (error) {
      console.error('Error generating training examples:', error)
      return []
    }
  }

  // Generate product optimization response
  private generateProductOptimizationResponse(issue: any, recommendations: any): string {
    const responses: Record<string, string> = {
      'short_description': `I'll help you improve your product descriptions. Here are the key optimizations:

1. **Expand Product Descriptions**: Add detailed features, benefits, and specifications
2. **Include Size Guides**: Add comprehensive sizing information
3. **Add Customer Reviews**: Display authentic customer feedback
4. **Optimize for SEO**: Include relevant keywords naturally
5. **Add Product Videos**: Include demonstration videos

${recommendations?.product_description || 'Focus on creating compelling, detailed descriptions that answer customer questions.'}`,

      'missing_images': `I'll help you optimize your product images. Here's what to improve:

1. **High-Resolution Images**: Use 2048x2048px minimum
2. **Multiple Angles**: Show products from different perspectives
3. **Lifestyle Shots**: Include products in use
4. **Consistent Background**: Use white or neutral backgrounds
5. **Alt Text**: Add descriptive alt text for SEO

${recommendations?.images || 'Ensure all products have at least 5-7 high-quality images.'}`,

      'pricing_issues': `I'll help you optimize your product pricing strategy:

1. **Competitive Analysis**: Research competitor pricing
2. **Value Proposition**: Highlight unique benefits
3. **Bundle Offers**: Create product bundles
4. **Dynamic Pricing**: Consider seasonal adjustments
5. **Clear Discounts**: Make savings obvious

${recommendations?.pricing || 'Focus on value-based pricing that reflects your product quality.'}`
    }

    return responses[issue.type] || `I'll help you fix the ${issue.type} issue. ${recommendations?.general || 'Let me analyze your specific situation and provide targeted solutions.'}`
  }

  // Generate SEO optimization response
  private generateSEOOptimizationResponse(issue: any, recommendations: any): string {
    const responses: Record<string, string> = {
      'meta_description': `I'll help you optimize your meta descriptions:

1. **Compelling Copy**: Write engaging, action-oriented descriptions
2. **Keyword Integration**: Include primary keywords naturally
3. **Length Optimization**: Keep between 150-160 characters
4. **Unique Content**: Avoid duplicate meta descriptions
5. **Call-to-Action**: Include relevant CTAs

${recommendations?.meta_description || 'Focus on creating unique, compelling descriptions for each page.'}`,

      'title_tags': `I'll help you optimize your title tags:

1. **Keyword Placement**: Put primary keywords at the beginning
2. **Length Control**: Keep under 60 characters
3. **Brand Inclusion**: Include your brand name
4. **Unique Titles**: Avoid duplicate titles
5. **Action Words**: Use compelling action verbs

${recommendations?.title_tags || 'Create unique, keyword-rich titles for each page.'}`,

      'internal_linking': `I'll help you improve your internal linking structure:

1. **Relevant Links**: Link to related products/pages
2. **Anchor Text**: Use descriptive anchor text
3. **Navigation Structure**: Create logical site hierarchy
4. **Breadcrumbs**: Implement breadcrumb navigation
5. **Related Products**: Add related product suggestions

${recommendations?.internal_linking || 'Focus on creating a logical, user-friendly site structure.'}`
    }

    return responses[issue.type] || `I'll help you improve your SEO for ${issue.keyword || 'your store'}. ${recommendations?.general || 'Let me provide specific optimization strategies.'}`
  }

  // Generate performance optimization response
  private generatePerformanceOptimizationResponse(issue: any, recommendations: any): string {
    const responses: Record<string, string> = {
      'image_optimization': `I'll help you optimize your images for better performance:

1. **Compress Images**: Use WebP format and compress files
2. **Lazy Loading**: Implement lazy loading for images
3. **Responsive Images**: Use appropriate sizes for different devices
4. **CDN Usage**: Serve images from a CDN
5. **Alt Text**: Add descriptive alt text

${recommendations?.images || 'Focus on reducing image file sizes while maintaining quality.'}`,

      'css_optimization': `I'll help you optimize your CSS for better performance:

1. **Minify CSS**: Remove unnecessary whitespace and comments
2. **Critical CSS**: Inline critical CSS for above-the-fold content
3. **Remove Unused CSS**: Eliminate unused stylesheets
4. **Combine Files**: Merge multiple CSS files
5. **Async Loading**: Load non-critical CSS asynchronously

${recommendations?.css || 'Focus on reducing CSS file sizes and improving loading times.'}`,

      'javascript_optimization': `I'll help you optimize your JavaScript for better performance:

1. **Minify JS**: Compress JavaScript files
2. **Async Loading**: Load non-critical scripts asynchronously
3. **Remove Unused Code**: Eliminate dead code
4. **Bundle Optimization**: Use code splitting and bundling
5. **Caching**: Implement proper caching strategies

${recommendations?.javascript || 'Focus on reducing JavaScript execution time and file sizes.'}`
    }

    return responses[issue.type] || `I'll help you fix the ${issue.type} performance issue. ${recommendations?.general || 'Let me provide specific optimization strategies.'}`
  }

  // Get training data for fine-tuning
  async getTrainingDataForFineTuning(
    storeType?: 'shopify' | 'wordpress',
    category?: string,
    limit: number = 1000
  ) {
    try {
      let query = supabase
        .from('AITrainingExample')
        .select('*')
        .eq('isVerified', true)
        .order('createdAt', { ascending: false })
        .limit(limit)

      if (storeType) {
        query = query.eq('storeType', storeType)
      }

      if (category) {
        query = query.eq('category', category)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching training data:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching training data:', error)
      return []
    }
  }

  // Save optimization pattern
  async saveOptimizationPattern(pattern: OptimizationPattern) {
    try {
      const { error } = await supabase
        .from('OptimizationPattern')
        .insert({
          pattern: pattern.pattern,
          description: pattern.description,
          category: pattern.category,
          storeType: pattern.storeType,
          conditions: pattern.conditions,
          solution: pattern.solution,
          successRate: pattern.successRate,
          usageCount: 0
        })

      if (error) {
        console.error('Error saving optimization pattern:', error)
      }
    } catch (error) {
      console.error('Error saving optimization pattern:', error)
    }
  }

  // Update pattern success rate
  async updatePatternSuccessRate(patternId: string, success: boolean) {
    try {
      const { data: pattern, error: fetchError } = await supabase
        .from('OptimizationPattern')
        .select('successRate, usageCount')
        .eq('id', patternId)
        .single()

      if (fetchError || !pattern) {
        console.error('Error fetching pattern:', fetchError)
        return
      }

      const newUsageCount = pattern.usageCount + 1
      const newSuccessRate = ((pattern.successRate * pattern.usageCount) + (success ? 1 : 0)) / newUsageCount

      const { error: updateError } = await supabase
        .from('OptimizationPattern')
        .update({
          successRate: newSuccessRate,
          usageCount: newUsageCount,
          updatedAt: new Date()
        })
        .eq('id', patternId)

      if (updateError) {
        console.error('Error updating pattern success rate:', updateError)
      }
    } catch (error) {
      console.error('Error updating pattern success rate:', error)
    }
  }

  // Get optimization patterns for specific situation
  async getRelevantPatterns(
    storeType: 'shopify' | 'wordpress',
    category: string,
    conditions: any
  ) {
    try {
      const { data, error } = await supabase
        .from('OptimizationPattern')
        .select('*')
        .eq('storeType', storeType)
        .eq('category', category)
        .gte('successRate', 0.7) // Only high-success patterns
        .order('successRate', { ascending: false })
        .limit(5)

      if (error) {
        console.error('Error fetching relevant patterns:', error)
        return []
      }

      // Filter patterns based on conditions
      return (data || []).filter(pattern => {
        const patternConditions = pattern.conditions || {}
        return this.matchConditions(conditions, patternConditions)
      })
    } catch (error) {
      console.error('Error fetching relevant patterns:', error)
      return []
    }
  }

  // Match conditions for pattern selection
  private matchConditions(userConditions: any, patternConditions: any): boolean {
    for (const [key, value] of Object.entries(patternConditions)) {
      if (userConditions[key] !== value) {
        return false
      }
    }
    return true
  }

  // Export training data for external AI fine-tuning
  async exportTrainingDataForFineTuning(): Promise<string> {
    try {
      const trainingData = await this.getTrainingDataForFineTuning()
      
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
        ],
        context: example.context
      }))

      return JSON.stringify(formattedData, null, 2)
    } catch (error) {
      console.error('Error exporting training data:', error)
      return '[]'
    }
  }
}
