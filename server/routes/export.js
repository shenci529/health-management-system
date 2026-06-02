const express = require('express');
const router = express.Router();

// 模拟导出记录
const exportRecords = [];

// 数据导出 - GET /api/export/:type
router.get('/:type', (req, res) => {
  const { type } = req.params;
  const { startDate, endDate, classId, format } = req.query;
  
  // 支持的导出类型
  const supportedTypes = [
    'student-health',      // 学生健康数据
    'morning-check',       // 晨检记录
    'exercise',            // 运动打卡记录
    'vaccine',             // 疫苗记录
    'physical',            // 体质数据
    'vision-posture',      // 视力体态数据
    'mental-health',       // 心理健康记录
    'recipe',              // 食谱数据
    'safety-materials'     // 安全教育素材
  ];

  if (!supportedTypes.includes(type)) {
    return res.status(400).json({
      success: false,
      message: `不支持的导出类型: ${type}`,
      supportedTypes
    });
  }

  // 模拟导出数据
  const exportData = {
    exportId: `EXP${String(exportRecords.length + 1).padStart(3, '0')}`,
    type,
    format: format || 'xlsx',
    parameters: {
      startDate: startDate || null,
      endDate: endDate || null,
      classId: classId || null
    },
    exportedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    downloadUrl: `/api/export/download/EXP${String(exportRecords.length + 1).padStart(3, '0')}`,
    recordCount: Math.floor(Math.random() * 100) + 10
  };

  exportRecords.push(exportData);

  // 根据类型返回不同的示例数据结构
  const sampleData = getSampleExportData(type);

  res.json({
    success: true,
    message: '数据导出成功',
    data: {
      exportInfo: exportData,
      preview: sampleData
    }
  });
});

// 获取导出记录列表
router.get('/records', (req, res) => {
  res.json({
    success: true,
    message: '获取导出记录成功',
    data: exportRecords,
    total: exportRecords.length
  });
});

// 获取示例导出数据
function getSampleExportData(type) {
  const dataMap = {
    'student-health': {
      headers: ['学号', '姓名', '年级', '班级', '健康状态', '最后检查日期'],
      rows: [
        ['S001', '张小明', '三年级', '1班', '健康', '2024-01-15'],
        ['S002', '李小红', '三年级', '1班', '需关注', '2024-01-15'],
        ['S003', '王小刚', '三年级', '2班', '健康', '2024-01-15']
      ]
    },
    'morning-check': {
      headers: ['学号', '姓名', '日期', '体温', '症状', '健康状态', '检查时间'],
      rows: [
        ['S001', '张小明', '2024-01-15', '36.5', '无', '健康', '07:30'],
        ['S002', '李小红', '2024-01-15', '36.8', '轻微咳嗽', '需关注', '07:35']
      ]
    },
    'exercise': {
      headers: ['学号', '姓名', '日期', '运动类型', '时长(分钟)', '强度', '地点'],
      rows: [
        ['S001', '张小明', '2024-01-15', '课间操', '20', '中等', '操场'],
        ['S001', '张小明', '2024-01-15', '眼保健操', '5', '轻度', '教室']
      ]
    },
    'vaccine': {
      headers: ['学号', '姓名', '疫苗名称', '应接种日期', '状态', '实际接种日期'],
      rows: [
        ['S001', '张小明', '流感疫苗', '2024-02-01', '待接种', '-'],
        ['S001', '张小明', '麻疹疫苗', '2023-12-01', '已接种', '2023-11-28']
      ]
    },
    'physical': {
      headers: ['学号', '姓名', '日期', '身高(cm)', '体重(kg)', 'BMI', '左眼视力', '右眼视力'],
      rows: [
        ['S001', '张小明', '2024-01', '135', '32', '17.5', '5.0', '5.1'],
        ['S002', '李小红', '2024-01', '130', '28', '16.6', '4.9', '4.8']
      ]
    },
    'vision-posture': {
      headers: ['学号', '姓名', '日期', '左眼视力', '右眼视力', '脊柱', '肩部', '建议'],
      rows: [
        ['S001', '张小明', '2024-01-10', '5.0', '5.1', '正常', '平衡', '保持良好坐姿'],
        ['S002', '李小红', '2024-01-10', '4.9', '4.8', '正常', '平衡', '减少电子产品使用']
      ]
    },
    'mental-health': {
      headers: ['学号', '姓名', '日期', '评估类型', '情绪状态', '社交情况', '关注点'],
      rows: [
        ['S001', '张小明', '2024-01-10', '日常观察', '良好', '良好', '-'],
        ['S002', '李小红', '2024-01-10', '日常观察', '一般', '良好', '情绪波动']
      ]
    },
    'recipe': {
      headers: ['日期', '餐次', '主食', '菜品', '营养信息'],
      rows: [
        ['2024-01-15', '早餐', '小米粥、鸡蛋', '肉包子、牛奶', '蛋白质、碳水化合物'],
        ['2024-01-15', '午餐', '米饭', '红烧排骨、西红柿炒蛋、清炒时蔬', '蛋白质、维生素']
      ]
    },
    'safety-materials': {
      headers: ['标题', '类型', '分类', '适用年级', '创建日期', '浏览次数'],
      rows: [
        ['冬季流感预防指南', '图文', '疾病预防', '全校', '2024-01-10', '256'],
        ['校园消防安全知识', '视频', '安全教育', '全校', '2024-01-08', '380']
      ]
    }
  };

  return dataMap[type] || { headers: [], rows: [] };
}

module.exports = router;