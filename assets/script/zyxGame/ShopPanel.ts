import { BUTTON_COLORS, uimanager } from '../manager/UIManager';
import { cloudService, CloudProfile } from '../manager/CloudService';
import { ASSET_PATHS, getSpriteFrame } from '../manager/AssetLoader';
import { zyxGameModule } from '../dataModule/ZyxGameModule';
import { createMoodBean, createStaminaBolt, MOOD_COLORS } from './MoodArt';

type ShopItem = 'hammer' | 'magicWand' | 'stamina';
type ShopChallengeHooks = {
    staminaText: () => string;
    staminaAmount?: () => string;
    start: () => Promise<boolean>;
};
const PENDING_KEY = 'zyx_pending_tool_exchange';
const PRICES: { [item in ShopItem]: number } = { hammer: 20, magicWand: 20, stamina: 5 };
let exchanging = false;
let refreshVisibleShop: () => void = null;

export function refreshShopPanel(): void {
    if (refreshVisibleShop) refreshVisibleShop();
}

function pendingExchange(): { actionId: string; item: ShopItem; playerId: string } | null {
    try {
        const value = JSON.parse(cc.sys.localStorage.getItem(PENDING_KEY) || 'null');
        if (!value) return null;
        if (typeof value.actionId === 'string' && value.playerId === zyxGameModule.getPlayerId()
            && ['hammer', 'magicWand', 'stamina'].indexOf(value.item) >= 0) return value;
        cc.sys.localStorage.removeItem(PENDING_KEY);
        return null;
    } catch (_) { return null; }
}

/** 首页商城：只消费服务端确认余额；超时请求持久化原 ID 后继续确认。 */
export function showShopPanel(ensureProfile: () => Promise<void>, applyProfile: (profile: CloudProfile) => void,
    challenge?: ShopChallengeHooks): void {
    if (exchanging) { uimanager.showToast('正在确认兑换，请稍候'); return; }
    let root: cc.Node = null;
    let status: cc.Label = null;
    const inventory: { [item: string]: cc.Label } = {};
    const buttons: { item: ShopItem; node: cc.Node; label: cc.RichText; layout: cc.Layout }[] = [];
    const showInsufficientBeans = (item: ShopItem): void => {
        const price = PRICES[item];
        if (!challenge) { uimanager.showToast(`开心豆不足，需要${price}颗才能兑换`); return; }
        let prompt: cc.Node = null;
        let staminaLabel: cc.Label = null;
        let starting = false;
        prompt = uimanager.showModal('开心豆不足', `兑换${item === 'stamina' ? '体力' : '道具'}需要${price}颗开心豆。\n是否快速开启挑战，继续收集？`, [
            { text: '返回商城', color: BUTTON_COLORS.yellow,
                onClick: () => showShopPanel(ensureProfile, applyProfile, challenge) },
            { text: '开始挑战', color: BUTTON_COLORS.green,
                onClick: async () => {
                    if (starting) return;
                    starting = true;
                    await challenge.start();
                } },
        ], (panel, centerY) => {
            staminaLabel = uimanager.createLabel(panel, challenge.staminaText(), 0, centerY + 10, 20,
                new cc.Color(89, 118, 80), 470, 44);
            staminaLabel.node.name = 'shopChallengeStamina';
        }, 60, true);
        refreshVisibleShop = () => {
            if (prompt && cc.isValid(prompt, true)) staminaLabel.string = challenge.staminaText();
        };
    };
    const refresh = (): void => {
        if (!root || !cc.isValid(root, true)) return;
        const balance = zyxGameModule.getDisplayMoodBeanBalance();
        inventory.hammer.string = `已拥有 ${zyxGameModule.hammerCount} 个`;
        inventory.magicWand.string = `已拥有 ${zyxGameModule.colorPurifierCount} 个`;
        inventory.stamina.string = challenge && challenge.staminaAmount ? challenge.staminaAmount() : '恢复后立即可用';
        const pending = pendingExchange();
        buttons.forEach(button => {
            const retry = pending && pending.item === button.item;
            // 余额不足仍可点击，按压反馈后引导挑战；只有进行中/待确认的其他交易禁用。
            const available = !exchanging && (!pending || !!retry);
            button.node.getComponent(cc.Button).interactable = available;
            const action = exchanging && retry ? '确认中…' : retry ? '继续确认' : '兑换';
            const ownedColor = balance < PRICES[button.item] ? '#BD4035' : '#287638';
            button.label.fontSize = balance >= 10000000 ? 21 : 24;
            button.label.string = `<b><color=#65463A>${action} [</color><color=${ownedColor}>${balance}</color>`
                + `<color=#65463A>/</color><color=#287638>${PRICES[button.item]}</color><color=#65463A>]</color></b>`;
            button.layout.updateLayout();
        });
        if (pending && !exchanging) status.string = '有一笔兑换待确认，点击「继续确认」即可';
        status.node.active = status.string.length > 0;
    };
    const exchange = async (item: ShopItem): Promise<void> => {
        if (exchanging) return;
        const pending = pendingExchange();
        if (pending && pending.item !== item) return;
        if (!pending && zyxGameModule.getDisplayMoodBeanBalance() < PRICES[item]) { showInsufficientBeans(item); return; }
        const request = pending || { item, playerId: zyxGameModule.getPlayerId(),
            actionId: `shop_${Date.now()}_${Math.floor(Math.random() * 1e9).toString(36)}` };
        // 存储失败时不发送请求，避免丢失未知结果的幂等凭据。
        try { cc.sys.localStorage.setItem(PENDING_KEY, JSON.stringify(request)); }
        catch (_) { uimanager.showToast('存储空间不足，暂时无法兑换'); return; }
        exchanging = true;
        status.string = '正在确认兑换…';
        refresh();
        try {
            await ensureProfile();
            const result = await cloudService.exchangeTool(request.actionId, request.item);
            applyProfile(result.profile);
            cc.sys.localStorage.removeItem(PENDING_KEY);
            const message = item === 'stamina' ? '体力 +1，可以继续挑战' : `${item === 'hammer' ? '解压锤' : '魔法棒'} +1，已放入道具背包`;
            if (root && cc.isValid(root)) status.string = message;
            uimanager.showToast(message);
        } catch (error) {
            const code = error && (error as any).businessCode;
            const permanent = ['BEANS_INSUFFICIENT', 'TOOL_REQUEST_INVALID', 'TOOL_PAYLOAD_CONFLICT'].indexOf(code) >= 0;
            if (permanent) cc.sys.localStorage.removeItem(PENDING_KEY);
            if (code === 'BEANS_INSUFFICIENT') {
                await ensureProfile();
                if (root && cc.isValid(root, true)) showInsufficientBeans(item);
                return;
            }
            const message = permanent ? (error as Error).message : '网络暂未确认，重试这笔兑换不会重复扣豆';
            if (root && cc.isValid(root)) status.string = message;
            uimanager.showToast(message);
        } finally { exchanging = false; refresh(); }
    };
    root = uimanager.showModal('商城', '', [], (panel) => {
        const items: { item: ShopItem; title: string; description: string; path: string; color: cc.Color }[] = [
            { item: 'hammer', title: '解压锤', description: '敲掉一个挡路色块', path: ASSET_PATHS.game.hammer, color: BUTTON_COLORS.yellow },
            { item: 'magicWand', title: '魔法棒', description: '消除选中颜色的所有色块', path: ASSET_PATHS.game.magicWand, color: BUTTON_COLORS.green },
            { item: 'stamina', title: '体力', description: '恢复1点体力，继续挑战', path: '', color: BUTTON_COLORS.yellow },
        ];
        items.forEach((item, index) => {
            const card = uimanager.createRect(panel, `shopCard_${item.item}`, 552, 248,
                [new cc.Color(216, 231, 203), new cc.Color(209, 228, 237), new cc.Color(246, 221, 190)][index], 255, 22, 0, 270 - index * 270);
            const edge = card.getComponent(cc.Graphics);
            edge.strokeColor = index ? new cc.Color(132, 165, 178) : new cc.Color(148, 169, 119);
            edge.lineWidth = 1.8;
            edge.roundRect(-275, -123, 550, 246, 22); edge.stroke();
            const pedestal = uimanager.createRect(card, 'toolPedestal', 112, 126,
                [new cc.Color(186, 210, 162), new cc.Color(178, 207, 222), new cc.Color(235, 198, 150)][index], 255, 24, -194, 29);
            if (item.item === 'stamina') createStaminaBolt(pedestal, 0, 0, 82);
            const icon = new cc.Node('shopToolArt');
            pedestal.addChild(icon);
            if (item.path) {
                const sprite = icon.addComponent(cc.Sprite);
                sprite.spriteFrame = getSpriteFrame('game', item.path);
                sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
                uimanager.fitSpriteFrameInside(icon, sprite.spriteFrame, 102, 112);
            }
            const title = uimanager.createLabel(card, `${item.title} ×1`, 48, 73, 28, MOOD_COLORS.cocoa, 310, 36);
            title.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
            title.enableBold = true;
            const description = uimanager.createLabel(card, item.description, 48, 23, 20, new cc.Color(64, 100, 112), 310, 28);
            description.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
            description.enableWrapText = false;
            inventory[item.item] = uimanager.createLabel(card, '', 48, -24, 18, MOOD_COLORS.cocoa, 310, 26);
            inventory[item.item].horizontalAlign = cc.Label.HorizontalAlign.LEFT;
            const button = uimanager.createButton(card, '', 0, -82, 488, 64, item.color, () => exchange(item.item), 23);
            button.name = `shopExchange_${item.item}`;
            button.getComponentInChildren(cc.Label).node.destroy();
            const content = new cc.Node('shopExchangeContent');
            button.addChild(content);
            content.setPosition(0, 2);
            content.setContentSize(0, 34);
            const layout = content.addComponent(cc.Layout);
            layout.type = cc.Layout.Type.HORIZONTAL;
            layout.resizeMode = cc.Layout.ResizeMode.CONTAINER;
            layout.spacingX = 8;
            const coin = createMoodBean(content, 1, 0, 0, 34 * 0.8);
            coin.name = 'shopCurrencyIcon';
            coin.zIndex = 0;
            const text = new cc.Node('shopPurchaseText');
            content.addChild(text);
            const label = text.addComponent(cc.RichText);
            label.fontFamily = 'PingFang SC';
            label.handleTouchEvent = false;
            label.fontSize = 24;
            label.lineHeight = 32;
            label.horizontalAlign = cc.macro.TextAlignment.CENTER;
            label.maxWidth = 0;
            buttons.push({ item: item.item, node: button, label, layout });
        });
        status = uimanager.createLabel(panel, '', 0, -449, 19, new cc.Color(139, 111, 85), 540, 46);
    }, 700, false, true, 640);
    refreshVisibleShop = refresh;
    refresh();
}

/** 与工具栏同一材质的布袋图形，避免引入风格不同的系统 emoji。 */
export function drawShopBag(parent: cc.Node): void {
    const node = new cc.Node('shopBagArt');
    parent.addChild(node);
    node.setPosition(0, 3);
    node.zIndex = 9;
    const g = node.addComponent(cc.Graphics);
    g.lineJoin = cc.Graphics.LineJoin.ROUND;
    g.lineWidth = 3;
    g.strokeColor = new cc.Color(145, 94, 49);
    g.fillColor = new cc.Color(255, 244, 207);
    g.moveTo(-25, 16); g.lineTo(25, 16); g.lineTo(30, -25);
    g.quadraticCurveTo(0, -35, -30, -25); g.close(); g.fill(); g.stroke();
    g.moveTo(-12, 15); g.bezierCurveTo(-14, 44, 14, 44, 12, 15); g.stroke();
    createMoodBean(node, 1, 0, -7, 33);
}
