'use client'

import { useState, useEffect } from 'react'
import { ChatBox } from '@/components/ChatBox'
import { ChangePreview } from '@/components/ChangePreview'
import { Sidebar } from '@/components/Sidebar'
import { Navbar } from '@/components/Navbar'
import { LoginDialog } from '@/components/LoginDialog'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAppStore } from '@/lib/store'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Settings, History, Zap, LogOut, User } from 'lucide-react'

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loginDialogOpen, setLoginDialogOpen] = useState(false)
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
      <div className="min-h-screen bg-white relative overflow-hidden">
        {/* Header */}
        <Navbar onOpenLogin={() => setLoginDialogOpen(true)} />

        {/* Hero Section */}
        <main className="flex flex-col items-center justify-center px-6">
          <div className="text-center max-w-4xl mx-auto mb-8">
            {/* Subtitle */}
            <p className="text-sm font-urbanist font-light text-gray-500 uppercase tracking-wider mb-4 mt-28">
              — E-COMMERCE OPTIMIZATION —
            </p>
            
            {/* Main Headline */}
            <h1 className="text-4xl md:text-6xl font-urbanist font-normal text-gray-900 mb-6 leading-tight">
              AI-Powered Store Optimization That Actually Works
            </h1>
            
            {/* Description */}
            <p className="text-xl font-urbanist font-light text-gray-600 mb-0  max-w-2xl mx-auto leading-relaxed">
              Transform your Shopify and WordPress stores with intelligent AI that analyzes, optimizes, and drives real results.
            </p>
          </div>

                                         {/* Feature Cards Row */}
           <section className="w-full pb-16">
             <div className="max-w-full mx-auto px-6">
                                               <div className="flex justify-center gap-4">
                  {/* Smart Analysis */}
                  <div className="bg-white rounded-lg p-6 w-64">
                    <div className="text-center mb-4">
                      <svg className="w-12 h-12 text-gray-700 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="font-urbanist font-light text-gray-800 text-base text-center">Smart Analysis</h3>
                  </div>

                  {/* Auto Optimization */}
                  <div className="bg-white rounded-lg p-6 w-64">
                    <div className="text-center mb-4">
                      <svg className="w-12 h-12 text-gray-700 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="font-urbanist font-light text-gray-800 text-base text-center">Auto Optimization</h3>
                  </div>

                  {/* AI Chat Assistant */}
                  <div className="bg-white rounded-lg p-6 w-64">
                    <div className="text-center mb-4">
                      <svg className="w-12 h-12 text-gray-700 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="font-urbanist font-light text-gray-800 text-base text-center">AI Chat Assistant</h3>
                  </div>

                  {/* Store Integration */}
                  <div className="bg-white rounded-lg p-6 w-64">
                    <div className="text-center mb-4">
                      <svg className="w-12 h-12 text-gray-700 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <h3 className="font-urbanist font-light text-gray-800 text-base text-center">Store Integration</h3>
                  </div>

                  {/* Performance Tracking */}
                  <div className="bg-white rounded-lg p-6 w-64">
                    <div className="text-center mb-4">
                      <svg className="w-12 h-12 text-gray-700 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="font-urbanist font-light text-gray-800 text-base text-center">Performance Tracking</h3>
                  </div>
                </div>
            </div>
          </section>
        </main>

        {/* Main CTA */}
        <section className="text-center pb-16">
          <Button 
            size="lg" 
            className="text-lg px-8 py-4 bg-black hover:bg-gray-800 rounded-lg font-light"
            onClick={() => setLoginDialogOpen(true)}
          >
            Get Started — It's Free
          </Button>
        </section>

        {/* Platform Logos */}
        <section className="max-w-4xl mx-auto px-6 pb-16 mt-12">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-6 sm:space-y-0 sm:space-x-20">
            <div className="flex items-center">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Shopify_logo_2018.svg/2560px-Shopify_logo_2018.svg.png" 
                alt="Shopify" 
                className="h-10 w-auto opacity-60"
              />
            </div>
            <div className="flex items-center">
              <img 
                src="https://pngimg.com/d/wordpress_PNG7.png" 
                alt="WordPress" 
                className="h-10 w-auto opacity-60"
              />
            </div>
            <div className="flex items-center">
              <img 
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-IxcqV6cFW-vTpo_d4y_MF497_2ZatlJTHg&s" 
                alt="WooCommerce" 
                className="h-10 w-auto opacity-60"
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="pt-24 pb-32 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-4xl font-urbanist font-normal text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-lg font-urbanist font-light text-gray-600 max-w-2xl mx-auto">
                Get started in minutes with our simple 3-step process
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <h3 className="text-2xl font-urbanist font-normal text-gray-900 mb-4">Connect Your Store</h3>
                <p className="font-urbanist font-light text-gray-600 text-base">
                  Securely connect your Shopify, WordPress, or WooCommerce store with just a few clicks
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-urbanist font-normal text-gray-900 mb-4">AI Analysis</h3>
                <p className="font-urbanist font-light text-gray-600 text-base">
                  Our AI scans your store and identifies optimization opportunities in real-time
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-urbanist font-normal text-gray-900 mb-4">Apply Changes</h3>
                <p className="font-urbanist font-light text-gray-600 text-base">
                  Review and apply AI-suggested improvements with one-click implementation
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-24">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl md:text-4xl font-light text-gray-900 mb-2">10,000+</div>
                <div className="font-urbanist font-light text-gray-600">Stores Optimized</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-light text-gray-900 mb-2">47%</div>
                <div className="font-urbanist font-light text-gray-600">Avg. Performance Boost</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-light text-gray-900 mb-2">99.9%</div>
                <div className="font-urbanist font-light text-gray-600">Uptime</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-light text-gray-900 mb-2">4.9/5</div>
                <div className="font-urbanist font-light text-gray-600">Customer Rating</div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-urbanist font-normal text-gray-900 mb-4">
                What Our Customers Say
              </h2>
              <p className="text-lg font-urbanist font-light text-gray-600 max-w-2xl mx-auto">
                Join thousands of store owners who've transformed their business with Fix It AI
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="font-urbanist font-light text-gray-700 mb-4">
                  "Fix It AI transformed our store performance. We saw a 40% increase in conversion rates within the first month!"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                  <div>
                    <div className="font-medium text-gray-900">Sarah Johnson</div>
                    <div className="text-sm text-gray-600">Fashion Boutique Owner</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="font-urbanist font-light text-gray-700 mb-4">
                  "The AI suggestions are incredibly accurate. It's like having a team of optimization experts working 24/7."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                  <div>
                    <div className="font-medium text-gray-900">Mike Chen</div>
                    <div className="text-sm text-gray-600">Electronics Store</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="font-urbanist font-light text-gray-700 mb-4">
                  "Setup was incredibly easy. Within minutes, we had actionable insights that improved our sales immediately."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                  <div>
                    <div className="font-medium text-gray-900">Emma Rodriguez</div>
                    <div className="text-sm text-gray-600">Home & Garden</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-32">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-urbanist font-normal text-gray-900 mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-lg font-urbanist font-light text-gray-600 max-w-2xl mx-auto">
                Choose the plan that fits your business needs
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-lg border border-gray-200">
                <h3 className="text-xl font-urbanist font-normal text-gray-900 mb-4">Starter</h3>
                <div className="text-3xl font-bold text-gray-900 mb-6">Free</div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="font-urbanist font-light text-gray-700">1 Store Connection</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="font-urbanist font-light text-gray-700">Basic AI Analysis</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="font-urbanist font-light text-gray-700">5 Optimizations/month</span>
                  </li>
                </ul>
                <Button 
                  className="w-full bg-black hover:bg-gray-800"
                  onClick={() => setLoginDialogOpen(true)}
                >
                  Get Started Free
                </Button>
              </div>
              
              <div className="bg-white p-8 rounded-lg border-2 border-black relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-black text-white px-4 py-1 rounded-full text-sm">Most Popular</span>
                </div>
                <h3 className="text-xl font-urbanist font-normal text-gray-900 mb-4">Professional</h3>
                <div className="text-3xl font-bold text-gray-900 mb-6">$29<span className="text-lg text-gray-600">/month</span></div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="font-urbanist font-light text-gray-700">Up to 5 Stores</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="font-urbanist font-light text-gray-700">Advanced AI Analysis</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="font-urbanist font-light text-gray-700">Unlimited Optimizations</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="font-urbanist font-light text-gray-700">Priority Support</span>
                  </li>
                </ul>
                <Button 
                  className="w-full bg-black hover:bg-gray-800"
                  onClick={() => setLoginDialogOpen(true)}
                >
                  Start Free Trial
                </Button>
              </div>
              
              <div className="bg-white p-8 rounded-lg border border-gray-200">
                <h3 className="text-xl font-urbanist font-normal text-gray-900 mb-4">Enterprise</h3>
                <div className="text-3xl font-bold text-gray-900 mb-6">Custom</div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="font-urbanist font-light text-gray-700">Unlimited Stores</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="font-urbanist font-light text-gray-700">Custom AI Models</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="font-urbanist font-light text-gray-700">Dedicated Support</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="font-urbanist font-light text-gray-700">API Access</span>
                  </li>
                </ul>
                <Button 
                  className="w-full bg-black hover:bg-gray-800"
                  onClick={() => setLoginDialogOpen(true)}
                >
                  Contact Sales
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 bg-gray-50">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-urbanist font-normal text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg font-urbanist font-light text-gray-600 max-w-2xl mx-auto">
                Everything you need to know about Fix It AI
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="overflow-hidden">
                <button 
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors rounded-lg"
                  onClick={() => {
                    const content = document.getElementById('faq-1');
                    const icon = document.getElementById('faq-icon-1');
                    if (content && icon) {
                      content.classList.toggle('hidden');
                      icon.classList.toggle('rotate-180');
                    }
                  }}
                >
                  <h3 className="text-lg font-medium text-gray-900">How does Fix It AI work?</h3>
                  <svg id="faq-icon-1" className="w-5 h-5 text-gray-500 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div id="faq-1" className="hidden px-6 pb-4">
                  <p className="font-urbanist font-light text-gray-700">
                    Fix It AI connects to your e-commerce store and uses advanced machine learning to analyze your site's performance, identify optimization opportunities, and automatically implement improvements to boost conversions and sales.
                  </p>
                </div>
              </div>
              
              <div className="overflow-hidden">
                <button 
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors rounded-lg"
                  onClick={() => {
                    const content = document.getElementById('faq-2');
                    const icon = document.getElementById('faq-icon-2');
                    if (content && icon) {
                      content.classList.toggle('hidden');
                      icon.classList.toggle('rotate-180');
                    }
                  }}
                >
                  <h3 className="text-lg font-medium text-gray-900">Which platforms do you support?</h3>
                  <svg id="faq-icon-2" className="w-5 h-5 text-gray-500 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div id="faq-2" className="hidden px-6 pb-4">
                  <p className="font-urbanist font-light text-gray-700">
                    We currently support Shopify, WordPress with WooCommerce, and are expanding to include other major e-commerce platforms. Our AI works with any platform that has API access.
                  </p>
                </div>
              </div>
              
              <div className="overflow-hidden">
                <button 
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors rounded-lg"
                  onClick={() => {
                    const content = document.getElementById('faq-3');
                    const icon = document.getElementById('faq-icon-3');
                    if (content && icon) {
                      content.classList.toggle('hidden');
                      icon.classList.toggle('rotate-180');
                    }
                  }}
                >
                  <h3 className="text-lg font-medium text-gray-900">Is my data secure?</h3>
                  <svg id="faq-icon-3" className="w-5 h-5 text-gray-500 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div id="faq-3" className="hidden px-6 pb-4">
                  <p className="font-urbanist font-light text-gray-700">
                    Absolutely. We use enterprise-grade security measures and never store sensitive customer data. All connections are encrypted and we follow strict data protection protocols.
                  </p>
                </div>
              </div>
              
              <div className="overflow-hidden">
                <button 
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors rounded-lg"
                  onClick={() => {
                    const content = document.getElementById('faq-4');
                    const icon = document.getElementById('faq-icon-4');
                    if (content && icon) {
                      content.classList.toggle('hidden');
                      icon.classList.toggle('rotate-180');
                    }
                  }}
                >
                  <h3 className="text-lg font-medium text-gray-900">Can I cancel anytime?</h3>
                  <svg id="faq-icon-4" className="w-5 h-5 text-gray-500 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div id="faq-4" className="hidden px-6 pb-4">
                  <p className="font-urbanist font-light text-gray-700">
                    Yes, you can cancel your subscription at any time. There are no long-term contracts or hidden fees. Your store will continue to benefit from optimizations already applied.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-24">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-urbanist font-normal text-gray-900 mb-4">
              Ready to Transform Your Store?
            </h2>
            <p className="text-lg font-urbanist font-light text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of store owners who've already improved their performance with AI-powered optimization
            </p>
            <div className="flex justify-center">
              <Button 
                size="lg" 
                className="text-lg px-8 py-4 bg-black hover:bg-gray-800 rounded-lg font-light"
                onClick={() => setLoginDialogOpen(true)}
              >
                Get Started
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200 py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
              {/* Company Info */}
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <span className="text-lg font-urbanist font-light text-gray-900">Fix It AI</span>
                </div>
                <p className="font-urbanist font-light text-gray-600 mb-4 max-w-md">
                  AI-powered e-commerce optimization that transforms your store performance with intelligent analysis and automated improvements.
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Product Links */}
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Product</h3>
                <ul className="space-y-3">
                  <li><a href="#" className="font-urbanist font-light text-gray-600 hover:text-gray-900 transition-colors">Features</a></li>
                  <li><a href="#" className="font-urbanist font-light text-gray-600 hover:text-gray-900 transition-colors">Pricing</a></li>
                  <li><a href="#" className="font-urbanist font-light text-gray-600 hover:text-gray-900 transition-colors">Integrations</a></li>
                  <li><a href="#" className="font-urbanist font-light text-gray-600 hover:text-gray-900 transition-colors">API</a></li>
                  <li><a href="#" className="font-urbanist font-light text-gray-600 hover:text-gray-900 transition-colors">Changelog</a></li>
                </ul>
              </div>

              {/* Support Links */}
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Support</h3>
                <ul className="space-y-3">
                  <li><a href="#" className="font-urbanist font-light text-gray-600 hover:text-gray-900 transition-colors">Help Center</a></li>
                  <li><a href="#" className="font-urbanist font-light text-gray-600 hover:text-gray-900 transition-colors">Documentation</a></li>
                  <li><a href="#" className="font-urbanist font-light text-gray-600 hover:text-gray-900 transition-colors">Contact Us</a></li>
                  <li><a href="#" className="font-urbanist font-light text-gray-600 hover:text-gray-900 transition-colors">Status</a></li>
                  <li><a href="#" className="font-urbanist font-light text-gray-600 hover:text-gray-900 transition-colors">Community</a></li>
                </ul>
              </div>
            </div>

            {/* Partner Logos */}
            <div className="border-t border-gray-200 pt-8">
              <div className="flex flex-col items-center">
                <p className="font-urbanist font-light text-gray-600 mb-6">Trusted by leading e-commerce platforms</p>
                <div className="flex flex-wrap justify-center items-center space-x-16 md:space-x-24">
                  <div className="flex items-center">
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Shopify_logo_2018.svg/2560px-Shopify_logo_2018.svg.png" 
                      alt="Shopify" 
                      className="h-8 w-auto opacity-60"
                    />
                  </div>
                  <div className="flex items-center">
                    <img 
                      src="https://pngimg.com/d/wordpress_PNG7.png" 
                      alt="WordPress" 
                      className="h-8 w-auto opacity-60"
                    />
                  </div>
                  <div className="flex items-center">
                    <img 
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-IxcqV6cFW-vTpo_d4y_MF497_2ZatlJTHg&s" 
                      alt="WooCommerce" 
                      className="h-8 w-auto opacity-60"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Footer */}
            <div className="border-t border-gray-200 pt-8 mt-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center space-x-6 mb-4 md:mb-0">
                  <span className="font-urbanist font-light text-gray-600">© 2024 Fix It AI. All rights reserved.</span>
                  <a href="#" className="font-urbanist font-light text-gray-600 hover:text-gray-900 transition-colors">Privacy Policy</a>
                  <a href="#" className="font-urbanist font-light text-gray-600 hover:text-gray-900 transition-colors">Terms of Service</a>
                  <a href="#" className="font-urbanist font-light text-gray-600 hover:text-gray-900 transition-colors">Cookie Policy</a>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-urbanist font-light text-gray-600">Made with</span>
                  <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  <span className="font-urbanist font-light text-gray-600">for e-commerce</span>
                </div>
              </div>
            </div>
          </div>
        </footer>

        {/* Login Dialog */}
        <LoginDialog 
          isOpen={loginDialogOpen} 
          onClose={() => setLoginDialogOpen(false)} 
        />
      </div>
    )
  }

  // Show main app for authenticated users
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden hover:bg-gray-100"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span className="font-urbanist font-light">{user?.email}</span>
              </div>
              <Button variant="ghost" size="sm" asChild className="hover:bg-gray-100">
                <a href="/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </a>
              </Button>
              <Button variant="ghost" size="sm" asChild className="hover:bg-gray-100">
                <a href="/logs">
                  <History className="h-4 w-4 mr-2" />
                  Logs
                </a>
              </Button>
              <Button variant="ghost" size="sm" onClick={signOut} className="hover:bg-gray-100">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            <ChatBox />
          </div>
          
          {/* Preview Panel */}
          {currentPreview && (
            <div className="w-96 border-l border-gray-200 bg-white">
              <ChangePreview preview={currentPreview} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
