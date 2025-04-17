import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'
import { supabase } from '@/lib/supabase'

// Type for the expected request body
interface RequestBody {
  email: string
  replyText: string
}

// Type for the response
interface Response {
  success: boolean
  classification?: 'Interested' | 'Not Interested' | 'Needs Info'
  error?: string
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// System prompt to ensure consistent classification
const SYSTEM_PROMPT = `You are an email reply classifier. Analyze the reply and classify it into exactly one of these categories:
- Interested: Shows clear interest, wants demo, or wants to learn more
- Not Interested: Clearly declines or shows no interest
- Needs Info: Asks questions or needs clarification before deciding

Respond with ONLY the classification word, nothing else.`

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    })
  }

  try {
    // Validate request body
    const { email, replyText } = req.body as RequestBody
    if (!email || !replyText) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: email and replyText' 
      })
    }

    // Validate API key
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ 
        error: 'Server configuration error: Missing OpenAI API key' 
      })
    }

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { 
          role: 'system', 
          content: SYSTEM_PROMPT 
        },
        { 
          role: 'user', 
          content: `Classify this email reply: "${replyText}"` 
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent results
      max_tokens: 10, // We only need a single word response
    })

    // Get the classification from the response
    const classification = completion.choices[0]?.message?.content?.trim()

    // Validate classification
    if (!classification || 
        !['Interested', 'Not Interested', 'Needs Info'].includes(classification)) {
      throw new Error('Invalid classification received from OpenAI')
    }

    // Return the classification
    return res.status(200).json({
      success: true,
      classification: classification as Response['classification']
    })

  } catch (error) {
    console.error('Classification error:', error)
    return res.status(500).json({ 
      success: false,
      error: 'Failed to classify email' 
    })
  }
} 