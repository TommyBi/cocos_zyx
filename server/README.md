# 消除烦恼 Server

服务端负责微信登录创角、最高分上报和排行榜查询。不要把 `WECHAT_APP_SECRET` 写进前端。

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

接口：

- `POST /api/login`：参数 `code`、可选 `token`、`nickName`、`avatar`
- `POST /api/produce`：参数 `token`、`gridInfo`、`gameInfo`、`comboTimes`、`diamondInterval`，返回服务端生成的下一行和难度状态
- `POST /api/score`：参数 `token`、`score`
- `GET /api/leaderboard?limit=500&token=...`
- 线上路径同样支持 `/v1/xiaochu-fannao/api/*`

排行榜查询最多返回前 500；服务端按全服最高分计算个人排名，超过前 2000 返回未上榜。
