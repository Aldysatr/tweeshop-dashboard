export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const token = process.env.MOYSKLAD_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'Token not configured' });
  }

  const { path, ...queryParams } = req.query;
  if (!path) {
    return res.status(400).json({ error: 'No path specified' });
  }

  // МойСклад требует формат: 2026-05-01 00:00:00 (с пробелом, не T)
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(queryParams)) {
    if (key === 'momentFrom' || key === 'momentTo') {
      params.append(key, value.replace('T', ' '));
    } else {
      params.append(key, value);
    }
  }

  const queryString = params.toString();
  const url = `https://api.moysklad.ru/api/remap/1.2/${path}${queryString ? '?' + queryString : ''}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const text = await response.text();
    try {
      const data = JSON.parse(text);
      return res.status(response.status).json(data);
    } catch {
      return res.status(response.status).send(text);
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
