<template>
  <div class="exercise-knowledge">
    <div class="search-bar">
      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="个人健康记录" name="record"></el-tab-pane>
        <el-tab-pane label="健康评估" name="assessment"></el-tab-pane>
        <el-tab-pane label="运动知识" name="knowledge"></el-tab-pane>
      </el-tabs>
      <div style="margin-top: 20px;">
        <el-input v-model="searchText" placeholder="点击这里进行搜索" style="width: 300px;" clearable></el-input>
      </div>
    </div>
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="8" v-for="(item, index) in filteredList" :key="index">
        <div class="exercise-card">
          <h3 style="text-align: center; margin-bottom: 15px;">{{ item.name }}</h3>
          <p style="font-size: 14px; margin-bottom: 10px;"><strong>运动种类：</strong>{{ item.type }}</p>
          <p style="font-size: 14px; margin-bottom: 10px;"><strong>适宜时间：</strong>{{ item.duration }}分钟</p>
          <p style="font-size: 14px; margin-bottom: 10px;"><strong>适宜心率：</strong>{{ item.heartRate }}次/分钟</p>
          <p style="font-size: 14px; margin-bottom: 10px;"><strong>适宜频率：</strong>{{ item.frequency }}</p>
          <p style="font-size: 14px; margin-bottom: 15px;"><strong>推荐强度：</strong>{{ item.intensity }}</p>
          <div style="text-align: center;">
            <el-button type="success" size="small" @click="handleViewDetail(item)">
              <i class="el-icon-search"></i> 查看详情
            </el-button>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'ExerciseKnowledge',
  data() {
    return {
      activeTab: 'knowledge',
      searchText: '',
      exerciseList: [
        { name: '越野跑', type: '越野', duration: 30, heartRate: '130-160', frequency: '3-4次/周', intensity: '8km/h' },
        { name: '瑜伽', type: '瑜伽', duration: 60, heartRate: '90-110', frequency: '4-5次/周', intensity: '无' },
        { name: '羽毛球', type: '羽毛球', duration: 60, heartRate: '130-150', frequency: '3-4次/周', intensity: '无' },
        { name: '慢跑', type: '慢跑', duration: 60, heartRate: '130-150', frequency: '无', intensity: '无' },
        { name: '跑步', type: '跑步', duration: 45, heartRate: '140-180', frequency: '无', intensity: '无' },
        { name: '太极拳', type: '太极', duration: 60, heartRate: '80-100', frequency: '无', intensity: '无' }
      ]
    };
  },
  computed: {
    filteredList() {
      if (!this.searchText) return this.exerciseList;
      const keyword = this.searchText.toLowerCase();
      return this.exerciseList.filter(item => {
        return item.name.toLowerCase().includes(keyword) ||
               item.type.toLowerCase().includes(keyword);
      });
    }
  },
  methods: {
    handleTabClick(tab) {
      if (tab.name === 'record') {
        this.$router.push('/health-log');
      } else if (tab.name === 'assessment') {
        this.$router.push('/health-assessment');
      }
    },
    handleViewDetail(item) {
      this.$alert(
        `<div style="text-align: left;">
          <p><strong>运动名称：</strong>${item.name}</p>
          <p><strong>运动种类：</strong>${item.type}</p>
          <p><strong>适宜时间：</strong>${item.duration}分钟</p>
          <p><strong>适宜心率：</strong>${item.heartRate}次/分钟</p>
          <p><strong>适宜频率：</strong>${item.frequency}</p>
          <p><strong>推荐强度：</strong>${item.intensity}</p>
        </div>`,
        '运动详情',
        {
          confirmButtonText: '确定',
          dangerouslyUseHTMLString: true
        }
      );
    }
  }
};
</script>

<style scoped>
.exercise-knowledge {
  padding: 20px;
}

.search-bar {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
}

.exercise-card {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  border: 1px solid #ddd;
}
</style>
