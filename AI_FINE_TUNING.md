# AI Fine-tuning and Context Management System

This document explains how to implement AI fine-tuning and context management in your FixIt AI application using Grok or similar AI systems.

## 🎯 Overview

The AI fine-tuning system enables your e-commerce optimization AI to:
- **Learn from real conversations** with store owners
- **Build context-aware responses** based on store-specific data
- **Improve optimization patterns** through continuous learning
- **Fine-tune models** with collected training data

## 🏗️ Architecture

### Core Components

1. **AIContextManager** (`src/lib/ai-context.ts`)
   - Manages store-specific context windows
   - Tracks conversation history and optimization actions
   - Generates context-aware prompts for AI

2. **AIFineTuningService** (`src/lib/ai-fine-tuning.ts`)
   - Collects training data from conversations
   - Manages optimization patterns
   - Prepares data for model fine-tuning

3. **GrokIntegration** (`src/lib/grok-integration.ts`)
   - Handles communication with Grok AI API
   - Manages fine-tuning jobs
   - Provides context-aware responses

4. **Database Schema** (`prisma/schema.prisma`)
   - `AITrainingExample`: Stores conversation examples
   - `AIContextWindow`: Manages context for each user/store
   - `OptimizationPattern`: Stores reusable optimization strategies
   - `StoreAnalysis`: Stores analysis results and recommendations

## 🚀 Getting Started

### 1. Environment Setup

Add your Grok API credentials to `.env.local`:

```bash
GROK_API_KEY=your_grok_api_key_here
GROK_BASE_URL=https://api.grok.ai
```

### 2. Database Setup

The system automatically creates the required database tables:

```bash
npx prisma db push
```

### 3. Access the AI Training Dashboard

Navigate to `/ai-training` in your app to access the training dashboard.

## 📊 How It Works

### Context Management

The system maintains context for each user and store:

```typescript
// Initialize context manager
const contextManager = new AIContextManager(userId)

// Load existing context
await contextManager.loadContext()

// Add store-specific context
await contextManager.addStoreContext(storeUrl, storeType, storeData)

// Add conversation context
await contextManager.addConversationContext(userMessage, aiResponse)
```

### Training Data Collection

Every conversation automatically generates training examples:

```typescript
// Automatically collected in chat API
await fineTuningService.collectTrainingData(
  userMessage,
  aiResponse,
  category, // 'product_optimization', 'seo_optimization', etc.
  storeType,
  storeUrl
)
```

### Context-Aware Prompts

The system generates intelligent prompts based on:

- **Store Data**: Products, themes, performance metrics
- **Conversation History**: Recent interactions and solutions
- **Optimization History**: Previously applied changes
- **Current Issues**: Identified problems and their status

Example prompt:
```
Store Context:
- URL: mystore.myshopify.com
- Type: shopify
- Products: 150 products
- Themes: 2 themes
- Current Issues: slow_loading, poor_seo

Recent Conversations:
- User: How to improve my product descriptions?
- AI: I'll help you optimize your product descriptions...

Recent Optimizations:
- Image optimization: Success
- SEO improvements: Success

User Message: How to fix my homepage speed?

Provide a context-aware response based on the store's specific situation and optimization history.
```

## 🔧 Fine-tuning Process

### 1. Data Collection

The system automatically collects training data from:
- User conversations
- Store analysis results
- Applied optimizations
- Success/failure feedback

### 2. Data Preparation

Training data is formatted for AI fine-tuning:

```json
{
  "messages": [
    {
      "role": "system",
      "content": "You are an e-commerce optimization expert specializing in shopify stores."
    },
    {
      "role": "user",
      "content": "How to improve my product descriptions?"
    },
    {
      "role": "assistant",
      "content": "I'll help you optimize your product descriptions..."
    }
  ],
  "context": {
    "storeData": {...},
    "conversationCount": 5,
    "optimizationCount": 12
  }
}
```

### 3. Model Fine-tuning

Use the Grok integration to fine-tune models:

```typescript
const grok = new GrokIntegration(config, userId)

// Start fine-tuning
const jobId = await grok.fineTuneModel(trainingData, 'grok-ecommerce-optimizer-v2')

// Check status
const status = await grok.getFineTuningStatus(jobId)

// Use fine-tuned model
const response = await grok.useFineTunedModel(modelId, userMessage)
```

## 📈 Optimization Patterns

The system learns and stores optimization patterns:

```typescript
// Save a new pattern
await fineTuningService.saveOptimizationPattern({
  pattern: 'product_description_optimization',
  description: 'Improve product descriptions for better SEO and conversions',
  category: 'product_optimization',
  storeType: 'shopify',
  conditions: { hasShortDescriptions: true, productCount: '>10' },
  solution: { steps: ['expand_descriptions', 'add_keywords', 'include_benefits'] },
  successRate: 0.85
})

// Get relevant patterns
const patterns = await fineTuningService.getRelevantPatterns(
  'shopify',
  'product_optimization',
  { hasShortDescriptions: true, productCount: 15 }
)
```

## 🎛️ Dashboard Features

### Training Data Management
- View collected conversation examples
- Filter by category and store type
- Export data for external fine-tuning
- Verify and rate training examples

### Pattern Management
- View optimization patterns
- Track success rates
- Monitor usage statistics
- Add new patterns

### Fine-tuning Jobs
- Start new fine-tuning jobs
- Monitor job progress
- View completed models
- Compare model performance

## 🔄 Integration with Chat

The chat system automatically integrates with the fine-tuning system:

```typescript
// In chat API (src/pages/api/chat.ts)
if (contextManager && fineTuningService && userId) {
  // Generate context-aware response
  const contextualPrompt = contextManager.generateContextualPrompt(message)
  
  // Save conversation context
  await contextManager.addConversationContext(message, aiResponse)
  
  // Collect training data
  await fineTuningService.collectTrainingData(
    message,
    aiResponse,
    category,
    storeType,
    connection?.url
  )
}
```

## 🎯 Best Practices

### 1. Context Management
- Keep context windows manageable (last 10 conversations)
- Include relevant store data in context
- Update context after each optimization action

### 2. Training Data Quality
- Verify training examples before fine-tuning
- Include diverse conversation types
- Balance positive and negative examples

### 3. Pattern Development
- Start with high-success patterns
- Continuously update success rates
- Use specific conditions for pattern matching

### 4. Fine-tuning Strategy
- Start with small datasets
- Use appropriate hyperparameters
- Monitor model performance
- Iterate based on results

## 🔧 Configuration

### Grok API Configuration

```typescript
const grokConfig = {
  apiKey: process.env.GROK_API_KEY,
  baseUrl: process.env.GROK_BASE_URL || 'https://api.grok.ai',
  modelName: 'grok-beta'
}
```

### Context Window Settings

```typescript
// In AIContextManager
const MAX_CONVERSATIONS = 10
const MAX_OPTIMIZATIONS = 50
const CONTEXT_RETENTION_DAYS = 30
```

### Training Data Settings

```typescript
// In AIFineTuningService
const MIN_EXAMPLES_FOR_FINE_TUNING = 100
const VERIFICATION_THRESHOLD = 0.8
const MAX_TRAINING_EXAMPLES = 10000
```

## 🚀 Advanced Features

### 1. Real-time Learning
The system can learn from user feedback in real-time:

```typescript
// Update pattern success rate
await fineTuningService.updatePatternSuccessRate(patternId, success)

// Analyze conversation for patterns
const analysis = await grok.analyzeConversation(conversation)
```

### 2. Multi-store Context
Support for managing context across multiple stores:

```typescript
// Load context for specific store
await contextManager.loadContext(storeConnectionId)

// Merge contexts for cross-store insights
const crossStorePatterns = await fineTuningService.getCrossStorePatterns()
```

### 3. A/B Testing
Compare different AI responses:

```typescript
// Test different models
const baselineResponse = await grok.sendToGrok(message)
const fineTunedResponse = await grok.useFineTunedModel(modelId, message)

// Track performance
await trackResponsePerformance(baselineResponse, fineTunedResponse, userFeedback)
```

## 📊 Monitoring and Analytics

### Key Metrics to Track
- Training data collection rate
- Pattern success rates
- Fine-tuning job success rates
- User satisfaction scores
- Response quality improvements

### Dashboard Analytics
- Training examples by category
- Pattern usage statistics
- Model performance comparisons
- Context effectiveness metrics

## 🔒 Security and Privacy

### Data Protection
- All training data is stored securely
- User consent for data collection
- Anonymization of sensitive store data
- Secure API communication

### Access Control
- User-specific context isolation
- Role-based access to training data
- Audit trails for data access
- Secure fine-tuning job management

## 🎯 Future Enhancements

### Planned Features
1. **Automated Pattern Discovery**: AI-driven pattern identification
2. **Cross-platform Learning**: Learn from multiple e-commerce platforms
3. **Predictive Optimization**: Proactive optimization suggestions
4. **Advanced Context Models**: More sophisticated context understanding
5. **Real-time Fine-tuning**: Continuous model improvement

### Integration Opportunities
- **Shopify Analytics**: Integrate with Shopify's analytics data
- **Google Analytics**: Include performance metrics
- **SEO Tools**: Incorporate SEO analysis data
- **A/B Testing Platforms**: Learn from conversion data

## 📚 Resources

### Documentation
- [Grok API Documentation](https://docs.grok.ai)
- [Prisma Database Documentation](https://www.prisma.io/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

### Examples
- [Training Data Examples](./examples/training-data.json)
- [Pattern Templates](./examples/patterns.json)
- [Context Templates](./examples/context-templates.json)

---

This system provides a robust foundation for building intelligent, context-aware e-commerce optimization AI that continuously learns and improves from real user interactions.
