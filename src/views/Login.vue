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
        <el-form-item>
          <el-button 
            type="primary" 
            size="large" 
            @click="handleLogin" 
            :loading="loading"
            style="width: 100%;">
            <i class="el-icon-check"></i> 登录系统
          </el-button>
        </el-form-item>
      </el-form>
      
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

export default {
  name: 'Login',
  data() {
    return {
      loginForm: {
        username: '',
        password: '',
        role: 'admin'
      },
      rules: {
        username: [
          { required: true, message: '请输入账号', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ]
      },
      loading: false,
      roles: [
        { label: '校级管理员', value: 'admin', icon: 'el-icon-s-custom' },
        { label: '班主任/教师', value: 'teacher', icon: 'el-icon-s-custom' },
        { label: '学生家长', value: 'parent', icon: 'el-icon-user' },
        { label: '在校学生', value: 'student', icon: 'el-icon-s-claim' },
        { label: '校园校医', value: 'doctor', icon: 'el-icon-s-claim' }
      ]
    };
  },
  methods: {
    selectRole(role) {
      this.loginForm.role = role;
      // 清空账号密码，强制用户重新输入
      this.loginForm.username = '';
      this.loginForm.password = '';
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
    handleLogin() {
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

          // 3. 登录成功，保存身份信息
          localStorage.setItem('token', 'auth-token-' + Date.now());
          localStorage.setItem('userInfo', JSON.stringify({
            username: roleCfg.displayName,
            role: this.loginForm.role,
            loginTime: new Date().toISOString()
          }));
          this.$message.success('登录成功！欢迎 ' + roleCfg.displayName);
          this.loading = false;
          this.$router.push('/dashboard');
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
