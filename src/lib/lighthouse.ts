import axios from 'axios'

export interface LighthouseResult {
  performance: number
  accessibility: number
  bestPractices: number
  seo: number
  pwa: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  firstInputDelay: number
  cumulativeLayoutShift: number
  totalBlockingTime: number
  speedIndex: number
}

export interface LighthouseAudit {
  id: string
  url: string
  result: LighthouseResult
  timestamp: Date
  status: 'pending' | 'running' | 'completed' | 'failed'
  error?: string
}

export class LighthouseAPI {
  private apiUrl: string

  constructor(apiUrl: string = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed') {
    this.apiUrl = apiUrl
  }

  async runAudit(url: string, apiKey?: string): Promise<LighthouseResult> {
    try {
      const params: any = {
        url,
        strategy: 'mobile',
        category: ['performance', 'accessibility', 'best-practices', 'seo'],
      }

      if (apiKey) {
        params.key = apiKey
      }

      const response = await axios.get(this.apiUrl, { params })
      const data = response.data

      return {
        performance: Math.round(data.lighthouseResult.categories.performance.score * 100),
        accessibility: Math.round(data.lighthouseResult.categories.accessibility.score * 100),
        bestPractices: Math.round(data.lighthouseResult.categories['best-practices'].score * 100),
        seo: Math.round(data.lighthouseResult.categories.seo.score * 100),
        pwa: Math.round(data.lighthouseResult.categories.pwa.score * 100),
        firstContentfulPaint: data.lighthouseResult.audits['first-contentful-paint'].numericValue,
        largestContentfulPaint: data.lighthouseResult.audits['largest-contentful-paint'].numericValue,
        firstInputDelay: data.lighthouseResult.audits['max-potential-fid'].numericValue,
        cumulativeLayoutShift: data.lighthouseResult.audits['cumulative-layout-shift'].numericValue,
        totalBlockingTime: data.lighthouseResult.audits['total-blocking-time'].numericValue,
        speedIndex: data.lighthouseResult.audits['speed-index'].numericValue,
      }
    } catch (error) {
      console.error('Error running Lighthouse audit:', error)
      throw error
    }
  }

  async runDesktopAudit(url: string, apiKey?: string): Promise<LighthouseResult> {
    try {
      const params: any = {
        url,
        strategy: 'desktop',
        category: ['performance', 'accessibility', 'best-practices', 'seo'],
      }

      if (apiKey) {
        params.key = apiKey
      }

      const response = await axios.get(this.apiUrl, { params })
      const data = response.data

      return {
        performance: Math.round(data.lighthouseResult.categories.performance.score * 100),
        accessibility: Math.round(data.lighthouseResult.categories.accessibility.score * 100),
        bestPractices: Math.round(data.lighthouseResult.categories['best-practices'].score * 100),
        seo: Math.round(data.lighthouseResult.categories.seo.score * 100),
        pwa: Math.round(data.lighthouseResult.categories.pwa.score * 100),
        firstContentfulPaint: data.lighthouseResult.audits['first-contentful-paint'].numericValue,
        largestContentfulPaint: data.lighthouseResult.audits['largest-contentful-paint'].numericValue,
        firstInputDelay: data.lighthouseResult.audits['max-potential-fid'].numericValue,
        cumulativeLayoutShift: data.lighthouseResult.audits['cumulative-layout-shift'].numericValue,
        totalBlockingTime: data.lighthouseResult.audits['total-blocking-time'].numericValue,
        speedIndex: data.lighthouseResult.audits['speed-index'].numericValue,
      }
    } catch (error) {
      console.error('Error running Lighthouse desktop audit:', error)
      throw error
    }
  }

  getPerformanceScore(result: LighthouseResult): string {
    if (result.performance >= 90) return 'Excellent'
    if (result.performance >= 70) return 'Good'
    if (result.performance >= 50) return 'Needs Improvement'
    return 'Poor'
  }

  getAccessibilityScore(result: LighthouseResult): string {
    if (result.accessibility >= 90) return 'Excellent'
    if (result.accessibility >= 70) return 'Good'
    if (result.accessibility >= 50) return 'Needs Improvement'
    return 'Poor'
  }

  getBestPracticesScore(result: LighthouseResult): string {
    if (result.bestPractices >= 90) return 'Excellent'
    if (result.bestPractices >= 70) return 'Good'
    if (result.bestPractices >= 50) return 'Needs Improvement'
    return 'Poor'
  }

  getSEOScore(result: LighthouseResult): string {
    if (result.seo >= 90) return 'Excellent'
    if (result.seo >= 70) return 'Good'
    if (result.seo >= 50) return 'Needs Improvement'
    return 'Poor'
  }

  formatMetric(value: number, unit: string = 'ms'): string {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(2)}s`
    }
    return `${Math.round(value)}${unit}`
  }

  generateRecommendations(result: LighthouseResult): string[] {
    const recommendations: string[] = []

    if (result.performance < 90) {
      recommendations.push('Optimize images and use WebP format')
      recommendations.push('Minimize render-blocking resources')
      recommendations.push('Enable text compression')
    }

    if (result.accessibility < 90) {
      recommendations.push('Add alt text to images')
      recommendations.push('Ensure proper heading structure')
      recommendations.push('Improve color contrast')
    }

    if (result.bestPractices < 90) {
      recommendations.push('Use HTTPS')
      recommendations.push('Avoid deprecated APIs')
      recommendations.push('Implement proper error handling')
    }

    if (result.seo < 90) {
      recommendations.push('Add meta descriptions')
      recommendations.push('Optimize title tags')
      recommendations.push('Improve internal linking')
    }

    return recommendations
  }
}
