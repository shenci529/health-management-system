const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

(async () => {
  const SQL = await initSqlJs();
  const db = new SQL.Database();

  // 创建测试表
  db.exec('CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, name TEXT, value INTEGER)');

  // 测试 1: dbInstance.run(sql, params) - 可能不支持
  console.log('测试 1: dbInstance.run(sql, params)');
  try {
    db.run('INSERT INTO test (name, value) VALUES (?, ?)', ['test1', 100]);
    console.log('  ✅ 成功');
  } catch (e) {
    console.log('  ❌ 失败:', e.message);
  }

  // 测试 2: dbInstance.run(sql)
  console.log('测试 2: dbInstance.run(sql)');
  try {
    db.run('INSERT INTO test (name, value) VALUES ("test2", 200)');
    console.log('  ✅ 成功');
  } catch (e) {
    console.log('  ❌ 失败:', e.message);
  }

  // 测试 3: prepare + bind + step
  console.log('测试 3: prepare + bind + step');
  try {
    const stmt = db.prepare('INSERT INTO test (name, value) VALUES (?, ?)');
    stmt.bind(['test3', 300]);
    stmt.step();
    stmt.free();
    console.log('  ✅ 成功');
  } catch (e) {
    console.log('  ❌ 失败:', e.message);
  }

  // 验证结果
  const result = db.exec('SELECT * FROM test');
  console.log('数据库内容:', result[0] ? result[0].values : '空');
})();
