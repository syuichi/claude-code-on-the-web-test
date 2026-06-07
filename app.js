/* ===== 共有データストア ===== */
const Store = (() => {
  const VISIT_KEY = 'farm_visits';
  const PRODUCER_KEY = 'farm_producers';

  const read = key => JSON.parse(localStorage.getItem(key) || '[]');
  const write = (key, data) => localStorage.setItem(key, JSON.stringify(data));

  const genId = () => 'v' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  // 既存レコードにidが無ければ付与して永続化（マイグレーション）
  function visits() {
    const data = read(VISIT_KEY);
    let changed = false;
    data.forEach(v => { if (!v.id) { v.id = genId(); changed = true; } });
    if (changed) write(VISIT_KEY, data);
    return data;
  }

  return {
    genId,
    visits,
    saveVisits: d => write(VISIT_KEY, d),
    getVisit: id => visits().find(v => v.id === id) || null,
    upsertVisit(visit) {
      const data = visits();
      const i = data.findIndex(v => v.id === visit.id);
      if (i >= 0) data[i] = visit; else data.push(visit);
      write(VISIT_KEY, data);
    },
    deleteVisit(id) {
      write(VISIT_KEY, visits().filter(v => v.id !== id));
    },
    visitsFor: name => visits().filter(v => v.producer === name),

    producers: () => read(PRODUCER_KEY),
    saveProducers: d => write(PRODUCER_KEY, d),
  };
})();

/* ===== 共通フォーマッタ ===== */
const fmtFull = dt => dt ? new Date(dt).toLocaleString('ja-JP',
  { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', weekday: 'short' }) : '';
const fmtShort = dt => dt ? new Date(dt).toLocaleDateString('ja-JP',
  { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' }) : '';
const localNow = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
const escapeHtml = s => (s || '').replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));
