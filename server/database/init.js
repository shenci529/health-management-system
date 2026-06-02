const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'health_management.db');

console.log('========================================');
console.log('  幼儿中小学生健康管理系统 - 数据库初始化');
console.log('========================================');
console.log('');
console.log('数据库文件:', dbPath);
console.log('');

let db;

try {
  db = new Database(dbPath);
  console.log('✅ 数据库连接成功');
  console.log('');
} catch (err) {
  console.error('❌ 数据库连接失败:', err.message);
  process.exit(1);
}

const schemaPath = path.join(__dirname, 'schema.sql');
const schemaSql = fs.readFileSync(schemaPath, 'utf8');

console.log('📋 开始执行数据库初始化脚本...');
console.log('');

try {
  db.exec(schemaSql);
  console.log('✅ 数据库表结构创建成功');
  console.log('');

  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
  console.log('📊 创建的表列表:');
  tables.forEach((table, index) => {
    console.log(`   ${index + 1}. ${table.name}`);
  });
  console.log('');

  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get();
  console.log(`👤 用户表中有 ${userCount.count} 条记录`);

  const gradeCount = db.prepare("SELECT COUNT(*) as count FROM grades").get();
  console.log(`🏫 年级表中有 ${gradeCount.count} 条记录`);

  const classCount = db.prepare("SELECT COUNT(*) as count FROM classes").get();
  console.log(`🏢 班级表中有 ${classCount.count} 条记录`);

  console.log('');
  console.log('========================================');
  console.log('  ✅ 数据库初始化完成!');
  console.log('========================================');
  console.log('');
  console.log('📝 默认账号:');
  console.log('   用户名: admin');
  console.log('   密码: admin123');
  console.log('');

  db.close();
  console.log('🔒 数据库连接已关闭');

} catch (err) {
  console.error('❌ 数据库初始化失败:', err.message);
  db.close();
  process.exit(1);
}
