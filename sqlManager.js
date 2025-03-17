const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Yrb13145211',
    database: 'user',
    connectionLimit: 10,       // 最大连接数
    queueLimit: 50,           // 等待队列的最大数量
    waitForConnections: true  // 当连接数达到上限时是否等待
});

// 通过openId查询用户
function queryUserByOpenId(openId) {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM userSheet WHERE openId = ?', [openId], (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

// 通过userId查询用户
function queryUserByUserId(userId) {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM userSheet WHERE userId = ?', [userId], (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

// 注册用户
function registerUser(openId, nickName, avatarUrl) {
    return new Promise((resolve, reject) => {
        pool.query('INSERT INTO userSheet (openId) VALUES (?)', [openId], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
}
/**
  更新用户信息（使用事务的方式进行数据库的修改提交操作, 其中涉及到beginTransaction 和 commit 的操作行为组合）
  这种模式确保了：
- 原子性：所有操作要么全部成功，要么全部失败
- 一致性：数据库始终保持有效状态
- 隔离性：事务中的操作对其他连接不可见，直到提交
- 持久性：一旦提交，更改就是永久性的
  因此，是的， commit() 确实会提交 beginTransaction() 之后执行的所有操作，使它们永久生效。 
 */
async function updateUserInfo(openId, newInfo) {
    const connection = await pool.promise().getConnection();
    try {
        await connection.beginTransaction();

        // 执行多个操作
        await connection.query('UPDATE userSheet SET ... WHERE openId = ?', [openId]);
        await connection.query('INSERT INTO userLog ...', [newInfo]);

        await connection.commit();
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
}

// 定期检查连接池状态
setInterval(() => {
    console.log(`Active connections: ${pool._allConnections.length}`);
    console.log(`Idle connections: ${pool._freeConnections.length}`);
    console.log(`Waiting for connection: ${pool._connectionQueue.length}`);
}, 10000);

module.exports = {
    queryUserByOpenId: queryUserByOpenId,
    queryUserByUserId: queryUserByUserId,
    registerUser: registerUser,
}