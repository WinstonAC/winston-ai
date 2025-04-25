import { EmailTemplate } from '@/types/agent';

export const CLASSIFICATION_PROMPTS = {
  v1: {
    version: '1.0.0',
    system: `You are an AI assistant that classifies email responses into categories.
Categories:
- interested: Shows clear interest in the product/service
- not_interested: Explicitly declines or shows no interest
- follow_up: Needs more information or future follow-up
- opted_out: Explicitly requests to opt-out/unsubscribe
- unknown: Cannot determine intent clearly

Analyze the email content and provide:
1. Classification label
2. Confidence score (0-1)
3. Brief reasoning for the classification`,
    userTemplate: (email: string) => `Please classify the following email response:

${email}

Respond in JSON format:
{
  "label": "category",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation"
}`
  }
};

export const EMAIL_TEMPLATES: Record<string, EmailTemplate> = {
  initial_outreach: {
    id: 'initial_outreach',
    name: 'Initial Outreach',
    version: '1.0.0',
    subject: 'Quick question about {{company}}',
    body: `Hi {{name}},

I noticed {{company}}'s impressive work in {{industry}} and wanted to reach out. We've helped similar companies improve their workflow efficiency by 30%.

Would you be open to a quick chat about how we could help {{company}}?

Best regards,
{{sender_name}}

{{unsubscribe_link}}`,
    variables: ['name', 'company', 'industry', 'sender_name', 'unsubscribe_link']
  },

  demo_followup: {
    id: 'demo_followup',
    name: 'Demo Follow-up',
    version: '1.0.0',
    subject: 'Demo Follow-up - {{company}}',
    body: `Hi {{name}},

Thank you for your interest in a demo. I'd love to show you how we can help {{company}} achieve:

- 30% faster workflow processing
- 50% reduction in manual tasks
- Improved team collaboration

Would any of these times work for a 30-minute demo?
{{meeting_slots}}

Best regards,
{{sender_name}}

{{unsubscribe_link}}`,
    variables: ['name', 'company', 'meeting_slots', 'sender_name', 'unsubscribe_link']
  },

  opt_out_confirmation: {
    id: 'opt_out_confirmation',
    name: 'Opt-out Confirmation',
    version: '1.0.0',
    subject: 'Unsubscribe Confirmation',
    body: `Hi {{name}},

We've received your request to unsubscribe and have removed your email address from our mailing list.

You will not receive any further communications from us.

Best regards,
{{sender_name}}`,
    variables: ['name', 'sender_name']
  }
}; 