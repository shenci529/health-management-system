<template>
  <div class="child-updates">
    <div class="header-card">
      <div class="header-left">
        <i class="el-icon-picture-outline-round"></i>
        <div>
          <h2>孩子在校动态</h2>
          <p class="subtitle">同步查看班主任发布的最新图片和视频</p>
        </div>
      </div>
      <div class="header-right">
        <el-button icon="el-icon-refresh" :loading="loading" @click="loadPosts">刷新</el-button>
      </div>
    </div>

    <div class="filter-bar">
      <el-select v-model="filter.classId" placeholder="选择班级/孩子" clearable style="width: 220px;" @change="loadPosts">
        <el-option v-for="c in childList" :key="c.id" :label="c.name + ' - ' + (c.class_name || c.class || '班级')" :value="c.class_id || c.id"></el-option>
      </el-select>
      <el-tag type="success" v-if="postList.length > 0">共 {{ postList.length }} 条动态</el-tag>
    </div>

    <el-empty v-if="postList.length === 0 && !loading" description="暂无动态，班主任发布后您将第一时间看到" :image-size="120"></el-empty>

    <div class="post-list" v-loading="loading">
      <div v-for="post in postList" :key="post.id" class="post-card" @click="openPost(post)">
        <div class="post-header">
          <div class="post-author">
            <div class="avatar">
              <i class="el-icon-user-solid"></i>
            </div>
            <div>
              <div class="author-name">{{ post.author_name || '班主任' }}</div>
              <div class="post-time">{{ post.created_at }}</div>
            </div>
          </div>
          <el-tag v-if="post.is_pinned" size="mini" type="danger">置顶</el-tag>
        </div>
        <h3 class="post-title">{{ post.title }}</h3>
        <div class="post-content">{{ post.content }}</div>
        <div v-if="post.medias && post.medias.length > 0" class="post-media-grid">
          <div
            v-for="(media, idx) in (post.medias.length > 4 ? post.medias.slice(0, 3) : post.medias)"
            :key="idx"
            class="media-thumb"
            :class="{ 'single': post.medias.length === 1 }"
          >
            <img v-if="media.media_type === 'image'" :src="buildMediaUrl(media.file_path)" />
            <video v-else :src="buildMediaUrl(media.file_path)" muted></video>
            <div v-if="idx === 2 && post.medias.length > 4" class="more-overlay">
              +{{ post.medias.length - 3 }}
            </div>
          </div>
        </div>
        <div class="post-footer">
          <span><i class="el-icon-view"></i> 阅读 {{ post.view_count || 0 }}</span>
          <span class="read-more">查看详情 →</span>
        </div>
      </div>
    </div>

    <!-- 详情对话框 -->
    <el-dialog :visible.sync="detailVisible" width="820px" top="5vh" :title="currentPost ? currentPost.title : ''">
      <div v-if="currentPost" class="detail-wrap">
        <div class="detail-meta">
          <span><i class="el-icon-user"></i> {{ currentPost.author_name || '班主任' }}</span>
          <span><i class="el-icon-time"></i> {{ currentPost.created_at }}</span>
          <span v-if="currentPost.class_name"><i class="el-icon-office-building"></i> {{ currentPost.class_name }}</span>
          <span v-else><i class="el-icon-office-building"></i> 全校</span>
          <span><i class="el-icon-view"></i> 阅读 {{ currentPost.view_count || 0 }}</span>
        </div>
        <div class="detail-content">{{ currentPost.content }}</div>
        <div v-if="currentPost.medias && currentPost.medias.length > 0" class="detail-medias">
          <div v-for="(media, idx) in currentPost.medias" :key="idx" class="media-item" @click="previewMedia(media)">
            <img v-if="media.media_type === 'image'" :src="buildMediaUrl(media.file_path)" />
            <video v-else :src="buildMediaUrl(media.file_path)" controls></video>
            <div class="media-tip" v-if="media.media_type !== 'image'">点击播放视频</div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 图片/视频预览 -->
    <el-dialog :visible.sync="previewVisible" width="720px" top="8vh" title="预览" append-to-body>
      <div class="preview-wrap">
        <img v-if="previewMedia && previewMedia.media_type === 'image'" :src="buildMediaUrl(previewMedia.file_path)" />
        <video v-else-if="previewMedia" :src="buildMediaUrl(previewMedia.file_path)" controls autoplay></video>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'ChildUpdates',
  data() {
    return {
      loading: false,
      detailVisible: false,
      previewVisible: false,
      currentPost: null,
      previewMedia: null,
      filter: { classId: null },
      postList: [],
      childList: []
    };
  },
  mounted() {
    this.loadChildren();
    this.loadPosts();
  },
  methods: {
    async loadChildren() {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const res = await fetch('/api/parents/' + (user.id || user.parent_id || '') + '/children');
        if (res.ok) {
          const data = await res.json();
          this.childList = data.data || data.children || data || [];
        } else {
          throw new Error('接口返回错误');
        }
      } catch (e) {
        console.warn('加载孩子列表失败，使用默认数据:', e.message);
        this.childList = [
          { id: 1, name: '小明', class_name: '一年级1班', class_id: 1 },
          { id: 2, name: '小红', class_name: '一年级2班', class_id: 2 }
        ];
      }
    },
    async loadPosts() {
      this.loading = true;
      try {
        let url = '/api/class-posts';
        if (this.filter.classId) {
          url += '?class_id=' + this.filter.classId;
        }
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          this.postList = data.data || data.posts || data || [];
          if (this.postList.length > 0) {
            this.$message.success('已同步 ' + this.postList.length + ' 条最新动态');
          }
        } else {
          this.$message.error('加载动态失败');
        }
      } catch (e) {
        this.$message.error('加载动态失败：' + e.message);
      } finally {
        this.loading = false;
      }
    },
    async openPost(post) {
      this.currentPost = post;
      this.detailVisible = true;
      // 增加阅读计数
      try {
        const res = await fetch('/api/class-posts/' + post.id + '/view', { method: 'POST' });
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          if (data.view_count) post.view_count = data.view_count;
          else post.view_count = (post.view_count || 0) + 1;
        }
      } catch (e) { /* ignore */ }
    },
    previewMedia(media) {
      if (media.media_type !== 'image') return;
      this.previewMedia = media;
      this.previewVisible = true;
    },
    buildMediaUrl(path) {
      if (!path) return '';
      if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
      if (path.startsWith('/uploads')) return path;
      return '/uploads/' + path.replace(/^[\/\\]/, '');
    }
  }
};
</script>

<style scoped>
.child-updates {
  padding: 10px;
}
.header-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: 24px 28px;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.25);
}
.header-left { display: flex; align-items: center; gap: 18px; }
.header-left i { font-size: 48px; }
.header-left h2 { margin: 0; font-size: 22px; font-weight: 600; }
.header-left .subtitle { margin: 4px 0 0 0; font-size: 13px; opacity: 0.9; }
.header-right .el-button { background: rgba(255,255,255,0.2); border-color: rgba(255,255,255,0.3); color: #fff; }
.header-right .el-button:hover { background: rgba(255,255,255,0.3); }

.filter-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.post-card {
  background: #fff;
  padding: 22px 24px;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: all 0.25s ease;
}
.post-card:hover {
  box-shadow: 0 6px 20px rgba(0,0,0,0.08);
  transform: translateY(-2px);
}
.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.post-author { display: flex; align-items: center; gap: 12px; }
.avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}
.avatar i { font-size: 20px; }
.author-name { font-size: 14px; color: #303133; font-weight: 500; }
.post-time { font-size: 12px; color: #909399; margin-top: 2px; }

.post-title {
  font-size: 16px;
  color: #303133;
  margin: 4px 0 8px 0;
  font-weight: 600;
}
.post-content {
  color: #606266;
  line-height: 1.7;
  font-size: 14px;
  white-space: pre-wrap;
  margin-bottom: 14px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-media-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}
.media-thumb {
  position: relative;
  aspect-ratio: 1;
  border-radius: 6px;
  overflow: hidden;
  background: #f0f2f5;
}
.media-thumb.single { aspect-ratio: 16 / 9; }
.media-thumb img, .media-thumb video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.more-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.55);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 500;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f0f2f5;
  font-size: 13px;
  color: #909399;
}
.post-footer i { margin-right: 4px; }
.read-more { color: #667eea; font-weight: 500; }

.detail-wrap { padding: 6px; }
.detail-meta {
  color: #909399;
  font-size: 13px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding-bottom: 14px;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 16px;
}
.detail-meta i { margin-right: 4px; }
.detail-content {
  line-height: 1.9;
  color: #303133;
  white-space: pre-wrap;
  font-size: 15px;
  margin-bottom: 16px;
}
.detail-medias {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.detail-medias .media-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: #000;
  aspect-ratio: 4 / 3;
  cursor: pointer;
}
.detail-medias .media-item img,
.detail-medias .media-item video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.media-tip {
  position: absolute;
  bottom: 8px;
  left: 8px;
  background: rgba(0,0,0,0.6);
  color: #fff;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
}

.preview-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  max-height: 70vh;
}
.preview-wrap img, .preview-wrap video {
  max-width: 100%;
  max-height: 70vh;
  border-radius: 6px;
}
</style>
