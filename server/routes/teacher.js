const express = require('express');
const router = express.Router();
const { 
  classes, 
  classHealthBoard, 
  diseaseWarnings, 
  recipes, 
  visionPostureData, 
  mentalHealthRecords, 
  safetyMaterials 
} = require('../data/teachers');

// 班级健康看板
router.get('/class-health/:classId', (req, res) => {
  const { classId } = req.params;
  const { date } = req.query;
  
  const classInfo = classes.find(c => c.id === classId);
  const healthData = classHealthBoard[classId];
  
  if (!classInfo) {
    return res.status(404).json({
      success: false,
      message: '未找到该班级信息'
    });
  }

  if (!healthData) {
    return res.json({
      success: true,
      message: '暂无该班级健康数据',
      data: {
        classInfo,
        healthData: null
      }
    });
  }

  res.json({
    success: true,
    message: '获取班级健康看板成功',
    data: {
      classInfo,
      healthData
    }
  });
});

// 传染病预警
router.get('/disease-warning', (req, res) => {
  const { status, level } = req.query;
  
  let filteredWarnings = [...diseaseWarnings];
  
  if (status) {
    filteredWarnings = filteredWarnings.filter(w => w.status === status);
  }
  
  if (level) {
    filteredWarnings = filteredWarnings.filter(w => w.level === level);
  }

  res.json({
    success: true,
    message: '获取传染病预警列表成功',
    data: filteredWarnings,
    total: filteredWarnings.length
  });
});

// 获取食谱列表
router.get('/recipes', (req, res) => {
  const { date, week } = req.query;
  
  let filteredRecipes = [...recipes];
  
  if (date) {
    filteredRecipes = filteredRecipes.filter(r => r.date === date);
  }
  
  if (week) {
    filteredRecipes = filteredRecipes.filter(r => r.week === week);
  }

  res.json({
    success: true,
    message: '获取食谱列表成功',
    data: filteredRecipes,
    total: filteredRecipes.length
  });
});

// 添加/更新食谱
router.post('/recipes', (req, res) => {
  const { date, week, meals, calories, specialNotes } = req.body;
  
  if (!date || !meals) {
    return res.status(400).json({
      success: false,
      message: '缺少必要参数'
    });
  }

  const newRecipe = {
    id: `R${String(recipes.length + 1).padStart(3, '0')}`,
    date,
    week: week || '',
    meals,
    calories: calories || {},
    specialNotes: specialNotes || ''
  };

  recipes.push(newRecipe);

  res.json({
    success: true,
    message: '食谱添加成功',
    data: newRecipe
  });
});

// 获取视力体态数据
router.get('/vision-posture', (req, res) => {
  const { classId, studentId } = req.query;
  
  let filteredData = [...visionPostureData];
  
  if (classId) {
    filteredData = filteredData.filter(d => d.classId === classId);
  }
  
  if (studentId) {
    filteredData = filteredData.filter(d => d.studentId === studentId);
  }

  res.json({
    success: true,
    message: '获取视力体态数据成功',
    data: filteredData,
    total: filteredData.length
  });
});

// 添加视力体态数据
router.post('/vision-posture', (req, res) => {
  const { studentId, studentName, classId, vision, posture, screener } = req.body;
  
  if (!studentId || !vision) {
    return res.status(400).json({
      success: false,
      message: '缺少必要参数'
    });
  }

  const newRecord = {
    id: `VP${String(visionPostureData.length + 1).padStart(3, '0')}`,
    studentId,
    studentName: studentName || '',
    classId: classId || '',
    date: new Date().toISOString().split('T')[0],
    vision,
    posture: posture || {},
    screener: screener || '校医'
  };

  visionPostureData.push(newRecord);

  res.json({
    success: true,
    message: '视力体态数据添加成功',
    data: newRecord
  });
});

// 获取心理健康记录
router.get('/mental-health', (req, res) => {
  const { classId, studentId, concern } = req.query;
  
  let filteredRecords = [...mentalHealthRecords];
  
  if (classId) {
    filteredRecords = filteredRecords.filter(r => r.classId === classId);
  }
  
  if (studentId) {
    filteredRecords = filteredRecords.filter(r => r.studentId === studentId);
  }
  
  if (concern) {
    filteredRecords = filteredRecords.filter(r => r.concerns && r.concerns.includes(concern));
  }

  res.json({
    success: true,
    message: '获取心理健康记录成功',
    data: filteredRecords,
    total: filteredRecords.length
  });
});

// 添加心理健康记录
router.post('/mental-health', (req, res) => {
  const { studentId, studentName, classId, assessmentType, mood, socialInteraction, behaviorNotes, concerns, recommendations, counselor, followUp } = req.body;
  
  if (!studentId) {
    return res.status(400).json({
      success: false,
      message: '缺少学生ID'
    });
  }

  const newRecord = {
    id: `MH${String(mentalHealthRecords.length + 1).padStart(3, '0')}`,
    studentId,
    studentName: studentName || '',
    classId: classId || '',
    date: new Date().toISOString().split('T')[0],
    assessmentType: assessmentType || '日常观察',
    mood: mood || '良好',
    socialInteraction: socialInteraction || '良好',
    behaviorNotes: behaviorNotes || '',
    concerns: concerns || [],
    recommendations: recommendations || '',
    counselor: counselor || '心理老师',
    followUp: followUp || null
  };

  mentalHealthRecords.push(newRecord);

  res.json({
    success: true,
    message: '心理健康记录添加成功',
    data: newRecord
  });
});

// 获取安全教育素材
router.get('/safety-materials', (req, res) => {
  const { type, category, targetGrade } = req.query;
  
  let filteredMaterials = [...safetyMaterials];
  
  if (type) {
    filteredMaterials = filteredMaterials.filter(m => m.type === type);
  }
  
  if (category) {
    filteredMaterials = filteredMaterials.filter(m => m.category === category);
  }
  
  if (targetGrade) {
    filteredMaterials = filteredMaterials.filter(m => m.targetGrade === targetGrade || m.targetGrade === '全校');
  }

  res.json({
    success: true,
    message: '获取安全教育素材成功',
    data: filteredMaterials,
    total: filteredMaterials.length
  });
});

// 添加安全教育素材
router.post('/safety-materials', (req, res) => {
  const { title, type, category, targetGrade, content, attachments, author } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({
      success: false,
      message: '缺少必要参数'
    });
  }

  const newMaterial = {
    id: `SM${String(safetyMaterials.length + 1).padStart(3, '0')}`,
    title,
    type: type || '图文',
    category: category || '安全教育',
    targetGrade: targetGrade || '全校',
    content,
    attachments: attachments || [],
    createdAt: new Date().toISOString().split('T')[0],
    author: author || '管理员',
    viewCount: 0
  };

  safetyMaterials.push(newMaterial);

  res.json({
    success: true,
    message: '安全教育素材添加成功',
    data: newMaterial
  });
});

module.exports = router;