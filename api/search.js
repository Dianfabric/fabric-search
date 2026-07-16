async function fetchSupabaseRows() {
  const supabaseUrl = process.env.SUPABASE_FABRIC_URL || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_FABRIC_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase 설정 오류');
  }

  const base = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/fabric_price_search_rows?select=row_json&order=display_order.asc`;
  const headers = {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
  };

  const records = [];
  const pageSize = 1000;
  for (let offset = 0; ; offset += pageSize) {
    const response = await fetch(`${base}&limit=${pageSize}&offset=${offset}`, { headers });
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(detail || `Supabase 오류 (${response.status})`);
    }
    const chunk = await response.json();
    if (!Array.isArray(chunk) || chunk.length === 0) break;
    records.push(...chunk);
    if (chunk.length < pageSize) break;
  }

  return records.map((r) => (Array.isArray(r.row_json) ? r.row_json : []));
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method === 'OPTIONS') return res.status(200).end();

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) {}
  }
  const admin = req.query.admin || (body && body.admin);
  const isAdmin = admin === process.env.ADMIN_PASSWORD;

  try {
    let rows = await fetchSupabaseRows();

    // 비관리자: H열(대리점가)만 마스킹한다.
    if (!isAdmin) {
      rows = rows.map((row) => {
        const newRow = [...row];
        if (newRow.length > 7) newRow[7] = '';
        return newRow;
      });
    }

    return res.status(200).json({
      source: 'supabase',
      synced: true,
      rowCount: rows.length,
      rows,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
