import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Ruler, Scale, Heart, Eye, Activity } from 'lucide-react';
import Layout from '@/components/Layout';
import { useAppStore } from '@/store';

const Record: React.FC = () => {
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);
  const addHealthRecord = useAppStore((state) => state.addHealthRecord);
  
  const [formData, setFormData] = useState({
    height: '',
    weight: '',
    heartRate: '',
    vision: '',
    bloodPressure: '',
    bloodSugar: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    addHealthRecord({
      userId: user.id,
      height: parseFloat(formData.height),
      weight: parseFloat(formData.weight),
      heartRate: formData.heartRate ? parseInt(formData.heartRate) : undefined,
      vision: formData.vision ? parseFloat(formData.vision) : undefined,
      bloodPressure: formData.bloodPressure || undefined,
      bloodSugar: formData.bloodSugar ? parseFloat(formData.bloodSugar) : undefined,
    });
    
    navigate('/');
  };

  return (
    <Layout>
      {/* 头部 */}
      <div className="bg-white shadow-sm p-4 flex items-center gap-4 sticky top-0 z-10">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">添加健康记录</h1>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* 基本信息 */}
        <div className="bg-white rounded-xl p-4 shadow">
          <h2 className="text-sm font-semibold text-gray-600 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            基本信息
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                身高 (cm)
              </label>
              <div className="relative">
                <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => handleChange('height', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="请输入身高"
                  step="0.1"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                体重 (kg)
              </label>
              <div className="relative">
                <Scale className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => handleChange('weight', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="请输入体重"
                  step="0.1"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* 其他指标 */}
        <div className="bg-white rounded-xl p-4 shadow">
          <h2 className="text-sm font-semibold text-gray-600 mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            其他指标 (选填)
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                心率 (次/分)
              </label>
              <div className="relative">
                <Heart className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={formData.heartRate}
                  onChange={(e) => handleChange('heartRate', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="请输入心率"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                视力
              </label>
              <div className="relative">
                <Eye className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={formData.vision}
                  onChange={(e) => handleChange('vision', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="请输入视力"
                  step="0.1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                血压
              </label>
              <input
                type="text"
                value={formData.bloodPressure}
                onChange={(e) => handleChange('bloodPressure', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="例如：120/80"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                血糖 (mmol/L)
              </label>
              <input
                type="number"
                value={formData.bloodSugar}
                onChange={(e) => handleChange('bloodSugar', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="请输入血糖"
                step="0.1"
              />
            </div>
          </div>
        </div>

        {/* 保存按钮 */}
        <button
          type="submit"
          className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-4 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg"
        >
          <Save className="w-5 h-5" />
          保存记录
        </button>
      </form>
    </Layout>
  );
};

export default Record;
