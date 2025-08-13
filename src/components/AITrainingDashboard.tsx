'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { 
  Brain, 
  Database, 
  TrendingUp, 
  Settings, 
  Download, 
  Upload,
  Activity,
  Target,
  Zap
} from 'lucide-react'

interface TrainingData {
  id: string
  input: string
  output: string
  category: string
  storeType: string
  createdAt: string
  isVerified: boolean
  rating?: number
}

interface OptimizationPattern {
  id: string
  pattern: string
  description: string
  category: string
  storeType: string
  successRate: number
  usageCount: number
}

interface FineTuningJob {
  id: string
  status: string
  model: string
  createdAt: string
  finishedAt?: string
  trainingFile: string
  trainedTokens: number
}

export function AITrainingDashboard() {
  const { user } = useAuth()
  const [trainingData, setTrainingData] = useState<TrainingData[]>([])
  const [patterns, setPatterns] = useState<OptimizationPattern[]>([])
  const [fineTuningJobs, setFineTuningJobs] = useState<FineTuningJob[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStoreType, setSelectedStoreType] = useState<string>('all')

  useEffect(() => {
    if (user?.id) {
      loadDashboardData()
    }
  }, [user?.id])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load training data
      const trainingResponse = await fetch(`/api/ai-training?userId=${user?.id}&type=training-data`)
      if (trainingResponse.ok) {
        const { trainingData } = await trainingResponse.json()
        setTrainingData(trainingData)
      }

      // Load patterns
      const patternsResponse = await fetch(`/api/ai-training?userId=${user?.id}&type=patterns`)
      if (patternsResponse.ok) {
        const { patterns } = await patternsResponse.json()
        setPatterns(patterns)
      }

      // Load fine-tuning jobs (mock data for now)
      setFineTuningJobs([
        {
          id: 'ft-1',
          status: 'succeeded',
          model: 'grok-ecommerce-optimizer-v1',
          createdAt: '2024-01-15T10:00:00Z',
          finishedAt: '2024-01-15T12:00:00Z',
          trainingFile: 'training_data_001.jsonl',
          trainedTokens: 1500000
        }
      ])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportTrainingData = async () => {
    try {
      const response = await fetch(`/api/ai-training?userId=${user?.id}&type=export`)
      if (response.ok) {
        const { exportData } = await response.json()
        
        // Download the data
        const blob = new Blob([exportData], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'ai-training-data.json'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error exporting training data:', error)
    }
  }

  const startFineTuning = async () => {
    try {
      const response = await fetch('/api/ai-training', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          action: 'start-fine-tuning',
          data: {
            modelName: 'grok-ecommerce-optimizer-v2',
            trainingData: trainingData.filter(d => d.isVerified)
          }
        })
      })

      if (response.ok) {
        await loadDashboardData()
      }
    } catch (error) {
      console.error('Error starting fine-tuning:', error)
    }
  }

  const filteredTrainingData = trainingData.filter(data => {
    if (selectedCategory !== 'all' && data.category !== selectedCategory) return false
    if (selectedStoreType !== 'all' && data.storeType !== selectedStoreType) return false
    return true
  })

  const filteredPatterns = patterns.filter(pattern => {
    if (selectedCategory !== 'all' && pattern.category !== selectedCategory) return false
    if (selectedStoreType !== 'all' && pattern.storeType !== selectedStoreType) return false
    return true
  })

  const stats = {
    totalExamples: trainingData.length,
    verifiedExamples: trainingData.filter(d => d.isVerified).length,
    totalPatterns: patterns.length,
    highSuccessPatterns: patterns.filter(p => p.successRate >= 0.8).length,
    activeJobs: fineTuningJobs.filter(j => j.status === 'running').length,
    completedJobs: fineTuningJobs.filter(j => j.status === 'succeeded').length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Training Dashboard</h1>
          <p className="text-gray-600">Monitor and manage your AI fine-tuning progress</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={exportTrainingData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button onClick={startFineTuning}>
            <Brain className="h-4 w-4 mr-2" />
            Start Fine-tuning
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Training Examples</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalExamples}</div>
            <p className="text-xs text-muted-foreground">
              {stats.verifiedExamples} verified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Optimization Patterns</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPatterns}</div>
            <p className="text-xs text-muted-foreground">
              {stats.highSuccessPatterns} high success
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fine-tuning Jobs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeJobs}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedJobs} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {patterns.length > 0 
                ? Math.round(patterns.reduce((acc, p) => acc + p.successRate, 0) / patterns.length * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average pattern success
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="all">All Categories</option>
          <option value="product_optimization">Product Optimization</option>
          <option value="seo_optimization">SEO Optimization</option>
          <option value="performance">Performance</option>
          <option value="theme_optimization">Theme Optimization</option>
        </select>

        <select
          value={selectedStoreType}
          onChange={(e) => setSelectedStoreType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="all">All Store Types</option>
          <option value="shopify">Shopify</option>
          <option value="wordpress">WordPress</option>
        </select>
      </div>

      {/* Training Data */}
      <Card>
        <CardHeader>
          <CardTitle>Training Examples</CardTitle>
          <CardDescription>
            Collected conversation data for AI fine-tuning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTrainingData.slice(0, 5).map((data) => (
              <div key={data.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{data.input}</p>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{data.output}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="outline">{data.category}</Badge>
                      <Badge variant="outline">{data.storeType}</Badge>
                      {data.isVerified && (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(data.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Optimization Patterns */}
      <Card>
        <CardHeader>
          <CardTitle>Optimization Patterns</CardTitle>
          <CardDescription>
            Reusable optimization strategies with success rates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPatterns.slice(0, 5).map((pattern) => (
              <div key={pattern.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{pattern.pattern}</h4>
                    <p className="text-sm text-gray-600 mt-1">{pattern.description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="outline">{pattern.category}</Badge>
                      <Badge variant="outline">{pattern.storeType}</Badge>
                      <div className="flex items-center space-x-1">
                        <Zap className="h-3 w-3 text-yellow-500" />
                        <span className="text-xs font-medium">
                          {Math.round(pattern.successRate * 100)}% success
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Used {pattern.usageCount} times
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fine-tuning Jobs */}
      <Card>
        <CardHeader>
          <CardTitle>Fine-tuning Jobs</CardTitle>
          <CardDescription>
            Track the progress of your AI model fine-tuning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {fineTuningJobs.map((job) => (
              <div key={job.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{job.model}</h4>
                    <p className="text-sm text-gray-600">
                      {job.trainedTokens.toLocaleString()} tokens trained
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={job.status === 'succeeded' ? 'default' : 'secondary'}
                      className={job.status === 'succeeded' ? 'bg-green-100 text-green-800' : ''}
                    >
                      {job.status}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
