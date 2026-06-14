<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <div class="logo">
          <i class="el-icon-odometer"></i>
        </div>
        <h1>幼儿中小学生健康管理系统</h1>
        <p class="subtitle">政企数字化级别 · 健康管理平台</p>
      </div>

      <!-- 角色选择 -->
      <div class="role-selector">
        <div
          v-for="role in roles"
          :key="role.value"
          class="role-card"
          :class="{ active: loginForm.role === role.value }"
          @click="selectRole(role.value)">
          <i :class="role.icon" class="role-icon"></i>
          <span class="role-name">{{ role.label }}</span>
        </div>
      </div>

      <el-form :model="loginForm" :rules="rules" ref="loginForm" class="login-form">

        <!-- 家长登录：手机号 + 验证码 / 微信登录 -->
        <template v-if="loginForm.role === 'parent'">
          <!-- 登录方式切换 -->
          <div class="login-tabs">
            <div
              class="login-tab"
              :class="{ active: parentLoginType === 'phone' }"
              @click="parentLoginType = 'phone'">
              📱 手机号登录
            </div>
            <div
              class="login-tab"
              :class="{ active: parentLoginType === 'wechat' }"
              @click="parentLoginType = 'wechat'">
              💬 微信登录
            </div>
          </div>

          <!-- 手机号登录 -->
          <template v-if="parentLoginType === 'phone'">
            <el-form-item prop="phone">
              <el-input
                v-model="loginForm.phone"
                placeholder="请输入手机号"
                prefix-icon="el-icon-mobile-phone"
                size="large"
                maxlength="11"
                @input="handlePhoneInput">
              </el-input>
            </el-form-item>

            <el-form-item prop="verifyCode">
              <div class="verify-code-row">
                <el-input
                  v-model="loginForm.verifyCode"
                  placeholder="请输入验证码"
                  prefix-icon="el-icon-key"
                  size="large"
                  maxlength="6"
                  style="flex: 1;"
                  @keyup.enter.native="handleLogin">
                </el-input>
                <el-button
                  :disabled="verifyCodeCountdown > 0"
                  :loading="sendingCode"
                  class="send-code-btn"
                  size="large"
                  @click="sendVerifyCode">
                  {{ verifyCodeCountdown > 0 ? `${verifyCodeCountdown}s后重发` : '获取验证码' }}
                </el-button>
              </div>
            </el-form-item>
          </template>

          <!-- 微信登录 -->
          <template v-else>
            <div class="wechat-login-area" @click="handleWechatLogin">
              <div class="wechat-icon">
                <i class="el-icon-chat-dot-round"></i>
              </div>
              <div class="wechat-text">
                <div class="wechat-title">微信扫码登录</div>
                <div class="wechat-desc">使用微信扫描二维码，即可快速登录</div>
              </div>
              <i class="el-icon-arrow-right wechat-arrow"></i>
            </div>

            <!-- 模拟微信扫码弹窗 -->
            <div class="wechat-qrcode-tip" v-if="showWechatQr">
              <div class="qr-tip-content">
                <i class="el-icon-check"></i>
                <span>模拟微信授权成功（演示环境）</span>
              </div>
            </div>
          </template>

          <!-- 班级绑定提示 -->
          <div class="bind-tip" v-if="loginForm.role === 'parent' && !isBindChild">
            <i class="el-icon-info"></i>
            首次登录需要绑定您孩子的班级信息
          </div>
        </template>

        <!-- 其他角色登录：账号 + 密码 -->
        <template v-else>
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              :placeholder="getPlaceholder('username')"
              prefix-icon="el-icon-user"
              size="large">
            </el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="密码"
              prefix-icon="el-icon-lock"
              size="large"
              @keyup.enter.native="handleLogin">
            </el-input>
          </el-form-item>
        </template>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            @click="handleLogin"
            :loading="loading"
            :disabled="loginForm.role === 'parent' && parentLoginType === 'wechat'"
            style="width: 100%;">
            <i class="el-icon-check"></i>
            {{ loginForm.role === 'parent' ? '登录 / 绑定孩子信息' : '登录系统' }}
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 班级绑定弹窗 -->
      <el-dialog
        title="🎓 绑定您的孩子"
        :visible.sync="bindChildDialogVisible"
        width="500px"
        :close-on-click-modal="false"
        append-to-body>
        <div class="bind-child-form">
          <p class="bind-desc">请填写您孩子的信息，以便老师能够识别并与您沟通</p>

          <el-form :model="bindChildForm" :rules="bindChildRules" ref="bindChildForm" label-width="100px">
            <el-form-item label="孩子姓名" prop="childName">
              <el-input v-model="bindChildForm.childName" placeholder="请输入孩子姓名" size="medium"></el-input>
            </el-form-item>

            <el-form-item label="所在班级" prop="className">
              <el-select v-model="bindChildForm.className" placeholder="请选择班级" size="medium" style="width: 100%;">
                <el-option-group label="幼儿园">
                  <el-option label="小(1)班" value="幼儿园小1班"></el-option>
                  <el-option label="小(2)班" value="幼儿园小2班"></el-option>
                  <el-option label="中(1)班" value="幼儿园中1班"></el-option>
                  <el-option label="大(1)班" value="幼儿园大1班"></el-option>
                </el-option-group>
                <el-option-group label="小学">
                  <el-option label="一年级(1)班" value="小学一年级1班"></el-option>
                  <el-option label="一年级(2)班" value="小学一年级2班"></el-option>
                  <el-option label="二年级(1)班" value="小学二年级1班"></el-option>
                  <el-option label="三年级(1)班" value="小学三年级1班"></el-option>
                  <el-option label="四年级(1)班" value="小学四年级1班"></el-option>
                  <el-option label="五年级(1)班" value="小学五年级1班"></el-option>
                  <el-option label="六年级(1)班" value="小学六年级1班"></el-option>
                </el-option-group>
                <el-option-group label="初中">
                  <el-option label="初一(1)班" value="初中初一1班"></el-option>
                  <el-option label="初二(1)班" value="初中初二1班"></el-option>
                  <el-option label="初三(1)班" value="初中初三1班"></el-option>
                </el-option-group>
              </el-select>
            </el-form-item>

            <el-form-item label="孩子学号" prop="studentNo">
              <el-input v-model="bindChildForm.studentNo" placeholder="请输入孩子学号（选填）" size="medium"></el-input>
            </el-form-item>

            <el-form-item label="关系" prop="relation">
              <el-radio-group v-model="bindChildForm.relation">
                <el-radio label="爸爸">👨 爸爸</el-radio>
                <el-radio label="妈妈">👩 妈妈</el-radio>
                <el-radio label="爷爷">👴 爷爷</el-radio>
                <el-radio label="奶奶">👵 奶奶</el-radio>
                <el-radio label="其他">👤 其他</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="loginForm.phone" placeholder="手机号" size="medium" disabled></el-input>
            </el-form-item>
          </el-form>
        </div>
        <div slot="footer">
          <el-button @click="skipBindChild">跳过</el-button>
          <el-button type="primary" @click="confirmBindChild">确认绑定</el-button>
        </div>
      </el-dialog>

      <div class="demo-tips">
        <p><i class="el-icon-info"></i> 管理员：admin/admin123 教师：teacher/123456 家长：parent/123456 学生：student/123456 校医：doctor/123456</p>
      </div>
    </div>
  </div>
</template>

<script>
// 角色账号密码对照表（username+password+role 三项必须匹配才能登录）
const ACCOUNTS = {
  admin:   { username: 'admin',   password: 'admin123', displayName: '校级管理员' },
  teacher: { username: 'teacher', password: '123456',   displayName: '张老师' },
  parent:  { username: 'parent',  password: '123456',   displayName: '小明妈妈' },
  student: { username: 'student', password: '123456',   displayName: '小明同学' },
  doctor:  { username: 'doctor',  password: '123456',   displayName: '李校医' }
};

// 模拟验证码存储（生产环境应该是服务端发送）
const SIMULATED_CODES = {};

export default {
  name: 'Login',
  data() {
    // 验证手机号
    const validatePhone = (rule, value, callback) => {
      if (this.loginForm.role !== 'parent' || this.parentLoginType === 'wechat') {
        callback();
        return;
      }
      if (!value) {
        callback(new Error('请输入手机号'));
        return;
      }
      if (!/^1[3-9]\d{9}$/.test(value)) {
        callback(new Error('请输入正确的手机号'));
        return;
      }
      callback();
    };

    // 验证验证码
    const validateCode = (rule, value, callback) => {
      if (this.loginForm.role !== 'parent' || this.parentLoginType === 'wechat') {
        callback();
        return;
      }
      if (!value) {
        callback(new Error('请输入验证码'));
        return;
      }
      if (value.length !== 6) {
        callback(new Error('验证码为6位数字'));
        return;
      }
      // 模拟验证（实际应该是服务端验证）
      if (SIMULATED_CODES[this.loginForm.phone] !== value && value !== '123456') {
        callback(new Error('验证码错误'));
        return;
      }
      callback();
    };

    return {
      loginForm: {
        username: '',
        password: '',
        role: 'admin',
        phone: '',
        verifyCode: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入账号', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ],
        phone: [
          { validator: validatePhone, trigger: 'blur' }
        ],
        verifyCode: [
          { validator: validateCode, trigger: 'blur' }
        ]
      },
      loading: false,
      roles: [
        { label: '校级管理员', value: 'admin', icon: 'el-icon-s-custom' },
        { label: '班主任/教师', value: 'teacher', icon: 'el-icon-s-custom' },
        { label: '学生家长', value: 'parent', icon: 'el-icon-user' },
        { label: '在校学生', value: 'student', icon: 'el-icon-s-claim' },
        { label: '校园校医', value: 'doctor', icon: 'el-icon-s-claim' }
      ],

      // 家长登录相关
      parentLoginType: 'phone', // 'phone' | 'wechat'
      verifyCodeCountdown: 0,
      sendingCode: false,
      showWechatQr: false,

      // 班级绑定相关
      bindChildDialogVisible: false,
      isBindChild: false,
      bindChildForm: {
        childName: '',
        className: '',
        studentNo: '',
        relation: '妈妈'
      },
      bindChildRules: {
        childName: [
          { required: true, message: '请输入孩子姓名', trigger: 'blur' }
        ],
        className: [
          { required: true, message: '请选择班级', trigger: 'change' }
        ],
        relation: [
          { required: true, message: '请选择关系', trigger: 'change' }
        ]
      }
    };
  },

  created() {
    // 检查是否已经绑定过孩子
    this.checkBindStatus();
  },

  methods: {
    selectRole(role) {
      this.loginForm.role = role;
      // 清空账号密码，强制用户重新输入
      this.loginForm.username = '';
      this.loginForm.password = '';
      this.loginForm.phone = '';
      this.loginForm.verifyCode = '';

      // 如果是家长，检查是否已绑定
      if (role === 'parent') {
        this.checkBindStatus();
      }
    },

    getPlaceholder() {
      const placeholders = {
        admin: '请输入管理员账号',
        teacher: '请输入教师工号',
        parent: '请输入家长手机号',
        student: '请输入学号',
        doctor: '请输入校医账号'
      };
      return placeholders[this.loginForm.role] || '请输入账号';
    },

    handlePhoneInput() {
      // 只允许数字
      this.loginForm.phone = this.loginForm.phone.replace(/\D/g, '');
    },

    // 发送验证码
    sendVerifyCode() {
      const phone = this.loginForm.phone;
      if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
        this.$message.error('请输入正确的手机号');
        return;
      }

      this.sendingCode = true;

      // 模拟发送验证码（实际应该是调用后端API发送短信）
      setTimeout(() => {
        // 生成6位随机验证码（演示用123456）
        const code = '123456'; // 演示环境固定验证码
        SIMULATED_CODES[phone] = code;

        this.sendingCode = false;
        this.$message.success(`验证码已发送：${code}（演示环境）`);

        // 开始倒计时
        this.verifyCodeCountdown = 60;
        const timer = setInterval(() => {
          this.verifyCodeCountdown--;
          if (this.verifyCodeCountdown <= 0) {
            clearInterval(timer);
          }
        }, 1000);
      }, 1000);
    },

    // 微信登录（模拟）
    handleWechatLogin() {
      this.showWechatQr = true;
      this.$message.info('模拟微信授权成功（演示环境）');

      // 模拟授权成功，自动填充
      setTimeout(() => {
        this.loginForm.phone = '13800138000';
        this.parentLoginType = 'phone';
        this.showWechatQr = false;
      }, 1500);
    },

    // 检查绑定状态
    checkBindStatus() {
      try {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
          const info = JSON.parse(userInfo);
          if (info.role === 'parent' && info.childInfo) {
            this.isBindChild = true;
            this.bindChildForm = info.childInfo;
          }
        }
      } catch (e) {
        this.isBindChild = false;
      }
    },

    // 跳过绑定
    skipBindChild() {
      this.bindChildDialogVisible = false;
      // 使用默认信息登录
      this.doLogin({ displayName: this.loginForm.phone + '家长' });
    },

    // 确认绑定孩子
    confirmBindChild() {
      this.$refs.bindChildForm.validate(valid => {
        if (!valid) return;

        const childInfo = { ...this.bindChildForm };
        this.bindChildDialogVisible = false;
        this.isBindChild = true;

        // 登录
        this.doLogin({
          displayName: `${childInfo.relation} - ${childInfo.childName}`,
          childInfo: childInfo
        });
      });
    },

    // 执行登录
    doLogin(overrides = {}) {
      const roleCfg = ACCOUNTS[this.loginForm.role] || {};
      const displayName = overrides.displayName || roleCfg.displayName || this.loginForm.username;

      const userInfo = {
        username: displayName,
        role: this.loginForm.role,
        loginTime: new Date().toISOString(),
        ...overrides
      };

      localStorage.setItem('token', 'auth-token-' + Date.now());
      localStorage.setItem('userInfo', JSON.stringify(userInfo));

      this.$message.success(`登录成功！欢迎 ${displayName}`);
      this.$router.push('/dashboard');
    },

    handleLogin() {
      // 家长且手机号登录
      if (this.loginForm.role === 'parent' && this.parentLoginType === 'phone') {
        this.$refs.loginForm.validate(valid => {
          if (!valid) return;
          this.loading = true;

          setTimeout(() => {
            this.loading = false;

            // 检查是否已绑定孩子
            if (!this.isBindChild) {
              // 弹出绑定窗口
              this.bindChildDialogVisible = true;
            } else {
              // 已绑定，直接登录
              this.doLogin({
                displayName: `${this.bindChildForm.relation} - ${this.bindChildForm.childName}`,
                childInfo: this.bindChildForm
              });
            }
          }, 500);
        });
        return;
      }

      // 其他角色账号密码登录
      this.$refs.loginForm.validate((valid) => {
        if (!valid) return;

        this.loading = true;
        setTimeout(() => {
          // 1. 角色必须存在于账号表中
          const roleCfg = ACCOUNTS[this.loginForm.role];
          if (!roleCfg) {
            this.$message.error('角色信息异常，请重新选择');
            this.loading = false;
            return;
          }

          // 2. 账号、密码、角色三项必须联合匹配（防止选错角色蒙混登录）
          const inputUser = String(this.loginForm.username || '').trim();
          const inputPwd  = String(this.loginForm.password || '');
          if (inputUser !== roleCfg.username || inputPwd !== roleCfg.password) {
            this.$message.error('账号、密码或角色不匹配，请核对后重试');
            this.loading = false;
            return;
          }

          // 3. 登录成功
          this.doLogin();
          this.loading = false;
        }, 500);
      });
    }
  }
};
</script>

<style scoped>
.login-container {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.login-container::before {
  content: '';
  position: absolute;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
  top: -50%;
  left: -50%;
  animation: rotate 30s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.login-box {
  width: 480px;
  padding: 50px 45px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 1;
}

.login-header {
  text-align: center;
  margin-bottom: 35px;
}

.login-header .logo {
  font-size: 56px;
  margin-bottom: 15px;
  color: #667eea;
}

.login-header h1 {
  font-size: 24px;
  color: #303133;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.login-header .subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.role-selector {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin-bottom: 30px;
}

.role-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px 8px;
  border: 2px solid #e4e7ed;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
}

.role-card:hover {
  border-color: #667eea;
  background: #f0f2ff;
  transform: translateY(-3px);
}

.role-card.active {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.role-icon {
  font-size: 28px;
  margin-bottom: 6px;
}

.role-card.active .role-icon {
  color: white;
}

.role-name {
  font-size: 12px;
  font-weight: 500;
  text-align: center;
}

.login-form {
  margin-top: 10px;
}

.login-form /deep/ .el-input__inner {
  height: 46px;
  border-radius: 8px;
}

.login-form /deep/ .el-button--primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  height: 46px;
  font-size: 16px;
  font-weight: 500;
}

.login-form /deep/ .el-button--primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* 家长登录样式 */
.login-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 20px;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid #67c23a;
}

.login-tab {
  flex: 1;
  padding: 12px;
  text-align: center;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  background: #f5f7fa;
  color: #606266;
}

.login-tab.active {
  background: linear-gradient(135deg, #67c23a 0%, #95d475 100%);
  color: #fff;
}

.login-tab:first-child {
  border-right: 1px solid #67c23a;
}

.verify-code-row {
  display: flex;
  gap: 10px;
}

.send-code-btn {
  width: 130px;
  border-radius: 8px;
  background: #67c23a;
  border-color: #67c23a;
  color: #fff;
  font-weight: 500;
}

.send-code-btn:hover {
  background: #5daf34;
  border-color: #5daf34;
}

.send-code-btn:disabled {
  background: #c0c4cc;
  border-color: #c0c4cc;
}

/* 微信登录 */
.wechat-login-area {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: linear-gradient(135deg, #f0f9eb 0%, #e8f5e1 100%);
  border-radius: 10px;
  cursor: pointer;
  border: 2px solid #67c23a;
  transition: all 0.3s ease;
}

.wechat-login-area:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(103, 194, 58, 0.3);
}

.wechat-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #07c160 0%, #10b980 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: #fff;
}

.wechat-text {
  flex: 1;
}

.wechat-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 5px;
}

.wechat-desc {
  font-size: 13px;
  color: #909399;
}

.wechat-arrow {
  font-size: 24px;
  color: #67c23a;
}

.wechat-qrcode-tip {
  margin-top: 15px;
}

.qr-tip-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 15px;
  background: #f0f9eb;
  border-radius: 8px;
  color: #67c23a;
  font-weight: 500;
}

.qr-tip-content i {
  font-size: 24px;
}

.bind-tip {
  margin-top: 15px;
  padding: 12px 15px;
  background: #fef0f0;
  border-radius: 8px;
  color: #e6a23c;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.bind-tip i {
  font-size: 18px;
}

/* 绑定孩子弹窗 */
.bind-child-form {
  padding: 10px 0;
}

.bind-desc {
  color: #909399;
  font-size: 14px;
  margin-bottom: 20px;
  padding: 10px 15px;
  background: #f5f7fa;
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.demo-tips {
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
  text-align: center;
}

.demo-tips p {
  font-size: 13px;
  color: #909399;
  margin: 0;
}

.demo-tips i {
  margin-right: 5px;
  color: #667eea;
}
</style>
