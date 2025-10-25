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

  async getActivePlugins(): Promise<string[]> {
    try {
      const plugins = await this.getPlugins()
      return plugins
        .filter(plugin => plugin.status === 'active')
        .map(plugin => plugin.slug)
    } catch (error) {
      console.error('Error fetching active WordPress plugins:', error)
      throw error
    }
  }

  async activatePlugin(plugin: string): Promise<any> {
    try {
      // Try the standard WordPress REST API approach first
      const response = await axios.post(`${this.baseUrl}/wp-json/wp/v2/plugins`, {
        plugin,
        status: 'active',
      }, {
        headers: this.getHeaders(),
      })
      return response.data
    } catch (error) {
      console.error('Error activating WordPress plugin:', error)
      // Fallback: Try to use a custom endpoint or alternative method
      throw new Error(`Failed to activate plugin '${plugin}': ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async deactivatePlugin(plugin: string): Promise<any> {
    try {
      // First, let's get the actual plugin slug from the plugins list
      const plugins = await this.getPlugins()
      const targetPlugin = plugins.find(p => 
        p.name?.toLowerCase().includes(plugin.toLowerCase()) ||
        p.plugin?.toLowerCase().includes(plugin.toLowerCase()) ||
        p.slug?.toLowerCase().includes(plugin.toLowerCase())
      )
      
      if (!targetPlugin) {
        throw new Error(`Plugin '${plugin}' not found in installed plugins`)
      }
      
      const pluginSlug = targetPlugin.plugin || targetPlugin.slug || plugin
      console.log(`Attempting to deactivate plugin: ${pluginSlug}`)
      
      // Try the standard WordPress REST API approach
      const response = await axios.post(`${this.baseUrl}/wp-json/wp/v2/plugins`, {
        plugin: pluginSlug,
        status: 'inactive',
      }, {
        headers: this.getHeaders(),
      })
      return response.data
    } catch (error) {
      console.error('Error deactivating WordPress plugin:', error)
      
      // If the REST API doesn't work, try alternative approaches
      if (error instanceof Error && error.message.includes('400')) {
        throw new Error(`WordPress REST API doesn't support plugin management. You may need to install a plugin management plugin or use WP-CLI. Plugin: ${plugin}`)
      }
      
      throw new Error(`Failed to deactivate plugin '${plugin}': ${error instanceof Error ? error.message : 'Unknown error'}`)
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

  async getComments(perPage = 50): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/wp-json/wp/v2/comments`, {
        headers: this.getHeaders(),
        params: { per_page: perPage },
      })
      return response.data
    } catch (error) {
      console.error('Error fetching WordPress comments:', error)
      throw error
    }
  }

  async getUsers(perPage = 50): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/wp-json/wp/v2/users`, {
        headers: this.getHeaders(),
        params: { per_page: perPage },
      })
      return response.data
    } catch (error) {
      console.error('Error fetching WordPress users:', error)
      throw error
    }
  }

  async getMedia(perPage = 50): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/wp-json/wp/v2/media`, {
        headers: this.getHeaders(),
        params: { per_page: perPage },
      })
      return response.data
    } catch (error) {
      console.error('Error fetching WordPress media:', error)
      throw error
    }
  }

  async getCategories(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/wp-json/wp/v2/categories`, {
        headers: this.getHeaders(),
      })
      return response.data
    } catch (error) {
      console.error('Error fetching WordPress categories:', error)
      throw error
    }
  }

  async getTags(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/wp-json/wp/v2/tags`, {
        headers: this.getHeaders(),
      })
      return response.data
    } catch (error) {
      console.error('Error fetching WordPress tags:', error)
      throw error
    }
  }

  async getMenus(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/wp-json/wp/v2/menus`, {
        headers: this.getHeaders(),
      })
      return response.data
    } catch (error) {
      console.error('Error fetching WordPress menus:', error)
      throw error
    }
  }

  async getWidgets(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/wp-json/wp/v2/widgets`, {
        headers: this.getHeaders(),
      })
      return response.data
    } catch (error) {
      console.error('Error fetching WordPress widgets:', error)
      throw error
    }
  }

  async getSiteInfo(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/wp-json/wp/v2/`, {
        headers: this.getHeaders(),
      })
      return response.data
    } catch (error) {
      console.error('Error fetching WordPress site info:', error)
      throw error
    }
  }

  async getCustomFields(postId?: number): Promise<any[]> {
    try {
      const endpoint = postId 
        ? `${this.baseUrl}/wp-json/wp/v2/posts/${postId}/meta`
        : `${this.baseUrl}/wp-json/wp/v2/meta`
      const response = await axios.get(endpoint, {
        headers: this.getHeaders(),
      })
      return response.data
    } catch (error) {
      console.error('Error fetching WordPress custom fields:', error)
      throw error
    }
  }

  async getSiteHealth(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/wp-json/wp/v2/site-health`, {
        headers: this.getHeaders(),
      })
      return response.data
    } catch (error) {
      console.error('Error fetching WordPress site health:', error)
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

  async clearW3TotalCache(): Promise<boolean> {
    try {
      const response = await axios.post(`${this.baseUrl}/wp-json/w3tc/v1/purge`, {}, {
        headers: this.getHeaders(),
      })
      return response.status === 200
    } catch (error) {
      console.error('Error clearing W3 Total Cache:', error)
      return false
    }
  }

  async clearWPRocketCache(): Promise<boolean> {
    try {
      const response = await axios.delete(`${this.baseUrl}/wp-json/wp-rocket/v1/cache`, {
        headers: this.getHeaders(),
      })
      return response.status === 200
    } catch (error) {
      console.error('Error clearing WP Rocket cache:', error)
      return false
    }
  }

  async clearWPSuperCache(): Promise<boolean> {
    try {
      const response = await axios.delete(`${this.baseUrl}/wp-json/wp-super-cache/v1/cache`, {
        headers: this.getHeaders(),
      })
      return response.status === 200
    } catch (error) {
      console.error('Error clearing WP Super Cache:', error)
      return false
    }
  }

  async clearCache(): Promise<{ success: boolean; message: string; plugin?: string }> {
    try {
      const activePlugins = await this.getActivePlugins()
      
      if (activePlugins.includes('w3-total-cache')) {
        const success = await this.clearW3TotalCache()
        return {
          success,
          message: success ? 'Success! I have flushed the W3 Total Cache.' : 'W3 Total Cache found but cache clearing failed.',
          plugin: 'w3-total-cache'
        }
      } else if (activePlugins.includes('wp-rocket')) {
        const success = await this.clearWPRocketCache()
        return {
          success,
          message: success ? 'Success! I have cleared the WP Rocket cache.' : 'WP Rocket found but cache clearing failed.',
          plugin: 'wp-rocket'
        }
      } else if (activePlugins.includes('wp-super-cache')) {
        const success = await this.clearWPSuperCache()
        return {
          success,
          message: success ? 'Success! I have cleared the WP Super Cache.' : 'WP Super Cache found but cache clearing failed.',
          plugin: 'wp-super-cache'
        }
      } else {
        return {
          success: false,
          message: "I couldn't find an active, supported caching plugin. I checked for W3 Total Cache, WP Rocket, and WP Super Cache."
        }
      }
    } catch (error) {
      console.error('Error clearing cache:', error)
      return {
        success: false,
        message: 'Failed to clear cache. Please try again or clear cache manually from your WordPress admin dashboard.'
      }
    }
  }

  // Check if plugin management is available
  async checkPluginManagementSupport(): Promise<{ supported: boolean; message: string }> {
    try {
      // Try to access the plugins endpoint
      const response = await axios.get(`${this.baseUrl}/wp-json/wp/v2/plugins`, {
        headers: this.getHeaders(),
      })
      
      return {
        supported: true,
        message: 'Plugin management is supported via REST API'
      }
    } catch (error) {
      return {
        supported: false,
        message: 'Plugin management is not supported via REST API. You may need to install a plugin management plugin or use WP-CLI.'
      }
    }
  }

  // Get plugin information by name
  async getPluginByName(pluginName: string): Promise<any> {
    try {
      const plugins = await this.getPlugins()
      const plugin = plugins.find(p => 
        p.name?.toLowerCase().includes(pluginName.toLowerCase()) ||
        p.plugin?.toLowerCase().includes(pluginName.toLowerCase()) ||
        p.slug?.toLowerCase().includes(pluginName.toLowerCase())
      )
      
      return plugin
    } catch (error) {
      console.error('Error finding plugin:', error)
      return null
    }
  }

  // Provide manual plugin management instructions
  async getPluginManagementInstructions(pluginName: string, action: 'deactivate' | 'activate'): Promise<{
    success: boolean
    message: string
    instructions: string[]
    alternatives: string[]
  }> {
    try {
      const plugin = await this.getPluginByName(pluginName)
      
      if (!plugin) {
        return {
          success: false,
          message: `Plugin '${pluginName}' not found in your installed plugins.`,
          instructions: [],
          alternatives: []
        }
      }

      const instructions = [
        `1. Log into your WordPress admin dashboard at ${this.baseUrl}/wp-admin`,
        `2. Navigate to Plugins → Installed Plugins`,
        `3. Find "${plugin.name || pluginName}" in the list`,
        `4. Click the "${action === 'deactivate' ? 'Deactivate' : 'Activate'}" link under the plugin name`,
        `5. Confirm the action`
      ]

      const alternatives = [
        `**WP-CLI Method:** \`wp plugin ${action} ${plugin.plugin || plugin.slug || pluginName.toLowerCase().replace(/\s+/g, '-')}\``,
        `**Plugin Management Plugin:** Install a plugin like "WP REST API Controller" to enable REST API plugin management`,
        `**Custom Code:** Add custom REST API endpoints for plugin management`
      ]

      return {
        success: true,
        message: `Here are the instructions to ${action} ${pluginName}:`,
        instructions,
        alternatives
      }
    } catch (error) {
      return {
        success: false,
        message: `Error getting instructions for ${pluginName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        instructions: [],
        alternatives: []
      }
    }
  }
}
