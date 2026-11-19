// 仅本地预览服务器注入；使用真实游戏绘制，演示棋盘不保存或提交成绩。
(async function () {
    const wait = () => new Promise(resolve => setTimeout(resolve, 120));
    let game;
    for (let i = 0; i < 350; i++) {
        if (window.cc && cc.director.getScene()) game = cc.director.getScene()
            .getComponentsInChildren(cc.Component).find(c => c.hammerButton && c.pieceLayer);
        if (game && !game.locked) break;
        await wait();
    }
    if (!game || game.locked) throw Error('预览尚未就绪，请刷新重试');
    const board = __require('ZyxGameModule').zyxGameModule;
    __require('RoundProgress').roundProgress.clear(board.cloudRoundId);
    board.cloudRoundId = '';
    game.captureProgress = () => {};
    game.onRoundFinished = () => {};
    game.tutorialStep = -1;
    game.firstGameBombGuide = false;
    game.clearTutorialGuide();
    game.cancelEliminationHint();
    game.dismissRoundRescuePrompt(false);
    let previewRound = 0;
    function reset() {
        if (game.locked) return;
        game.setToolSelectionMode(null);
        board.resetBoard(742 + previewRound++ * 7919, false, 15);
        board.cloudRoundId = '';
        const p = (id, row, col, size, color, extra = {}) => ({id, row, col, size, color,
            stampMood: 0, stampCell: 0, collectibleType: 0, collectibleCell: 0, ...extra});
        board.pieces = [p(100, 9, 0, 1, 1, {bomb:true}), p(101, 8, 0, 1, 2, {lightning:true}),
            p(102, 9, 3, 3, 3), p(103, 7, 4, 4, 4), p(104, 6, 1, 2, 2),
            p(105, 5, 5, 1, 2), p(106, 4, 3, 1, 3), p(107, 3, 1, 2, 4)];
        board.hammerCount = 0; board.colorPurifierCount = 0;
        board.roundToolClaims = {hammer:0, magicWand:0};
        game.renderAll();
    }
    reset();
    // 仅演示图标的点击/目标选择；不走领奖或消费接口，不触发真实广告和分享。
    game.confirmToolUse = async item => {
        if (item === 'hammer') board.hammerCount = 0;
        else board.colorPurifierCount = 0;
        board.roundToolClaims[item]++;
        return {profile:{}, roundTools:null};
    };
    game.showToolInfoModal = item => {
        if (game.locked) return;
        const hammer = item === 'hammer';
        const mode = hammer ? game.hammerMode : game.purifierMode;
        if (hammer) board.hammerCount = 1;
        else board.colorPurifierCount = 1;
        game.setToolSelectionMode(mode ? null : item);
    };
    game.requestRevive = () => { __require('UIManager').uimanager.showToast('这里仅预览按钮；广告流程请在正常游戏中体验'); game.locked = false; };
    game.requestReviveCard = async () => { __require('UIManager').uimanager.showToast('这里仅预览按钮；复活卡流程请在正常游戏中体验'); game.locked = false; };
    game.finishGame = () => { game.locked = false; reset(); };
    const bar = document.createElement('div');
    bar.style.cssText = 'position:fixed;top:4px;left:50%;transform:translateX(-50%);z-index:99999;display:flex;flex-wrap:wrap;justify-content:center;gap:5px;align-items:center;width:max-content;max-width:94vw;white-space:nowrap;background:#fffdf0f0;color:#425e63;border:1px solid #8dbbb5;border-radius:12px;padding:5px 8px;font:12px sans-serif';
    const title = document.createElement('span'); title.textContent = '效果预览 v05'; bar.appendChild(title);
    function button(text, action) {
        const b = document.createElement('button'); b.textContent = text;
        b.style.cssText = 'border:1px solid #8dbbb5;border-radius:8px;background:#edf7f2;color:#325b58;padding:4px 6px;font:12px sans-serif';
        b.onclick = action; bar.appendChild(b);
    }
    button('重置', () => { if (game.settlementReported) location.reload(); else reset(); });
    button('放电', () => { if (!game.locked) { reset(); game.useBomb(100); } });
    button('升起', () => {
        if (game.locked) return;
        reset();
        board.pieces = board.pieces.filter(p => !p.lightning && !p.bomb);
        board.pendingLightningCount = 1; board.awardBomb(2); board.beginPlayerAction(); board.finishPlayerAction();
        game.renderAll();
        setTimeout(() => { if (!game.locked) { game.locked = true; board.appendNextRow(); game.animateAppendedRow(() => { game.locked = false; }); } }, 900);
    });
    button('气球弹窗', () => { if (!game.locked) { game.balloonPhase = 'flying'; game.handleRoundRescueClick(); } });
    button('广告复活', () => { if (!game.locked) game.showReviveModal('效果体验'); });
    button('超越彩带', () => {
        if (game.locked) return;
        game.setRankExpanded(true);
        const rank = game.rankChase;
        if (rank) rank.playOvertake();
    });
    button('急救闪电', () => { if (!game.locked) {
        reset(); game.locked = true;
        __require('AudioManager').audioManager.enterScene('game');
        __require('AudioManager').audioManager.playSound('emergencyLightning');
        game.playEmergencyClearEffect([], () => { game.locked = false; });
    } });
    button('爱心消除', () => { if (!game.locked) {
        reset(); board.heartRescueEligible = true; board.pieces[0].row = 2;
        board.roundStartedAt = Date.now() - 3000; game.renderAll(); game.showWarmHeartBalloon();
        game.applyRoundRescue();
    } });
    button('追赶示例', () => {
        if (game.locked) return;
        const original = game.rankChaseEntries;
        game.rankChaseEntries = [{playerId:'preview_only_rival',nickname:'示例小熊',avatarUrl:'',rank:1,value:board.score+179}];
        game.showReviveModal('仅展示追赶文案的示例对手');
        game.rankChaseEntries = original;
    });
    button('复活卡', () => { if (!game.locked) { board.reviveCardCount = 1; game.showReviveCardModal('效果体验'); } });
    button('炸弹音效', () => __require('AudioManager').audioManager.playSound('bomb'));
    button('闪电音效', () => __require('AudioManager').audioManager.playSound('lightning'));
    button('结束音效', () => __require('AudioManager').audioManager.playGameOver());
    button('死亡结算', () => {
        if (game.locked) return;
        reset(); board.pieces[0].row = 0; board.roundSettled = false;
        game.settlementReported = false; game.renderAll();
        Object.getPrototypeOf(game).finishGame.call(game, '结束效果体验');
    });
    for (const [index, word] of ['Wow', 'Good', 'Great', 'Perfect'].entries()) {
        button(word, () => {
            const audio = __require('AudioManager').audioManager;
            audio.enterScene('game');
            game.playScoreFeedback({gainedScore: 100, combo: index + 2, clearedRows: 0, clearedRowIndexes: [], removedPieceIds: [], collectedMoodTypes: []});
        });
    }
    button('领取选中', () => { if (!game.locked) { board.colorPurifierCount = 1; game.setToolSelectionMode('magicWand'); } });
    document.body.appendChild(bar);
    window.__toolVisualPreview = game;
})().catch(error => console.error('局内效果预览:', error));
