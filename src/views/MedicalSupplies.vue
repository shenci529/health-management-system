<template>
  <div class="medical-supplies">
    <el-card class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h2>医务室物资管理</h2>
          <p class="subtitle">管理医务室药品及医疗物资的入库、出库、库存盘点</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" icon="el-icon-plus" @click="handleAddSupply">新增物资</el-button>
          <el-button type="success" icon="el-icon-download" @click="handleExport">导出</el-button>
        </div>
      </div>
    </el-card>

    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon total-icon">
              <i class="el-icon-box"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalItems }}</div>
              <div class="stat-label">物资种类</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon warning-icon">
              <i class="el-icon-warning"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.lowStockItems }}</div>
              <div class="stat-label">库存不足</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon expired-icon">
              <i class="el-icon-time"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.expiringItems }}</div>
              <div class="stat-label">即将过期</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon expired-icon2">
              <i class="el-icon-circle-close"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.expiredItems }}</div>
              <div class="stat-label">已过期</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="table-card">
      <div slot="header">
        <span>物资库存</span>
        <el-radio-group v-model="listFilter" size="small" style="margin-left: 20px">
          <el-radio-button label="all">全部</el-radio-button>
          <el-radio-button label="medicine">药品</el-radio-button>
          <el-radio-button label="supply">医疗用品</el-radio-button>
          <el-radio-button label="low">库存不足</el-radio-button>
          <el-radio-button label="expiring">即将过期</el-radio-button>
        </el-radio-group>
      </div>
      <el-table :data="supplyList" stripe v-loading="loading" style="width: 100%">
        <el-table-column prop="code" label="物资编码" width="120" />
        <el-table-column prop="name" label="物资名称" min-width="150" />
        <el-table-column prop="category" label="分类" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.category === '药品' ? 'danger' : 'primary'" size="mini">{{ scope.row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="specification" label="规格" width="120" />
        <el-table-column prop="stock" label="当前库存" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="getStockTag(scope.row)" size="mini">{{ scope.row.stock }}{{ scope.row.unit }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="minStock" label="最低库存" width="100" align="center" />
        <el-table-column prop="expiryDate" label="有效期至" width="120">
          <template slot-scope="scope">
            <span :class="getExpiryClass(scope.row)">{{ scope.row.expiryDate }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="location" label="存放位置" width="120" />
        <el-table-column prop="supplier" label="供应商" width="120" show-overflow-tooltip />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="handleInStock(scope.row)">入库</el-button>
            <el-button type="text" size="mini" @click="handleOutStock(scope.row)">出库</el-button>
            <el-button type="text" size="mini" @click="handleEdit(scope.row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrapper">
        <el-pagination
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        />
      </div>
    </el-card>

    <!-- 新增/编辑物资对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="600px">
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="物资编码" prop="code">
              <el-input v-model="form.code" placeholder="请输入编码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="物资名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="分类" prop="category">
              <el-select v-model="form.category" placeholder="请选择分类" style="width: 100%">
                <el-option label="药品" value="药品" />
                <el-option label="医疗用品" value="医疗用品" />
                <el-option label="消毒用品" value="消毒用品" />
                <el-option label="急救用品" value="急救用品" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="规格" prop="specification">
              <el-input v-model="form.specification" placeholder="如：10片/盒" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="单位" prop="unit">
              <el-select v-model="form.unit" placeholder="请选择单位" style="width: 100%">
                <el-option label="盒" value="盒" />
                <el-option label="瓶" value="瓶" />
                <el-option label="支" value="支" />
                <el-option label="包" value="包" />
                <el-option label="个" value="个" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最低库存" prop="minStock">
              <el-input-number v-model="form.minStock" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="有效期至" prop="expiryDate">
              <el-date-picker v-model="form.expiryDate" type="date" placeholder="选择日期" style="width: 100%" value-format="yyyy-MM-dd" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="存放位置" prop="location">
              <el-input v-model="form.location" placeholder="如：药品柜A1" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="供应商" prop="supplier">
          <el-input v-model="form.supplier" placeholder="请输入供应商" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="其他说明" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </div>
    </el-dialog>

    <!-- 入库对话框 -->
    <el-dialog title="物资入库" :visible.sync="inStockVisible" width="500px">
      <el-form :model="inStockForm" :rules="inStockRules" ref="inStockForm" label-width="100px">
        <el-form-item label="物资名称">
          <el-input v-model="inStockForm.name" disabled />
        </el-form-item>
        <el-form-item label="入库数量" prop="quantity">
          <el-input-number v-model="inStockForm.quantity" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="入库日期" prop="date">
          <el-date-picker v-model="inStockForm.date" type="date" placeholder="选择日期" style="width: 100%" value-format="yyyy-MM-dd" />
        </el-form-item>
        <el-form-item label="供应商">
          <el-input v-model="inStockForm.supplier" placeholder="请输入供应商" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="inStockForm.remark" type="textarea" :rows="2" placeholder="其他说明" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="inStockVisible = false">取消</el-button>
        <el-button type="primary" @click="submitInStock">确认入库</el-button>
      </div>
    </el-dialog>

    <!-- 出库对话框 -->
    <el-dialog title="物资出库" :visible.sync="outStockVisible" width="500px">
      <el-form :model="outStockForm" :rules="outStockRules" ref="outStockForm" label-width="100px">
        <el-form-item label="物资名称">
          <el-input v-model="outStockForm.name" disabled />
        </el-form-item>
        <el-form-item label="当前库存">
          <el-input v-model="outStockForm.currentStock" disabled />
        </el-form-item>
        <el-form-item label="出库数量" prop="quantity">
          <el-input-number v-model="outStockForm.quantity" :min="1" :max="outStockForm.maxStock" style="width: 100%" />
        </el-form-item>
        <el-form-item label="出库日期" prop="date">
          <el-date-picker v-model="outStockForm.date" type="date" placeholder="选择日期" style="width: 100%" value-format="yyyy-MM-dd" />
        </el-form-item>
        <el-form-item label="使用对象" prop="target">
          <el-radio-group v-model="outStockForm.target">
            <el-radio label="学生">学生</el-radio>
            <el-radio label="教师">教师</el-radio>
            <el-radio label="其他">其他</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="用途说明" prop="purpose">
          <el-input v-model="outStockForm.purpose" type="textarea" :rows="2" placeholder="请说明出库用途" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="outStockVisible = false">取消</el-button>
        <el-button type="primary" @click="submitOutStock">确认出库</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'MedicalSupplies',
  data() {
    return {
      loading: false,
      listFilter: 'all',
      currentPage: 1,
      pageSize: 10,
      total: 100,
      stats: {
        totalItems: 156,
        lowStockItems: 8,
        expiringItems: 12,
        expiredItems: 3
      },
      supplyList: [
        {
          id: '1',
          code: 'MED001',
          name: '创可贴',
          category: '医疗用品',
          specification: '10片/盒',
          unit: '盒',
          stock: 50,
          minStock: 20,
          expiryDate: '2025-12-31',
          location: '急救箱A',
          supplier: 'XX医疗器械公司'
        },
        {
          id: '2',
          code: 'MED002',
          name: '碘伏消毒液',
          category: '消毒用品',
          specification: '100ml/瓶',
          unit: '瓶',
          stock: 15,
          minStock: 10,
          expiryDate: '2024-06-30',
          location: '药品柜B2',
          supplier: 'XX药业'
        },
        {
          id: '3',
          code: 'MED003',
          name: '退热贴',
          category: '药品',
          specification: '4片/盒',
          unit: '盒',
          stock: 8,
          minStock: 15,
          expiryDate: '2024-03-15',
          location: '药品柜A1',
          supplier: 'XX制药'
        }
      ],
      dialogVisible: false,
      dialogTitle: '新增物资',
      form: {
        code: '',
        name: '',
        category: '',
        specification: '',
        unit: '',
        minStock: 10,
        expiryDate: '',
        location: '',
        supplier: '',
        remark: ''
      },
      rules: {
        code: [{ required: true, message: '请输入物资编码', trigger: 'blur' }],
        name: [{ required: true, message: '请输入物资名称', trigger: 'blur' }],
        category: [{ required: true, message: '请选择分类', trigger: 'change' }],
        unit: [{ required: true, message: '请选择单位', trigger: 'change' }],
        minStock: [{ required: true, message: '请输入最低库存', trigger: 'blur' }]
      },
      inStockVisible: false,
      inStockForm: {
        name: '',
        quantity: 1,
        date: '',
        supplier: '',
        remark: ''
      },
      inStockRules: {
        quantity: [{ required: true, message: '请输入入库数量', trigger: 'blur' }],
        date: [{ required: true, message: '请选择入库日期', trigger: 'change' }]
      },
      outStockVisible: false,
      outStockForm: {
        name: '',
        currentStock: '',
        quantity: 1,
        maxStock: 0,
        date: '',
        target: '学生',
        purpose: ''
      },
      outStockRules: {
        quantity: [{ required: true, message: '请输入出库数量', trigger: 'blur' }],
        date: [{ required: true, message: '请选择出库日期', trigger: 'change' }],
        purpose: [{ required: true, message: '请输入用途说明', trigger: 'blur' }]
      }
    }
  },
  methods: {
    handleSizeChange(val) {
      this.pageSize = val
    },
    handleCurrentChange(val) {
      this.currentPage = val
    },
    handleAddSupply() {
      this.dialogTitle = '新增物资'
      this.form = {
        code: '',
        name: '',
        category: '',
        specification: '',
        unit: '',
        minStock: 10,
        expiryDate: '',
        location: '',
        supplier: '',
        remark: ''
      }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogTitle = '编辑物资'
      this.form = { ...row }
      this.dialogVisible = true
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.$message.success('保存成功')
          this.dialogVisible = false
        }
      })
    },
    handleInStock(row) {
      this.inStockForm = {
        name: row.name,
        quantity: 1,
        date: new Date().toISOString().split('T')[0],
        supplier: row.supplier,
        remark: ''
      }
      this.inStockVisible = true
    },
    submitInStock() {
      this.$refs.inStockForm.validate(valid => {
        if (valid) {
          this.$message.success('入库成功')
          this.inStockVisible = false
        }
      })
    },
    handleOutStock(row) {
      this.outStockForm = {
        name: row.name,
        currentStock: row.stock + row.unit,
        quantity: 1,
        maxStock: row.stock,
        date: new Date().toISOString().split('T')[0],
        target: '学生',
        purpose: ''
      }
      this.outStockVisible = true
    },
    submitOutStock() {
      this.$refs.outStockForm.validate(valid => {
        if (valid) {
          this.$message.success('出库成功')
          this.outStockVisible = false
        }
      })
    },
    handleExport() {
      this.$message.success('导出成功')
    },
    getStockTag(row) {
      if (row.stock <= row.minStock) return 'danger'
      if (row.stock <= row.minStock * 1.5) return 'warning'
      return 'success'
    },
    getExpiryClass(row) {
      const expiry = new Date(row.expiryDate)
      const today = new Date()
      const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
      if (diffDays < 0) return 'expired'
      if (diffDays < 30) return 'expiring'
      return ''
    }
  }
}
</script>

<style scoped>
.medical-supplies {
  padding: 20px;
}
.page-header {
  margin-bottom: 20px;
}
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.title-section h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #303133;
}
.subtitle {
  margin: 0;
  color: #909399;
  font-size: 14px;
}
.header-actions {
  display: flex;
  align-items: center;
}
.stat-card {
  margin-bottom: 20px;
}
.stat-item {
  display: flex;
  align-items: center;
}
.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin-right: 15px;
}
.total-icon {
  background: #f0f9ff;
  color: #409eff;
}
.warning-icon {
  background: #fffbe6;
  color: #faad14;
}
.expired-icon {
  background: #fff7e6;
  color: #ff9c6e;
}
.expired-icon2 {
  background: #fff2f0;
  color: #ff4d4f;
}
.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}
.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}
.table-card {
  margin-top: 0;
}
.pagination-wrapper {
  margin-top: 20px;
  text-align: right;
}
.expired {
  color: #ff4d4f;
  font-weight: bold;
}
.expiring {
  color: #faad14;
  font-weight: bold;
}
</style>
