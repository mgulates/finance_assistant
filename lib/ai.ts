import Groq from 'groq-sdk';

// Groq client - çok hızlı ve ücretsiz tier var
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

// Ollama URL (fallback)
const OLLAMA_URL = 'http://localhost:11434/api/chat';

export type AIProvider = 'groq' | 'ollama';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AIOptions {
  temperature?: number;
  maxTokens?: number;
  provider?: AIProvider;
}

// Aktif provider'ı belirle
function getActiveProvider(): AIProvider {
  if (process.env.GROQ_API_KEY) {
    return 'groq';
  }
  return 'ollama';
}

// Groq ile chat
async function chatWithGroq(messages: ChatMessage[], options: AIOptions = {}): Promise<string> {
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile', // En güçlü ücretsiz model
      messages: messages,
      temperature: options.temperature ?? 0.3,
      max_tokens: options.maxTokens ?? 2000,
    });
    
    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Groq error:', error);
    throw error;
  }
}

// Ollama ile chat
async function chatWithOllama(messages: ChatMessage[], options: AIOptions = {}): Promise<string> {
  try {
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2',
        messages: messages,
        stream: false,
        options: {
          temperature: options.temperature ?? 0.3,
          num_predict: options.maxTokens ?? 2000,
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.message?.content || '';
  } catch (error) {
    console.error('Ollama error:', error);
    throw error;
  }
}

// Ana chat fonksiyonu - otomatik provider seçimi
export async function chat(messages: ChatMessage[], options: AIOptions = {}): Promise<string> {
  const provider = options.provider || getActiveProvider();
  
  console.log(`[AI] Using provider: ${provider}`);
  
  if (provider === 'groq') {
    return chatWithGroq(messages, options);
  }
  
  return chatWithOllama(messages, options);
}

// Türkçe metni temizle
export function cleanTurkishText(text: string): string {
  const replacements: Record<string, string> = {
    'savings': 'tasarruf',
    'budget': 'bütçe',
    'expense': 'gider',
    'income': 'gelir',
    'monthly': 'aylık',
    'total': 'toplam',
    'category': 'kategori',
    'suggestion': 'öneri',
    'tip': 'ipucu',
    'goal': 'hedef',
    'analysis': 'analiz',
    'summary': 'özet',
  };
  
  let result = text;
  for (const [en, tr] of Object.entries(replacements)) {
    result = result.replace(new RegExp(en, 'gi'), tr);
  }
  
  return result;
}

// Provider durumunu kontrol et
export async function checkAIStatus(): Promise<{ provider: AIProvider; available: boolean; error?: string }> {
  const provider = getActiveProvider();
  
  try {
    if (provider === 'groq') {
      await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 5,
      });
      return { provider: 'groq', available: true };
    }
    
    const response = await fetch('http://localhost:11434/api/tags');
    if (response.ok) {
      return { provider: 'ollama', available: true };
    }
    return { provider: 'ollama', available: false, error: 'Ollama not running' };
  } catch (error) {
    return { provider, available: false, error: String(error) };
  }
}
