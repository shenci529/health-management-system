import React, { useState } from 'react';
import { ChevronLeft, ArrowUpRight, Tag } from 'lucide-react';
import Layout from '@/components/Layout';
import { useAppStore } from '@/store';

const Knowledge: React.FC = () => {
  const healthKnowledge = useAppStore((state) => state.healthKnowledge);
  const [selectedArticle, setSelectedArticle] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  const categories = ['all', ...new Set(healthKnowledge.map(k => k.category))];
  
  const filteredArticles = activeCategory === 'all' 
    ? healthKnowledge 
    : healthKnowledge.filter(k => k.category === activeCategory);

  if (selectedArticle !== null) {
    const article = healthKnowledge.find(k => k.id === selectedArticle);
    if (!article) return null;
    
    return (
      <Layout showNav={false}>
        <div className="sticky top-0 bg-white z-10 shadow-sm">
          <div className="flex items-center gap-4 p-4">
            <button
              onClick={() => setSelectedArticle(null)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold truncate">{article.title}</h1>
          </div>
        </div>
        
        {article.coverImage && (
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-48 object-cover"
          />
        )}
        
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary text-white">
              {article.category}
            </span>
          </div>
          
          <div className="prose max-w-none text-gray-700 whitespace-pre-line">
            <p className="text-lg leading-relaxed">{article.content}</p>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">💡 小贴士</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 定期阅读健康知识，保持健康意识</li>
              <li>• 将学到的知识分享给家人和朋友</li>
              <li>• 养成良好的生活习惯从现在开始</li>
            </ul>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gradient-to-br from-primary to-primary-dark text-white p-6">
        <h1 className="text-xl font-bold">健康知识</h1>
        <p className="text-primary-100 text-sm mt-1">学习健康知识，关注身体健康</p>
      </div>

      <div className="p-4 overflow-x-auto">
        <div className="flex gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === category
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {category === 'all' ? '全部' : category}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-4 space-y-4">
        {filteredArticles.map(article => (
          <div
            key={article.id}
            className="bg-white rounded-xl shadow overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedArticle(article.id)}
          >
            {article.coverImage && (
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full h-40 object-cover"
              />
            )}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-600">
                  <Tag className="w-3 h-3 mr-1" />
                  {article.category}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{article.title}</h3>
              <p className="text-gray-600 text-sm line-clamp-2">{article.content}</p>
              <div className="mt-3 flex items-center text-primary text-sm font-medium">
                阅读全文
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default Knowledge;
