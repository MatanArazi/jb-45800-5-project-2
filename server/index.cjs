const express = require('express');
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
const app = express();
app.use(express.json());

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

app.post('/api/openai', async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(400).json({ error: 'Server: OPENAI_API_KEY is not set in environment.' });
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
