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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-4">Fix It AI</h1>
            <p className="text-xl text-muted-foreground mb-8">
              AI-powered assistant for fixing Shopify and WordPress e-commerce sites
            </p>
          </div>
          
          <div className="space-y-4">
            <Button asChild className="w-full">
              <a href="/login">Get Started</a>
            </Button>
            <p className="text-sm text-muted-foreground">
              Sign in to start managing your e-commerce stores with AI
            </p>
          </div>
        </div>
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
