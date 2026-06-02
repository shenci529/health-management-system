export interface User {
  id: number;
  username: string;
  name: string;
  age: number;
  role: 'admin' | 'teacher' | 'parent' | 'student';
}

export interface HealthRecord {
  id: number;
  userId: number;
  height: number;
  weight: number;
  heartRate?: number;
  vision?: number;
  bloodPressure?: string;
  bloodSugar?: number;
  createdAt: Date;
}

export interface HealthKnowledge {
  id: number;
  title: string;
  content: string;
  category: string;
  createdAt: Date;
}

export interface ExerciseInfo {
  id: number;
  name: string;
  category: string;
  duration: number;
  description: string;
  benefits: string[];
  frequency: string;
}

export interface HealthLog {
  id: number;
  userId: number;
  type: 'exercise' | 'diet' | 'sleep' | 'note';
  content: string;
  createdAt: Date;
}
