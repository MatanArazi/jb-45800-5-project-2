const proxyCallLlm = async (apiKey, endpoint, body) => {
    if (!endpoint) {
        throw new Error('LLM endpoint is required');
    }
    const response = await fetch('/api/llm', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ apiKey, endpoint, body })
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(`LLM proxy error: ${response.status} - ${error.error || response.statusText}`);
    }
    const data = await response.json();
    if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from LLM');
    }
    return data.choices[0].message.content;
};
export const callLlm = async (apiKey, endpoint, prompt, systemMessage = 'You are a cryptocurrency investment advisor. Provide clear, concise recommendations based on the data provided.', model = 'meta/llama-2-70b-chat') => {
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
export const callLlmBatch = async (apiKey, endpoint, prompts, systemMessage, model) => {
    return Promise.all(prompts.map((prompt) => callLlm(apiKey, endpoint, prompt, systemMessage, model)));
};
