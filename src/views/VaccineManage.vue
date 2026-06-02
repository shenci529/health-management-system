<template>
  <div class="vaccine-manage">
    <!-- 疫苗到期提醒 -->
    <el-card class="section-card">
      <div slot="header" class="section-header">
        <span class="section-title">
          <i class="el-icon-alarm-clock"></i> 疫苗到期提醒
        </span>
        <el-badge :value="expiredVaccines.length" class="badge-item" type="danger"></el-badge>
      </div>
      
      <el-table :data="vaccineList" stripe style="width: 100%">
        <el-table-column prop="name" label="疫苗名称" width="180"></el-table-column>
        <el-table-column prop="dueDate" label="到期日期" width="120"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="getVaccineStatusType(scope.row.status)" size="small">
              {{ getVaccineStatusName(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="说明" show-overflow-tooltip></el-table-column>
        <el-table-column label="操作" width="150">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="handleVaccineDetail(scope.row)">详情</el-button>
            <el-button type="text" size="small" @click="handleVaccineRemind(scope.row)" v-if="scope.row.status !== 'completed'">提醒</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 体检预约登记 -->
    <el-card class="section-card">
      <div slot="header" class="section-header">
        <span class="section-title">
          <i class="el-icon-calendar"></i> 体检预约登记
        </span>
      </div>
      
      <el-form :model="appointmentForm" :rules="appointmentRules" ref="appointmentForm" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="孩子姓名" prop="childName">
              <el-input v-model="appointmentForm.childName" placeholder="请输入孩子姓名"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="体检类型" prop="examType">
              <el-select v-model="appointmentForm.examType" placeholder="请选择体检类型" style="width: 100%;">
                <el-option label="常规体检" value="routine"></el-option>
                <el-option label="入学体检" value="entrance"></el-option>
                <el-option label="专项体检" value="special"></el-option>
                <el-option label="视力检查" value="vision"></el-option>
                <el-option label="口腔检查" value="oral"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="预约日期" prop="appointmentDate">
              <el-date-picker
                v-model="appointmentForm.appointmentDate"
                type="date"
                placeholder="选择日期"
                value-format="yyyy-MM-dd"
                style="width: 100%;">
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="体检机构" prop="institution">
              <el-select v-model="appointmentForm.institution" placeholder="请选择体检机构" style="width: 100%;">
                <el-option label="市儿童医院" value="children_hospital"></el-option>
                <el-option label="区妇幼保健院" value="maternity_hospital"></el-option>
                <el-option label="社区卫生服务中心" value="community_center"></el-option>
                <el-option label="学校医务室" value="school_clinic"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="appointmentForm.phone" placeholder="请输入联系电话"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="备注说明" prop="notes">
              <el-input v-model="appointmentForm.notes" placeholder="请输入备注"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item>
          <el-button type="primary" @click="submitAppointment">
            <i class="el-icon-check"></i> 提交预约
          </el-button>
          <el-button @click="resetAppointmentForm">
            <i class="el-icon-refresh"></i> 重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 校园体检通知 -->
    <el-card class="section-card">
      <div slot="header" class="section-header">
        <span class="section-title">
          <i class="el-icon-bell"></i> 校园体检通知
        </span>
      </div>
      
      <div class="notice-list">
        <el-empty v-if="schoolNotices.length === 0" description="暂无校园体检通知" :image-size="80"></el-empty>
        <div v-for="(item, index) in schoolNotices" :key="index" class="notice-item">
          <div class="notice-icon">
            <i class="el-icon-document-checked"></i>
          </div>
          <div class="notice-content">
            <div class="notice-title">{{ item.title }}</div>
            <div class="notice-info">
              <span class="notice-date">{{ item.date }}</span>
              <el-tag size="small" :type="item.isRead ? 'info' : 'danger'">{{ item.isRead ? '已读' : '未读' }}</el-tag>
            </div>
            <div class="notice-desc">{{ item.content }}</div>
          </div>
          <el-button type="text" size="small" @click="handleNoticeDetail(item)">查看详情</el-button>
        </div>
      </div>
    </el-card>

    <!-- 体检报告线上归档 -->
    <el-card class="section-card">
      <div slot="header" class="section-header">
        <span class="section-title">
          <i class="el-icon-folder-opened"></i> 体检报告归档
        </span>
        <el-button type="primary" size="small" @click="handleUploadReport">
          <i class="el-icon-upload2"></i> 上传报告
        </el-button>
      </div>
      
      <el-table :data="reportList" stripe style="width: 100%">
        <el-table-column prop="examType" label="体检类型" width="120">
          <template slot-scope="scope">
            {{ getExamTypeName(scope.row.examType) }}
          </template>
        </el-table-column>
        <el-table-column prop="examDate" label="体检日期" width="120"></el-table-column>
        <el-table-column prop="institution" label="体检机构" width="150">
          <template slot-scope="scope">
            {{ getInstitutionName(scope.row.institution) }}
          </template>
        </el-table-column>
        <el-table-column prop="result" label="体检结果" width="100">
          <template slot-scope="scope">
            <el-tag :type="getResultType(scope.row.result)" size="small">
              {{ scope.row.result }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="uploadDate" label="上传日期" width="120"></el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="handleViewReport(scope.row)">查看</el-button>
            <el-button type="text" size="small" @click="handleDownloadReport(scope.row)">下载</el-button>
            <el-button type="text" size="small" @click="handleDeleteReport(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 我的预约记录 -->
    <el-card class="section-card">
      <div slot="header" class="section-header">
        <span class="section-title">
          <i class="el-icon-tickets"></i> 我的预约记录
        </span>
      </div>
      
      <el-table :data="myAppointments" stripe style="width: 100%">
        <el-table-column prop="childName" label="孩子姓名" width="120"></el-table-column>
        <el-table-column prop="examType" label="体检类型" width="120">
          <template slot-scope="scope">
            {{ getExamTypeName(scope.row.examType) }}
          </template>
        </el-table-column>
        <el-table-column prop="appointmentDate" label="预约日期" width="120"></el-table-column>
        <el-table-column prop="institution" label="体检机构" width="150">
          <template slot-scope="scope">
            {{ getInstitutionName(scope.row.institution) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="预约状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="getAppointmentStatusType(scope.row.status)" size="small">
              {{ getAppointmentStatusName(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="handleEditAppointment(scope.row)" v-if="scope.row.status === 'pending'">修改</el-button>
            <el-button type="text" size="small" @click="handleCancelAppointment(scope.row)" v-if="scope.row.status === 'pending'">取消</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 疫苗详情对话框 -->
    <el-dialog title="疫苗详情" :visible.sync="vaccineDialogVisible" width="500px">
      <div v-if="currentVaccine" class="vaccine-detail">
        <div class="detail-item">
          <span class="detail-label">疫苗名称：</span>
          <span>{{ currentVaccine.name }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">接种周期：</span>
          <span>{{ currentVaccine.cycle }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">到期日期：</span>
          <span>{{ currentVaccine.dueDate }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">接种说明：</span>
          <p>{{ currentVaccine.description }}</p>
        </div>
        <div class="detail-item">
          <span class="detail-label">注意事项：</span>
          <p>{{ currentVaccine.precautions }}</p>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="vaccineDialogVisible = false">关闭</el-button>
      </span>
    </el-dialog>

    <!-- 通知详情对话框 -->
    <el-dialog title="通知详情" :visible.sync="noticeDialogVisible" width="500px">
      <div v-if="currentNotice" class="notice-detail">
        <div class="detail-item">
          <span class="detail-label">通知标题：</span>
          <span>{{ currentNotice.title }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">发布日期：</span>
          <span>{{ currentNotice.date }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">通知内容：</span>
          <p>{{ currentNotice.content }}</p>
        </div>
        <div class="detail-item">
          <span class="detail-label">体检时间：</span>
          <span>{{ currentNotice.examTime }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">体检地点：</span>
          <span>{{ currentNotice.examLocation }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">注意事项：</span>
          <p>{{ currentNotice.examNotes }}</p>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="noticeDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleConfirmNotice">确认参加</el-button>
      </span>
    </el-dialog>

    <!-- 上传报告对话框 -->
    <el-dialog title="上传体检报告" :visible.sync="uploadDialogVisible" width="500px">
      <el-form :model="uploadForm" :rules="uploadRules" ref="uploadForm" label-width="100px">
        <el-form-item label="体检类型" prop="examType">
          <el-select v-model="uploadForm.examType" placeholder="请选择体检类型" style="width: 100%;">
            <el-option label="常规体检" value="routine"></el-option>
            <el-option label="入学体检" value="entrance"></el-option>
            <el-option label="专项体检" value="special"></el-option>
            <el-option label="视力检查" value="vision"></el-option>
            <el-option label="口腔检查" value="oral"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="体检日期" prop="examDate">
          <el-date-picker
            v-model="uploadForm.examDate"
            type="date"
            placeholder="选择日期"
            value-format="yyyy-MM-dd"
            style="width: 100%;">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="体检机构" prop="institution">
          <el-select v-model="uploadForm.institution" placeholder="请选择体检机构" style="width: 100%;">
            <el-option label="市儿童医院" value="children_hospital"></el-option>
            <el-option label="区妇幼保健院" value="maternity_hospital"></el-option>
            <el-option label="社区卫生服务中心" value="community_center"></el-option>
            <el-option label="学校医务室" value="school_clinic"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="体检结果" prop="result">
          <el-select v-model="uploadForm.result" placeholder="请选择体检结果" style="width: 100%;">
            <el-option label="正常" value="正常"></el-option>
            <el-option label="需关注" value="需关注"></el-option>
            <el-option label="需复查" value="需复查"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="上传文件" prop="file">
          <el-upload
            class="upload-demo"
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :limit="1"
            accept=".pdf,.jpg,.png,.doc,.docx">
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">支持PDF、图片、Word文档格式</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="uploadDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitUpload">确认上传</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'VaccineManage',
  data() {
    return {
      // 疫苗列表
      vaccineList: [
        { name: '乙肝疫苗（第3针）', dueDate: '2024-05-01', status: 'expiring', cycle: '0、1、6月接种', description: '乙肝疫苗第三针接种', precautions: '接种前需确认孩子无发热、感冒等症状' },
        { name: '脊灰疫苗（第4针）', dueDate: '2024-04-15', status: 'expired', cycle: '2、3、4月龄及4周岁', description: '脊髓灰质炎疫苗第四针接种', precautions: '接种后观察30分钟，注意是否有不良反应' },
        { name: '百白破疫苗（第4针）', dueDate: '2024-06-15', status: 'normal', cycle: '3、4、5月龄及18-24月龄', description: '百白破疫苗第四针接种', precautions: '接种部位可能出现红肿，属正常反应' },
        { name: '麻腮风疫苗', dueDate: '2024-07-01', status: 'normal', cycle: '18月龄', description: '麻疹、腮腺炎、风疹联合疫苗', precautions: '接种后一周内可能出现轻微发热' },
        { name: '甲肝减毒活疫苗', dueDate: '2024-04-10', status: 'completed', cycle: '18月龄', description: '甲型肝炎减毒活疫苗', precautions: '已完成接种' }
      ],
      expiredVaccines: [],
      vaccineDialogVisible: false,
      currentVaccine: null,
      // 体检预约表单
      appointmentForm: {
        childName: '',
        examType: '',
        appointmentDate: '',
        institution: '',
        phone: '',
        notes: ''
      },
      appointmentRules: {
        childName: [{ required: true, message: '请输入孩子姓名', trigger: 'blur' }],
        examType: [{ required: true, message: '请选择体检类型', trigger: 'change' }],
        appointmentDate: [{ required: true, message: '请选择预约日期', trigger: 'change' }],
        institution: [{ required: true, message: '请选择体检机构', trigger: 'change' }],
        phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }, { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }]
      },
      // 校园体检通知
      schoolNotices: [
        {
          title: '2024年春季学期全校体检通知',
          date: '2024-04-15',
          content: '学校将于下周组织全校学生进行常规体检，请家长注意查看体检结果。',
          examTime: '2024-04-22 上午8:00-11:30',
          examLocation: '学校医务室',
          examNotes: '体检前一天请保证充足睡眠，体检当天空腹，携带学生证。',
          isRead: false
        },
        {
          title: '视力专项检查通知',
          date: '2024-04-10',
          content: '针对近期学生视力下降情况，学校将组织视力专项检查。',
          examTime: '2024-04-18 下午14:00-16:00',
          examLocation: '学校多功能厅',
          examNotes: '检查前请避免长时间使用电子设备，保持眼部休息。',
          isRead: true
        }
      ],
      noticeDialogVisible: false,
      currentNotice: null,
      // 体检报告列表
      reportList: [
        { examType: 'routine', examDate: '2024-03-15', institution: 'children_hospital', result: '正常', uploadDate: '2024-03-20', fileName: '体检报告_20240315.pdf' },
        { examType: 'vision', examDate: '2024-02-20', institution: 'school_clinic', result: '需关注', uploadDate: '2024-02-25', fileName: '视力检查报告.pdf' },
        { examType: 'entrance', examDate: '2023-09-01', institution: 'maternity_hospital', result: '正常', uploadDate: '2023-09-05', fileName: '入学体检报告.pdf' }
      ],
      // 我的预约记录
      myAppointments: [
        { childName: '张小明', examType: 'routine', appointmentDate: '2024-05-10', institution: 'children_hospital', status: 'pending' },
        { childName: '张小明', examType: 'oral', appointmentDate: '2024-04-05', institution: 'community_center', status: 'completed' }
      ],
      // 上传报告对话框
      uploadDialogVisible: false,
      uploadForm: {
        examType: '',
        examDate: '',
        institution: '',
        result: '',
        file: null
      },
      uploadRules: {
        examType: [{ required: true, message: '请选择体检类型', trigger: 'change' }],
        examDate: [{ required: true, message: '请选择体检日期', trigger: 'change' }],
        institution: [{ required: true, message: '请选择体检机构', trigger: 'change' }],
        result: [{ required: true, message: '请选择体检结果', trigger: 'change' }]
      }
    };
  },
  created() {
    this.expiredVaccines = this.vaccineList.filter(v => v.status === 'expired' || v.status === 'expiring');
  },
  methods: {
    // 获取疫苗状态类型
    getVaccineStatusType(status) {
      const types = {
        expired: 'danger',
        expiring: 'warning',
        normal: 'success',
        completed: 'info'
      };
      return types[status] || '';
    },
    // 获取疫苗状态名称
    getVaccineStatusName(status) {
      const names = {
        expired: '已过期',
        expiring: '即将到期',
        normal: '待接种',
        completed: '已完成'
      };
      return names[status] || '';
    },
    // 查看疫苗详情
    handleVaccineDetail(row) {
      this.currentVaccine = row;
      this.vaccineDialogVisible = true;
    },
    // 提醒接种
    handleVaccineRemind(row) {
      this.$message.success('已设置接种提醒，将在到期前3天通知您');
    },
    // 提交预约
    submitAppointment() {
      this.$refs.appointmentForm.validate((valid) => {
        if (valid) {
          const newAppointment = {
            childName: this.appointmentForm.childName,
            examType: this.appointmentForm.examType,
            appointmentDate: this.appointmentForm.appointmentDate,
            institution: this.appointmentForm.institution,
            status: 'pending'
          };
          this.myAppointments.unshift(newAppointment);
          this.$message.success('体检预约提交成功');
          this.resetAppointmentForm();
        }
      });
    },
    // 重置预约表单
    resetAppointmentForm() {
      this.$refs.appointmentForm.resetFields();
    },
    // 查看通知详情
    handleNoticeDetail(item) {
      this.currentNotice = item;
      this.noticeDialogVisible = true;
    },
    // 确认参加体检
    handleConfirmNotice() {
      if (this.currentNotice) {
        this.currentNotice.isRead = true;
        this.$message.success('已确认参加校园体检');
        this.noticeDialogVisible = false;
      }
    },
    // 获取体检类型名称
    getExamTypeName(type) {
      const names = {
        routine: '常规体检',
        entrance: '入学体检',
        special: '专项体检',
        vision: '视力检查',
        oral: '口腔检查'
      };
      return names[type] || type;
    },
    // 获取机构名称
    getInstitutionName(type) {
      const names = {
        children_hospital: '市儿童医院',
        maternity_hospital: '区妇幼保健院',
        community_center: '社区卫生服务中心',
        school_clinic: '学校医务室'
      };
      return names[type] || type;
    },
    // 获取结果类型
    getResultType(result) {
      const types = {
        '正常': 'success',
        '需关注': 'warning',
        '需复查': 'danger'
      };
      return types[result] || '';
    },
    // 获取预约状态类型
    getAppointmentStatusType(status) {
      const types = {
        pending: 'warning',
        confirmed: 'success',
        completed: 'info',
        cancelled: 'danger'
      };
      return types[status] || '';
    },
    // 获取预约状态名称
    getAppointmentStatusName(status) {
      const names = {
        pending: '待确认',
        confirmed: '已确认',
        completed: '已完成',
        cancelled: '已取消'
      };
      return names[status] || '';
    },
    // 上传报告
    handleUploadReport() {
      this.uploadForm = { examType: '', examDate: '', institution: '', result: '', file: null };
      this.uploadDialogVisible = true;
    },
    // 文件变化
    handleFileChange(file) {
      this.uploadForm.file = file;
    },
    // 提交上传
    submitUpload() {
      this.$refs.uploadForm.validate((valid) => {
        if (valid) {
          const newReport = {
            examType: this.uploadForm.examType,
            examDate: this.uploadForm.examDate,
            institution: this.uploadForm.institution,
            result: this.uploadForm.result,
            uploadDate: new Date().toISOString().split('T')[0],
            fileName: this.uploadForm.file ? this.uploadForm.file.name : '体检报告.pdf'
          };
          this.reportList.unshift(newReport);
          this.$message.success('体检报告上传成功');
          this.uploadDialogVisible = false;
        }
      });
    },
    // 查看报告
    handleViewReport(row) {
      this.$message.info('正在打开报告：' + row.fileName);
    },
    // 下载报告
    handleDownloadReport(row) {
      this.$message.success('报告下载成功：' + row.fileName);
    },
    // 删除报告
    handleDeleteReport(row) {
      this.$confirm('确定要删除这份体检报告吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = this.reportList.findIndex(r => r.examDate === row.examDate);
        if (index > -1) {
          this.reportList.splice(index, 1);
          this.$message.success('报告删除成功');
        }
      }).catch(() => {
        this.$message.info('取消删除');
      });
    },
    // 编辑预约
    handleEditAppointment(row) {
      this.appointmentForm = {
        childName: row.childName,
        examType: row.examType,
        appointmentDate: row.appointmentDate,
        institution: row.institution,
        phone: '',
        notes: ''
      };
      this.$message.info('已加载预约信息，可修改后重新提交');
    },
    // 取消预约
    handleCancelAppointment(row) {
      this.$confirm('确定要取消这个体检预约吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        row.status = 'cancelled';
        this.$message.success('预约已取消');
      }).catch(() => {
        this.$message.info('取消操作');
      });
    }
  }
};
</script>

<style scoped>
.vaccine-manage {
  padding: 20px;
}

.section-card {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.section-title i {
  margin-right: 8px;
  color: #409EFF;
}

/* 通知列表样式 */
.notice-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notice-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background: #fafafa;
  border-radius: 8px;
  border-left: 4px solid #409EFF;
}

.notice-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #ecf5ff;
  color: #409EFF;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.notice-icon i {
  font-size: 24px;
}

.notice-content {
  flex: 1;
}

.notice-title {
  font-size: 15px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.notice-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
}

.notice-date {
  font-size: 12px;
  color: #909399;
}

.notice-desc {
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
}

/* 详情样式 */
.vaccine-detail, .notice-detail {
  padding: 10px;
}

.detail-item {
  margin-bottom: 15px;
}

.detail-label {
  font-weight: bold;
  color: #606266;
  display: block;
  margin-bottom: 5px;
}

.detail-item p {
  margin: 5px 0 0 0;
  color: #303133;
  line-height: 1.6;
}

/* 上传样式 */
.upload-demo {
  width: 100%;
}

.el-upload__tip {
  font-size: 12px;
  color: #909399;
  margin-top: 7px;
}
</style>