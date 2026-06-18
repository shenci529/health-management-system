<template>
  <div class="license-manage">
    <div class="page-header">
      <h2>授权码管理</h2>
      <el-button type="primary" @click="showGenerateDialog = true">
        <i class="el-icon-plus"></i> 生成授权码
      </el-button>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-value">{{ stats.total }}</div>
        <div class="stat-label">总授权数</div>
      </div>
      <div class="stat-card active">
        <div class="stat-value">{{ stats.active }}</div>
        <div class="stat-label">未激活</div>
      </div>
      <div class="stat-card used">
        <div class="stat-value">{{ stats.used }}</div>
        <div class="stat-label">已使用</div>
      </div>
      <div class="stat-card expired">
        <div class="stat-value">{{ stats.expired }}</div>
        <div class="stat-label">已过期</div>
      </div>
      <div class="stat-card revoked">
        <div class="stat-value">{{ stats.revoked }}</div>
        <div class="stat-label">已撤销</div>
      </div>
    </div>

    <div class="filter-bar">
      <el-select v-model="filterStatus" placeholder="状态筛选" clearable style="width: 150px">
        <el-option label="全部" value=""></el-option>
        <el-option label="未激活" value="active"></el-option>
        <el-option label="已使用" value="used"></el-option>
        <el-option label="已过期" value="expired"></el-option>
        <el-option label="已撤销" value="revoked"></el-option>
      </el-select>
      <el-input v-model="searchKeyword" placeholder="搜索客户名称/学校" clearable @keyup.enter="loadLicenses"></el-input>
      <el-button @click="loadLicenses">搜索</el-button>
    </div>

    <el-table :data="licenses" border stripe>
      <el-table-column prop="id" label="ID" width="60"></el-table-column>
      <el-table-column label="授权码" width="200">
        <template slot-scope="scope">
          <code class="license-code">{{ scope.row.formatted_code }}</code>
        </template>
      </el-table-column>
      <el-table-column prop="customer_name" label="客户名称"></el-table-column>
      <el-table-column prop="school_name" label="学校名称"></el-table-column>
      <el-table-column prop="customer_phone" label="联系电话"></el-table-column>
      <el-table-column label="二维码" width="100">
        <template slot-scope="scope">
          <el-image v-if="scope.row.qr_code" :src="scope.row.qr_code" :preview-src-list="[scope.row.qr_code]" fit="cover" style="width:60px;height:60px" />
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="valid_end" label="有效期至"></el-table-column>
      <el-table-column prop="max_users" label="最大用户数" width="100"></el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template slot-scope="scope">
          <el-tag :type="getStatusType(scope.row.status)">{{ getStatusText(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="180"></el-table-column>
      <el-table-column label="操作" width="200">
        <template slot-scope="scope">
          <el-button size="mini" @click="viewLicense(scope.row)">查看</el-button>
          <el-button size="mini" type="success" v-if="scope.row.status === 'active'" @click="activateLicense(scope.row)">激活</el-button>
          <el-button size="mini" type="danger" v-if="scope.row.status === 'active'" @click="revokeLicense(scope.row)">撤销</el-button>
          <el-button size="mini" type="danger" @click="deleteLicense(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog title="生成授权码" :visible.sync="showGenerateDialog" width="500px">
      <el-form :model="formData" label-width="100px">
        <el-form-item label="客户名称">
          <el-input v-model="formData.customer_name"></el-input>
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="formData.customer_phone"></el-input>
        </el-form-item>
        <el-form-item label="电子邮箱">
          <el-input v-model="formData.customer_email"></el-input>
        </el-form-item>
        <el-form-item label="学校名称">
          <el-input v-model="formData.school_name"></el-input>
        </el-form-item>
        <el-form-item label="有效天数">
          <el-input-number v-model="formData.valid_days" :min="1" :max="3650" style="width:100%"></el-input-number>
        </el-form-item>
        <el-form-item label="最大用户数">
          <el-input-number v-model="formData.max_users" :min="1" :max="10000" style="width:100%"></el-input-number>
        </el-form-item>
        <el-form-item label="备注">
          <el-input type="textarea" v-model="formData.notes"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="showGenerateDialog = false">取消</el-button>
        <el-button type="primary" @click="generateLicense" :loading="generating">生成</el-button>
      </div>
    </el-dialog>

    <el-dialog title="授权码详情" :visible.sync="showDetailDialog" width="600px">
      <div v-if="currentLicense" class="license-detail">
        <div class="detail-row">
          <span class="detail-label">授权码：</span>
          <code class="license-code-large">{{ currentLicense.formatted_code }}</code>
        </div>
        <div class="detail-row">
          <span class="detail-label">二维码：</span>
          <el-image v-if="currentLicense.qr_code" :src="currentLicense.qr_code" fit="cover" style="width:150px;height:150px" />
          <span v-else>-</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">客户名称：</span>
          <span>{{ currentLicense.customer_name || '-' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">联系电话：</span>
          <span>{{ currentLicense.customer_phone || '-' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">学校名称：</span>
          <span>{{ currentLicense.school_name || '-' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">有效期：</span>
          <span>{{ currentLicense.valid_start || '-' }} 至 {{ currentLicense.valid_end || '永久' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">最大用户数：</span>
          <span>{{ currentLicense.max_users || 100 }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">状态：</span>
          <el-tag :type="getStatusType(currentLicense.status)">{{ getStatusText(currentLicense.status) }}</el-tag>
        </div>
        <div class="detail-row">
          <span class="detail-label">激活时间：</span>
          <span>{{ currentLicense.activated_at || '-' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">激活人：</span>
          <span>{{ currentLicense.activated_by || '-' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">备注：</span>
          <span>{{ currentLicense.notes || '-' }}</span>
        </div>
      </div>
      <div slot="footer">
        <el-button @click="showDetailDialog = false">关闭</el-button>
      </div>
    </el-dialog>

    <el-dialog title="激活授权码" :visible.sync="showActivateDialog" width="400px">
      <el-form :model="activateForm" label-width="80px">
        <el-form-item label="授权码">
          <el-input v-model="activateForm.code" placeholder="请输入授权码"></el-input>
        </el-form-item>
        <el-form-item label="激活人">
          <el-input v-model="activateForm.activated_by" placeholder="请输入激活人姓名"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="showActivateDialog = false">取消</el-button>
        <el-button type="primary" @click="doActivate" :loading="activating">确认激活</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'LicenseManage',
  data() {
    return {
      licenses: [],
      stats: { total: 0, active: 0, used: 0, expired: 0, revoked: 0 },
      filterStatus: '',
      searchKeyword: '',
      showGenerateDialog: false,
      showDetailDialog: false,
      showActivateDialog: false,
      currentLicense: null,
      generating: false,
      activating: false,
      formData: {
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        school_name: '',
        valid_days: 365,
        max_users: 100,
        notes: ''
      },
      activateForm: {
        code: '',
        activated_by: ''
      }
    };
  },
  mounted() {
    this.loadLicenses();
    this.loadStats();
  },
  methods: {
    async loadLicenses() {
      try {
        let url = '/api/license';
        const params = [];
        if (this.filterStatus) params.push(`status=${this.filterStatus}`);
        if (params.length) url += '?' + params.join('&');
        const res = await this.$http.get(this.$api(url));
        if (res.data.success) {
          this.licenses = res.data.data;
        }
      } catch (err) {
        this.$message.error('加载授权码列表失败');
      }
    },
    async loadStats() {
      try {
        const res = await this.$http.get(this.$api('/api/license/stats'));
        if (res.data.success) {
          this.stats = res.data.data;
        }
      } catch (err) {
        console.error('加载统计失败');
      }
    },
    async generateLicense() {
      this.generating = true;
      try {
        const res = await this.$http.post(this.$api('/api/license/generate'), this.formData);
        if (res.data.success) {
          this.$message.success('授权码生成成功');
          this.showGenerateDialog = false;
          this.formData = {
            customer_name: '',
            customer_phone: '',
            customer_email: '',
            school_name: '',
            valid_days: 365,
            max_users: 100,
            notes: ''
          };
          this.loadLicenses();
          this.loadStats();
        } else {
          this.$message.error(res.data.message);
        }
      } catch (err) {
        this.$message.error('生成授权码失败');
      } finally {
        this.generating = false;
      }
    },
    viewLicense(license) {
      this.currentLicense = license;
      this.showDetailDialog = true;
    },
    activateLicense(license) {
      this.currentLicense = license;
      this.activateForm = {
        code: license.formatted_code || '',
        activated_by: ''
      };
      this.showActivateDialog = true;
    },
    async doActivate() {
      if (!this.currentLicense) return;
      this.activating = true;
      try {
        const res = await this.$http.post(this.$api(`/api/license/${this.currentLicense.id}/activate`), this.activateForm);
        if (res.data.success) {
          this.$message.success('授权激活成功');
          this.showActivateDialog = false;
          this.loadLicenses();
          this.loadStats();
        } else {
          this.$message.error(res.data.message);
        }
      } catch (err) {
        this.$message.error('激活失败');
      } finally {
        this.activating = false;
      }
    },
    async revokeLicense(license) {
      this.$confirm('确定要撤销此授权码吗？撤销后将无法使用。', '提示', { type: 'warning' }).then(async () => {
        try {
          const res = await this.$http.post(this.$api(`/api/license/${license.id}/revoke`));
          if (res.data.success) {
            this.$message.success('授权已撤销');
            this.loadLicenses();
            this.loadStats();
          }
        } catch (err) {
          this.$message.error('撤销失败');
        }
      }).catch(() => {});
    },
    async deleteLicense(license) {
      this.$confirm('确定要删除此授权码吗？删除后不可恢复。', '提示', { type: 'warning' }).then(async () => {
        try {
          const res = await this.$http.delete(this.$api(`/api/license/${license.id}`));
          if (res.data.success) {
            this.$message.success('授权已删除');
            this.loadLicenses();
            this.loadStats();
          }
        } catch (err) {
          this.$message.error('删除失败');
        }
      }).catch(() => {});
    },
    getStatusType(status) {
      const types = { active: 'success', used: 'info', expired: 'warning', revoked: 'danger' };
      return types[status] || 'info';
    },
    getStatusText(status) {
      const texts = { active: '未激活', used: '已使用', expired: '已过期', revoked: '已撤销' };
      return texts[status] || status;
    }
  }
};
</script>

<style scoped>
.license-manage {
  padding: 20px;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.page-header h2 {
  margin: 0;
}
.stats-row {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.stat-card {
  flex: 1;
  min-width: 120px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  text-align: center;
  border-left: 4px solid #ddd;
}
.stat-card.active { border-color: #67c23a; }
.stat-card.used { border-color: #409eff; }
.stat-card.expired { border-color: #e6a23c; }
.stat-card.revoked { border-color: #f56c6c; }
.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}
.stat-label {
  font-size: 14px;
  color: #999;
  margin-top: 4px;
}
.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: center;
}
.filter-bar .el-input {
  width: 200px;
}
.license-code {
  font-family: monospace;
  font-size: 12px;
  color: #67c23a;
  background: #f0f9eb;
  padding: 4px 8px;
  border-radius: 4px;
}
.license-code-large {
  font-family: monospace;
  font-size: 16px;
  color: #67c23a;
  background: #f0f9eb;
  padding: 8px 12px;
  border-radius: 4px;
}
.license-detail {
  padding: 10px 0;
}
.detail-row {
  display: flex;
  margin-bottom: 12px;
  align-items: center;
}
.detail-label {
  width: 100px;
  font-weight: bold;
  color: #666;
}
</style>
