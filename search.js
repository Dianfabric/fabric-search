export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { sheet } = req.query;
  const apiKey = process.env.GOOGLE_API_KEY;
  const sheetId = process.env.SHEET_ID;
  const sheetName = sheet || 'Sheet1';

  if (!apiKey || !sheetId) {
    return res.status(500).json({ error: '서버 설정 오류' });
  }

  try {
    const range = encodeURIComponent(`${sheetName}!A:E`);
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: data.error.message });
    }

    const rows = (data.values || []).slice(1);
    return res.status(200).json({ rows });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
