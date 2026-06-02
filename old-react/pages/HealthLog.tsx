import React, { useState } from 'react';
import { ArrowLeft, Plus, Calendar, Heart, Footprints, Apple, BookOpen } from 'lucide-react';
import Layout from '@/components/Layout';
import { useAppStore } from '@/store';
import { useNavigate } from 'react-router-dom';

const HealthLog: React.FC = () => {
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);
  const healthLogs = useAppStore((state) => state.healthLogs);
  const addHealthLog = useAppStore((state) => state.addHealthLog);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLog, setNewLog] = useState<{ type: 'exercise' | 'diet' | 'sleep' | 'note'; content: string }>({
    type: 'note',
    content: '',
  });

  const logIcons = {
    exercise: Footprints,
    diet: Apple,
    sleep: Heart,
    note: BookOpen,
  };

  const logColors = {
    exercise: 'bg-blue-100 text-blue-600',
    diet: 'bg-green-100 text-green-600',
    sleep: 'bg-purple-100 text-purple-600',
    note: 'bg-gray-100 text-gray-600',
  };

  const logLabels = {
    exercise: '运动',
    diet: '饮食',
    sleep: '睡眠',
    note: '笔记',
  };

  const handleSubmit = () => {
    if (!user || !newLog.content.trim()) return;
    
    addHealthLog({
      userId: user.id,
      type: newLog.type,
      content: newLog.content,
    });
    
    setIsModalOpen(false);
    setNewLog({ type: 'note', content: '' });
  };

  const groupedLogs = healthLogs.reduce((acc, log) => {
    const date = new Date(log.createdAt).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].unshift(log);
    return acc;
  }, {} as Record<string, typeof healthLogs>);

  return (
    <Layout>
      {/* 头部 */}
      <div className="bg-white shadow-sm p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold">健康日志</h1>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-6">
        {Object.entries(groupedLogs).map(([date, logs]) => (
          <div key={date}>
            <h2 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </h2>
            <div className="space-y-3">
              {logs.map((log) => {
                const Icon = logIcons[log.type];
                return (
                  <div key={log.id} className="bg-white rounded-xl p-4 shadow">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${logColors[log.type]}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-medium ${logColors[log.type]}`}>
                            {logLabels[log.type]}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(log.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{log.content}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        
        {healthLogs.length === 0 && (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">还没有健康日志</p>
            <p className="text-sm text-gray-400 mt-1">点击右上角的 + 开始记录</p>
          </div>
        )}
      </div>

      {/* 添加日志弹窗 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">添加日志</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex gap-2">
                {(Object.keys(logLabels) as Array<keyof typeof logLabels>).map((type) => {
                  const Icon = logIcons[type];
                  return (
                    <button
                      key={type}
                      onClick={() => setNewLog(prev => ({ ...prev, type }))}
                      className={`flex-1 py-3 rounded-xl flex flex-col items-center gap-1 transition-colors ${
                        newLog.type === type
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs font-medium">{logLabels[type]}</span>
                    </button>
                  );
                })}
              </div>
              
              <div>
                <textarea
                  value={newLog.content}
                  onChange={(e) => setNewLog(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                  placeholder="记录今天的健康情况..."
                />
              </div>
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={!newLog.content.trim()}
              className="w-full bg-primary hover:bg-primary-dark disabled:bg-gray-300 text-white font-semibold py-4 rounded-xl transition-colors"
            >
              保存
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default HealthLog;
