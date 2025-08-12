import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  try {
    return twMerge(clsx(inputs))
  } catch (error) {
    console.warn('Error in cn function:', error)
    // Fallback to simple class concatenation
    return inputs.filter(Boolean).join(' ')
  }
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function generateDiff(before: any, after: any): string {
  const beforeStr = JSON.stringify(before, null, 2)
  const afterStr = JSON.stringify(after, null, 2)
  
  // Simple diff implementation - in production, you might want to use a more sophisticated diff library
  const lines1 = beforeStr.split('\n')
  const lines2 = afterStr.split('\n')
  
  let diff = ''
  const maxLines = Math.max(lines1.length, lines2.length)
  
  for (let i = 0; i < maxLines; i++) {
    const line1 = lines1[i] || ''
    const line2 = lines2[i] || ''
    
    if (line1 !== line2) {
      diff += `- ${line1}\n`
      diff += `+ ${line2}\n`
    } else {
      diff += `  ${line1}\n`
    }
  }
  
  return diff
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function validateShopifyUrl(url: string): boolean {
  // Allow both full URLs and just store names
  const shopifyPattern = /^(https?:\/\/)?[a-zA-Z0-9-]+\.myshopify\.com$/
  return shopifyPattern.test(url)
}

export function validateWordPressUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return false
  }
}
