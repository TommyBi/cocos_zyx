const DEFAULT_WECHAT_APP_ID = 'wxdc39c78bfd045896';
const DEFAULT_WECHAT_API_BASE = 'https://api.weixin.qq.com';
const WECHAT_LOGIN_TIMEOUT_MS = 8000;

function weChatLoginError(message, status, errorCode) {
  const error = new Error(message);
  error.status = status;
  error.errorCode = errorCode;
  return error;
}

/** 仅服务端持有 AppSecret；用一次性 code 换取微信权威 openid，不接收客户端提交的 openid。 */
async function exchangeWeChatLoginCode(loginCode) {
  const appId = process.env.WECHAT_APP_ID || DEFAULT_WECHAT_APP_ID;
  const appSecret = String(process.env.WECHAT_APP_SECRET || '').trim();
  if (!appSecret) {
    throw weChatLoginError('服务端未配置微信登录密钥，已停止设备账号兜底建档', 503, 'WECHAT_LOGIN_NOT_CONFIGURED');
  }

  const baseUrl = String(process.env.WECHAT_API_BASE_URL || DEFAULT_WECHAT_API_BASE).replace(/\/+$/, '');
  const url = new URL(`${baseUrl}/sns/jscode2session`);
  url.searchParams.set('appid', appId);
  url.searchParams.set('secret', appSecret);
  url.searchParams.set('js_code', loginCode);
  url.searchParams.set('grant_type', 'authorization_code');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), WECHAT_LOGIN_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal });
    const payload = await response.json();
    if (!response.ok || payload.errcode || !payload.openid) {
      const weChatCode = Number(payload.errcode) || response.status;
      throw weChatLoginError(`微信登录凭证校验失败（${weChatCode}）`, 502, 'WECHAT_LOGIN_CODE_INVALID');
    }
    return String(payload.openid);
  } catch (error) {
    if (error && error.errorCode) throw error;
    throw weChatLoginError('微信登录服务暂时不可用，请稍后重试', 502, 'WECHAT_LOGIN_UNAVAILABLE');
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { exchangeWeChatLoginCode };
