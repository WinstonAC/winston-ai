import { EmailTemplate, BatchProcessingConfig, EmailStatus, AuditLogEntry } from '@/types/agent';
import { EMAIL_TEMPLATES } from '@/prompts';

const DEFAULT_BATCH_CONFIG: BatchProcessingConfig = {
  batchSize: 5,
  delayBetweenBatches: 3000, // 3 seconds
  maxRetries: 3,
  maxConcurrent: 2
};

const RATE_LIMIT = 5; // emails per second
let lastSentTime = 0;
const emailTracker = new Map<string, EmailStatus>();

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export async function sendEmail(
  to: string,
  subject: string,
  body: string,
  options: { 
    trackOpens?: boolean; 
    trackClicks?: boolean;
    retryCount?: number;
  } = {}
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if user has opted out
    const status = emailTracker.get(to);
    if (status?.optedOut) {
      throw new Error(`User ${to} has opted out`);
    }

    // Rate limiting
    const now = Date.now();
    const timeSinceLastEmail = now - lastSentTime;
    if (timeSinceLastEmail < 1000 / RATE_LIMIT) {
      const waitTime = 1000 / RATE_LIMIT - timeSinceLastEmail;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    lastSentTime = Date.now();

    // TODO: Implement actual email sending logic
    // This is a placeholder for demonstration
    console.log(`Sending email to ${to}: ${subject}`);

    // Update email tracker
    emailTracker.set(to, {
      sent: true,
      sentAt: new Date().toISOString(),
      ...status
    });

    return { success: true };
  } catch (error) {
    // Handle retries if specified
    if (options.retryCount && options.retryCount < DEFAULT_BATCH_CONFIG.maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return sendEmail(to, subject, body, { 
        ...options, 
        retryCount: (options.retryCount || 0) + 1 
      });
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Update email tracker with error
    const status = emailTracker.get(to);
    emailTracker.set(to, {
      sent: false,
      error: errorMessage,
      ...status
    });

    return {
      success: false,
      error: errorMessage
    };
  }
}

export async function sendEmailBatch(
  recipients: { to: string; variables: Record<string, string> }[],
  templateId: string,
  config: Partial<BatchProcessingConfig> = {}
): Promise<AuditLogEntry[]> {
  const batchConfig = { ...DEFAULT_BATCH_CONFIG, ...config };
  const template = EMAIL_TEMPLATES[templateId];
  const auditLog: AuditLogEntry[] = [];

  if (!template) {
    throw new Error(`Template ${templateId} not found`);
  }

  // Process in batches
  for (let i = 0; i < recipients.length; i += batchConfig.batchSize) {
    const batch = recipients.slice(i, i + batchConfig.batchSize);
    const batchPromises = batch.map(async ({ to, variables }) => {
      const { subject, body } = generateEmailFromTemplate(template, variables);
      
      try {
        const result = await sendEmail(to, subject, body);
        const logEntry: AuditLogEntry = {
          timestamp: new Date().toISOString(),
          action: result.success ? 'email_sent' : 'email_failed',
          email: to,
          details: { templateId, variables },
          status: result.success ? 'success' : 'error'
        };
        auditLog.push(logEntry);
        return result;
      } catch (error) {
        const logEntry: AuditLogEntry = {
          timestamp: new Date().toISOString(),
          action: 'email_failed',
          email: to,
          details: { 
            templateId, 
            variables,
            error: error instanceof Error ? error.message : 'Unknown error'
          },
          status: 'error'
        };
        auditLog.push(logEntry);
        throw error;
      }
    });

    // Wait for batch to complete
    await Promise.all(batchPromises);

    // Delay between batches
    if (i + batchConfig.batchSize < recipients.length) {
      await new Promise(resolve => setTimeout(resolve, batchConfig.delayBetweenBatches));
    }
  }

  return auditLog;
}

export function generateEmailFromTemplate(
  template: EmailTemplate,
  variables: Record<string, string>
): { subject: string; body: string } {
  let subject = template.subject;
  let body = template.body;

  // Validate required variables
  const missingVars = template.variables.filter(v => !variables[v]);
  if (missingVars.length > 0) {
    throw new Error(`Missing required variables: ${missingVars.join(', ')}`);
  }

  // Replace variables in subject and body
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    subject = subject.replace(regex, value);
    body = body.replace(regex, value);
  });

  return { subject, body };
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

export function markUserOptOut(email: string): void {
  const status = emailTracker.get(email);
  emailTracker.set(email, {
    ...status,
    optedOut: true,
    optedOutAt: new Date().toISOString()
  });
}

export function getEmailStatus(email: string): EmailStatus | undefined {
  return emailTracker.get(email);
}

export function clearEmailTracker(): void {
  emailTracker.clear();
} 