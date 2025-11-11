export function bindInput(element, onDir) {
  const handler = (e) => {
    const k = (e.key || '').toLowerCase();
    if (k === 'arrowup' || k === 'w') onDir(0, -1);
    else if (k === 'arrowdown' || k === 's') onDir(0, 1);
    else if (k === 'arrowleft' || k === 'a') onDir(-1, 0);
    else if (k === 'arrowright' || k === 'd') onDir(1, 0);
  };
  element.addEventListener('keydown', handler);
  return () => element.removeEventListener('keydown', handler);
}
