const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

(async () => {
  try {
    const SQL = await initSqlJs();
    const dbDir = path.join(__dirname, 'database');
    const dbPath = path.join(dbDir, 'health_management.db');
    let db;

    if (fs.existsSync(dbPath)) {
      const buf = fs.readFileSync(dbPath);
      db = new SQL.Database(buf);
      console.log('✅ 从文件加载数据库');
    } else {
      db = new SQL.Database();
      console.log('⚠️  数据库文件不存在，将创建新数据库');
      const schemaPath = path.join(dbDir, 'schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schema = fs.readFileSync(schemaPath, 'utf8');
        try {
          db.exec(schema);
          console.log('✅ schema.sql 执行成功');
          const data = db.export();
          fs.writeFileSync(dbPath, Buffer.from(data));
          console.log('✅ 数据库已保存');
        } catch (e) {
          console.error('❌ schema.sql 执行失败:', e.message);
          process.exit(1);
        }
      } else {
        console.error('❌ schema.sql 不存在');
        process.exit(1);
      }
    }

    // 检查表
    const tablesResult = db.exec("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('表列表:', tablesResult[0] ? tablesResult[0].values.map(v => v[0]) : '无');

    // 检查 licenses 表
    try {
      const count = db.exec('SELECT COUNT(*) as count FROM licenses');
      console.log('✅ licenses 表存在，当前记录数:', count[0].values[0][0]);
    } catch (e) {
      console.log('❌ licenses 表不存在:', e.message);
      console.log('将尝试创建 licenses 表...');
      db.exec(`
        CREATE TABLE IF NOT EXISTS licenses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          license_code VARCHAR(64) NOT NULL UNIQUE,
          qr_code TEXT,
          customer_name VARCHAR(100),
          customer_phone VARCHAR(20),
          customer_email VARCHAR(100),
          school_name VARCHAR(200),
          status VARCHAR(20) DEFAULT 'active',
          valid_start DATE,
          valid_end DATE,
          max_users INTEGER DEFAULT 100,
          created_by INTEGER,
          sold_at DATETIME,
          activated_at DATETIME,
          activated_by VARCHAR(100),
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      const data = db.export();
      fs.writeFileSync(dbPath, Buffer.from(data));
      console.log('✅ licenses 表创建并保存成功');
    }

    // 测试 INSERT
    const licenseService = require('./licenseService');
    const testCode = licenseService.generateLicenseCode();
    const formatted = licenseService.formatLicenseCode(testCode);
    const qrCode = await licenseService.generateQRCode('LICENSE:' + testCode);
    const now = new Date().toISOString();
    const validStart = now.split('T')[0];
    const validEnd = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    try {
      const stmt = db.prepare('INSERT INTO licenses (license_code, qr_code, customer_name, customer_phone, customer_email, school_name, valid_start, valid_end, max_users, created_by, sold_at, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
      stmt.bind([testCode, qrCode, '测试客户', '13800000000', 'test@test.com', '测试学校', validStart, validEnd, 100, 1, now, '测试']);
      stmt.step();
      stmt.free();
      const data = db.export();
      fs.writeFileSync(dbPath, Buffer.from(data));
      console.log('✅ INSERT 测试成功，授权码:', formatted);
      console.log('✅ 测试通过！');
    } catch (e) {
      console.error('❌ INSERT 测试失败:', e.message);
      console.error('错误详情:', e);
    }
  } catch (e) {
    console.error('❌ 初始化失败:', e.message, e.stack);
  }
})();
