// api/transcribe.js
// Vercel Serverless Function pour transcription Whisper

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
    const { audioData, fileName } = req.body;

    if (!audioData) {
      return res.status(400).json({ error: 'Audio data required' });
    }

    // Récupérer la clé API depuis les variables d'environnement
    const openaiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiKey) {
      console.error('OPENAI_API_KEY not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Convertir base64 en Buffer
    const audioBuffer = Buffer.from(audioData, 'base64');

    // Créer FormData pour Whisper API
    const FormData = (await import('form-data')).default;
    const formData = new FormData();
    formData.append('file', audioBuffer, {
      filename: fileName || 'audio.m4a',
      contentType: 'audio/m4a',
    });
    formData.append('model', 'whisper-1');
    formData.append('language', 'fr');
    formData.append('prompt', 'Séance de coaching en français. Coach (C:) et Client (Cl:).');

    // Appel API Whisper
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        ...formData.getHeaders(),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Whisper API error:', error);
      return res.status(response.status).json({ 
        error: 'Transcription failed', 
        details: error 
      });
    }

    const result = await response.json();
    
    return res.status(200).json({ 
      text: result.text,
      success: true 
    });

  } catch (error) {
    console.error('Transcription error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
