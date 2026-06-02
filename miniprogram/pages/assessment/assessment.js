const app = getApp();

function calculateBMI(height, weight) {
  if (!height || !weight) return 0;
  const heightInM = height / 100;
  return (weight / (heightInM * heightInM)).toFixed(1);
}

function getBMIStatus(bmi, age) {
  if (!bmi) return { status: '', color: '' };
  
  if (bmi < 18.5) {
    return { status: '偏瘦', color: 'text-blue' };
  } else if (bmi < 24) {
    return { status: '正常', color: 'text-green' };
  } else if (bmi < 28) {
    return { status: '偏胖', color: 'text-yellow' };
  } else {
    return { status: '肥胖', color: 'text-red' };
  }
}

function calculateBMR(weight, height, age) {
  return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
}

function getHealthScore(bmiStatus, heartRate) {
  let score = 70;
  
  if (bmiStatus === '正常') score += 20;
  else if (bmiStatus === '偏瘦' || bmiStatus === '偏胖') score += 10;
  
  if (heartRate) {
    if (heartRate >= 60 && heartRate <= 100) score += 10;
  }
  
  return Math.min(score, 100);
}

function getObesityAnalysis(bmiStatus) {
  if (!bmiStatus) return null;
  
  const analyses = {
    '正常': {
      status: '体重正常',
      advice: '请继续保持健康的生活习惯和饮食习惯',
      risk: [],
    },
    '偏瘦': {
      status: '体重偏轻',
      advice: '适当增加营养摄入，保证充足的蛋白质和碳水化合物',
      risk: ['营养不良风险', '免疫力下降'],
    },
    '偏胖': {
      status: '体重偏胖',
      advice: '控制饮食，增加运动量，保持健康体重',
      risk: ['心血管疾病风险', '糖尿病风险'],
    },
    '肥胖': {
      status: '肥胖',
      advice: '建议咨询医生或营养师，制定科学的减重计划',
      risk: ['心血管疾病风险', '糖尿病风险', '关节问题'],
    },
  };
  
  return analyses[bmiStatus] || null;
}

function getVisionAnalysis(vision) {
  if (!vision) return null;
  
  if (vision >= 1.2) {
    return {
      level: '优秀',
      advice: '视力非常好，请继续保持良好的用眼习惯',
    };
  } else if (vision >= 1.0) {
    return {
      level: '正常',
      advice: '视力正常，请注意保护眼睛，避免长时间用眼',
    };
  } else if (vision >= 0.6) {
    return {
      level: '轻度近视',
      advice: '建议定期检查视力，注意用眼卫生，必要时佩戴眼镜',
    };
  } else {
    return {
      level: '需要关注',
      advice: '视力较弱，建议尽快到眼科检查，及时矫正',
    };
  }
}

Page({
  data: {
    healthScore: 0,
    scoreStatusText: '',
    scoreStatusClass: '',
    latestRecord: null,
    bmi: 0,
    bmiStatus: '',
    bmiStatusClass: '',
    bmr: 0,
    bodyAgePercentage: 0,
    obesityAnalysis: null,
    visionAnalysis: null,
  },

  onLoad() {
    this.loadAssessment();
  },

  onShow() {
    this.loadAssessment();
  },

  loadAssessment() {
    const user = app.globalData.user;
    const records = app.globalData.healthRecords;
    const latestRecord = records.length > 0 ? records[records.length - 1] : null;
    
    if (!latestRecord) {
      return;
    }

    const bmi = latestRecord.height && latestRecord.weight 
      ? calculateBMI(latestRecord.height, latestRecord.weight) 
      : 0;
    const bmiStatusInfo = getBMIStatus(bmi, user?.age || 18);
    const bmr = calculateBMR(latestRecord.weight, latestRecord.height, user?.age || 18);
    const bodyAgePercentage = latestRecord.height ? Math.min(100, Math.round((latestRecord.height / 160) * 100)) : 0;
    const healthScore = getHealthScore(bmiStatusInfo.status, latestRecord.heartRate);
    const obesityAnalysis = getObesityAnalysis(bmiStatusInfo.status);
    const visionAnalysis = getVisionAnalysis(latestRecord.vision);

    let scoreStatusText = '';
    let scoreStatusClass = '';
    if (healthScore >= 85) {
      scoreStatusText = '优秀';
      scoreStatusClass = 'status-excellent';
    } else if (healthScore >= 70) {
      scoreStatusText = '良好';
      scoreStatusClass = 'status-good';
    } else if (healthScore >= 60) {
      scoreStatusText = '一般';
      scoreStatusClass = 'status-normal';
    } else {
      scoreStatusText = '需要关注';
      scoreStatusClass = 'status-warning';
    }

    this.setData({
      healthScore,
      scoreStatusText,
      scoreStatusClass,
      latestRecord,
      bmi,
      bmiStatus: bmiStatusInfo.status,
      bmiStatusClass: bmiStatusInfo.color,
      bmr,
      bodyAgePercentage,
      obesityAnalysis,
      visionAnalysis,
    });
  },
});
