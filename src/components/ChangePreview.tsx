'use client'

import { useState } from 'react'
import { ChangePreview as ChangePreviewType } from '@/lib/store'
import { Button } from '@/components/ui/Button'
import { Check, X, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChangePreviewProps {
  preview: ChangePreviewType
}

export function ChangePreview({ preview }: ChangePreviewProps) {
  const [showDiff, setShowDiff] = useState(false)
  const [isApplying, setIsApplying] = useState(false)

  const handleApply = async () => {
    setIsApplying(true)
    try {
      const response = await fetch(`/api/${preview.type}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          changes: preview.afterState,
          previewId: preview.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to apply changes')
      }

      // Handle success - could update store state here
      console.log('Changes applied successfully')
    } catch (error) {
      console.error('Error applying changes:', error)
    } finally {
      setIsApplying(false)
    }
  }

  const handleReject = () => {
    // Handle rejection - could update store state here
    console.log('Changes rejected')
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Change Preview</h3>
            <p className="text-sm text-muted-foreground capitalize">
              {preview.type} Changes
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDiff(!showDiff)}
          >
            {showDiff ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {/* Description */}
          <div>
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-sm text-muted-foreground">
              {preview.description}
            </p>
          </div>

          {/* Summary */}
          <div>
            <h4 className="font-medium mb-2">Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>Changes will be applied safely</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Rollback available if needed</span>
              </div>
            </div>
          </div>

          {/* Diff View */}
          {showDiff && (
            <div>
              <h4 className="font-medium mb-2">Changes</h4>
              <div className="bg-muted rounded-md p-3 text-xs font-mono overflow-x-auto">
                <pre className="whitespace-pre-wrap">{preview.diff}</pre>
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  Review Changes
                </p>
                <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                  Please review the changes above before applying them to your store.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t p-4 space-y-2">
        <Button
          onClick={handleApply}
          disabled={isApplying}
          className="w-full"
        >
          {isApplying ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Applying...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Apply Changes
            </>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={handleReject}
          className="w-full"
        >
          <X className="h-4 w-4 mr-2" />
          Reject Changes
        </Button>
      </div>
    </div>
  )
}
