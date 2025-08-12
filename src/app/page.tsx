'use client'

import { useState } from 'react'
import { ChatBox } from '@/components/ChatBox'
import { ChangePreview } from '@/components/ChangePreview'
import { Sidebar } from '@/components/Sidebar'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAppStore } from '@/lib/store'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Settings, History, Zap, LogOut, User } from 'lucide-react'

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { currentPreview, connections } = useAppStore()
  const { user, signOut, loading } = useAuth()

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show landing page for unauthenticated users
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle, #cbd5e1 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
          }}></div>
        </div>

        {/* Header */}
        <header className="relative z-10 flex items-center justify-between p-6 max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <span className="text-xl font-bold text-gray-900">Fix It AI</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
            <a href="#solutions" className="text-gray-600 hover:text-gray-900">Solutions</a>
            <a href="#resources" className="text-gray-600 hover:text-gray-900">Resources</a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
          </nav>
          
          <div className="flex items-center space-x-4">
            <a href="/login" className="text-gray-600 hover:text-gray-900">Sign in</a>
            <Button asChild>
              <a href="/login">Get demo</a>
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-6">
          {/* App Icon */}
          <div className="w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-8">
            <div className="grid grid-cols-2 gap-2 w-16 h-16">
              <div className="bg-blue-500 rounded-lg"></div>
              <div className="bg-gray-800 rounded-lg"></div>
              <div className="bg-gray-800 rounded-lg"></div>
              <div className="bg-gray-800 rounded-lg"></div>
            </div>
          </div>

          {/* Headlines */}
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 text-center mb-4">
            Fix, optimize, and grow
          </h1>
          <p className="text-2xl md:text-3xl text-gray-600 text-center mb-6">
            your e-commerce business
          </p>
          <p className="text-lg text-gray-700 text-center mb-12 max-w-2xl">
            AI-powered assistant that helps you fix issues in Shopify and WordPress stores, optimize performance, and boost sales.
          </p>

          {/* Main CTA */}
          <Button asChild size="lg" className="text-lg px-8 py-4">
            <a href="/login">Get free demo</a>
          </Button>

          {/* Floating Feature Cards */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Top-left Card - Store Management */}
            <div className="absolute top-20 left-10 transform -rotate-6 bg-white rounded-lg shadow-lg p-4 w-64">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Store Management</h3>
                  <p className="text-sm text-gray-600">Connect and manage multiple Shopify and WordPress stores from one dashboard.</p>
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-sm"></div>
              </div>
            </div>

            {/* Top-right Card - AI Analysis */}
            <div className="absolute top-32 right-10 transform rotate-6 bg-white rounded-lg shadow-lg p-4 w-64">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded-sm"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">AI Analysis</h3>
                  <p className="text-sm text-gray-600">Get intelligent insights and automated fixes for your store issues.</p>
                </div>
              </div>
              <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-sm"></div>
              </div>
            </div>

            {/* Bottom-left Card - Performance Tracking */}
            <div className="absolute bottom-32 left-10 transform -rotate-3 bg-white rounded-lg shadow-lg p-4 w-64">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded-sm"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Performance Tracking</h3>
                  <p className="text-sm text-gray-600">Monitor store performance and track improvements over time.</p>
                </div>
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-sm"></div>
              </div>
            </div>

            {/* Bottom-right Card - Integrations */}
            <div className="absolute bottom-20 right-10 transform rotate-3 bg-white rounded-lg shadow-lg p-4 w-64">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded-sm"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Platform Integrations</h3>
                  <p className="text-sm text-gray-600">Seamlessly integrate with Shopify, WordPress, and popular e-commerce tools.</p>
                </div>
              </div>
              <div className="absolute -top-2 -left-2 w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-sm"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Show main app for authenticated users
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
              >
                <Settings className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Fix It AI</h1>
                <p className="text-sm text-muted-foreground">
                  AI-powered e-commerce assistant
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{user?.email}</span>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <a href="/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </a>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a href="/logs">
                  <History className="h-4 w-4 mr-2" />
                  Logs
                </a>
              </Button>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        {/* Connection Status */}
        {connections.length > 0 && (
          <div className="border-b bg-muted/50">
            <div className="p-4">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">
                  Connected to {connections.length} store{connections.length > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            <ChatBox />
          </div>
          
          {/* Preview Panel */}
          {currentPreview && (
            <div className="w-96 border-l bg-card">
              <ChangePreview preview={currentPreview} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
