import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API key');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, context = 'general' } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Create a system message based on context
    const systemMessage = context === 'analytics' 
      ? 'You are an AI assistant specialized in data analytics and business intelligence. Provide insights and analysis based on the data and questions provided.'
      : 'You are Winston, an AI assistant for sales automation. Help users with questions about lead generation, email automation, and meeting scheduling.';

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Using a more widely available model
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    if (!completion.choices[0]?.message?.content) {
      throw new Error('No response from OpenAI');
    }

    return res.status(200).json({ response: completion.choices[0].message.content });
  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({ 
      error: 'Failed to process chat message',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 