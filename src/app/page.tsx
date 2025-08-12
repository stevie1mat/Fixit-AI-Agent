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
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="flex items-center justify-between p-6 max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span className="text-xl font-display font-bold text-gray-900">/hello@fixit.ai</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <div className="flex items-center space-x-1">
              <a href="#products" className="text-gray-600 hover:text-gray-900">Products</a>
              <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <a href="#stories" className="text-gray-600 hover:text-gray-900">Customer Stories</a>
            <a href="#resources" className="text-gray-600 hover:text-gray-900">Resources</a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
          </nav>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" asChild className="border-black text-black hover:bg-black hover:text-white">
              <a href="/login">Book A Demo</a>
            </Button>
            <Button asChild className="bg-black hover:bg-gray-800">
              <a href="/login">Get Started</a>
            </Button>
          </div>
        </header>

        {/* Hero Section with Floating Widgets */}
        <main className="flex flex-col items-center justify-center min-h-[80vh] px-6 relative">
          {/* Floating UI Elements Around Heading */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Video Player Mockup - Top Left */}
            <div className="absolute top-10 left-10 transform -rotate-6 bg-blue-100 rounded-2xl p-4 shadow-lg hover:rotate-0 transition-transform duration-300">
              <div className="bg-blue-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-800">2:01</span>
                  <div className="w-6 h-6 bg-blue-300 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  </div>
                </div>
                <div className="text-xs text-blue-700 opacity-70">Olivanna</div>
              </div>
            </div>

            {/* Engagement Metric Card - Top Right */}
            <div className="absolute top-10 right-10 transform rotate-6 bg-yellow-100 rounded-2xl p-4 shadow-lg hover:rotate-0 transition-transform duration-300">
              <div className="flex items-center space-x-2 mb-3">
                <svg className="w-5 h-5 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="font-semibold text-yellow-800">Engagement 40%</span>
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </div>
              <div className="bg-purple-100 rounded-lg p-2 flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>

            {/* Smartphone Mockup - Bottom Left */}
            <div className="absolute bottom-10 left-10 transform -rotate-3 bg-black rounded-3xl p-2 shadow-2xl hover:rotate-0 transition-transform duration-300">
              <div className="bg-white rounded-2xl p-3 h-48 w-32 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                    <span className="text-xs font-medium">Wade Warren</span>
                  </div>
                  <div className="flex items-center space-x-1 bg-red-500 text-white px-1 py-0.5 rounded-full">
                    <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
                    <span className="text-xs">Live</span>
                  </div>
                </div>
                <div className="flex-1 bg-gradient-to-br from-orange-200 to-red-200 rounded-lg flex items-center justify-center">
                  <div className="w-12 h-12 bg-orange-300 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Sales/Inventory Card - Bottom Right */}
            <div className="absolute bottom-10 right-10 transform rotate-3 bg-green-100 rounded-2xl p-4 shadow-lg hover:rotate-0 transition-transform duration-300">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-semibold text-green-800">8 items Sold this week</div>
                  <div className="text-lg font-bold text-green-900">$12</div>
                </div>
                <div className="w-10 h-10 bg-green-200 rounded-lg flex items-center justify-center">
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">AG</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media Post Mockup - Center Right */}
            <div className="absolute right-20 top-1/2 transform -translate-y-1/2 rotate-2 bg-white rounded-2xl p-4 shadow-lg border border-gray-200 hover:rotate-0 transition-transform duration-300">
              <div className="bg-green-200 rounded-lg h-20 mb-3 flex items-center justify-center">
                <div className="w-10 h-10 bg-green-300 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">1.5k</span>
                </div>
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                  </svg>
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Central Content */}
          <div className="text-center max-w-3xl z-10 relative">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-6 leading-tight">
              AI-Driven Store Optimization Right Away
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              From concept to conversion — manage thousands of successful e-commerce stores seamlessly.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button asChild size="lg" className="text-lg px-8 py-4 bg-black hover:bg-gray-800">
                <a href="/login">Download Free App</a>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8 py-4 border-black text-black hover:bg-black hover:text-white">
                <a href="/login">Get Started Free</a>
              </Button>
            </div>
          </div>
        </main>

        {/* Partner Logos */}
        <footer className="border-t border-gray-200 py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-8">
              <p className="text-sm text-gray-500 mb-4">Trusted by leading e-commerce brands</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-8 items-center">
              {[
                'HEIRESS BEVERLY HILLS',
                'TOZO',
                'HELL BABES',
                'cocokind',
                'Oxyfresh',
                'DOT & KEY SKINCARE',
                'Skybags MOVE IN STYLE',
                'Bellefit -EST 2008-',
                'AMAZING LACE'
              ].map((brand, index) => (
                <div key={index} className="text-center">
                  <div className="text-xs font-semibold text-gray-400 tracking-wider">
                    {brand}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </footer>
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
