import React from 'react';
import { CheckCircle, Info, TrendingUp, AlertTriangle, Eye, Scale } from 'lucide-react';
import Layout from '@/components/Layout';
import { useAppStore } from '@/store';
import { calculateBMI, getBMIStatus } from '@/utils';

const Assessment: React.FC = () => {
  const user = useAppStore((state) => state.user);
  const healthRecords = useAppStore((state) => state.healthRecords);
  
  const latestRecord = healthRecords[healthRecords.length - 1];
  
  const bmi = latestRecord ? calculateBMI(latestRecord.height, latestRecord.weight) : 0;
  const bmiStatus = user ? getBMIStatus(bmi, user.age) : { status: '', color: '' };
  
  // 计算基础能量消耗 (BMR) - 使用 Mifflin-St Jeor 公式
  const calculateBMR = () => {
    if (!user || !latestRecord) return 0;
    // 简化版公式，适用于儿童
    return Math.round(10 * latestRecord.weight + 6.25 * latestRecord.height - 5 * user.age + 5);
  };
  
  const bmr = calculateBMR();
  
  // 计算到达身体年龄的百分比
  const bodyAgePercentage = latestRecord ? Math.min(100, Math.round((latestRecord.height / 160) * 100)) : 0;
  
  // 健康评分
  const getHealthScore = () => {
    let score = 70;
    
    if (bmiStatus.status === '正常') score += 20;
    else if (bmiStatus.status === '偏瘦' || bmiStatus.status === '偏胖') score += 10;
    
    if (latestRecord?.heartRate) {
      if (latestRecord.heartRate >= 60 && latestRecord.heartRate <= 100) score += 10;
    }
    
    return Math.min(score, 100);
  };
  
  const healthScore = getHealthScore();
  
  const getScoreStatus = () => {
    if (healthScore >= 85) return { text: '优秀', color: 'text-green-500', bg: 'bg-green-100' };
    if (healthScore >= 70) return { text: '良好', color: 'text-blue-500', bg: 'bg-blue-100' };
    if (healthScore >= 60) return { text: '一般', color: 'text-yellow-500', bg: 'bg-yellow-100' };
    return { text: '需要关注', color: 'text-red-500', bg: 'bg-red-100' };
  };
  
  const scoreStatus = getScoreStatus();
  
  // 获取肥胖分析
  const getObesityAnalysis = () => {
    if (!latestRecord || !user) return null;
    
    const status = bmiStatus.status;
    if (status === '正常') {
      return {
        status: '体重正常',
        advice: '请继续保持健康的生活习惯和饮食习惯',
        risk: [],
      };
    } else if (status === '偏瘦') {
      return {
        status: '体重偏轻',
        advice: '适当增加营养摄入，保证充足的蛋白质和碳水化合物',
        risk: ['营养不良风险', '免疫力下降'],
      };
    } else if (status === '偏胖') {
      return {
        status: '体重偏胖',
        advice: '控制饮食，增加运动量，保持健康体重',
        risk: ['心血管疾病风险', '糖尿病风险'],
      };
    } else {
      return {
        status: '肥胖',
        advice: '建议咨询医生或营养师，制定科学的减重计划',
        risk: ['心血管疾病风险', '糖尿病风险', '关节问题'],
      };
    }
  };
  
  const obesityAnalysis = getObesityAnalysis();
  
  // 视力分析
  const getVisionAnalysis = () => {
    if (!latestRecord?.vision) return null;
    
    const vision = latestRecord.vision;
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
  };
  
  const visionAnalysis = getVisionAnalysis();

  return (
    <Layout>
      <div className="bg-gradient-to-br from-primary to-primary-dark text-white p-6">
        <h1 className="text-xl font-bold">健康评估</h1>
        <p className="text-primary-100 text-sm mt-1">基于您的健康数据分析</p>
      </div>

      <div className="p-4 space-y-4">
        {/* 健康评分 */}
        <div className="bg-white rounded-xl p-6 shadow text-center">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">健康评分</h2>
          <div className="relative inline-flex items-center justify-center mb-4">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke={healthScore >= 85 ? '#4CAF50' : healthScore >= 70 ? '#2196F3' : '#f59e0b'}
                strokeWidth="8"
                fill="none"
                strokeDasharray="352"
                strokeDashoffset={352 - (352 * healthScore) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-bold text-gray-800">{healthScore}</span>
            </div>
          </div>
          <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${scoreStatus.bg} ${scoreStatus.color}`}>
            {scoreStatus.text}
          </span>
        </div>

        {/* 身体信息 */}
        {latestRecord && (
          <div className="bg-white rounded-xl p-6 shadow">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Scale className="w-5 h-5 text-primary" />
              身体信息
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">体重</p>
                <p className="text-2xl font-bold text-gray-800">{latestRecord.weight} kg</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">身高</p>
                <p className="text-2xl font-bold text-gray-800">{latestRecord.height} cm</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">BMI</p>
                <p className="text-2xl font-bold text-gray-800">{bmi.toFixed(1)}</p>
                <p className={`text-xs ${bmiStatus.color}`}>{bmiStatus.status}</p>
              </div>
              {latestRecord.bloodSugar && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">血糖</p>
                  <p className="text-2xl font-bold text-gray-800">{latestRecord.bloodSugar} mmol/L</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 基础能量消耗状况 */}
        <div className="bg-white rounded-xl p-6 shadow">
          <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            基础能量消耗状况
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4">
              <div className="relative inline-flex items-center justify-center mb-3">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle cx="40" cy="40" r="32" stroke="#e5e7eb" strokeWidth="6" fill="none" />
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    stroke="#4CAF50"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray="201"
                    strokeDashoffset={201 - (201 * bodyAgePercentage) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-lg font-bold text-gray-800">{bodyAgePercentage}%</span>
              </div>
              <p className="text-sm text-gray-600">到达身高百分比</p>
            </div>
            <div className="text-center p-4">
              <div className="relative inline-flex items-center justify-center mb-3">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle cx="40" cy="40" r="32" stroke="#e5e7eb" strokeWidth="6" fill="none" />
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    stroke="#2196F3"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray="201"
                    strokeDashoffset={201 - (201 * Math.min(100, (bmr / 1500) * 100)) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-lg font-bold text-gray-800">{bmr}</span>
              </div>
              <p className="text-sm text-gray-600">基础代谢 (kcal)</p>
            </div>
          </div>
        </div>

        {/* 肥胖分析 */}
        {obesityAnalysis && (
          <div className="bg-white rounded-xl p-6 shadow">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Scale className="w-5 h-5 text-yellow-500" />
              肥胖分析
            </h2>
            <div className="mb-3">
              <p className="text-lg font-semibold text-gray-800">您的体重属于：{obesityAnalysis.status}</p>
            </div>
            <p className="text-gray-600 mb-4">{obesityAnalysis.advice}</p>
            {obesityAnalysis.risk.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-500">可能的健康风险：</p>
                {obesityAnalysis.risk.map((risk, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-red-500">
                    <AlertTriangle className="w-4 h-4" />
                    {risk}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 视力分析 */}
        {visionAnalysis && (
          <div className="bg-white rounded-xl p-6 shadow">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-500" />
              视力分析
            </h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center">
                <Eye className="w-8 h-8 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{latestRecord?.vision}</p>
                <p className="text-purple-500 font-semibold">视力等级：{visionAnalysis.level}</p>
              </div>
            </div>
            <p className="text-gray-600">{visionAnalysis.advice}</p>
          </div>
        )}

        {/* 健康指标 */}
        {latestRecord && (
          <div className="bg-white rounded-xl p-6 shadow">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              健康指标
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">心率</span>
                <span className="font-semibold">
                  {latestRecord.heartRate || '--'} 次/分
                  {latestRecord.heartRate && latestRecord.heartRate >= 60 && latestRecord.heartRate <= 100 && (
                    <CheckCircle className="w-4 h-4 text-green-500 inline ml-2" />
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">视力</span>
                <span className="font-semibold">
                  {latestRecord.vision || '--'}
                  {latestRecord.vision && latestRecord.vision >= 1.0 && (
                    <CheckCircle className="w-4 h-4 text-green-500 inline ml-2" />
                  )}
                </span>
              </div>
              {latestRecord.bloodPressure && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">血压</span>
                  <span className="font-semibold">{latestRecord.bloodPressure}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 健康建议 */}
        <div className="bg-white rounded-xl p-6 shadow">
          <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-secondary" />
            健康建议
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">1</span>
              </div>
              <p className="text-gray-600">保持规律作息，每天保证充足的睡眠</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">2</span>
              </div>
              <p className="text-gray-600">均衡饮食，多吃蔬菜水果，少吃油腻食物</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">3</span>
              </div>
              <p className="text-gray-600">每天进行至少1小时的户外运动</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">4</span>
              </div>
              <p className="text-gray-600">定期检查视力，注意用眼卫生</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Assessment;
