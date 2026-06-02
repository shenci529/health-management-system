const app = getApp();

function calculateBMI(height, weight) {
  if (!height || !weight) return 0;
  const heightInM = height / 100;
  return (weight / (heightInM * heightInM)).toFixed(1);
}

function getBMIStatus(bmi, age) {
  if (!bmi) return { status: '', color: '' };
  
  if (bmi < 18.5) {
    return { status: '偏瘦', color: 'text-blue' };
  } else if (bmi < 24) {
    return { status: '正常', color: 'text-green' };
  } else if (bmi < 28) {
    return { status: '偏胖', color: 'text-yellow' };
  } else {
    return { status: '肥胖', color: 'text-red' };
  }
}

Page({
  data: {
    userName: '',
    userInitial: '',
    latestRecord: {},
    bmi: 0,
    bmiStatus: '',
    bmiStatusColor: '',
  },

  onLoad() {
    if (!app.globalData.isLoggedIn) {
      wx.redirectTo({
        url: '/pages/login/login',
      });
      return;
    }
    this.loadData();
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    const user = app.globalData.user;
    const records = app.globalData.healthRecords;
    const latestRecord = records[records.length - 1] || {};
    const bmi = latestRecord.height && latestRecord.weight 
      ? calculateBMI(latestRecord.height, latestRecord.weight) 
      : 0;
    const bmiStatus = getBMIStatus(bmi, user?.age || 18);

    this.setData({
      userName: user?.name || '用户',
      userInitial: user?.name?.[0] || '用',
      latestRecord,
      bmi,
      bmiStatus: bmiStatus.status,
      bmiStatusColor: bmiStatus.color,
    });
  },

  goToRecord() {
    wx.switchTab({
      url: '/pages/record/record',
    });
  },

  goToAssessment() {
    wx.switchTab({
      url: '/pages/assessment/assessment',
    });
  },

  goToKnowledge() {
    wx.switchTab({
      url: '/pages/knowledge/knowledge',
    });
  },
});
