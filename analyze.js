// api/analyze.js
// Vercel Serverless Function pour analyse Claude

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { systemPrompt, userPrompt } = req.body;

    if (!userPrompt) {
      return res.status(400).json({ error: 'User prompt required' });
    }

    // Récupérer la clé API depuis les variables d'environnement
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    
    if (!anthropicKey) {
      console.error('ANTHROPIC_API_KEY not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Appel API Claude
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8000,
        system: systemPrompt || '',
        messages: [
          { 
            role: 'user', 
            content: userPrompt 
          }
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Claude API error:', error);
      return res.status(response.status).json({ 
        error: 'Analysis failed', 
        details: error 
      });
    }

    const result = await response.json();
    
    // Extraire le texte de la réponse
    const textContent = result.content
      .filter(item => item.type === 'text')
      .map(item => item.text)
      .join('\n');

    // Parser le JSON (enlever les backticks markdown si présents)
    let jsonText = textContent.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }

    const analysisData = JSON.parse(jsonText);
    
    return res.status(200).json(analysisData);

  } catch (error) {
    console.error('Analysis error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
