'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { ChatBox } from '@/components/ChatBox'
import { ChangePreview } from '@/components/ChangePreview'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/Button'
import { Menu, Settings, History } from 'lucide-react'

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { currentPreview } = useAppStore()

  return (
    <div className="flex h-screen bg-white">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b border-gray-100">
          <div className="flex items-center justify-between px-8 py-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-gray-600 hover:text-gray-900"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Fix It AI</h1>
                <p className="text-sm text-gray-600 font-medium">
                  AI-powered e-commerce assistant
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                <a href="/settings" className="flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  <span>Settings</span>
                </a>
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                <a href="/logs" className="flex items-center">
                  <History className="h-4 w-4 mr-2" />
                  <span>Logs</span>
                </a>
              </Button>
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col">
            <ChatBox />
          </div>
          {currentPreview && (
            <div className="w-96 border-l border-gray-100 bg-white">
              <ChangePreview preview={currentPreview} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
