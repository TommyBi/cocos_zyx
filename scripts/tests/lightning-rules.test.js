const test = require('node:test');
const assert = require('node:assert/strict');
const { default: BoardEngine } = require('../../server/src/boardEngine');
const piece = (id, row, col, size, extra = {}) => ({ id, row, col, size, color: id % 3 + 1,
    stampMood: 1, stampCell: 0, collectibleType: 0, collectibleCell: 0, ...extra });
function board(pieces) { const b = new BoardEngine(); b.resetBoard(742, false, 12); b.pieces = pieces; return b; }
function assertCells(b) {
    const occupied = new Set();
    assert.equal(new Set(b.pieces.map(p => p.id)).size, b.pieces.length);
    for (const p of b.pieces) for (let x = p.col; x < p.col + p.size; x++) {
        assert.ok(x >= 0 && x < 8); const key = `${p.row}:${x}`;
        assert.ok(!occupied.has(key), '碎裂后的单格不得重叠'); occupied.add(key);
    }
}
test('V14两种救场冷却30秒，旧V13仍60秒；两种道具最多各用三次', () => {
    for (const version of [13, 14]) {
        const b = new BoardEngine(); b.resetBoard(742, false, version);
        b.pieces = [piece(1, 3, 0, 1)]; b.score = 501;
        assert.ok(b.offerRoundRescue(0)); b.dismissRoundRescue();
        assert.equal(b.canOfferRoundRescue(29999), false);
        assert.equal(b.canOfferRoundRescue(30000), version === 14);
        assert.equal(b.canOfferRoundRescue(60000), true);
        for (const item of ['hammer', 'magicWand']) {
            const limit = item === 'magicWand' && version === 13 ? 1 : 3;
            for (let i = 0; i < 4; i++) {
                b.pieces = [piece(100 + i, 9, 0, 1)];
                b.hammerCount = b.colorPurifierCount = 1;
                assert.equal(item === 'hammer' ? b.useHammer(100 + i) : b.useColorPurifier(b.pieces[0].color).length > 0, i < limit);
            }
        }
    }
});
test('炸弹及重叠连锁消除闪电仍放电一次，光束只命中闭包后的幸存长块', () => {
    const b = board([piece(1, 9, 0, 1, { bomb: true }), piece(2, 8, 0, 1, { lightning: true }),
        piece(3, 8, 1, 1, { bomb: true }), piece(4, 7, 0, 1, { lightning: true }),
        piece(10, 5, 0, 3), piece(11, 4, 4, 4), piece(12, 3, 0, 2), piece(13, 2, 4, 3)]);
    const blast = b.detonateBomb(1), effects = b.takeLightningEffects();
    assert.deepEqual(effects.map(e => e.source.id), [2, 4]);
    assert.equal(effects.flatMap(e => e.targets).length, 4, '两颗闪电不对已拆成单格的长块重复处理');
    assert.equal(new Set(effects.flatMap(e => e.targets.map(t => t.original.id))).size, 4);
    assert.ok(blast.removedPieceIds.includes(2)); assert.ok(blast.removedPieceIds.includes(4));
    assert.equal(b.takeLightningEffects().length, 0); assert.ok(b.pieces.every(p => p.size === 1)); assertCells(b);
});
test('长块拆分保持颜色、占格及唯一表情、收藏物和旧炸弹，不复制奖励', () => {
    const target = piece(21, 6, 2, 3, { stampCell: 2, bomb: true, collectibleType: 7, collectibleCell: 1 });
    const b = board([piece(20, 9, 0, 1, { lightning: true }), target]); b.hammerCount = 1;
    assert.ok(b.useHammer(20)); const [effect] = b.takeLightningEffects();
    assert.equal(effect.targets[0].fragments.length, 3);
    assert.deepEqual(b.pieces.map(p => p.col), [2, 3, 4]);
    assert.equal(b.pieces.filter(p => p.stampMood > 0).length, 1);
    assert.equal(b.pieces.find(p => p.stampMood > 0).col, 4);
    assert.equal(b.pieces.filter(p => p.bomb).length, 1);
    assert.equal(b.pieces.find(p => p.bomb).col, 3);
    assert.equal(b.pieces.filter(p => p.collectibleType > 0).length, 1);
    assert.ok(b.pieces.every(p => p.color === target.color)); assertCells(b);
});
test('魔法棒移除闪电先排除同批被消除目标；没有长块时仍能结束', () => {
    const b = board([piece(1, 9, 0, 1, { lightning: true, color: 1 }), piece(2, 8, 0, 3, { color: 1 }), piece(3, 7, 5, 1, { color: 2 })]);
    b.colorPurifierCount = 1; assert.deepEqual(b.useColorPurifier(1), [1, 2]);
    assert.equal(b.takeLightningEffects()[0].targets.length, 0);
    b.resolveBoard(); b.finishPlayerAction(); assertCells(b);
});
test('连消炸弹避开全部闪电宿主，仅有闪电且无空位时不发炸弹', () => {
    const b = board([piece(50, 9, 0, 1, { lightning: true }), piece(51, 9, 1, 2)]);
    assert.equal(b.awardBomb(2).id, 51); assert.ok(!b.pieces.find(p => p.id === 50).bomb);
    b.pieces = Array.from({ length: 80 }, (_, n) => piece(n + 100, Math.floor(n / 8), n % 8, 1, { lightning: true }));
    assert.equal(b.awardBomb(2), null); assert.ok(b.pieces.every(p => !p.bomb));
});
test('累计按行在20/40行生成，出生保持静止棋盘，不参加自己的出生连锁', () => {
    const b = board([piece(1, 9, 0, 8), piece(2, 8, 0, 8), piece(3, 7, 0, 1)]);
    b.roundClearedRows = 19; b.resolveBoard(); assert.equal(b.roundClearedRows, 21);
    const rewards = b.finishPlayerAction(); assert.equal(b.pieces.filter(p => p.lightning).length, 1);
    assert.ok(rewards.some(p => p.lightning)); assert.equal(b.takeLightningEffects().length, 0);
    assert.equal(b.applyGravity().length, 0, '闪电出生不制造悬空或额外消行');
    assert.ok(b.pieces.filter(p => p.lightning).every(p => !p.bomb && p.size === 1));
    assert.deepEqual(b.finishPlayerAction(), []);
});

test('V15每10行一个闪电，V14保持20行且不重复发放', () => {
    for (const [version,before,rows,expected] of [[15,8,1,0],[15,9,1,1],[15,19,2,1],[15,9,10,1],[14,9,1,0],[14,19,1,1]]) {
        const b=board(Array.from({length:rows},(_,n)=>piece(n+1,9-n,0,8)));
        b.rulesVersion=version;b.roundClearedRows=before;
        const nextCells=b.nextPieces.reduce((total,p)=>total+p.size,0);
        b.eliminateFullRows();
        b.finishPlayerAction();
        assert.equal(b.nextPieces.filter(p=>p.lightning).length,expected,JSON.stringify({version,before,rows}));
        b.finishPlayerAction();assert.equal(b.nextPieces.filter(p=>p.lightning).length,expected);
        assert.equal(b.nextPieces.reduce((total,p)=>total+p.size,0),nextCells);
    }
});

test('V19点击闪电消耗宿主并立即放电，V18及普通色块不能使用', () => {
    const b = board([piece(101,9,0,1,{lightning:true}), piece(102,9,1,3), piece(103,9,6,1)]);
    b.rulesVersion = 18;
    assert.equal(b.activateLightning(101), null);
    b.rulesVersion = 19;
    assert.equal(b.activateLightning(102), null);
    assert.equal(b.difficultyActionCount, 0);
    b.combo = 3;
    const result = b.activateLightning(101);
    assert.deepEqual(result.removedPieceIds, [101]);
    assert.equal(result.clearedRows, 0);
    assert.equal(result.gainedScore, 32);
    assert.equal(b.score, 32);
    assert.equal(b.roundClearedRows, 0);
    assert.equal(b.takeLightningEffects().length, 1);
    assert.equal(b.activateLightning(101), null);
    assert.equal(b.difficultyActionCount, 1);
    b.finishPlayerAction();
    assert.equal(b.combo, 3);
    assertCells(b);
});

test('V19点击真实生成的闪电可重放，保留消行、补排和得分结果', () => {
    const { finishTurn } = require('../fixtures/rescue-security-helper.cjs');
    const { replayBoardEngine } = require('../../server/src/replayBoardEngine');
    const { canonicalActions } = require('../../server/src/roundProgress');
    const seed = 42;
    const b = new BoardEngine(); b.resetBoard(seed, false, 19);
    for (let turn = 0; turn < 7; turn++) {
        const hint = b.findEliminationHint();
        assert.ok(b.movePiece(hint.id, hint.offset));
        finishTurn(b);
    }
    const lightning = b.pieces.find(value => value.lightning);
    assert.ok(lightning && b.activateLightning(lightning.id));
    finishTurn(b);
    assert.ok(b.roundActions.some(action => action.type === 'lightning' && action.id === lightning.id));
    const replay = replayBoardEngine(seed, false, canonicalActions(b.roundActions), 19, false, true, true, true);
    assert.ok(replay.valid && replay.ready);
    assert.equal(replay.score, b.score);
    assert.deepEqual(replay.board.pieces, b.pieces);
    assert.deepEqual(replay.board.nextPieces, b.nextPieces);
});
test('每类普通救场四次、拒绝计次、独立爱心不占配额，旧V11仍无上限', () => {
    const b = board([piece(1, 3, 0, 1)]); b.score = 501;
    for (let i = 0; i < 8; i++) { assert.ok(b.offerRoundRescue(i * 60000)); b.dismissRoundRescue(); }
    assert.deepEqual(b.rescueOfferCounts, { balloon: 4, clear: 4 }); assert.equal(b.offerRoundRescue(480000), null);
    b.heartRescueEligible = true; b.pieces[0].row = 2; assert.ok(b.offerHeartRescue(480000));
    const old = board([piece(2, 3, 0, 1)]); old.rulesVersion = 11; old.score = 501;
    for (let i = 0; i < 20; i++) { assert.ok(old.offerRoundRescue(i * 60000)); old.dismissRoundRescue(); }
});

test('第40行无普通单格宿主时，闪电完整预告在下一排，当前棋盘保持稳定', () => {
    const b = board([piece(1, 9, 0, 8), piece(2, 8, 0, 3)]);
    b.roundClearedRows = 39; b.resolveBoard(); b.finishPlayerAction();
    assert.equal(b.roundClearedRows, 40);
    assert.equal(b.nextPieces.filter(p => p.lightning).length, 1);
    assert.ok(b.nextPieces.filter(p => p.lightning).every(p => p.size === 1));
    assert.equal(b.applyGravity().length, 0);
    assert.ok(b.appendNextRow()); assert.equal(b.pieces.filter(p => p.lightning).length, 1); assertCells(b);
});

test('V13奖励只预告在底部新排，现有块不变，升起时携带炸弹和闪电', () => {
    const b = board([piece(1, 9, 0, 8), piece(2, 8, 0, 8), piece(3, 7, 0, 1)]); b.rulesVersion = 13;
    b.roundClearedRows = 19; b.resolveBoard(); const before = structuredClone(b.pieces);
    b.finishPlayerAction(); assert.deepEqual(b.pieces, before);
    const special = b.nextPieces.filter(p => p.lightning || p.bomb);
    assert.equal(special.filter(p => p.lightning).length, 1); assert.equal(special.filter(p => p.bomb).length, 1);
    assert.ok(special.every(p => p.size === 1 && !(p.bomb && p.lightning)));
    const preview = structuredClone(special); b.appendNextRow();
    for (const expected of preview) assert.ok(b.pieces.some(p => p.row === 9 && p.col === expected.col && !!p.bomb === !!expected.bomb && !!p.lightning === !!expected.lightning));
    assertCells(b);
});

test('V13特殊块随机覆盖全部8列，不因幸存宿主扎堆两侧；原预告表情与收藏不复制', () => {
    const hist = Array(8).fill(0); const b = board([]); b.rulesVersion = 13;
    b.resetBoard(5341, false, 13); b.pieces = [];
    for (let i = 0; i < 800; i++) {
        b.nextPieces = [{ col: 0, size: 8, color: 2, stampMood: 3, stampCell: 5, collectibleType: 7, collectibleCell: 2 }];
        b.awardBomb(2); b.beginPlayerAction(); b.finishPlayerAction();
        const [special] = b.nextPieces.filter(p => p.bomb); assert.ok(special); hist[special.col]++;
        assert.equal(b.nextPieces.filter(p => p.stampMood).length, 1); assert.equal(b.nextPieces.filter(p => p.collectibleType).length, 1);
        assert.equal(b.nextPieces.reduce((n, p) => n + p.size, 0), 8);
    }
    assert.ok(hist.every(n => n >= 65 && n <= 140), JSON.stringify(hist));
    assert.ok(hist[0] + hist[7] < 260, JSON.stringify(hist));
});

test('V13随机命中五个不同块，长块保留唯一奖励拆分，单格碎除并收集一次', () => {
    const b = board([piece(1, 9, 0, 1, { lightning: true }), piece(2, 7, 0, 3, { stampCell: 1 }),
        piece(3, 6, 4, 2), piece(4, 5, 0, 1), piece(5, 4, 2, 1), piece(6, 3, 5, 1)]); b.rulesVersion = 13;
    b.hammerCount = 1; assert.ok(b.useHammer(1)); const [effect] = b.takeLightningEffects();
    assert.equal(effect.targets.length, 5); assert.equal(new Set(effect.targets.map(t => t.original.id)).size, 5);
    assert.equal(effect.targets.filter(t => t.fragments.length === 0).length, 3);
    assert.equal(b.roundCollectedMoodBeans, 3); assert.equal(b.pieces.length, 5);
    assert.equal(b.pieces.filter(p => p.stampMood).length, 2); assertCells(b);
});

test('V13命中单格炸弹仍先完成爆炸闭包，被波及闪电继续放电且无重复奖励', () => {
    const b = board([piece(1, 9, 0, 1, { lightning: true }), piece(2, 7, 1, 1, { bomb: true }),
        piece(3, 6, 1, 1, { lightning: true }), piece(4, 3, 4, 3), piece(5, 2, 0, 1)]); b.rulesVersion = 13;
    b.shuffle = items => items; b.hammerCount = 1; b.useHammer(1);
    const effects = b.takeLightningEffects(); assert.deepEqual(effects.map(e => e.source.id), [1, 3]);
    const shattered = effects[0].targets.find(t => t.original.id === 2).shattered;
    assert.equal(shattered.detonatedBombs.length, 1); assert.ok(shattered.removedPieceIds.includes(3));
    assert.equal(b.roundCollectedMoodBeans, 4); assertCells(b);
});

test('V13规则可同源重放，V12历史动作的结果保持不变', () => {
    const { replayRound } = require('../../server/src/gameEngine');
    for (const version of [12, 13]) {
        const b = new BoardEngine(); b.resetBoard(794, true, version);
        for (let i = 0; i < 3; i++) { const move = b.getTutorialMove(i); assert.ok(b.movePiece(move.id, move.offset)); b.resolveBoard(); b.finishPlayerAction(); }
        const result = replayRound(794, true, b.roundActions, version);
        assert.equal(result.valid, true); assert.equal(result.score, b.score); assert.equal(result.collectedMoodBeans, b.roundCollectedMoodBeans);
    }
});

test('V13单格闪电也可被命中，继续放电但有限终止，奖励不重复', () => {
    const b = board([piece(1, 9, 0, 1, { lightning: true }), piece(2, 7, 1, 1, { lightning: true }),
        piece(3, 5, 3, 1), piece(4, 3, 5, 2)]); b.rulesVersion = 13; b.shuffle = items => items;
    b.hammerCount = 1; assert.ok(b.useHammer(1)); const effects = b.takeLightningEffects();
    assert.deepEqual(effects.map(e => e.source.id), [1, 2]);
    assert.ok(effects[0].targets.some(t => t.original.id === 2 && t.fragments.length === 0));
    assert.equal(b.pieces.filter(p => p.lightning).length, 0);
    const removed = effects.flatMap(e => e.targets.flatMap(t => t.shattered ? t.shattered.removedPieceIds : []));
    assert.equal(new Set(removed).size, removed.length); assertCells(b);
});
