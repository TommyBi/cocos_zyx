import { BUTTON_COLORS, uimanager } from '../manager/UIManager';
import { cloudService } from '../manager/CloudService';
import { ASSET_PATHS, getEffectAsset, getRealmSpriteFrame } from '../manager/AssetLoader';
import { zyxGameModule } from '../dataModule/ZyxGameModule';
import { MOOD_COLORS } from './MoodArt';
import { audioManager } from '../manager/AudioManager';

/** 用户提供的单幅画作实际尺寸。 */
export const ALBUM_ART_WIDTH = 750;
export const ALBUM_ART_HEIGHT = 1000;
export const ALBUM_COVER_WIDTH = 280;
export const ALBUM_COVER_HEIGHT = 350;

const SHELF_CARD_X = 112;
const SHELF_FIRST_CARD_Y = -228;
const SHELF_CARD_STEP_Y = 392;
const CAROUSEL_SIDE_SCALE = 0.76;
const CAROUSEL_SIDE_OPACITY = 152;
const LOCKED_ART_BLUR_RADIUS = 72;

const PENDING_REALM_UNLOCKS_KEY = 'zyx_pending_realm_unlocks';

type PendingRealmUnlock = {
    id: string;
    cost: number;
};

let pendingRealmSync: Promise<void> = null;

export type AlbumArtDef = {
    id: string;
    title: string;
    cost: number;
    imagePath: string;
};

export type AlbumDef = {
    id: string;
    title: string;
    theme: string;
    description: string;
    coverPath: string;
    unlockCost: number;
    accent: cc.Color;
    arts: AlbumArtDef[];
};

type AlbumSeed = {
    id: string;
    title: string;
    theme: string;
    description: string;
    coverPath: string;
    artFolder: string;
    artCount: number;
    accent: cc.Color;
};

const ALBUM_SEEDS: AlbumSeed[] = [
    {
        id: 'album_season',
        title: '四季物语',
        theme: '四季里的温柔片刻',
        description: '从春花到冬雪，收藏每一次相遇',
        coverPath: ASSET_PATHS.realm.firstCover,
        artFolder: 'albums/art/theme_1',
        artCount: 48,
        accent: new cc.Color(189, 112, 74),
    },
    {
        id: 'album_city',
        title: '京城掠影',
        theme: '城市与旧时光',
        description: '沿着城墙与街巷，慢慢看见北京',
        coverPath: ASSET_PATHS.realm.secondCover,
        artFolder: 'albums/art/theme_2',
        artCount: 12,
        accent: new cc.Color(70, 103, 116),
    },
];

function buildAlbums(): AlbumDef[] {
    return ALBUM_SEEDS.map((seed, albumIndex) => ({
        id: seed.id,
        title: seed.title,
        theme: seed.theme,
        description: seed.description,
        coverPath: seed.coverPath,
        unlockCost: albumIndex === 0 ? 1 : (albumIndex === 1 ? 10 : 30),
        accent: seed.accent,
        arts: Array.from({ length: seed.artCount }, (_, index) => ({
            id: `${seed.id}_art_${index}`,
            title: `${seed.title} · ${String(index + 1).padStart(2, '0')}`,
            cost: albumIndex === 0 ? index + 1 : (albumIndex === 1 ? 20 : 30),
            imagePath: `${seed.artFolder}/pic_${index + 1}`,
        })),
    }));
}

export const ART_ALBUMS: AlbumDef[] = buildAlbums();

export function getAlbumById(albumId: string): AlbumDef | null {
    return ART_ALBUMS.find((album) => album.id === albumId) || null;
}

export function isAlbumUnlocked(album: AlbumDef): boolean {
    return zyxGameModule.isAlbumUnlocked(album.id);
}

export function isArtUnlocked(artId: string): boolean {
    return zyxGameModule.getUnlockedAlbumArts()[artId] === true;
}

export function countUnlockedArts(album: AlbumDef): number {
    const unlocked = zyxGameModule.getUnlockedAlbumArts();
    let count = 0;
    for (const art of album.arts) {
        if (!unlocked[art.id]) break;
        count += 1;
    }
    return count;
}

function readPendingRealmUnlocks(): PendingRealmUnlock[] {
    const raw = cc.sys.localStorage.getItem(PENDING_REALM_UNLOCKS_KEY);
    if (!raw) return [];
    try {
        const value = JSON.parse(raw);
        if (!Array.isArray(value)) return [];
        return value.filter((item) => item && typeof item.id === 'string' && Number(item.cost) > 0);
    } catch (error) {
        return [];
    }
}

function writePendingRealmUnlocks(items: PendingRealmUnlock[]): void {
    cc.sys.localStorage.setItem(PENDING_REALM_UNLOCKS_KEY, JSON.stringify(items));
}

function queueRealmUnlock(id: string, cost: number): void {
    const pending = readPendingRealmUnlocks();
    if (!pending.some((item) => item.id === id)) pending.push({ id, cost });
    writePendingRealmUnlocks(pending);
    flushPendingRealmUnlocks().catch(() => undefined);
}

function flushPendingRealmUnlocks(): Promise<void> {
    if (pendingRealmSync) return pendingRealmSync;
    pendingRealmSync = (async () => {
        const pending = readPendingRealmUnlocks();
        for (const item of pending) {
            try {
                const profile = await cloudService.unlockPuzzlePiece(item.id, item.cost);
                zyxGameModule.applyCloudProfile(profile);
                writePendingRealmUnlocks(readPendingRealmUnlocks().filter((candidate) => candidate.id !== item.id));
            } catch (error) {
                // 离线时保留本地解锁和待同步项，下次进入秘境继续重试。
                return;
            }
        }
    })().then(() => {
        pendingRealmSync = null;
    }, () => {
        pendingRealmSync = null;
    });
    return pendingRealmSync;
}

/** 进入秘境时拉齐服务端解锁项，并补交离线期间的开心瓶消费。 */
export async function syncRealmCloudState(): Promise<void> {
    await flushPendingRealmUnlocks();
    try {
        const pieces = await cloudService.getPuzzleUnlocks();
        pieces.forEach((pieceId) => {
            if (pieceId.indexOf('album:') === 0) {
                zyxGameModule.unlockAlbum(pieceId.slice('album:'.length), 0);
            } else if (pieceId.indexOf('art:') === 0) {
                zyxGameModule.unlockAlbumArt(pieceId.slice('art:'.length), 0);
            }
        });
    } catch (error) {
        // 云端不可用不阻断本地画册。
    }
}

type AlbumShelfOptions = {
    screen: cc.Node;
    onBack: () => void;
    onOpenAlbum: (albumId: string) => void;
    drawMiniBottle: (parent: cc.Node, x: number, y: number) => void;
};

export function renderAlbumShelf(options: AlbumShelfOptions): void {
    const { screen, onBack, onOpenAlbum, drawMiniBottle } = options;
    const width = screen.width;
    const height = screen.height;
    const safeArea = uimanager.getSafeAreaMetrics();
    const safeTop = Math.max(44, safeArea.top + 12);
    drawShelfBackdrop(screen);

    const headerY = height / 2 - safeTop - 58;
    const title = uimanager.createLabel(screen, '解忧秘境', 0, headerY + 8, 42, MOOD_COLORS.cocoa, 330, 56);
    title.node.zIndex = 220;
    const subtitleY = Math.max(-height / 2 + 50, -height / 2 + safeArea.bottom + 34);
    const subtitle = uimanager.createLabel(screen, '把美好的时光，一册一册收好', 0, subtitleY, 23, MOOD_COLORS.cocoaSoft, 460, 38);
    subtitle.node.zIndex = 220;

    const back = uimanager.createButton(
        screen,
        '‹ 返回',
        -width / 2 + safeArea.left + 68,
        -height / 2 + safeArea.bottom + 44,
        112,
        50,
        BUTTON_COLORS.green,
        onBack,
        19,
    );
    back.zIndex = 240;

    const bottleHud = uimanager.createRect(
        screen,
        'realmBottleCount',
        144,
        50,
        new cc.Color(255, 248, 226),
        248,
        19,
        0,
        headerY - 48,
    );
    bottleHud.zIndex = 230;
    drawMiniBottle(bottleHud, -48, 0);
    uimanager.createLabel(bottleHud, `× ${zyxGameModule.happyBottleCount}`, 19, 1, 19, MOOD_COLORS.cocoa, 78, 30);

    const viewportTop = headerY - 82;
    const footerReserve = 82;
    const viewportHeight = viewportTop + height / 2 - safeArea.bottom - footerReserve;
    const viewport = new cc.Node('albumShelfViewport');
    viewport.width = width;
    viewport.height = viewportHeight;
    viewport.setPosition(0, -height / 2 + safeArea.bottom + footerReserve + viewportHeight / 2);
    viewport.zIndex = 100;
    screen.addChild(viewport);
    const viewportMask = viewport.addComponent(cc.Mask);
    viewportMask.type = cc.Mask.Type.RECT;

    const content = new cc.Node('albumShelfContent');
    content.width = width;
    const finalCardY = SHELF_FIRST_CARD_Y - Math.max(0, ART_ALBUMS.length - 1) * SHELF_CARD_STEP_Y;
    content.height = Math.max(viewportHeight + 2, Math.abs(finalCardY) + ALBUM_COVER_HEIGHT / 2 + 170);
    content.setAnchorPoint(0.5, 1);
    content.setPosition(0, viewportHeight / 2);
    viewport.addChild(content);

    const scrollView = viewport.addComponent(cc.ScrollView);
    scrollView.content = content;
    scrollView.horizontal = false;
    scrollView.vertical = true;
    scrollView.inertia = true;
    scrollView.brake = 0.78;
    scrollView.elastic = true;

    drawGalleryPath(content);
    ART_ALBUMS.forEach((album, index) => {
        createAlbumCoverCard(content, album, index, onOpenAlbum, drawMiniBottle);
    });

    if (ART_ALBUMS.length < 3) {
        const noteY = SHELF_FIRST_CARD_Y - ART_ALBUMS.length * SHELF_CARD_STEP_Y + 100;
        const note = uimanager.createLabel(content, '更多画册，正在整理中…', 0, noteY, 16, new cc.Color(107, 88, 72), 320, 28);
        note.node.opacity = 150;
    }
}

function drawShelfBackdrop(screen: cc.Node): void {
    const veil = uimanager.createRect(
        screen,
        'realmPaperVeil',
        screen.width,
        screen.height,
        new cc.Color(255, 248, 230),
        172,
    );
    veil.zIndex = 5;

    const ornaments = new cc.Node('realmBackdropOrnaments');
    ornaments.width = screen.width;
    ornaments.height = screen.height;
    ornaments.zIndex = 8;
    screen.addChild(ornaments);
    const g = ornaments.addComponent(cc.Graphics);
    g.strokeColor = new cc.Color(164, 116, 67, 34);
    g.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
        const inset = 32 + i * 22;
        g.ellipse(0, -screen.height * 0.06, screen.width - inset * 2, screen.height * 0.72 - i * 34);
        g.stroke();
    }
}

function drawGalleryPath(content: cc.Node): void {
    const path = new cc.Node('albumGalleryPath');
    path.zIndex = 2;
    content.addChild(path);
    const g = path.addComponent(cc.Graphics);
    g.strokeColor = new cc.Color(197, 148, 66, 92);
    g.lineWidth = 4;
    if (ART_ALBUMS.length > 0) {
        g.moveTo(-88, -72);
        for (let index = 0; index < ART_ALBUMS.length; index++) {
            const x = index % 2 === 0 ? -SHELF_CARD_X : SHELF_CARD_X;
            const y = SHELF_FIRST_CARD_Y - index * SHELF_CARD_STEP_Y;
            g.quadraticCurveTo(-x * 0.6, y + 95, x, y);
        }
        g.stroke();
    }
    ART_ALBUMS.forEach((_, index) => {
        const x = index % 2 === 0 ? -SHELF_CARD_X : SHELF_CARD_X;
        const y = SHELF_FIRST_CARD_Y - index * SHELF_CARD_STEP_Y;
        g.fillColor = new cc.Color(223, 176, 84, 150);
        g.circle(x, y, 7);
        g.fill();
        g.fillColor = new cc.Color(255, 247, 222, 230);
        g.circle(x, y, 3);
        g.fill();
    });
}

function createAlbumCoverCard(
    content: cc.Node,
    album: AlbumDef,
    index: number,
    onOpenAlbum: (albumId: string) => void,
    drawMiniBottle: (parent: cc.Node, x: number, y: number) => void,
): void {
    const x = index % 2 === 0 ? -SHELF_CARD_X : SHELF_CARD_X;
    const y = SHELF_FIRST_CARD_Y - index * SHELF_CARD_STEP_Y;
    const unlocked = isAlbumUnlocked(album);

    const shadow = uimanager.createRect(
        content,
        `albumShadow_${album.id}`,
        ALBUM_COVER_WIDTH + 14,
        ALBUM_COVER_HEIGHT + 14,
        new cc.Color(62, 42, 32),
        48,
        24,
        x + 8,
        y - 11,
    );
    shadow.zIndex = 8 + index * 2;

    const card = uimanager.createRect(
        content,
        `albumCard_${album.id}`,
        ALBUM_COVER_WIDTH + 10,
        ALBUM_COVER_HEIGHT + 10,
        new cc.Color(255, 247, 226),
        255,
        23,
        x,
        y,
    );
    card.zIndex = 10 + index * 2;
    mountResourceSprite(card, 'albumCover', album.coverPath, ALBUM_COVER_WIDTH, ALBUM_COVER_HEIGHT, 0, 0, 2);
    drawCoverBorder(card, album.accent);

    if (unlocked) {
        const progress = countUnlockedArts(album);
        const progressPill = uimanager.createRect(
            card,
            'albumProgress',
            224,
            52,
            new cc.Color(255, 249, 232),
            245,
            18,
            0,
            -137,
        );
        progressPill.zIndex = 30;
        uimanager.createLabel(progressPill, `已解锁  ${progress} / ${album.arts.length}`, 0, 1, 18, new cc.Color(48, 111, 74), 204, 30);
        card.addComponent(cc.Button);
        bindPressAnimation(card, () => onOpenAlbum(album.id));
        return;
    }

    const maskNode = uimanager.createRect(
        card,
        'albumDarkMask',
        ALBUM_COVER_WIDTH,
        ALBUM_COVER_HEIGHT,
        new cc.Color(18, 16, 14),
        255,
        20,
    );
    maskNode.zIndex = 20;
    maskNode.opacity = 132;
    const lockNode = mountResourceSprite(
        card,
        'albumLock',
        ASSET_PATHS.realm.lock,
        ALBUM_COVER_WIDTH / 2,
        ALBUM_COVER_HEIGHT / 2,
        0,
        28,
        31,
        undefined,
    );

    const enough = zyxGameModule.happyBottleCount >= album.unlockCost;
    const action = uimanager.createRect(
        card,
        'albumUnlockAction',
        224,
        52,
        new cc.Color(255, 249, 232),
        250,
        18,
        0,
        -137,
    );
    action.zIndex = 40;
    uimanager.drawButtonSurface(action, 224, 52, new cc.Color(255, 241, 204), 18);
    drawMiniBottle(action, -82, 0);
    const actionColor = enough ? new cc.Color(44, 143, 82) : new cc.Color(216, 82, 73);
    uimanager.createLabel(action, `开心瓶 × ${album.unlockCost}  解锁`, 18, 1, 17, actionColor, 178, 30);
    let unlocking = false;
    card.addComponent(cc.Button);
    bindPressAnimation(card, () => {
        if (unlocking) return;
        if (!zyxGameModule.unlockAlbum(album.id, album.unlockCost)) {
            shakeLock(lockNode);
            const missing = Math.max(0, album.unlockCost - zyxGameModule.happyBottleCount);
            uimanager.showToast(`开心瓶不足，还差 ${missing} 个`);
            return;
        }
        unlocking = true;
        queueRealmUnlock(`album:${album.id}`, album.unlockCost);
        const button = card.getComponent(cc.Button);
        if (button) button.interactable = false;
        revealAlbumCover(card, lockNode, maskNode, action, () => onOpenAlbum(album.id));
    });
}

function drawCoverBorder(card: cc.Node, accent: cc.Color): void {
    const border = new cc.Node('albumCoverBorder');
    border.zIndex = 22;
    card.addChild(border);
    const g = border.addComponent(cc.Graphics);
    g.strokeColor = new cc.Color(accent.r, accent.g, accent.b, 188);
    g.lineWidth = 2.2;
    g.roundRect(-ALBUM_COVER_WIDTH / 2 + 1, -ALBUM_COVER_HEIGHT / 2 + 1, ALBUM_COVER_WIDTH - 2, ALBUM_COVER_HEIGHT - 2, 20);
    g.stroke();
}

function bindPressAnimation(node: cc.Node, onTap: () => void): void {
    node.on(cc.Node.EventType.TOUCH_START, () => {
        cc.Tween.stopAllByTarget(node);
        cc.tween(node).to(0.07, { scale: 0.96 }).start();
    }, node);
    node.on(cc.Node.EventType.TOUCH_END, () => {
        cc.Tween.stopAllByTarget(node);
        cc.tween(node).to(0.14, { scale: 1 }, { easing: 'backOut' }).call(onTap).start();
    }, node);
    node.on(cc.Node.EventType.TOUCH_CANCEL, () => {
        cc.Tween.stopAllByTarget(node);
        cc.tween(node).to(0.1, { scale: 1 }).start();
    }, node);
}

function shakeLock(lockNode: cc.Node): void {
    if (!lockNode || !cc.isValid(lockNode)) return;
    cc.Tween.stopAllByTarget(lockNode);
    cc.tween(lockNode)
        .to(0.07, { angle: -9 })
        .to(0.07, { angle: 9 })
        .to(0.07, { angle: -7 })
        .to(0.07, { angle: 7 })
        .to(0.08, { angle: 0 }, { easing: 'backOut' })
        .start();
}

function revealAlbumCover(
    card: cc.Node,
    lockNode: cc.Node,
    maskNode: cc.Node,
    action: cc.Node,
    onDone: () => void,
): void {
    shakeLock(lockNode);
    cc.tween(lockNode)
        .delay(0.34)
        .to(0.22, { scale: 0.18, opacity: 0 }, { easing: 'backIn' })
        .start();
    cc.tween(maskNode)
        .delay(0.22)
        .to(0.65, { opacity: 0 }, { easing: 'sineOut' })
        .start();
    cc.tween(action).to(0.24, { opacity: 0, y: -147 }).start();
    cc.tween(card)
        .delay(0.56)
        .to(0.15, { scale: 1.045 }, { easing: 'sineOut' })
        .to(0.18, { scale: 1 }, { easing: 'backOut' })
        .call(onDone)
        .start();
}

export type AlbumViewOptions = {
    screen: cc.Node;
    albumId: string;
    artIndex: number;
    onBackToShelf: () => void;
    onShowArt: (artIndex: number) => void;
    onArrowPressStart: (direction: number) => void;
    onArrowPressEnd: (direction: number) => boolean;
    onArrowNavigatorReady: (navigate: (direction: number) => void) => void;
    drawMiniBottle: (parent: cc.Node, x: number, y: number) => void;
};

/** 三联画展台：当前画作居中，两侧露出缩小的前后画作，支持横向滑动。 */
export function renderAlbumView(options: AlbumViewOptions): void {
    const album = getAlbumById(options.albumId);
    if (!album || !isAlbumUnlocked(album)) {
        uimanager.showToast('请先在秘境中解锁这本画册');
        options.onBackToShelf();
        return;
    }

    const { screen, onBackToShelf, onShowArt, drawMiniBottle } = options;
    const width = screen.width;
    const height = screen.height;
    const safeArea = uimanager.getSafeAreaMetrics();
    const safeTop = Math.max(24, safeArea.top);
    const artIndex = Math.max(0, Math.min(album.arts.length - 1, options.artIndex));
    const art = album.arts[artIndex];
    const unlockedCount = countUnlockedArts(album);
    const currentUnlocked = artIndex < unlockedCount;
    const canUnlockCurrent = !currentUnlocked && artIndex === unlockedCount;
    createAlbumBackdrop(screen, album.accent);

    const topBarHeight = 118 + safeTop;
    const topBarControlY = -safeTop / 2 - 4;
    const topBar = uimanager.createRect(
        screen,
        'albumTopBar',
        width,
        topBarHeight,
        new cc.Color(255, 247, 226),
        248,
        0,
        0,
        height / 2 - topBarHeight / 2,
    );
    topBar.zIndex = 200;
    uimanager.createLabel(topBar, album.title, 0, topBarControlY + 13, 26, MOOD_COLORS.cocoa, 310, 34);
    uimanager.createLabel(topBar, `已解锁 ${unlockedCount} / ${album.arts.length}`, 0, topBarControlY - 19, 15, album.accent, 260, 24);
    const bottleHud = uimanager.createRect(
        topBar,
        'albumBottleHud',
        126,
        42,
        new cc.Color(255, 251, 238),
        255,
        16,
        width / 2 - safeArea.right - 76,
        topBarControlY,
    );
    drawMiniBottle(bottleHud, -40, 0);
    uimanager.createLabel(bottleHud, `× ${zyxGameModule.happyBottleCount}`, 20, 0, 16, MOOD_COLORS.cocoa, 70, 26);

    const progressTrack = uimanager.createRect(topBar, 'albumProgressTrack', 230, 6, new cc.Color(208, 194, 169), 170, 3, 0, topBarControlY - 39);
    const progressWidth = Math.max(8, 230 * unlockedCount / Math.max(1, album.arts.length));
    const progressFill = uimanager.createRect(progressTrack, 'albumProgressFill', progressWidth, 6, album.accent, 255, 3, -115 + progressWidth / 2, 0);
    progressFill.zIndex = 2;

    const footerHintY = -height / 2 + safeArea.bottom + 32;
    const actionY = footerHintY + 66;
    const pageY = actionY + 70;
    const contentTop = height / 2 - topBarHeight - 24;
    const artTitleY = contentTop - 16;
    const artTopLimit = artTitleY - 28;
    const artBottomLimit = pageY + 34;
    const availableArtHeight = Math.max(400, artTopLimit - artBottomLimit);
    const displayW = Math.min(width * 0.92, availableArtHeight * ALBUM_ART_WIDTH / ALBUM_ART_HEIGHT);
    const displayH = displayW * ALBUM_ART_HEIGHT / ALBUM_ART_WIDTH;
    const stageY = (artTopLimit + artBottomLimit) / 2;
    const sideOffset = displayW * 0.76;
    const artTitle = uimanager.createLabel(screen, art.title, 0, artTitleY, 18, new cc.Color(235, 224, 204), 430, 28);
    artTitle.node.zIndex = 108;
    drawGalleryPedestal(screen, displayW, displayH, stageY, album.accent);

    const track = new cc.Node('artCarouselTrack');
    track.width = width;
    track.height = displayH + 80;
    track.setPosition(0, stageY);
    track.zIndex = 40;
    screen.addChild(track);

    let currentItem: cc.Node = null;
    [-1, 0, 1].forEach((offset) => {
        const index = artIndex + offset;
        if (index < 0 || index >= album.arts.length) return;
        const item = createGalleryArtItem(
            track,
            album.arts[index],
            displayW,
            displayH,
            offset,
            sideOffset,
            index < unlockedCount,
        );
        if (offset === 0) currentItem = item;
    });

    const indexPill = uimanager.createRect(
        screen,
        'artIndexPill',
        126,
        38,
        new cc.Color(255, 248, 228),
        244,
        16,
        0,
        pageY,
    );
    indexPill.zIndex = 110;
    uimanager.createLabel(indexPill, `${String(artIndex + 1).padStart(2, '0')} / ${String(album.arts.length).padStart(2, '0')}`, 0, 0, 15, MOOD_COLORS.cocoa, 110, 24);

    const navigate = bindCarouselGestures(screen, track, artIndex, album.arts.length, displayH, sideOffset, onShowArt);
    options.onArrowNavigatorReady(navigate);
    const arrowInset = 38;
    createCarouselArrow(
        screen,
        -width / 2 + safeArea.left + arrowInset,
        stageY,
        -1,
        artIndex === 0,
        album.accent,
        navigate,
        options,
    );
    createCarouselArrow(
        screen,
        width / 2 - safeArea.right - arrowInset,
        stageY,
        1,
        artIndex === album.arts.length - 1,
        album.accent,
        navigate,
        options,
    );

    if (canUnlockCurrent) {
        const enough = zyxGameModule.happyBottleCount >= art.cost;
        const action = uimanager.createRect(
            screen,
            'unlockArtAction',
            286,
            58,
            new cc.Color(255, 248, 228),
            255,
            20,
            0,
            actionY,
        );
        action.zIndex = 130;
        uimanager.drawButtonSurface(action, 286, 58, new cc.Color(255, 235, 188), 20);
        drawMiniBottle(action, -106, 0);
        const labelColor = enough ? new cc.Color(44, 143, 82) : new cc.Color(216, 82, 73);
        uimanager.createLabel(action, `开心瓶 × ${art.cost}  解锁`, 18, 0, 18, labelColor, 234, 30);
        action.addComponent(cc.Button);
        let revealing = false;
        action.on(cc.Node.EventType.TOUCH_END, () => {
            if (revealing) return;
            if (countUnlockedArts(album) !== artIndex) {
                shakeGalleryArtLock(currentItem);
                uimanager.showToast('请按顺序点亮画作');
                onShowArt(artIndex);
                return;
            }
            if (!zyxGameModule.unlockAlbumArt(art.id, art.cost)) {
                shakeGalleryArtLock(currentItem);
                uimanager.showToast(`开心瓶不足，还差 ${art.cost - zyxGameModule.happyBottleCount} 个`);
                return;
            }
            revealing = true;
            queueRealmUnlock(`art:${art.id}`, art.cost);
            const button = action.getComponent(cc.Button);
            if (button) button.interactable = false;
            if (currentItem) {
                animateLockedArtReveal(currentItem, () => {
                    uimanager.showToast('画作已点亮');
                    onShowArt(artIndex);
                });
            } else {
                onShowArt(artIndex);
            }
        }, action);
    } else if (!currentUnlocked) {
        const nextNumber = Math.min(album.arts.length, unlockedCount + 1);
        const sequenceHint = uimanager.createLabel(
            screen,
            `请先点亮第 ${String(nextNumber).padStart(2, '0')} 幅`,
            0,
            actionY,
            16,
            new cc.Color(205, 193, 172),
            320,
            28,
        );
        sequenceHint.node.zIndex = 130;
    } else {
        const unlockedPill = uimanager.createRect(
            screen,
            'unlockedArtStatus',
            116,
            36,
            new cc.Color(album.accent.r, album.accent.g, album.accent.b),
            178,
            16,
            0,
            actionY,
        );
        unlockedPill.zIndex = 130;
        uimanager.createLabel(unlockedPill, '已点亮', 0, 0, 16, new cc.Color(255, 247, 226), 100, 26);
    }

    const navigationHint = uimanager.createLabel(
        screen,
        '点击箭头切换 · 长按连续翻看',
        0,
        footerHintY,
        15,
        new cc.Color(205, 193, 172),
        380,
        26,
    );
    navigationHint.node.zIndex = 130;
    const back = uimanager.createButton(
        screen,
        '‹ 画册',
        -width / 2 + safeArea.left + 70,
        footerHintY,
        116,
        48,
        BUTTON_COLORS.green,
        onBackToShelf,
        18,
    );
    back.zIndex = 220;
}

function createCarouselArrow(
    screen: cc.Node,
    x: number,
    y: number,
    direction: number,
    disabled: boolean,
    accent: cc.Color,
    navigate: (delta: number) => void,
    options: AlbumViewOptions,
): void {
    const arrow = uimanager.createRect(
        screen,
        direction < 0 ? 'previousArtArrow' : 'nextArtArrow',
        58,
        72,
        new cc.Color(255, 248, 228),
        disabled ? 72 : 224,
        27,
        x,
        y,
    );
    arrow.zIndex = 128;

    const border = new cc.Node('arrowBorder');
    border.zIndex = 2;
    arrow.addChild(border);
    const borderGraphics = border.addComponent(cc.Graphics);
    borderGraphics.strokeColor = new cc.Color(accent.r, accent.g, accent.b, disabled ? 66 : 178);
    borderGraphics.lineWidth = 2;
    borderGraphics.roundRect(-28, -35, 56, 70, 26);
    borderGraphics.stroke();

    const chevron = new cc.Node('arrowChevron');
    chevron.zIndex = 3;
    arrow.addChild(chevron);
    const chevronGraphics = chevron.addComponent(cc.Graphics);
    chevronGraphics.strokeColor = new cc.Color(79, 68, 59, disabled ? 78 : 235);
    chevronGraphics.lineWidth = 4.5;
    chevronGraphics.lineCap = cc.Graphics.LineCap.ROUND;
    const tipX = direction < 0 ? -5 : 5;
    const tailX = direction < 0 ? 6 : -6;
    chevronGraphics.moveTo(tailX, 11);
    chevronGraphics.lineTo(tipX, 0);
    chevronGraphics.lineTo(tailX, -11);
    chevronGraphics.stroke();

    if (disabled) return;
    arrow.addComponent(cc.Button);
    arrow.on(cc.Node.EventType.TOUCH_START, (event: cc.Event.EventTouch) => {
        event.stopPropagation();
        cc.Tween.stopAllByTarget(arrow);
        cc.tween(arrow).to(0.08, { scale: 0.91 }).start();
        options.onArrowPressStart(direction);
    }, arrow);
    arrow.on(cc.Node.EventType.TOUCH_END, (event: cc.Event.EventTouch) => {
        event.stopPropagation();
        cc.Tween.stopAllByTarget(arrow);
        cc.tween(arrow).to(0.14, { scale: 1 }, { easing: 'backOut' }).start();
        if (options.onArrowPressEnd(direction)) navigate(direction);
    }, arrow);
    arrow.on(cc.Node.EventType.TOUCH_CANCEL, () => {
        cc.Tween.stopAllByTarget(arrow);
        cc.tween(arrow).to(0.1, { scale: 1 }).start();
    }, arrow);
}

function createGalleryArtItem(
    track: cc.Node,
    art: AlbumArtDef,
    displayW: number,
    displayH: number,
    offset: number,
    sideOffset: number,
    unlocked: boolean,
): cc.Node {
    const item = new cc.Node(`galleryArt_${art.id}`);
    item.width = displayW + 16;
    item.height = displayH + 16;
    item.setPosition(offset * sideOffset, 0);
    item.scale = offset === 0 ? 1 : CAROUSEL_SIDE_SCALE;
    item.opacity = offset === 0 ? 255 : CAROUSEL_SIDE_OPACITY;
    item.zIndex = offset === 0 ? 30 : 10;
    (item as any).galleryOffset = offset;
    track.addChild(item);

    const shadow = uimanager.createRect(item, 'artShadow', displayW + 12, displayH + 12, new cc.Color(7, 12, 14), 42, 12, 4, -6);
    shadow.zIndex = 1;
    const paper = uimanager.createRect(item, 'artPaper', displayW + 14, displayH + 14, new cc.Color(255, 248, 230), 255, 9);
    paper.zIndex = 2;
    mountResourceSprite(
        item,
        'artSprite',
        art.imagePath,
        displayW,
        displayH,
        0,
        0,
        4,
        unlocked ? undefined : (sprite) => applyLockedArtBlur(item, sprite),
    );

    if (!unlocked) {
        const veil = new cc.Node('lockedArtVeil');
        veil.width = displayW;
        veil.height = displayH;
        veil.zIndex = 20;
        item.addChild(veil);
        const mist = uimanager.createRect(veil, 'lockedArtMist', displayW, displayH, new cc.Color(229, 223, 214), 124, 5);
        mist.zIndex = 1;
        if (offset === 0) {
            (item as any).lockedArtLock = mountResourceSprite(
                veil,
                'lockedArtIcon',
                ASSET_PATHS.realm.lock,
                210,
                263,
                0,
                24,
                2,
                undefined,
            );
        }
        (item as any).lockedVeil = veil;
    }
    return item;
}

function shakeGalleryArtLock(item: cc.Node): void {
    if (!item || !cc.isValid(item)) return;
    shakeLock((item as any).lockedArtLock);
}

function applyLockedArtBlur(item: cc.Node, sprite: cc.Sprite): void {
    (item as any).blurRadius = LOCKED_ART_BLUR_RADIUS;
    const effectAsset = getEffectAsset('realm', ASSET_PATHS.realm.blurEffect);
    const material = cc.Material.create(effectAsset);
    if (!material) return;
    const params = new cc.Vec4(1 / ALBUM_ART_WIDTH, 1 / ALBUM_ART_HEIGHT, Number((item as any).blurRadius) || 0, 0);
    material.setProperty('blurParams', params);
    const appliedMaterial = sprite.setMaterial(0, material);
    (item as any).blurMaterial = appliedMaterial;
    (item as any).blurParams = params;
}

function updateLockedArtBlur(item: cc.Node, radius: number): void {
    (item as any).blurRadius = radius;
    const material: cc.Material = (item as any).blurMaterial;
    const params: cc.Vec4 = (item as any).blurParams;
    if (!material || !params) return;
    params.z = radius;
    material.setProperty('blurParams', params);
}

function animateLockedArtReveal(item: cc.Node, onDone: () => void): void {
    const state = { radius: Number((item as any).blurRadius) || LOCKED_ART_BLUR_RADIUS };
    const previousState = (item as any).blurTweenState;
    if (previousState) cc.Tween.stopAllByTarget(previousState);
    (item as any).blurTweenState = state;
    const veil: cc.Node = (item as any).lockedVeil;
    if (veil && cc.isValid(veil)) {
        cc.tween(veil).delay(0.12).to(0.88, { opacity: 0 }, { easing: 'sineOut' }).start();
    }
    cc.tween(state)
        .to(1.05, { radius: 0 }, {
            easing: 'sineInOut',
            onUpdate: () => {
                if (cc.isValid(item)) updateLockedArtBlur(item, state.radius);
            },
        })
        .call(() => {
            if (cc.isValid(item)) onDone();
        })
        .start();
}

function bindCarouselGestures(
    screen: cc.Node,
    track: cc.Node,
    artIndex: number,
    total: number,
    displayH: number,
    sideOffset: number,
    onShowArt: (index: number) => void,
): (delta: number) => void {
    const gesture = new cc.Node('carouselGestureLayer');
    gesture.width = screen.width;
    gesture.height = displayH + 100;
    gesture.setPosition(0, track.y);
    gesture.zIndex = 90;
    screen.addChild(gesture);

    let startX = 0;
    let dragX = 0;
    let navigating = false;

    const poseFor = (item: cc.Node, trackX: number) => {
        const distance = Math.min(1, Math.abs(item.x + trackX) / sideOffset);
        return {
            scale: 1 - (1 - CAROUSEL_SIDE_SCALE) * distance,
            opacity: Math.round(255 - (255 - CAROUSEL_SIDE_OPACITY) * distance),
            zIndex: distance < 0.5 ? 30 : 10,
        };
    };
    const applyPoses = (trackX: number) => {
        track.children.forEach((item) => {
            const pose = poseFor(item, trackX);
            item.scale = pose.scale;
            item.opacity = pose.opacity;
            item.zIndex = pose.zIndex;
        });
    };
    const animateTo = (targetX: number, onDone?: () => void) => {
        cc.Tween.stopAllByTarget(track);
        track.children.forEach((item) => {
            cc.Tween.stopAllByTarget(item);
            const pose = poseFor(item, targetX);
            item.zIndex = pose.zIndex;
            cc.tween(item)
                .to(0.32, { scale: pose.scale, opacity: pose.opacity }, { easing: 'quartOut' })
                .start();
        });
        const tween = cc.tween(track).to(0.32, { x: targetX }, { easing: 'quartOut' });
        if (onDone) tween.call(onDone);
        tween.start();
    };
    const resetTrack = () => {
        animateTo(0);
    };
    const navigate = (delta: number) => {
        if (navigating) return;
        const nextIndex = artIndex + delta;
        if (nextIndex < 0 || nextIndex >= total) {
            resetTrack();
            return;
        }
        navigating = true;
        audioManager.playSound('changePic');
        const targetX = delta > 0 ? -sideOffset : sideOffset;
        animateTo(targetX, () => onShowArt(nextIndex));
    };

    gesture.on(cc.Node.EventType.TOUCH_START, (event: cc.Event.EventTouch) => {
        if (navigating) return;
        startX = event.getLocationX();
        dragX = 0;
        cc.Tween.stopAllByTarget(track);
        track.children.forEach((item) => cc.Tween.stopAllByTarget(item));
    }, gesture);
    gesture.on(cc.Node.EventType.TOUCH_MOVE, (event: cc.Event.EventTouch) => {
        if (navigating) return;
        dragX = event.getLocationX() - startX;
        track.x = Math.max(-sideOffset * 0.46, Math.min(sideOffset * 0.46, dragX * 0.88));
        applyPoses(track.x);
    }, gesture);
    gesture.on(cc.Node.EventType.TOUCH_END, (event: cc.Event.EventTouch) => {
        if (navigating) return;
        dragX = event.getLocationX() - startX;
        if (Math.abs(dragX) >= 54) {
            navigate(dragX < 0 ? 1 : -1);
            return;
        }
        const local = screen.convertToNodeSpaceAR(event.getLocation());
        if (Math.abs(dragX) < 12 && local.x > screen.width * 0.28) {
            uimanager.tapFeedback();
            navigate(1);
        } else if (Math.abs(dragX) < 12 && local.x < -screen.width * 0.28) {
            uimanager.tapFeedback();
            navigate(-1);
        }
        else resetTrack();
    }, gesture);
    gesture.on(cc.Node.EventType.TOUCH_CANCEL, resetTrack, gesture);
    return navigate;
}

function drawGalleryPedestal(
    screen: cc.Node,
    displayW: number,
    displayH: number,
    stageY: number,
    accent: cc.Color,
): void {
    const pedestal = new cc.Node('galleryPedestal');
    pedestal.zIndex = 12;
    pedestal.setPosition(0, stageY - displayH / 2 - 18);
    screen.addChild(pedestal);
    const g = pedestal.addComponent(cc.Graphics);
    g.fillColor = new cc.Color(10, 15, 17, 26);
    g.ellipse(0, -2, displayW * 0.48, 15);
    g.fill();
    g.fillColor = new cc.Color(8, 12, 14, 46);
    g.ellipse(0, 0, displayW * 0.41, 8);
    g.fill();
    g.fillColor = new cc.Color(accent.r, accent.g, accent.b, 48);
    g.ellipse(0, 2, displayW * 0.31, 2.5);
    g.fill();
}

function createAlbumBackdrop(screen: cc.Node, accent: cc.Color): void {
    const bg = new cc.Node('albumBackdrop');
    bg.width = screen.width;
    bg.height = screen.height;
    bg.zIndex = -20;
    screen.addChild(bg);
    const g = bg.addComponent(cc.Graphics);
    g.fillColor = new cc.Color(48, 56, 58);
    g.rect(-screen.width / 2, -screen.height / 2, screen.width, screen.height);
    g.fill();

    g.fillColor = new cc.Color(70, 82, 86, 118);
    g.roundRect(-screen.width * 0.46, -screen.height * 0.36, screen.width * 0.92, screen.height * 0.74, 46);
    g.fill();
    g.fillColor = new cc.Color(255, 248, 224, 13);
    g.ellipse(0, screen.height * 0.07, screen.width * 0.38, screen.height * 0.46);
    g.fill();

    const floorTop = -screen.height * 0.31;
    g.fillColor = new cc.Color(36, 42, 44);
    g.rect(-screen.width / 2, -screen.height / 2, screen.width, floorTop + screen.height / 2);
    g.fill();
    g.strokeColor = new cc.Color(accent.r, accent.g, accent.b, 54);
    g.lineWidth = 1.5;
    g.moveTo(-screen.width * 0.44, floorTop);
    g.lineTo(screen.width * 0.44, floorTop);
    g.stroke();
}

function mountResourceSprite(
    parent: cc.Node,
    name: string,
    resourcePath: string,
    width: number,
    height: number,
    x: number,
    y: number,
    zIndex: number,
    onReady?: (sprite: cc.Sprite) => void,
): cc.Node {
    const node = new cc.Node(name);
    node.width = width;
    node.height = height;
    node.setPosition(x, y);
    node.zIndex = zIndex;
    parent.addChild(node);
    const sprite = node.addComponent(cc.Sprite);
    sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
    sprite.spriteFrame = getRealmSpriteFrame(resourcePath);
    node.width = width;
    node.height = height;
    if (onReady) onReady(sprite);
    return node;
}
