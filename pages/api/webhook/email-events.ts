import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';

// Types for webhook payloads
type EmailEvent = 'sent' | 'opened' | 'clicked' | 'bounced';

interface ParsedEvent {
  email: string;
  event: EmailEvent;
  metadata: Record<string, any>;
  timestamp: string;
}

interface Response {
  success: boolean;
  error?: string;
}

// Parse different webhook payloads into a standard format
function parseWebhookPayload(body: any): ParsedEvent {
  // Handle Mailgun events
  if (body.recipient && body.event) {
    return {
      email: body.recipient,
      event: body.event.toLowerCase() as EmailEvent,
      metadata: {
        provider: 'mailgun',
        messageId: body['message-id'],
        timestamp: body.timestamp,
        // Include any other Mailgun-specific data
        clientInfo: body['client-info'],
        clientType: body['client-type'],
        device: body.device,
        geolocation: body.geolocation,
        ip: body.ip,
        userAgent: body['user-agent']
      },
      timestamp: new Date(body.timestamp * 1000).toISOString()
    };
  }
  
  // Handle Resend events
  if (body.email && body.type) {
    return {
      email: body.email,
      event: body.type.toLowerCase() as EmailEvent,
      metadata: {
        provider: 'resend',
        id: body.id,
        timestamp: body.timestamp,
        // Include any other Resend-specific data
        tags: body.tags,
        url: body.url,
        ipAddress: body.ipAddress,
        userAgent: body.userAgent
      },
      timestamp: new Date(body.timestamp * 1000).toISOString()
    };
  }

  throw new Error('Unsupported webhook payload format');
}

// Verify webhook signature (implement based on your provider)
function verifyWebhookSignature(req: NextApiRequest): boolean {
  // Mailgun verification
  // const signature = req.headers['x-mailgun-signature'];
  // const token = req.headers['x-mailgun-token'];
  // return verifyMailgunSignature(signature, token);

  // Resend verification
  // const signature = req.headers['resend-signature'];
  // return verifyResendSignature(signature, process.env.RESEND_WEBHOOK_SECRET);

  // For development, return true
  return true;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    // Verify webhook signature
    if (!verifyWebhookSignature(req)) {
      console.error('Invalid webhook signature');
      return res.status(401).json({
        success: false,
        error: 'Invalid webhook signature'
      });
    }

    // Parse the webhook payload
    const parsedEvent = parseWebhookPayload(req.body);
    console.log('Processing email event:', {
      email: parsedEvent.email,
      event: parsedEvent.event,
      timestamp: parsedEvent.timestamp
    });

    // Start a Supabase transaction
    const { data: eventData, error: eventError } = await supabase
      .from('email_events')
      .insert({
        email: parsedEvent.email,
        event: parsedEvent.event,
        metadata: parsedEvent.metadata,
        created_at: parsedEvent.timestamp
      })
      .select()
      .single();

    if (eventError) {
      console.error('Failed to insert email event:', eventError);
      throw eventError;
    }

    // Update lead status
    const { error: leadError } = await supabase
      .from('leads')
      .update({ 
        status: parsedEvent.event.charAt(0).toUpperCase() + parsedEvent.event.slice(1),
        updated_at: parsedEvent.timestamp
      })
      .eq('email', parsedEvent.email);

    if (leadError) {
      console.error('Failed to update lead status:', leadError);
      throw leadError;
    }

    // Log success
    console.log(`Email event recorded successfully: ${parsedEvent.email} - ${parsedEvent.event}`);

    // Return success
    return res.status(200).json({ 
      success: true 
    });

  } catch (error) {
    console.error('Webhook error:', error);
    // Don't expose internal errors to the client
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to process webhook' 
    });
  }
}

// Disable body parsing if needed for raw webhook handling
export const config = {
  api: {
    bodyParser: true
  }
}; 