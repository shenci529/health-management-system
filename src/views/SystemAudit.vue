<template>
  <div class="system-audit">
    <el-tabs v-model="activeTab" type="card">
      <!-- 操作日志 -->
      <el-tab-pane label="操作日志" name="operation">
        <div class="search-bar">
          <el-input v-model="opSearch.user" placeholder="操作用户" style="width: 150px;"></el-input>
          <el-select v-model="opSearch.type" placeholder="操作类型" clearable style="width: 150px;">
            <el-option label="新增" value="add"></el-option>
            <el-option label="修改" value="edit"></el-option>
            <el-option label="删除" value="delete"></el-option>
            <el-option label="查询" value="query"></el-option>
            <el-option label="导出" value="export"></el-option>
            <el-option label="登录" value="login"></el-option>
          </el-select>
          <el-date-picker v-model="opSearch.dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 240px;"></el-date-picker>
          <el-input v-model="opSearch.ip" placeholder="IP地址" style="width: 150px;"></el-input>
          <el-button type="primary" icon="el-icon-search" @click="searchOperationLog">查询</el-button>
          <el-button type="success" icon="el-icon-download" @click="exportOperationLog">导出</el-button>
        </div>
        <el-table :data="pagedOperationLog" border style="width: 100%">
          <el-table-column type="index" label="序号" width="60"></el-table-column>
          <el-table-column prop="user" label="操作用户" width="120"></el-table-column>
          <el-table-column prop="type" label="操作类型" width="100">
            <template slot-scope="scope">
              <el-tag :type="getOperationTagType(scope.row.type)">{{ scope.row.type }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="module" label="操作模块" width="120"></el-table-column>
          <el-table-column prop="content" label="操作内容" show-overflow-tooltip></el-table-column>
          <el-table-column prop="ip" label="IP地址" width="140"></el-table-column>
          <el-table-column prop="time" label="操作时间" width="180"></el-table-column>
          <el-table-column prop="status" label="状态" width="80">
            <template slot-scope="scope">
              <el-tag :type="scope.row.status === '成功' ? 'success' : 'danger'" size="small">{{ scope.row.status }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination">
          <el-pagination background layout="total, prev, pager, next" :total="filteredOperationLog.length" :page-size="10" :current-page.sync="opCurrentPage"></el-pagination>
        </div>
      </el-tab-pane>

      <!-- 登录日志 -->
      <el-tab-pane label="登录日志" name="login">
        <div class="search-bar">
          <el-input v-model="loginSearch.user" placeholder="用户名" style="width: 150px;"></el-input>
          <el-select v-model="loginSearch.status" placeholder="登录状态" clearable style="width: 120px;">
            <el-option label="成功" value="成功"></el-option>
            <el-option label="失败" value="失败"></el-option>
          </el-select>
          <el-date-picker v-model="loginSearch.dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 240px;"></el-date-picker>
          <el-button type="primary" icon="el-icon-search" @click="searchLoginLog">查询</el-button>
          <el-button type="success" icon="el-icon-download" @click="exportLoginLog">导出</el-button>
        </div>
        <el-table :data="pagedLoginLog" border style="width: 100%">
          <el-table-column type="index" label="序号" width="60"></el-table-column>
          <el-table-column prop="user" label="用户名" width="120"></el-table-column>
          <el-table-column prop="loginType" label="登录方式" width="100"></el-table-column>
          <el-table-column prop="ip" label="登录IP" width="140"></el-table-column>
          <el-table-column prop="location" label="登录地点" width="150"></el-table-column>
          <el-table-column prop="browser" label="浏览器" width="120"></el-table-column>
          <el-table-column prop="os" label="操作系统" width="100"></el-table-column>
          <el-table-column prop="time" label="登录时间" width="180"></el-table-column>
          <el-table-column prop="status" label="状态" width="80">
            <template slot-scope="scope">
              <el-tag :type="scope.row.status === '成功' ? 'success' : 'danger'" size="small">{{ scope.row.status }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination">
          <el-pagination background layout="total, prev, pager, next" :total="filteredLoginLog.length" :page-size="10" :current-page.sync="loginCurrentPage"></el-pagination>
        </div>
      </el-tab-pane>

      <!-- 账号风控 -->
      <el-tab-pane label="账号风控" name="risk">
        <div class="risk-summary">
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="risk-card">
                <div class="risk-icon" style="background: #fef0f0;">
                  <i class="el-icon-warning" style="color: #f56c6c;"></i>
                </div>
                <div class="risk-info">
                  <span class="risk-value">{{ riskStats.abnormal }}</span>
                  <span class="risk-label">异常登录账号</span>
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="risk-card">
                <div class="risk-icon" style="background: #fdf6ec;">
                  <i class="el-icon-lock" style="color: #e6a23c;"></i>
                </div>
                <div class="risk-info">
                  <span class="risk-value">{{ riskStats.locked }}</span>
                  <span class="risk-label">已锁定账号</span>
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="risk-card">
                <div class="risk-icon" style="background: #f0f9eb;">
                  <i class="el-icon-unlock" style="color: #67c23a;"></i>
                </div>
                <div class="risk-info">
                  <span class="risk-value">{{ riskStats.unlocked }}</span>
                  <span class="risk-label">今日解锁账号</span>
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="risk-card">
                <div class="risk-icon" style="background: #ecf5ff;">
                  <i class="el-icon-view" style="color: #409eff;"></i>
                </div>
                <div class="risk-info">
                  <span class="risk-value">{{ riskStats.monitored }}</span>
                  <span class="risk-label">监控中账号</span>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
        <div class="search-bar" style="margin-top: 20px;">
          <el-input v-model="riskSearch.user" placeholder="用户名" style="width: 150px;"></el-input>
          <el-select v-model="riskSearch.riskLevel" placeholder="风险等级" clearable style="width: 120px;">
            <el-option label="高风险" value="high"></el-option>
            <el-option label="中风险" value="medium"></el-option>
            <el-option label="低风险" value="low"></el-option>
          </el-select>
          <el-select v-model="riskSearch.status" placeholder="账号状态" clearable style="width: 120px;">
            <el-option label="正常" value="normal"></el-option>
            <el-option label="锁定" value="locked"></el-option>
            <el-option label="监控" value="monitored"></el-option>
          </el-select>
          <el-button type="primary" icon="el-icon-search" @click="searchRiskAccount">查询</el-button>
        </div>
        <el-table :data="pagedRiskAccount" border style="width: 100%">
          <el-table-column type="index" label="序号" width="60"></el-table-column>
          <el-table-column prop="user" label="用户名" width="120"></el-table-column>
          <el-table-column prop="realName" label="真实姓名" width="100"></el-table-column>
          <el-table-column prop="role" label="角色" width="100"></el-table-column>
          <el-table-column prop="riskLevel" label="风险等级" width="100">
            <template slot-scope="scope">
              <el-tag :type="getRiskTagType(scope.row.riskLevel)">{{ scope.row.riskLevel }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="abnormalCount" label="异常次数" width="100"></el-table-column>
          <el-table-column prop="lastAbnormal" label="最近异常" width="180"></el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template slot-scope="scope">
              <el-tag :type="getAccountStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" @click="viewRiskDetail(scope.row)">详情</el-button>
              <el-button v-if="scope.row.status !== '锁定'" type="warning" size="mini" @click="lockAccount(scope.row)">锁定</el-button>
              <el-button v-if="scope.row.status === '锁定'" type="success" size="mini" @click="unlockAccount(scope.row)">解锁</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination">
          <el-pagination background layout="total, prev, pager, next" :total="filteredRiskAccount.length" :page-size="10" :current-page.sync="riskCurrentPage"></el-pagination>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 风险详情对话框 -->
    <el-dialog title="风险详情" :visible.sync="riskDetailVisible" width="600px">
      <el-descriptions :column="2" border v-if="currentRiskAccount">
        <el-descriptions-item label="用户名">{{ currentRiskAccount.user }}</el-descriptions-item>
        <el-descriptions-item label="真实姓名">{{ currentRiskAccount.realName }}</el-descriptions-item>
        <el-descriptions-item label="角色">{{ currentRiskAccount.role }}</el-descriptions-item>
        <el-descriptions-item label="风险等级">
          <el-tag :type="getRiskTagType(currentRiskAccount.riskLevel)">{{ currentRiskAccount.riskLevel }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="异常次数">{{ currentRiskAccount.abnormalCount }}</el-descriptions-item>
        <el-descriptions-item label="账号状态">
          <el-tag :type="getAccountStatusType(currentRiskAccount.status)">{{ currentRiskAccount.status }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="最近异常时间" :span="2">{{ currentRiskAccount.lastAbnormal }}</el-descriptions-item>
        <el-descriptions-item label="异常记录" :span="2">
          <el-timeline>
            <el-timeline-item v-for="(item, index) in currentRiskAccount.abnormalRecords" :key="index" :timestamp="item.time" placement="top">
              {{ item.content }}
            </el-timeline-item>
          </el-timeline>
        </el-descriptions-item>
      </el-descriptions>
      <span slot="footer" class="dialog-footer">
        <el-button @click="riskDetailVisible = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'SystemAudit',
  data() {
    return {
      activeTab: 'operation',
      // 操作日志
      opSearch: { user: '', type: '', dateRange: null, ip: '' },
      opCurrentPage: 1,
      operationLog: [
        { id: 1, user: 'admin', type: '登录', module: '系统管理', content: '用户登录系统', ip: '192.168.1.100', time: '2024-01-15 09:30:25', status: '成功' },
        { id: 2, user: 'teacher01', type: '新增', module: '学生管理', content: '新增学生信息：张三', ip: '192.168.1.101', time: '2024-01-15 09:35:12', status: '成功' },
        { id: 3, user: 'admin', type: '修改', module: '用户管理', content: '修改用户权限：teacher02', ip: '192.168.1.100', time: '2024-01-15 10:15:33', status: '成功' },
        { id: 4, user: 'teacher02', type: '删除', module: '公告管理', content: '删除公告：春季运动会通知', ip: '192.168.1.102', time: '2024-01-15 11:20:45', status: '成功' },
        { id: 5, user: 'nurse01', type: '导出', module: '体检管理', content: '导出体检数据Excel', ip: '192.168.1.103', time: '2024-01-15 14:05:18', status: '成功' },
        { id: 6, user: 'teacher01', type: '查询', module: '健康档案', content: '查询学生健康档案', ip: '192.168.1.101', time: '2024-01-15 15:30:22', status: '成功' },
        { id: 7, user: 'hacker', type: '登录', module: '系统管理', content: '尝试登录系统', ip: '10.0.0.55', time: '2024-01-15 16:45:10', status: '失败' },
        { id: 8, user: 'admin', type: '修改', module: '系统配置', content: '修改打卡规则配置', ip: '192.168.1.100', time: '2024-01-15 17:10:55', status: '成功' }
      ],
      // 登录日志
      loginSearch: { user: '', status: '', dateRange: null },
      loginCurrentPage: 1,
      loginLog: [
        { id: 1, user: 'admin', loginType: '密码登录', ip: '192.168.1.100', location: '北京市海淀区', browser: 'Chrome 120', os: 'Windows 10', time: '2024-01-15 09:30:25', status: '成功' },
        { id: 2, user: 'teacher01', loginType: '密码登录', ip: '192.168.1.101', location: '北京市朝阳区', browser: 'Firefox 121', os: 'Windows 11', time: '2024-01-15 09:32:15', status: '成功' },
        { id: 3, user: 'teacher02', loginType: '短信验证', ip: '192.168.1.102', location: '北京市西城区', browser: 'Edge 120', os: 'Windows 10', time: '2024-01-15 09:35:42', status: '成功' },
        { id: 4, user: 'nurse01', loginType: '密码登录', ip: '192.168.1.103', location: '北京市东城区', browser: 'Chrome 120', os: 'macOS', time: '2024-01-15 09:40:18', status: '成功' },
        { id: 5, user: 'hacker', loginType: '密码登录', ip: '10.0.0.55', location: '未知', browser: 'Chrome 119', os: 'Linux', time: '2024-01-15 16:45:10', status: '失败' },
        { id: 6, user: 'teacher01', loginType: '密码登录', ip: '192.168.1.101', location: '北京市朝阳区', browser: 'Firefox 121', os: 'Windows 11', time: '2024-01-15 18:05:33', status: '成功' }
      ],
      // 账号风控
      riskStats: { abnormal: 3, locked: 1, unlocked: 2, monitored: 5 },
      riskSearch: { user: '', riskLevel: '', status: '' },
      riskCurrentPage: 1,
      riskAccounts: [
        { id: 1, user: 'hacker', realName: '未知', role: '游客', riskLevel: '高风险', abnormalCount: 15, lastAbnormal: '2024-01-15 16:45:10', status: '锁定', abnormalRecords: [
          { time: '2024-01-15 16:45:10', content: '连续5次密码错误' },
          { time: '2024-01-15 14:30:22', content: '异常IP登录尝试' },
          { time: '2024-01-14 22:10:05', content: '非工作时间登录' }
        ]},
        { id: 2, user: 'teacher03', realName: '王五', role: '教师', riskLevel: '中风险', abnormalCount: 5, lastAbnormal: '2024-01-15 11:20:33', status: '监控', abnormalRecords: [
          { time: '2024-01-15 11:20:33', content: '异地登录' },
          { time: '2024-01-14 09:15:20', content: '新设备登录' }
        ]},
        { id: 3, user: 'parent05', realName: '赵六', role: '家长', riskLevel: '低风险', abnormalCount: 2, lastAbnormal: '2024-01-14 20:30:15', status: '正常', abnormalRecords: [
          { time: '2024-01-14 20:30:15', content: '密码错误2次' }
        ]},
        { id: 4, user: 'test01', realName: '测试账号', role: '管理员', riskLevel: '高风险', abnormalCount: 8, lastAbnormal: '2024-01-15 08:05:42', status: '监控', abnormalRecords: [
          { time: '2024-01-15 08:05:42', content: '凌晨异常登录' },
          { time: '2024-01-14 23:50:18', content: '批量数据导出' }
        ]}
      ],
      riskDetailVisible: false,
      currentRiskAccount: null
    };
  },
  computed: {
    filteredOperationLog() {
      return this.operationLog.filter(item => {
        const matchUser = !this.opSearch.user || item.user.includes(this.opSearch.user);
        const matchType = !this.opSearch.type || item.type === this.opSearch.type;
        const matchIp = !this.opSearch.ip || item.ip.includes(this.opSearch.ip);
        return matchUser && matchType && matchIp;
      });
    },
    pagedOperationLog() {
      const start = (this.opCurrentPage - 1) * 10;
      return this.filteredOperationLog.slice(start, start + 10);
    },
    filteredLoginLog() {
      return this.loginLog.filter(item => {
        const matchUser = !this.loginSearch.user || item.user.includes(this.loginSearch.user);
        const matchStatus = !this.loginSearch.status || item.status === this.loginSearch.status;
        return matchUser && matchStatus;
      });
    },
    pagedLoginLog() {
      const start = (this.loginCurrentPage - 1) * 10;
      return this.filteredLoginLog.slice(start, start + 10);
    },
    filteredRiskAccount() {
      return this.riskAccounts.filter(item => {
        const matchUser = !this.riskSearch.user || item.user.includes(this.riskSearch.user);
        const matchRisk = !this.riskSearch.riskLevel || item.riskLevel.includes(this.riskSearch.riskLevel === 'high' ? '高' : this.riskSearch.riskLevel === 'medium' ? '中' : '低');
        const matchStatus = !this.riskSearch.status || item.status.includes(this.riskSearch.status === 'normal' ? '正常' : this.riskSearch.status === 'locked' ? '锁定' : '监控');
        return matchUser && matchRisk && matchStatus;
      });
    },
    pagedRiskAccount() {
      const start = (this.riskCurrentPage - 1) * 10;
      return this.filteredRiskAccount.slice(start, start + 10);
    }
  },
  methods: {
    getOperationTagType(type) {
      const map = { '新增': 'success', '修改': 'warning', '删除': 'danger', '查询': 'info', '导出': '', '登录': 'primary' };
      return map[type] || '';
    },
    getRiskTagType(level) {
      const map = { '高风险': 'danger', '中风险': 'warning', '低风险': 'info' };
      return map[level] || 'info';
    },
    getAccountStatusType(status) {
      const map = { '正常': 'success', '锁定': 'danger', '监控': 'warning' };
      return map[status] || 'info';
    },
    searchOperationLog() {
      this.opCurrentPage = 1;
      this.$message.success('查询完成，共找到 ' + this.filteredOperationLog.length + ' 条记录');
    },
    exportOperationLog() {
      this.$message.success('操作日志导出成功');
    },
    searchLoginLog() {
      this.loginCurrentPage = 1;
      this.$message.success('查询完成，共找到 ' + this.filteredLoginLog.length + ' 条记录');
    },
    exportLoginLog() {
      this.$message.success('登录日志导出成功');
    },
    searchRiskAccount() {
      this.riskCurrentPage = 1;
      this.$message.success('查询完成，共找到 ' + this.filteredRiskAccount.length + ' 条记录');
    },
    viewRiskDetail(row) {
      this.currentRiskAccount = row;
      this.riskDetailVisible = true;
    },
    lockAccount(row) {
      this.$confirm('确定要锁定账号 ' + row.user + ' 吗？', '提示', { type: 'warning' }).then(() => {
        row.status = '锁定';
        this.$message.success('账号已锁定');
      }).catch(() => {});
    },
    unlockAccount(row) {
      this.$confirm('确定要解锁账号 ' + row.user + ' 吗？', '提示', { type: 'warning' }).then(() => {
        row.status = '正常';
        this.$message.success('账号已解锁');
      }).catch(() => {});
    }
  }
};
</script>

<style scoped>
.system-audit {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.search-bar {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  padding-top: 15px;
}

.risk-summary {
  margin-bottom: 20px;
}

.risk-card {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 15px;
}

.risk-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.risk-info {
  display: flex;
  flex-direction: column;
}

.risk-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.risk-label {
  font-size: 14px;
  color: #909399;
}
</style>