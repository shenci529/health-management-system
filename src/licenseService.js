/**
 * 客户端授权验证服务
 * 用于检查和管理系统授权状态
 */

const LICENSE_KEY = 'license_info';
const LICENSE_CHECK_INTERVAL = 1000 * 60 * 60; // 每小时检查一次

class LicenseService {
  constructor() {
    this.apiBase = this.getApiBase();
    this.checkTimer = null;
  }

  /**
   * 获取API基础地址
   */
  getApiBase() {
    // 优先使用存储的API地址
    const stored = localStorage.getItem('api_base');
    if (stored) return stored;

    // 开发环境
    if (import.meta.env.DEV) {
      return import.meta.env.VITE_API_BASE || 'http://localhost:3002';
    }

    // 生产环境 - 使用相对路径
    return '';
  }

  /**
   * 检查授权状态
   * @returns {Object} { isValid: boolean, info: Object|null, message: string }
   */
  async checkLicense() {
    try {
      // 1. 检查本地存储的授权信息
      const stored = localStorage.getItem(LICENSE_KEY);
      if (!stored) {
        return {
          isValid: false,
          info: null,
          message: '未找到授权信息，请先激活系统'
        };
      }

      const info = JSON.parse(stored);

      // 2. 检查授权码是否存在
      if (!info.code) {
        return {
          isValid: false,
          info: null,
          message: '授权信息不完整，请重新激活'
        };
      }

      // 3. 检查授权是否过期
      if (info.valid_end) {
        const endDate = new Date(info.valid_end);
        if (endDate < new Date()) {
          this.clearLicense();
          return {
            isValid: false,
            info: null,
            message: '授权已过期，请续费后重新激活'
          };
        }
      }

      // 4. 联网验证授权码是否仍然有效
      try {
        const response = await fetch(`${this.apiBase}/api/license/validate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ code: info.code })
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            // 更新授权信息（可能服务器上有更新）
            localStorage.setItem(LICENSE_KEY, JSON.stringify({
              ...info,
              ...result.data
            }));

            return {
              isValid: true,
              info: { ...info, ...result.data },
              message: '授权验证成功'
            };
          } else {
            // 服务器验证失败
            if (result.message.includes('已撤销') || result.message.includes('已过期')) {
              this.clearLicense();
              return {
                isValid: false,
                info: null,
                message: result.message
              };
            }
          }
        }
      } catch (e) {
        // 网络错误时，允许离线使用（如果本地授权未过期）
        console.warn('授权远程验证失败，使用本地缓存:', e);
      }

      // 本地授权未过期，允许使用
      return {
        isValid: true,
        info: info,
        message: '授权有效（离线模式）'
      };

    } catch (error) {
      console.error('授权检查失败:', error);
      return {
        isValid: false,
        info: null,
        message: '授权检查失败，请重试'
      };
    }
  }

  /**
   * 激活系统
   * @param {string} code 授权码
   * @param {string} contactInfo 联系方式
   * @returns {Object} { success: boolean, info: Object|null, message: string }
   */
  async activate(code, contactInfo = '') {
    try {
      // 清理授权码格式
      const cleanCode = code.replace(/-/g, '').toUpperCase();

      if (!cleanCode || cleanCode.length !== 16) {
        return {
          success: false,
          info: null,
          message: '授权码格式不正确'
        };
      }

      // 验证授权码
      const response = await fetch(`${this.apiBase}/api/license/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: cleanCode })
      });

      const result = await response.json();

      if (result.success) {
        // 保存授权信息
        const licenseInfo = {
          code: cleanCode,
          formatted_code: result.data.formatted_code,
          customer_name: result.data.customer_name,
          school_name: result.data.school_name,
          valid_end: result.data.valid_end,
          max_users: result.data.max_users,
          activated_at: new Date().toISOString(),
          contact_info: contactInfo
        };

        localStorage.setItem(LICENSE_KEY, JSON.stringify(licenseInfo));

        return {
          success: true,
          info: licenseInfo,
          message: '激活成功'
        };
      } else {
        return {
          success: false,
          info: null,
          message: result.message || '授权码无效'
        };
      }

    } catch (error) {
      console.error('激活失败:', error);
      return {
        success: false,
        info: null,
        message: '激活失败，请检查网络连接'
      };
    }
  }

  /**
   * 获取授权信息
   */
  getLicenseInfo() {
    try {
      const stored = localStorage.getItem(LICENSE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('获取授权信息失败:', e);
    }
    return null;
  }

  /**
   * 清除授权信息
   */
  clearLicense() {
    localStorage.removeItem(LICENSE_KEY);
  }

  /**
   * 获取授权剩余天数
   */
  getRemainingDays() {
    const info = this.getLicenseInfo();
    if (!info || !info.valid_end) {
      return null; // 永久授权
    }

    const endDate = new Date(info.valid_end);
    const now = new Date();
    const diff = endDate - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    return days;
  }

  /**
   * 获取授权到期提醒等级
   * @returns 'expired' | 'critical' | 'warning' | 'normal' | null
   */
  getExpireWarning() {
    const days = this.getRemainingDays();
    if (days === null) return null; // 永久授权
    if (days <= 0) return 'expired';
    if (days <= 7) return 'critical';
    if (days <= 30) return 'warning';
    return 'normal';
  }

  /**
   * 开始定期检查授权
   */
  startPeriodicCheck(callback) {
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
    }

    this.checkTimer = setInterval(async () => {
      const result = await this.checkLicense();
      if (callback) {
        callback(result);
      }
    }, LICENSE_CHECK_INTERVAL);
  }

  /**
   * 停止定期检查
   */
  stopPeriodicCheck() {
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = null;
    }
  }
}

// 导出单例
const licenseService = new LicenseService();
export default licenseService;

// 导出类以便需要时创建新实例
export { LicenseService };
