export const BALLOON_FLIGHT_SECONDS = 15;
export const BALLOON_FRAME_RATE = 12;
export const BALLOON_FRAME_COUNT = 24;

/** 24帧矢量序列：只在换帧时重绘，不引入位图图集或首屏网络请求。 */
export class RescueBalloon {
    public readonly root: cc.Node;
    public elapsed = 0;
    private clock = 0;
    private frame = -1;
    private graphics: cc.Graphics;
    private fadeElapsed = -1;

    constructor(parent: cc.Node, private cell: number, onTap: () => void) {
        this.root = new cc.Node('rescueBalloon');
        this.root.setContentSize(cell * 2, cell * 2);
        this.root.zIndex = 160;
        parent.addChild(this.root);
        this.graphics = this.root.addComponent(cc.Graphics);
        this.root.on(cc.Node.EventType.TOUCH_END, (event: cc.Event.EventTouch) => {
            event.stopPropagation();
            onTap();
        });
        this.update(0, false);
    }

    /** 点击与暂停时冻结航程；爆炸退场独立计时，避免每帧重置透明度。 */
    public update(dt: number, canFly: boolean): boolean {
        if (canFly) this.clock += dt;
        if (canFly) this.elapsed = Math.min(BALLOON_FLIGHT_SECONDS, this.elapsed + dt);
        const progress = this.elapsed / BALLOON_FLIGHT_SECONDS;
        this.root.x = (progress * 2 - 1) * (this.cell * 4 + this.cell);
        this.root.y = this.cell * 4 - 6 + Math.sin(progress * Math.PI * 4) * this.cell * 0.11;
        this.root.angle = Math.sin(this.clock * Math.PI) * 3;
        if (this.fadeElapsed >= 0) this.fadeElapsed += dt;
        const fade = this.fadeElapsed < 0 ? 1 : Math.max(0, 1 - this.fadeElapsed / 0.32);
        this.root.opacity = Math.round(255 * Math.min(1, progress / 0.07, (1 - progress) / 0.12) * fade);
        const frame = Math.floor(this.clock * BALLOON_FRAME_RATE) % BALLOON_FRAME_COUNT;
        if (frame !== this.frame) {
            this.frame = frame;
            drawBalloonFrame(this.graphics, frame);
        }
        return this.elapsed >= BALLOON_FLIGHT_SECONDS;
    }

    public fadeOut(): void { this.fadeElapsed = 0; }

    public dispose(): void {
        if (!cc.isValid(this.root)) return;
        cc.Tween.stopAllByTarget(this.root);
        this.root.destroy();
    }
}

/** 匀速横移与二次曲线纵移组成真正的抛物线，起点、终点都精确落在目标位置。 */
export function getBalloonBombPosition(start: cc.Vec2, end: cc.Vec2, t: number): cc.Vec2 {
    const controlY = Math.max(start.y, end.y) + 100 + Math.min(60, Math.abs(end.x - start.x) * 0.2);
    return cc.v2(start.x + (end.x - start.x) * t,
        (1 - t) * (1 - t) * start.y + 2 * (1 - t) * t * controlY + t * t * end.y);
}

function oval(g: cc.Graphics, x: number, y: number, rx: number, ry: number, color: cc.Color): void {
    g.fillColor = color;
    g.ellipse(x, y, rx, ry); g.fill();
}

/** 奶油白与浅天蓝的布面星星气球，球囊不画五官，暖金藤篮随风轻摆。 */
export function drawBalloonFrame(g: cc.Graphics, frame: number): void {
    const cream = new cc.Color(255, 247, 224);
    const sky = new cc.Color(185, 221, 236);
    const blueEdge = new cc.Color(130, 177, 194);
    const honey = new cc.Color(185, 143, 95);
    const t = frame / BALLOON_FRAME_COUNT * Math.PI * 2;
    const sway = Math.sin(t) * 1.5;
    g.clear();
    g.lineWidth = 2.2;
    g.lineCap = cc.Graphics.LineCap.ROUND;
    g.lineJoin = cc.Graphics.LineJoin.ROUND;
    // 单一完整的圆润轮廓，避免拼接椭圆形成眼睛般的轮廓。
    g.fillColor = sky; g.strokeColor = blueEdge;
    g.moveTo(0, 70);
    g.bezierCurveTo(39, 72, 57, 47, 54, 20);
    g.bezierCurveTo(52, -3, 31, -19, 17, -29);
    g.lineTo(-17, -29);
    g.bezierCurveTo(-31, -19, -52, -3, -54, 20);
    g.bezierCurveTo(-57, 47, -39, 72, 0, 70);
    g.close(); g.fill(); g.stroke();
    // 右下布面柔和暗部，中央一整瓣香草奶油色。
    g.fillColor = new cc.Color(160, 204, 221);
    g.moveTo(29, 62); g.bezierCurveTo(53, 47, 58, 26, 47, 7);
    g.bezierCurveTo(36, -11, 24, -23, 17, -28);
    g.lineTo(8, -28); g.bezierCurveTo(31, -5, 45, 34, 29, 62); g.close(); g.fill();
    g.fillColor = cream;
    g.moveTo(0, 69); g.bezierCurveTo(25, 65, 31, 20, 14, -28);
    g.lineTo(-14, -28); g.bezierCurveTo(-31, 20, -25, 65, 0, 69); g.close(); g.fill();
    g.strokeColor = new cc.Color(143, 185, 199, 150); g.lineWidth = 1.4;
    g.moveTo(-15, 66); g.bezierCurveTo(-39, 44, -38, 6, -19, -26); g.stroke();
    g.moveTo(15, 66); g.bezierCurveTo(39, 44, 38, 6, 19, -26); g.stroke();
    oval(g, -30, 48, 11, 5, new cc.Color(255, 255, 255, 145));
    oval(g, -17, 55, 4, 2.5, new cc.Color(255, 255, 255, 145));
    // 软圆角小星星贴布，不添加眼睛、嘴或人形装饰。
    const points: number[][] = [];
    for (let i = 0; i < 10; i++) {
        const angle = Math.PI / 2 + i * Math.PI / 5;
        const radius = i % 2 ? 7 : 14;
        points.push([Math.cos(angle) * radius, 22 + Math.sin(angle) * radius]);
    }
    g.fillColor = new cc.Color(246, 204, 123); g.strokeColor = new cc.Color(217, 176, 107); g.lineWidth = 1.3;
    g.moveTo((points[9][0] + points[0][0]) / 2, (points[9][1] + points[0][1]) / 2);
    for (let i = 0; i < 10; i++) {
        const point = points[i], next = points[(i + 1) % 10];
        g.quadraticCurveTo(point[0], point[1], (point[0] + next[0]) / 2, (point[1] + next[1]) / 2);
    }
    g.close(); g.fill(); g.stroke();
    oval(g, -3, 28, 3, 2, new cc.Color(255, 248, 219, 190));
    // 轻薄收口与悬绳，燃烧器只保留一簇小小的暖光。
    g.fillColor = cream; g.strokeColor = honey; g.lineWidth = 1.8;
    g.roundRect(-17, -31, 34, 7, 3); g.fill(); g.stroke();
    for (const sign of [-1, 1]) {
        g.moveTo(sign * 13, -31); g.lineTo(sign * 19 + sway, -49); g.stroke();
    }
    g.fillColor = new cc.Color(251, 213, 130);
    g.moveTo(sway - 4, -43); g.quadraticCurveTo(sway - 6, -37, sway, -33 + Math.sin(t * 2) * 1.4);
    g.quadraticCurveTo(sway + 6, -37, sway + 4, -43); g.close(); g.fill();
    // 蜂蜜色编织藤篮与奶油色软边。
    g.fillColor = new cc.Color(224, 186, 139);
    g.roundRect(-25 + sway, -70, 50, 25, 8); g.fill(); g.stroke();
    g.strokeColor = new cc.Color(195, 155, 112, 155); g.lineWidth = 1.2;
    for (const x of [-16, -6, 4, 14]) { g.moveTo(x + sway, -51); g.lineTo(x + 6 + sway, -67); g.stroke(); }
    for (const y of [-55, -61, -66]) { g.moveTo(-20 + sway, y); g.lineTo(20 + sway, y); g.stroke(); }
    g.fillColor = new cc.Color(255, 239, 203); g.strokeColor = honey; g.lineWidth = 1.7;
    g.roundRect(-26 + sway, -51, 52, 8, 4); g.fill(); g.stroke();
    // 中间的浅蓝布结，与球囊同色，收住整套配色。
    g.fillColor = sky; g.strokeColor = blueEdge; g.lineWidth = 1.3;
    g.moveTo(sway, -54); g.quadraticCurveTo(sway - 16, -47, sway - 9, -60);
    g.lineTo(sway, -56); g.lineTo(sway + 9, -60); g.quadraticCurveTo(sway + 16, -47, sway, -54);
    g.close(); g.fill(); g.stroke();
    oval(g, sway, -55, 3, 3.5, new cc.Color(220, 238, 242));
}
