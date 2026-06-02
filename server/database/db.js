// 引入SQLite3数据库库（verbose模式开启详细日志）
const sqlite3 = require('sqlite3').verbose();
const path = require('path'); // 引入path模块，用于处理文件路径

// ==================== 数据库文件路径配置 ====================
// 构建数据库文件的完整路径：当前目录 + health_management.db
const dbPath = path.join(__dirname, 'health_management.db');

// ==================== 创建数据库连接 ====================
// 连接到SQLite数据库文件（如果文件不存在会自动创建）
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    // 如果连接失败，在控制台打印错误信息
    console.error('❌ 数据库连接失败:', err.message);
  } else {
    // 如果连接成功，打印成功信息
    console.log('✅ 数据库连接成功');
  }
});

// ==================== Promise封装的数据库操作类 ====================
// 由于sqlite3库是基于回调的，我们用Promise包装一下，方便使用async/await
class Database {
  // 【方法1】执行查询，返回多行数据（比如查询用户列表、班级列表）
  static all(sql, params = []) {
    return new Promise((resolve, reject) => {
      // 调用sqlite3的all方法执行SQL
      db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('❌ 查询错误:', err.message);
          reject(err); // 如果出错，拒绝Promise
        } else {
          resolve(rows); // 如果成功，返回查询结果（多行数据）
        }
      });
    });
  }

  // 【方法2】执行查询，返回单行数据（比如查询单个用户详情）
  static get(sql, params = []) {
    return new Promise((resolve, reject) => {
      // 调用sqlite3的get方法执行SQL（只返回第一行结果）
      db.get(sql, params, (err, row) => {
        if (err) {
          console.error('❌ 查询错误:', err.message);
          reject(err);
        } else {
          resolve(row); // 返回单行数据
        }
      });
    });
  }

  // 【方法3】执行插入/更新/删除操作（不返回查询数据）
  static run(sql, params = []) {
    return new Promise((resolve, reject) => {
      // 注意这里必须用function()而不是箭头函数，因为要访问this.lastID和this.changes
      db.run(sql, params, function(err) {
        if (err) {
          console.error('❌ 执行错误:', err.message);
          reject(err);
        } else {
          // 返回：lastID是插入的新记录ID，changes是受影响的行数
          resolve({ 
            lastID: this.lastID, 
            changes: this.changes 
          });
        }
      });
    });
  }

  // 【方法4】执行多个SQL语句（比如初始化数据库表结构）
  static exec(sql) {
    return new Promise((resolve, reject) => {
      db.exec(sql, (err) => {
        if (err) {
          console.error('❌ 执行错误:', err.message);
          reject(err);
        } else {
          resolve(); // 执行成功，没有返回数据
        }
      });
    });
  }
}

// ==================== 导出模块 ====================
// 导出原始数据库实例和我们封装好的Database类，供其他文件使用
module.exports = {
  db, // 原始的sqlite3数据库连接对象
  Database // 封装好的Promise版数据库操作类
};
