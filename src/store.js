// 全局共享数据 - 用户列表和健康记录
// 使用 Vue.observable 使数据响应式，所有页面共用同一份数据
import Vue from 'vue';

const store = Vue.observable({
  // 用户列表
  userList: [
    { id: 1, username: '张三', phone: '13888888888', gender: '男', age: 18 },
    { id: 2, username: '李四', phone: '13999999999', gender: '女', age: 16 },
    { id: 3, username: '王五', phone: '13777777777', gender: '男', age: 20 },
    { id: 4, username: '赵六', phone: '13666666666', gender: '女', age: 15 }
  ],
  // 健康记录列表
  healthRecords: [
    { id: 1, userId: 1, date: '2024-04-22', height: 1.75, weight: 68, heartRate: 75, vision: 150, bloodPressure: '120/80', bloodSugar: 5.2, cholesterol: 4.5, sleepStatus: '好', smoke: false, drink: false },
    { id: 2, userId: 1, date: '2024-04-20', height: 1.75, weight: 67.5, heartRate: 78, vision: 150, bloodPressure: '118/78', bloodSugar: 5.0, cholesterol: 4.3, sleepStatus: '好', smoke: false, drink: false },
    { id: 3, userId: 2, date: '2024-04-22', height: 1.62, weight: 50, heartRate: 80, vision: 220, bloodPressure: '110/70', bloodSugar: 4.8, cholesterol: 4.0, sleepStatus: '一般', smoke: false, drink: false },
    { id: 4, userId: 2, date: '2024-04-18', height: 1.62, weight: 49.5, heartRate: 82, vision: 200, bloodPressure: '108/68', bloodSugar: 4.6, cholesterol: 3.9, sleepStatus: '好', smoke: false, drink: false },
    { id: 5, userId: 3, date: '2024-04-22', height: 1.80, weight: 85, heartRate: 88, vision: 350, bloodPressure: '135/90', bloodSugar: 6.5, cholesterol: 5.8, sleepStatus: '差', smoke: true, drink: true },
    { id: 6, userId: 3, date: '2024-04-15', height: 1.80, weight: 83, heartRate: 90, vision: 300, bloodPressure: '130/88', bloodSugar: 6.2, cholesterol: 5.5, sleepStatus: '差', smoke: true, drink: true }
  ],
  nextUserId: 5,
  nextRecordId: 7,

  // 获取所有用户
  getUserList() {
    return this.userList;
  },

  // 根据ID获取用户
  getUserById(id) {
    return this.userList.find(u => u.id === id);
  },

  // 新增用户
  addUser(user) {
    const newUser = {
      id: this.nextUserId++,
      username: user.username,
      phone: user.phone,
      gender: user.gender || '男',
      age: user.age || 18
    };
    this.userList.push(newUser);
    return newUser;
  },

  // 编辑用户
  updateUser(id, data) {
    const user = this.userList.find(u => u.id === id);
    if (user) {
      Object.assign(user, data);
    }
    return user;
  },

  // 删除用户
  deleteUser(id) {
    const index = this.userList.findIndex(u => u.id === id);
    if (index !== -1) {
      this.userList.splice(index, 1);
    }
    this.healthRecords = this.healthRecords.filter(r => r.userId !== id);
  },

  // 获取某用户的所有健康记录
  getRecordsByUser(userId) {
    return this.healthRecords.filter(r => r.userId === userId);
  },

  // 获取某用户某天的健康记录
  getRecordByUserAndDate(userId, date) {
    return this.healthRecords.find(r => r.userId === userId && r.date === date);
  },

  // 获取某用户有记录的日期列表
  getDatesByUser(userId) {
    return this.healthRecords
      .filter(r => r.userId === userId)
      .map(r => r.date)
      .sort((a, b) => b.localeCompare(a));
  },

  // 新增健康记录
  addHealthRecord(record) {
    const newRecord = {
      id: this.nextRecordId++,
      ...record
    };
    this.healthRecords.push(newRecord);
    return newRecord;
  }
});

export default store;
