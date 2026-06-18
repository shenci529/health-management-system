const express = require('express');
const router = express.Router();
const { Database } = require('../database/db');
const licenseService = require('../licenseService');

// ============ GET /api/license ============
router.get('/', (req, res) => {
  try {
    const { status } = req.query;
    let sql = 'SELECT * FROM licenses ORDER BY created_at DESC';
    const params = [];
    if (status) {
      sql = 'SELECT * FROM licenses WHERE status = ? ORDER BY created_at DESC';
      params.push(status);
    }
    const licenses = Database.all(sql, params);
    licenses.forEach(license => {
      if (license.license_code) {
        license.formatted_code = licenseService.formatLicenseCode(license.license_code);
      }
    });
    res.json({ success: true, data: licenses });
  } catch (err) {
    console.error('获取授权码列表失败:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============ GET /api/license/stats ============
router.get('/stats', (req, res) => {
  try {
    const active = Database.get("SELECT COUNT(*) as count FROM licenses WHERE status = 'active'");
    const used = Database.get("SELECT COUNT(*) as count FROM licenses WHERE status = 'used'");
    const expired = Database.get("SELECT COUNT(*) as count FROM licenses WHERE status = 'expired'");
    const revoked = Database.get("SELECT COUNT(*) as count FROM licenses WHERE status = 'revoked'");
    res.json({
      success: true,
      data: {
        total: (active ? active.count : 0) + (used ? used.count : 0) + (expired ? expired.count : 0) + (revoked ? revoked.count : 0),
        active: active ? active.count : 0,
        used: used ? used.count : 0,
        expired: expired ? expired.count : 0,
        revoked: revoked ? revoked.count : 0
      }
    });
  } catch (err) {
    console.error('获取统计失败:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============ GET /api/license/:id ============
router.get('/:id', (req, res) => {
  try {
    const license = Database.get('SELECT * FROM licenses WHERE id = ?', [req.params.id]);
    if (!license) {
      return res.status(404).json({ success: false, message: '授权码不存在' });
    }
    if (license.license_code) {
      license.formatted_code = licenseService.formatLicenseCode(license.license_code);
    }
    res.json({ success: true, data: license });
  } catch (err) {
    console.error('获取授权码详情失败:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============ POST /api/license/generate ============
router.post('/generate', async (req, res) => {
  try {
    const { customer_name = '', customer_phone = '', customer_email = '', school_name = '', valid_days = 365, max_users = 100, notes = '' } = req.body;

    const licenseCode = licenseService.generateLicenseCode();
    const formattedCode = licenseService.formatLicenseCode(licenseCode);

    const qrData = 'LICENSE:' + licenseCode;
    const qrCode = await licenseService.generateQRCode(qrData);

    const validStart = new Date().toISOString().split('T')[0];
    const validEnd = valid_days
      ? new Date(Date.now() + valid_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : null;

    const result = Database.run(
      'INSERT INTO licenses (license_code, qr_code, customer_name, customer_phone, customer_email, school_name, valid_start, valid_end, max_users, created_by, sold_at, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [licenseCode, qrCode, customer_name, customer_phone, customer_email, school_name, validStart, validEnd || '', max_users, req.body.created_by || 1, new Date().toISOString(), notes]
    );

    res.json({
      success: true,
      id: result.lastID,
      license_code: formattedCode,
      qr_code: qrCode,
      valid_start: validStart,
      valid_end: validEnd
    });
  } catch (err) {
    console.error('生成授权码失败:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============ POST /api/license/:id/activate ============
router.post('/:id/activate', (req, res) => {
  try {
    const { code, activated_by } = req.body;
    const cleanCode = licenseService.cleanLicenseCode(code);
    const license = Database.get('SELECT * FROM licenses WHERE license_code = ? AND id = ?', [cleanCode, req.params.id]);

    if (!license) {
      return res.json({ success: false, message: '授权码不匹配' });
    }
    if (license.status !== 'active') {
      return res.json({ success: false, message: '授权码已失效' });
    }
    if (license.valid_end && new Date(license.valid_end) < new Date()) {
      Database.run('UPDATE licenses SET status = ? WHERE id = ?', ['expired', req.params.id]);
      return res.json({ success: false, message: '授权码已过期' });
    }

    Database.run(
      'UPDATE licenses SET status = ?, activated_at = ?, activated_by = ? WHERE id = ?',
      ['used', new Date().toISOString(), activated_by || 'unknown', req.params.id]
    );

    res.json({ success: true, message: '授权激活成功' });
  } catch (err) {
    console.error('激活授权码失败:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============ POST /api/license/:id/revoke ============
router.post('/:id/revoke', (req, res) => {
  try {
    Database.run('UPDATE licenses SET status = ? WHERE id = ?', ['revoked', req.params.id]);
    res.json({ success: true, message: '授权已撤销' });
  } catch (err) {
    console.error('撤销授权码失败:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============ DELETE /api/license/:id ============
router.delete('/:id', (req, res) => {
  try {
    Database.run('DELETE FROM licenses WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: '授权已删除' });
  } catch (err) {
    console.error('删除授权码失败:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============ POST /api/license/validate ============
router.post('/validate', (req, res) => {
  try {
    const { code } = req.body;
    if (!licenseService.validateLicenseCode(code)) {
      return res.json({ success: false, message: '授权码格式不正确' });
    }
    const cleanCode = licenseService.cleanLicenseCode(code);
    const license = Database.get('SELECT * FROM licenses WHERE license_code = ?', [cleanCode]);
    if (!license) {
      return res.json({ success: false, message: '授权码不存在' });
    }
    if (license.status === 'revoked') {
      return res.json({ success: false, message: '授权码已被撤销' });
    }
    if (license.status === 'expired') {
      return res.json({ success: false, message: '授权码已过期' });
    }
    if (license.status === 'used') {
      return res.json({ success: false, message: '授权码已被使用' });
    }
    if (license.valid_end && new Date(license.valid_end) < new Date()) {
      Database.run('UPDATE licenses SET status = ? WHERE id = ?', ['expired', license.id]);
      return res.json({ success: false, message: '授权码已过期' });
    }
    res.json({
      success: true,
      data: {
        id: license.id,
        formatted_code: licenseService.formatLicenseCode(license.license_code),
        customer_name: license.customer_name,
        school_name: license.school_name,
        valid_end: license.valid_end,
        max_users: license.max_users
      }
    });
  } catch (err) {
    console.error('验证授权码失败:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============ POST /api/license/qr-generate ============
router.post('/qr-generate', async (req, res) => {
  try {
    const tempToken = 'TEMP_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
    const expireTime = new Date(Date.now() + 30 * 60 * 1000);
    const qrData = JSON.stringify({ type: 'activate', token: tempToken, expire: expireTime.toISOString() });
    const qrCode = await licenseService.generateQRCode(qrData, { width: 200 });
    res.json({ success: true, qr_code: qrCode, temp_token: tempToken, expire_time: expireTime.toLocaleString() });
  } catch (err) {
    console.error('生成二维码失败:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============ GET /api/license/info ============
router.get('/info', (req, res) => {
  try {
    const licenseInfo = Database.get('SELECT * FROM licenses WHERE status = "used" ORDER BY activated_at DESC LIMIT 1');
    if (licenseInfo && licenseInfo.license_code) {
      licenseInfo.formatted_code = licenseService.formatLicenseCode(licenseInfo.license_code);
    }
    res.json({ success: true, data: licenseInfo });
  } catch (err) {
    console.error('获取授权信息失败:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
