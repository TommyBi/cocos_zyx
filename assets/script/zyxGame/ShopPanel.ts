import { BUTTON_COLORS, BUTTON_TEXT_COLOR, uimanager } from '../manager/UIManager';
import { cloudService, CloudProfile } from '../manager/CloudService';
import { ASSET_PATHS, getSpriteFrame, prepareReviveCardArt } from '../manager/AssetLoader';
import { zyxGameModule } from '../dataModule/ZyxGameModule';
import { createMoodBean, createMoodBeanMascot, createStaminaBolt, MOOD_COLORS } from './MoodArt';

type ShopItem = 'stamina' | 'reviveCard';
type ShopChallengeHooks = {
    staminaText: () => string;
    staminaAmount?: () => string;
    start: () => Promise<boolean>;
};
const PENDING_KEY = 'zyx_pending_tool_exchange';
const PRICES: Record<ShopItem, number> = { stamina: 3, reviveCard: 25 };
let exchanging = false;
let refreshVisibleShop: () => void = null;

function drawShopButton(node: cc.Node, color: cc.Color, width: number, height: number): void {
    const surface = node.getComponent(cc.Graphics);
    surface.clear();
    surface.fillColor = color;
    surface.strokeColor = new cc.Color(132, 123, 88);
    surface.lineWidth = 2;
    surface.roundRect(-width / 2, -height / 2, width, height, 18); surface.fill(); surface.stroke();
}

function attachReviveCard(node: cc.Node, width: number, height: number): void {
    void prepareReviveCardArt().then(() => {
        if (!cc.isValid(node, true)) return;
        const sprite = node.addComponent(cc.Sprite);
        sprite.spriteFrame = getSpriteFrame('effects', ASSET_PATHS.effects.reviveCard);
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        uimanager.fitSpriteFrameInside(node, sprite.spriteFrame, width, height);
    }).catch(error => cc.warn('[商城] 复活卡图片加载失败', error));
}

export function refreshShopPanel(): void {
    if (refreshVisibleShop) refreshVisibleShop();
}

function pendingExchange(): { actionId: string; item: ShopItem; playerId: string } | null {
    try {
        const value = JSON.parse(cc.sys.localStorage.getItem(PENDING_KEY) || 'null');
        if (!value) return null;
        if (typeof value.actionId === 'string' && value.playerId === zyxGameModule.getPlayerId()
            && ['stamina', 'reviveCard'].indexOf(value.item) >= 0) return value;
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
    const buttons: { item: ShopItem; node: cc.Node; label: cc.Label; price: cc.Label; layout: cc.Layout }[] = [];
    const showSuccess = (item: ShopItem): void => {
        refreshVisibleShop = null;
        const title = item === 'stamina' ? '体力' : '复活卡';
        const reward = uimanager.showModal('恭喜获得', '', [{
            text: '收下', color: BUTTON_COLORS.green,
            onClick: () => showShopPanel(ensureProfile, applyProfile, challenge),
        }], (panel, centerY) => {
            const art = new cc.Node('shopRewardArt');
            panel.addChild(art);
            art.setPosition(0, centerY + 134);
            if (item === 'stamina') createStaminaBolt(art, 0, 0, 138);
            else attachReviveCard(art, 148, 154);
            const name = uimanager.createLabel(panel, `${title} ×1`, 0, centerY + 22, 34, MOOD_COLORS.cocoa, 420, 48);
            name.node.name = 'shopRewardName';
            uimanager.applyTypography(name);
            uimanager.createLabel(panel, item === 'stamina' ? '兑换成功，体力已到账' : '兑换成功，已放入道具背包',
                0, centerY - 34, 24, new cc.Color(65, 111, 69), 460, 40);
        }, 180);
        reward.name = 'shopExchangeSuccess';
        drawShopButton(reward.getChildByName('panel').getChildByName('button_收下'), BUTTON_COLORS.green, 420, 72);
    };
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
        inventory.reviveCard.string = `已拥有 ${zyxGameModule.reviveCardCount} 张`;
        uimanager.applyTypography(inventory.reviveCard);
        inventory.stamina.string = challenge && challenge.staminaAmount ? challenge.staminaAmount() : '恢复后立即可用';
        const pending = pendingExchange();
        buttons.forEach(button => {
            const retry = pending && pending.item === button.item;
            // 余额不足仍可点击，按压反馈后引导挑战；只有进行中/待确认的其他交易禁用。
            const available = !exchanging && (!pending || !!retry);
            button.node.getComponent(cc.Button).interactable = available;
            const action = exchanging && retry ? '确认中…' : retry ? '继续确认' : '兑换';
            button.label.string = action;
            button.price.string = String(PRICES[button.item]);
            button.price.node.color = balance < PRICES[button.item] ? new cc.Color(189, 64, 53) : new cc.Color(40, 118, 56);
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
            if (request.playerId !== zyxGameModule.getPlayerId()) {
                throw Object.assign(new Error('账号已切换，请重新兑换'), { businessCode: 'ACCOUNT_CHANGED' });
            }
            const result = await cloudService.exchangeTool(request.actionId, request.item);
            applyProfile(result.profile);
            cc.sys.localStorage.removeItem(PENDING_KEY);
            const message = item === 'stamina' ? '体力 +1，可以继续挑战' : '复活卡 +1，已放入道具背包';
            if (root && cc.isValid(root, true) && root.activeInHierarchy) showSuccess(item);
            else uimanager.showToast(message);
        } catch (error) {
            const code = error && (error as any).businessCode;
            const permanent = ['BEANS_INSUFFICIENT', 'TOOL_REQUEST_INVALID', 'TOOL_PAYLOAD_CONFLICT', 'ACCOUNT_CHANGED'].includes(code);
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
        const items: { item: ShopItem; title: string; description: string; color: cc.Color }[] = [
            { item: 'stamina', title: '体力', description: '恢复1点体力，继续挑战', color: BUTTON_COLORS.yellow },
            { item: 'reviveCard', title: '复活卡', description: '广告复活后，再续一次机会', color: BUTTON_COLORS.green },
        ];

        const view = new cc.Node('shopScrollView');
        view.setContentSize(570, 580);
        view.setPosition(0, -24);
        panel.addChild(view);
        view.addComponent(cc.Mask).type = cc.Mask.Type.RECT;
        const scrollContent = new cc.Node('shopScrollContent');
        scrollContent.setAnchorPoint(0.5, 1);
        scrollContent.setContentSize(570, items.length * 302 - 36);
        scrollContent.setPosition(0, 290);
        view.addChild(scrollContent);
        const scroll = view.addComponent(cc.ScrollView);
        scroll.content = scrollContent;
        scroll.horizontal = false;
        scroll.vertical = true;
        scroll.inertia = true;
        scroll.elastic = true;
        items.forEach((item, index) => {
            const card = uimanager.createRect(scrollContent, `shopCard_${item.item}`, 552, 266,
                [new cc.Color(216, 231, 203), new cc.Color(209, 228, 237), new cc.Color(246, 221, 190), new cc.Color(235, 232, 208)][index], 255, 22, 0, -133 - index * 302);
            const edge = card.getComponent(cc.Graphics);
            edge.strokeColor = index ? new cc.Color(132, 165, 178) : new cc.Color(148, 169, 119);
            edge.lineWidth = 1.8;
            edge.roundRect(-275, -132, 550, 264, 22); edge.stroke();
            const pedestal = uimanager.createRect(card, 'toolPedestal', 126, 134,
                [new cc.Color(186, 210, 162), new cc.Color(178, 207, 222), new cc.Color(235, 198, 150), new cc.Color(220, 224, 188)][index], 255, 24, -194, 41);
            if (item.item === 'stamina') createStaminaBolt(pedestal, 0, 0, 96);
            else {
                const icon = new cc.Node('shopToolArt');
                pedestal.addChild(icon);
                attachReviveCard(icon, 116, 124);
            }
            const title = uimanager.createLabel(card, `${item.title} ×1`, 56, 85, 28, MOOD_COLORS.cocoa, 310, 36);
            title.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
            uimanager.applyTypography(title);
            const description = uimanager.createLabel(card, item.description, 56, 35, 20, new cc.Color(64, 100, 112), 310, 28);
            description.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
            description.enableWrapText = false;
            inventory[item.item] = uimanager.createLabel(card, '', 56, -12, 18, MOOD_COLORS.cocoa, 310, 26);
            inventory[item.item].horizontalAlign = cc.Label.HorizontalAlign.LEFT;
            const button = uimanager.createButton(card, '', 0, -84, 488, 84, item.color, () => exchange(item.item), 27);
            button.name = `shopExchange_${item.item}`;
            drawShopButton(button, item.color, 488, 84);
            button.getComponentInChildren(cc.Label).node.destroy();
            const content = new cc.Node('shopExchangeContent');
            button.addChild(content);
            content.setPosition(0, 0);
            content.setContentSize(0, 50);
            const layout = content.addComponent(cc.Layout);
            layout.type = cc.Layout.Type.HORIZONTAL;
            layout.resizeMode = cc.Layout.ResizeMode.CONTAINER;
            layout.spacingX = 12;
            const label = uimanager.createLabel(content, '', 0, 0, 27, BUTTON_TEXT_COLOR, 120, 50);
            label.node.name = 'shopPurchaseText';
            label.overflow = cc.Label.Overflow.NONE;
            label.enableWrapText = false;
            uimanager.applyTypography(label);
            label.lineHeight = 36;
            const price = uimanager.createLabel(content, '', 0, 0, 32, MOOD_COLORS.cocoa, 36, 50);
            price.node.name = 'shopPrice';
            price.overflow = cc.Label.Overflow.NONE;
            uimanager.applyTypography(price);
            const coin = createMoodBeanMascot(content, 0, 0, 50);
            coin.name = 'shopCurrencyIcon';
            coin.zIndex = label.node.zIndex;
            buttons.push({ item: item.item, node: button, label, price, layout });
        });
        status = uimanager.createLabel(panel, '', 0, -350, 19, new cc.Color(139, 111, 85), 540, 46);
    }, 500, false, true, 640);
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
