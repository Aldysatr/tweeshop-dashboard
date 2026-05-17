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

  const { path } = req.query;
  if (!path) {
    return res.status(400).json({ error: 'No path specified' });
  }

  const queryParams = { ...req.query };
  delete queryParams.path;
  const queryString = new URLSearchParams(queryParams).toString();
  const url = `https://api.moysklad.ru/api/remap/1.2/${path}${queryString ? '?' + queryString : ''}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept-Encoding': 'gzip',
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
