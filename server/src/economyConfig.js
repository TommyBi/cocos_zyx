/**
 * 服务端权威经济配置（阶段 A）。
 * 与客户端 assets/script/dataModule/MoodBeanConfig.ts 保持一致；
 * 客户端提交的任何数量都以这里重新计算为准。
 */

/** 官方拼画：130 列 × 156 行 = 20,280 个逻辑豆位。 */
const ART_GRID_COLS = 130;
const ART_GRID_ROWS = 156;
const ART_TOTAL_CELLS = ART_GRID_COLS * ART_GRID_ROWS;

/** 单次拼画投入上限 = 一整幅画作的豆位数：一次放置可投完手中全部开心豆，不设更小批次上限。 */
const MAX_CONTRIBUTE_PER_ACTION = ART_TOTAL_CELLS;

/** 画册白名单与开放等级；册内画作按顺序制作。 */
const ALBUMS = [
  { id: 'album_season', artCount: 48, openLevel: 1 },
  { id: 'album_city', artCount: 12, openLevel: 5 },
];

/** 结算单次收集上限（异常请求兜底）。 */
const MAX_COLLECTED_MOOD_BEANS_PER_ROUND = 5000;

/**
 * 对局时间校验窗口（与客户端 MoodBeanConfig 保持一致）。
 * 时间戳不是不可伪造凭据，只与收集上限、请求频率一起作为基础风控。
 */
const MIN_ROUND_DURATION_MS = 5 * 1000;
const MAX_ROUND_DURATION_MS = 4 * 60 * 60 * 1000;
const MAX_FUTURE_SKEW_MS = 2 * 60 * 1000;
/** 离线补传窗口：7 天内的真实离线对局允许补传，超期永久拒绝。 */
const MAX_OFFLINE_SETTLEMENT_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/** artId → { albumId, index } 的服务端白名单。 */
const ART_WHITELIST = {};
ALBUMS.forEach((album) => {
  for (let index = 0; index < album.artCount; index++) {
    ART_WHITELIST[`${album.id}_art_${index}`] = { albumId: album.id, index };
  }
});

function getAlbumById(albumId) {
  return ALBUMS.find((album) => album.id === albumId) || null;
}

function getArtInfo(artId) {
  return ART_WHITELIST[artId] || null;
}

module.exports = {
  ART_GRID_COLS,
  ART_GRID_ROWS,
  ART_TOTAL_CELLS,
  MAX_CONTRIBUTE_PER_ACTION,
  MAX_COLLECTED_MOOD_BEANS_PER_ROUND,
  MIN_ROUND_DURATION_MS,
  MAX_ROUND_DURATION_MS,
  MAX_FUTURE_SKEW_MS,
  MAX_OFFLINE_SETTLEMENT_AGE_MS,
  ALBUMS,
  getAlbumById,
  getArtInfo,
};
