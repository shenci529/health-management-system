const app = getApp();

Page({
  data: {
    categories: [],
  },

  onLoad() {
    this.loadExercises();
  },

  loadExercises() {
    const exercises = app.globalData.exercises;
    
    const categoryMap = {
      'cardio': { key: 'cardio', name: '有氧运动', icon: '❤️', exercises: [] },
      'flexibility': { key: 'flexibility', name: '柔韧性训练', icon: '🧘', exercises: [] },
      'strength': { key: 'strength', name: '力量训练', icon: '🏆', exercises: [] },
    };

    exercises.forEach(exercise => {
      if (categoryMap[exercise.category]) {
        categoryMap[exercise.category].exercises.push(exercise);
      }
    });

    const categories = Object.values(categoryMap).filter(cat => cat.exercises.length > 0);
    
    this.setData({ categories });
  },
});
