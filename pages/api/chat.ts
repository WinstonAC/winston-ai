import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

// Graceful handling of missing OpenAI API key for demo mode
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
}) : null;

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

    // If OpenAI is not configured, provide demo responses
    if (!openai) {
      const demoResponses = [
        "Hi! I'm Winston, your AI sales assistant. I can help you with lead generation, email automation, and campaign management. What would you like to know?",
        "Great question! In demo mode, I can show you how Winston AI helps automate your sales process. Try exploring the Dashboard, Campaigns, or Contacts sections!",
        "I'd love to help you with that! Winston AI specializes in automating cold outreach, lead qualification, and follow-up sequences. Check out the Campaigns page to see how it works!",
        "Thanks for trying Winston AI! I can assist with questions about lead management, email templates, and sales automation. The demo includes sample data to explore our features."
      ];
      
      const randomResponse = demoResponses[Math.floor(Math.random() * demoResponses.length)];
      return res.status(200).json({ response: randomResponse });
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