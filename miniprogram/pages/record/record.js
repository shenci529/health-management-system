const app = getApp();

function formatDate(date) {
  const d = new Date(date);
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${month}-${day}`;
}

Page({
  data: {
    formData: {
      height: '',
      weight: '',
      heartRate: '',
      vision: '',
    },
    records: [],
  },

  onLoad() {
    this.loadRecords();
  },

  onShow() {
    this.loadRecords();
  },

  loadRecords() {
    const records = app.globalData.healthRecords.map(r => ({
      ...r,
      date: formatDate(r.createdAt),
    })).reverse();
    this.setData({ records });
  },

  onHeightInput(e) {
    this.setData({ 'formData.height': e.detail.value });
  },

  onWeightInput(e) {
    this.setData({ 'formData.weight': e.detail.value });
  },

  onHeartRateInput(e) {
    this.setData({ 'formData.heartRate': e.detail.value });
  },

  onVisionInput(e) {
    this.setData({ 'formData.vision': e.detail.value });
  },

  onSubmit() {
    const { height, weight, heartRate, vision } = this.data.formData;
    
    if (!height || !weight) {
      wx.showToast({
        title: '请填写身高和体重',
        icon: 'none',
      });
      return;
    }

    const newRecord = {
      userId: app.globalData.user?.id || 1,
      height: parseFloat(height),
      weight: parseFloat(weight),
      heartRate: heartRate ? parseInt(heartRate) : null,
      vision: vision ? parseFloat(vision) : null,
    };

    app.addHealthRecord(newRecord);
    
    wx.showToast({
      title: '保存成功',
      icon: 'success',
    });

    this.setData({
      formData: {
        height: '',
        weight: '',
        heartRate: '',
        vision: '',
      },
    });

    this.loadRecords();
  },
});
