const express = require('express');
const router = express.Router();

// 模拟通知记录
const notifications = [];

// 消息推送 - POST /api/notification/send
router.post('/send', (req, res) => {
  const { 
    type, 
    title, 
    content, 
    recipients, 
    priority, 
    sender 
  } = req.body;
  
  if (!title || !content || !recipients) {
    return res.status(400).json({
      success: false,
      message: '缺少必要参数'
    });
  }

  const notification = {
    id: `N${String(notifications.length + 1).padStart(3, '0')}`,
    type: type || '系统通知',
    title,
    content,
    recipients: Array.isArray(recipients) ? recipients : [recipients],
    priority: priority || '普通',
    sender: sender || '系统',
    status: '已发送',
    sentAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    readCount: 0
  };

  notifications.push(notification);

  res.json({
    success: true,
    message: '消息推送成功',
    data: notification
  });
});

// 获取通知列表 - GET /api/notification/list
router.get('/list', (req, res) => {
  const { status, priority, limit } = req.query;
  
  let filteredNotifications = [...notifications];
  
  if (status) {
    filteredNotifications = filteredNotifications.filter(n => n.status === status);
  }
  
  if (priority) {
    filteredNotifications = filteredNotifications.filter(n => n.priority === priority);
  }
  
  if (limit) {
    filteredNotifications = filteredNotifications.slice(0, parseInt(limit));
  }

  res.json({
    success: true,
    message: '获取通知列表成功',
    data: filteredNotifications,
    total: filteredNotifications.length
  });
});

module.exports = router;