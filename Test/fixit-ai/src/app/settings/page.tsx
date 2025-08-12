'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Store, Settings, ArrowLeft, Check, X } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { validateShopifyUrl, validateWordPressUrl } from '@/lib/utils'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'shopify' | 'wordpress'>('shopify')
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)
  const { addConnection } = useAppStore()

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
        addConnection({
          type: 'shopify',
          url: shopifyForm.storeUrl,
          accessToken: shopifyForm.accessToken,
          isConnected: true,
        })
        setShopifyForm({ storeUrl: '', accessToken: '' })
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
        addConnection({
          type: 'wordpress',
          url: wordpressForm.baseUrl,
          accessToken: wordpressForm.appPassword,
          isConnected: true,
        })
        setWordpressForm({ baseUrl: '', username: '', appPassword: '' })
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <a href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </a>
            </Button>
            <div>
              <h1 className="text-xl font-bold">Settings</h1>
              <p className="text-sm text-muted-foreground">
                Connect your stores and configure API keys
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg mb-8">
          <button
            onClick={() => setActiveTab('shopify')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'shopify'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Store className="h-4 w-4" />
            <span>Shopify</span>
          </button>
          <button
            onClick={() => setActiveTab('wordpress')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'wordpress'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>WordPress</span>
          </button>
        </div>

        {/* Shopify Settings */}
        {activeTab === 'shopify' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Shopify Connection</h2>
              <p className="text-muted-foreground">
                Connect your Shopify store to enable AI-powered fixes and optimizations.
              </p>
            </div>

            <form onSubmit={handleShopifySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Store URL
                </label>
                <input
                  type="text"
                  value={shopifyForm.storeUrl}
                  onChange={(e) => setShopifyForm({ ...shopifyForm, storeUrl: e.target.value })}
                  placeholder="your-store.myshopify.com"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter your store URL (e.g., your-store.myshopify.com)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Access Token
                </label>
                <input
                  type="password"
                  value={shopifyForm.accessToken}
                  onChange={(e) => setShopifyForm({ ...shopifyForm, accessToken: e.target.value })}
                  placeholder="shpat_..."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Create a private app in your Shopify admin to get an access token.
                </p>
              </div>

              <Button
                type="submit"
                disabled={isTesting}
                className="w-full"
              >
                {isTesting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Testing Connection...
                  </>
                ) : (
                  'Test & Save Connection'
                )}
              </Button>
            </form>

            {testResult && (
              <div className={`p-4 rounded-md ${
                testResult === 'success' 
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-center space-x-2">
                  {testResult === 'success' ? (
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                  )}
                  <span className={`text-sm font-medium ${
                    testResult === 'success' 
                      ? 'text-green-800 dark:text-green-200' 
                      : 'text-red-800 dark:text-red-200'
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
        )}

        {/* WordPress Settings */}
        {activeTab === 'wordpress' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">WordPress Connection</h2>
              <p className="text-muted-foreground">
                Connect your WordPress site to enable AI-powered fixes and optimizations.
              </p>
            </div>

            <form onSubmit={handleWordPressSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Site URL
                </label>
                <input
                  type="url"
                  value={wordpressForm.baseUrl}
                  onChange={(e) => setWordpressForm({ ...wordpressForm, baseUrl: e.target.value })}
                  placeholder="https://your-wordpress-site.com"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={wordpressForm.username}
                  onChange={(e) => setWordpressForm({ ...wordpressForm, username: e.target.value })}
                  placeholder="your-username"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Application Password
                </label>
                <input
                  type="password"
                  value={wordpressForm.appPassword}
                  onChange={(e) => setWordpressForm({ ...wordpressForm, appPassword: e.target.value })}
                  placeholder="your-app-password"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Create an application password in your WordPress user profile.
                </p>
              </div>

              <Button
                type="submit"
                disabled={isTesting}
                className="w-full"
              >
                {isTesting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Testing Connection...
                  </>
                ) : (
                  'Test & Save Connection'
                )}
              </Button>
            </form>

            {testResult && (
              <div className={`p-4 rounded-md ${
                testResult === 'success' 
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-center space-x-2">
                  {testResult === 'success' ? (
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                  )}
                  <span className={`text-sm font-medium ${
                    testResult === 'success' 
                      ? 'text-green-800 dark:text-green-200' 
                      : 'text-red-800 dark:text-red-200'
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
        )}
      </div>
    </div>
  )
}
