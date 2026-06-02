const app = getApp();

const logConfig = {
  exercise: { icon: '🏃', label: '运动', color: 'blue' },
  diet: { icon: '🍎', label: '饮食', color: 'green' },
  sleep: { icon: '💤', label: '睡眠', color: 'purple' },
  note: { icon: '📝', label: '笔记', color: 'gray' },
};

function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatTime(date) {
  const d = new Date(date);
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

Page({
  data: {
    groupedLogs: [],
    isModalOpen: false,
    newLog: {
      type: 'note',
      content: '',
    },
    types: [
      { key: 'exercise', icon: '🏃', label: '运动' },
      { key: 'diet', icon: '🍎', label: '饮食' },
      { key: 'sleep', icon: '💤', label: '睡眠' },
      { key: 'note', icon: '📝', label: '笔记' },
    ],
  },

  onLoad() {
    this.loadLogs();
  },

  onShow() {
    this.loadLogs();
  },

  loadLogs() {
    const logs = app.globalData.healthLogs;
    
    const grouped = {};
    logs.forEach(log => {
      const dateKey = formatDate(log.createdAt);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      
      const config = logConfig[log.type] || logConfig.note;
      grouped[dateKey].push({
        ...log,
        logIcon: config.icon,
        logLabel: config.label,
        logType: config.color,
        logTime: formatTime(log.createdAt),
      });
    });

    const groupedLogs = Object.entries(grouped)
      .map(([date, logs]) => ({
        date: formatDisplayDate(date),
        logs,
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    this.setData({ groupedLogs });
  },

  openModal() {
    this.setData({
      isModalOpen: true,
      newLog: {
        type: 'note',
        content: '',
      },
    });
  },

  closeModal() {
    this.setData({ isModalOpen: false });
  },

  preventBubble() {},

  selectType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ 'newLog.type': type });
  },

  onContentInput(e) {
    this.setData({ 'newLog.content': e.detail.value });
  },

  onSubmit() {
    const { type, content } = this.data.newLog;
    const user = app.globalData.user;
    
    if (!user || !content.trim()) {
      return;
    }

    app.addHealthLog({
      userId: user.id,
      type,
      content: content.trim(),
    });

    wx.showToast({
      title: '保存成功',
      icon: 'success',
    });

    this.setData({ isModalOpen: false });
    this.loadLogs();
  },
});
