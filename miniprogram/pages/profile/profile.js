const app = getApp();

Page({
  data: {
    userName: '',
    userInitial: '',
  },

  onLoad() {
    this.loadUserInfo();
  },

  loadUserInfo() {
    const user = app.globalData.user;
    this.setData({
      userName: user?.name || '用户',
      userInitial: user?.name?.[0] || '用',
    });
  },

  onLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          app.logout();
          wx.reLaunch({
            url: '/pages/login/login',
          });
        }
      },
    });
  },
});
