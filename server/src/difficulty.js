const GRID_CONTENT_EMPTY = 0;
const GRID_CONTENT_NORMAL = 1;
const GRID_CONTENT_DIAMOND = 2;
const GRID_CONTENT_DRILL_FRAGMENT = 7;

const PROFILES = [
  { level: 1, min: 0, max: 25, targetFill: 4, weights: [30, 31, 25, 12, 2] },
  { level: 2, min: 26, max: 70, targetFill: 4, weights: [26, 29, 27, 15, 3] },
  { level: 3, min: 71, max: 150, targetFill: 5, weights: [22, 27, 29, 17, 5] },
  { level: 4, min: 151, max: 320, targetFill: 5, weights: [19, 25, 30, 20, 6] },
  { level: 5, min: 321, max: 700, targetFill: 6, weights: [16, 22, 31, 23, 8] },
  { level: 6, min: 701, max: 1400, targetFill: 6, weights: [14, 20, 30, 25, 11] },
  { level: 7, min: 1401, max: 2800, targetFill: 6, weights: [12, 18, 30, 27, 13] },
  { level: 8, min: 2801, max: 5500, targetFill: 7, weights: [10, 17, 29, 28, 16] },
  { level: 9, min: 5501, max: 10000, targetFill: 7, weights: [8, 15, 29, 30, 18] },
  { level: 10, min: 10001, max: Number.MAX_SAFE_INTEGER, targetFill: 7, weights: [7, 14, 28, 31, 20] },
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getProfile(score, generatedRows = 0) {
  const safeScore = Math.max(0, Number(score) || 0) + Math.max(0, Number(generatedRows) || 0) * 18;
  return PROFILES.find((profile) => safeScore >= profile.min && safeScore <= profile.max) || PROFILES[PROFILES.length - 1];
}

function analyzeBoard(gridInfo) {
  let occupiedCells = 0;
  let largeCells = 0;
  let firstOccupiedRow = -1;
  const rows = Array.isArray(gridInfo) ? gridInfo : [];

  for (let row = 0; row < rows.length; row++) {
    const rowData = Array.isArray(rows[row]) ? rows[row] : [];
    for (let col = 0; col < rowData.length; col++) {
      const cell = Array.isArray(rowData[col]) ? rowData[col] : [0, 0, 0];
      if (cell[1] !== GRID_CONTENT_EMPTY) {
        occupiedCells++;
        if (cell[0] >= 3) largeCells++;
        if (firstOccupiedRow === -1) firstOccupiedRow = row;
      }
    }
  }

  const totalCells = Math.max(80, rows.length * 8);
  return {
    occupiedCells,
    stackHeight: firstOccupiedRow === -1 ? 0 : rows.length - firstOccupiedRow,
    largeCellRatio: occupiedCells === 0 ? 0 : largeCells / occupiedCells,
    emptyCells: totalCells - occupiedCells,
  };
}

function shouldTriggerRelief(pressure, noMergeStreak) {
  if (pressure.stackHeight >= 7) return true;
  if (pressure.emptyCells <= 16) return true;
  return pressure.stackHeight >= 5
    && pressure.largeCellRatio >= 0.38
    && noMergeStreak >= 3;
}

function weightedSize(weights, remain) {
  const localWeights = weights.slice(0, Math.min(5, remain + 1));
  while (localWeights.length < 5) localWeights.push(0);
  const total = localWeights.reduce((sum, item) => sum + Math.max(0, item), 0);
  if (total <= 0) return 0;

  let roll = randomInt(1, total);
  for (let i = 0; i < localWeights.length; i++) {
    roll -= Math.max(0, localWeights[i]);
    if (roll <= 0) return i;
  }
  return 0;
}

function createLineSegments(weights, targetFill) {
  const segments = [];
  let cells = 0;
  let filled = 0;
  let largeSegments = 0;

  while (cells < 8) {
    const remain = 8 - cells;
    let size = weightedSize(weights, remain);

    if (filled >= targetFill && randomInt(1, 100) <= 72) size = 0;
    if (size >= 3 && largeSegments >= 2 && randomInt(1, 100) <= 75) {
      size = weightedSize([weights[0], weights[1] + 10, weights[2] + 6, 0, 0], remain);
    }
    if (size > 0 && filled + size > targetFill + 1 && randomInt(1, 100) <= 70) {
      size = remain >= 2 ? 2 : 1;
    }

    if (size <= 0) {
      segments.push(0);
      cells += 1;
    } else {
      segments.push(size);
      cells += size;
      filled += size;
      if (size >= 3) largeSegments += 1;
    }
  }

  if (filled === 0) {
    segments[randomInt(0, Math.max(0, segments.length - 1))] = 1;
  }
  return segments;
}

function pickDrillFragmentIndex(segments) {
  const filledIndexes = [];
  for (let i = 0; i < segments.length; i++) {
    if (segments[i] > 0) filledIndexes.push(i);
  }
  if (filledIndexes.length === 0) return -1;
  return filledIndexes[randomInt(0, filledIndexes.length - 1)];
}

function nextContentType(hasProducedDiamond, diamondInterval) {
  if (hasProducedDiamond) return GRID_CONTENT_NORMAL;
  if (randomInt(1, 100) <= 5 && diamondInterval > 50) {
    return GRID_CONTENT_DIAMOND;
  }
  return GRID_CONTENT_NORMAL;
}

function produceLine(input) {
  const gameInfo = input.gameInfo || {};
  const generatedRows = gameInfo.generatedRows || 0;
  const profile = getProfile(gameInfo.score || 0, generatedRows);
  const previousLevel = gameInfo.difficultyLevel || profile.level;
  const pressure = analyzeBoard(input.gridInfo || []);
  let reliefRows = Math.max(0, gameInfo.reliefRows || input.reliefRows || 0);
  const noMergeStreak = gameInfo.noMergeStreak || 0;
  let balanceTriggered = false;
  let balanceReason = '';

  if (shouldTriggerRelief(pressure, noMergeStreak)) {
    reliefRows = Math.max(reliefRows, pressure.stackHeight >= 7 || pressure.emptyCells <= 16 ? 3 : 2);
    balanceTriggered = true;
    balanceReason = '动态平衡触发';
  }

  const weights = profile.weights.slice();
  let targetFill = profile.targetFill;
  const phase = (generatedRows + profile.level) % 7;
  const comboTimes = Number(input.comboTimes || 0);

  if (reliefRows > 0) {
    weights[0] += 24;
    weights[1] += 18;
    weights[2] += 10;
    weights[3] = Math.max(2, weights[3] - 15);
    weights[4] = Math.max(0, weights[4] - 12);
    targetFill = Math.max(2, targetFill - 2);
    reliefRows -= 1;
  } else if (phase === 2 || phase === 3) {
    weights[0] = Math.max(4, weights[0] - 8);
    weights[3] += 6;
    weights[4] += 4;
    targetFill = Math.min(8, targetFill + 1);
  } else if (phase === 6) {
    weights[0] += 10;
    weights[1] += 8;
    weights[3] = Math.max(2, weights[3] - 6);
    weights[4] = Math.max(0, weights[4] - 5);
    targetFill = Math.max(2, targetFill - 1);
  }

  if (comboTimes >= 2) {
    weights[0] += 8;
    weights[1] += 8;
    weights[2] += 4;
    weights[3] = Math.max(2, weights[3] - 7);
    weights[4] = Math.max(0, weights[4] - 5);
  }

  const nextGridInfo = [];
  const segments = createLineSegments(weights, targetFill);
  const drillFragmentIndex = pickDrillFragmentIndex(segments);
  let uniqueId = Number(gameInfo.uniqueId || 9);
  let diamondInterval = Number(input.diamondInterval || 0);
  let hasProducedDiamond = false;
  let drillSpawnCharge = Math.max(0, Number(gameInfo.drillSpawnCharge || 0));
  let shouldAttachDrillFragment = drillSpawnCharge >= 5;

  for (let i = 0; i < segments.length && nextGridInfo.length < 8; i++) {
    const size = segments[i];
    if (size <= 0) {
      nextGridInfo.push([0, 0, 0]);
      continue;
    }

    let contentType = nextContentType(hasProducedDiamond, diamondInterval);
    if (shouldAttachDrillFragment && i === drillFragmentIndex) {
      contentType = GRID_CONTENT_DRILL_FRAGMENT;
      shouldAttachDrillFragment = false;
      drillSpawnCharge = Math.max(0, drillSpawnCharge - 5);
    }
    if (contentType === GRID_CONTENT_DIAMOND) {
      hasProducedDiamond = true;
      diamondInterval = 0;
    }

    uniqueId += 1;
    const safeSize = Math.min(size, 8 - nextGridInfo.length);
    for (let j = 0; j < safeSize; j++) {
      nextGridInfo.push([size, contentType, uniqueId]);
    }
  }

  while (nextGridInfo.length < 8) nextGridInfo.push([0, 0, 0]);
  diamondInterval += 1;

  return {
    nextGridInfo,
    uniqueId,
    diamondInterval,
    gameInfo: {
      ...gameInfo,
      uniqueId,
      difficultyLevel: profile.level,
      generatedRows: generatedRows + 1,
      noMergeStreak,
      reliefRows,
      clearCount: gameInfo.clearCount || 0,
      drillSpawnCharge,
      drillFragments: gameInfo.drillFragments || 0,
    },
    difficultyState: {
      level: profile.level,
      generatedRows: generatedRows + 1,
      noMergeStreak,
      reliefRows,
      balanceTriggered,
      balanceReason,
      targetFill,
      stackHeight: pressure.stackHeight,
      largeCellRatio: pressure.largeCellRatio,
      difficultyChanged: previousLevel !== profile.level,
    },
  };
}

module.exports = {
  produceLine,
};
