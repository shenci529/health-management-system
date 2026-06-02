// 计算 BMI
export function calculateBMI(height: number, weight: number): number {
  const heightInM = height / 100;
  return parseFloat((weight / (heightInM * heightInM)).toFixed(1));
}

// 获取 BMI 状态
export function getBMIStatus(bmi: number, age: number): { status: string; color: string } {
  if (age < 18) {
    if (bmi < 15) return { status: '偏瘦', color: 'text-blue-600' };
    if (bmi < 18) return { status: '正常', color: 'text-green-600' };
    if (bmi < 22) return { status: '偏胖', color: 'text-yellow-600' };
    return { status: '肥胖', color: 'text-red-600' };
  } else {
    if (bmi < 18.5) return { status: '偏瘦', color: 'text-blue-600' };
    if (bmi < 24) return { status: '正常', color: 'text-green-600' };
    if (bmi < 28) return { status: '偏胖', color: 'text-yellow-600' };
    return { status: '肥胖', color: 'text-red-600' };
  }
}

// 格式化日期
export function formatDate(date: Date): string {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${month}-${day}`;
}

// 计算基础代谢率 (BMR)
export function calculateBMR(weight: number, height: number, age: number, gender: 'male' | 'female' = 'male'): number {
  if (gender === 'male') {
    return Math.round(88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age));
  } else {
    return Math.round(447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age));
  }
}

// 获取健康评分
export function getHealthScore(bmi: number, vision: number, heartRate: number): number {
  let score = 50;
  
  // BMI 评分
  if (bmi >= 18.5 && bmi < 24) score += 20;
  else if (bmi >= 17 && bmi < 28) score += 10;
  
  // 视力评分
  if (vision >= 1.0) score += 15;
  else if (vision >= 0.8) score += 10;
  else if (vision >= 0.6) score += 5;
  
  // 心率评分
  if (heartRate >= 60 && heartRate <= 80) score += 15;
  else if (heartRate >= 55 && heartRate <= 90) score += 10;
  
  return Math.min(score, 100);
}
