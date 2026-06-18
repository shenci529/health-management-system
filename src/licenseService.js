const SECRET_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function computeChecksum(randomPart) {
  let h1 = 0, h2 = 0, h3 = 0, h4 = 0;
  for (let i = 0; i < randomPart.length; i++) {
    const c = randomPart.charCodeAt(i);
    h1 = ((h1 * 31 + c) % 36 + 36) % 36;
    h2 = ((h2 * 17 + c * (i + 1)) % 36 + 36) % 36;
    h3 = ((h3 * 23 + c * (i + 2)) % 36 + 36) % 36;
    h4 = ((h4 * 19 + c * (i + 3)) % 36 + 36) % 36;
  }
  const key = 'HEALTH-MGMT-SYS-2024';
  for (let i = 0; i < key.length; i++) {
    const k = key.charCodeAt(i);
    h1 = ((h1 * 7 + k) % 36 + 36) % 36;
    h2 = ((h2 * 11 + k) % 36 + 36) % 36;
    h3 = ((h3 * 13 + k) % 36 + 36) % 36;
    h4 = ((h4 * 5 + k) % 36 + 36) % 36;
  }
  return SECRET_CHARS[h1] + SECRET_CHARS[h2] + SECRET_CHARS[h3] + SECRET_CHARS[h4];
}

function generateLicenseCode() {
  let randomPart = '';
  for (let i = 0; i < 12; i++) {
    randomPart += SECRET_CHARS.charAt(Math.floor(Math.random() * 36));
  }
  const checksum = computeChecksum(randomPart);
  return randomPart + checksum;
}

function validateLicenseCode(code) {
  if (!code) return false;
  const cleaned = code.replace(/[^A-Z0-9]/g, '').toUpperCase();
  if (cleaned.length !== 16) return false;
  if (!/^[A-Z0-9]{16}$/.test(cleaned)) return false;
  const randomPart = cleaned.substring(0, 12);
  const checksum = cleaned.substring(12, 16);
  const expectedChecksum = computeChecksum(randomPart);
  return checksum === expectedChecksum;
}

function formatLicenseCode(code) {
  const cleaned = code.replace(/[^A-Z0-9]/g, '').toUpperCase();
  return cleaned.replace(/(.{4})/g, '$1-').slice(0, -1);
}

function cleanLicenseCode(code) {
  return code.replace(/[^A-Z0-9]/g, '').toUpperCase();
}

export default {
  computeChecksum,
  generateLicenseCode,
  validateLicenseCode,
  formatLicenseCode,
  cleanLicenseCode
};