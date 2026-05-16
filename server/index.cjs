const express = require('express');
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
const app = express();
app.use(express.json());

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

app.post('/api/openai', async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    // Return a safe mock response so the UI can function without exposing a key.
    console.warn('OPENAI_API_KEY missing — returning mock response');
    return res.status(200).json({
      id: 'mock-recommendation',
      object: 'chat.completion',
      created: Date.now(),
      model: req.body?.model || 'gpt-mock',
      choices: [
        {
          message: {
            role: 'assistant',
            content:
              'Mock Recommendation: Unable to call OpenAI because server API key is not configured. Based on available data, this is a neutral recommendation — please add an API key to get a real recommendation.'
          }
        }
      ]
    });
  }

  try {
    const resp = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(req.body)
    });

    const data = await resp.json();
    res.status(resp.status).json(data);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`OpenAI proxy server listening on http://localhost:${port}`);
});
