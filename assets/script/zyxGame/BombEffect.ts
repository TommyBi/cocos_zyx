import { createBombBadge } from './RewardArt';

export const BOMB_PRIME_TIME = 0.14;
export const BOMB_CHAIN_INTERVAL = 0.12;

/** 命中的格子退场即可掉落，尾部碎片和烟尘并行；输入锁单独覆盖尾部演出。 */
export function bombResolutionDelay(count: number): number {
    return count > 0 ? 0.34 + (count - 1) * BOMB_CHAIN_INTERVAL : 0.2;
}

export function bombPlaybackDuration(count: number): number {
    return count > 0 ? 1.18 + (count - 1) * BOMB_CHAIN_INTERVAL : 0;
}

/** 独立炸弹演出：引线蓄力、蔓延火圈、爆心与上升的小型蘑菇云。 */
export function playBombEffect(parent: cc.Node, center: cc.Vec2, cellSize: number,
    delay: number, onIgnite: () => void): void {
    const root = new cc.Node('bombExplosion');
    root.setPosition(center);
    root.setContentSize(cellSize * 3, cellSize * 3);
    root.zIndex = 80;
    root.opacity = 0;
    parent.addChild(root);
    const half = cellSize * 1.5;

    const glow = new cc.Node('bombEmberGlow');
    root.addChild(glow);
    const ember = glow.addComponent(cc.Graphics);
    ember.fillColor = new cc.Color(255, 184, 73, 45);
    ember.circle(0, 0, 32); ember.fill();
    ember.fillColor = new cc.Color(255, 230, 145, 90);
    ember.circle(0, 0, 21); ember.fill();
    cc.tween(glow).delay(delay).to(BOMB_PRIME_TIME, { scale: 1.6, opacity: 0 }).start();

    const wave = new cc.Node('bombFireRing');
    root.addChild(wave);
    wave.opacity = 0;
    wave.scale = 0.12;
    const fire = wave.addComponent(cc.Graphics);
    // 厚薄相间的火舌围绕热浪蔓延，不画几何选框；实际受击仍由格子高亮表达。
    fire.strokeColor = new cc.Color(246, 111, 32, 38);
    fire.lineWidth = 36;
    fire.circle(0, 0, half * 0.69); fire.stroke();
    fire.strokeColor = new cc.Color(246, 119, 32, 110);
    fire.lineWidth = 23;
    fire.circle(0, 0, half * 0.69); fire.stroke();
    fire.strokeColor = new cc.Color(255, 216, 106, 200);
    fire.lineWidth = 9;
    fire.circle(0, 0, half * 0.65); fire.stroke();
    for (let index = 0; index < 14; index++) {
        const angle = index * Math.PI * 2 / 14;
        const radius = half * (0.75 + index % 5 * 0.045);
        const point = (r: number, offset: number) => ({ x: Math.cos(angle + offset) * r,
            y: Math.sin(angle + offset) * r });
        const base = point(half * 0.58, -0.12);
        const outside = point(radius, -0.18);
        const tip = point(radius, 0.04 + index % 3 * 0.06);
        const inside = point(half * 0.68, 0.16);
        const end = point(half * 0.57, 0.12);
        fire.fillColor = new cc.Color(252, 144 + index % 3 * 16, 47, 185);
        fire.moveTo(base.x, base.y);
        fire.quadraticCurveTo(outside.x, outside.y, tip.x, tip.y);
        fire.quadraticCurveTo(inside.x, inside.y, end.x, end.y);
        fire.close(); fire.fill();
    }
    cc.tween(wave).delay(delay + BOMB_PRIME_TIME)
        .to(0.025, { opacity: 255 })
        .to(0.18, { scale: 1.02, opacity: 210 }, { easing: 'quadOut' })
        .to(0.18, { scale: 1.12, opacity: 0 }).start();

    const flash = new cc.Node('bombCoreFlash');
    root.addChild(flash);
    flash.opacity = 0;
    flash.scale = 0.25;
    const light = flash.addComponent(cc.Graphics);
    light.fillColor = new cc.Color(255, 189, 61, 120);
    light.circle(0, 0, 62); light.fill();
    light.fillColor = new cc.Color(255, 230, 146, 220);
    light.circle(0, 0, 39); light.fill();
    light.fillColor = new cc.Color(255, 255, 236, 255);
    light.circle(0, 0, 22); light.fill();
    cc.tween(flash).delay(delay + BOMB_PRIME_TIME)
        .to(0.025, { scale: 0.8, opacity: 255 })
        .to(0.14, { scale: 1.35, opacity: 0 }, { easing: 'quadOut' }).start();

    const sparks = new cc.Node('bombSparks');
    root.addChild(sparks);
    sparks.scale = 0.2;
    sparks.opacity = 0;
    const rays = sparks.addComponent(cc.Graphics);
    rays.fillColor = new cc.Color(255, 233, 151, 250);
    for (let index = 0; index < 12; index++) {
        const angle = index * Math.PI / 6;
        const radius = 66 + index % 3 * 12;
        rays.moveTo(Math.cos(angle - 0.055) * 23, Math.sin(angle - 0.055) * 23);
        rays.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
        rays.lineTo(Math.cos(angle + 0.055) * 23, Math.sin(angle + 0.055) * 23);
        rays.close(); rays.fill();
    }
    cc.tween(sparks).delay(delay + BOMB_PRIME_TIME).to(0.025, { opacity: 255 })
        .to(0.23, { scale: 1.1, opacity: 0 }, { easing: 'quadOut' }).start();

    const stem = new cc.Node('bombCloudStem');
    root.addChild(stem);
    stem.opacity = 0;
    stem.scaleX = 0.55;
    stem.scaleY = 0.2;
    const plume = stem.addComponent(cc.Graphics);
    plume.fillColor = new cc.Color(180, 118, 57, 160);
    plume.ellipse(0, 22, 17, 30); plume.fill();
    plume.ellipse(-9, 42, 12, 19); plume.fill();
    plume.ellipse(9, 42, 12, 19); plume.fill();
    plume.fillColor = new cc.Color(255, 213, 119, 190);
    plume.ellipse(-3, 21, 9, 24); plume.fill();
    cc.tween(stem).delay(delay + BOMB_PRIME_TIME + 0.035)
        .to(0.09, { opacity: 210, scaleX: 0.9, scaleY: 1 }, { easing: 'quadOut' })
        .to(0.38, { y: 25, scaleX: 1.15, scaleY: 1.3, opacity: 0 }).start();

    const cap = new cc.Node('bombMushroomCap');
    root.addChild(cap);
    cap.setPosition(0, 10);
    cap.scaleX = 0.3;
    cap.scaleY = 0.25;
    cap.opacity = 0;
    const cloud = cap.addComponent(cc.Graphics);
    cloud.fillColor = new cc.Color(158, 109, 62, 205);
    cloud.ellipse(-31, -5, 28, 22); cloud.fill();
    cloud.ellipse(0, 5, 42, 29); cloud.fill();
    cloud.ellipse(31, -5, 28, 22); cloud.fill();
    cloud.fillColor = new cc.Color(235, 165, 79, 235);
    cloud.ellipse(-29, 2, 24, 19); cloud.fill();
    cloud.ellipse(0, 12, 37, 25); cloud.fill();
    cloud.ellipse(29, 2, 24, 19); cloud.fill();
    cloud.fillColor = new cc.Color(255, 225, 159, 235);
    cloud.ellipse(-20, 13, 19, 13); cloud.fill();
    cloud.ellipse(3, 22, 25, 15); cloud.fill();
    cloud.ellipse(27, 12, 14, 11); cloud.fill();
    cc.tween(cap).delay(delay + BOMB_PRIME_TIME + 0.04)
        .to(0.1, { y: 32, scaleX: 0.9, scaleY: 0.75, opacity: 255 }, { easing: 'quadOut' })
        .to(0.24, { y: 66, scaleX: 1.22, scaleY: 1.05, opacity: 170 }, { easing: 'sineOut' })
        .to(0.18, { y: 83, scaleX: 1.4, scaleY: 1.15, opacity: 0 }).start();

    const body = createBombBadge(root);
    body.zIndex = 10;
    body.scale = 1.1;
    cc.tween(body).delay(delay)
        .to(0.06, { scale: 1.4, angle: -7 }, { easing: 'quadOut' })
        .to(BOMB_PRIME_TIME - 0.06, { scale: 1.65, angle: 6 }, { easing: 'quadIn' })
        .call(onIgnite)
        .to(0.035, { scale: 1.9, opacity: 0 }).start();
    cc.tween(root).delay(delay).to(0.055, { opacity: 255 })
        .delay(BOMB_PRIME_TIME + (0.45 - 0.055))
        .to(0.22, { opacity: 0 })
        .call(() => root.destroy()).start();
}
