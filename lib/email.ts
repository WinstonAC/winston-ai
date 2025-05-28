import nodemailer from 'nodemailer';
import { supabase } from '@/lib/supabase';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface EmailStatus {
  sent: boolean;
  sentAt?: string;
  error?: string;
  optedOut?: boolean;
  optedOutAt?: string;
}

const emailTracker = new Map<string, EmailStatus>();

export function sendVerificationEmail(email: string, token: string): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const verificationUrl = `${baseUrl}/verify-email?token=${token}`;
  
  console.log(`Sending verification email to ${email} with URL: ${verificationUrl}`);
  
  // Mock email sending for MVP
  emailTracker.set(email, {
    sent: true,
    sentAt: new Date().toISOString()
  });
  
  return Promise.resolve();
}

export function sendInviteEmail(email: string, inviterName: string, teamName: string): Promise<void> {
  const inviteToken = generateInviteToken();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const inviteUrl = `${baseUrl}/accept-invite?token=${inviteToken}`;
  
  console.log(`Sending invite email to ${email} from ${inviterName} for team ${teamName}`);
  console.log(`Invite URL: ${inviteUrl}`);
  
  // Mock email sending for MVP
  emailTracker.set(email, {
    sent: true,
    sentAt: new Date().toISOString()
  });
  
  return Promise.resolve();
}

export function generateInviteToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function getEmailStatus(email: string): EmailStatus | undefined {
  return emailTracker.get(email);
}

export function markUserOptOut(email: string): void {
  const status = emailTracker.get(email);
  emailTracker.set(email, {
    sent: false, // Default value
    ...status,
    optedOut: true,
    optedOutAt: new Date().toISOString()
  });
}

export function clearEmailTracker(): void {
  emailTracker.clear();
}

export async function sendThankYouEmail(email: string) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Thank you for your interest in Winston AI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Thank You!</h1>
          <p>We appreciate your interest in Winston AI. Our team will review your information and get back to you shortly.</p>
          <p>In the meantime, feel free to explore our resources:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/resources" 
               style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              View Resources
            </a>
          </div>
          <p>Best regards,<br>The Winston AI Team</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("[EmailJS ERROR]", error instanceof Error ? error.message : error);
    throw error; // Re-throw to let the caller handle it
  }
} 