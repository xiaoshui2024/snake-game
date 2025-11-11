export const randInt = (n) => Math.floor(Math.random() * n);

export const storage = {
  get(key, fallback) {
    try { const v = localStorage.getItem(key); return v == null ? fallback : JSON.parse(v); } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }
};

export const SPEED_MULTIPLIER = (ms) => {
  // 更快的速度给予更高加成
  if (ms <= 50) return 2.0;
  if (ms <= 80) return 1.5;
  if (ms <= 120) return 1.2;
  return 1.0;
};
