// 引入必要的模块
const sqlite3 = require('sqlite3').verbose(); // SQLite3数据库库
const path = require('path'); // 处理文件路径
const fs = require('fs'); // 读写文件系统

// ==================== 准备数据库目录 ====================
// 确保数据库所在的目录存在（虽然这里就是当前目录，但这个逻辑通用）
const dbDir = path.join(__dirname);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true }); // 如果目录不存在，递归创建
}

// ==================== 数据库文件路径 ====================
const dbPath = path.join(dbDir, 'health_management.db');

// ==================== 打印初始化信息 ====================
console.log('========================================');
console.log('  幼儿中小学生健康管理系统 - 数据库初始化');
console.log('========================================');
console.log('');
console.log('数据库文件:', dbPath); // 显示数据库文件的完整路径
console.log('');

// ==================== 连接到数据库 ====================
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ 数据库连接失败:', err.message);
    process.exit(1); // 连接失败就退出程序，错误码为1
  }
  console.log('✅ 数据库连接成功');
  console.log('');
});

// ==================== 读取SQL建表脚本 ====================
// 从同目录的schema.sql文件中读取建表语句
const schemaPath = path.join(__dirname, 'schema.sql');
const schemaSql = fs.readFileSync(schemaPath, 'utf8');

console.log('📋 开始执行数据库初始化脚本...');
console.log('');

// ==================== 执行SQL初始化脚本 ====================
// db.serialize()确保所有SQL操作按顺序执行
db.serialize(() => {
  // 执行schema.sql中的所有SQL语句
  db.exec(schemaSql, (err) => {
    if (err) {
      console.error('❌ 数据库初始化失败:', err.message);
      db.close();
      process.exit(1);
    }
    
    console.log('✅ 数据库表结构创建成功');
    console.log('');
    
    // 【验证1】查询并打印创建的所有表
    db.all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name", [], (err, tables) => {
      if (err) {
        console.error('❌ 查询表失败:', err.message);
      } else {
        console.log('📊 创建的表列表:');
        tables.forEach((table, index) => {
          console.log(`   ${index + 1}. ${table.name}`); // 打印表名
        });
        console.log('');
      }
      
      // 【验证2】检查用户表的数据数量
      db.get("SELECT COUNT(*) as count FROM users", [], (err, row) => {
        if (!err) {
          console.log(`👤 用户表中有 ${row.count} 条记录`);
        }
        
        // 【验证3】检查年级表的数据数量
        db.get("SELECT COUNT(*) as count FROM grades", [], (err, row) => {
          if (!err) {
            console.log(`🏫 年级表中有 ${row.count} 条记录`);
          }
          
          // 【验证4】检查班级表的数据数量
          db.get("SELECT COUNT(*) as count FROM classes", [], (err, row) => {
            if (!err) {
              console.log(`🏢 班级表中有 ${row.count} 条记录`);
            }
            
            // ==================== 初始化完成提示 ====================
            console.log('');
            console.log('========================================');
            console.log('  ✅ 数据库初始化完成!');
            console.log('========================================');
            console.log('');
            console.log('📝 默认账号:');
            console.log('   用户名: admin');
            console.log('   密码: admin123');
            console.log('');
            
            // 关闭数据库连接
            db.close((err) => {
              if (err) {
                console.error('关闭数据库失败:', err.message);
              } else {
                console.log('🔒 数据库连接已关闭');
              }
            });
          });
        });
      });
    });
  });
});

// ==================== 全局错误监听 ====================
db.on('error', (err) => {
  console.error('数据库错误:', err.message);
});
