export default async function handler(req, res) {
  // ⚡ CORS Headers - এটি গিটহাব থেকে আসা যেকোনো রিকোয়েস্টকে অনুমতি দেবে
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // OPTIONS রিকোয়েস্ট সাথে সাথে হ্যান্ডেল করা (Pre-flight)
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

    const hfResponse = await fetch(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1",
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
      return res.status(500).json({ error: 'AI Model Server Error' });
    }

    const buffer = await hfResponse.arrayBuffer();
    
    res.setHeader('Content-Type', 'image/jpeg');
    return res.send(Buffer.from(buffer));

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
