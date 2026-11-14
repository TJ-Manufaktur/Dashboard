// Cloudflare Worker: verbindet das TJ-Manufaktur-Dashboard (GitHub Pages) mit der Claude-API.
// Secrets (Cloudflare → Worker → Einstellungen → Variablen und Geheimnisse):
//   ANTHROPIC_API_KEY  – API-Schlüssel aus console.anthropic.com (Typ: Geheimnis)
//   ACCESS_KEY         – frei gewählter langer Zugangsschlüssel, den du im Dashboard einträgst (Typ: Geheimnis)
//   ALLOWED_ORIGINS    – z. B. https://tj-manufaktur.github.io (Typ: Text)
const MODELS = ['claude-sonnet-5-5', 'claude-haiku-5-5', 'claude-opus-5-5'];
const json = (obj, status, headers) => new Response(JSON.stringify(obj), { status, headers: { ...headers, 'Content-Type': 'application/json; charset=utf-8' } });
function safeEqual(a, b){
  a = String(a); b = String(b);
  let diff = a.length ^ b.length;
  for(let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}
export default {
  async fetch(req, env){
    const origin = req.headers.get('Origin') || '';
    const allowed = String(env.ALLOWED_ORIGINS || 'https://tj-manufaktur.github.io').split(',').map(s => s.trim()).filter(Boolean);
    const cors = { 'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : allowed[0], 'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Access-Control-Max-Age': '86400', 'Vary': 'Origin' };
    if(req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    const url = new URL(req.url);
    if(req.method !== 'POST' || url.pathname !== '/chat') return json({ error: 'Nicht gefunden' }, 404, cors);
    if(!allowed.includes(origin)) return json({ error: 'Herkunft nicht erlaubt' }, 403, cors);
    if(!env.ACCESS_KEY || !env.ANTHROPIC_API_KEY) return json({ error: 'Worker nicht fertig eingerichtet (Secrets fehlen)' }, 500, cors);
    if(!safeEqual(req.headers.get('Authorization') || '', 'Bearer ' + env.ACCESS_KEY)) return json({ error: 'Zugangsschlüssel falsch' }, 401, cors);
    let body; try { body = await req.json(); } catch(e){ return json({ error: 'Ungültige Anfrage' }, 400, cors); }
    const messages = (Array.isArray(body.messages) ? body.messages : [])
      .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
      .slice(-20).map(m => ({ role: m.role, content: m.content.slice(0, 20000) }));
    if(!messages.length || messages[messages.length - 1].role !== 'user') return json({ error: 'Keine Frage übermittelt' }, 400, cors);
    while(messages.length && messages[0].role !== 'user') messages.shift();
    const model = MODELS.includes(body.model) ? body.model : 'claude-sonnet-5-5';
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model, max_tokens: Math.min(Math.max(+body.max_tokens || 1500, 100), 4000), system: String(body.system || '').slice(0, 80000), messages })
    });
    const d = await r.json().catch(() => ({}));
    if(!r.ok) return json({ error: (d.error && d.error.message) || ('Claude-API-Fehler ' + r.status) }, r.status === 429 ? 429 : 502, cors);
    const text = (d.content || []).filter(c => c.type === 'text').map(c => c.text).join('\n');
    return json({ text, usage: d.usage, model: d.model }, 200, cors);
  }
};
