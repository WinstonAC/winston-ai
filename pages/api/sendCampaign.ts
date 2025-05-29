import type { NextApiRequest, NextApiResponse } from 'next'
import nodemailer from 'nodemailer'

// Type for the expected request body
interface Lead {
  name: string
  email: string
}

interface RequestBody {
  leads: Lead[]
}

// Type for the response
interface Response {
  success: boolean
  count?: number
  error?: string
}

// Email template function
const generateEmailContent = (lead: Lead) => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'; // Fallback if not set
  return {
    subject: `${lead.name}, quick question about your business`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <p>Hi ${lead.name},</p>
        
        <p>I noticed your company and wanted to reach out. We've been helping businesses 
        like yours automate their outreach and book more calls while they sleep.</p>
        
        <p>Would you be interested in seeing a quick demo of how it works?</p>
        
        <p><a href="${siteUrl}/demo" 
          style="display: inline-block; padding: 10px 20px; background-color: black; 
          color: white; text-decoration: none; margin: 20px 0;">
          Watch 2-Minute Demo
        </a></p>
        
        <p>Best regards,<br>Winston AI</p>
      </div>
    `
  }
}

// Create transporter once
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    // Validate request body
    const body = req.body as RequestBody
    if (!body.leads || !Array.isArray(body.leads)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid request body. Expected array of leads.' 
      })
    }

    // Validate environment variables
    if (!process.env.FROM_EMAIL || !process.env.SMTP_USER) {
      return res.status(500).json({ 
        success: false, 
        error: 'Server configuration error' 
      })
    }

    // Send emails
    let successCount = 0
    
    // Process emails sequentially to avoid overwhelming the SMTP server
    for (const lead of body.leads) {
      try {
        const { subject, html } = generateEmailContent(lead)
        
        await transporter.sendMail({
          from: `"Winston AI" <${process.env.FROM_EMAIL}>`,
          to: lead.email,
          subject,
          html,
        })
        
        successCount++
        
        // Add a small delay between emails
        await new Promise(resolve => setTimeout(resolve, 200))
      } catch (error) {
        console.error(`Failed to send email to ${lead.email}:`, error)
        // Continue with next lead even if one fails
      }
    }

    // Return success response
    return res.status(200).json({
      success: true,
      count: successCount
    })

  } catch (error) {
    console.error('Campaign send error:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to send campaign' 
    })
  }
} 