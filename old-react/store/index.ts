import { create } from 'zustand';
import { persist } from 'zustand/middleware';
interface User {
  id: number;
  name: string;
  username: string;
  age: number;
  role: string;
}

interface HealthRecord {
  id: number;
  userId: number;
  height: number;
  weight: number;
  heartRate?: number;
  vision?: number;
  bloodSugar?: number;
  bloodPressure?: string;
  createdAt: Date;
}

interface HealthKnowledge {
  id: number;
  title: string;
  content: string;
  category: string;
  coverImage?: string;
  createdAt: Date;
}

interface ExerciseInfo {
  id: number;
  name: string;
  category: string;
  duration: number;
  description: string;
  benefits: string[];
  frequency: string;
}

interface HealthLog {
  id: number;
  userId: number;
  type: 'exercise' | 'diet' | 'sleep' | 'note';
  content: string;
  createdAt: Date;
}

interface AppStore {
  user: User | null;
  healthRecords: HealthRecord[];
  healthKnowledge: HealthKnowledge[];
  exercises: ExerciseInfo[];
  healthLogs: HealthLog[];
  isLoggedIn: boolean;
  
  // 用户相关
  login: (user: User) => void;
  logout: () => void;
  
  // 健康记录相关
  addHealthRecord: (record: Omit<HealthRecord, 'id' | 'createdAt'>) => void;
  
  // 健康日志相关
  addHealthLog: (log: Omit<HealthLog, 'id' | 'createdAt'>) => void;
}

// 模拟数据
const mockRecords: HealthRecord[] = [
  {
    id: 1,
    userId: 1,
    height: 140,
    weight: 35,
    heartRate: 80,
    vision: 1.0,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: 2,
    userId: 1,
    height: 142,
    weight: 36,
    heartRate: 78,
    vision: 1.0,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  },
  {
    id: 3,
    userId: 1,
    height: 145,
    weight: 37,
    heartRate: 82,
    vision: 0.9,
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
  },
];

const mockKnowledge: HealthKnowledge[] = [
  {
    id: 1,
    title: '儿童健康饮食指南',
    content: '儿童正处于生长发育的关键时期，需要均衡的营养摄入。建议每天摄入足够的蛋白质、维生素和矿物质。',
    category: 'diet',
    createdAt: new Date(),
  },
  {
    id: 2,
    title: '如何保护孩子的视力',
    content: '保持正确的读写姿势，控制电子产品使用时间，定期进行视力检查，是保护视力的关键。',
    category: 'vision',
    createdAt: new Date(),
  },
  {
    id: 3,
    title: '适量运动对儿童的好处',
    content: '每天进行适量的体育运动，可以增强体质，提高免疫力，促进骨骼发育，有助于儿童健康成长。',
    category: 'exercise',
    createdAt: new Date(),
  },
  {
    id: 4,
    title: '保证充足睡眠的重要性',
    content: '儿童每天需要保证8-10小时的睡眠时间，充足的睡眠有助于身体发育和智力发展。',
    category: 'sleep',
    createdAt: new Date(),
  },
];

const mockExercises: ExerciseInfo[] = [
  {
    id: 1,
    name: '跳绳',
    category: 'cardio',
    duration: 30,
    description: '跳绳是一项很好的有氧运动，可以锻炼心肺功能和协调性',
    benefits: ['增强心肺功能', '提高协调性', '燃烧脂肪'],
    frequency: '每周3-5次',
  },
  {
    id: 2,
    name: '跑步',
    category: 'cardio',
    duration: 45,
    description: '慢跑是最常见的运动方式之一，适合各年龄段人群',
    benefits: ['增强体质', '提高耐力', '改善心情'],
    frequency: '每周3-4次',
  },
  {
    id: 3,
    name: '游泳',
    category: 'cardio',
    duration: 60,
    description: '游泳是一项全身运动，对关节压力小',
    benefits: ['全身锻炼', '增强心肺功能', '塑形'],
    frequency: '每周2-3次',
  },
  {
    id: 4,
    name: '瑜伽',
    category: 'flexibility',
    duration: 40,
    description: '瑜伽可以帮助提高柔韧性和平衡感',
    benefits: ['提高柔韧性', '减轻压力', '改善姿势'],
    frequency: '每周2-3次',
  },
];

const mockHealthLogs: HealthLog[] = [
  {
    id: 1,
    userId: 1,
    type: 'exercise',
    content: '今天跑步30分钟，感觉很好',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: 2,
    userId: 1,
    type: 'diet',
    content: '今天吃了很多蔬菜和水果',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
];

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      user: null,
      healthRecords: mockRecords,
      healthKnowledge: mockKnowledge,
      exercises: mockExercises,
      healthLogs: mockHealthLogs,
      isLoggedIn: false,
      
      login: (user) => set({ user, isLoggedIn: true }),
      logout: () => set({ user: null, isLoggedIn: false }),
      addHealthRecord: (record) => set((state) => ({
        healthRecords: [
          ...state.healthRecords,
          {
            ...record,
            id: Date.now(),
            createdAt: new Date(),
          },
        ],
      })),
      addHealthLog: (log) => set((state) => ({
        healthLogs: [
          ...state.healthLogs,
          {
            ...log,
            id: Date.now(),
            createdAt: new Date(),
          },
        ],
      })),
    }),
    {
      name: 'health-app-storage',
    },
  ),
);
