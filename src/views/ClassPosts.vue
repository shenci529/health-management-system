<template>
  <div class="class-posts">
    <el-tabs v-model="activeTab" type="card">
      <!-- 发布动态 -->
      <el-tab-pane label="发布动态" name="publish">
        <div class="publish-form">
          <el-form :model="postForm" :rules="postRules" ref="postForm" label-width="100px" style="max-width: 900px;">
            <el-form-item label="发布范围" prop="scope">
              <el-radio-group v-model="postForm.scope">
                <el-radio label="class">班级发布</el-radio>
                <el-radio label="all">全校发布</el-radio>
              </el-radio-group>
              <el-select v-if="postForm.scope === 'class'" v-model="postForm.classId" placeholder="选择班级" style="width: 200px; margin-left: 15px;">
                <el-option v-for="c in classList" :key="c.id" :label="c.name" :value="c.id"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="动态标题" prop="title">
              <el-input v-model="postForm.title" placeholder="请输入动态标题" maxlength="100"></el-input>
            </el-form-item>
            <el-form-item label="动态内容" prop="content">
              <el-input type="textarea" v-model="postForm.content" :rows="5" placeholder="记录今天孩子的精彩瞬间..."></el-input>
            </el-form-item>
            <el-form-item label="图片/视频">
              <div class="upload-area">
                <div v-for="(file, idx) in uploadedFiles" :key="idx" class="upload-item">
                  <img v-if="file.type && file.type.startsWith('image')" :src="file.preview || file.url" class="thumb" />
                  <video v-else-if="file.type && file.type.startsWith('video')" :src="file.preview || file.url" class="thumb video" controls></video>
                  <div v-else class="thumb file-icon"><i class="el-icon-picture-outline"></i></div>
                  <div class="file-name">{{ file.name || '已上传' }}</div>
                  <i class="el-icon-close remove-btn" @click="removeFile(idx)"></i>
                </div>
                <div class="upload-item add-btn" @click="triggerFileInput">
                  <i class="el-icon-plus"></i>
                  <span>添加图片/视频</span>
                </div>
                <input ref="fileInput" type="file" multiple accept="image/*,video/*" style="display: none;" @change="handleFileSelect" />
              </div>
              <div class="upload-tip">支持 JPG/PNG/GIF/MP4/MOV 格式，单个文件不超过 50MB</div>
            </el-form-item>
            <el-form-item label="是否置顶">
              <el-switch v-model="postForm.isPinned"></el-switch>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="submitting" @click="submitPost">发布动态</el-button>
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>

      <!-- 动态管理 -->
      <el-tab-pane label="动态管理" name="manage">
        <div class="search-bar">
          <el-input v-model="manageSearch.keyword" placeholder="搜索标题" style="width: 220px;" clearable></el-input>
          <el-button type="primary" icon="el-icon-search" @click="loadPosts">查询</el-button>
          <el-button icon="el-icon-refresh" @click="loadPosts">刷新</el-button>
        </div>
        <el-table :data="postList" border style="width: 100%" v-loading="loading">
          <el-table-column type="index" label="序号" width="60"></el-table-column>
          <el-table-column prop="title" label="标题" width="220" show-overflow-tooltip></el-table-column>
          <el-table-column label="班级" width="120">
            <template slot-scope="scope">{{ scope.row.class_name || '全校' }}</template>
          </el-table-column>
          <el-table-column label="媒体" width="80">
            <template slot-scope="scope">
              <el-tag size="mini" type="info" v-if="scope.row.media_count && scope.row.media_count > 0">{{ scope.row.media_count }}</el-tag>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="author_name" label="发布人" width="100"></el-table-column>
          <el-table-column prop="created_at" label="发布时间" width="160"></el-table-column>
          <el-table-column prop="view_count" label="阅读" width="60"></el-table-column>
          <el-table-column label="置顶" width="60">
            <template slot-scope="scope">
              <el-tag size="mini" type="danger" v-if="scope.row.is_pinned">置顶</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right">
            <template slot-scope="scope">
              <el-button type="text" size="small" @click="viewPost(scope.row)">查看</el-button>
              <el-button type="text" size="small" @click="togglePin(scope.row)">{{ scope.row.is_pinned ? '取消置顶' : '置顶' }}</el-button>
              <el-button type="text" size="small" style="color: #f56c6c;" @click="deletePost(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination" v-if="postList.length === 0 && !loading">
          <el-empty description="暂无动态"></el-empty>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 查看详情对话框 -->
    <el-dialog title="动态详情" :visible.sync="detailVisible" width="720px">
      <div v-if="currentPost" class="post-detail">
        <h2>{{ currentPost.title }}</h2>
        <div class="detail-meta">
          <span><i class="el-icon-user"></i> {{ currentPost.author_name }}</span>
          <span><i class="el-icon-time"></i> {{ currentPost.created_at }}</span>
          <span v-if="currentPost.class_name"><i class="el-icon-office-building"></i> {{ currentPost.class_name }}</span>
          <span v-else><i class="el-icon-office-building"></i> 全校</span>
          <span><i class="el-icon-view"></i> 阅读 {{ currentPost.view_count || 0 }}</span>
        </div>
        <div class="detail-content">{{ currentPost.content }}</div>
        <div v-if="currentPost.medias && currentPost.medias.length > 0" class="detail-medias">
          <div v-for="(media, idx) in currentPost.medias" :key="idx" class="media-item">
            <img v-if="media.media_type === 'image'" :src="buildMediaUrl(media.file_path)" />
            <video v-else :src="buildMediaUrl(media.file_path)" controls></video>
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="detailVisible = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'ClassPosts',
  data() {
    return {
      activeTab: 'manage',
      submitting: false,
      loading: false,
      detailVisible: false,
      currentPost: null,
      postForm: {
        title: '',
        content: '',
        scope: 'class',
        classId: null,
        isPinned: false
      },
      postRules: {
        title: [{ required: true, message: '请输入动态标题', trigger: 'blur' }],
        content: [{ required: true, message: '请输入动态内容', trigger: 'blur' }]
      },
      uploadedFiles: [],
      manageSearch: { keyword: '' },
      postList: [],
      classList: []
    };
  },
  mounted() {
    this.loadClasses();
    this.loadPosts();
  },
  methods: {
    async loadClasses() {
      try {
        const res = await fetch(this.$api('/api/classes'));
        if (res.ok) {
          const data = await res.json();
          this.classList = data.data || data.classes || data || [];
        }
      } catch (e) {
        console.warn('加载班级列表失败:', e);
        this.classList = [
          { id: 1, name: '一年级1班' },
          { id: 2, name: '一年级2班' },
          { id: 3, name: '二年级1班' }
        ];
      }
    },
    async loadPosts() {
      this.loading = true;
      try {
        const res = await fetch(this.$api('/api/class-posts'));
        if (res.ok) {
          const data = await res.json();
          this.postList = data.data || data.posts || data || [];
        } else {
          this.$message.error('加载动态列表失败');
        }
      } catch (e) {
        this.$message.error('加载动态列表失败: ' + e.message);
      } finally {
        this.loading = false;
      }
    },
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    handleFileSelect(e) {
      const files = Array.from(e.target.files || []);
      for (const file of files) {
        if (file.size > 50 * 1024 * 1024) {
          this.$message.warning('文件 "' + file.name + '" 超过 50MB，已跳过');
          continue;
        }
        const reader = new FileReader();
        const fileObj = { name: file.name, type: file.type, file: file, preview: '' };
        reader.onload = (ev) => { fileObj.preview = ev.target.result; };
        reader.readAsDataURL(file);
        this.uploadedFiles.push(fileObj);
      }
      e.target.value = '';
    },
    removeFile(idx) {
      this.uploadedFiles.splice(idx, 1);
    },
    async submitPost() {
      this.$refs.postForm.validate(async (valid) => {
        if (!valid) return;
        if (this.postForm.scope === 'class' && !this.postForm.classId) {
          this.$message.warning('请选择班级');
          return;
        }
        this.submitting = true;
        try {
          // 将所有文件转为 base64（兼容 Vercel 等无服务器环境）
          const filesBase64 = [];
          for (const f of this.uploadedFiles) {
            filesBase64.push({
              name: f.name,
              type: f.type,
              data: f.preview
            });
          }
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          const payload = {
            title: this.postForm.title,
            content: this.postForm.content,
            is_pinned: this.postForm.isPinned ? 1 : 0,
            files: filesBase64
          };
          if (this.postForm.scope === 'class' && this.postForm.classId) {
            payload.class_id = this.postForm.classId;
          }
          if (user.id) payload.author_id = user.id;
          if (user.name || user.username) payload.author_name = user.name || user.username;

          const res = await fetch(this.$api('/api/class-posts'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (res.ok) {
            this.$message.success('动态发布成功！家长将同步看到这条动态');
            this.resetForm();
            this.activeTab = 'manage';
            this.loadPosts();
          } else {
            const data = await res.json().catch(() => ({}));
            this.$message.error('发布失败：' + (data.message || '服务器错误'));
          }
        } catch (e) {
          this.$message.error('发布失败：' + e.message);
        } finally {
          this.submitting = false;
        }
      });
    },
    resetForm() {
      this.postForm = { title: '', content: '', scope: 'class', classId: null, isPinned: false };
      this.uploadedFiles = [];
      if (this.$refs.postForm) this.$refs.postForm.resetFields();
    },
    async viewPost(row) {
      try {
        const res = await fetch(this.$api('/api/class-posts/' + row.id));
        if (res.ok) {
          const data = await res.json();
          this.currentPost = data.data || data.post || data;
          this.detailVisible = true;
        }
      } catch (e) {
        this.$message.error('加载详情失败');
      }
    },
    async togglePin(row) {
      try {
        const res = await fetch(this.$api('/api/class-posts/' + row.id + '/pin'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_pinned: row.is_pinned ? 0 : 1 })
        });
        if (res.ok) {
          this.$message.success('操作成功');
          this.loadPosts();
        }
      } catch (e) {
        this.$message.error('操作失败');
      }
    },
    async deletePost(row) {
      this.$confirm('确定删除动态 "' + row.title + '" 吗？', '提示', { type: 'warning' }).then(async () => {
        try {
          const res = await fetch(this.$api('/api/class-posts/' + row.id), { method: 'DELETE' });
          if (res.ok) {
            this.$message.success('删除成功');
            this.loadPosts();
          }
        } catch (e) {
          this.$message.error('删除失败');
        }
      }).catch(() => {});
    },
    buildMediaUrl(path) {
      if (!path) return '';
      if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
      if (path.startsWith('/uploads')) return this.$api(path);
      return this.$api('/uploads/' + path.replace(/^[\/\\]/, ''));
    }
  }
};
</script>

<style scoped>
.class-posts {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}
.publish-form { padding: 20px; }
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
.upload-area {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-start;
}
.upload-item {
  position: relative;
  width: 140px;
  height: 140px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  overflow: hidden;
  background: #fafafa;
  display: flex;
  flex-direction: column;
}
.upload-item .thumb {
  width: 100%;
  height: 100px;
  object-fit: cover;
  display: block;
}
.upload-item .thumb.video {
  background: #000;
}
.upload-item .file-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  color: #c0c4cc;
  height: 100px;
}
.upload-item .file-name {
  font-size: 12px;
  color: #606266;
  padding: 4px 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.upload-item .remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(245, 108, 108, 0.9);
  color: #fff;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  text-align: center;
  line-height: 20px;
  cursor: pointer;
  font-size: 12px;
}
.upload-item.add-btn {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: #8c939d;
  font-size: 14px;
  border: 2px dashed #dcdfe6;
  background: #fafafa;
  transition: all 0.2s;
}
.upload-item.add-btn:hover {
  color: #409eff;
  border-color: #409eff;
  background: #ecf5ff;
}
.upload-item.add-btn i {
  font-size: 28px;
  margin-bottom: 4px;
}
.upload-tip {
  color: #909399;
  font-size: 12px;
  margin-top: 8px;
}
.post-detail { padding: 10px; }
.post-detail h2 {
  font-size: 20px;
  margin: 0 0 12px 0;
  color: #303133;
}
.detail-meta {
  color: #909399;
  font-size: 13px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}
.detail-meta i { margin-right: 4px; }
.detail-content {
  padding: 16px 0;
  line-height: 1.8;
  color: #303133;
  white-space: pre-wrap;
}
.detail-medias {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px dashed #ebeef5;
}
.detail-medias .media-item {
  width: 200px;
  height: 200px;
  border-radius: 6px;
  overflow: hidden;
  background: #000;
}
.detail-medias .media-item img,
.detail-medias .media-item video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.pagination { padding-top: 20px; text-align: center; }
</style>
