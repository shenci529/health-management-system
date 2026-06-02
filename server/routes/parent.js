const express = require('express');
const router = express.Router();
const { childHealthData, vaccineReminders, healthCheckAppointments, messages } = require('../data/parents');

// 获取孩子健康数据
router.get('/child-health/:childId', (req, res) => {
  const { childId } = req.params;
  
  const data = childHealthData[childId];
  
  if (!data) {
    return res.status(404).json({
      success: false,
      message: '未找到该孩子的健康数据'
    });
  }

  res.json({
    success: true,
    message: '获取孩子健康数据成功',
    data
  });
});

// 疫苗提醒列表
router.get('/vaccine-reminders/:childId', (req, res) => {
  const { childId } = req.params;
  
  const reminders = vaccineReminders[childId];
  
  if (!reminders) {
    return res.json({
      success: true,
      message: '暂无疫苗提醒',
      data: []
    });
  }

  res.json({
    success: true,
    message: '获取疫苗提醒列表成功',
    data: reminders
  });
});

// 体检预约
router.post('/health-check-appointment', (req, res) => {
  const { childId, parentId, appointmentDate, appointmentTime, checkType, hospital, department } = req.body;
  
  if (!childId || !parentId || !appointmentDate || !checkType) {
    return res.status(400).json({
      success: false,
      message: '缺少必要参数'
    });
  }

  const newAppointment = {
    id: `A${String(healthCheckAppointments.length + 1).padStart(3, '0')}`,
    childId,
    parentId,
    appointmentDate,
    appointmentTime: appointmentTime || '09:00',
    checkType,
    hospital: hospital || '市儿童医院',
    department: department || '儿童保健科',
    status: '已预约',
    createdAt: new Date().toISOString().split('T')[0]
  };

  healthCheckAppointments.push(newAppointment);

  res.json({
    success: true,
    message: '体检预约成功',
    data: newAppointment
  });
});

// 获取家校沟通消息
router.get('/messages', (req, res) => {
  const { parentId, childId, unreadOnly } = req.query;
  
  let filteredMessages = [...messages];
  
  if (parentId) {
    filteredMessages = filteredMessages.filter(m => m.parentId === parentId);
  }
  
  if (childId) {
    filteredMessages = filteredMessages.filter(m => m.childId === childId);
  }
  
  if (unreadOnly === 'true') {
    filteredMessages = filteredMessages.filter(m => !m.readStatus);
  }

  res.json({
    success: true,
    message: '获取消息列表成功',
    data: filteredMessages,
    total: filteredMessages.length
  });
});

// 发送家校沟通消息
router.post('/messages', (req, res) => {
  const { parentId, childId, type, title, content, receiverId } = req.body;
  
  if (!parentId || !content) {
    return res.status(400).json({
      success: false,
      message: '缺少必要参数'
    });
  }

  const newMessage = {
    id: `M${String(messages.length + 1).padStart(3, '0')}`,
    parentId,
    childId: childId || null,
    type: type || '家长留言',
    title: title || '家长留言',
    content,
    sender: '家长',
    senderRole: '家长',
    receiverId,
    readStatus: false,
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
  };

  messages.push(newMessage);

  res.json({
    success: true,
    message: '消息发送成功',
    data: newMessage
  });
});

module.exports = router;