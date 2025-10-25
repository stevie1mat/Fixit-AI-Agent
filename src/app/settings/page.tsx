'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Store, Settings, ArrowLeft, Check, X, Edit, Trash2, Globe, Link } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { validateShopifyUrl, validateWordPressUrl } from '@/lib/utils'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'shopify' | 'wordpress' | 'connected'>('shopify')
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)
  const [editingConnection, setEditingConnection] = useState<string | null>(null)
  const { addConnection, connections, removeConnection } = useAppStore()

  // Shopify form state
  const [shopifyForm, setShopifyForm] = useState({
    storeUrl: '',
    accessToken: '',
  })

  // WordPress form state
  const [wordpressForm, setWordpressForm] = useState({
    baseUrl: '',
    username: '',
    appPassword: '',
  })

  // Load existing connections on component mount
  useEffect(() => {
    // This will automatically load connections from the store via Zustand persist
  }, [])

  // Get WordPress connections
  const wordpressConnections = connections.filter(conn => conn.type === 'wordpress')
  const shopifyConnections = connections.filter(conn => conn.type === 'shopify')

  // Handle editing a connection
  const handleEditConnection = (connection: any) => {
    if (connection.type === 'wordpress') {
      setWordpressForm({
        baseUrl: connection.url,
        username: '', // We don't store username in the connection
        appPassword: '', // We don't store password for security
      })
      setEditingConnection(connection.id)
      setActiveTab('wordpress')
    } else if (connection.type === 'shopify') {
      setShopifyForm({
        storeUrl: connection.url,
        accessToken: '', // We don't store access token for security
      })
      setEditingConnection(connection.id)
      setActiveTab('shopify')
    }
  }

  // Handle deleting a connection
  const handleDeleteConnection = (connectionId: string) => {
    if (confirm('Are you sure you want to delete this connection?')) {
      removeConnection(connectionId)
    }
  }

  const handleShopifySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateShopifyUrl(shopifyForm.storeUrl)) {
      alert('Please enter a valid Shopify store URL')
      return
    }

    setIsTesting(true)
    setTestResult(null)

    try {
      const response = await fetch('/api/shopify/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shopifyForm),
      })

      if (response.ok) {
        setTestResult('success')
        
        // If editing an existing connection, remove it first
        if (editingConnection) {
          removeConnection(editingConnection)
        }
        
        addConnection({
          type: 'shopify',
          url: shopifyForm.storeUrl,
          accessToken: shopifyForm.accessToken,
          isConnected: true,
        })
        setShopifyForm({ storeUrl: '', accessToken: '' })
        setEditingConnection(null)
      } else {
        setTestResult('error')
      }
    } catch (error) {
      setTestResult('error')
    } finally {
      setIsTesting(false)
    }
  }

  const handleWordPressSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateWordPressUrl(wordpressForm.baseUrl)) {
      alert('Please enter a valid WordPress URL')
      return
    }

    setIsTesting(true)
    setTestResult(null)

    try {
      const response = await fetch('/api/wordpress/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(wordpressForm),
      })

      if (response.ok) {
        setTestResult('success')
        
        // If editing an existing connection, remove it first
        if (editingConnection) {
          removeConnection(editingConnection)
        }
        
        addConnection({
          type: 'wordpress',
          url: wordpressForm.baseUrl,
          accessToken: wordpressForm.appPassword,
          isConnected: true,
        })
        setWordpressForm({ baseUrl: '', username: '', appPassword: '' })
        setEditingConnection(null)
      } else {
        setTestResult('error')
      }
    } catch (error) {
      setTestResult('error')
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="flex items-center justify-between px-8 py-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild className="text-slate-600 hover:text-indigo-600 transition-colors">
              <a href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </a>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                AI Settings
              </h1>
              <p className="text-sm text-gray-600 font-medium">
                Connect your stores and configure AI-powered automation
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Tabs */}
        <div className="flex space-x-3 bg-white p-3 rounded-lg shadow-sm border border-gray-100 mb-6">
            <button
              onClick={() => setActiveTab('shopify')}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-xs font-semibold transition-all duration-300 ${
                activeTab === 'shopify'
                  ? 'bg-gray-800 text-white shadow-lg shadow-gray-500/30 transform scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:scale-105'
              }`}
            >
              <Store className="h-5 w-5" />
              <span>Shopify AI</span>
            </button>
          <button
            onClick={() => setActiveTab('wordpress')}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-xs font-semibold transition-all duration-300 ${
              activeTab === 'wordpress'
                ? 'bg-gray-800 text-white shadow-lg shadow-gray-500/30 transform scale-105'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:scale-105'
            }`}
          >
            <Settings className="h-5 w-5" />
            <span>WordPress AI</span>
          </button>
          <button
            onClick={() => setActiveTab('connected')}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-xs font-semibold transition-all duration-300 ${
              activeTab === 'connected'
                ? 'bg-gray-800 text-white shadow-lg shadow-gray-500/30 transform scale-105'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:scale-105'
            }`}
          >
            <Link className="h-5 w-5" />
            <span>AI Connections</span>
          </button>
        </div>

        {/* Shopify Settings */}
        {activeTab === 'shopify' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form Card */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="p-3 bg-gray-700 rounded-lg shadow-lg">
                    <Store className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      Shopify AI Assistant
                    </h2>
                    <p className="text-sm text-gray-600 font-medium">
                      Connect your store to unlock AI-powered automation and intelligent optimizations.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleShopifySubmit} className="space-y-8">
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-3 flex items-center">
                      <div className="w-2 h-2 bg-gray-500 rounded-full mr-3"></div>
                      Store URL
                    </label>
                    <input
                      type="text"
                      value={shopifyForm.storeUrl}
                      onChange={(e) => setShopifyForm({ ...shopifyForm, storeUrl: e.target.value })}
                      placeholder="your-store.myshopify.com"
                      className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500/20 focus:border-gray-500 transition-all duration-300 hover:border-gray-300"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-2 font-medium">
                      Enter your store URL (e.g., your-store.myshopify.com)
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-3 flex items-center">
                      <div className="w-2 h-2 bg-gray-500 rounded-full mr-3"></div>
                      AI Access Token
                    </label>
                    <input
                      type="password"
                      value={shopifyForm.accessToken}
                      onChange={(e) => setShopifyForm({ ...shopifyForm, accessToken: e.target.value })}
                      placeholder="shpat_..."
                      className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500/20 focus:border-gray-500 transition-all duration-300 hover:border-gray-300"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-2 font-medium">
                      Create a private app in your Shopify admin to get an access token.
                    </p>
                  </div>

                  <div className="flex space-x-4">
                    <Button
                      type="submit"
                      disabled={isTesting}
                      className="flex-1 bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-gray-500/30 transition-all duration-300 disabled:opacity-50 hover:scale-105 hover:shadow-xl"
                    >
                      {isTesting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                          AI Analyzing...
                        </>
                      ) : (
                        editingConnection ? 'Update AI Connection' : 'Connect AI Assistant'
                      )}
                    </Button>
                    {editingConnection && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingConnection(null)
                          setShopifyForm({ storeUrl: '', accessToken: '' })
                        }}
                        className="px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-semibold"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>

                {testResult && (
                  <div className={`mt-6 p-4 rounded-xl border ${
                    testResult === 'success' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center space-x-3">
                      {testResult === 'success' ? (
                        <Check className="h-5 w-5 text-green-600" />
                      ) : (
                        <X className="h-5 w-5 text-red-600" />
                      )}
                      <span className={`text-sm font-semibold ${
                        testResult === 'success' 
                          ? 'text-green-800' 
                          : 'text-red-800'
                      }`}>
                        {testResult === 'success' 
                          ? 'Connection successful!' 
                          : 'Connection failed. Please check your credentials.'
                        }
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">AI Setup Guide</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-sm">1</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">Create AI App</p>
                      <p className="text-xs text-gray-600 font-medium">Go to your Shopify admin settings</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-sm">2</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">Enable AI Permissions</p>
                      <p className="text-xs text-gray-600 font-medium">Enable required API scopes</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-sm">3</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">Get AI Token</p>
                      <p className="text-xs text-gray-600 font-medium">Copy the access token</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 text-white shadow-lg">
                <h3 className="text-lg font-bold mb-3">AI Support</h3>
                <p className="text-xs text-gray-300 mb-5 font-medium">
                  Our AI experts are here to help you get connected.
                </p>
                <Button className="bg-white text-gray-800 hover:bg-gray-50 font-bold px-4 py-2 rounded-lg shadow-lg hover:scale-105 transition-all duration-300">
                  Contact AI Support
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* WordPress Settings */}
        {activeTab === 'wordpress' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form Card */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="p-3 bg-gray-700 rounded-lg">
                    <Settings className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">WordPress Connection</h2>
                    <p className="text-sm text-gray-600">
                      Connect your WordPress site to enable AI-powered fixes and optimizations.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleWordPressSubmit} className="space-y-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Site URL
                    </label>
                    <input
                      type="url"
                      value={wordpressForm.baseUrl}
                      onChange={(e) => setWordpressForm({ ...wordpressForm, baseUrl: e.target.value })}
                      placeholder="https://your-wordpress-site.com"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={wordpressForm.username}
                      onChange={(e) => setWordpressForm({ ...wordpressForm, username: e.target.value })}
                      placeholder="your-username"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Application Password
                    </label>
                    <input
                      type="password"
                      value={wordpressForm.appPassword}
                      onChange={(e) => setWordpressForm({ ...wordpressForm, appPassword: e.target.value })}
                      placeholder="your-app-password"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      Create an application password in your WordPress user profile.
                    </p>
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      type="submit"
                      disabled={isTesting}
                      className="flex-1 bg-gray-800 hover:bg-gray-900 text-white font-semibold py-2 px-4 rounded-lg shadow-lg shadow-gray-500/25 transition-all duration-200 disabled:opacity-50"
                    >
                      {isTesting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Testing Connection...
                        </>
                      ) : (
                        editingConnection ? 'Update Connection' : 'Test & Save Connection'
                      )}
                    </Button>
                    {editingConnection && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingConnection(null)
                          setWordpressForm({ baseUrl: '', username: '', appPassword: '' })
                        }}
                        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-all duration-200"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>

                {testResult && (
                  <div className={`mt-6 p-4 rounded-xl border ${
                    testResult === 'success' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center space-x-3">
                      {testResult === 'success' ? (
                        <Check className="h-5 w-5 text-green-600" />
                      ) : (
                        <X className="h-5 w-5 text-red-600" />
                      )}
                      <span className={`text-sm font-semibold ${
                        testResult === 'success' 
                          ? 'text-green-800' 
                          : 'text-red-800'
                      }`}>
                        {testResult === 'success' 
                          ? 'Connection successful!' 
                          : 'Connection failed. Please check your credentials.'
                        }
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h3 className="text-sm font-bold text-gray-800 mb-3">Quick Setup</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-600 font-bold text-xs">1</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Enable REST API</p>
                      <p className="text-xs text-gray-600">Most WordPress sites have this enabled</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-600 font-bold text-sm">2</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Create App Password</p>
                      <p className="text-xs text-gray-600">Go to Users → Profile in WordPress</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-600 font-bold text-sm">3</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Copy Password</p>
                      <p className="text-xs text-gray-600">Save the generated password</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 text-white">
                <h3 className="text-sm font-bold mb-3">Need Help?</h3>
                <p className="text-xs text-gray-300 mb-4">
                  Our support team is here to help you get connected.
                </p>
                <Button className="bg-white text-gray-800 hover:bg-gray-50 font-semibold px-3 py-1 rounded-lg">
                  Contact Support
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Connected Sites Tab */}
        {activeTab === 'connected' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-3 mb-8">
                <div className="p-3 bg-gray-700 rounded-lg">
                  <Link className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">All Connected Sites</h2>
                  <p className="text-sm text-gray-600">
                    View and manage all your connected Shopify stores and WordPress sites.
                  </p>
                </div>
              </div>

              {connections.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Shopify Connections */}
                  {shopifyConnections.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-gray-800 flex items-center">
                        <Store className="h-5 w-5 mr-2 text-gray-600" />
                        Shopify Stores ({shopifyConnections.length})
                      </h3>
                      <div className="space-y-3">
                        {shopifyConnections.map((connection) => (
                          <div key={connection.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="p-1 bg-gray-100 rounded-lg">
                                  <Store className="h-3 w-3 text-gray-600" />
                                </div>
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <p className="text-sm font-semibold text-gray-900">{connection.url}</p>
                                    {connection.isConnected && (
                                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-600">
                                    {connection.isConnected ? 'Connected' : 'Disconnected'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditConnection(connection)}
                                  className="px-2 py-1 text-xs rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                                >
                                  <Edit className="h-3 w-3 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteConnection(connection.id)}
                                  className="px-2 py-1 text-xs rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* WordPress Connections */}
                  {wordpressConnections.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-gray-800 flex items-center">
                        <Settings className="h-5 w-5 mr-2 text-gray-600" />
                        WordPress Sites ({wordpressConnections.length})
                      </h3>
                      <div className="space-y-3">
                        {wordpressConnections.map((connection) => (
                          <div key={connection.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="p-1 bg-gray-100 rounded-lg">
                                  <Globe className="h-3 w-3 text-gray-600" />
                                </div>
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <p className="text-sm font-semibold text-gray-900">{connection.url}</p>
                                    {connection.isConnected && (
                                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-600">
                                    {connection.isConnected ? 'Connected' : 'Disconnected'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditConnection(connection)}
                                  className="px-2 py-1 text-xs rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                                >
                                  <Edit className="h-3 w-3 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteConnection(connection.id)}
                                  className="px-2 py-1 text-xs rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Link className="h-8 w-8 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">No Connected Sites</h3>
                  <p className="text-sm text-gray-600 mb-4">You haven't connected any stores or websites yet.</p>
                  <p className="text-xs text-gray-500">Use the Shopify or WordPress tabs to add your first connection.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
