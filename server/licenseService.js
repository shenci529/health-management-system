const QRCode = require('qrcode');

function generateLicenseCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 16; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function formatLicenseCode(code) {
  return code.replace(/(.{4})/g, '$1-').slice(0, -1);
}

async function generateQRCode(data, options = {}) {
  try {
    const defaultOptions = {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    };
    const opts = { ...defaultOptions, ...options };
    return await QRCode.toDataURL(data, opts);
  } catch (error) {
    console.error('生成二维码失败:', error);
    return null;
  }
}

function validateLicenseCode(code) {
  if (!code) return false;
  const cleaned = code.replace(/-/g, '').toUpperCase();
  return /^[A-Z0-9]{16}$/.test(cleaned);
}

function cleanLicenseCode(code) {
  return code.replace(/-/g, '').toUpperCase();
}

module.exports = {
  generateLicenseCode,
  formatLicenseCode,
  generateQRCode,
  validateLicenseCode,
  cleanLicenseCode
};
