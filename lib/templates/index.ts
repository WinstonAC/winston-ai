// Types
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
}

// Constants and functions
export const defaultTemplates: EmailTemplate[] = [
  {
    id: 'welcome',
    name: 'Welcome Email',
    subject: 'Welcome to {{company_name}}',
    body: `Hi {{first_name}},

Thank you for your interest in {{company_name}}. We're excited to have you on board!

Best regards,
{{sender_name}}`,
    variables: ['first_name', 'company_name', 'sender_name'],
  },
  {
    id: 'follow-up',
    name: 'Follow-up Email',
    subject: 'Following up on our conversation',
    body: `Hi {{first_name}},

I hope this email finds you well. I wanted to follow up on our previous conversation about {{topic}}.

Would you be available for a quick call this week to discuss further?

Best regards,
{{sender_name}}`,
    variables: ['first_name', 'topic', 'sender_name'],
  },
  {
    id: 'demo-request',
    name: 'Demo Request',
    subject: 'Your Demo Request for {{company_name}}',
    body: `Hi {{first_name}},

Thanks for requesting a demo of {{company_name}}. I'd love to show you how we can help {{company}} achieve {{goal}}.

Would any of these times work for a 30-minute demo?
- {{time_slot_1}}
- {{time_slot_2}}
- {{time_slot_3}}

Best regards,
{{sender_name}}`,
    variables: ['first_name', 'company_name', 'company', 'goal', 'time_slot_1', 'time_slot_2', 'time_slot_3', 'sender_name'],
  },
];

export function parseTemplate(template: string, variables: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
    return variables[variable] || match;
  });
}

export function validateTemplate(template: EmailTemplate): string[] {
  const errors: string[] = [];
  
  if (!template.id) errors.push('Template ID is required');
  if (!template.name) errors.push('Template name is required');
  if (!template.subject) errors.push('Template subject is required');
  if (!template.body) errors.push('Template body is required');
  
  // Check for undefined variables
  const usedVariables = new Set<string>();
  const pattern = /\{\{(\w+)\}\}/g;
  let match;
  
  while ((match = pattern.exec(template.subject + template.body)) !== null) {
    usedVariables.add(match[1]);
  }
  
  for (const variable of usedVariables) {
    if (!template.variables.includes(variable)) {
      errors.push(`Template uses undefined variable: ${variable}`);
    }
  }
  
  return errors;
} 