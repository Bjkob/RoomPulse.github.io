export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
  if (!appsScriptUrl) {
    return res.status(500).json({ error: 'ยังไม่ได้ตั้งค่า GOOGLE_APPS_SCRIPT_URL ใน Vercel Project Settings' });
  }

  try {
    const upstream = await fetch(appsScriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body || {})
    });
    const text = await upstream.text();
    let data;
    try { data = JSON.parse(text); }
    catch (_) { throw new Error('Google Apps Script ไม่ได้ส่ง JSON กลับมา กรุณาตรวจสอบ URL และการ Deploy'); }
    if (data && data.error) return res.status(400).json({ error: data.error });
    return res.status(200).json(data);
  } catch (error) {
    console.error('RoomPulse upstream error:', error);
    return res.status(502).json({ error: error.message || 'เชื่อมต่อ Google Apps Script ไม่สำเร็จ' });
  }
}
