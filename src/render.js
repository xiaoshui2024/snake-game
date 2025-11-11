export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  // 缓冲层用于合批绘制，减少多次即时绘制造成的闪烁
  const bufCanvas = document.createElement('canvas');
  bufCanvas.width = canvas.width; bufCanvas.height = canvas.height;
  const bufCtx = bufCanvas.getContext('2d');
  let inBatch = false;
  let activeCtx = ctx;
  const TILE = 24;
  const COLS = Math.floor(canvas.width / TILE);
  const ROWS = Math.floor(canvas.height / TILE);
  const BG = '#0b1220';

  function drawCell(x, y, color) {
    activeCtx.fillStyle = color;
    activeCtx.fillRect(x * TILE + 1, y * TILE + 1, TILE - 2, TILE - 2);
  }

  function clearCell(x, y) {
    // 用背景色填充内区，不影响网格线
    drawCell(x, y, BG);
  }

  function initGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#132035';
    ctx.lineWidth = 1;
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * TILE, 0);
      ctx.lineTo(x * TILE, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * TILE);
      ctx.lineTo(canvas.width, y * TILE);
      ctx.stroke();
    }
  }

  function drawFood(pos) { if (pos) drawCell(pos.x, pos.y, '#ef4444'); }
  function drawObstacle(pos) { drawCell(pos.x, pos.y, '#64748b'); }
  function drawBody(pos) { drawCell(pos.x, pos.y, '#16a34a'); }

  function drawHead(pos, tick = 0, dir = { x: 0, y: 0 }) {
    const x = pos.x * TILE + 1;
    const y = pos.y * TILE + 1;
    const grad = activeCtx.createLinearGradient(x, y, x + TILE - 2, y + TILE - 2);
    // 绿色系动态渐变（随 tick 轻微晃动色相）
    const hue = 120 + (tick % 30); // 120~150
    grad.addColorStop(0, `hsl(${hue} 70% 35%)`);
    grad.addColorStop(1, `hsl(${hue + 10} 80% 55%)`);
    // 头部发光/阴影增强层级
    activeCtx.save();
    activeCtx.shadowColor = `hsl(${hue + 10} 90% 55% / 0.7)`;
    activeCtx.shadowBlur = 6;
    activeCtx.fillStyle = grad;
    activeCtx.fillRect(x, y, TILE - 2, TILE - 2);
    activeCtx.restore();

    // 轻微方向性拉伸/压缩的覆盖层（非插值动画，仅静态强调）
    const overlay = `hsl(${hue + 15} 85% 60% / 0.35)`;
    activeCtx.fillStyle = overlay;
    if (dir.x === 1) {
      // 向右：在右侧增加 3px 的亮条
      activeCtx.fillRect(x + (TILE - 2) - 3, y + 3, 3, (TILE - 2) - 6);
    } else if (dir.x === -1) {
      // 向左：在左侧增加 3px 的亮条
      activeCtx.fillRect(x, y + 3, 3, (TILE - 2) - 6);
    } else if (dir.y === 1) {
      // 向下：底部亮条
      activeCtx.fillRect(x + 3, y + (TILE - 2) - 3, (TILE - 2) - 6, 3);
    } else if (dir.y === -1) {
      // 向上：顶部亮条
      activeCtx.fillRect(x + 3, y, (TILE - 2) - 6, 3);
    }
  }

  // 简单两帧插值动画：在头部方向上做亮条淡入淡出
  function animateHeadTransition(prev, curr, dir) {
    const steps = [0.6, 0.3];
    let i = 0;
    function frame() {
      if (i >= steps.length) return;
      inBatch = true; activeCtx = bufCtx;
      const x = curr.x * TILE + 1;
      const y = curr.y * TILE + 1;
      const w = TILE - 2, h = TILE - 2;
      const alpha = steps[i];
      activeCtx.fillStyle = `rgba(120, 200, 120, ${alpha})`;
      if (dir.x === 1) activeCtx.fillRect(x + w - 3, y + 3, 3, h - 6);
      else if (dir.x === -1) activeCtx.fillRect(x, y + 3, 3, h - 6);
      else if (dir.y === 1) activeCtx.fillRect(x + 3, y + h - 3, w - 6, 3);
      else if (dir.y === -1) activeCtx.fillRect(x + 3, y, w - 6, 3);
      // flush
      activeCtx = ctx; inBatch = false;
      ctx.drawImage(bufCanvas, 0, 0);
      bufCtx.clearRect(0, 0, bufCanvas.width, bufCanvas.height);
      i++;
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function beginBatch() { inBatch = true; activeCtx = bufCtx; }
  function flushBatch() {
    activeCtx = ctx; inBatch = false;
    ctx.drawImage(bufCanvas, 0, 0);
    bufCtx.clearRect(0, 0, bufCanvas.width, bufCanvas.height);
  }

  function renderInitial({ food, obstacles, snake, tickCount = 0 }) {
    initGrid();
    beginBatch();
    obstacles.forEach(o => drawObstacle(o));
    if (food) drawFood(food);
    snake.forEach((s, i) => {
      const isHead = i === snake.length - 1;
      if (isHead) drawHead(s, tickCount); else drawBody(s);
    });
    flushBatch();
  }

  return { COLS, ROWS, initGrid, drawFood, drawObstacle, drawBody, drawHead, clearCell, renderInitial, beginBatch, flushBatch, animateHeadTransition };
}
