import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ChatbotInteraction {
  userId: string;
  sessionId: string;
  timestamp: Date;
  command: string;
  response: string;
  success: boolean;
  context: {
    page: string;
    role: string;
    teamId?: string;
  };
  duration: number;
}

export interface ChatbotMetrics {
  totalInteractions: number;
  successfulCommands: number;
  failedCommands: number;
  averageResponseTime: number;
  mostUsedCommands: Array<{ command: string; count: number }>;
  userEngagement: {
    activeUsers: number;
    averageSessionDuration: number;
    returnRate: number;
  };
}

export class ChatbotAnalytics {
  static async trackInteraction(interaction: ChatbotInteraction) {
    try {
      await prisma.chatbotInteraction.create({
        data: {
          userId: interaction.userId,
          sessionId: interaction.sessionId,
          timestamp: interaction.timestamp,
          command: interaction.command,
          response: interaction.response,
          success: interaction.success,
          page: interaction.context.page,
          userRole: interaction.context.role,
          teamId: interaction.context.teamId,
          duration: interaction.duration
        }
      });
    } catch (error) {
      console.error('Error tracking chatbot interaction:', error);
    }
  }

  static async getMetrics(timeframe: 'day' | 'week' | 'month' = 'day'): Promise<ChatbotMetrics> {
    const now = new Date();
    let startDate = new Date();

    switch (timeframe) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
    }

    const interactions = await prisma.chatbotInteraction.findMany({
      where: {
        timestamp: {
          gte: startDate
        }
      }
    });

    const totalInteractions = interactions.length;
    const successfulCommands = interactions.filter(i => i.success).length;
    const failedCommands = totalInteractions - successfulCommands;
    const averageResponseTime = interactions.reduce((acc, curr) => acc + curr.duration, 0) / totalInteractions;

    // Calculate most used commands
    const commandCounts = interactions.reduce((acc, curr) => {
      acc[curr.command] = (acc[curr.command] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostUsedCommands = Object.entries(commandCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([command, count]) => ({ command, count }));

    // Calculate user engagement
    const uniqueUsers = new Set(interactions.map(i => i.userId)).size;
    const sessions = await prisma.chatbotInteraction.groupBy({
      by: ['sessionId'],
      _count: true,
      where: {
        timestamp: {
          gte: startDate
        }
      }
    });

    const averageSessionDuration = sessions.reduce((acc, curr) => acc + curr._count, 0) / sessions.length;

    // Calculate return rate (users who used the chatbot more than once)
    const userSessions = await prisma.chatbotInteraction.groupBy({
      by: ['userId'],
      _count: {
        sessionId: true
      },
      where: {
        timestamp: {
          gte: startDate
        }
      }
    });

    const returningUsers = userSessions.filter(u => u._count.sessionId > 1).length;
    const returnRate = (returningUsers / uniqueUsers) * 100;

    return {
      totalInteractions,
      successfulCommands,
      failedCommands,
      averageResponseTime,
      mostUsedCommands,
      userEngagement: {
        activeUsers: uniqueUsers,
        averageSessionDuration,
        returnRate
      }
    };
  }

  static async getCommandSuccessRate(command: string): Promise<number> {
    const interactions = await prisma.chatbotInteraction.findMany({
      where: {
        command
      }
    });

    if (interactions.length === 0) return 0;

    const successful = interactions.filter(i => i.success).length;
    return (successful / interactions.length) * 100;
  }

  static async getCommonFailures(): Promise<Array<{ command: string; count: number }>> {
    const failedInteractions = await prisma.chatbotInteraction.findMany({
      where: {
        success: false
      }
    });

    const failureCounts = failedInteractions.reduce((acc, curr) => {
      acc[curr.command] = (acc[curr.command] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(failureCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([command, count]) => ({ command, count }));
  }
} 