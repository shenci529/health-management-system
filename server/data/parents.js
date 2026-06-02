// Mock数据 - 家长相关数据

const parents = [
  {
    id: 'P001',
    name: '张大伟',
    phone: '13800138001',
    email: 'zhangdawei@example.com',
    children: ['S001'],
    relation: '父亲'
  },
  {
    id: 'P002',
    name: '李美华',
    phone: '13800138002',
    email: 'limeihua@example.com',
    children: ['S002'],
    relation: '母亲'
  },
  {
    id: 'P003',
    name: '王建国',
    phone: '13800138003',
    email: 'wangjianguo@example.com',
    children: ['S003'],
    relation: '父亲'
  }
];

const childHealthData = {
  'S001': {
    childId: 'S001',
    childName: '张小明',
    basicInfo: {
      age: 9,
      gender: '男',
      grade: '三年级',
      class: '1班'
    },
    healthSummary: {
      overallStatus: '健康',
      lastCheckDate: '2024-01-10',
      height: 135,
      weight: 32,
      bmi: 17.5,
      vision: { left: 5.0, right: 5.1 }
    },
    recentRecords: [
      {
        date: '2024-01-15',
        type: '晨检',
        status: '健康',
        temperature: 36.5
      },
      {
        date: '2024-01-14',
        type: '晨检',
        status: '健康',
        temperature: 36.6
      },
      {
        date: '2024-01-10',
        type: '体检',
        status: '正常',
        details: '身高体重发育正常'
      }
    ],
    healthAlerts: [
      {
        type: '疫苗提醒',
        message: '流感疫苗已到期，建议尽快接种',
        priority: '高'
      }
    ]
  },
  'S002': {
    childId: 'S002',
    childName: '李小红',
    basicInfo: {
      age: 9,
      gender: '女',
      grade: '三年级',
      class: '1班'
    },
    healthSummary: {
      overallStatus: '需关注',
      lastCheckDate: '2024-01-10',
      height: 130,
      weight: 28,
      bmi: 16.6,
      vision: { left: 4.9, right: 4.8 }
    },
    recentRecords: [
      {
        date: '2024-01-15',
        type: '晨检',
        status: '需关注',
        temperature: 36.8,
        note: '轻微咳嗽'
      }
    ],
    healthAlerts: [
      {
        type: '视力提醒',
        message: '视力有所下降，建议进行视力检查',
        priority: '中'
      },
      {
        type: '口腔提醒',
        message: '有龋齿，建议进行口腔检查',
        priority: '中'
      }
    ]
  }
};

const vaccineReminders = {
  'S001': [
    {
      id: 'V001',
      vaccineName: '流感疫苗',
      dueDate: '2024-02-01',
      status: '待接种',
      priority: '高',
      description: '每年接种一次，预防季节性流感',
      location: '社区卫生服务中心'
    },
    {
      id: 'V002',
      vaccineName: '乙肝疫苗（加强针）',
      dueDate: '2024-06-15',
      status: '待接种',
      priority: '中',
      description: '乙肝疫苗加强免疫',
      location: '社区卫生服务中心'
    },
    {
      id: 'V003',
      vaccineName: '麻疹疫苗',
      dueDate: '2023-12-01',
      status: '已接种',
      completedDate: '2023-11-28',
      description: '麻疹疫苗复种',
      location: '社区卫生服务中心'
    }
  ],
  'S002': [
    {
      id: 'V004',
      vaccineName: '流感疫苗',
      dueDate: '2024-01-20',
      status: '待接种',
      priority: '高',
      description: '每年接种一次，预防季节性流感',
      location: '社区卫生服务中心'
    },
    {
      id: 'V005',
      vaccineName: 'HPV疫苗（第一针）',
      dueDate: '2024-03-01',
      status: '待接种',
      priority: '中',
      description: 'HPV疫苗第一针',
      location: '社区卫生服务中心'
    }
  ]
};

const healthCheckAppointments = [
  {
    id: 'A001',
    childId: 'S001',
    parentId: 'P001',
    appointmentDate: '2024-02-15',
    appointmentTime: '09:00',
    checkType: '常规体检',
    hospital: '市儿童医院',
    department: '儿童保健科',
    status: '已预约',
    createdAt: '2024-01-10'
  },
  {
    id: 'A002',
    childId: 'S002',
    parentId: 'P002',
    appointmentDate: '2024-02-20',
    appointmentTime: '10:30',
    checkType: '视力检查',
    hospital: '市眼科医院',
    department: '小儿眼科',
    status: '已预约',
    createdAt: '2024-01-12'
  }
];

const messages = [
  {
    id: 'M001',
    parentId: 'P001',
    childId: 'S001',
    type: '健康通知',
    title: '晨检结果通知',
    content: '张小明同学今日晨检结果：体温36.5°C，健康状况良好。',
    sender: '班主任王老师',
    senderRole: '教师',
    readStatus: false,
    createdAt: '2024-01-15 08:00'
  },
  {
    id: 'M002',
    parentId: 'P001',
    childId: 'S001',
    type: '疫苗提醒',
    title: '流感疫苗接种提醒',
    content: '张小明同学的流感疫苗将于2024年2月1日到期，请及时安排接种。',
    sender: '校医室',
    senderRole: '校医',
    readStatus: true,
    createdAt: '2024-01-14 10:00'
  },
  {
    id: 'M003',
    parentId: 'P002',
    childId: 'S002',
    type: '健康预警',
    title: '健康关注提醒',
    content: '李小红同学今日晨检发现轻微咳嗽症状，请家长关注孩子健康状况。',
    sender: '班主任王老师',
    senderRole: '教师',
    readStatus: false,
    createdAt: '2024-01-15 08:05'
  }
];

module.exports = {
  parents,
  childHealthData,
  vaccineReminders,
  healthCheckAppointments,
  messages
};