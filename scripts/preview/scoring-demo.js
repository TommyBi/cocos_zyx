(async () => {
    const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
    let game;
    for (let attempt = 0; attempt < 350; attempt++) {
        const scene = window.cc && cc.director.getScene();
        game = scene && scene.getComponentsInChildren(cc.Component).find(component => component.beanCollectionHud);
        if (game && !game.locked) break;
        await wait(100);
    }
    if (!game || game.locked) throw Error('请先通过本地 API 开局，再重试计分预览');
    const board = __require('ZyxGameModule').zyxGameModule;
    const { BOARD_RULES_VERSION } = __require('BoardEngine');
    board.cloudRoundId = '';
    game.onRoundFinished = () => {};
    game.captureProgress = () => {};
    game.tutorialStep = -1;
    game.clearTutorialGuide();
    game.firstGameBombGuide = false;
    game.playEliminationHint = () => {};
    game.updateRoundRescue = () => {};

    let pieceId;
    const piece = (row, col, size, flags = {}) => ({
        id: pieceId++, row, col, size, color: (col + row) % 7 + 1,
        stampMood: 0, stampCell: 0, collectibleType: 0, collectibleCell: 0, ...flags,
    });
    const fullRow = (row, lightning = false) => [
        piece(row, 0, 3, { lightning }), piece(row, 3, 3), piece(row, 6, 2),
    ];
    const samples = [
        { label: '消行＋双炸弹', expected: 340, startScore: 4934, play: () => {
            board.combo = 5;
            board.pieces = [piece(9,0,3), piece(9,3,3), piece(9,6,2), piece(8,0,2), piece(8,2,3)];
            board.nextPieces = [piece(9,5,1,{bomb:true}), piece(9,6,1,{bomb:true}), piece(9,7,1)];
            board.beginPlayerAction();
        }, rise: true },
        { label: '掉落连消', expected: 36, play: () => {
            board.pieces = [piece(9,0,3), piece(9,5,3), piece(8,0,2), piece(8,2,3), piece(8,5,3), piece(7,3,2)];
            board.beginPlayerAction();
        } },
        { label: '同时双消', expected: 24, play: () => {
            board.pieces = [...fullRow(9), ...fullRow(8)];
            board.beginPlayerAction();
        } },
        { label: '连锁炸弹', expected: 100, play: () => {
            board.pieces = [piece(9,0,1,{bomb:true}), piece(9,1,1,{bomb:true}), piece(9,2,2)];
            return () => board.detonateBomb(board.pieces[0].id);
        } },
        { label: '解压锤', expected: 50, play: () => {
            board.pieces = [piece(9,0,3), piece(9,4,2)];
            board.hammerCount = 1;
            return () => board.useHammer(board.pieces[0].id);
        } },
        { label: '魔法棒', expected: 200, play: () => {
            board.pieces = [piece(9,0,3,{color:1}), piece(9,4,2,{color:1}), piece(9,6,2)];
            board.colorPurifierCount = 1;
            return () => board.useColorPurifier(1);
        } },
        { label: '闪电碎裂', expected: 132, play: () => {
            board.pieces = [...fullRow(9, true), ...Array.from({length:5}, (_, index) => piece(8-index,0,3))];
            board.beginPlayerAction();
        } },
        { label: '点击闪电', interactive: true, play: () => {
            board.pieces = [piece(7,3,1,{lightning:true}), piece(9,0,3), piece(9,3,2), piece(8,3,2),
                piece(9,5,3), piece(8,5,2)];
        } },
        ...['普通气球', '暖心气球'].map((label, index) => ({ label, expected: index ? 66 : 50, play: () => {
            board.pieces = [piece(2,0,1), piece(2,1,1), piece(3,1,1), piece(9,6,1)];
            if (index) {
                board.heartRescueEligible = true;
                return () => { board.offerHeartRescue(20000); return board.applyHeartRescue(); };
            }
            return () => {
                board.offerRoundRescue(20000);
                board.dismissRoundRescue(20001);
                board.offerRoundRescue(40001);
                return board.applyBalloonRescue(40002);
            };
        } })),
        { label: '倒计时清屏', expected: 230, play: () => {
            board.pieces = [...Array.from({length:6}, (_, index) => piece(3+index,0,3)),
                piece(8,3,2), piece(9,0,2), piece(9,2,1)];
            return () => { board.offerRoundRescue(20000); return board.applyClearRescue(20001); };
        } },
    ];
    const panel = document.createElement('section');
    panel.id = 'scoring-preview';
    panel.style.cssText = 'position:fixed;z-index:99999;bottom:8px;left:50%;transform:translateX(-50%);width:min(94vw,540px);box-sizing:border-box;background:#fff7e6;color:#594034;border:1px solid #bc9977;border-radius:14px;padding:8px 10px;font:14px sans-serif;';
    const status = document.createElement('p');
    status.style.margin = '0 0 6px';
    status.setAttribute('aria-live','polite');
    status.textContent = '2026.11.19.01 · 专项演示（不提交成绩）';
    panel.append(status);
    const toolbar = document.createElement('div');
    toolbar.style.cssText = 'display:flex;gap:5px;flex-wrap:wrap';
    panel.append(toolbar);
    for (const sample of samples) {
        const button = document.createElement('button');
        button.textContent = sample.label;
        button.style.cssText = 'font:inherit;color:inherit;background:#f3e4c9;border:1px solid #c6a784;border-radius:7px;padding:5px 8px;';
        button.onclick = () => {
            for (const item of toolbar.children) item.disabled = true;
            const previous = game.rewardFeedback;
            if (previous && cc.isValid(previous)) previous.destroy();
            for (const popup of game.boardRoot.children.filter(node => node.name === 'impactScore')) popup.destroy();
            game.dismissRoundRescuePrompt(false);
            board.resetBoard(742, false, BOARD_RULES_VERSION);
            board.score = sample.startScore || 0;
            board.bestScore = Math.max(board.bestScore, board.score);
            game.locked = true;
            pieceId = 200;
            status.textContent = sample.label + ' · 结算中…';
            const activate = sample.play();
            game.renderAll();
            if (sample.interactive) {
                game.locked = false;
                status.textContent = '棋盘中下方的闪电会持续翻面，点击即可放电';
                const waitForStrike = () => {
                    if (game.locked || board.pieces.some(value => value.id === 200 && value.lightning)) {
                        setTimeout(waitForStrike, 120);
                        return;
                    }
                    status.textContent = sample.label + ' · 当前得分 ' + board.score;
                    for (const item of toolbar.children) item.disabled = false;
                };
                waitForStrike();
                return;
            }
            const finish = () => {
                const gained = board.score - (sample.startScore || 0);
                if (gained !== sample.expected) console.error('[计分演示]', sample.label, gained, sample.expected);
                board.finishPlayerAction();
                game.renderAll();
                status.textContent = sample.label + ' · 当前得分 ' + board.score;
                for (const item of toolbar.children) item.disabled = false;
            };
            const settle = () => game.resolveStableBoard(() => {
                if (!sample.rise) { finish(); return; }
                if (!board.appendTurnRows()) throw Error('演示补排失败');
                game.animateAppendedRow(() => game.resolveStableBoard(finish));
            });
            if (activate) {
                const hammerId = sample.label === '解压锤' ? board.pieces[0].id : null;
                const blast = activate();
                if (hammerId) {
                    game.updateHud();
                    game.animateHammerRemoval(hammerId, settle, board.score);
                    return;
                }
                if (sample.label === '魔法棒') {
                    game.updateHud();
                    game.playImpactScore(board.score, cc.v2(0, 0), '魔法棒');
                    game.animateColorPurifierRemoval(blast, 1, settle);
                    return;
                }
                if (sample.label === '倒计时清屏') {
                    game.updateHud();
                    game.scheduleOnce(() => game.playImpactScore(board.score, cc.v2(0, 0), '清屏'), 0.075);
                    game.playEmergencyClearEffect(blast, settle, true);
                    return;
                }
                if (blast && blast.detonatedBombs) {
                    if (sample.label === '暖心气球') {
                        for (const heart of blast.detonatedBombs) {
                            const center = game.getPiecePosition(heart.row, heart.col, heart.size);
                            __require('HeartEffect').playHeartWave(game.pieceLayer, center, __require('ZyxGameModule').CELL_SIZE);
                            game.playImpactScore(heart.score, center, '爱心');
                        }
                    } else game.animateBombBlasts(blast);
                }
                if (blast && blast.removedPieceIds) game.animateRowShatter(blast.removedPieceIds, blast.detonatedBombs);
                if (blast && blast.detonatedBombs && sample.label !== '暖心气球') {
                    const { bombResolutionDelay } = __require('BombEffect');
                    game.scheduleOnce(settle, bombResolutionDelay(blast.detonatedBombs.length));
                    return;
                }
            }
            settle();
        };
        toolbar.append(button);
    }
    document.body.append(panel);
})().catch(error => console.error('[计分演示]', error));
