/**
 * 服务端游戏引擎：与前端 ZyxGameModule.ts 完全一致的确定性模拟。
 * 使用相同种子重放操作序列，校验客户端提交的分数和心情豆是否合法。
 */

const BOARD_ROWS = 10;
const BOARD_COLS = 8;

// ---------- xorshift32 PRNG（与前端完全一致） ----------
function createRandom(seed) {
  let state = seed >>> 0;
  if (state === 0) state = 1;
  return function random() {
    let v = state | 0;
    v ^= v << 13;
    v ^= v >>> 17;
    v ^= v << 5;
    state = v >>> 0;
    return state / 0x100000000;
  };
}

// ---------- 初始棋盘（与前端 resetRound 非教学分支一致） ----------
function createInitialBoard(nextId) {
  const pieces = [];
  // createPiece(row, col, size, color, stampMood)
  // stampMood < 0 时由 random() 决定；>=0 时使用指定值
  // 前端初始棋盘有 3 个 stampMood=-1 的块，其余显式指定
  // 我们按相同顺序调用 random()
  const specs = [
    { row: 9, col: 0, size: 3, color: 8, stampMood: 8 },
    { row: 9, col: 5, size: 3, color: 6, stampMood: 0 },
    { row: 8, col: 0, size: 2, color: 2, stampMood: 2 },
    { row: 8, col: 2, size: 1, color: 9, stampMood: 0 },
    { row: 8, col: 4, size: 2, color: 1, stampMood: 1 },
    { row: 7, col: 0, size: 1, color: 3, stampMood: 3 },
    { row: 7, col: 4, size: 2, color: 7, stampMood: 0 },
  ];
  for (const s of specs) {
    pieces.push({
      id: nextId.value++,
      row: s.row, col: s.col, size: s.size, color: s.color,
      stampMood: s.stampMood, stampCell: 0,
      collectibleType: 0, collectibleCell: 0,
    });
  }
  return pieces;
}

// ---------- 教学棋盘（与前端 createTutorialBoard 一致） ----------
function createTutorialBoard(nextId) {
  const specs = [
    { row: 6, col: 1, size: 3, color: 3, stampMood: 3, stampCell: 1 },
    { row: 6, col: 4, size: 1, color: 1, stampMood: 1, stampCell: 0 },
    { row: 6, col: 5, size: 2, color: 5, stampMood: 5, stampCell: 0 },
    { row: 7, col: 3, size: 2, color: 7, stampMood: 7, stampCell: 1 },
    { row: 7, col: 5, size: 3, color: 9, stampMood: 9, stampCell: 1 },
    { row: 8, col: 0, size: 3, color: 4, stampMood: 0, stampCell: 0 },
    { row: 8, col: 3, size: 3, color: 6, stampMood: 6, stampCell: 1 },
    { row: 9, col: 0, size: 3, color: 10, stampMood: 10, stampCell: 1 },
    { row: 9, col: 4, size: 2, color: 8, stampMood: 0, stampCell: 0 },
    { row: 9, col: 6, size: 2, color: 2, stampMood: 2, stampCell: 0 },
  ];
  return specs.map(s => ({
    id: nextId.value++,
    row: s.row, col: s.col, size: s.size, color: s.color,
    stampMood: s.stampMood, stampCell: s.stampCell,
    collectibleType: 0, collectibleCell: 0,
  }));
}

// ---------- 教学下一排（固定） ----------
function createTutorialNextRow() {
  return [
    { col: 0, size: 2, color: 2, stampMood: 2, stampCell: 0, collectibleType: 0, collectibleCell: 0 },
    { col: 3, size: 1, color: 4, stampMood: 0, stampCell: 0, collectibleType: 0, collectibleCell: 0 },
    { col: 5, size: 2, color: 6, stampMood: 6, stampCell: 1, collectibleType: 0, collectibleCell: 0 },
  ];
}

// ---------- 生成下一排 ----------
function pickTargetCells(random, turn) {
  const fiveCellChance = Math.max(0, Math.min(1, (turn - 4) / 8));
  const sixCellChance = Math.max(0, Math.min(1, (turn - 13) / 10));
  if (sixCellChance > 0 && random() < sixCellChance) return 6;
  if (fiveCellChance > 0 && random() < fiveCellChance) return 5;
  return 4;
}

function pickMoodColor(random, roundClearedRows) {
  let pool = [1, 2, 3, 4, 5, 6, 1, 3, 5, 7, 8, 9, 10, 7, 9];
  if (roundClearedRows >= 12) pool = [1, 2, 2, 3, 5, 5, 6, 6];
  else if (roundClearedRows >= 7) pool = [1, 2, 3, 3, 4, 5, 5, 6, 7, 9];
  else if (roundClearedRows >= 3) pool = [1, 2, 3, 4, 5, 6, 1, 3, 5, 7, 9];
  return pool[Math.floor(random() * pool.length)];
}

function pickWeightedIndex(random, weights) {
  let total = 0;
  for (const w of weights) total += Math.max(0, w);
  if (total <= 0) return Math.floor(random() * weights.length);
  let roll = random() * total;
  for (let i = 0; i < weights.length; i++) {
    roll -= Math.max(0, weights[i]);
    if (roll <= 0) return i;
  }
  return weights.length - 1;
}

function getColumnStackHeights(pieces) {
  const heights = new Array(BOARD_COLS).fill(0);
  for (const p of pieces) {
    const stack = BOARD_ROWS - p.row;
    for (let c = p.col; c < p.col + p.size; c++) {
      if (c >= 0 && c < BOARD_COLS) heights[c] = Math.max(heights[c], stack);
    }
  }
  return heights;
}

function countMovableNextPieces(pieces) {
  let movable = 0;
  for (let i = 0; i < pieces.length; i++) {
    const p = pieces[i];
    const leftEdge = i > 0 ? pieces[i - 1].col + pieces[i - 1].size : 0;
    const rightEdge = i < pieces.length - 1 ? pieces[i + 1].col : BOARD_COLS;
    if (p.col > leftEdge || p.col + p.size < rightEdge) movable++;
  }
  return movable;
}

function createNextRowCandidate(random, targetCells, pieces, roundClearedRows) {
  const emptyCells = BOARD_COLS - targetCells;
  const sizes = [];
  let cellsLeft = targetCells;
  while (cellsLeft > 0) {
    const maxSize = Math.min(3, cellsLeft);
    const size = 1 + Math.floor(random() * maxSize);
    sizes.push(size);
    cellsLeft -= size;
  }

  const gaps = new Array(sizes.length + 1).fill(0);
  const heights = getColumnStackHeights(pieces);
  let leftPressure = 0, rightPressure = 0;
  for (let c = 0; c < BOARD_COLS; c++) {
    if (c < BOARD_COLS / 2) leftPressure += heights[c];
    else rightPressure += heights[c];
  }
  for (let i = 0; i < emptyCells; i++) {
    const weights = gaps.map((_, slot) => {
      const t = gaps.length <= 1 ? 0.5 : slot / (gaps.length - 1);
      return 1 + leftPressure * (1 - t) + rightPressure * t;
    });
    gaps[pickWeightedIndex(random, weights)]++;
  }

  const nextPieces = [];
  let col = gaps[0];
  for (let i = 0; i < sizes.length; i++) {
    const size = sizes[i];
    const color = pickMoodColor(random, roundClearedRows);
    const hasStamp = random() < 0.5;
    nextPieces.push({
      col, size, color,
      stampMood: hasStamp ? color : 0,
      stampCell: 0, collectibleType: 0, collectibleCell: 0,
    });
    col += size + gaps[i + 1];
  }
  return { pieces: nextPieces, sizes, gaps, movablePieces: countMovableNextPieces(nextPieces) };
}

function generateNextRow(random, turn, pieces, roundClearedRows) {
  const targetCells = pickTargetCells(random, turn);
  let best = null;
  let attempts = 0;
  while (attempts < 6) {
    attempts++;
    const candidate = createNextRowCandidate(random, targetCells, pieces, roundClearedRows);
    if (!best || candidate.movablePieces > best.movablePieces) best = candidate;
    if (candidate.movablePieces >= 2) { best = candidate; break; }
  }
  return best.pieces;
}

// ---------- 重力 ----------
function canOccupy(pieces, piece, row) {
  return !pieces.some(other => {
    if (other.id === piece.id || other.row !== row) return false;
    const pieceEnd = piece.col + piece.size;
    const otherEnd = other.col + other.size;
    return piece.col < otherEnd && pieceEnd > other.col;
  });
}

function applyGravity(pieces) {
  const ordered = pieces.slice().sort((a, b) => b.row - a.row);
  for (const p of ordered) {
    while (p.row < BOARD_ROWS - 1 && canOccupy(pieces, p, p.row + 1)) {
      p.row++;
    }
  }
}

// ---------- 满行消除 ----------
function findFullRows(pieces) {
  const fullRows = [];
  for (let row = 0; row < BOARD_ROWS; row++) {
    const occupied = new Array(BOARD_COLS).fill(false);
    for (const p of pieces) {
      if (p.row !== row) continue;
      for (let c = p.col; c < p.col + p.size; c++) occupied[c] = true;
    }
    if (occupied.every(v => v)) fullRows.push(row);
  }
  return fullRows;
}

function eliminateFullRows(pieces, comboState) {
  const fullRows = findFullRows(pieces);
  if (fullRows.length === 0) {
    return { clearedRows: 0, gainedScore: 0, collectedMoodTypes: [], remaining: pieces };
  }
  const rowSet = {};
  fullRows.forEach(r => rowSet[r] = true);
  const removedPieces = pieces.filter(p => rowSet[p.row]);
  const collectedMoodTypes = removedPieces.filter(p => p.stampMood > 0).map(p => p.stampMood);
  const remaining = pieces.filter(p => !rowSet[p.row]);
  if (!comboState.cleared) {
    comboState.count = Math.min(5, comboState.count + 1);
    comboState.cleared = true;
    if (comboState.count === 4) comboState.pendingBomb = true;
  }
  return { clearedRows: fullRows.length, gainedScore: fullRows.length * 10 * comboState.count, collectedMoodTypes, remaining };
}

function awardBomb(pieces, nextId, clearedRows) {
  if (clearedRows < 2) return;
  let target = pieces.filter(p => !p.bomb).sort((a, b) => b.row - a.row || a.col - b.col || a.id - b.id)[0];
  if (!target) {
    for (let row = BOARD_ROWS - 1; row >= 0 && !target; row--) {
      for (let col = 0; col < BOARD_COLS && !target; col++) {
        if (pieces.some(p => p.row === row && col >= p.col && col < p.col + p.size)) continue;
        target = { id: nextId.value++, row, col, size: 1, color: 1, stampMood: 0, stampCell: 0, collectibleType: 0, collectibleCell: 0 };
        pieces.push(target);
      }
    }
  }
  if (target) target.bomb = true;
}

function detonateBomb(pieces, id) {
  const bomb = pieces.find(p => p.id === id && p.bomb);
  if (!bomb) return null;
  const col = bomb.col + bomb.size / 2;
  const removed = pieces.filter(p => p.id === id || (Math.abs(p.row - bomb.row) <= 1 && p.col < col + 1.5 && p.col + p.size > col - 1.5));
  return { pieces: pieces.filter(p => !removed.includes(p)), collectedMoodBeans: removed.filter(p => p.stampMood > 0).length };
}

function resolveBoard(pieces, nextId, comboState) {
  let clearedRows = 0, gainedScore = 0, collectedMoodBeans = 0;
  let current = pieces;
  while (true) {
    applyGravity(current);
    const result = eliminateFullRows(current, comboState);
    if (result.clearedRows === 0) break;
    clearedRows += result.clearedRows;
    gainedScore += result.gainedScore;
    collectedMoodBeans += result.collectedMoodTypes.length;
    current = result.remaining;
  }
  awardBomb(current, nextId, clearedRows);
  if (comboState.pendingBomb) {
    comboState.pendingBomb = false;
    awardBomb(current, nextId, 2);
  }
  return { pieces: current, clearedRows, gainedScore, collectedMoodBeans };
}

// ---------- 移动 ----------
function getMoveRange(pieces, id) {
  const piece = pieces.find(p => p.id === id);
  if (!piece) return { min: 0, max: 0 };
  let minCol = 0, maxCol = BOARD_COLS - piece.size;
  for (const other of pieces) {
    if (other.id === id || other.row !== piece.row) continue;
    if (other.col + other.size <= piece.col) minCol = Math.max(minCol, other.col + other.size);
    else if (other.col >= piece.col + piece.size) maxCol = Math.min(maxCol, other.col - piece.size);
  }
  return { min: minCol - piece.col, max: maxCol - piece.col };
}

function movePiece(pieces, id, offset) {
  const piece = pieces.find(p => p.id === id);
  if (!piece || offset === 0) return false;
  const range = getMoveRange(pieces, id);
  const safeOffset = Math.max(range.min, Math.min(range.max, offset));
  if (safeOffset === 0) return false;
  piece.col += safeOffset;
  return true;
}

// ---------- 推进一行 ----------
function appendNextRow(pieces, nextPieces, nextId) {
  if (pieces.some(p => p.row === 0)) return null;
  for (const p of pieces) p.row--;
  for (const next of nextPieces) {
    pieces.push({
      id: nextId.value++,
      row: BOARD_ROWS - 1, col: next.col, size: next.size, color: next.color,
      stampMood: next.stampMood, stampCell: next.stampCell,
      collectibleType: next.collectibleType, collectibleCell: next.collectibleCell,
    });
  }
  return pieces;
}

// ---------- 道具 ----------
function useHammer(pieces, id) {
  return pieces.filter(p => p.id !== id);
}

function useColorPurifier(pieces, color) {
  return pieces.filter(p => p.color !== color);
}

function removeTopRows(pieces, rowCount) {
  const firstPreservedRow = Math.max(0, Math.min(BOARD_ROWS, Math.floor(rowCount)));
  return pieces.filter(p => p.row >= firstPreservedRow);
}

// ---------- 主重放函数 ----------
/**
 * 用种子重放一局游戏，校验操作序列。
 *
 * @param {number} seed - 随机种子（开局时由服务端生成并返回给客户端）
 * @param {boolean} isTutorial - 是否教学局
 * @param {Array} actions - 操作序列，每项为 { type: string, ...params }
 * @returns {{ score: number, collectedMoodBeans: number, valid: boolean }}
 */
function replayRound(seed, isTutorial, actions, rulesVersion) {
  const version = rulesVersion === undefined ? (actions[0]?.type === 'rules' ? actions[0].version : 1) : rulesVersion;
  if (version === 2 || version === 3 || version === 4 || version === 5) return require('./replayBoardEngine').replayBoardEngine(seed, isTutorial, actions, version);
  if (version !== 1 || actions[0]?.type === 'rules') return { score: -1, collectedMoodBeans: -1, valid: false };
  const random = createRandom(seed);
  const nextId = { value: 1 };

  // 初始化棋盘
  let pieces, nextPieces;
  if (isTutorial) {
    pieces = createTutorialBoard(nextId);
    nextPieces = createTutorialNextRow();
  } else {
    pieces = createInitialBoard(nextId);
    nextPieces = generateNextRow(random, 0, pieces, 0);
  }

  let score = 0;
  let roundClearedRows = 0;
  let roundCollectedMoodBeans = 0;
  let turn = 0;
  const comboState = { count: 0, cleared: false, pendingBomb: false };

  for (const action of actions) {
    // append 是当前操作的自动补排，不另开操作，也不打断已产生的连消。
    if (action.type !== 'append') {
      if (!comboState.cleared) comboState.count = 0;
      comboState.cleared = false;
    }
    switch (action.type) {
      case 'move': {
        const moved = movePiece(pieces, action.id, action.offset);
        if (!moved) return { score: -1, collectedMoodBeans: -1, valid: false };
        const result = resolveBoard(pieces, nextId, comboState);
        pieces = result.pieces;
        score += result.gainedScore;
        roundClearedRows += result.clearedRows;
        roundCollectedMoodBeans += result.collectedMoodBeans;
        break;
      }
      case 'hammer': {
        pieces = useHammer(pieces, action.id);
        const result = resolveBoard(pieces, nextId, comboState);
        pieces = result.pieces;
        score += result.gainedScore;
        roundClearedRows += result.clearedRows;
        roundCollectedMoodBeans += result.collectedMoodBeans;
        break;
      }
      case 'bomb': {
        const blast = detonateBomb(pieces, action.id);
        if (!blast) return { score: -1, collectedMoodBeans: -1, valid: false };
        const result = resolveBoard(blast.pieces, nextId, comboState);
        pieces = result.pieces;
        score += result.gainedScore;
        roundClearedRows += result.clearedRows;
        roundCollectedMoodBeans += blast.collectedMoodBeans + result.collectedMoodBeans;
        break;
      }
      case 'purify': {
        pieces = useColorPurifier(pieces, action.color);
        const result = resolveBoard(pieces, nextId, comboState);
        pieces = result.pieces;
        score += result.gainedScore;
        roundClearedRows += result.clearedRows;
        roundCollectedMoodBeans += result.collectedMoodBeans;
        break;
      }
      case 'revive': {
        pieces = removeTopRows(pieces, action.rowCount || 8);
        const result = resolveBoard(pieces, nextId, comboState);
        pieces = result.pieces;
        score += result.gainedScore;
        roundClearedRows += result.clearedRows;
        roundCollectedMoodBeans += result.collectedMoodBeans;
        break;
      }
      case 'clear': {
        pieces = [];
        break;
      }
      case 'append': {
        const appended = appendNextRow(pieces, nextPieces, nextId);
        if (!appended) return { score, collectedMoodBeans: roundCollectedMoodBeans, valid: true };
        pieces = appended;
        turn++;
        nextPieces = generateNextRow(random, turn, pieces, roundClearedRows);
        // 推进后自动重力+消除
        const result = resolveBoard(pieces, nextId, comboState);
        pieces = result.pieces;
        score += result.gainedScore;
        roundClearedRows += result.clearedRows;
        roundCollectedMoodBeans += result.collectedMoodBeans;
        break;
      }
      default:
        return { score: -1, collectedMoodBeans: -1, valid: false };
    }
  }

  return { score, collectedMoodBeans: roundCollectedMoodBeans, valid: true };
}

module.exports = { replayRound };
