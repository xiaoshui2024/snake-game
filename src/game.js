import { randInt, SPEED_MULTIPLIER, storage } from './utils.js';

export function createGame(cols, rows) {
  const state = {
    cols, rows,
    snake: [],
    dir: { x: 1, y: 0 },
    food: null,
    obstacles: [],
    tickMs: 120,
    tickCount: 0,
    score: 0,
    paused: false,
    wrap: false,
    levelName: '经典'
  };

  function spawnInitial() {
    const cx = Math.floor(cols / 2), cy = Math.floor(rows / 2);
    state.snake = [ { x: cx - 1, y: cy }, { x: cx, y: cy } ];
    state.dir = { x: 1, y: 0 };
    state.obstacles = [];
    state.food = null; placeFood();
    state.score = 0; state.tickCount = 0;
  }

  function placeFood() {
    const occupied = new Set(state.snake.map(s => `${s.x},${s.y}`));
    state.obstacles.forEach(o => occupied.add(`${o.x},${o.y}`));
    let x, y;
    do { x = randInt(cols); y = randInt(rows); } while (occupied.has(`${x},${y}`));
    state.food = { x, y };
  }

  function placeObstacle() {
    const occupied = new Set(state.snake.map(s => `${s.x},${s.y}`));
    if (state.food) occupied.add(`${state.food.x},${state.food.y}`);
    let x, y;
    do { x = randInt(cols); y = randInt(rows); } while (occupied.has(`${x},${y}`));
    state.obstacles.push({ x, y });
  }

  function setPaused(v) { state.paused = !!v; }
  function setSpeed(ms) { state.tickMs = Math.max(40, Math.min(240, ms)); }
  function setWrap(v) { state.wrap = !!v; }
  function setLevelName(name) { state.levelName = name || '经典'; }

  function turnTo(nx, ny) {
    // 禁止直接反向
    if (nx === -state.dir.x && ny === -state.dir.y) return;
    state.dir = { x: nx, y: ny };
  }

  function stepHead(head) {
    let nx = head.x + state.dir.x;
    let ny = head.y + state.dir.y;
    if (state.wrap) {
      nx = (nx + cols) % cols;
      ny = (ny + rows) % rows;
    }
    return { x: nx, y: ny };
  }

  function tick() {
    if (state.paused) return { type: 'paused' };
    const prev = state.snake[state.snake.length - 1];
    const next = stepHead(prev);

    // 撞墙判定（非环绕）
    if (!state.wrap && (next.x < 0 || next.x >= cols || next.y < 0 || next.y >= rows)) {
      return { type: 'dead', reason: 'wall' };
    }
    // 撞到自己
    if (state.snake.some(s => s.x === next.x && s.y === next.y)) {
      return { type: 'dead', reason: 'self' };
    }
    // 障碍物
    if (state.obstacles.some(o => o.x === next.x && o.y === next.y)) {
      return { type: 'dead', reason: 'obstacle' };
    }

    // 正常移动
    state.snake.push(next);
    let ate = false;
    if (state.food && next.x === state.food.x && next.y === state.food.y) {
      ate = true; state.score += Math.round(10 * SPEED_MULTIPLIER(state.tickMs)); placeFood();
      // 适度增加障碍
      if (state.tickCount % 5 === 0) placeObstacle();
    }
    if (!ate) state.snake.shift();

    state.tickCount++;
    return { type: 'move', prev, curr: next, dir: { ...state.dir } };
  }

  function restart() { spawnInitial(); }
  function init() { spawnInitial(); }
  function stop() { /* no-op for logic */ }

  return {
    state,
    init,
    start() { setPaused(false); },
    stop,
    setPaused,
    setSpeed,
    setWrap,
    setLevelName,
    turnTo,
    tick,
    restart,
  };
}
