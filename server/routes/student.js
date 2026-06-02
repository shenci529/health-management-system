const express = require('express');
const router = express.Router();
const { morningChecks, exerciseChecks, healthTasks, physicalData } = require('../data/students');

// 晨间健康打卡
router.post('/morning-check', (req, res) => {
  const { studentId, temperature, symptoms, healthStatus } = req.body;
  
  if (!studentId || !temperature) {
    return res.status(400).json({
      success: false,
      message: '缺少必要参数'
    });
  }

  const newCheck = {
    id: `MC${String(morningChecks.length + 1).padStart(3, '0')}`,
    studentId,
    date: new Date().toISOString().split('T')[0],
    temperature,
    symptoms: symptoms || [],
    healthStatus: healthStatus || (temperature > 37.3 ? '需关注' : '健康'),
    checkTime: new Date().toTimeString().slice(0, 5),
    checker: '系统自动记录'
  };

  morningChecks.push(newCheck);

  res.json({
    success: true,
    message: '晨间健康打卡成功',
    data: newCheck
  });
});

// 课间运动打卡
router.post('/exercise-check', (req, res) => {
  const { studentId, exerciseType, duration, intensity, location } = req.body;
  
  if (!studentId || !exerciseType) {
    return res.status(400).json({
      success: false,
      message: '缺少必要参数'
    });
  }

  const newExercise = {
    id: `EC${String(exerciseChecks.length + 1).padStart(3, '0')}`,
    studentId,
    date: new Date().toISOString().split('T')[0],
    exerciseType,
    duration: duration || 20,
    intensity: intensity || '中等',
    checkTime: new Date().toTimeString().slice(0, 5),
    location: location || '操场'
  };

  exerciseChecks.push(newExercise);

  res.json({
    success: true,
    message: '课间运动打卡成功',
    data: newExercise
  });
});

// 健康任务完成
router.post('/task-complete', (req, res) => {
  const { studentId, taskId, taskName, taskType, points } = req.body;
  
  if (!studentId || !taskId) {
    return res.status(400).json({
      success: false,
      message: '缺少必要参数'
    });
  }

  const newTask = {
    id: `HT${String(healthTasks.length + 1).padStart(3, '0')}`,
    studentId,
    taskId,
    taskName: taskName || '健康任务',
    taskType: taskType || '日常习惯',
    completedDate: new Date().toISOString().split('T')[0],
    completedTime: new Date().toTimeString().slice(0, 5),
    status: '已完成',
    points: points || 10
  };

  healthTasks.push(newTask);

  res.json({
    success: true,
    message: '健康任务完成',
    data: newTask
  });
});

// 获取学生体质数据
router.get('/physical-data/:studentId', (req, res) => {
  const { studentId } = req.params;
  
  const data = physicalData[studentId];
  
  if (!data) {
    return res.status(404).json({
      success: false,
      message: '未找到该学生的体质数据'
    });
  }

  res.json({
    success: true,
    message: '获取学生体质数据成功',
    data
  });
});

module.exports = router;