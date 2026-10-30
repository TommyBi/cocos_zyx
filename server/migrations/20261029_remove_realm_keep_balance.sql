-- 删除旧秘境表，不返还已投入豆子；备份数据库后手动执行。
-- 服务启动不会自动清除线上玩家的历史秘境数据。
BEGIN TRANSACTION;
DROP TABLE IF EXISTS official_art_actions;
DROP TABLE IF EXISTS official_art_progress;
DROP INDEX IF EXISTS idx_week_happiness;
COMMIT;
