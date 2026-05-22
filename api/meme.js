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
    const HUGGINGFACE_TOKEN = process.env.HUGGINGFACE_TOKEN; 

    if (!HUGGINGFACE_TOKEN) {
      return res.status(500).json({ error: 'Hugging Face Token is missing.' });
    }

    // 🚀 এখানে সুপার-ফাস্ট SDXL মডেলটি ব্যাকআপ হিসেবে আপডেট করা হলো
    const hfResponse = await fetch(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
      {
        headers: { 
          Authorization: `Bearer ${HUGGINGFACE_TOKEN}`,
          "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({ inputs: prompt }),
      }
    );

    if (!hfResponse.ok) {
      const errorText = await hfResponse.text();
      return res.status(500).json({ error: 'AI Model Server Error', details: errorText });
    }

    const arrayBuffer = await hfResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');
    
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({ image: base64Image });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
