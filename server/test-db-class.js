const { Database } = require('./database/db');
const licenseService = require('./licenseService');

(async () => {
  try {
    await Database.init();
    console.log('=== 测试 1: 查询授权码列表 ===');
    const result = Database.all('SELECT * FROM licenses ORDER BY created_at DESC');
    console.log('  成功! 共 ' + result.length + ' 条记录');
    result.forEach(l => {
      l.formatted_code = licenseService.formatLicenseCode(l.license_code);
      console.log('   - id=' + l.id + ', code=' + l.formatted_code + ', status=' + l.status);
    });

    console.log('\n=== 测试 2: 生成新授权码 ===');
    const code = licenseService.generateLicenseCode();
    const qrCode = await licenseService.generateQRCode('LICENSE:' + code);
    const validStart = new Date().toISOString().split('T')[0];
    const validEnd = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const r = Database.run(
      'INSERT INTO licenses (license_code, qr_code, customer_name, customer_phone, customer_email, school_name, valid_start, valid_end, max_users, created_by, sold_at, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [code, qrCode, '测试客户', '13800000000', 'test@test.com', '测试学校', validStart, validEnd, 100, 1, new Date().toISOString(), 'API测试生成']
    );
    console.log('  成功! 新授权码 ID=' + r.lastID + ', code=' + licenseService.formatLicenseCode(code));

    console.log('\n=== 测试 3: 带参数查询 ===');
    const active = Database.get("SELECT COUNT(*) as count FROM licenses WHERE status = 'active'");
    const used = Database.get("SELECT COUNT(*) as count FROM licenses WHERE status = 'used'");
    console.log('  成功! active=' + active.count + ', used=' + used.count);

    console.log('\n=== 测试 4: status 过滤 ===');
    const filtered = Database.all('SELECT * FROM licenses WHERE status = ? ORDER BY created_at DESC', ['active']);
    console.log('  成功! active状态共 ' + filtered.length + ' 条');

    console.log('\n✅ 所有测试通过!');
  } catch (e) {
    console.error('❌ 测试失败:', e.message);
    console.error(e.stack);
  }
})();
