const FIXED_USERNAME = 'admin';
const FIXED_PASSWORD = 'admin123';
const app = getApp();

Page({
  data: {
    username: '',
    password: '',
    error: '',
  },

  onLoad() {
    if (app.globalData.isLoggedIn) {
      wx.switchTab({
        url: '/pages/index/index',
      });
    }
  },

  onUsernameInput(e) {
    this.setData({
      username: e.detail.value,
      error: '',
    });
  },

  onPasswordInput(e) {
    this.setData({
      password: e.detail.value,
      error: '',
    });
  },

  handleSubmit(e) {
    const { username, password } = this.data;

    if (username === FIXED_USERNAME && password === FIXED_PASSWORD) {
      app.login({
        id: 1,
        username: FIXED_USERNAME,
        name: '管理员',
        age: 18,
        role: 'user',
      });

      wx.switchTab({
        url: '/pages/index/index',
      });
    } else {
      this.setData({
        error: '用户名或密码错误',
      });
    }
  },
});
