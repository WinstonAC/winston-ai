import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import { supabase } from '../../lib/supabase';
import { demoFollowUp } from '@/lib/emails';

interface RequestBody {
  name: string;
  email: string;
}

interface Response {
  success: boolean;
  error?: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { name, email } = req.body as RequestBody;

    if (!name || !email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }

    // Send demo email
    const { subject, html } = demoFollowUp(name);
    await transporter.sendMail({
      from: `"Winston AI" <${process.env.FROM_EMAIL}>`,
      to: email,
      subject,
      html,
    });

    // Update Supabase
    const { error: updateError } = await supabase
      .from('leads')
      .update({ 
        status: 'Booked',
        classification: 'Interested'
      })
      .eq('email', email);

    if (updateError) throw updateError;

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Demo email error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to send demo email' 
    });
  }
} 