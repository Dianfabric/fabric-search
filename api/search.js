export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch(e) {} }
  const sheet = req.query.sheet || (body && body.sheet);
  const admin = req.query.admin || (body && body.admin);

  const apiKey = process.env.GOOGLE_API_KEY;
  const sheetId = process.env.SHEET_ID;
  const sheetName = sheet || '쇼룸단가표';

  if (!apiKey || !sheetId) {
    return res.status(500).json({ error: '서버 설정 오류' });
  }

  const isAdmin = admin === process.env.ADMIN_PASSWORD;

  try {
    const range = encodeURIComponent(`${sheetName}!A:I`);
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: data.error.message });
    }

    let rows = (data.values || []).slice(1);

    // 비관리자: H열(대리점가)만 마스킹, 나머지(Q열 비고 포함)는 그대로 전달
    if (!isAdmin) {
      rows = rows.map(row => {
        const newRow = [...row];
        if (newRow.length > 7) newRow[7] = '';
        return newRow;
      });
    }

    return res.status(200).json({ rows });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
