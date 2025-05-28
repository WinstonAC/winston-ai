# Winston AI Chatbot Developer Guide

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Integration Points](#integration-points)
3. [API Reference](#api-reference)
4. [Custom Commands](#custom-commands)
5. [Analytics Integration](#analytics-integration)
6. [Security Considerations](#security-considerations)
7. [Performance Optimization](#performance-optimization)

## Architecture Overview

### Core Components
1. **Unified Chatbot Interface**
   - Single component for both general and analytics contexts
   - Context-aware response generation
   - Brutalist design implementation
   - Real-time interaction handling

2. **Natural Language Processing (NLP) Engine**
   - Built on OpenAI's GPT-4
   - Custom fine-tuning for business context
   - Context-aware response generation
   - Analytics-specific query handling

3. **Command Parser**
   - Intent recognition
   - Entity extraction
   - Context management
   - Analytics command processing

4. **Action Executor**
   - API integration layer
   - Permission validation
   - Transaction management
   - Analytics data processing

### Data Flow
1. User input → NLP Engine
2. Intent recognition → Command Parser
3. Permission check → Security Layer
4. Action execution → API Layer
5. Response generation → User Interface

## Integration Points

### API Endpoints
```typescript
// Base URL: /api/chatbot

// Send message
POST /message
Request: {
  message: string;
  context?: {
    page: string;
    userId: string;
    teamId?: string;
    mode: 'general' | 'analytics';
  };
}

// Get conversation history
GET /history
Query: {
  userId: string;
  limit?: number;
  before?: Date;
  mode?: 'general' | 'analytics';
}

// Execute command
POST /command
Request: {
  command: string;
  parameters?: Record<string, any>;
  userId: string;
  mode: 'general' | 'analytics';
}
```

### Webhook Support
```typescript
// Webhook configuration
interface WebhookConfig {
  url: string;
  events: string[];
  secret: string;
  headers?: Record<string, string>;
}

// Available events
const EVENTS = {
  MESSAGE_RECEIVED: 'message.received',
  COMMAND_EXECUTED: 'command.executed',
  ERROR_OCCURRED: 'error.occurred',
  USER_ACTION: 'user.action',
  CONTEXT_SWITCH: 'context.switch',
  ANALYTICS_QUERY: 'analytics.query'
};
```

## API Reference

### Authentication
```typescript
// API Key Authentication
const headers = {
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json'
};

// JWT Authentication
const headers = {
  'Authorization': `Bearer ${JWT_TOKEN}`,
  'Content-Type': 'application/json'
};
```

### Rate Limiting
- 100 requests per minute per API key
- 1000 requests per minute per IP address
- Rate limit headers included in responses

### Error Handling
```typescript
interface ErrorResponse {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// Common error codes
const ERROR_CODES = {
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INVALID_AUTH: 'INVALID_AUTH',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  INVALID_COMMAND: 'INVALID_COMMAND',
  INVALID_CONTEXT: 'INVALID_CONTEXT',
  ANALYTICS_ERROR: 'ANALYTICS_ERROR'
};
```

## Custom Commands

### Command Structure
```typescript
interface Command {
  name: string;
  description: string;
  parameters: Parameter[];
  handler: (params: any) => Promise<any>;
  permissions?: string[];
  context?: 'general' | 'analytics';
}

interface Parameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
}
```

### Example Command
```typescript
const createLeadCommand: Command = {
  name: 'create_lead',
  description: 'Create a new lead',
  parameters: [
    {
      name: 'name',
      type: 'string',
      required: true,
      description: 'Lead name'
    },
    {
      name: 'email',
      type: 'string',
      required: true,
      description: 'Lead email'
    }
  ],
  handler: async (params) => {
    // Implementation
  },
  permissions: ['create:lead'],
  context: 'general'
};

const analyzeMetricsCommand: Command = {
  name: 'analyze_metrics',
  description: 'Analyze campaign metrics',
  parameters: [
    {
      name: 'campaignId',
      type: 'string',
      required: true,
      description: 'Campaign ID'
    },
    {
      name: 'metrics',
      type: 'string[]',
      required: true,
      description: 'Metrics to analyze'
    }
  ],
  handler: async (params) => {
    // Implementation
  },
  permissions: ['view:analytics'],
  context: 'analytics'
};
```

## Analytics Integration

### Event Tracking
```typescript
interface AnalyticsEvent {
  type: string;
  userId: string;
  timestamp: Date;
  properties: Record<string, any>;
  context: 'general' | 'analytics';
}

// Track command execution
const trackCommand = async (command: string, success: boolean, context: 'general' | 'analytics') => {
  await analytics.track({
    type: 'command_executed',
    userId: currentUser.id,
    timestamp: new Date(),
    context,
    properties: {
      command,
      success,
      duration: performance.now() - startTime
    }
  });
};
```

### Metrics Collection
```typescript
interface ChatbotMetrics {
  totalInteractions: number;
  successfulCommands: number;
  failedCommands: number;
  averageResponseTime: number;
  mostUsedCommands: Array<{ command: string; count: number }>;
  contextUsage: {
    general: number;
    analytics: number;
  };
  userEngagement: {
    activeUsers: number;
    averageSessionDuration: number;
    returnRate: number;
  };
}
```

## Security Considerations

### Authentication
1. **API Key Security**
   - Rotate keys regularly
   - Use key prefixes for identification
   - Monitor key usage

2. **JWT Implementation**
   - Short-lived tokens (15 minutes)
   - Refresh token mechanism
   - Token revocation support

### Authorization
1. **Role-Based Access Control**
   ```typescript
   interface Permission {
     resource: string;
     action: string;
     context?: 'general' | 'analytics';
     conditions?: Record<string, any>;
   }
   ```

2. **Team-Based Permissions**
   ```typescript
   interface TeamPermission {
     teamId: string;
     role: string;
     permissions: Permission[];
     analyticsAccess?: boolean;
   }
   ```

### Data Protection
1. **Encryption**
   - TLS 1.3 for all communications
   - AES-256 for data at rest
   - Key rotation every 90 days

2. **Data Masking**
   - PII detection and masking
   - Sensitive data redaction
   - Audit logging

## Performance Optimization

### Caching Strategy
```typescript
interface CacheConfig {
  ttl: number;
  maxSize: number;
  strategy: 'LRU' | 'LFU';
  context?: 'general' | 'analytics';
}

const commandCache = new Cache<Command>({
  ttl: 3600, // 1 hour
  maxSize: 1000,
  strategy: 'LRU'
});
```

### Query Optimization
1. **Database Indexing**
   ```sql
   CREATE INDEX idx_chatbot_interactions_user 
   ON chatbot_interactions(user_id, timestamp, context);
   
   CREATE INDEX idx_chatbot_interactions_team 
   ON chatbot_interactions(team_id, timestamp, context);
   ```

2. **Query Patterns**
   ```typescript
   // Efficient querying
   const getRecentInteractions = async (userId: string, limit: number, context?: 'general' | 'analytics') => {
     return supabase
       .from('chatbot_interactions')
       .select('*')
       .eq('user_id', userId)
       .order('created_at', { ascending: false })
       .limit(limit);
   };
   ```

### Resource Management
1. **Connection Pooling**
   ```typescript
   const pool = new Pool({
     max: 20,
     idleTimeoutMillis: 30000,
     connectionTimeoutMillis: 2000
   });
   ```

2. **Memory Management**
   ```typescript
   // Clean up resources
   const cleanup = () => {
     clearCache();
     closeConnections();
     releaseMemory();
   };
   ```

## Need Help?

- API Documentation: api.winston-ai.com
- Developer Support: dev-support@winston-ai.com
- GitHub Repository: github.com/winston-ai/chatbot 