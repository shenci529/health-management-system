const app = getApp();

Page({
  data: {
    knowledgeList: [],
  },

  onLoad() {
    this.loadKnowledge();
  },

  loadKnowledge() {
    const icons = ['🥗', '👁️', '🏃', '💤'];
    const list = app.globalData.healthKnowledge.map((item, index) => ({
      ...item,
      icon: icons[index % icons.length],
    }));
    this.setData({ knowledgeList: list });
  },
});
