export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set' });

  const today = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const prompt = `Hôm nay là ${today}. Tìm kiếm dữ liệu đầu tư Việt Nam mới nhất và trả về JSON THUẦN (không có text khác):

{
  "vnindex": { "value": "...", "delta": "...", "trend": "up/down/neutral" },
  "etf": {
    "fuevn100": { "price": "...", "ytd": "...", "nav": "...", "premium": "...", "trend": "up/down/neutral" },
    "e1vfvn30": { "price": "...", "ytd": "...", "trend": "up/down/neutral" },
    "fuemav30": { "price": "...", "ytd": "...", "trend": "up/down/neutral" }
  },
  "gold": {
    "sjc": { "buy": "...", "sell": "..." },
    "doji": { "buy": "...", "sell": "..." },
    "pnj": { "buy": "...", "sell": "..." },
    "btmc": { "buy": "...", "sell": "..." }
  },
  "gold_world": "... USD/oz",
  "gold_diff": "...",
  "bds": {
    "q2": "...",
    "q9": "...",
    "binh_thanh": "...",
    "supply": "...",
    "sentiment": "..."
  },
  "news": [
    { "title": "...", "meta": "...", "tag": "hot/new/" }
  ],
  "digest": ["...", "...", "..."]
}

Tìm kiếm: giá FUEVN100/E1VFVN30/FUEMAV30 hôm nay, giá vàng nhẫn 999.9 theo chỉ tại SJC/DOJI/PNJ/BTMC, VN-Index, BĐS chung cư Quận 2/Quận 9/Bình Thạnh TP.HCM, tin tức Thanh Đa Bình Quới. Giá vàng theo chỉ = giá lượng chia 10.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'interleaved-thinking-2025-05-14'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'API error' });
    }

    const textBlock = data.content?.find(b => b.type === 'text');
    if (!textBlock) return res.status(500).json({ error: 'No text response from Claude' });

    const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(500).json({ error: 'No JSON found in response' });

    const parsed = JSON.parse(jsonMatch[0]);
    return res.status(200).json({ success: true, data: parsed, updatedAt: new Date().toISOString() });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
