'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, RotateCcw, Eye, Calendar, Store, Settings } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface ChangeLog {
  id: string
  timestamp: string
  action: string
  operation: string
  description: string
  status: string
  error?: string
}

export default function LogsPage() {
  const [logs, setLogs] = useState<ChangeLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedLog, setSelectedLog] = useState<ChangeLog | null>(null)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/logs')
      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs)
      }
    } catch (error) {
      console.error('Error fetching logs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRollback = async (logId: string) => {
    if (!confirm('Are you sure you want to rollback this change?')) return

    try {
      const response = await fetch(`/api/logs/${logId}/rollback`, {
        method: 'POST',
      })

      if (response.ok) {
        alert('Rollback completed successfully')
        fetchLogs() // Refresh logs
      } else {
        alert('Rollback failed')
      }
    } catch (error) {
      console.error('Error rolling back:', error)
      alert('Rollback failed')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20'
      case 'failed':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20'
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20'
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'shopify':
        return <Store className="h-4 w-4" />
      case 'wordpress':
        return <Settings className="h-4 w-4" />
      default:
        return <Eye className="h-4 w-4" />
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
              <h1 className="text-xl font-bold">Change Logs</h1>
              <p className="text-sm text-muted-foreground">
                View applied changes and rollback history
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <Eye className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No logs yet</h3>
            <p className="text-muted-foreground">
              Changes you make will appear here for review and rollback.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div
                key={log.id}
                className="bg-card border rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getActionIcon(log.action)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium truncate">
                          {log.description}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            log.status
                          )}`}
                        >
                          {log.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(new Date(log.timestamp))}</span>
                        </div>
                        <span className="capitalize">{log.action}</span>
                        <span className="capitalize">{log.operation}</span>
                      </div>

                      {log.error && (
                        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-300">
                          {log.error}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedLog(log)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Details
                    </Button>
                    
                    {log.status === 'success' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRollback(log.id)}
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Rollback
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Log Details</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedLog(null)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Description
                </label>
                <p className="mt-1">{selectedLog.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Action
                  </label>
                  <p className="mt-1 capitalize">{selectedLog.action}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Operation
                  </label>
                  <p className="mt-1 capitalize">{selectedLog.operation}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Status
                  </label>
                  <p className="mt-1 capitalize">{selectedLog.status}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Timestamp
                  </label>
                  <p className="mt-1">{formatDate(new Date(selectedLog.timestamp))}</p>
                </div>
              </div>

              {selectedLog.error && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Error
                  </label>
                  <div className="mt-1 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-300">
                    {selectedLog.error}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setSelectedLog(null)}
              >
                Close
              </Button>
              {selectedLog.status === 'success' && (
                <Button
                  onClick={() => {
                    handleRollback(selectedLog.id)
                    setSelectedLog(null)
                  }}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Rollback
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
