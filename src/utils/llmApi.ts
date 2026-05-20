export interface LLMMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface LLMResponse {
  choices: Array<{
    message: LLMMessage;
    finish_reason: string;
  }>;
}

interface ProxyRequestBody {
  apiKey?: string;
  endpoint: string;
  body: any;
}

const proxyCallLlm = async (apiKey: string | null, endpoint: string, body: any): Promise<string> => {
  if (!endpoint) {
    throw new Error('LLM endpoint is required');
  }

  const response = await fetch('/api/llm', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ apiKey, endpoint, body } as ProxyRequestBody)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const message = (error as any)?.error?.message || JSON.stringify(error) || response.statusText;
    throw new Error(`LLM proxy error: ${response.status} - ${message}`);
  }

  const data = await response.json() as LLMResponse;
  if (!data.choices || data.choices.length === 0) {
    throw new Error('No response from LLM');
  }

  return data.choices[0].message.content;
};

export const callLlm = async (
  apiKey: string | null,
  endpoint: string,
  prompt: string,
  systemMessage = 'You are a cryptocurrency investment advisor. Provide clear, concise recommendations based on the data provided.',
  model = 'gpt-3.5-turbo'
): Promise<string> => {
  if (!prompt) {
    throw new Error('Prompt is required');
  }

  const body = {
    model,
    messages: [
      {
        role: 'system',
        content: systemMessage
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 1024,
    top_p: 0.9
  };

  return proxyCallLlm(apiKey, endpoint, body);
};

export const callLlmBatch = async (
  apiKey: string | null,
  endpoint: string,
  prompts: string[],
  systemMessage?: string,
  model?: string
): Promise<string[]> => {
  return Promise.all(
    prompts.map((prompt) => callLlm(apiKey, endpoint, prompt, systemMessage, model))
  );
};
