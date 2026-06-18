<template>
  <div class="activate-container">
    <div class="activate-card">
      <div class="activate-header">
        <i class="el-icon-s-platform"></i>
        <h1>幼儿中小学生健康管理系统</h1>
        <p class="subtitle">授权激活</p>
      </div>

      <div class="activate-form">
        <div class="status-message" :class="statusClass">
          <i :class="statusIcon"></i>
          <span>{{ statusMessage }}</span>
        </div>

        <div class="form-group">
          <label>授权码</label>
          <el-input
            v-model="licenseCode"
            placeholder="请输入授权码（格式：XXXX-XXXX-XXXX-XXXX）"
            :disabled="isActivating || isActivated"
            size="large"
            @keyup.enter.native="handleActivate"
          >
            <template slot="prepend"><i class="el-icon-key"></i></template>
          </el-input>
          <div class="form-tip">请联系系统提供商获取授权码</div>
        </div>

        <div class="form-group">
          <label>联系方式（选填）</label>
          <el-input
            v-model="contactInfo"
            placeholder="请输入您的联系方式（便于我们为您提供服务）"
            :disabled="isActivating || isActivated"
            size="large"
          >
            <template slot="prepend"><i class="el-icon-phone"></i></template>
          </el-input>
        </div>

        <el-button
          type="primary"
          size="large"
          :loading="isActivating"
          :disabled="!licenseCode || isActivated"
          @click="handleActivate"
          class="activate-btn"
        >
          {{ isActivated ? '已激活' : (isActivating ? '正在验证...' : '激活系统') }}
        </el-button>

        <div class="activate-tip">
          <p v-if="!isActivated">激活后系统将记录授权信息，如需转移授权请联系供应商</p>
          <p v-else>授权有效期至：{{ licenseInfo.valid_end || '永久' }}</p>
        </div>
      </div>

      <div class="activate-footer">
        <p>Powered by 健康管理系统</p>
      </div>
    </div>

    <!-- 二维码扫描激活 -->
    <div class="qr-activate-card" v-if="showQRCode">
      <div class="qr-header">
        <h2>扫码激活</h2>
        <p>使用授权管理APP扫描下方二维码</p>
      </div>
      <div class="qr-code" v-html="qrCodeSvg"></div>
      <div class="qr-expire" v-if="qrExpireTime">
        二维码有效期：{{ qrExpireTime }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LicenseActivate',
  data() {
    return {
      licenseCode: '',
      contactInfo: '',
      isActivating: false,
      isActivated: false,
      statusMessage: '请输入授权码进行激活',
      statusClass: 'info',
      statusIcon: 'el-icon-info',
      licenseInfo: null,
      showQRCode: false,
      qrCodeSvg: '',
      qrExpireTime: ''
    };
  },
  mounted() {
    // 检查是否已有有效授权
    this.checkExistingLicense();
  },
  methods: {
    checkExistingLicense() {
      try {
        const stored = localStorage.getItem('license_info');
        if (stored) {
          const info = JSON.parse(stored);
          // 检查授权是否过期
          if (info.valid_end) {
            const endDate = new Date(info.valid_end);
            if (endDate >= new Date()) {
              this.isActivated = true;
              this.licenseInfo = info;
              this.statusMessage = '系统已激活，正在进入...';
              this.statusClass = 'success';
              this.statusIcon = 'el-icon-success';
              setTimeout(() => {
                this.$router.push('/login');
              }, 1500);
              return;
            } else {
              this.statusMessage = '授权已过期，请续费后重新激活';
              this.statusClass = 'error';
              this.statusIcon = 'el-icon-error';
              localStorage.removeItem('license_info');
              return;
            }
          }
        }
      } catch (e) {
        console.error('检查授权失败:', e);
      }
      this.statusMessage = '请输入授权码进行激活';
    },

    async handleActivate() {
      if (!this.licenseCode) {
        this.$message.warning('请输入授权码');
        return;
      }

      // 清理授权码格式
      const cleanCode = this.licenseCode.replace(/-/g, '').toUpperCase();

      this.isActivating = true;
      this.statusMessage = '正在验证授权码...';
      this.statusClass = 'info';
      this.statusIcon = 'el-icon-loading';

      try {
        // 调用授权验证API
        const apiBase = localStorage.getItem('api_base') || '';
        const response = await fetch(`${apiBase}/api/license/validate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ code: cleanCode })
        });

        const result = await response.json();

        if (result.success) {
          // 授权验证成功，保存授权信息
          const licenseInfo = {
            code: cleanCode,
            formatted_code: result.data.formatted_code,
            customer_name: result.data.customer_name,
            school_name: result.data.school_name,
            valid_end: result.data.valid_end,
            max_users: result.data.max_users,
            activated_at: new Date().toISOString(),
            contact_info: this.contactInfo
          };

          localStorage.setItem('license_info', JSON.stringify(licenseInfo));

          this.isActivated = true;
          this.licenseInfo = licenseInfo;
          this.statusMessage = '激活成功！正在进入系统...';
          this.statusClass = 'success';
          this.statusIcon = 'el-icon-success';

          this.$message.success('系统激活成功！');

          setTimeout(() => {
            this.$router.push('/login');
          }, 1500);
        } else {
          this.statusMessage = result.message || '授权码无效';
          this.statusClass = 'error';
          this.statusIcon = 'el-icon-error';
          this.$message.error(result.message || '授权码验证失败');
        }
      } catch (error) {
        console.error('激活失败:', error);
        this.statusMessage = '激活失败，请检查网络连接';
        this.statusClass = 'error';
        this.statusIcon = 'el-icon-error';
        this.$message.error('激活失败，请检查网络连接或联系供应商');
      } finally {
        this.isActivating = false;
      }
    },

    async generateQRCode() {
      // 生成二维码用于扫码激活
      try {
        const response = await fetch('/api/license/qr-generate', {
          method: 'POST'
        });
        const result = await response.json();
        if (result.success) {
          this.showQRCode = true;
          this.qrCodeSvg = `<img src="${result.qr_code}" alt="激活二维码" style="width: 200px; height: 200px;">`;
          this.qrExpireTime = result.expire_time;
        }
      } catch (e) {
        console.log('二维码生成功能暂不可用');
      }
    }
  }
};
</script>

<style scoped>
.activate-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.activate-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 40px;
  width: 100%;
  max-width: 480px;
}

.activate-header {
  text-align: center;
  margin-bottom: 30px;
}

.activate-header i {
  font-size: 48px;
  color: #409EFF;
  margin-bottom: 10px;
}

.activate-header h1 {
  font-size: 24px;
  color: #303133;
  margin: 10px 0 5px;
}

.activate-header .subtitle {
  color: #909399;
  font-size: 14px;
}

.status-message {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
}

.status-message.info {
  background: #f4f4f5;
  color: #909399;
}

.status-message.success {
  background: #f0f9eb;
  color: #67c23a;
}

.status-message.error {
  background: #fef0f0;
  color: #f56c6c;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.form-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

.activate-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  margin-top: 10px;
}

.activate-tip {
  margin-top: 20px;
  text-align: center;
  font-size: 12px;
  color: #909399;
}

.activate-footer {
  margin-top: 30px;
  text-align: center;
  color: #c0c4cc;
  font-size: 12px;
}

.qr-activate-card {
  margin-top: 30px;
  padding-top: 30px;
  border-top: 1px solid #ebeef5;
  text-align: center;
}

.qr-header h2 {
  font-size: 18px;
  margin-bottom: 10px;
}

.qr-header p {
  color: #909399;
  font-size: 14px;
  margin-bottom: 20px;
}

.qr-code {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.qr-expire {
  color: #e6a23c;
  font-size: 12px;
}

@media (max-width: 480px) {
  .activate-card {
    padding: 30px 20px;
  }

  .activate-header h1 {
    font-size: 20px;
  }
}
</style>
