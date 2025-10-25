import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export interface CreateConnectionData {
  storeType: 'shopify' | 'wordpress'
  storeUrl: string
  accessToken?: string // For Shopify
  username?: string // For WordPress
  appPassword?: string // For WordPress
}

export interface UpdateConnectionData {
  storeUrl?: string
  accessToken?: string
  username?: string
  appPassword?: string
  isActive?: boolean
}

export class DatabaseService {
  // Store Connection methods
  static async createConnection(data: CreateConnectionData) {
    return await prisma.storeConnection.create({
      data: {
        storeType: data.storeType,
        storeUrl: data.storeUrl,
        accessToken: data.accessToken,
        username: data.username,
        appPassword: data.appPassword,
      },
    })
  }

  static async getConnections() {
    return await prisma.storeConnection.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  static async getConnection(id: string) {
    return await prisma.storeConnection.findUnique({
      where: { id },
    })
  }

  static async updateConnection(id: string, data: UpdateConnectionData) {
    return await prisma.storeConnection.update({
      where: { id },
      data,
    })
  }

  static async deleteConnection(id: string) {
    return await prisma.storeConnection.update({
      where: { id },
      data: { isActive: false },
    })
  }

  static async getWordPressConnections() {
    return await prisma.storeConnection.findMany({
      where: { 
        storeType: 'wordpress',
        isActive: true 
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  static async getShopifyConnections() {
    return await prisma.storeConnection.findMany({
      where: { 
        storeType: 'shopify',
        isActive: true 
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  // Chat Session methods
  static async createChatSession(messages: any[]) {
    return await prisma.chatSession.create({
      data: { messages: JSON.stringify(messages) },
    })
  }

  static async getChatSession(id: string) {
    return await prisma.chatSession.findUnique({
      where: { id },
    })
  }

  static async updateChatSession(id: string, messages: any[]) {
    return await prisma.chatSession.update({
      where: { id },
      data: { messages: JSON.stringify(messages) },
    })
  }

  // Change Log methods
  static async createChangeLog(data: {
    action: string
    operation: string
    description: string
    beforeState?: any
    afterState?: any
    status: string
    error?: string
    userId?: string
    metadata?: any
  }) {
    return await prisma.changeLog.create({
      data: {
        action: data.action,
        operation: data.operation,
        description: data.description,
        beforeState: data.beforeState ? JSON.stringify(data.beforeState) : null,
        afterState: data.afterState ? JSON.stringify(data.afterState) : null,
        status: data.status,
        error: data.error,
        userId: data.userId,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      },
    })
  }

  static async getChangeLogs(limit = 50) {
    return await prisma.changeLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: limit,
    })
  }
}
