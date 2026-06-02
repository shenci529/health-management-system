import React from 'react';
import { ArrowLeft, Footprints, Heart, Trophy } from 'lucide-react';
import Layout from '@/components/Layout';
import { useAppStore } from '@/store';
import { useNavigate } from 'react-router-dom';

const Exercise: React.FC = () => {
  const navigate = useNavigate();
  const exercises = useAppStore((state) => state.exercises);

  const categories = [
    { key: 'cardio', name: '有氧运动', icon: Heart },
    { key: 'flexibility', name: '柔韧性训练', icon: Footprints },
    { key: 'strength', name: '力量训练', icon: Trophy },
  ];

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
        <h1 className="text-lg font-bold">运动知识</h1>
      </div>

      <div className="p-4 space-y-6">
        {categories.map((category) => {
          const categoryExercises = exercises.filter(e => e.category === category.key);
          if (categoryExercises.length === 0) return null;
          
          const Icon = category.icon;
          
          return (
            <div key={category.key}>
              <h2 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
                <Icon className="w-5 h-5 text-primary" />
                {category.name}
              </h2>
              <div className="space-y-3">
                {categoryExercises.map((exercise) => (
                  <div key={exercise.id} className="bg-white rounded-xl p-4 shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-800">{exercise.name}</h3>
                      <span className="text-sm text-gray-500">{exercise.duration}分钟</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{exercise.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {exercise.benefits.map((benefit: string, index: number) => (
                        <span
                          key={index}
                          className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full"
                        >
                          {benefit}
                        </span>
                      ))}
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                      建议频率：{exercise.frequency}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Layout>
  );
};

export default Exercise;
