// Mock数据 - 教师相关数据

const classes = [
  {
    id: 'C001',
    name: '三年级1班',
    grade: '三年级',
    teacherId: 'T001',
    studentCount: 35,
    classroom: '教学楼A-301'
  },
  {
    id: 'C002',
    name: '三年级2班',
    grade: '三年级',
    teacherId: 'T002',
    studentCount: 32,
    classroom: '教学楼A-302'
  },
  {
    id: 'C003',
    name: '四年级1班',
    grade: '四年级',
    teacherId: 'T003',
    studentCount: 38,
    classroom: '教学楼A-401'
  }
];

const classHealthBoard = {
  'C001': {
    classId: 'C001',
    className: '三年级1班',
    date: '2024-01-15',
    summary: {
      totalStudents: 35,
      presentToday: 33,
      absentToday: 2,
      healthAlerts: 3,
      morningCheckPass: 32,
      morningCheckWarning: 1
    },
    healthStatistics: {
      healthy: 30,
      needAttention: 3,
      sickLeave: 2,
      symptoms: {
        cough: 2,
        fever: 0,
        stomachache: 1,
        other: 0
      }
    },
    recentAlerts: [
      {
        studentName: '李小红',
        type: '症状预警',
        description: '轻微咳嗽',
        time: '07:35',
        priority: '中'
      },
      {
        studentName: '陈小芳',
        type: '请假',
        description: '感冒发烧',
        time: '06:30',
        priority: '高'
      }
    ],
    exerciseStats: {
      morningExercise: { completed: 33, total: 33 },
      eyeExercise: { completed: 32, total: 33 }
    }
  },
  'C002': {
    classId: 'C002',
    className: '三年级2班',
    date: '2024-01-15',
    summary: {
      totalStudents: 32,
      presentToday: 31,
      absentToday: 1,
      healthAlerts: 1,
      morningCheckPass: 30,
      morningCheckWarning: 1
    },
    healthStatistics: {
      healthy: 29,
      needAttention: 2,
      sickLeave: 1,
      symptoms: {
        cough: 1,
        fever: 0,
        stomachache: 1,
        other: 0
      }
    },
    recentAlerts: [],
    exerciseStats: {
      morningExercise: { completed: 31, total: 31 },
      eyeExercise: { completed: 31, total: 31 }
    }
  }
};

const diseaseWarnings = [
  {
    id: 'DW001',
    date: '2024-01-15',
    type: '流感预警',
    level: '黄色预警',
    description: '近期流感病例增多，请加强晨检和卫生管理',
    affectedArea: '全校',
    suggestions: [
      '加强教室通风换气',
      '提醒学生勤洗手',
      '关注有感冒症状的学生',
      '建议接种流感疫苗'
    ],
    status: '进行中',
    createdAt: '2024-01-14 16:00'
  },
  {
    id: 'DW002',
    date: '2024-01-10',
    type: '手足口病预警',
    level: '蓝色预警',
    description: '发现疑似手足口病病例1例，请密切关注',
    affectedArea: '一年级',
    suggestions: [
      '加强晨检观察手口足部位',
      '做好玩具消毒工作',
      '教育学生注意个人卫生'
    ],
    status: '已解除',
    createdAt: '2024-01-10 09:00'
  },
  {
    id: 'DW003',
    date: '2024-01-08',
    type: '诺如病毒预警',
    level: '橙色预警',
    description: '发现多例呕吐腹泻病例，疑似诺如病毒感染',
    affectedArea: '二年级3班',
    suggestions: [
      '隔离患病学生',
      '加强食堂卫生管理',
      '做好呕吐物消毒处理',
      '通知家长关注孩子症状'
    ],
    status: '进行中',
    createdAt: '2024-01-08 14:00'
  }
];

const recipes = [
  {
    id: 'R001',
    date: '2024-01-15',
    week: '第3周',
    meals: {
      breakfast: {
        main: '小米粥、鸡蛋',
        side: '肉包子、牛奶',
        nutrition: '蛋白质、碳水化合物'
      },
      lunch: {
        main: '米饭',
        dishes: ['红烧排骨', '西红柿炒蛋', '清炒时蔬'],
        soup: '紫菜蛋花汤',
        nutrition: '蛋白质、维生素、矿物质'
      },
      dinner: {
        main: '馒头',
        dishes: ['土豆炖牛肉', '炒青菜'],
        soup: '冬瓜排骨汤',
        nutrition: '蛋白质、膳食纤维'
      }
    },
    calories: {
      breakfast: 450,
      lunch: 650,
      dinner: 550,
      total: 1650
    },
    specialNotes: '本周增加维生素C摄入，预防流感'
  },
  {
    id: 'R002',
    date: '2024-01-16',
    week: '第3周',
    meals: {
      breakfast: {
        main: '豆浆、油条',
        side: '鸡蛋饼、酸奶',
        nutrition: '蛋白质、碳水化合物'
      },
      lunch: {
        main: '米饭',
        dishes: ['糖醋里脊', '炒西兰花', '麻婆豆腐'],
        soup: '番茄蛋汤',
        nutrition: '蛋白质、维生素'
      },
      dinner: {
        main: '米饭',
        dishes: ['清蒸鱼', '炒菠菜'],
        soup: '玉米排骨汤',
        nutrition: '蛋白质、叶酸'
      }
    },
    calories: {
      breakfast: 420,
      lunch: 680,
      dinner: 520,
      total: 1620
    },
    specialNotes: ''
  }
];

const visionPostureData = [
  {
    id: 'VP001',
    studentId: 'S001',
    studentName: '张小明',
    classId: 'C001',
    date: '2024-01-10',
    vision: {
      left: 5.0,
      right: 5.1,
      compared: '正常',
      trend: '稳定'
    },
    posture: {
      spine: '正常',
      shoulders: '平衡',
      head: '正位',
      suggestion: '保持良好坐姿'
    },
    screener: '校医张医生'
  },
  {
    id: 'VP002',
    studentId: 'S002',
    studentName: '李小红',
    classId: 'C001',
    date: '2024-01-10',
    vision: {
      left: 4.9,
      right: 4.8,
      compared: '轻度下降',
      trend: '下降'
    },
    posture: {
      spine: '正常',
      shoulders: '平衡',
      head: '正位',
      suggestion: '建议减少电子产品使用，增加户外活动'
    },
    screener: '校医张医生'
  },
  {
    id: 'VP003',
    studentId: 'S003',
    studentName: '王小刚',
    classId: 'C002',
    date: '2024-01-10',
    vision: {
      left: 4.7,
      right: 4.6,
      compared: '中度下降',
      trend: '下降'
    },
    posture: {
      spine: '轻度侧弯',
      shoulders: '左高右低',
      head: '轻度偏右',
      suggestion: '建议到医院进行进一步检查，注意纠正坐姿'
    },
    screener: '校医张医生'
  }
];

const mentalHealthRecords = [
  {
    id: 'MH001',
    studentId: 'S001',
    studentName: '张小明',
    classId: 'C001',
    date: '2024-01-10',
    assessmentType: '日常观察',
    mood: '良好',
    socialInteraction: '良好',
    behaviorNotes: '课堂表现积极，与同学相处融洽',
    concerns: [],
    recommendations: '继续保持积极的学习态度',
    counselor: '心理老师李老师'
  },
  {
    id: 'MH002',
    studentId: 'S002',
    studentName: '李小红',
    classId: 'C001',
    date: '2024-01-10',
    assessmentType: '日常观察',
    mood: '一般',
    socialInteraction: '良好',
    behaviorNotes: '近期情绪略有波动，可能与身体不适有关',
    concerns: ['情绪波动'],
    recommendations: '建议家长多关注孩子情绪变化，必要时进行心理辅导',
    counselor: '心理老师李老师'
  },
  {
    id: 'MH003',
    studentId: 'S003',
    studentName: '王小刚',
    classId: 'C002',
    date: '2024-01-08',
    assessmentType: '心理辅导',
    mood: '焦虑',
    socialInteraction: '一般',
    behaviorNotes: '学习压力较大，出现焦虑情绪，注意力不集中',
    concerns: ['学习焦虑', '注意力问题'],
    recommendations: '建议进行心理疏导，调整学习节奏，家长配合减轻压力',
    counselor: '心理老师李老师',
    followUp: {
      required: true,
      nextDate: '2024-01-22'
    }
  }
];

const safetyMaterials = [
  {
    id: 'SM001',
    title: '冬季流感预防指南',
    type: '图文',
    category: '疾病预防',
    targetGrade: '全校',
    content: '冬季是流感高发季节，请注意以下几点：1.勤洗手；2.保持室内通风；3.避免去人群密集场所；4.接种流感疫苗。',
    attachments: ['flu_prevention.pdf'],
    createdAt: '2024-01-10',
    author: '校医室',
    viewCount: 256
  },
  {
    id: 'SM002',
    title: '校园消防安全知识',
    type: '视频',
    category: '安全教育',
    targetGrade: '全校',
    content: '消防安全教育视频，包括火灾预防、逃生自救、灭火器使用等内容。',
    attachments: ['fire_safety.mp4'],
    createdAt: '2024-01-08',
    author: '安全办',
    viewCount: 380
  },
  {
    id: 'SM003',
    title: '交通安全教育手册',
    type: '图文',
    category: '交通安全',
    targetGrade: '小学',
    content: '小学生交通安全知识手册，包括过马路、乘车、骑车等安全注意事项。',
    attachments: ['traffic_safety.pdf'],
    createdAt: '2024-01-05',
    author: '安全办',
    viewCount: 189
  },
  {
    id: 'SM004',
    title: '防溺水安全教育',
    type: '视频',
    category: '安全教育',
    targetGrade: '全校',
    content: '夏季防溺水安全教育视频，讲解游泳安全知识和自救方法。',
    attachments: ['water_safety.mp4'],
    createdAt: '2024-01-03',
    author: '安全办',
    viewCount: 425
  }
];

module.exports = {
  classes,
  classHealthBoard,
  diseaseWarnings,
  recipes,
  visionPostureData,
  mentalHealthRecords,
  safetyMaterials
};