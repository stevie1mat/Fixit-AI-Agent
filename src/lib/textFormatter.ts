import { marked } from 'marked'

/**
 * Text formatting utilities for converting markdown-style formatting to HTML
 */

/**
 * Converts **text** to <strong>text</strong> (bold formatting)
 * @param text - The text to format
 * @returns Formatted text with bold tags
 */
export function formatBoldText(text: string): string {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
}

/**
 * Converts *text* to <em>text</em> (italic formatting)
 * @param text - The text to format
 * @returns Formatted text with italic tags
 */
export function formatItalicText(text: string): string {
  return text.replace(/\*(.*?)\*/g, '<em>$1</em>')
}

/**
 * Converts `text` to <code>text</code> (inline code formatting)
 * @param text - The text to format
 * @returns Formatted text with code tags
 */
export function formatInlineCode(text: string): string {
  return text.replace(/`(.*?)`/g, '<code>$1</code>')
}

/**
 * Converts markdown-style formatting to HTML using marked library
 * Supports: **bold**, *italic*, `code`, and other markdown features
 * @param text - The text to format
 * @returns Formatted text with HTML tags
 */
export function formatMarkdownToHtml(text: string): string {
  try {
    // Use marked library for proper markdown parsing
    return marked(text, {
      breaks: true,
      gfm: true, // GitHub Flavored Markdown
    })
  } catch (error) {
    console.error('Error parsing markdown:', error)
    // Fallback to simple regex-based formatting
    let formatted = text
    formatted = formatBoldText(formatted)
    formatted = formatItalicText(formatted)
    formatted = formatInlineCode(formatted)
    return formatted
  }
}

/**
 * Converts WordPress post/page content to properly formatted text
 * Handles common WordPress formatting issues
 * @param content - The content to format
 * @returns Formatted content
 */
export function formatWordPressContent(content: string): string {
  let formatted = content
  
  // Remove HTML tags if needed (optional)
  // formatted = formatted.replace(/<[^>]*>/g, '')
  
  // Apply markdown formatting
  formatted = formatMarkdownToHtml(formatted)
  
  return formatted
}
