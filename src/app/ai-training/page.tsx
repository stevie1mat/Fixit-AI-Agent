'use client'

import { AITrainingDashboard } from '@/components/AITrainingDashboard'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export default function AITrainingPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AITrainingDashboard />
        </div>
      </div>
    </ProtectedRoute>
  )
}
