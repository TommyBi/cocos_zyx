/**
 * R0：微信构建产物 GM 字符串检查。
 *
 * 微信开发版/体验版/正式版均不得携带 GM UI、调试接口调用与相关字符串。
 * 构建完成后扫描 build/wechatgame 全部文本产物，以下关键词出现任何一个即判定失败：
 *   gmFloatingBubble / GM 补给 / debug/profile / debug/reset
 *
 * 用法：node scripts/check-wechat-gm.js [构建产物目录，默认 build/wechatgame]
 */
const fs = require('fs');
const path = require('path');

const GM_FORBIDDEN_KEYWORDS = ['gmFloatingBubble', 'GM 补给', 'debug/profile', 'debug/reset'];
// 只扫描文本类产物；二进制资源（图片/音频）不参与字符串检查。
const TEXT_EXTENSIONS = new Set(['.js', '.json', '.html', '.css', '.txt', '.plist', '.xml', '.md', '.ts']);

/**
 * Creator 构建会把字符串里的非 ASCII 字符转义为 \uXXXX（如「GM 补给」→「GM \u8865\u7ed9」），
 * 因此每个关键词都要同时匹配原始形式与 JS 转义形式（十六进制大小写不敏感）。
 */
function escapeNonAscii(text) {
    return text.replace(/[^\x00-\x7F]/g, (ch) => `\\u${ch.codePointAt(0).toString(16).padStart(4, '0')}`);
}

function contentIncludesKeyword(content, keyword) {
    if (content.includes(keyword)) return true;
    const escaped = escapeNonAscii(keyword);
    return escaped !== keyword && content.toLowerCase().includes(escaped.toLowerCase());
}

function scanForGmKeywords(targetDir) {
    const violations = [];
    const walk = (dir) => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const absolute = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                walk(absolute);
                continue;
            }
            if (!TEXT_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) continue;
            const content = fs.readFileSync(absolute, 'utf8');
            for (const keyword of GM_FORBIDDEN_KEYWORDS) {
                if (contentIncludesKeyword(content, keyword)) {
                    violations.push({ file: absolute, keyword });
                }
            }
        }
    };
    walk(targetDir);
    return violations;
}

module.exports = { scanForGmKeywords, GM_FORBIDDEN_KEYWORDS };

if (require.main === module) {
    const targetDir = path.resolve(__dirname, '..', process.argv[2] || path.join('build', 'wechatgame'));
    if (!fs.existsSync(targetDir)) {
        console.error(`构建产物目录不存在：${targetDir}`);
        process.exit(1);
    }
    const violations = scanForGmKeywords(targetDir);
    if (violations.length > 0) {
        console.error('微信构建产物检出 GM 相关内容：');
        for (const item of violations) {
            console.error(`  [${item.keyword}] ${item.file}`);
        }
        process.exit(1);
    }
    console.log(`微信产物 GM 检查通过：${GM_FORBIDDEN_KEYWORDS.join(' / ')} 均无结果`);
}
