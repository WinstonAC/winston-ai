import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;
  
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Verify your Winston AI account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Welcome to Winston AI!</h1>
        <p>Thank you for creating an account. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Verify Email
          </a>
        </div>
        <p>If you didn't create this account, you can safely ignore this email.</p>
        <p>Best regards,<br>The Winston AI Team</p>
      </div>
    `,
  });
}

export async function sendTeamInviteEmail(email: string, teamName: string, inviteToken: string) {
  const inviteUrl = `${process.env.NEXTAUTH_URL}/accept-invite?token=${inviteToken}`;
  
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: `You've been invited to join ${teamName} on Winston AI`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Team Invitation</h1>
        <p>You've been invited to join the team "${teamName}" on Winston AI.</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${inviteUrl}" 
             style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Accept Invitation
          </a>
        </div>
        <p>If you didn't expect this invitation, you can safely ignore this email.</p>
        <p>Best regards,<br>The Winston AI Team</p>
      </div>
    `,
  });
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