import { NextApiRequest, NextApiResponse } from 'next'
import { WordPressAPI } from '@/lib/wordpress'
import { formatMarkdownToHtml } from '@/lib/textFormatter'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { baseUrl, username, appPassword, contentType, contentId, content } = req.body

    if (!baseUrl || !username || !appPassword) {
      return res.status(400).json({ error: 'Base URL, username, and app password are required' })
    }

    if (!contentType || !contentId || !content) {
      return res.status(400).json({ error: 'Content type, content ID, and content are required' })
    }

    const wordpress = new WordPressAPI(baseUrl, username, appPassword)

    // Format the content
    const formattedContent = formatMarkdownToHtml(content)

    let result
    if (contentType === 'post') {
      result = await wordpress.updatePost(contentId, { content: { rendered: formattedContent } })
    } else if (contentType === 'page') {
      result = await wordpress.updatePage(contentId, { content: { rendered: formattedContent } })
    } else {
      return res.status(400).json({ error: 'Content type must be "post" or "page"' })
    }

    res.status(200).json({
      success: true,
      data: result,
      message: 'Content formatted successfully',
      originalContent: content,
      formattedContent: formattedContent,
    })
  } catch (error) {
    console.error('WordPress content formatting error:', error)
    res.status(500).json({ 
      error: 'Failed to format WordPress content',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
