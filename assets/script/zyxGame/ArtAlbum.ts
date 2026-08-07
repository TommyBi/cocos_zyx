import { BUTTON_COLORS, uimanager } from '../manager/Uimanager';
import { loadSpriteFrame } from '../manager/AssetLoader';
import { zyxGameModule } from '../dataModule/ZyxGameModule';
import { MOOD_COLORS } from './MoodArt';

/** 画册单幅设计尺寸：竖屏全幅素材。 */
export const ALBUM_ART_WIDTH = 750;
export const ALBUM_ART_HEIGHT = 1334;

/** 每 5 级开放下一本画册；第 1 本从 1 级起可用。 */
export const ALBUM_LEVEL_STEP = 5;

export type ArtMotif =
    | 'city'
    | 'season'
    | 'campus'
    | 'sea'
    | 'rain'
    | 'night'
    | 'spring'
    | 'letter'
    | 'travel'
    | 'candy'
    | 'sunny'
    | 'twilight';

export type AlbumArtDef = {
    id: string;
    title: string;
    cost: number;
    /** realm 分包内路径，对应 750×1334 竖图；缺失时回退程序化占位。 */
    imagePath: string;
    skyTop: cc.Color;
    skyBottom: cc.Color;
    accent: cc.Color;
    motif: ArtMotif;
};

export type AlbumDef = {
    id: string;
    title: string;
    theme: string;
    unlockLevel: number;
    arts: AlbumArtDef[];
};

type ArtBeat = {
    title: string;
    skyTop: cc.Color;
    skyBottom: cc.Color;
    accent: cc.Color;
    motif: ArtMotif;
};

type AlbumSeed = {
    id: string;
    title: string;
    theme: string;
    motif: ArtMotif;
    beats: ArtBeat[];
};

function c(r: number, g: number, b: number): cc.Color {
    return new cc.Color(r, g, b);
}

function artCost(index: number): number {
    if (index < 3) return 1;
    if (index < 6) return 2;
    return 3;
}

const ALBUM_SEEDS: AlbumSeed[] = [
    {
        id: 'album_city',
        title: '城市晚风',
        theme: '城市',
        motif: 'city',
        beats: [
            { title: '故宫暮色', skyTop: c(255, 168, 120), skyBottom: c(255, 220, 176), accent: c(214, 96, 88), motif: 'city' },
            { title: '斑马线对望', skyTop: c(186, 198, 220), skyBottom: c(255, 228, 196), accent: c(100, 124, 176), motif: 'city' },
            { title: '霓虹雨伞', skyTop: c(96, 88, 140), skyBottom: c(220, 140, 150), accent: c(255, 140, 120), motif: 'rain' },
            { title: '便利店门口', skyTop: c(72, 86, 142), skyBottom: c(255, 186, 140), accent: c(255, 214, 120), motif: 'night' },
            { title: '高架桥下', skyTop: c(148, 164, 196), skyBottom: c(255, 220, 196), accent: c(92, 108, 148), motif: 'city' },
            { title: '窗边绿植', skyTop: c(168, 210, 186), skyBottom: c(255, 244, 220), accent: c(92, 150, 120), motif: 'spring' },
            { title: '末班车灯光', skyTop: c(120, 148, 210), skyBottom: c(255, 198, 168), accent: c(88, 122, 186), motif: 'city' },
            { title: '河岸夜色', skyTop: c(72, 86, 142), skyBottom: c(255, 168, 132), accent: c(255, 214, 120), motif: 'twilight' },
        ],
    },
    {
        id: 'album_season',
        title: '四季窗边',
        theme: '季节',
        motif: 'season',
        beats: [
            { title: '春日窗帘', skyTop: c(186, 220, 186), skyBottom: c(255, 248, 230), accent: c(120, 176, 120), motif: 'spring' },
            { title: '夏日蝉声', skyTop: c(255, 214, 140), skyBottom: c(255, 244, 210), accent: c(244, 176, 72), motif: 'sunny' },
            { title: '秋叶书签', skyTop: c(255, 176, 120), skyBottom: c(255, 226, 186), accent: c(214, 120, 72), motif: 'season' },
            { title: '初雪窗台', skyTop: c(210, 220, 236), skyBottom: c(255, 248, 252), accent: c(150, 170, 200), motif: 'season' },
            { title: '雨后苔痕', skyTop: c(148, 186, 168), skyBottom: c(236, 244, 220), accent: c(88, 140, 110), motif: 'rain' },
            { title: '晒被子的午后', skyTop: c(255, 226, 170), skyBottom: c(255, 244, 220), accent: c(232, 168, 88), motif: 'sunny' },
            { title: '枫叶小路', skyTop: c(255, 160, 110), skyBottom: c(255, 214, 176), accent: c(196, 88, 72), motif: 'season' },
            { title: '跨年烟火远影', skyTop: c(72, 70, 120), skyBottom: c(255, 160, 130), accent: c(255, 220, 140), motif: 'night' },
        ],
    },
    {
        id: 'album_campus',
        title: '校园午后',
        theme: '校园',
        motif: 'campus',
        beats: [
            { title: '操场金色', skyTop: c(255, 206, 140), skyBottom: c(255, 240, 210), accent: c(232, 150, 80), motif: 'campus' },
            { title: '走廊风铃', skyTop: c(210, 226, 214), skyBottom: c(255, 246, 228), accent: c(120, 160, 140), motif: 'campus' },
            { title: '黑板粉笔灰', skyTop: c(186, 198, 210), skyBottom: c(244, 240, 228), accent: c(110, 120, 140), motif: 'letter' },
            { title: '自行车棚', skyTop: c(168, 196, 186), skyBottom: c(255, 236, 210), accent: c(88, 140, 120), motif: 'campus' },
            { title: '图书馆窗光', skyTop: c(255, 224, 186), skyBottom: c(255, 248, 232), accent: c(210, 150, 84), motif: 'letter' },
            { title: '放学铃响', skyTop: c(255, 186, 140), skyBottom: c(255, 226, 190), accent: c(214, 112, 88), motif: 'campus' },
            { title: '天台便当', skyTop: c(140, 186, 210), skyBottom: c(255, 228, 190), accent: c(88, 140, 176), motif: 'sunny' },
            { title: '毕业季合影虚影', skyTop: c(255, 198, 160), skyBottom: c(255, 236, 210), accent: c(196, 120, 100), motif: 'twilight' },
        ],
    },
    {
        id: 'album_sea',
        title: '海边日记',
        theme: '海边',
        motif: 'sea',
        beats: [
            { title: '潮汐线', skyTop: c(120, 176, 210), skyBottom: c(255, 236, 200), accent: c(72, 140, 176), motif: 'sea' },
            { title: '贝壳口袋', skyTop: c(255, 214, 176), skyBottom: c(255, 244, 220), accent: c(232, 160, 100), motif: 'sea' },
            { title: '灯塔剪影', skyTop: c(96, 120, 176), skyBottom: c(255, 186, 150), accent: c(255, 214, 120), motif: 'twilight' },
            { title: '浪花石阶', skyTop: c(150, 198, 214), skyBottom: c(236, 244, 230), accent: c(88, 150, 160), motif: 'sea' },
            { title: '日落甲板', skyTop: c(255, 148, 108), skyBottom: c(120, 96, 150), accent: c(255, 220, 160), motif: 'twilight' },
            { title: '渔港晨雾', skyTop: c(186, 206, 214), skyBottom: c(244, 246, 240), accent: c(120, 150, 160), motif: 'sea' },
            { title: '明信片印章', skyTop: c(255, 232, 196), skyBottom: c(255, 248, 232), accent: c(210, 140, 90), motif: 'letter' },
            { title: '月下沙滩', skyTop: c(72, 86, 142), skyBottom: c(186, 160, 180), accent: c(255, 230, 170), motif: 'night' },
        ],
    },
    {
        id: 'album_rain',
        title: '雨巷电台',
        theme: '雨巷',
        motif: 'rain',
        beats: [
            { title: '青石水洼', skyTop: c(140, 160, 176), skyBottom: c(220, 228, 220), accent: c(96, 120, 140), motif: 'rain' },
            { title: '收音机旋钮', skyTop: c(210, 196, 180), skyBottom: c(244, 236, 220), accent: c(168, 120, 88), motif: 'letter' },
            { title: '油纸伞影子', skyTop: c(120, 132, 156), skyBottom: c(220, 180, 170), accent: c(196, 96, 96), motif: 'rain' },
            { title: '巷口路灯', skyTop: c(88, 92, 120), skyBottom: c(255, 186, 140), accent: c(255, 210, 120), motif: 'night' },
            { title: '屋檐水帘', skyTop: c(168, 186, 196), skyBottom: c(236, 240, 232), accent: c(110, 140, 150), motif: 'rain' },
            { title: '旧磁带封面', skyTop: c(214, 186, 160), skyBottom: c(255, 240, 220), accent: c(176, 110, 80), motif: 'letter' },
            { title: '雾气玻璃', skyTop: c(186, 198, 210), skyBottom: c(244, 246, 248), accent: c(130, 150, 170), motif: 'rain' },
            { title: '雨停后的虹', skyTop: c(168, 196, 220), skyBottom: c(255, 226, 190), accent: c(255, 160, 120), motif: 'sunny' },
        ],
    },
    {
        id: 'album_night',
        title: '星夜便利店',
        theme: '夜晚',
        motif: 'night',
        beats: [
            { title: '冷柜微光', skyTop: c(72, 90, 140), skyBottom: c(160, 190, 210), accent: c(140, 210, 220), motif: 'night' },
            { title: '关东煮蒸汽', skyTop: c(90, 70, 100), skyBottom: c(255, 186, 140), accent: c(255, 170, 100), motif: 'night' },
            { title: '杂志架一角', skyTop: c(110, 100, 130), skyBottom: c(236, 220, 200), accent: c(210, 140, 110), motif: 'letter' },
            { title: '停车位猫影', skyTop: c(70, 78, 110), skyBottom: c(150, 140, 160), accent: c(220, 180, 120), motif: 'night' },
            { title: '自动门反射', skyTop: c(80, 100, 140), skyBottom: c(200, 210, 220), accent: c(160, 200, 220), motif: 'city' },
            { title: '热咖啡杯沿', skyTop: c(120, 90, 80), skyBottom: c(255, 220, 180), accent: c(214, 130, 80), motif: 'night' },
            { title: '银河补货道', skyTop: c(50, 56, 100), skyBottom: c(120, 100, 150), accent: c(255, 230, 160), motif: 'night' },
            { title: '打烊铃', skyTop: c(90, 80, 120), skyBottom: c(255, 170, 140), accent: c(255, 210, 130), motif: 'twilight' },
        ],
    },
    {
        id: 'album_spring',
        title: '春天口袋',
        theme: '春天',
        motif: 'spring',
        beats: [
            { title: '口袋里的种子', skyTop: c(186, 220, 176), skyBottom: c(255, 248, 226), accent: c(120, 176, 100), motif: 'spring' },
            { title: '樱花便签', skyTop: c(255, 214, 220), skyBottom: c(255, 246, 236), accent: c(232, 140, 150), motif: 'spring' },
            { title: '风筝线轴', skyTop: c(168, 210, 230), skyBottom: c(255, 244, 220), accent: c(88, 150, 186), motif: 'sunny' },
            { title: '青草鞋印', skyTop: c(150, 196, 150), skyBottom: c(236, 244, 210), accent: c(90, 150, 100), motif: 'spring' },
            { title: '菜市鲜花', skyTop: c(255, 196, 170), skyBottom: c(255, 240, 220), accent: c(232, 120, 110), motif: 'spring' },
            { title: '阳台豆芽', skyTop: c(186, 214, 176), skyBottom: c(255, 246, 226), accent: c(120, 168, 110), motif: 'spring' },
            { title: '春雨窗花', skyTop: c(170, 196, 186), skyBottom: c(236, 244, 230), accent: c(110, 150, 140), motif: 'rain' },
            { title: '第一声蛙鸣', skyTop: c(140, 180, 160), skyBottom: c(255, 236, 200), accent: c(88, 140, 120), motif: 'twilight' },
        ],
    },
    {
        id: 'album_evening',
        title: '晚安留言簿',
        theme: '夜晚絮语',
        motif: 'letter',
        beats: [
            { title: '枕边便签', skyTop: c(255, 232, 196), skyBottom: c(255, 248, 232), accent: c(210, 150, 84), motif: 'letter' },
            { title: '台灯圆圈', skyTop: c(90, 80, 110), skyBottom: c(255, 210, 150), accent: c(255, 200, 110), motif: 'night' },
            { title: '未完成的句子', skyTop: c(214, 206, 196), skyBottom: c(255, 246, 230), accent: c(150, 120, 100), motif: 'letter' },
            { title: '窗帘缝隙', skyTop: c(120, 110, 140), skyBottom: c(255, 190, 150), accent: c(255, 170, 120), motif: 'twilight' },
            { title: '热水袋温度', skyTop: c(210, 160, 150), skyBottom: c(255, 230, 210), accent: c(214, 110, 100), motif: 'letter' },
            { title: '星点贴纸', skyTop: c(72, 80, 130), skyBottom: c(160, 150, 190), accent: c(255, 230, 160), motif: 'night' },
            { title: '明天的闹钟', skyTop: c(186, 198, 214), skyBottom: c(255, 240, 220), accent: c(120, 140, 170), motif: 'letter' },
            { title: '入睡前的笑', skyTop: c(255, 186, 150), skyBottom: c(255, 230, 200), accent: c(232, 120, 100), motif: 'twilight' },
        ],
    },
    {
        id: 'album_travel',
        title: '小小的远方',
        theme: '旅行',
        motif: 'travel',
        beats: [
            { title: '车票折痕', skyTop: c(255, 226, 186), skyBottom: c(255, 246, 228), accent: c(210, 140, 90), motif: 'letter' },
            { title: '车窗云层', skyTop: c(160, 190, 220), skyBottom: c(255, 236, 210), accent: c(100, 140, 180), motif: 'travel' },
            { title: '陌生站台', skyTop: c(148, 164, 186), skyBottom: c(236, 228, 210), accent: c(110, 120, 150), motif: 'travel' },
            { title: '山路弯道', skyTop: c(140, 176, 150), skyBottom: c(255, 230, 190), accent: c(90, 140, 110), motif: 'season' },
            { title: '旅店钥匙', skyTop: c(214, 186, 150), skyBottom: c(255, 240, 220), accent: c(176, 120, 80), motif: 'letter' },
            { title: '地图折角', skyTop: c(186, 210, 176), skyBottom: c(255, 246, 226), accent: c(120, 160, 110), motif: 'travel' },
            { title: '回程晚霞', skyTop: c(255, 150, 110), skyBottom: c(120, 100, 150), accent: c(255, 214, 150), motif: 'twilight' },
            { title: '行李箱贴纸', skyTop: c(210, 196, 214), skyBottom: c(255, 236, 220), accent: c(150, 120, 156), motif: 'candy' },
        ],
    },
    {
        id: 'album_letter',
        title: '未寄出的信',
        theme: '书信',
        motif: 'letter',
        beats: [
            { title: '信封口胶水', skyTop: c(255, 236, 210), skyBottom: c(255, 248, 236), accent: c(210, 160, 100), motif: 'letter' },
            { title: '邮票齿孔', skyTop: c(255, 214, 186), skyBottom: c(255, 244, 226), accent: c(214, 120, 90), motif: 'letter' },
            { title: '钢笔墨点', skyTop: c(186, 198, 210), skyBottom: c(244, 242, 236), accent: c(90, 110, 140), motif: 'letter' },
            { title: '地址写错的一行', skyTop: c(220, 200, 186), skyBottom: c(255, 244, 228), accent: c(160, 120, 100), motif: 'letter' },
            { title: '信箱小窗', skyTop: c(168, 176, 196), skyBottom: c(236, 228, 214), accent: c(120, 108, 132), motif: 'city' },
            { title: '回信草稿', skyTop: c(255, 232, 196), skyBottom: c(255, 248, 232), accent: c(196, 140, 90), motif: 'letter' },
            { title: '火漆印', skyTop: c(214, 120, 110), skyBottom: c(255, 220, 190), accent: c(176, 70, 70), motif: 'letter' },
            { title: '终于寄出', skyTop: c(168, 196, 186), skyBottom: c(255, 240, 220), accent: c(90, 150, 120), motif: 'sunny' },
        ],
    },
    {
        id: 'album_candy',
        title: '玻璃糖纸',
        theme: '糖果色',
        motif: 'candy',
        beats: [
            { title: '柠檬汽水', skyTop: c(255, 236, 150), skyBottom: c(255, 250, 220), accent: c(232, 190, 70), motif: 'candy' },
            { title: '草莓牛奶', skyTop: c(255, 196, 210), skyBottom: c(255, 240, 236), accent: c(232, 120, 140), motif: 'candy' },
            { title: '薄荷硬糖', skyTop: c(170, 230, 210), skyBottom: c(236, 250, 240), accent: c(80, 180, 150), motif: 'candy' },
            { title: '焦糖玛奇朵', skyTop: c(214, 170, 120), skyBottom: c(255, 236, 210), accent: c(176, 110, 70), motif: 'candy' },
            { title: '蓝莓果冻', skyTop: c(160, 180, 230), skyBottom: c(230, 236, 250), accent: c(100, 120, 200), motif: 'candy' },
            { title: '棉花糖云', skyTop: c(255, 220, 230), skyBottom: c(255, 246, 240), accent: c(232, 150, 170), motif: 'candy' },
            { title: '汽水泡泡', skyTop: c(186, 230, 230), skyBottom: c(244, 250, 246), accent: c(90, 180, 180), motif: 'candy' },
            { title: '糖纸折光', skyTop: c(255, 200, 150), skyBottom: c(255, 236, 210), accent: c(255, 140, 100), motif: 'sunny' },
        ],
    },
    {
        id: 'album_sunny',
        title: '晴天收藏夹',
        theme: '晴天',
        motif: 'sunny',
        beats: [
            { title: '晒干的衬衫', skyTop: c(255, 226, 170), skyBottom: c(255, 248, 230), accent: c(232, 168, 88), motif: 'sunny' },
            { title: '自行车铃', skyTop: c(168, 210, 230), skyBottom: c(255, 244, 220), accent: c(88, 150, 186), motif: 'sunny' },
            { title: '柠檬树影', skyTop: c(186, 220, 150), skyBottom: c(255, 246, 210), accent: c(140, 180, 80), motif: 'spring' },
            { title: '公园长椅', skyTop: c(255, 214, 160), skyBottom: c(255, 240, 210), accent: c(214, 140, 80), motif: 'sunny' },
            { title: '冰淇淋车', skyTop: c(255, 196, 186), skyBottom: c(255, 240, 226), accent: c(232, 120, 110), motif: 'candy' },
            { title: '风筝的高度', skyTop: c(140, 186, 230), skyBottom: c(255, 236, 200), accent: c(80, 140, 196), motif: 'travel' },
            { title: '向日葵田', skyTop: c(255, 210, 120), skyBottom: c(255, 244, 200), accent: c(232, 170, 60), motif: 'sunny' },
            { title: '傍晚的影子拉长', skyTop: c(255, 176, 120), skyBottom: c(255, 226, 180), accent: c(214, 110, 88), motif: 'twilight' },
        ],
    },
];

function buildAlbums(): AlbumDef[] {
    return ALBUM_SEEDS.map((seed, albumIndex) => ({
        id: seed.id,
        title: seed.title,
        theme: seed.theme,
        unlockLevel: 1 + albumIndex * ALBUM_LEVEL_STEP,
        arts: seed.beats.map((beat, artIndex) => ({
            id: `${seed.id}_art_${artIndex}`,
            title: beat.title,
            cost: artCost(artIndex),
            imagePath: `images/albums/${seed.id}_${artIndex}`,
            skyTop: beat.skyTop,
            skyBottom: beat.skyBottom,
            accent: beat.accent,
            motif: beat.motif,
        })),
    }));
}

export const ART_ALBUMS: AlbumDef[] = buildAlbums();

export function getAlbumById(albumId: string): AlbumDef | null {
    return ART_ALBUMS.find((album) => album.id === albumId) || null;
}

export function isAlbumUnlockedByLevel(album: AlbumDef, level: number = zyxGameModule.level): boolean {
    return level >= album.unlockLevel;
}

export function isArtUnlocked(artId: string): boolean {
    return zyxGameModule.getUnlockedAlbumArts()[artId] === true;
}

export function countUnlockedArts(album: AlbumDef): number {
    let count = 0;
    for (const art of album.arts) {
        if (isArtUnlocked(art.id)) count++;
    }
    return count;
}

export function getNextUnlockableArt(album: AlbumDef): AlbumArtDef | null {
    for (const art of album.arts) {
        if (!isArtUnlocked(art.id)) return art;
    }
    return null;
}

export function isAlbumComplete(album: AlbumDef): boolean {
    return album.arts.every((art) => isArtUnlocked(art.id));
}

/** 程序化占位插画：实图未到位时使用，尺寸按竖屏画布绘制。 */
export function drawAlbumArt(
    host: cc.Node,
    art: AlbumArtDef,
    width: number = ALBUM_ART_WIDTH,
    height: number = ALBUM_ART_HEIGHT,
): void {
    host.removeAllChildren();
    host.width = width;
    host.height = height;
    const g = host.getComponent(cc.Graphics) || host.addComponent(cc.Graphics);
    g.clear();
    const size = Math.min(width, height);

    const bands = 18;
    for (let i = 0; i < bands; i++) {
        const t = i / (bands - 1);
        const y = height / 2 - (i + 1) * (height / bands);
        g.fillColor = new cc.Color(
            Math.round(art.skyTop.r + (art.skyBottom.r - art.skyTop.r) * t),
            Math.round(art.skyTop.g + (art.skyBottom.g - art.skyTop.g) * t),
            Math.round(art.skyTop.b + (art.skyBottom.b - art.skyTop.b) * t),
            255,
        );
        g.rect(-width / 2, y, width, height / bands + 1);
        g.fill();
    }

    g.fillColor = new cc.Color(
        Math.max(40, art.accent.r - 70),
        Math.max(40, art.accent.g - 50),
        Math.max(50, art.accent.b - 40),
        120,
    );
    g.moveTo(-width / 2, -height * 0.02);
    g.quadraticCurveTo(-width * 0.25, height * 0.08, 0, 0);
    g.quadraticCurveTo(width * 0.22, -height * 0.06, width / 2, height * 0.04);
    g.lineTo(width / 2, -height / 2);
    g.lineTo(-width / 2, -height / 2);
    g.close();
    g.fill();

    drawMotif(g, art, size);

    g.fillColor = new cc.Color(255, 244, 210, 36);
    g.circle(-width * 0.22, height * 0.18, size * 0.16);
    g.fill();
    g.fillColor = new cc.Color(art.accent.r, art.accent.g, art.accent.b, 28);
    g.circle(width * 0.26, height * 0.14, size * 0.12);
    g.fill();
}

function drawMotif(g: cc.Graphics, art: AlbumArtDef, size: number): void {
    const a = art.accent;
    switch (art.motif) {
        case 'city':
            for (let i = 0; i < 7; i++) {
                const w = 28 + (i % 3) * 12;
                const h = 70 + (i * 37) % 120;
                const x = -size * 0.34 + i * 52;
                g.fillColor = new cc.Color(70 + i * 8, 78 + i * 6, 96 + i * 5, 200);
                g.rect(x, -size * 0.28, w, h);
                g.fill();
                g.fillColor = new cc.Color(255, 220, 140, 160);
                g.rect(x + 6, -size * 0.28 + h - 24, 8, 8);
                g.fill();
            }
            break;
        case 'season':
            g.fillColor = new cc.Color(a.r, a.g, a.b, 200);
            for (let i = 0; i < 5; i++) {
                g.ellipse(-size * 0.2 + i * 48, size * 0.08, 18, 28);
                g.fill();
            }
            g.fillColor = new cc.Color(90, 70, 50, 180);
            g.rect(-6, -size * 0.2, 12, size * 0.28);
            g.fill();
            break;
        case 'campus':
            g.fillColor = new cc.Color(240, 244, 248, 220);
            g.roundRect(-size * 0.28, -size * 0.12, size * 0.56, size * 0.3, 12);
            g.fill();
            g.fillColor = new cc.Color(a.r, a.g, a.b, 200);
            g.rect(-size * 0.22, 0, size * 0.44, 10);
            g.fill();
            g.fillColor = new cc.Color(90, 120, 90, 160);
            g.ellipse(0, -size * 0.22, size * 0.3, size * 0.08);
            g.fill();
            break;
        case 'sea':
            g.fillColor = new cc.Color(255, 236, 170, 230);
            g.circle(size * 0.18, size * 0.22, 26);
            g.fill();
            g.fillColor = new cc.Color(80, 140, 180, 100);
            g.ellipse(0, -size * 0.2, size * 0.42, size * 0.12);
            g.fill();
            g.strokeColor = new cc.Color(255, 250, 220, 180);
            g.lineWidth = 3;
            g.moveTo(-size * 0.3, -size * 0.12);
            g.quadraticCurveTo(0, -size * 0.02, size * 0.3, -size * 0.14);
            g.stroke();
            break;
        case 'rain':
            g.strokeColor = new cc.Color(220, 230, 240, 160);
            g.lineWidth = 2;
            for (let i = 0; i < 12; i++) {
                const x = -size * 0.35 + i * 36;
                g.moveTo(x, size * 0.3);
                g.lineTo(x - 10, size * 0.05);
                g.stroke();
            }
            g.fillColor = new cc.Color(a.r, a.g, a.b, 180);
            g.circle(0, -size * 0.05, 22);
            g.fill();
            g.roundRect(-20, -size * 0.18, 40, 36, 8);
            g.fill();
            break;
        case 'night':
            g.fillColor = new cc.Color(255, 236, 170, 230);
            g.circle(size * 0.2, size * 0.22, 22);
            g.fill();
            g.fillColor = new cc.Color(255, 250, 220, 200);
            for (let i = 0; i < 8; i++) {
                g.circle(-size * 0.3 + (i * 47) % 280, size * 0.1 + (i % 3) * 30, 2.5);
                g.fill();
            }
            g.fillColor = new cc.Color(255, 244, 210, 220);
            g.roundRect(-size * 0.18, -size * 0.16, size * 0.36, size * 0.22, 10);
            g.fill();
            break;
        case 'spring':
            g.fillColor = new cc.Color(a.r, a.g, a.b, 190);
            for (let i = 0; i < 6; i++) {
                const x = -size * 0.28 + i * 48;
                g.circle(x, size * 0.05, 14);
                g.fill();
                g.circle(x + 10, size * 0.12, 10);
                g.fill();
            }
            break;
        case 'letter':
            g.fillColor = new cc.Color(255, 248, 226, 235);
            g.roundRect(-size * 0.18, -size * 0.12, size * 0.36, size * 0.3, 10);
            g.fill();
            g.strokeColor = new cc.Color(a.r, a.g, a.b, 180);
            g.lineWidth = 3;
            g.moveTo(-size * 0.12, 0.04 * size);
            g.lineTo(size * 0.12, 0.04 * size);
            g.moveTo(-size * 0.12, -0.04 * size);
            g.lineTo(size * 0.1, -0.03 * size);
            g.stroke();
            break;
        case 'travel':
            g.fillColor = new cc.Color(240, 244, 248, 230);
            g.roundRect(-size * 0.3, -size * 0.05, size * 0.6, size * 0.14, 16);
            g.fill();
            g.fillColor = new cc.Color(a.r, a.g, a.b, 200);
            for (let i = 0; i < 3; i++) {
                g.roundRect(-size * 0.22 + i * 70, 0, 48, 30, 6);
                g.fill();
            }
            break;
        case 'candy':
            g.fillColor = new cc.Color(a.r, a.g, a.b, 210);
            g.ellipse(0, 0, size * 0.22, size * 0.14);
            g.fill();
            g.fillColor = new cc.Color(255, 255, 255, 120);
            g.ellipse(-size * 0.06, size * 0.03, size * 0.08, size * 0.04);
            g.fill();
            g.fillColor = new cc.Color(255, 220, 180, 200);
            g.moveTo(-size * 0.22, 0);
            g.lineTo(-size * 0.34, size * 0.08);
            g.lineTo(-size * 0.34, -size * 0.08);
            g.close();
            g.fill();
            g.moveTo(size * 0.22, 0);
            g.lineTo(size * 0.34, size * 0.08);
            g.lineTo(size * 0.34, -size * 0.08);
            g.close();
            g.fill();
            break;
        case 'sunny':
            g.fillColor = new cc.Color(255, 220, 120, 230);
            g.circle(size * 0.18, size * 0.2, 30);
            g.fill();
            g.strokeColor = new cc.Color(255, 230, 150, 180);
            g.lineWidth = 4;
            for (let i = 0; i < 8; i++) {
                const rad = (Math.PI * 2 * i) / 8;
                g.moveTo(size * 0.18 + Math.cos(rad) * 36, size * 0.2 + Math.sin(rad) * 36);
                g.lineTo(size * 0.18 + Math.cos(rad) * 52, size * 0.2 + Math.sin(rad) * 52);
                g.stroke();
            }
            break;
        case 'twilight':
            g.fillColor = new cc.Color(255, 210, 140, 210);
            g.circle(size * 0.2, size * 0.16, 34);
            g.fill();
            g.fillColor = new cc.Color(60, 48, 70, 150);
            g.moveTo(-size / 2, -size * 0.05);
            g.lineTo(-size * 0.1, size * 0.12);
            g.lineTo(size * 0.05, -size * 0.02);
            g.lineTo(size / 2, size * 0.08);
            g.lineTo(size / 2, -size / 2);
            g.lineTo(-size / 2, -size / 2);
            g.close();
            g.fill();
            break;
        default:
            break;
    }
}

export type AlbumViewOptions = {
    screen: cc.Node;
    albumId: string;
    artIndex: number;
    onBackToShelf: () => void;
    onShowArt: (artIndex: number) => void;
    drawMiniBottle: (parent: cc.Node, x: number, y: number) => void;
};

/** 渲染一本画册：750×1334 竖图全幅欣赏，开心瓶点亮时遮罩自下而上揭开。 */
export function renderAlbumView(options: AlbumViewOptions): void {
    const album = getAlbumById(options.albumId);
    if (!album) {
        options.onBackToShelf();
        return;
    }
    if (!isAlbumUnlockedByLevel(album)) {
        uimanager.showToast(`达到 Lv.${album.unlockLevel} 后可打开这本画册`);
        options.onBackToShelf();
        return;
    }

    const { screen, onBackToShelf, onShowArt, drawMiniBottle } = options;
    const artIndex = Math.max(0, Math.min(album.arts.length - 1, options.artIndex));
    const art = album.arts[artIndex];
    const height = screen.height;
    const width = screen.width;
    const unlockedCount = countUnlockedArts(album);
    const viewingUnlocked = isArtUnlocked(art.id);
    const nextArt = getNextUnlockableArt(album);
    const canUnlockHere = !!(nextArt && nextArt.id === art.id);

    const fit = Math.min(width / ALBUM_ART_WIDTH, height / ALBUM_ART_HEIGHT);
    const displayW = Math.round(ALBUM_ART_WIDTH * fit);
    const displayH = Math.round(ALBUM_ART_HEIGHT * fit);

    createAlbumBackdrop(screen);

    const stage = new cc.Node('albumStage');
    stage.width = displayW;
    stage.height = displayH;
    stage.setPosition(0, 0);
    stage.zIndex = 10;
    screen.addChild(stage);

    const artRoot = mountPortraitArt(stage, art, displayW, displayH, {
        revealed: viewingUnlocked,
        animateReveal: false,
    });

    if (!viewingUnlocked) {
        const veil = uimanager.createRect(stage, 'artVeil', displayW, displayH, new cc.Color(48, 38, 34), 210, 0);
        veil.zIndex = 40;
        uimanager.createLabel(veil, canUnlockHere ? '点亮后慢慢揭开' : '尚未点亮', 0, 18, 28, cc.Color.WHITE, 360, 40);
        uimanager.createLabel(
            veil,
            canUnlockHere ? '用开心瓶揭开这幅画' : '先点亮前面的画',
            0,
            -20,
            16,
            new cc.Color(255, 236, 210),
            360,
            30,
        );
    }

    const topBar = uimanager.createRect(screen, 'albumTopBar', width, 96, new cc.Color(255, 246, 224), 236, 0, 0, height / 2 - 48);
    topBar.zIndex = 100;
    uimanager.createButton(topBar, '‹ 书架', -width / 2 + 78, 8, 116, 48, BUTTON_COLORS.green, onBackToShelf, 18);
    uimanager.createLabel(topBar, `${album.theme} · ${album.title}`, 0, 14, 22, MOOD_COLORS.cocoa, 360, 30);
    uimanager.createLabel(topBar, `${art.title} · ${unlockedCount}/${album.arts.length}`, 0, -16, 15, MOOD_COLORS.cocoaSoft, 400, 26);
    const bottleHud = uimanager.createRect(topBar, 'albumBottleHud', 132, 40, new cc.Color(255, 248, 230), 245, 14, width / 2 - 86, 8);
    uimanager.createLabel(bottleHud, `开心瓶 × ${zyxGameModule.happyBottleCount}`, 0, 0, 14, MOOD_COLORS.cocoa, 120, 28);

    const dots = new cc.Node('artDots');
    dots.setPosition(0, height / 2 - 108);
    dots.zIndex = 110;
    screen.addChild(dots);
    const dotG = dots.addComponent(cc.Graphics);
    const total = album.arts.length;
    const span = Math.min(420, width - 100);
    for (let i = 0; i < total; i++) {
        const x = -span / 2 + (span * i) / Math.max(1, total - 1);
        const done = isArtUnlocked(album.arts[i].id);
        const current = i === artIndex;
        dotG.fillColor = current
            ? BUTTON_COLORS.green
            : done
                ? new cc.Color(242, 188, 72)
                : new cc.Color(190, 176, 160);
        dotG.circle(x, 0, current ? 5 : 3.5);
        dotG.fill();
    }

    const navY = -height / 2 + 78;
    if (canUnlockHere && nextArt) {
        const enough = zyxGameModule.happyBottleCount >= nextArt.cost;
        const action = uimanager.createRect(
            screen,
            'unlockArtAction',
            280,
            60,
            enough ? new cc.Color(255, 246, 224) : new cc.Color(232, 214, 196),
            255,
            20,
            0,
            navY,
        );
        action.zIndex = 120;
        action.addComponent(cc.Button);
        const labelColor = enough ? new cc.Color(48, 128, 73) : new cc.Color(195, 69, 61);
        uimanager.createLabel(action, `点亮画作  开心瓶 × ${nextArt.cost}`, 18, 0, 18, labelColor, 230, 30);
        drawMiniBottle(action, -108, 0);
        let unlocking = false;
        action.on(cc.Node.EventType.TOUCH_END, () => {
            if (unlocking) return;
            if (!zyxGameModule.unlockAlbumArt(nextArt.id, nextArt.cost)) {
                uimanager.showToast(`开心瓶不足，还需要 ${nextArt.cost - zyxGameModule.happyBottleCount} 个`);
                return;
            }
            unlocking = true;
            action.opacity = 120;
            const veil = stage.getChildByName('artVeil');
            if (veil && cc.isValid(veil)) {
                cc.tween(veil).to(0.22, { opacity: 0 }).call(() => veil.destroy()).start();
            }
            playMaskReveal(artRoot, displayW, displayH, () => {
                uimanager.showToast('画册又亮起了一幅');
                onShowArt(artIndex);
            });
        }, action);
    } else {
        if (artIndex > 0) {
            uimanager.createButton(screen, '上一幅', -130, navY, 150, 54, BUTTON_COLORS.yellow, () => onShowArt(artIndex - 1), 20);
        }
        if (artIndex < album.arts.length - 1) {
            uimanager.createButton(
                screen,
                '下一幅',
                artIndex > 0 ? 130 : 0,
                navY,
                150,
                54,
                BUTTON_COLORS.green,
                () => onShowArt(artIndex + 1),
                20,
            );
        } else if (isAlbumComplete(album)) {
            uimanager.createLabel(screen, '本册已集齐 · 可以随时回来翻看', 0, navY, 17, new cc.Color(48, 111, 74), 520, 30);
        }
    }
}

type PortraitMountOptions = {
    revealed: boolean;
    animateReveal: boolean;
};

/** 挂载竖图：遮罩从底部长高，实现慢慢揭开。 */
function mountPortraitArt(
    parent: cc.Node,
    art: AlbumArtDef,
    displayW: number,
    displayH: number,
    options: PortraitMountOptions,
): cc.Node {
    const root = new cc.Node('portraitArtRoot');
    root.width = displayW;
    root.height = displayH;
    root.setPosition(0, 0);
    parent.addChild(root);

    const fallback = new cc.Node('fallbackArt');
    fallback.setPosition(0, 0);
    fallback.zIndex = 1;
    root.addChild(fallback);
    drawAlbumArt(fallback, art, displayW, displayH);

    const maskNode = new cc.Node('revealMask');
    maskNode.setAnchorPoint(0.5, 0);
    maskNode.setPosition(0, -displayH / 2);
    maskNode.width = displayW;
    maskNode.height = options.revealed || options.animateReveal ? (options.animateReveal ? 0 : displayH) : 0;
    maskNode.zIndex = 5;
    root.addChild(maskNode);
    const mask = maskNode.addComponent(cc.Mask);
    mask.type = cc.Mask.Type.RECT;

    const spriteNode = new cc.Node('artSprite');
    spriteNode.setAnchorPoint(0.5, 0);
    spriteNode.setPosition(0, 0);
    spriteNode.width = displayW;
    spriteNode.height = displayH;
    maskNode.addChild(spriteNode);
    const sprite = spriteNode.addComponent(cc.Sprite);
    sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
    spriteNode.opacity = 0;

    (root as any).revealMask = maskNode;
    (root as any).revealDisplayH = displayH;

    loadSpriteFrame('realm', art.imagePath, (error, frame) => {
        if (!cc.isValid(spriteNode)) return;
        if (error || !frame) return;
        sprite.spriteFrame = frame;
        spriteNode.width = displayW;
        spriteNode.height = displayH;
        spriteNode.opacity = 255;
        if (cc.isValid(fallback)) fallback.opacity = 0;
    });

    return root;
}

/** 自下而上揭开遮罩。 */
function playMaskReveal(artRoot: cc.Node, _displayW: number, displayH: number, onDone: () => void): void {
    const maskNode: cc.Node = (artRoot as any).revealMask;
    if (!maskNode || !cc.isValid(maskNode)) {
        onDone();
        return;
    }
    maskNode.height = 0;
    cc.tween(maskNode)
        .to(1.15, { height: displayH }, { easing: 'sineInOut' })
        .call(onDone)
        .start();
}

function createAlbumBackdrop(screen: cc.Node): void {
    const bg = new cc.Node('albumBackdrop');
    bg.width = screen.width;
    bg.height = screen.height;
    bg.zIndex = -20;
    screen.addChild(bg);
    const g = bg.addComponent(cc.Graphics);
    g.fillColor = new cc.Color(42, 34, 32);
    g.rect(-screen.width / 2, -screen.height / 2, screen.width, screen.height);
    g.fill();
}
