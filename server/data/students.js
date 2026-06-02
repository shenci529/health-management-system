// Mock数据 - 学生相关数据

const students = [
  {
    id: 'S001',
    name: '张小明',
    grade: '三年级',
    class: '1班',
    age: 9,
    gender: '男',
    parentId: 'P001',
    classId: 'C001'
  },
  {
    id: 'S002',
    name: '李小红',
    grade: '三年级',
    class: '1班',
    age: 9,
    gender: '女',
    parentId: 'P002',
    classId: 'C001'
  },
  {
    id: 'S003',
    name: '王小刚',
    grade: '三年级',
    class: '2班',
    age: 9,
    gender: '男',
    parentId: 'P003',
    classId: 'C002'
  }
];

const morningChecks = [
  {
    id: 'MC001',
    studentId: 'S001',
    date: '2024-01-15',
    temperature: 36.5,
    symptoms: [],
    healthStatus: '健康',
    checkTime: '07:30',
    checker: '班主任王老师'
  },
  {
    id: 'MC002',
    studentId: 'S002',
    date: '2024-01-15',
    temperature: 36.8,
    symptoms: ['轻微咳嗽'],
    healthStatus: '需关注',
    checkTime: '07:35',
    checker: '班主任王老师'
  }
];

const exerciseChecks = [
  {
    id: 'EC001',
    studentId: 'S001',
    date: '2024-01-15',
    exerciseType: '课间操',
    duration: 20,
    intensity: '中等',
    checkTime: '10:00',
    location: '操场'
  },
  {
    id: 'EC002',
    studentId: 'S001',
    date: '2024-01-15',
    exerciseType: '眼保健操',
    duration: 5,
    intensity: '轻度',
    checkTime: '14:30',
    location: '教室'
  }
];

const healthTasks = [
  {
    id: 'HT001',
    studentId: 'S001',
    taskId: 'T001',
    taskName: '每日喝水打卡',
    taskType: '日常习惯',
    completedDate: '2024-01-15',
    completedTime: '15:00',
    status: '已完成',
    points: 10
  },
  {
    id: 'HT002',
    studentId: 'S001',
    taskId: 'T002',
    taskName: '户外活动30分钟',
    taskType: '运动任务',
    completedDate: '2024-01-15',
    completedTime: '17:00',
    status: '已完成',
    points: 20
  }
];

const physicalData = {
  'S001': {
    studentId: 'S001',
    studentName: '张小明',
    measurements: [
      {
        date: '2024-01',
        height: 135,
        weight: 32,
        bmi: 17.5,
        vision: { left: 5.0, right: 5.1 },
        dental: '正常',
        spine: '正常',
        heartRate: 85,
        bloodPressure: '90/60'
      },
      {
        date: '2023-09',
        height: 132,
        weight: 30,
        bmi: 17.2,
        vision: { left: 5.0, right: 5.0 },
        dental: '正常',
        spine: '正常',
        heartRate: 88,
        bloodPressure: '88/58'
      }
    ],
    sportsScores: [
      {
        semester: '2023-2024第一学期',
        running50m: 9.5,
        sitAndReach: 12,
        sitUps: 35,
        ropeSkipping: 120,
        totalScore: 85
      }
    ],
    growthTrend: {
      heightGrowth: '3cm/学期',
      weightGrowth: '2kg/学期',
      suggestion: '身高体重发育正常，建议继续保持良好的运动习惯'
    }
  },
  'S002': {
    studentId: 'S002',
    studentName: '李小红',
    measurements: [
      {
        date: '2024-01',
        height: 130,
        weight: 28,
        bmi: 16.6,
        vision: { left: 4.9, right: 4.8 },
        dental: '有龋齿',
        spine: '正常',
        heartRate: 82,
        bloodPressure: '88/58'
      }
    ],
    sportsScores: [],
    growthTrend: {
      heightGrowth: '2cm/学期',
      weightGrowth: '1.5kg/学期',
      suggestion: '视力略有下降，建议减少电子产品使用时间'
    }
  }
};

module.exports = {
  students,
  morningChecks,
  exerciseChecks,
  healthTasks,
  physicalData
};