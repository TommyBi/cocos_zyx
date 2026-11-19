import { uimanager, BUTTON_COLORS } from '../manager/UIManager';
import { createMoodBean } from './MoodArt';
import { createHeartToken } from './HeartEffect';

/** 留言按语气停顿；整段结束后才开放领取，所有动画随弹窗节点销毁。 */
export function showHeartLetter(days: number, onAccept: () => void): cc.Node {
    const root = uimanager.showModal('', '', [], null, 200, false, false, 600);
    const bubble = root.getChildByName('panel');
    bubble.removeAllChildren();
    bubble.name = 'heartSpeechBubble';
    const g = bubble.getComponent(cc.Graphics);
    g.clear(); g.fillColor = new cc.Color(255, 248, 229);
    g.strokeColor = new cc.Color(175, 133, 96); g.lineWidth = 3;
    g.moveTo(-260, 246); g.lineTo(260, 246);
    g.quadraticCurveTo(296, 246, 296, 210); g.lineTo(296, -140);
    g.quadraticCurveTo(296, -176, 260, -176); g.lineTo(-165, -176);
    g.quadraticCurveTo(-207, -222, -255, -211);
    g.quadraticCurveTo(-225, -196, -229, -176); g.lineTo(-260, -176);
    g.quadraticCurveTo(-296, -176, -296, -140); g.lineTo(-296, 210);
    g.quadraticCurveTo(-296, 246, -260, 246); g.close(); g.fill(); g.stroke();
    createMoodBean(bubble, 1, -239, -233, 70);
    const lines = [
        { text: '你的开心在我看来', y: 163, size: 28 },
        { text: '远比广告更重要，', y: 109, size: 28 },
        { text: '谢谢你', y: 45, size: 28 },
        { text: `${days}天的喜爱！`, y: -20, size: 42 },
        { text: '剩下的交给我', y: -109, size: 28 },
    ];
    const labels = lines.map((line, index) => {
        const color = index === 3 ? new cc.Color(221, 114, 146) : new cc.Color(88, 61, 55);
        const label = uimanager.createLabel(bubble, line.text, 25, line.y, line.size, color, 470, 60);
        label.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
        if (index === 3) {
            label.node.name = 'heartLetterDays';
            const outline = label.node.addComponent(cc.LabelOutline);
            outline.color = color; outline.width = 1.2;
        }
        label.string = '';
        return label;
    });
    const heart = createHeartToken(bubble, 24); heart.setPosition(135, -109); heart.opacity = 0;
    let accepted = false;
    const button = uimanager.createButton(bubble, '收下祝福', 18, -276, 380, 76, BUTTON_COLORS.green, () => {
        if (accepted) return;
        accepted = true; uimanager.closeModal(); onAccept();
    }, 28);
    button.name = 'acceptHeartBlessing'; button.opacity = 0;
    const control = button.getComponent(cc.Button); control.interactable = false;
    let time = 0.35;
    lines.forEach((line, row) => {
        const chars = Array.from(line.text);
        chars.forEach((char, index) => {
            time += /[，！]/.test(char) ? 0.32 : [0.065, 0.11, 0.075, 0.14, 0.055][(index + row) % 5];
            cc.tween(labels[row].node).delay(time).call(() => {
                if (cc.isValid(root)) labels[row].string = chars.slice(0, index + 1).join('');
            }).start();
        });
        time += row === 2 || row === 3 ? 0.38 : 0.18;
    });
    cc.tween(heart).delay(time - 0.18).to(0.3, { opacity: 255 }).start();
    cc.tween(button).delay(time + 0.2).to(0.8, { opacity: 255 }, { easing: 'sineInOut' })
        .call(() => {
            control.interactable = true;
            cc.tween(button).repeatForever(cc.tween().to(1.1, { scale: 1.035 }, { easing: 'sineInOut' })
                .to(1.1, { scale: 1 }, { easing: 'sineInOut' })).start();
        }).start();
    return root;
}
