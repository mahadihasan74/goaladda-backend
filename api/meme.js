export default async function handler(req, res) {
  // ফুল ওপেন CORS সেটিংস
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // 🚀 টোকেন-লেস হাই-স্পিড আল্ট্রা-রিলিজড ইমেজ এপিআই ইঞ্জিন
    const targetUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&nologo=true&seed=${Math.floor(Math.random() * 100000)}`;

    const imgResponse = await fetch(targetUrl);

    if (!imgResponse.ok) {
      return res.status(500).json({ error: 'AI Generation Engine Down' });
    }

    const arrayBuffer = await imgResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');
    
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({ image: base64Image });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
