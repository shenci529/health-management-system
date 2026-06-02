// ==================== 微信小程序入口文件 ====================
// 这是小程序的全局入口，包含全局数据和方法

// ---------- 模拟数据（演示用） ----------
// 健康记录的模拟数据
const mockRecords = [
  { id: 1, userId: 1, height: 140, weight: 35, heartRate: 80, vision: 1.0, createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  { id: 2, userId: 1, height: 142, weight: 36, heartRate: 78, vision: 1.0, createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
  { id: 3, userId: 1, height: 145, weight: 37, heartRate: 82, vision: 0.9, createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000) },
];

const mockKnowledge = [
  { id: 1, title: '儿童健康饮食指南', content: '儿童正处于生长发育的关键时期，需要均衡的营养摄入。建议每天摄入足够的蛋白质、维生素和矿物质。', category: 'diet', createdAt: new Date() },
  { id: 2, title: '如何保护孩子的视力', content: '保持正确的读写姿势，控制电子产品使用时间，定期进行视力检查，是保护视力的关键。', category: 'vision', createdAt: new Date() },
  { id: 3, title: '适量运动对儿童的好处', content: '每天进行适量的体育运动，可以增强体质，提高免疫力，促进骨骼发育，有助于儿童健康成长。', category: 'exercise', createdAt: new Date() },
  { id: 4, title: '保证充足睡眠的重要性', content: '儿童每天需要保证8-10小时的睡眠时间，充足的睡眠有助于身体发育和智力发展。', category: 'sleep', createdAt: new Date() },
];

const mockExercises = [
  { id: 1, name: '跳绳', category: 'cardio', duration: 30, description: '跳绳是一项很好的有氧运动，可以锻炼心肺功能和协调性', benefits: ['增强心肺功能', '提高协调性', '燃烧脂肪'], frequency: '每周3-5次' },
  { id: 2, name: '跑步', category: 'cardio', duration: 45, description: '慢跑是最常见的运动方式之一，适合各年龄段人群', benefits: ['增强体质', '提高耐力', '改善心情'], frequency: '每周3-4次' },
  { id: 3, name: '游泳', category: 'cardio', duration: 60, description: '游泳是一项全身运动，对关节压力小', benefits: ['全身锻炼', '增强心肺功能', '塑形'], frequency: '每周2-3次' },
  { id: 4, name: '瑜伽', category: 'flexibility', duration: 40, description: '瑜伽可以帮助提高柔韧性和平衡感', benefits: ['提高柔韧性', '减轻压力', '改善姿势'], frequency: '每周2-3次' },
];

// 健康知识的模拟数据
const mockKnowledge = [
  { id: 1, title: '儿童健康饮食指南', content: '儿童正处于生长发育的关键时期，需要均衡的营养摄入。建议每天摄入足够的蛋白质、维生素和矿物质。', category: 'diet', createdAt: new Date() },
  { id: 2, title: '如何保护孩子的视力', content: '保持正确的读写姿势，控制电子产品使用时间，定期进行视力检查，是保护视力的关键。', category: 'vision', createdAt: new Date() },
  { id: 3, title: '适量运动对儿童的好处', content: '每天进行适量的体育运动，可以增强体质，提高免疫力，促进骨骼发育，有助于儿童健康成长。', category: 'exercise', createdAt: new Date() },
  { id: 4, title: '保证充足睡眠的重要性', content: '儿童每天需要保证8-10小时的睡眠时间，充足的睡眠有助于身体发育和智力发展。', category: 'sleep', createdAt: new Date() },
];

// 运动项目的模拟数据
const mockExercises = [
  { id: 1, name: '跳绳', category: 'cardio', duration: 30, description: '跳绳是一项很好的有氧运动，可以锻炼心肺功能和协调性', benefits: ['增强心肺功能', '提高协调性', '燃烧脂肪'], frequency: '每周3-5次' },
  { id: 2, name: '跑步', category: 'cardio', duration: 45, description: '慢跑是最常见的运动方式之一，适合各年龄段人群', benefits: ['增强体质', '提高耐力', '改善心情'], frequency: '每周3-4次' },
  { id: 3, name: '游泳', category: 'cardio', duration: 60, description: '游泳是一项全身运动，对关节压力小', benefits: ['全身锻炼', '增强心肺功能', '塑形'], frequency: '每周2-3次' },
  { id: 4, name: '瑜伽', category: 'flexibility', duration: 40, description: '瑜伽可以帮助提高柔韧性和平衡感', benefits: ['提高柔韧性', '减轻压力', '改善姿势'], frequency: '每周2-3次' },
];

// 健康日志的模拟数据
const mockHealthLogs = [
  { id: 1, userId: 1, type: 'exercise', content: '今天跑步30分钟，感觉很好', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
  { id: 2, userId: 1, type: 'diet', content: '今天吃了很多蔬菜和水果', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
];

// ---------- 小程序主应用 ----------
App({
  // 全局数据：所有页面都可以访问
  globalData: {
    user: null,              // 当前登录的用户信息
    isLoggedIn: false,       // 是否已登录
    healthRecords: mockRecords,    // 健康记录列表
    healthKnowledge: mockKnowledge, // 健康知识列表
    exercises: mockExercises,       // 运动项目列表
    healthLogs: mockHealthLogs,     // 健康日志列表
  },

  // 小程序启动时执行的函数
  onLaunch() {
    this.checkLoginStatus(); // 检查用户是否已经登录
  },

  // 检查登录状态：从本地存储中读取用户信息
  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo'); // 从本地存储获取
    if (userInfo) {
      this.globalData.user = userInfo;
      this.globalData.isLoggedIn = true;
    }
  },

  // 登录方法：保存用户信息到全局数据和本地存储
  login(user) {
    this.globalData.user = user;
    this.globalData.isLoggedIn = true;
    wx.setStorageSync('userInfo', user); // 保存到本地存储
  },

  // 登出方法：清除用户信息
  logout() {
    this.globalData.user = null;
    this.globalData.isLoggedIn = false;
    wx.removeStorageSync('userInfo'); // 从本地存储删除
  },

  // 添加健康记录
  addHealthRecord(record) {
    const newRecord = {
      ...record,
      id: Date.now(),      // 用当前时间戳作为ID
      createdAt: new Date(), // 创建时间
    };
    this.globalData.healthRecords.unshift(newRecord); // 添加到数组开头
    wx.setStorageSync('healthRecords', this.globalData.healthRecords); // 保存到本地
  },

  // 添加健康日志
  addHealthLog(log) {
    const newLog = {
      ...log,
      id: Date.now(),
      createdAt: new Date(),
    };
    this.globalData.healthLogs.unshift(newLog);
    wx.setStorageSync('healthLogs', this.globalData.healthLogs);
  },
});
