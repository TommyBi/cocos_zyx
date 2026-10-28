import { BUTTON_COLORS, uimanager } from '../manager/UIManager';
import { cloudService } from '../manager/CloudService';
import { isPermanentSettlementError } from '../manager/SettlementSync';
import { ASSET_PATHS, getRealmSpriteFrame } from '../manager/AssetLoader';
import { zyxGameModule } from '../dataModule/ZyxGameModule';
import {
    ALBUM_OPEN_LEVELS,
    ART_CELL_PIXELS,
    ART_FRAME_HEIGHT,
    ART_FRAME_WIDTH,
    ART_GRID_COLS,
    ART_GRID_ROWS,
    ART_IMAGE_HEIGHT,
    ART_IMAGE_WIDTH,
    ART_TOTAL_CELLS,
    MAX_VISUAL_FLY_BEANS,
} from '../dataModule/MoodBeanConfig';
import { getMoodColor, MOOD_COLORS } from './MoodArt';
import { audioManager } from '../manager/AudioManager';

/** 官方画作运行尺寸（650×780），单格 5×5 设计像素。 */
export const ALBUM_ART_WIDTH = ART_IMAGE_WIDTH;
export const ALBUM_ART_HEIGHT = ART_IMAGE_HEIGHT;
export const ALBUM_COVER_WIDTH = 280;
export const ALBUM_COVER_HEIGHT = 350;

const SHELF_CARD_X = 112;
const SHELF_FIRST_CARD_Y = -228;
const SHELF_CARD_STEP_Y = 392;
const CAROUSEL_SIDE_SCALE = 0.76;
const CAROUSEL_SIDE_OPACITY = 152;
/** 拼画渲染内部坐标固定为 650×780 设计像素，再整体缩放适配屏幕。 */
const BOARD_PIXEL_WIDTH = ART_GRID_COLS * ART_CELL_PIXELS;
const BOARD_PIXEL_HEIGHT = ART_GRID_ROWS * ART_CELL_PIXELS;

export type AlbumArtDef = {
    id: string;
    title: string;
    imagePath: string;
    previewPath: string;
};

export type AlbumDef = {
    id: string;
    title: string;
    theme: string;
    description: string;
    coverPath: string;
    framePath: string;
    openLevel: number;
    accent: cc.Color;
    arts: AlbumArtDef[];
};

type AlbumSeed = {
    id: string;
    title: string;
    theme: string;
    description: string;
    coverPath: string;
    framePath: string;
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
        framePath: ASSET_PATHS.realm.frameSeason,
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
        framePath: ASSET_PATHS.realm.frameCity,
        artFolder: 'albums/art/theme_2',
        artCount: 12,
        accent: new cc.Color(70, 103, 116),
    },
];

function buildAlbums(): AlbumDef[] {
    return ALBUM_SEEDS.map((seed) => ({
        id: seed.id,
        title: seed.title,
        theme: seed.theme,
        description: seed.description,
        coverPath: seed.coverPath,
        framePath: seed.framePath,
        openLevel: ALBUM_OPEN_LEVELS[seed.id] || 1,
        accent: seed.accent,
        arts: Array.from({ length: seed.artCount }, (_, index) => ({
            id: `${seed.id}_art_${index}`,
            title: `${seed.title} · ${String(index + 1).padStart(2, '0')}`,
            imagePath: `${seed.artFolder}/pic_${index + 1}`,
            previewPath: `${seed.artFolder}/preview_${index + 1}`,
        })),
    }));
}

export const ART_ALBUMS: AlbumDef[] = buildAlbums();

export function getAlbumById(albumId: string): AlbumDef | null {
    return ART_ALBUMS.find((album) => album.id === albumId) || null;
}

/** 画册按玩家等级开放，不再消耗开心豆开册。 */
export function isAlbumOpened(album: AlbumDef): boolean {
    return zyxGameModule.level >= album.openLevel;
}

export function isArtCompleted(artId: string): boolean {
    return zyxGameModule.getOfficialArtFilledCells(artId) >= ART_TOTAL_CELLS;
}

export function countCompletedArts(album: AlbumDef): number {
    let count = 0;
    for (const art of album.arts) {
        if (!isArtCompleted(art.id)) break;
        count += 1;
    }
    return count;
}

/** 册内画作按顺序制作：第一幅未完成的画作索引；全部完成时返回最后一幅。 */
export function getCurrentArtIndex(album: AlbumDef): number {
    for (let index = 0; index < album.arts.length; index++) {
        if (!isArtCompleted(album.arts[index].id)) return index;
    }
    return album.arts.length - 1;
}

/** 进入秘境时拉齐服务端余额与全部画作进度；离线时静默使用本地缓存，不阻断浏览。 */
export async function syncRealmCloudState(): Promise<void> {
    try {
        const state = await cloudService.getRealmState();
        zyxGameModule.applyRealmState(state);
    } catch (error) {
        cc.warn('[时空秘境] 云端状态暂不可用，使用本地缓存进度', error);
    }
}

type AlbumShelfOptions = {
    screen: cc.Node;
    onBack: () => void;
    onOpenAlbum: (albumId: string) => void;
    drawBeanIcon: (parent: cc.Node, x: number, y: number) => void;
};

export function renderAlbumShelf(options: AlbumShelfOptions): void {
    const { screen, onBack, onOpenAlbum, drawBeanIcon } = options;
    const width = screen.width;
    const height = screen.height;
    const safeArea = uimanager.getSafeAreaMetrics();
    const safeTop = Math.max(44, safeArea.top + 12);
    drawShelfBackdrop(screen);

    const headerY = height / 2 - safeTop - 58;
    const title = uimanager.createLabel(screen, '时空秘境', 0, headerY + 8, 42, MOOD_COLORS.cocoa, 330, 56);
    title.node.zIndex = 220;
    const subtitleY = Math.max(-height / 2 + 50, -height / 2 + safeArea.bottom + 34);
    const subtitle = uimanager.createLabel(screen, '用开心豆，一豆豆拼出官方画作', 0, subtitleY, 23, MOOD_COLORS.cocoaSoft, 460, 38);
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

    const beanHud = uimanager.createRect(
        screen,
        'realmBeanCount',
        158,
        50,
        new cc.Color(255, 248, 226),
        248,
        19,
        0,
        headerY - 48,
    );
    beanHud.zIndex = 230;
    drawBeanIcon(beanHud, -52, 0);
    uimanager.createLabel(beanHud, `× ${zyxGameModule.moodBeanBalance}`, 24, 1, 19, MOOD_COLORS.cocoa, 96, 30);

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
        createAlbumCoverCard(content, album, index, onOpenAlbum);
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
): void {
    const x = index % 2 === 0 ? -SHELF_CARD_X : SHELF_CARD_X;
    const y = SHELF_FIRST_CARD_Y - index * SHELF_CARD_STEP_Y;
    const opened = isAlbumOpened(album);

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

    if (opened) {
        const completed = countCompletedArts(album);
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
        uimanager.createLabel(progressPill, `已定型  ${completed} / ${album.arts.length}`, 0, 1, 18, new cc.Color(48, 111, 74), 204, 30);
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
    mountResourceSprite(
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

    const action = uimanager.createRect(
        card,
        'albumLockedHint',
        224,
        52,
        new cc.Color(255, 249, 232),
        250,
        18,
        0,
        -137,
    );
    action.zIndex = 40;
    uimanager.createLabel(action, `Lv.${album.openLevel} 开放`, 0, 1, 18, new cc.Color(112, 78, 65), 178, 30);
    card.addComponent(cc.Button);
    bindPressAnimation(card, () => {
        uimanager.showToast(`达到 Lv.${album.openLevel} 后开放这本画册`);
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

export type AlbumViewOptions = {
    screen: cc.Node;
    albumId: string;
    artIndex: number;
    onBackToShelf: () => void;
    onShowArt: (artIndex: number) => void;
    onArrowPressStart: (direction: number) => void;
    onArrowPressEnd: (direction: number) => boolean;
    onArrowNavigatorReady: (navigate: (direction: number) => void) => void;
    drawBeanIcon: (parent: cc.Node, x: number, y: number) => void;
    /** “去收集”：播放画册闭合效果并直接进入消除玩法。 */
    onGoCollect: () => void;
};

/** 单幅画作的拼画状态视图；interaction 只挂在当前画作上。 */
type ArtBoardView = {
    art: AlbumArtDef;
    filledCells: number;
    coverRoot: cc.Node;
    /** 完整未填行区域遮罩：共享平铺棋盘格 + RECT Mask，揭开进度只改 Mask 尺寸。 */
    coverFullMask: cc.Node;
    /** 当前行剩余未填格区域遮罩。 */
    coverRowMask: cc.Node;
    previewNode: cc.Node;
    hdNode: cc.Node;
    gridNode: cc.Node;
};

/** 三联画展台：当前画作居中，两侧露出缩小的前后画作，支持横向滑动。 */
export function renderAlbumView(options: AlbumViewOptions): void {
    const album = getAlbumById(options.albumId);
    if (!album || !isAlbumOpened(album)) {
        uimanager.showToast('这本画册还没有开放');
        options.onBackToShelf();
        return;
    }

    const { screen, onBackToShelf, onShowArt, drawBeanIcon } = options;
    const width = screen.width;
    const height = screen.height;
    const safeArea = uimanager.getSafeAreaMetrics();
    const safeTop = Math.max(24, safeArea.top);
    const artIndex = Math.max(0, Math.min(album.arts.length - 1, options.artIndex));
    const art = album.arts[artIndex];
    const currentIndex = getCurrentArtIndex(album);
    const completedCount = countCompletedArts(album);
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
    uimanager.createLabel(topBar, `已定型 ${completedCount} / ${album.arts.length}`, 0, topBarControlY - 19, 15, album.accent, 260, 24);
    const beanHud = uimanager.createRect(
        topBar,
        'albumBeanHud',
        150,
        42,
        new cc.Color(255, 251, 238),
        255,
        16,
        width / 2 - safeArea.right - 86,
        topBarControlY,
    );
    drawBeanIcon(beanHud, -48, 0);
    const beanBalanceLabel = uimanager.createLabel(beanHud, `× ${zyxGameModule.moodBeanBalance}`, 24, 0, 16, MOOD_COLORS.cocoa, 90, 26);

    const progressTrack = uimanager.createRect(topBar, 'albumProgressTrack', 230, 6, new cc.Color(208, 194, 169), 170, 3, 0, topBarControlY - 39);
    const progressWidth = Math.max(8, 230 * completedCount / Math.max(1, album.arts.length));
    const progressFill = uimanager.createRect(progressTrack, 'albumProgressFill', progressWidth, 6, album.accent, 255, 3, -115 + progressWidth / 2, 0);
    progressFill.zIndex = 2;

    const footerHintY = -height / 2 + safeArea.bottom + 32;
    const actionY = footerHintY + 66;
    const pageY = actionY + 70;
    const contentTop = height / 2 - topBarHeight - 24;
const artTitleY = contentTop - 16;
// 画作上沿下移，给标题与铭牌留出不重叠的间距。
const artTopLimit = artTitleY - 56;
    const artBottomLimit = pageY + 34;
    const availableArtHeight = Math.max(400, artTopLimit - artBottomLimit);
    const frameScale = Math.min(
        (width * 0.94) / ART_FRAME_WIDTH,
        availableArtHeight / ART_FRAME_HEIGHT,
    );
    const displayW = ART_IMAGE_WIDTH * frameScale;
    const displayH = ART_IMAGE_HEIGHT * frameScale;
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

    let currentBoard: ArtBoardView = null;
    [-1, 0, 1].forEach((offset) => {
        const index = artIndex + offset;
        if (index < 0 || index >= album.arts.length) return;
        const board = createGalleryArtItem(
            track,
            album,
            album.arts[index],
            index,
            frameScale,
            offset,
            sideOffset,
            index <= currentIndex,
        );
        if (offset === 0) currentBoard = board;
    });

    // 画作铭牌：贴在画作正上方，显示“序号 / 总数 · 本幅完成百分比”。
    const indexPill = uimanager.createRect(
        screen,
        'artIndexPill',
        206,
        38,
        new cc.Color(255, 248, 228),
        244,
        16,
        0,
        artTitleY - 36,
    );
    indexPill.zIndex = 110;
    const indexPillLabel = uimanager.createLabel(
        indexPill,
        formatIndexProgress(artIndex, album.arts.length, zyxGameModule.getOfficialArtFilledCells(art.id)),
        0,
        0,
        15,
        MOOD_COLORS.cocoa,
        192,
        24,
    );

    // 飞豆与定型动画期间锁定翻页：手势、箭头、长按统一走 canNavigate/guardedNavigate。
    let launchAnimating = false;
    const canNavigate = (): boolean => !launchAnimating;
    const navigate = bindCarouselGestures(screen, track, artIndex, album.arts.length, displayH, sideOffset, onShowArt, canNavigate);
    const guardedNavigate = (delta: number): void => {
        if (!canNavigate()) {
            uimanager.showToast('开心豆正在落位…');
            return;
        }
        navigate(delta);
    };
    options.onArrowNavigatorReady(guardedNavigate);
    const arrowInset = 38;
    createCarouselArrow(
        screen,
        -width / 2 + safeArea.left + arrowInset,
        stageY,
        -1,
        artIndex === 0,
        album.accent,
        guardedNavigate,
        options,
    );
    createCarouselArrow(
        screen,
        width / 2 - safeArea.right - arrowInset,
        stageY,
        1,
        artIndex === album.arts.length - 1,
        album.accent,
        guardedNavigate,
        options,
    );

    // 底部主交互区：进度、余额与投入按钮。
    const filledCells = currentBoard ? currentBoard.filledCells : 0;
    const isCurrentArt = artIndex === currentIndex;
    const completed = filledCells >= ART_TOTAL_CELLS;
    if (completed) {
        const completedPill = uimanager.createRect(
            screen,
            'completedArtStatus',
            196,
            44,
            new cc.Color(album.accent.r, album.accent.g, album.accent.b),
            216,
            18,
            0,
            actionY,
        );
        completedPill.zIndex = 130;
        uimanager.createLabel(completedPill, '画作已定型', 0, 0, 17, new cc.Color(255, 247, 226), 170, 28);
    } else if (isCurrentArt && currentBoard) {
createContributePanel(screen, album, currentBoard, actionY, beanBalanceLabel, indexPillLabel, artIndex, album.arts.length, {
artIndex,
onShowArt,
onGoCollect: options.onGoCollect,
onAnimatingChange: (flag) => { launchAnimating = flag; },
});
    } else {
        const sequenceHint = uimanager.createLabel(
            screen,
            `请先完成第 ${String(currentIndex + 1).padStart(2, '0')} 幅`,
            0,
            actionY,
            16,
            new cc.Color(205, 193, 172),
            320,
            28,
        );
        sequenceHint.node.zIndex = 130;
    }

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

type ContributePanelContext = {
artIndex: number;
onShowArt: (artIndex: number) => void;
onGoCollect: () => void;
/** 飞豆/定型动画开始与结束：动画期间必须锁定翻页输入。 */
onAnimatingChange?: (animating: boolean) => void;
};

/** 投入面板：加厚按钮 + 上方豆篮（显示待飞开心豆数量）；发射完成后按钮变为「去收集」。第一版要求在线。 */
function createContributePanel(
    screen: cc.Node,
    album: AlbumDef,
    board: ArtBoardView,
    actionY: number,
    beanBalanceLabel: cc.Label,
    progressLabel: cc.Label,
    artIndex: number,
    artCount: number,
    context: ContributePanelContext,
): void {
    const panel = new cc.Node('contributePanel');
    panel.width = 560;
    panel.height = 96;
    panel.setPosition(0, actionY - 4);
    panel.zIndex = 130;
    screen.addChild(panel);

    // 豆篮：按钮上方的小盒子，豆子在飞行时从篮内随机位置飞出；篮身盖住豆子起点。
    const basketY = actionY - 4 + 88;
    const basket = new cc.Node('beanBasket');
    basket.width = 150;
    basket.height = 62;
    basket.setPosition(0, basketY);
    basket.zIndex = 450;
    screen.addChild(basket);
    const basketG = basket.addComponent(cc.Graphics);
    // 篮身（梯形木桶）。
    basketG.fillColor = new cc.Color(122, 84, 52);
    basketG.moveTo(-72, 18);
    basketG.lineTo(72, 18);
    basketG.lineTo(56, -28);
    basketG.lineTo(-56, -28);
    basketG.close();
    basketG.fill();
    // 篮身侧面高光。
    basketG.fillColor = new cc.Color(146, 106, 68);
    basketG.moveTo(-72, 18);
    basketG.lineTo(-30, 18);
    basketG.lineTo(-22, -28);
    basketG.lineTo(-56, -28);
    basketG.close();
    basketG.fill();
    // 篮口内腔（深色，豆子起点藏在这里）。
    basketG.fillColor = new cc.Color(62, 42, 30);
    basketG.ellipse(0, 16, 68, 12);
    basketG.fill();
    // 篮内露出的豆子。
    [-34, -12, 12, 34].forEach((bx, i) => {
        const peek = createFlyingBeanGlyph(basket, 1 + i * 2, bx, 18 + (i % 2) * 3, 20);
        peek.zIndex = 2;
    });
    // 篮口前缘（盖住豆根）。
    basketG.fillColor = new cc.Color(158, 116, 76);
    basketG.roundRect(-76, 8, 152, 12, 6);
    basketG.fill();
    const basketCount = uimanager.createLabel(basket, `× ${zyxGameModule.moodBeanBalance}`, 0, -12, 19, new cc.Color(255, 240, 212), 120, 28);
    basketCount.node.zIndex = 5;
    const basketCountOutline = basketCount.node.addComponent(cc.LabelOutline);
    basketCountOutline.color = new cc.Color(74, 50, 32);
    basketCountOutline.width = 1.6;

    let animating = false;
    // R4：存在未确认拼画操作时按钮进入「重试放置」，重试必须复用原 actionId 与载荷。
    let buttonMode: 'place' | 'collect' | 'retry' = zyxGameModule.getPendingRealmAction()
        ? 'retry'
        : (zyxGameModule.moodBeanBalance > 0 ? 'place' : 'collect');

    const button = uimanager.createRect(panel, 'placeBeansButton', 356, 66, BUTTON_COLORS.yellow, 255, 24, 0, 10);
    button.zIndex = 132;
    button.addComponent(cc.Button);
    const buttonLabel = uimanager.createLabel(button, '', 0, 2, 23, cc.Color.WHITE, 336, 52);
    const outline = buttonLabel.node.addComponent(cc.LabelOutline);
    outline.width = 1.4;
    const paintButton = (): void => {
        const color = buttonMode === 'collect' ? BUTTON_COLORS.green : BUTTON_COLORS.yellow;
        uimanager.drawButtonSurface(button, 356, 66, color, 24);
        buttonLabel.string = buttonMode === 'collect' ? '去收集' : (buttonMode === 'retry' ? '重试放置' : '放置开心豆');
        outline.color = new cc.Color(
            Math.round(color.r * 0.48),
            Math.round(color.g * 0.48),
            Math.round(color.b * 0.48),
        );
    };
    paintButton();
    button.on(cc.Node.EventType.TOUCH_START, () => {
        cc.tween(button).stop();
        cc.tween(button).to(0.07, { scale: 0.95 }).start();
    }, panel);
    button.on(cc.Node.EventType.TOUCH_CANCEL, () => {
        cc.tween(button).stop();
        cc.tween(button).to(0.1, { scale: 1 }).start();
    }, panel);
    button.on(cc.Node.EventType.TOUCH_END, () => {
        cc.tween(button).stop();
        cc.tween(button).to(0.1, { scale: 1 }).start();
        if (animating) return;
        if (buttonMode === 'collect') {
            context.onGoCollect();
            return;
        }
        placeBeans();
    }, panel);

    /**
     * R4：提交拼画前先把 actionId/artId/requestedBeans 持久化；
     * 模糊失败（超时/丢响应/5xx）保留操作身份等待重试，禁止生成第二个 actionId；
     * 确定成功或确定拒绝（4xx）后才清除 pending action。
     */
    const setAnimating = (flag: boolean): void => {
        animating = flag;
        if (context.onAnimatingChange) context.onAnimatingChange(flag);
    };

    const launchContribute = (actionId: string, artId: string, amount: number): void => {
        setAnimating(true);
        // 放置过程中隐藏按钮，避免连点。
        const btn = button.getComponent(cc.Button);
        if (btn) btn.interactable = false;
        cc.tween(button).stop();
        cc.tween(button).to(0.2, { opacity: 0 }, { easing: 'sineOut' }).start();
        const restoreButton = (): void => {
            if (!cc.isValid(button)) return;
            if (btn) btn.interactable = true;
            cc.tween(button).stop();
            button.scale = 1;
            cc.tween(button).to(0.24, { opacity: 255 }, { easing: 'sineOut' }).start();
        };
        cloudService.contributeRealmArt(actionId, artId, amount)
            .then((result) => {
                // 确定成功（含服务端返回的幂等重放结果）：清除 pending action 并应用权威结果。
                zyxGameModule.clearPendingRealmAction();
                if (!cc.isValid(screen)) return;
                zyxGameModule.applyRealmState({ moodBeanBalance: result.moodBeanBalance, albums: [] });
                zyxGameModule.setOfficialArtFilledCells(result.artId, result.filledCells);
                if (beanBalanceLabel && cc.isValid(beanBalanceLabel.node)) {
                    beanBalanceLabel.string = `× ${result.moodBeanBalance}`;
                }
                if (result.artId !== board.art.id) {
                    // 恢复的是其它画作的未确认操作：同步缓存即可，不在当前画作播动画。
                    setAnimating(false);
                    uimanager.showToast('上次放置已同步');
                    buttonMode = zyxGameModule.moodBeanBalance > 0 ? 'place' : 'collect';
                    paintButton();
                    restoreButton();
                    return;
                }
                const filledBefore = board.filledCells;
                runBeanLaunch(screen, album, board, filledBefore, result.filledCells, {
                    basketNode: basket,
                    countLabel: basketCount,
                    startValue: result.moodBeanBalance + Math.max(0, result.filledCells - filledBefore),
                    endValue: result.moodBeanBalance,
                }, () => {
                    if (progressLabel && cc.isValid(progressLabel.node)) {
                        progressLabel.string = formatIndexProgress(artIndex, artCount, board.filledCells);
                    }
                    if (result.completed) {
                        // 画作从马赛克变清晰后停留在当前幅：原地重建为「已定型」状态，
                        // 是否翻到下一幅由用户手动切换，不再自动跳页；定型演出期间保持翻页锁定。
                        playIroningFinish(album, board, () => {
                            if (context.artIndex + 1 >= album.arts.length) uimanager.showToast('恭喜完成画册');
                            context.onShowArt(context.artIndex);
                        });
                        return;
                    }
                    setAnimating(false);
                    buttonMode = zyxGameModule.moodBeanBalance > 0 ? 'place' : 'collect';
                    paintButton();
                    restoreButton();
                });
            })
            .catch((error: Error) => {
                if (!cc.isValid(screen)) return;
                setAnimating(false);
                if (isPermanentSettlementError(error)) {
                    // 服务端明确拒绝且未执行扣减：清除 pending action，恢复正常放置。
                    zyxGameModule.clearPendingRealmAction();
                    buttonMode = zyxGameModule.moodBeanBalance > 0 ? 'place' : 'collect';
                    paintButton();
                    restoreButton();
                    uimanager.showToast(error && error.message ? error.message : '放置失败，请稍后重试');
                    return;
                }
                // 模糊失败：保留原 actionId，按钮进入「重试放置」。
                buttonMode = 'retry';
                paintButton();
                restoreButton();
                uimanager.showToast('网络异常，点击重试放置');
            });
    };

    const placeBeans = (): void => {
        // 存在未确认操作时先完成它，禁止发起新投入。
        const pending = zyxGameModule.getPendingRealmAction();
        if (pending) {
            launchContribute(pending.actionId, pending.artId, pending.requestedBeans);
            return;
        }
        const remaining = ART_TOTAL_CELLS - board.filledCells;
        // 一次放置当前全部可放置的开心豆：不设批次上限，消耗掉手里所有豆（服务端上限为一整幅画作豆位数）。
        const amount = Math.min(zyxGameModule.moodBeanBalance, remaining);
        if (amount <= 0) {
            buttonMode = 'collect';
            paintButton();
            return;
        }
        const actionId = `contrib_${board.art.id}_${Date.now()}_${Math.floor(Math.random() * 1000000000)}`;
        // 先持久化操作身份，再禁用按钮提交。
        zyxGameModule.setPendingRealmAction({
            actionId,
            artId: board.art.id,
            requestedBeans: amount,
            createdAt: Date.now(),
        });
        launchContribute(actionId, board.art.id, amount);
    };

    // 重新进入秘境时先自动重试未确认操作，成功后再允许发起新投入。
    if (buttonMode === 'retry') {
        const pending = zyxGameModule.getPendingRealmAction();
        if (pending) launchContribute(pending.actionId, pending.artId, pending.requestedBeans);
    }
}

function formatCellCount(value: number): string {
    return Math.max(0, Math.floor(value)).toLocaleString('en-US');
}

/** 画作铭牌文案：序号 / 总数 · 本幅完成百分比。 */
function formatIndexProgress(artIndex: number, artCount: number, filledCells: number): string {
    const percent = Math.floor(Math.min(ART_TOTAL_CELLS, filledCells) * 1000 / ART_TOTAL_CELLS) / 10;
    return `${String(artIndex + 1).padStart(2, '0')} / ${String(artCount).padStart(2, '0')} · ${percent}%`;
}

const BEAN_FLIGHT_DURATION = 0.5;
const LAUNCH_STEP_SECONDS = 0.1;
const LAUNCH_ALL_AT_ONCE_THRESHOLD = 50;
const LAUNCH_SPRAY_SECONDS = 5;
const FLY_BEAN_SIZE = 30;

/** 密集飞行豆：单节点简化拼豆（色块 + 孔位），供大批量发射使用。 */
function drawFlyingBeanGlyph(g: cc.Graphics, moodIndex: number, size: number): void {
    const color = getMoodColor(moodIndex);
    const radius = size / 2;
    g.clear();
    g.fillColor = new cc.Color(
        Math.round(color.r * 0.66),
        Math.round(color.g * 0.66),
        Math.round(color.b * 0.66),
    );
    g.circle(0, -1.2, radius);
    g.fill();
    g.fillColor = color;
    g.circle(0, 0.8, radius * 0.94);
    g.fill();
    g.fillColor = new cc.Color(255, 246, 224, 140);
    g.ellipse(-radius * 0.3, radius * 0.4, radius * 0.28, radius * 0.16);
    g.fill();
    g.fillColor = new cc.Color(73, 48, 43, 235);
    g.ellipse(0, radius * 0.36, radius * 0.16, radius * 0.1);
    g.fill();
}

function createFlyingBeanGlyph(parent: cc.Node, moodIndex: number, x: number, y: number, size: number): cc.Node {
    const node = new cc.Node(`flyBean_${moodIndex}`);
    node.setPosition(x, y);
    node.zIndex = 410;
    parent.addChild(node);
    drawFlyingBeanGlyph(node.addComponent(cc.Graphics), moodIndex, size);
    return node;
}

/** 飞行豆节点池：复用节点避免每次批量创建和销毁；页面销毁后池内节点自动失效并被过滤。 */
const flyBeanPool: cc.Node[] = [];

function obtainFlyingBean(parent: cc.Node, moodIndex: number, x: number, y: number, size: number): cc.Node {
    let node: cc.Node = null;
    while (flyBeanPool.length > 0) {
        const candidate = flyBeanPool.pop();
        if (candidate && cc.isValid(candidate)) {
            node = candidate;
            break;
        }
    }
    if (!node) {
        node = new cc.Node('flyBean');
        node.zIndex = 410;
        node.addComponent(cc.Graphics);
    }
    parent.addChild(node);
    node.setPosition(x, y);
    node.scale = 1;
    node.angle = 0;
    node.opacity = 255;
    node.active = true;
    drawFlyingBeanGlyph(node.getComponent(cc.Graphics), moodIndex, size);
    return node;
}

function releaseFlyingBean(node: cc.Node): void {
    if (!node || !cc.isValid(node)) return;
    cc.Tween.stopAllByTarget(node);
    node.removeFromParent(false);
    node.active = false;
    flyBeanPool.push(node);
}

type BeanLaunchBasket = {
    basketNode: cc.Node;
    countLabel: cc.Label;
    startValue: number;
    endValue: number;
};

/**
 * 放置拼豆动画：豆子从按钮上方的豆篮中密集飞出，落位即揭开对应遮罩。
 * 少于 50 颗时一次性全部飞上去；50 颗以上按 100ms 步进“喷枪式”发射，5 秒发射完（每步数量 = 总量/50）。
 * 每颗豆子以 500ms、cubicInOut 缓动从常规大小飞到自己次序对应的位置，落位时缩小到 5×5 豆位大小；
 * 落位瞬间才消退该豆位遮罩；篮上数量随发射递减，最终停留在服务端结算值。
 */
function runBeanLaunch(
    screen: cc.Node,
    album: AlbumDef,
    board: ArtBoardView,
    filledBefore: number,
    filledAfter: number,
    basket: BeanLaunchBasket,
    onDone: () => void,
): void {
    const amount = Math.max(0, filledAfter - filledBefore);
    if (amount <= 0 || !board.coverRoot || !cc.isValid(board.coverRoot)) {
        board.filledCells = filledAfter;
        if (board.coverRoot && cc.isValid(board.coverRoot)) updateCoverMasks(board);
        onDone();
        return;
    }

    const layer = new cc.Node('beanLaunchLayer');
    layer.width = screen.width;
    layer.height = screen.height;
    layer.zIndex = 400;
    screen.addChild(layer);
    const stage = board.previewNode.parent;
    const stageScale = Math.abs(stage.scale) || 1;
    const landScale = (ART_CELL_PIXELS * stageScale) / FLY_BEAN_SIZE;

    // 豆篮数量：从起飞前的待飞数量递减到服务端结算后的最终值。
    const countState = { remaining: amount };
    const countSpan = amount < LAUNCH_ALL_AT_ONCE_THRESHOLD
        ? BEAN_FLIGHT_DURATION + 0.2
        : LAUNCH_SPRAY_SECONDS + BEAN_FLIGHT_DURATION;
    if (basket.countLabel && cc.isValid(basket.countLabel.node)) {
        basket.countLabel.string = `× ${basket.startValue}`;
        cc.tween(countState)
            .to(countSpan, { remaining: 0 }, {
                easing: 'linear',
                onUpdate: () => {
                    if (!cc.isValid(basket.countLabel.node)) return;
                    basket.countLabel.string = `× ${basket.endValue + Math.ceil(countState.remaining)}`;
                },
            })
            .start();
    }

    // 豆子落位才揭开遮罩：Mask 窗口随落位即时收缩，代价只是修改两个节点的尺寸属性。
    const revealAtLanding = (rank: number): void => {
        board.filledCells = Math.max(board.filledCells, rank + 1);
        if (cc.isValid(board.coverRoot)) updateCoverMasks(board);
    };

    // 发射起点：篮口内腔里的随机坐标（篮身层级更高，起点被遮住）。
    const basketCenterY = basket.basketNode && cc.isValid(basket.basketNode) ? basket.basketNode.y : -screen.height / 2 + 150;
    const randomSpawn = (): { x: number; y: number } => ({
        x: (Math.random() * 2 - 1) * 52,
        y: basketCenterY + 12 + (Math.random() * 2 - 1) * 5,
    });

    const spawnBean = (rank: number, delay: number): void => {
        // 行优先填充：豆位序号与 rank 一致。
        const cell = Math.max(0, Math.min(ART_TOTAL_CELLS - 1, rank));
        const target = cellToScreenPosition(screen, stage, cell);
        const origin = randomSpawn();
        const bean = obtainFlyingBean(layer, 1 + (rank % 10), origin.x, origin.y, FLY_BEAN_SIZE);
        bean.opacity = 0;
        const state = { t: 0 };
        cc.tween(bean).delay(delay).to(0.05, { opacity: 255 }).start();
        cc.tween(state)
            .delay(delay)
            .to(BEAN_FLIGHT_DURATION, { t: 1 }, {
                easing: 'cubicInOut',
                onUpdate: () => {
                    if (!cc.isValid(bean)) return;
                    const inverse = 1 - state.t;
                    const controlX = (origin.x + target.x) / 2;
                    const controlY = Math.max(origin.y, target.y) + 120;
                    bean.x = inverse * inverse * origin.x + 2 * inverse * state.t * controlX + state.t * state.t * target.x;
                    bean.y = inverse * inverse * origin.y + 2 * inverse * state.t * controlY + state.t * state.t * target.y;
                    // 从常规大小缩小到 5×5 豆位。
                    bean.scale = 1 - state.t * (1 - landScale);
                },
            })
            .call(() => {
                if (cc.isValid(bean)) releaseFlyingBean(bean);
                // 页面已销毁时不再触达遮罩与进度，进度以服务端为准。
                if (!cc.isValid(screen)) return;
                revealAtLanding(rank);
            })
            .start();
    };

    if (amount < LAUNCH_ALL_AT_ONCE_THRESHOLD) {
        // 少量豆子：一次性全部飞上去。
        for (let index = 0; index < amount; index++) spawnBean(filledBefore + index, index * 0.01);
    } else {
        // 喷枪节奏：100ms 步进，5 秒发射完。在屏视觉豆不超过 MAX_VISUAL_FLY_BEANS（120），
        // 超大批量按等距抽样发射，未生成视觉豆的豆位由时序前沿兜底揭开（服务端实际投入数不减少）。
        const spawnCount = Math.min(amount, MAX_VISUAL_FLY_BEANS);
        const steps = Math.ceil(LAUNCH_SPRAY_SECONDS / LAUNCH_STEP_SECONDS);
        const perStep = Math.ceil(spawnCount / steps);
        for (let step = 0; step < steps; step++) {
            const firstVisual = step * perStep;
            for (let index = 0; index < perStep && firstVisual + index < spawnCount; index++) {
                const visualIndex = firstVisual + index;
                const rank = filledBefore + Math.floor(visualIndex * amount / spawnCount);
                spawnBean(Math.min(filledAfter - 1, rank), step * LAUNCH_STEP_SECONDS + index * 0.008);
            }
        }
        if (spawnCount < amount) {
            // 前沿兜底：从首批豆子落位时刻起，5 秒内匀速揭开全部新豆位。
            const frontier = { filled: filledBefore };
            cc.tween(frontier)
                .delay(BEAN_FLIGHT_DURATION)
                .to(LAUNCH_SPRAY_SECONDS, { filled: filledAfter }, {
                    easing: 'linear',
                    onUpdate: () => {
                        if (!cc.isValid(screen)) return;
                        const next = Math.min(filledAfter, Math.floor(frontier.filled));
                        if (next <= board.filledCells) return;
                        board.filledCells = next;
                        if (cc.isValid(board.coverRoot)) updateCoverMasks(board);
                    },
                })
                .start();
        }
    }

    const totalSeconds = amount < LAUNCH_ALL_AT_ONCE_THRESHOLD
        ? BEAN_FLIGHT_DURATION + 0.3
        : LAUNCH_SPRAY_SECONDS + BEAN_FLIGHT_DURATION + 0.2;
    setTimeout(() => {
        // 页面已销毁时直接退出：不触达已销毁节点，也不允许旧页面回调重新打开画册。
        if (!cc.isValid(screen)) return;
        // 动画结束以服务端 filledCells 强制校正。
        board.filledCells = filledAfter;
        if (cc.isValid(board.coverRoot)) updateCoverMasks(board);
        if (basket.countLabel && cc.isValid(basket.countLabel.node)) {
            basket.countLabel.string = `× ${basket.endValue}`;
        }
        if (cc.isValid(layer)) layer.destroy();
        onDone();
    }, totalSeconds * 1000);
}

/** 豆位序号（row * cols + col）转换为屏幕坐标。 */
function cellToScreenPosition(screen: cc.Node, stage: cc.Node, cell: number): cc.Vec2 {
    const col = cell % ART_GRID_COLS;
    const row = Math.floor(cell / ART_GRID_COLS);
    const local = cc.v2(
        -BOARD_PIXEL_WIDTH / 2 + col * ART_CELL_PIXELS + ART_CELL_PIXELS / 2,
        BOARD_PIXEL_HEIGHT / 2 - row * ART_CELL_PIXELS - ART_CELL_PIXELS / 2,
    );
    return screen.convertToNodeSpaceAR(stage.convertToWorldSpaceAR(local));
}

/** 熨烫定型演出：压合 → 热气柔光 → 格线与拼豆层融合 → 高清原画淡入。 */
function playIroningFinish(album: AlbumDef, board: ArtBoardView, onDone: () => void): void {
    const stage = board.previewNode.parent;
    if (!stage || !cc.isValid(stage)) {
        onDone();
        return;
    }
    audioManager.playSound('changePic');
    const glow = new cc.Node('ironingGlow');
    glow.width = BOARD_PIXEL_WIDTH;
    glow.height = BOARD_PIXEL_HEIGHT;
    glow.zIndex = 60;
    glow.opacity = 0;
    stage.addChild(glow);
    const g = glow.addComponent(cc.Graphics);
    g.fillColor = new cc.Color(255, 244, 214, 150);
    g.roundRect(-BOARD_PIXEL_WIDTH / 2, -BOARD_PIXEL_HEIGHT / 2, BOARD_PIXEL_WIDTH, BOARD_PIXEL_HEIGHT, 12);
    g.fill();

    cc.tween(stage)
        .to(0.12, { scaleY: stage.scaleY * 0.985, scaleX: stage.scaleX * 1.005 }, { easing: 'sineIn' })
        .to(0.18, { scaleY: stage.scaleY, scaleX: stage.scaleX }, { easing: 'backOut' })
        .start();
    cc.tween(glow)
        .to(0.22, { opacity: 220 }, { easing: 'sineOut' })
        .delay(0.32)
        .to(0.5, { opacity: 0 }, { easing: 'sineIn' })
        .call(() => {
            if (cc.isValid(glow)) glow.destroy();
        })
        .start();

    // 格线与拼豆遮罩由中心向外融合，随后高清原画淡入。
    const layers = [board.coverRoot, board.gridNode, board.previewNode];
    layers.forEach((layer) => {
        if (!layer || !cc.isValid(layer)) return;
        cc.tween(layer).delay(0.42).to(0.55, { opacity: 0 }, { easing: 'sineInOut' }).start();
    });
    if (board.hdNode && cc.isValid(board.hdNode)) {
        if (!board.hdNode.getComponent(cc.Sprite)) {
            const hdSprite = board.hdNode.addComponent(cc.Sprite);
            hdSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            hdSprite.spriteFrame = getRealmSpriteFrame(board.art.imagePath);
            board.hdNode.width = BOARD_PIXEL_WIDTH;
            board.hdNode.height = BOARD_PIXEL_HEIGHT;
        }
        board.hdNode.opacity = 0;
        cc.tween(board.hdNode)
            .delay(0.72)
            .to(0.6, { opacity: 255 }, { easing: 'sineOut' })
            .start();
    }
    const plate = new cc.Node('ironingDonePlate');
    plate.width = 240;
    plate.height = 52;
    plate.zIndex = 80;
    plate.opacity = 0;
    stage.addChild(plate);
    const plateG = plate.addComponent(cc.Graphics);
    plateG.fillColor = new cc.Color(88, 61, 55, 220);
    plateG.roundRect(-120, -26, 240, 52, 26);
    plateG.fill();
    uimanager.createLabel(plate, '画作已定型', 0, 0, 21, new cc.Color(255, 246, 224), 200, 32);
    cc.tween(plate)
        .delay(1.05)
        .to(0.3, { opacity: 255 }, { easing: 'sineOut' })
        .delay(1.2)
        .to(0.3, { opacity: 0 })
        .call(() => {
            if (cc.isValid(plate)) plate.destroy();
            // 页面已离开时不再触发后续跳页。
            if (!cc.isValid(stage)) return;
            onDone();
        })
        .start();
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

/**
 * 单幅画作节点：主题画框 + 卡纸 + 像素预览 + 未填豆位遮罩 + 格线 + 高清原画。
 * 拼豆状态只用少量 Graphics 节点批量绘制，绝不创建 20,280 个节点。
 */
function createGalleryArtItem(
    track: cc.Node,
    album: AlbumDef,
    art: AlbumArtDef,
    artIndex: number,
    frameScale: number,
    offset: number,
    sideOffset: number,
    previousCompleted: boolean,
): ArtBoardView {
    const item = new cc.Node(`galleryArt_${art.id}`);
    item.width = ART_FRAME_WIDTH * frameScale;
    item.height = ART_FRAME_HEIGHT * frameScale;
    item.setPosition(offset * sideOffset, 0);
    item.scale = offset === 0 ? 1 : CAROUSEL_SIDE_SCALE;
    item.opacity = offset === 0 ? 255 : CAROUSEL_SIDE_OPACITY;
    item.zIndex = offset === 0 ? 30 : 10;
    (item as any).galleryOffset = offset;
    track.addChild(item);

    // 画框与画作分离：同一画册复用一套主题画框纹理。
    const frame = new cc.Node('artFrame');
    frame.width = ART_FRAME_WIDTH;
    frame.height = ART_FRAME_HEIGHT;
    frame.zIndex = 6;
    frame.scale = frameScale;
    item.addChild(frame);
    const frameSprite = frame.addComponent(cc.Sprite);
    frameSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
    frameSprite.spriteFrame = getRealmSpriteFrame(album.framePath);
    frame.width = ART_FRAME_WIDTH;
    frame.height = ART_FRAME_HEIGHT;

    const stage = new cc.Node('artBoardStage');
    stage.width = BOARD_PIXEL_WIDTH;
    stage.height = BOARD_PIXEL_HEIGHT;
    stage.scale = frameScale;
    stage.zIndex = 4;
    item.addChild(stage);

    // 底板/卡纸。
    const backing = new cc.Node('artBacking');
    backing.width = BOARD_PIXEL_WIDTH;
    backing.height = BOARD_PIXEL_HEIGHT;
    backing.zIndex = 0;
    stage.addChild(backing);
    const backingG = backing.addComponent(cc.Graphics);
    backingG.fillColor = mixWithCream(album.accent, 0.82);
    backingG.roundRect(-BOARD_PIXEL_WIDTH / 2, -BOARD_PIXEL_HEIGHT / 2, BOARD_PIXEL_WIDTH, BOARD_PIXEL_HEIGHT, 8);
    backingG.fill();

    // 像素预览层：130×156 邻近采样，放大到 650×780。
    const previewNode = new cc.Node('artPreview');
    previewNode.width = BOARD_PIXEL_WIDTH;
    previewNode.height = BOARD_PIXEL_HEIGHT;
    previewNode.zIndex = 1;
    stage.addChild(previewNode);
    const previewSprite = previewNode.addComponent(cc.Sprite);
    previewSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
    previewSprite.spriteFrame = getRealmSpriteFrame(art.previewPath);
    previewNode.width = BOARD_PIXEL_WIDTH;
    previewNode.height = BOARD_PIXEL_HEIGHT;

    // 未填豆位遮罩：全部画板共享一张平铺棋盘纹理，用两个 RECT Mask 窗口决定露出区域，
    // 揭开进度只改 Mask 尺寸与位置，不再逐格绘制 20,280 个矩形（内存与 CPU 均为 O(1)）。
    const coverRoot = new cc.Node('artUnfilledCover');
    coverRoot.width = BOARD_PIXEL_WIDTH;
    coverRoot.height = BOARD_PIXEL_HEIGHT;
    coverRoot.zIndex = 2;
    stage.addChild(coverRoot);
    const tileFrame = getCoverTileFrame(album);
    const coverFullMask = createCoverMask(coverRoot, 'coverFullRows', tileFrame);
    const coverRowMask = createCoverMask(coverRoot, 'coverActiveRow', tileFrame);

    // 统一格线层：单张 Graphics 一次绘制。
    const gridNode = new cc.Node('artGridLines');
    gridNode.width = BOARD_PIXEL_WIDTH;
    gridNode.height = BOARD_PIXEL_HEIGHT;
    gridNode.zIndex = 3;
    gridNode.opacity = 90;
    stage.addChild(gridNode);
    drawGridLines(gridNode);

    // 高清原画层：完成前隐藏。
    const hdNode = new cc.Node('artHdImage');
    hdNode.width = BOARD_PIXEL_WIDTH;
    hdNode.height = BOARD_PIXEL_HEIGHT;
    hdNode.zIndex = 5;
    hdNode.opacity = 0;
    stage.addChild(hdNode);

    const filledCells = Math.min(ART_TOTAL_CELLS, zyxGameModule.getOfficialArtFilledCells(art.id));
    const completed = filledCells >= ART_TOTAL_CELLS;
    const locked = !previousCompleted && !completed;
    const board: ArtBoardView = {
        art,
        filledCells,
        coverRoot,
        coverFullMask,
        coverRowMask,
        previewNode,
        hdNode,
        gridNode,
    };
    updateCoverMasks(board);

    if (completed) {
        coverRoot.opacity = 0;
        gridNode.opacity = 0;
        previewNode.opacity = 0;
        // 高清原图必须已随页预载；万一缺失用像素预览兜底，绝不让整页渲染中断卡死书页层。
        let hdFrame: cc.SpriteFrame = null;
        try {
            hdFrame = getRealmSpriteFrame(art.imagePath);
        } catch (error) {
            cc.warn(`[时空秘境] ${art.id} 高清原图未准备，暂用像素预览兜底`, error);
        }
        const hdSprite = hdNode.addComponent(cc.Sprite);
        hdSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        hdSprite.spriteFrame = hdFrame || getRealmSpriteFrame(art.previewPath);
        hdNode.width = BOARD_PIXEL_WIDTH;
        hdNode.height = BOARD_PIXEL_HEIGHT;
        hdNode.opacity = 255;
    }

    if (locked) {
        const veil = uimanager.createRect(stage, 'lockedArtVeil', BOARD_PIXEL_WIDTH, BOARD_PIXEL_HEIGHT, new cc.Color(30, 26, 24), 118, 6);
        veil.zIndex = 7;
        const hint = uimanager.createLabel(stage, '先完成前一幅', 0, 0, 22, new cc.Color(238, 228, 210), 300, 34);
        hint.node.zIndex = 8;
    }
    return board;
}

function mixWithCream(color: cc.Color, ratio: number): cc.Color {
    const t = Math.max(0, Math.min(1, ratio));
    return new cc.Color(
        Math.round(color.r * (1 - t) + 255 * t * 0.98),
        Math.round(color.g * (1 - t) + 244 * t),
        Math.round(color.b * (1 - t) + 222 * t),
    );
}

/** 未填豆位棋盘配色：生成平铺纹理时按册取色。 */
type CoverPalette = { cellA: cc.Color; cellB: cc.Color; hole: cc.Color };

function buildCoverPalette(accent: cc.Color): CoverPalette {
    const cellA = mixWithCream(accent, 0.76);
    const cellB = mixWithCream(accent, 0.68);
    const hole = new cc.Color(
        Math.round(cellB.r * 0.72),
        Math.round(cellB.g * 0.72),
        Math.round(cellB.b * 0.72),
        150,
    );
    return { cellA, cellB, hole };
}

/** 棋盘格纹理缓存：每册只生成一次 50×50 平铺纹理，该册全部画板共享。 */
const coverTileFrames: { [albumId: string]: cc.SpriteFrame } = {};

/**
 * 生成一册的未填豆位平铺纹理：10×10 豆位（50×50 像素）棋盘 + 每格 1 像素孔位凹槽。
 * 用 initWithData 直接上传像素数据，不依赖离屏 canvas，Web 与微信小游戏通用。
 */
function getCoverTileFrame(album: AlbumDef): cc.SpriteFrame {
    const cached = coverTileFrames[album.id];
    if (cached && cc.isValid(cached)) return cached;
    const palette = buildCoverPalette(album.accent);
    const tileCells = 10;
    const size = tileCells * ART_CELL_PIXELS;
    const data = new Uint8Array(size * size * 4);
    for (let py = 0; py < size; py++) {
        for (let px = 0; px < size; px++) {
            const cellCol = (px / ART_CELL_PIXELS) | 0;
            const cellRow = (py / ART_CELL_PIXELS) | 0;
            const localX = px % ART_CELL_PIXELS;
            const localY = py % ART_CELL_PIXELS;
            const isHole = localX === 2 && localY === 2;
            const color = isHole ? palette.hole : ((cellRow + cellCol) % 2 === 0 ? palette.cellA : palette.cellB);
            const offset = (py * size + px) * 4;
            data[offset] = color.r;
            data[offset + 1] = color.g;
            data[offset + 2] = color.b;
            data[offset + 3] = isHole ? 150 : 255;
        }
    }
    const texture = new cc.Texture2D();
    texture.initWithData(data, cc.Texture2D.PixelFormat.RGBA8888, size, size);
    texture.setFilters(cc.Texture2D.Filter.NEAREST, cc.Texture2D.Filter.NEAREST);
    const frame = new cc.SpriteFrame();
    frame.setTexture(texture);
    coverTileFrames[album.id] = frame;
    return frame;
}

/** 单个遮罩窗口：RECT Mask + 整幅平铺棋盘子节点；Mask 节点尺寸与位置决定露出哪一块。 */
function createCoverMask(parent: cc.Node, name: string, tileFrame: cc.SpriteFrame): cc.Node {
    const maskNode = new cc.Node(name);
    parent.addChild(maskNode);
    const mask = maskNode.addComponent(cc.Mask);
    mask.type = cc.Mask.Type.RECT;
    const tile = new cc.Node(`${name}_tiles`);
    tile.width = BOARD_PIXEL_WIDTH;
    tile.height = BOARD_PIXEL_HEIGHT;
    maskNode.addChild(tile);
    const sprite = tile.addComponent(cc.Sprite);
    sprite.type = cc.Sprite.Type.TILED;
    sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
    sprite.spriteFrame = tileFrame;
    maskNode.active = false;
    return maskNode;
}

/** 调整 Mask 窗口：平铺图案保持与画板坐标对齐，不随窗口移动。 */
function layoutCoverMask(maskNode: cc.Node, visible: boolean, x: number, y: number, width: number, height: number): void {
    if (!maskNode || !cc.isValid(maskNode)) return;
    maskNode.active = visible;
    if (!visible) return;
    maskNode.setPosition(x, y);
    maskNode.width = width;
    maskNode.height = height;
    const tile = maskNode.children[0];
    if (tile) tile.setPosition(-x, -y);
}

/**
 * 揭开进度 = 调整两个 Mask 窗口的尺寸与位置，不重绘任何图形。
 * 行优先填充下未填区域是 L 形：当前行剩余格 + 下方完整未填行。
 */
function updateCoverMasks(board: ArtBoardView): void {
    const filled = Math.max(0, Math.min(ART_TOTAL_CELLS, board.filledCells));
    const fullRows = Math.floor(filled / ART_GRID_COLS);
    const partialCols = filled % ART_GRID_COLS;
    const halfW = BOARD_PIXEL_WIDTH / 2;
    const halfH = BOARD_PIXEL_HEIGHT / 2;

    // 下方完整未填行区域：rows [fullRows + (partialCols > 0 ? 1 : 0), ART_GRID_ROWS)。
    const firstFullRow = fullRows + (partialCols > 0 ? 1 : 0);
    const fullHeight = (ART_GRID_ROWS - firstFullRow) * ART_CELL_PIXELS;
    layoutCoverMask(
        board.coverFullMask,
        fullHeight > 0,
        0,
        halfH - firstFullRow * ART_CELL_PIXELS - fullHeight / 2,
        BOARD_PIXEL_WIDTH,
        fullHeight,
    );

    // 当前行剩余未填格区域：row fullRows，cols [partialCols, ART_GRID_COLS)。
    const rowWidth = (ART_GRID_COLS - partialCols) * ART_CELL_PIXELS;
    layoutCoverMask(
        board.coverRowMask,
        partialCols > 0 && fullRows < ART_GRID_ROWS,
        -halfW + partialCols * ART_CELL_PIXELS + rowWidth / 2,
        halfH - fullRows * ART_CELL_PIXELS - ART_CELL_PIXELS / 2,
        rowWidth,
        ART_CELL_PIXELS,
    );
}

/** 统一格线层：1 像素间隙让底板透出网格，单次 stroke 完成。 */
function drawGridLines(node: cc.Node): void {
    const g = node.addComponent(cc.Graphics);
    const halfW = BOARD_PIXEL_WIDTH / 2;
    const halfH = BOARD_PIXEL_HEIGHT / 2;
    g.strokeColor = new cc.Color(88, 61, 55, 34);
    g.lineWidth = 1;
    for (let col = 0; col <= ART_GRID_COLS; col++) {
        const x = -halfW + col * ART_CELL_PIXELS;
        g.moveTo(x, -halfH);
        g.lineTo(x, halfH);
    }
    for (let row = 0; row <= ART_GRID_ROWS; row++) {
        const y = -halfH + row * ART_CELL_PIXELS;
        g.moveTo(-halfW, y);
        g.lineTo(halfW, y);
    }
    g.stroke();
}

function bindCarouselGestures(
    screen: cc.Node,
    track: cc.Node,
    artIndex: number,
    total: number,
    displayH: number,
    sideOffset: number,
    onShowArt: (index: number) => void,
    canNavigate?: () => boolean,
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
        // 动画期间禁止翻页：拖出的轨道先弹回原位。
        if (canNavigate && !canNavigate()) {
            resetTrack();
            return;
        }
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
        if (canNavigate && !canNavigate()) return;
        startX = event.getLocationX();
        dragX = 0;
        cc.Tween.stopAllByTarget(track);
        track.children.forEach((item) => cc.Tween.stopAllByTarget(item));
    }, gesture);
    gesture.on(cc.Node.EventType.TOUCH_MOVE, (event: cc.Event.EventTouch) => {
        if (navigating) return;
        if (canNavigate && !canNavigate()) return;
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
