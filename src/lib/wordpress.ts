import axios from 'axios'

export interface WordPressPost {
  id: number
  title: { rendered: string }
  content: { rendered: string }
  excerpt: { rendered: string }
  status: string
  type: string
  slug: string
  date: string
  modified: string
  meta: any
}

export interface WordPressPage {
  id: number
  title: { rendered: string }
  content: { rendered: string }
  status: string
  slug: string
  date: string
  modified: string
  meta: any
}

export class WordPressAPI {
  private baseUrl: string
  private username: string
  private appPassword: string

  constructor(baseUrl: string, username: string, appPassword: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
    this.username = username
    this.appPassword = appPassword
  }

  private getAuthHeader(): string {
    const credentials = Buffer.from(`${this.username}:${this.appPassword}`).toString('base64')
    return `Basic ${credentials}`
  }

  private getHeaders() {
    return {
      'Authorization': this.getAuthHeader(),
      'Content-Type': 'application/json',
    }
  }

  async getPosts(perPage = 10): Promise<WordPressPost[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/wp-json/wp/v2/posts`, {
        headers: this.getHeaders(),
        params: { per_page: perPage },
      })
      return response.data
    } catch (error) {
      console.error('Error fetching WordPress posts:', error)
      throw error
    }
  }

  async getAllPosts(): Promise<WordPressPost[]> {
    try {
      const allPosts: WordPressPost[] = []
      let page = 1
      const perPage = 100 // WordPress API max per page
      let hasMore = true

      while (hasMore) {
        const response = await axios.get(`${this.baseUrl}/wp-json/wp/v2/posts`, {
          headers: this.getHeaders(),
          params: { 
            per_page: perPage,
            page: page,
            _fields: 'id,title,status,date,modified,slug,type'
          },
        })
        
        const posts = response.data
        if (posts && posts.length > 0) {
          allPosts.push(...posts)
          // Check if there are more pages
          const totalPages = parseInt(response.headers['x-wp-totalpages'] || '1', 10)
          hasMore = page < totalPages
          page++
        } else {
          hasMore = false
        }
      }

      return allPosts
    } catch (error) {
      console.error('Error fetching all WordPress posts:', error)
      throw error
    }
  }

  async getPostsCount(): Promise<number> {
    try {
      const response = await axios.get(`${this.baseUrl}/wp-json/wp/v2/posts`, {
        headers: this.getHeaders(),
        params: { per_page: 1 },
      })
      // WordPress REST API returns total count in X-WP-Total header
      const totalCount = parseInt(response.headers['x-wp-total'] || '0', 10)
      return totalCount
    } catch (error) {
      console.error('Error fetching WordPress posts count:', error)
      return 0
    }
  }

  async getPost(id: number): Promise<WordPressPost> {
    try {
      const response = await axios.get(`${this.baseUrl}/wp-json/wp/v2/posts/${id}`, {
        headers: this.getHeaders(),
      })
      return response.data
    } catch (error) {
      console.error('Error fetching WordPress post:', error)
      throw error
    }
  }

  async updatePost(id: number, postData: Partial<WordPressPost>): Promise<WordPressPost> {
    try {
      const response = await axios.post(`${this.baseUrl}/wp-json/wp/v2/posts/${id}`, postData, {
        headers: this.getHeaders(),
      })
      return response.data
    } catch (error) {
      console.error('Error updating WordPress post:', error)
      throw error
    }
  }

  async getPages(perPage = 10): Promise<WordPressPage[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/wp-json/wp/v2/pages`, {
        headers: this.getHeaders(),
        params: { per_page: perPage },
      })
      return response.data
    } catch (error) {
      console.error('Error fetching WordPress pages:', error)
      throw error
    }
  }

  async getPagesCount(): Promise<number> {
    try {
      const response = await axios.get(`${this.baseUrl}/wp-json/wp/v2/pages`, {
        headers: this.getHeaders(),
        params: { per_page: 1 },
      })
      // WordPress REST API returns total count in X-WP-Total header
      const totalCount = parseInt(response.headers['x-wp-total'] || '0', 10)
      return totalCount
    } catch (error) {
      console.error('Error fetching WordPress pages count:', error)
      return 0
    }
  }

  async getPage(id: number): Promise<WordPressPage> {
    try {
      const response = await axios.get(`${this.baseUrl}/wp-json/wp/v2/pages/${id}`, {
        headers: this.getHeaders(),
      })
      return response.data
    } catch (error) {
      console.error('Error fetching WordPress page:', error)
      throw error
    }
  }

  async updatePage(id: number, pageData: Partial<WordPressPage>): Promise<WordPressPage> {
    try {
      const response = await axios.post(`${this.baseUrl}/wp-json/wp/v2/pages/${id}`, pageData, {
        headers: this.getHeaders(),
      })
      return response.data
    } catch (error) {
      console.error('Error updating WordPress page:', error)
      throw error
    }
  }

  async getPlugins(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/wp-json/wp/v2/plugins`, {
        headers: this.getHeaders(),
      })
      return response.data
    } catch (error) {
      console.error('Error fetching WordPress plugins:', error)
      throw error
    }
  }

  async activatePlugin(plugin: string): Promise<any> {
    try {
      const response = await axios.post(`${this.baseUrl}/wp-json/wp/v2/plugins`, {
        plugin,
        status: 'active',
      }, {
        headers: this.getHeaders(),
      })
      return response.data
    } catch (error) {
      console.error('Error activating WordPress plugin:', error)
      throw error
    }
  }

  async deactivatePlugin(plugin: string): Promise<any> {
    try {
      const response = await axios.post(`${this.baseUrl}/wp-json/wp/v2/plugins`, {
        plugin,
        status: 'inactive',
      }, {
        headers: this.getHeaders(),
      })
      return response.data
    } catch (error) {
      console.error('Error deactivating WordPress plugin:', error)
      throw error
    }
  }

  async getTheme(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/wp-json/wp/v2/themes`, {
        headers: this.getHeaders(),
      })
      return response.data
    } catch (error) {
      console.error('Error fetching WordPress theme:', error)
      throw error
    }
  }

  async updateTheme(themeData: any): Promise<any> {
    try {
      const response = await axios.post(`${this.baseUrl}/wp-json/wp/v2/themes`, themeData, {
        headers: this.getHeaders(),
      })
      return response.data
    } catch (error) {
      console.error('Error updating WordPress theme:', error)
      throw error
    }
  }

  async getOptions(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/wp-json/wp/v2/options`, {
        headers: this.getHeaders(),
      })
      return response.data
    } catch (error) {
      console.error('Error fetching WordPress options:', error)
      throw error
    }
  }

  async updateOption(option: string, value: any): Promise<any> {
    try {
      const response = await axios.post(`${this.baseUrl}/wp-json/wp/v2/options`, {
        [option]: value,
      }, {
        headers: this.getHeaders(),
      })
      return response.data
    } catch (error) {
      console.error('Error updating WordPress option:', error)
      throw error
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await axios.get(`${this.baseUrl}/wp-json/wp/v2/`, {
        headers: this.getHeaders(),
      })
      return true
    } catch (error) {
      console.error('WordPress connection test failed:', error)
      return false
    }
  }
}
