import fetch from 'node-fetch';

const GROQ_API_URL = 'https://api.groq.com/v1/chat';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
  throw new Error('GROQ_API_KEY is not set in the environment variables.');
}

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function chatWithGroq(messages: GroqMessage[]): Promise<string> {
  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'groq-3b', // Change model if needed
        messages,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error communicating with Groq API:', error);
    throw error;
  }
}