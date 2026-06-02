<template>
  <div class="system-config">
    <el-tabs v-model="activeTab" type="card">
      <!-- 平台参数配置 -->
      <el-tab-pane label="平台参数" name="platform">
        <div class="config-section">
          <el-form :model="platformConfig" label-width="150px" style="max-width: 800px;">
            <el-form-item label="平台名称">
              <el-input v-model="platformConfig.name" placeholder="请输入平台名称"></el-input>
            </el-form-item>
            <el-form-item label="平台Logo">
              <el-upload action="#" :auto-upload="false" :show-file-list="false" accept="image/*">
                <el-button size="small" type="primary">上传Logo</el-button>
                <span slot="tip" class="el-upload__tip" style="margin-left: 10px;">建议尺寸 200x60</span>
              </el-upload>
            </el-form-item>
            <el-form-item label="学校名称">
              <el-input v-model="platformConfig.schoolName" placeholder="请输入学校名称"></el-input>
            </el-form-item>
            <el-form-item label="学校地址">
              <el-input v-model="platformConfig.schoolAddress" placeholder="请输入学校地址"></el-input>
            </el-form-item>
            <el-form-item label="联系电话">
              <el-input v-model="platformConfig.contactPhone" placeholder="请输入联系电话"></el-input>
            </el-form-item>
            <el-form-item label="联系邮箱">
              <el-input v-model="platformConfig.contactEmail" placeholder="请输入联系邮箱"></el-input>
            </el-form-item>
            <el-form-item label="学期设置">
              <el-date-picker v-model="platformConfig.semesterStart" type="date" placeholder="学期开始日期" style="width: 200px;"></el-date-picker>
              <el-date-picker v-model="platformConfig.semesterEnd" type="date" placeholder="学期结束日期" style="width: 200px; margin-left: 20px;"></el-date-picker>
            </el-form-item>
            <el-form-item label="数据保留期限">
              <el-select v-model="platformConfig.dataRetention" style="width: 200px;">
                <el-option label="1年" value="1"></el-option>
                <el-option label="3年" value="3"></el-option>
                <el-option label="5年" value="5"></el-option>
                <el-option label="永久" value="permanent"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="启用健康预警">
              <el-switch v-model="platformConfig.enableWarning"></el-switch>
            </el-form-item>
            <el-form-item label="启用消息推送">
              <el-switch v-model="platformConfig.enablePush"></el-switch>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="savePlatformConfig">保存配置</el-button>
              <el-button @click="resetPlatformConfig">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>

      <!-- 业务字典配置 -->
      <el-tab-pane label="业务字典" name="dictionary">
        <div class="dictionary-section">
          <div class="dictionary-header">
            <el-button type="primary" icon="el-icon-plus" @click="addDictionary">新增字典</el-button>
          </div>
          <el-table :data="dictionaryList" border style="width: 100%">
            <el-table-column type="index" label="序号" width="60"></el-table-column>
            <el-table-column prop="type" label="字典类型" width="150"></el-table-column>
            <el-table-column prop="code" label="字典编码" width="120"></el-table-column>
            <el-table-column prop="name" label="字典名称" width="150"></el-table-column>
            <el-table-column prop="value" label="字典值" width="120"></el-table-column>
            <el-table-column prop="sort" label="排序" width="80"></el-table-column>
            <el-table-column prop="status" label="状态" width="80">
              <template slot-scope="scope">
                <el-tag size="small" :type="scope.row.status === '启用' ? 'success' : 'info'">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" show-overflow-tooltip></el-table-column>
            <el-table-column label="操作" width="150">
              <template slot-scope="scope">
                <el-button type="text" size="small" @click="editDictionary(scope.row)">编辑</el-button>
                <el-button type="text" size="small" @click="toggleDictionaryStatus(scope.row)">{{ scope.row.status === '启用' ? '禁用' : '启用' }}</el-button>
                <el-button type="text" size="small" style="color: #f56c6c;" @click="deleteDictionary(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- 打卡规则配置 -->
      <el-tab-pane label="打卡规则" name="checkin">
        <div class="checkin-section">
          <el-form :model="checkinConfig" label-width="150px" style="max-width: 800px;">
            <el-form-item label="每日打卡时间">
              <el-time-picker v-model="checkinConfig.morningStart" placeholder="上午开始" style="width: 120px;"></el-time-picker>
              <span style="margin: 0 10px;">至</span>
              <el-time-picker v-model="checkinConfig.morningEnd" placeholder="上午结束" style="width: 120px;"></el-time-picker>
              <span style="margin: 0 20px;">下午</span>
              <el-time-picker v-model="checkinConfig.afternoonStart" placeholder="下午开始" style="width: 120px;"></el-time-picker>
              <span style="margin: 0 10px;">至</span>
              <el-time-picker v-model="checkinConfig.afternoonEnd" placeholder="下午结束" style="width: 120px;"></el-time-picker>
            </el-form-item>
            <el-form-item label="打卡方式">
              <el-checkbox-group v-model="checkinConfig.methods">
                <el-checkbox label="app">APP打卡</el-checkbox>
                <el-checkbox label="face">人脸识别</el-checkbox>
                <el-checkbox label="card">刷卡打卡</el-checkbox>
                <el-checkbox label="manual">手动记录</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="打卡提醒时间">
              <el-time-picker v-model="checkinConfig.remindTime" placeholder="选择提醒时间" style="width: 120px;"></el-time-picker>
              <el-checkbox v-model="checkinConfig.enableRemind" style="margin-left: 20px;">启用提醒</el-checkbox>
            </el-form-item>
            <el-form-item label="迟到判定时间">
              <el-input-number v-model="checkinConfig.lateMinutes" :min="1" :max="30" style="width: 120px;"></el-input-number>
              <span style="margin-left: 10px;">分钟后视为迟到</span>
            </el-form-item>
            <el-form-item label="缺勤判定时间">
              <el-input-number v-model="checkinConfig.absentMinutes" :min="30" :max="120" style="width: 120px;"></el-input-number>
              <span style="margin-left: 10px;">分钟后视为缺勤</span>
            </el-form-item>
            <el-form-item label="打卡范围限制">
              <el-switch v-model="checkinConfig.enableLocation"></el-switch>
              <span style="margin-left: 10px;">启用GPS定位打卡</span>
              <div v-if="checkinConfig.enableLocation" style="margin-top: 10px;">
                <el-input v-model="checkinConfig.location" placeholder="学校GPS坐标" style="width: 300px;"></el-input>
                <el-input-number v-model="checkinConfig.locationRange" :min="50" :max="500" style="width: 120px; margin-left: 10px;"></el-input-number>
                <span style="margin-left: 10px;">米范围内有效</span>
              </div>
            </el-form-item>
            <el-form-item label="健康打卡项目">
              <el-checkbox-group v-model="checkinConfig.healthItems">
                <el-checkbox label="temperature">体温</el-checkbox>
                <el-checkbox label="symptom">症状自查</el-checkbox>
                <el-checkbox label="mood">心情状态</el-checkbox>
                <el-checkbox label="sleep">睡眠情况</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveCheckinConfig">保存配置</el-button>
              <el-button @click="resetCheckinConfig">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>

      <!-- 数据备份管理 -->
      <el-tab-pane label="数据备份" name="backup">
        <div class="backup-section">
          <div class="backup-header">
            <el-button type="primary" icon="el-icon-download" @click="createBackup">创建备份</el-button>
            <el-button type="warning" icon="el-icon-upload2" @click="restoreBackup">恢复数据</el-button>
          </div>
          <div class="backup-config">
            <el-form :model="backupConfig" label-width="150px" style="max-width: 600px;">
              <el-form-item label="自动备份">
                <el-switch v-model="backupConfig.autoBackup"></el-switch>
              </el-form-item>
              <el-form-item label="备份频率" v-if="backupConfig.autoBackup">
                <el-select v-model="backupConfig.frequency" style="width: 200px;">
                  <el-option label="每日" value="daily"></el-option>
                  <el-option label="每周" value="weekly"></el-option>
                  <el-option label="每月" value="monthly"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="备份时间" v-if="backupConfig.autoBackup">
                <el-time-picker v-model="backupConfig.backupTime" placeholder="选择备份时间" style="width: 200px;"></el-time-picker>
              </el-form-item>
              <el-form-item label="保留备份数">
                <el-input-number v-model="backupConfig.keepCount" :min="1" :max="10" style="width: 120px;"></el-input-number>
                <span style="margin-left: 10px;">份</span>
              </el-form-item>
              <el-form-item label="备份存储位置">
                <el-select v-model="backupConfig.storage" style="width: 200px;">
                  <el-option label="本地服务器" value="local"></el-option>
                  <el-option label="云存储" value="cloud"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveBackupConfig">保存设置</el-button>
              </el-form-item>
            </el-form>
          </div>
          <div class="backup-list">
            <h4>备份记录</h4>
            <el-table :data="backupList" border style="width: 100%">
              <el-table-column type="index" label="序号" width="60"></el-table-column>
              <el-table-column prop="name" label="备份名称" width="200"></el-table-column>
              <el-table-column prop="size" label="备份大小" width="100"></el-table-column>
              <el-table-column prop="type" label="备份类型" width="100">
                <template slot-scope="scope">
                  <el-tag size="small" :type="scope.row.type === '自动' ? 'primary' : 'success'">{{ scope.row.type }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="createTime" label="创建时间" width="160"></el-table-column>
              <el-table-column prop="status" label="状态" width="80">
                <template slot-scope="scope">
                  <el-tag size="small" :type="scope.row.status === '完整' ? 'success' : 'warning'">{{ scope.row.status }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150">
                <template slot-scope="scope">
                  <el-button type="text" size="small" @click="downloadBackup(scope.row)">下载</el-button>
                  <el-button type="text" size="small" @click="restoreFromBackup(scope.row)">恢复</el-button>
                  <el-button type="text" size="small" style="color: #f56c6c;" @click="deleteBackup(scope.row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </el-tab-pane>

      <!-- 系统监控 -->
      <el-tab-pane label="系统监控" name="monitor">
        <div class="monitor-section">
          <div class="monitor-summary">
            <el-row :gutter="20">
              <el-col :span="4">
                <div class="monitor-card" style="border-left: 4px solid #67c23a;">
                  <span class="monitor-value">{{ systemMonitor.cpu }}%</span>
                  <span class="monitor-label">CPU使用率</span>
                  <div class="monitor-bar">
                    <div class="bar-fill" :style="{ width: systemMonitor.cpu + '%', background: systemMonitor.cpu > 80 ? '#f56c6c' : '#67c23a' }"></div>
                  </div>
                </div>
              </el-col>
              <el-col :span="4">
                <div class="monitor-card" style="border-left: 4px solid #409eff;">
                  <span class="monitor-value">{{ systemMonitor.memory }}%</span>
                  <span class="monitor-label">内存使用率</span>
                  <div class="monitor-bar">
                    <div class="bar-fill" :style="{ width: systemMonitor.memory + '%', background: systemMonitor.memory > 80 ? '#f56c6c' : '#409eff' }"></div>
                  </div>
                </div>
              </el-col>
              <el-col :span="4">
                <div class="monitor-card" style="border-left: 4px solid #e6a23c;">
                  <span class="monitor-value">{{ systemMonitor.disk }}%</span>
                  <span class="monitor-label">磁盘使用率</span>
                  <div class="monitor-bar">
                    <div class="bar-fill" :style="{ width: systemMonitor.disk + '%', background: systemMonitor.disk > 80 ? '#f56c6c' : '#e6a23c' }"></div>
                  </div>
                </div>
              </el-col>
              <el-col :span="4">
                <div class="monitor-card" style="border-left: 4px solid #909399;">
                  <span class="monitor-value">{{ systemMonitor.onlineUsers }}</span>
                  <span class="monitor-label">在线用户数</span>
                </div>
              </el-col>
              <el-col :span="4">
                <div class="monitor-card" style="border-left: 4px solid #00bcd4;">
                  <span class="monitor-value">{{ systemMonitor.requests }}</span>
                  <span class="monitor-label">今日请求量</span>
                </div>
              </el-col>
              <el-col :span="4">
                <div class="monitor-card" style="border-left: 4px solid #f56c6c;">
                  <span class="monitor-value">{{ systemMonitor.errors }}</span>
                  <span class="monitor-label">今日错误数</span>
                </div>
              </el-col>
            </el-row>
          </div>

          <div class="monitor-details">
            <el-row :gutter="20">
              <el-col :span="6">
                <div class="detail-card">
                  <h4>系统信息</h4>
                  <el-descriptions :column="1" border size="small">
                    <el-descriptions-item label="操作系统">Windows Server 2022</el-descriptions-item>
                    <el-descriptions-item label="系统版本">v2.5.1</el-descriptions-item>
                    <el-descriptions-item label="运行时间">365天</el-descriptions-item>
                    <el-descriptions-item label="数据库版本">MySQL 8.0</el-descriptions-item>
                  </el-descriptions>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="detail-card">
                  <h4>服务状态</h4>
                  <div class="service-list">
                    <div class="service-item">
                      <span class="service-name">Web服务</span>
                      <el-tag size="small" type="success">运行中</el-tag>
                    </div>
                    <div class="service-item">
                      <span class="service-name">数据库服务</span>
                      <el-tag size="small" type="success">运行中</el-tag>
                    </div>
                    <div class="service-item">
                      <span class="service-name">缓存服务</span>
                      <el-tag size="small" type="success">运行中</el-tag>
                    </div>
                    <div class="service-item">
                      <span class="service-name">消息服务</span>
                      <el-tag size="small" type="warning">部分异常</el-tag>
                    </div>
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="detail-card">
                  <h4>最近系统日志</h4>
                  <div class="log-list">
                    <div class="log-item" v-for="(log, index) in systemLogs" :key="index" :class="log.level">
                      <span class="log-time">[{{ log.time }}]</span>
                      <span class="log-level">{{ log.level }}</span>
                      <span class="log-content">{{ log.content }}</span>
                    </div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>

          <div class="monitor-actions">
            <el-button type="primary" icon="el-icon-refresh" @click="refreshMonitor">刷新监控数据</el-button>
            <el-button type="warning" icon="el-icon-document" @click="viewFullLogs">查看完整日志</el-button>
            <el-button type="danger" icon="el-icon-warning" @click="clearCache">清理缓存</el-button>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 字典编辑对话框 -->
    <el-dialog :title="dictionaryDialogTitle" :visible.sync="dictionaryDialogVisible" width="500px">
      <el-form :model="dictionaryForm" :rules="dictionaryRules" ref="dictionaryForm" label-width="100px">
        <el-form-item label="字典类型" prop="type">
          <el-select v-model="dictionaryForm.type" placeholder="请选择字典类型" style="width: 100%;">
            <el-option label="健康分类" value="health_category"></el-option>
            <el-option label="疾病类型" value="disease_type"></el-option>
            <el-option label="体检项目" value="checkup_item"></el-option>
            <el-option label="通知类型" value="notice_type"></el-option>
            <el-option label="其他" value="other"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="字典编码" prop="code">
          <el-input v-model="dictionaryForm.code" placeholder="请输入字典编码"></el-input>
        </el-form-item>
        <el-form-item label="字典名称" prop="name">
          <el-input v-model="dictionaryForm.name" placeholder="请输入字典名称"></el-input>
        </el-form-item>
        <el-form-item label="字典值" prop="value">
          <el-input v-model="dictionaryForm.value" placeholder="请输入字典值"></el-input>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="dictionaryForm.sort" :min="1" :max="100" style="width: 100%;"></el-input-number>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="dictionaryForm.status">
            <el-radio label="启用">启用</el-radio>
            <el-radio label="禁用">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input type="textarea" v-model="dictionaryForm.remark" :rows="2" placeholder="请输入备注"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dictionaryDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitDictionary">确定</el-button>
      </span>
    </el-dialog>

    <!-- 恢复数据对话框 -->
    <el-dialog title="恢复数据" :visible.sync="restoreDialogVisible" width="400px">
      <div class="restore-warning">
        <i class="el-icon-warning" style="font-size: 40px; color: #e6a23c;"></i>
        <p>恢复数据将覆盖当前数据，请谨慎操作！</p>
        <p>建议先创建当前数据备份后再进行恢复。</p>
      </div>
      <el-upload action="#" :auto-upload="false" :limit="1" accept=".bak,.zip" style="margin-top: 20px;">
        <el-button type="primary">选择备份文件</el-button>
        <span slot="tip" class="el-upload__tip" style="margin-left: 10px;">支持 .bak 或 .zip 格式</span>
      </el-upload>
      <span slot="footer" class="dialog-footer">
        <el-button @click="restoreDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmRestore">确认恢复</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'SystemConfig',
  data() {
    return {
      activeTab: 'platform',
      platformConfig: {
        name: '幼儿中小学生健康管理系统',
        schoolName: '示例学校',
        schoolAddress: '北京市海淀区',
        contactPhone: '010-12345678',
        contactEmail: 'admin@school.edu.cn',
        semesterStart: null,
        semesterEnd: null,
        dataRetention: '5',
        enableWarning: true,
        enablePush: true
      },
      dictionaryList: [
        { id: 1, type: '健康分类', code: 'HC001', name: '视力健康', value: 'vision', sort: 1, status: '启用', remark: '视力相关健康问题' },
        { id: 2, type: '健康分类', code: 'HC002', name: '口腔健康', value: 'oral', sort: 2, status: '启用', remark: '口腔相关健康问题' },
        { id: 3, type: '疾病类型', code: 'DT001', name: '流感', value: 'flu', sort: 1, status: '启用', remark: '流行性感冒' },
        { id: 4, type: '疾病类型', code: 'DT002', name: '手足口病', value: 'hfmd', sort: 2, status: '启用', remark: '手足口病' },
        { id: 5, type: '体检项目', code: 'CI001', name: '身高测量', value: 'height', sort: 1, status: '启用', remark: '身高测量项目' },
        { id: 6, type: '体检项目', code: 'CI002', name: '体重测量', value: 'weight', sort: 2, status: '启用', remark: '体重测量项目' },
        { id: 7, type: '通知类型', code: 'NT001', name: '健康预警', value: 'warning', sort: 1, status: '启用', remark: '健康预警通知' },
        { id: 8, type: '通知类型', code: 'NT002', name: '体检通知', value: 'checkup', sort: 2, status: '禁用', remark: '体检通知' }
      ],
      dictionaryDialogVisible: false,
      dictionaryDialogTitle: '新增字典',
      isEditDictionary: false,
      editDictionaryItem: null,
      dictionaryForm: { type: '', code: '', name: '', value: '', sort: 1, status: '启用', remark: '' },
      dictionaryRules: {
        type: [{ required: true, message: '请选择字典类型', trigger: 'change' }],
        code: [{ required: true, message: '请输入字典编码', trigger: 'blur' }],
        name: [{ required: true, message: '请输入字典名称', trigger: 'blur' }],
        value: [{ required: true, message: '请输入字典值', trigger: 'blur' }]
      },
      checkinConfig: {
        morningStart: new Date(2024, 1, 1, 7, 30),
        morningEnd: new Date(2024, 1, 1, 8, 30),
        afternoonStart: new Date(2024, 1, 1, 13, 30),
        afternoonEnd: new Date(2024, 1, 1, 14, 30),
        methods: ['app', 'face'],
        remindTime: new Date(2024, 1, 1, 7, 0),
        enableRemind: true,
        lateMinutes: 15,
        absentMinutes: 60,
        enableLocation: true,
        location: '116.397428,39.90923',
        locationRange: 200,
        healthItems: ['temperature', 'symptom']
      },
      backupConfig: {
        autoBackup: true,
        frequency: 'daily',
        backupTime: new Date(2024, 1, 1, 2, 0),
        keepCount: 5,
        storage: 'local'
      },
      backupList: [
        { id: 1, name: 'backup_20240115_020000', size: '1.2GB', type: '自动', createTime: '2024-01-15 02:00', status: '完整' },
        { id: 2, name: 'backup_20240114_020000', size: '1.1GB', type: '自动', createTime: '2024-01-14 02:00', status: '完整' },
        { id: 3, name: 'backup_20240113_020000', size: '1.0GB', type: '自动', createTime: '2024-01-13 02:00', status: '完整' },
        { id: 4, name: 'backup_20240112_150000', size: '1.2GB', type: '手动', createTime: '2024-01-12 15:00', status: '完整' },
        { id: 5, name: 'backup_20240110_020000', size: '0.9GB', type: '自动', createTime: '2024-01-10 02:00', status: '完整' }
      ],
      restoreDialogVisible: false,
      systemMonitor: {
        cpu: 35,
        memory: 62,
        disk: 45,
        onlineUsers: 128,
        requests: 15680,
        errors: 5
      },
      systemLogs: [
        { time: '14:30:25', level: 'INFO', content: '用户 admin 登录系统' },
        { time: '14:25:18', level: 'INFO', content: '数据备份任务执行完成' },
        { time: '14:20:10', level: 'WARN', content: '消息服务响应延迟' },
        { time: '14:15:05', level: 'INFO', content: '体检数据导入完成，共450条' },
        { time: '14:10:33', level: 'ERROR', content: '数据库连接超时' },
        { time: '14:05:22', level: 'INFO', content: '系统健康检查完成' }
      ]
    };
  },
  methods: {
    savePlatformConfig() {
      this.$message.success('平台参数配置已保存');
    },
    resetPlatformConfig() {
      this.platformConfig = {
        name: '幼儿中小学生健康管理系统',
        schoolName: '示例学校',
        schoolAddress: '北京市海淀区',
        contactPhone: '010-12345678',
        contactEmail: 'admin@school.edu.cn',
        semesterStart: null,
        semesterEnd: null,
        dataRetention: '5',
        enableWarning: true,
        enablePush: true
      };
      this.$message.info('配置已重置');
    },
    addDictionary() {
      this.isEditDictionary = false;
      this.editDictionaryItem = null;
      this.dictionaryDialogTitle = '新增字典';
      this.dictionaryForm = { type: '', code: '', name: '', value: '', sort: 1, status: '启用', remark: '' };
      this.dictionaryDialogVisible = true;
    },
    editDictionary(row) {
      this.isEditDictionary = true;
      this.editDictionaryItem = row;
      this.dictionaryDialogTitle = '编辑字典';
      this.dictionaryForm = { type: row.type, code: row.code, name: row.name, value: row.value, sort: row.sort, status: row.status, remark: row.remark };
      this.dictionaryDialogVisible = true;
    },
    toggleDictionaryStatus(row) {
      row.status = row.status === '启用' ? '禁用' : '启用';
      this.$message.success('字典状态已更新');
    },
    deleteDictionary(row) {
      this.$confirm('确定删除该字典项吗？', '提示', { type: 'warning' }).then(() => {
        const index = this.dictionaryList.findIndex(d => d.id === row.id);
        if (index > -1) this.dictionaryList.splice(index, 1);
        this.$message.success('删除成功');
      }).catch(() => {});
    },
    submitDictionary() {
      this.$refs.dictionaryForm.validate((valid) => {
        if (valid) {
          if (this.isEditDictionary && this.editDictionaryItem) {
            Object.assign(this.editDictionaryItem, this.dictionaryForm);
            this.$message.success('字典更新成功');
          } else {
            this.dictionaryList.push({
              id: Date.now(),
              ...this.dictionaryForm
            });
            this.$message.success('字典创建成功');
          }
          this.dictionaryDialogVisible = false;
        }
      });
    },
    saveCheckinConfig() {
      this.$message.success('打卡规则配置已保存');
    },
    resetCheckinConfig() {
      this.checkinConfig = {
        morningStart: new Date(2024, 1, 1, 7, 30),
        morningEnd: new Date(2024, 1, 1, 8, 30),
        afternoonStart: new Date(2024, 1, 1, 13, 30),
        afternoonEnd: new Date(2024, 1, 1, 14, 30),
        methods: ['app', 'face'],
        remindTime: new Date(2024, 1, 1, 7, 0),
        enableRemind: true,
        lateMinutes: 15,
        absentMinutes: 60,
        enableLocation: true,
        location: '116.397428,39.90923',
        locationRange: 200,
        healthItems: ['temperature', 'symptom']
      };
      this.$message.info('配置已重置');
    },
    createBackup() {
      this.$message.success('正在创建数据备份...');
    },
    restoreBackup() {
      this.restoreDialogVisible = true;
    },
    confirmRestore() {
      this.$confirm('确定要恢复数据吗？当前数据将被覆盖！', '警告', { type: 'warning' }).then(() => {
        this.$message.success('数据恢复成功');
        this.restoreDialogVisible = false;
      }).catch(() => {});
    },
    saveBackupConfig() {
      this.$message.success('备份配置已保存');
    },
    downloadBackup(row) {
      this.$message.success('正在下载备份：' + row.name);
    },
    restoreFromBackup(row) {
      this.$confirm('确定要从该备份恢复数据吗？', '提示', { type: 'warning' }).then(() => {
        this.$message.success('数据恢复成功');
      }).catch(() => {});
    },
    deleteBackup(row) {
      this.$confirm('确定删除该备份吗？', '提示', { type: 'warning' }).then(() => {
        const index = this.backupList.findIndex(b => b.id === row.id);
        if (index > -1) this.backupList.splice(index, 1);
        this.$message.success('删除成功');
      }).catch(() => {});
    },
    refreshMonitor() {
      this.systemMonitor.cpu = Math.floor(Math.random() * 50 + 20);
      this.systemMonitor.memory = Math.floor(Math.random() * 30 + 50);
      this.systemMonitor.disk = Math.floor(Math.random() * 20 + 40);
      this.systemMonitor.onlineUsers = Math.floor(Math.random() * 50 + 100);
      this.$message.success('监控数据已刷新');
    },
    viewFullLogs() {
      this.$message.success('正在加载完整日志...');
    },
    clearCache() {
      this.$confirm('确定要清理系统缓存吗？', '提示', { type: 'warning' }).then(() => {
        this.$message.success('缓存清理完成');
      }).catch(() => {});
    }
  }
};
</script>

<style scoped>
.system-config {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.config-section, .dictionary-section, .checkin-section, .backup-section, .monitor-section {
  padding: 20px 0;
}

.dictionary-header, .backup-header {
  margin-bottom: 20px;
}

.backup-config {
  margin-bottom: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 6px;
}

.backup-list h4 {
  margin: 0 0 15px 0;
  font-size: 14px;
  color: #606266;
}

.monitor-summary {
  margin-bottom: 20px;
}

.monitor-card {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.monitor-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.monitor-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.monitor-bar {
  margin-top: 10px;
  height: 8px;
  background: #f0f2f5;
  border-radius: 4px;
  overflow: hidden;
}

.monitor-bar .bar-fill {
  height: 100%;
  border-radius: 4px;
}

.monitor-details {
  margin-top: 20px;
}

.detail-card {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.detail-card h4 {
  margin: 0 0 15px 0;
  font-size: 14px;
  color: #303133;
}

.service-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.service-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
}

.service-name {
  font-size: 14px;
  color: #606266;
}

.log-list {
  max-height: 200px;
  overflow-y: auto;
  font-family: monospace;
  font-size: 12px;
}

.log-item {
  padding: 8px 0;
  border-bottom: 1px dashed #ebeef5;
}

.log-item:last-child {
  border-bottom: none;
}

.log-time {
  color: #909399;
}

.log-level {
  margin-left: 10px;
  padding: 2px 6px;
  border-radius: 2px;
  font-size: 11px;
}

.log-item.INFO .log-level {
  background: #ecf5ff;
  color: #409eff;
}

.log-item.WARN .log-level {
  background: #fdf6ec;
  color: #e6a23c;
}

.log-item.ERROR .log-level {
  background: #fef0f0;
  color: #f56c6c;
}

.log-content {
  margin-left: 10px;
  color: #606266;
}

.monitor-actions {
  margin-top: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 6px;
  display: flex;
  gap: 15px;
}

.restore-warning {
  text-align: center;
  padding: 20px;
}

.restore-warning p {
  margin: 10px 0;
  color: #606266;
}
</style>