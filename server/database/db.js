const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'health_management.db');

let db;

try {
  db = new Database(dbPath, { verbose: console.log });
  console.log('✅ 数据库连接成功');
} catch (err) {
  console.error('❌ 数据库连接失败:', err.message);
  throw err;
}

class DB {
  static all(sql, params = []) {
    try {
      const stmt = db.prepare(sql);
      return stmt.all(params);
    } catch (err) {
      console.error('❌ 查询错误:', err.message);
      throw err;
    }
  }

  static get(sql, params = []) {
    try {
      const stmt = db.prepare(sql);
      return stmt.get(params);
    } catch (err) {
      console.error('❌ 查询错误:', err.message);
      throw err;
    }
  }

  static run(sql, params = []) {
    try {
      const stmt = db.prepare(sql);
      const result = stmt.run(params);
      return {
        lastID: result.lastInsertRowid,
        changes: result.changes
      };
    } catch (err) {
      console.error('❌ 执行错误:', err.message);
      throw err;
    }
  }

  static exec(sql) {
    try {
      db.exec(sql);
    } catch (err) {
      console.error('❌ 执行错误:', err.message);
      throw err;
    }
  }

  static prepare(sql) {
    return db.prepare(sql);
  }
}

module.exports = {
  db,
  Database: DB
};
