const initSqlJs = require('sql.js');
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

async function initDB() {
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  
  console.log('✅ 数据库连接成功');
  console.log('');

  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  console.log('📋 开始执行数据库初始化脚本...');
  console.log('');

  db.exec(schemaSql);
  console.log('✅ 数据库表结构创建成功');
  console.log('');

  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
  console.log('📊 创建的表列表:');
  let i = 1;
  while (tables.step()) {
    const table = tables.getAsObject();
    console.log(`   ${i}. ${table.name}`);
    i++;
  }
  tables.free();
  console.log('');

  const userCount = db.prepare("SELECT COUNT(*) as count FROM users");
  if (userCount.step()) {
    const result = userCount.getAsObject();
    console.log(`👤 用户表中有 ${result.count} 条记录`);
  }
  userCount.free();

  const gradeCount = db.prepare("SELECT COUNT(*) as count FROM grades");
  if (gradeCount.step()) {
    const result = gradeCount.getAsObject();
    console.log(`🏫 年级表中有 ${result.count} 条记录`);
  }
  gradeCount.free();

  const classCount = db.prepare("SELECT COUNT(*) as count FROM classes");
  if (classCount.step()) {
    const result = classCount.getAsObject();
    console.log(`🏢 班级表中有 ${result.count} 条记录`);
  }
  classCount.free();

  console.log('');
  console.log('========================================');
  console.log('  ✅ 数据库初始化完成!');
  console.log('========================================');
  console.log('');
  console.log('📝 默认账号:');
  console.log('   用户名: admin');
  console.log('   密码: admin123');
  console.log('');

  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
  console.log('💾 数据库已保存');

  db.close();
  console.log('🔒 数据库连接已关闭');
}

initDB().catch(err => {
  console.error('❌ 数据库初始化失败:', err);
  process.exit(1);
});
