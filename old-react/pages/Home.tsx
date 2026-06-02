import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Ruler, 
  Scale, 
  Heart, 
  Eye, 
  Plus,
  Activity,
  BookOpen
} from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import Layout from '@/components/Layout';
import { useAppStore } from '@/store';
import { calculateBMI, getBMIStatus, formatDate } from '@/utils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const Home: React.FC = () => {
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);
  const healthRecords = useAppStore((state) => state.healthRecords);
  
  const latestRecord = healthRecords[healthRecords.length - 1];
  
  // 计算 BMI
  const bmi = latestRecord ? calculateBMI(latestRecord.height, latestRecord.weight) : 0;
  const bmiStatus = user ? getBMIStatus(bmi, user.age) : { status: '', color: '' };
  
  // 图表数据
  const chartData = {
    heartRate: {
      labels: healthRecords.map(r => formatDate(r.createdAt)),
      data: healthRecords.map(r => r.heartRate || 0),
    },
    vision: {
      labels: healthRecords.map(r => formatDate(r.createdAt)),
      data: healthRecords.map(r => r.vision || 0),
    },
    weight: {
      labels: healthRecords.map(r => formatDate(r.createdAt)),
      data: healthRecords.map(r => r.weight),
    },
  };

  const heartRateChartData = {
    labels: chartData.heartRate.labels,
    datasets: [
      {
        label: '心率 (次/分)',
        data: chartData.heartRate.data,
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
      },
    ],
  };

  const visionChartData = {
    labels: chartData.vision.labels,
    datasets: [
      {
        label: '视力',
        data: chartData.vision.data,
        borderColor: '#2196F3',
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
      },
    ],
  };

  const weightChartData = {
    labels: chartData.weight.labels,
    datasets: [
      {
        label: '体重 (kg)',
        data: chartData.weight.data,
        backgroundColor: '#4CAF50',
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  return (
    <Layout>
      {/* 头部 */}
      <div className="bg-gradient-to-br from-primary to-primary-dark text-white p-6 pb-20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold">你好，{user?.name}！</h1>
            <p className="text-primary-100 text-sm mt-1">今天也要保持健康哦～</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-xl font-bold">{user?.name?.[0]}</span>
          </div>
        </div>
      </div>

      {/* 快捷按钮 */}
      <div className="px-4 -mt-12 mb-6">
        <button
          onClick={() => navigate('/record')}
          className="w-full bg-white rounded-xl shadow-lg p-4 flex items-center justify-center gap-3 hover:shadow-xl transition-shadow"
        >
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <span className="font-semibold text-gray-700">添加健康记录</span>
        </button>
      </div>

      {/* 健康数据卡片 */}
      <div className="px-4 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">健康数据</h2>
        <div className="grid grid-cols-2 gap-4">
          {/* 身高 */}
          <div className="bg-white rounded-xl p-4 shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Ruler className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-gray-500 text-sm">身高</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{latestRecord?.height || '--'} cm</p>
          </div>

          {/* 体重 */}
          <div className="bg-white rounded-xl p-4 shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Scale className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-gray-500 text-sm">体重</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{latestRecord?.weight || '--'} kg</p>
          </div>

          {/* BMI */}
          <div className="bg-white rounded-xl p-4 shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-yellow-500" />
              </div>
              <span className="text-gray-500 text-sm">BMI</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{bmi || '--'}</p>
            <p className={`text-sm ${bmiStatus.color}`}>{bmiStatus.status}</p>
          </div>

          {/* 心率 */}
          <div className="bg-white rounded-xl p-4 shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-red-500" />
              </div>
              <span className="text-gray-500 text-sm">心率</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{latestRecord?.heartRate || '--'} 次/分</p>
          </div>

          {/* 视力 */}
          <div className="bg-white rounded-xl p-4 shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-purple-500" />
              </div>
              <span className="text-gray-500 text-sm">视力</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{latestRecord?.vision || '--'}</p>
          </div>
        </div>
      </div>

      {/* 图表 */}
      <div className="px-4 mb-6 space-y-6">
        <h2 className="text-lg font-bold text-gray-800">数据趋势</h2>
        
        {/* 心率趋势 */}
        <div className="bg-white rounded-xl p-4 shadow">
          <h3 className="text-sm font-semibold text-gray-600 mb-4">心率变化</h3>
          <div className="h-48">
            <Line data={heartRateChartData} options={chartOptions} />
          </div>
        </div>

        {/* 视力趋势 */}
        <div className="bg-white rounded-xl p-4 shadow">
          <h3 className="text-sm font-semibold text-gray-600 mb-4">视力变化</h3>
          <div className="h-48">
            <Line data={visionChartData} options={chartOptions} />
          </div>
        </div>

        {/* 体重趋势 */}
        <div className="bg-white rounded-xl p-4 shadow">
          <h3 className="text-sm font-semibold text-gray-600 mb-4">体重变化</h3>
          <div className="h-48">
            <Bar data={weightChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* 快捷入口 */}
      <div className="px-4 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">更多功能</h2>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/assessment')}
            className="bg-white rounded-xl p-4 shadow hover:shadow-lg transition-shadow text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-700">健康评估</span>
            </div>
          </button>
          
          <button
            onClick={() => navigate('/knowledge')}
            className="bg-white rounded-xl p-4 shadow hover:shadow-lg transition-shadow text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-700">健康知识</span>
            </div>
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
