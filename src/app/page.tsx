'use client'

import { useState, useEffect } from 'react'
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

  // Autoplay slider functionality
  useEffect(() => {
    if (!user) { // Only for landing page
      const slider = document.getElementById('feature-slider');
      const track = document.getElementById('slider-track');
      
      if (slider && track) {
        const cards = track.children;
        const cardWidth = 320; // w-80 = 320px
        const gap = 24; // gap-6 = 24px
        const totalWidth = cardWidth + gap;
        let currentIndex = 0;
        
        // Center the slider initially
        const centerOffset = (slider.offsetWidth - cardWidth) / 2;
        track.style.transform = `translateX(${centerOffset}px)`;
        
        const nextSlide = () => {
          currentIndex = (currentIndex + 1) % cards.length;
          const translateX = centerOffset - (currentIndex * totalWidth);
          if (track) {
            track.style.transform = `translateX(${translateX}px)`;
          }
        };
        
        // Autoplay every 3 seconds
        const interval = setInterval(nextSlide, 3000);
        
        return () => clearInterval(interval);
      }
    }
  }, [user]);

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
            <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span className="text-lg font-urbanist font-light text-gray-900">/ hello@fixit.ai</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
            <a href="#support" className="text-gray-600 hover:text-gray-900">Support</a>
          </nav>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" asChild className="border-black text-black hover:bg-black hover:text-white">
              <a href="/login">Book Demo</a>
            </Button>
            <Button asChild className="bg-black hover:bg-gray-800">
              <a href="/login">Get Started</a>
            </Button>
            <button className="md:hidden">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex flex-col items-center justify-center px-6">
          <div className="text-center max-w-4xl mb-8">
            {/* Subtitle */}
            <p className="text-sm font-urbanist font-light text-gray-500 uppercase tracking-wider mb-4 mt-28">
              — E-COMMERCE OPTIMIZATION —
            </p>
            
            {/* Main Headline */}
            <h1 className="text-4xl md:text-6xl font-urbanist font-light text-gray-900 mb-6 leading-tight">
              AI-Powered Store Optimization That Actually Works
            </h1>
            
            {/* Description */}
            <p className="text-xl font-urbanist font-light text-gray-600 mb-0  max-w-2xl mx-auto leading-relaxed">
              Transform your Shopify and WordPress stores with intelligent AI that analyzes, optimizes, and drives real results.
            </p>
          </div>

                    {/* Feature Cards Slider */}
          <section className="w-full pb-16">
            <div className="relative">
              {/* Slider Container */}
              <div className="flex overflow-hidden gap-6 snap-x snap-mandatory transition-transform duration-1000 ease-in-out" id="feature-slider">
                <div className="flex gap-6 transition-transform duration-1000 ease-in-out" id="slider-track">
                {/* Smart Analysis */}
                <div className="flex-shrink-0 w-80 bg-white border border-gray-200 rounded-lg p-8 snap-start blur-sm hover:blur-none">
                  <div className="text-center mb-6">
                    <svg className="w-12 h-12 text-gray-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="font-urbanist font-light text-gray-800 text-lg text-center">Smart Analysis</h3>
                </div>

                {/* Auto Optimization */}
                <div className="flex-shrink-0 w-80 bg-white border border-gray-200 rounded-lg p-8 snap-start blur-sm hover:blur-none">
                  <div className="text-center mb-6">
                    <svg className="w-12 h-12 text-gray-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="font-urbanist font-light text-gray-800 text-lg text-center">Auto Optimization</h3>
                </div>

                {/* AI Chat Assistant - Highlighted */}
                <div className="flex-shrink-0 w-80 bg-white border border-gray-300 rounded-lg p-8 snap-start">
                  <div className="text-center mb-6">
                    <svg className="w-12 h-12 text-gray-800 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="font-urbanist font-light text-gray-900 text-lg text-center">AI Chat Assistant</h3>
                </div>

                {/* Store Integration */}
                <div className="flex-shrink-0 w-80 bg-white border border-gray-200 rounded-lg p-8 snap-start blur-sm hover:blur-none">
                  <div className="text-center mb-6">
                    <svg className="w-12 h-12 text-gray-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="font-urbanist font-light text-gray-800 text-lg text-center">Store Integration</h3>
                </div>

                {/* Performance Tracking */}
                <div className="flex-shrink-0 w-80 bg-white border border-gray-200 rounded-lg p-8 snap-start blur-sm hover:blur-none">
                  <div className="text-center mb-6">
                    <svg className="w-12 h-12 text-gray-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="font-urbanist font-light text-gray-800 text-lg text-center">Performance Tracking</h3>
                </div>

                {/* Duplicate cards for infinite loop effect */}
                {/* Smart Analysis - Duplicate */}
                <div className="flex-shrink-0 w-80 bg-white border border-gray-200 rounded-lg p-8 snap-start blur-sm hover:blur-none">
                  <div className="text-center mb-6">
                    <svg className="w-12 h-12 text-gray-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="font-urbanist font-light text-gray-800 text-lg text-center">Smart Analysis</h3>
                </div>

                {/* Auto Optimization - Duplicate */}
                <div className="flex-shrink-0 w-80 bg-white border border-gray-200 rounded-lg p-8 snap-start blur-sm hover:blur-none">
                  <div className="text-center mb-6">
                    <svg className="w-12 h-12 text-gray-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="font-urbanist font-light text-gray-800 text-lg text-center">Auto Optimization</h3>
                </div>
                </div>
              </div>

              {/* Scroll Indicators */}
              <div className="flex justify-center mt-8 space-x-2">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          </section>
        </main>

        {/* Main CTA */}
        <section className="text-center pb-16">
          <Button asChild size="lg" className="text-lg px-8 py-4 bg-black hover:bg-gray-800 rounded-xl">
            <a href="/login">Get Started — It's Free</a>
          </Button>
        </section>

        {/* Benefits */}
        <section className="max-w-4xl mx-auto px-6 pb-16">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-12">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="font-urbanist font-light text-gray-700">Free Signup</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="font-urbanist font-light text-gray-700">No Credit Card Required</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="font-urbanist font-light text-gray-700">Cancel Anytime</span>
            </div>
          </div>
        </section>

        {/* Partner Logos */}
        <footer className="border-t border-gray-200 py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-wrap justify-center items-center space-x-8 md:space-x-12">
              <div className="text-lg font-urbanist font-light text-gray-400">Shopify</div>
              <div className="text-lg font-urbanist font-light text-gray-400">WordPress</div>
              <div className="text-lg font-urbanist font-light text-gray-400">WooCommerce</div>
              <div className="text-lg font-urbanist font-light text-gray-400">Magento</div>
              <div className="text-lg font-urbanist font-light text-gray-400">BigCommerce</div>
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
