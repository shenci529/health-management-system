const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { Database } = require('../database/db');

// ==================== 文件上传目录配置 ====================
const UPLOAD_DIR = path.join(__dirname, '../uploads/class-posts');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// ==================== 简易文件上传（不依赖 multer） ====================
// 使用 express.raw() + 手动解析 multipart/form-data
// 或者使用更简单的方式：前端以 base64 发送文件

function parseFileSize(str) {
  if (!str) return 0;
  return parseInt(str, 10) || 0;
}

// 简易 multipart 解析（从原始请求 buffer 中提取文件）
function parseMultipart(body, boundary) {
  const files = [];
  const fields = {};
  const boundaryBuffer = Buffer.from('--' + boundary);
  const endBuffer = Buffer.from('--' + boundary + '--');
  
  let idx = 0;
  while (idx < body.length) {
    const boundaryIdx = body.indexOf(boundaryBuffer, idx);
    if (boundaryIdx === -1) break;
    
    const nextBoundaryIdx = body.indexOf(boundaryBuffer, boundaryIdx + boundaryBuffer.length);
    const partEnd = nextBoundaryIdx === -1 ? body.length : nextBoundaryIdx;
    const part = body.slice(boundaryIdx + boundaryBuffer.length + 2, partEnd);
    
    // 解析 header
    const headerEnd = part.indexOf(Buffer.from('\r\n\r\n'));
    if (headerEnd === -1) {
      idx = partEnd;
      continue;
    }
    const header = part.slice(0, headerEnd).toString('utf-8');
    const content = part.slice(headerEnd + 4);
    
    // 解析 Content-Disposition
    const dispositionMatch = header.match(/Content-Disposition:\s*form-data;\s*name="([^"]+)"(?:;\s*filename="([^"]*)")?/i);
    if (dispositionMatch) {
      const fieldName = dispositionMatch[1];
      const filename = dispositionMatch[2];
      
      if (filename) {
        // 这是文件
        const contentTypeMatch = header.match(/Content-Type:\s*([^\r\n]+)/i);
        files.push({
          fieldName,
          filename,
          contentType: contentTypeMatch ? contentTypeMatch[1].trim() : 'application/octet-stream',
          data: content.slice(0, content.length - 2) // 移除末尾 \r\n
        });
      } else {
        // 这是普通字段
        fields[fieldName] = content.slice(0, content.length - 2).toString('utf-8');
      }
    }
    
    if (nextBoundaryIdx === -1) break;
    idx = nextBoundaryIdx;
  }
  
  return { fields, files };
}

// 生成安全文件名
function generateSafeFileName(originalName) {
  const ext = path.extname(originalName).toLowerCase();
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${random}${ext}`;
}

// 判断文件类型
function getFileType(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'].includes(ext)) return 'image';
  if (['.mp4', '.webm', '.avi', '.mov', '.mkv'].includes(ext)) return 'video';
  return 'other';
}

// 保存文件到磁盘
function saveUploadedFile(fileBuffer, originalFilename) {
  const safeName = generateSafeFileName(originalFilename);
  const savePath = path.join(UPLOAD_DIR, safeName);
  fs.writeFileSync(savePath, fileBuffer);
  const fileType = getFileType(originalFilename);
  return {
    file_name: originalFilename,
    file_path: `/uploads/class-posts/${safeName}`,
    file_type: fileType,
    file_size: fileBuffer.length,
    mime_type: fileType === 'image' ? 'image/*' : (fileType === 'video' ? 'video/*' : 'application/octet-stream')
  };
}

// ==================== API 路由 ====================

// 获取班级动态列表（分页 + 按班级过滤）
router.get('/', (req, res) => {
  try {
    const { class_id, page = 1, page_size = 20, user_id } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(page_size);
    const limit = parseInt(page_size);
    
    let posts;
    let total;
    
    if (class_id) {
      posts = Database.all(
        'SELECT cp.*, c.name as class_name FROM class_posts cp LEFT JOIN classes c ON cp.class_id = c.id WHERE cp.status = "published" AND (cp.class_id = ? OR cp.class_id IS NULL) ORDER BY cp.is_pinned DESC, cp.created_at DESC LIMIT ? OFFSET ?',
        [parseInt(class_id), limit, offset]
      );
      const countResult = Database.get(
        'SELECT COUNT(*) as total FROM class_posts WHERE status = "published" AND (class_id = ? OR class_id IS NULL)',
        [parseInt(class_id)]
      );
      total = countResult ? countResult.total : 0;
    } else {
      posts = Database.all(
        'SELECT cp.*, c.name as class_name FROM class_posts cp LEFT JOIN classes c ON cp.class_id = c.id WHERE cp.status = "published" ORDER BY cp.is_pinned DESC, cp.created_at DESC LIMIT ? OFFSET ?',
        [limit, offset]
      );
      const countResult = Database.get('SELECT COUNT(*) as total FROM class_posts WHERE status = "published"');
      total = countResult ? countResult.total : 0;
    }
    
    // 为每条动态获取媒体文件
    const postIds = posts.map(p => p.id);
    let mediaList = [];
    if (postIds.length > 0) {
      const placeholders = postIds.map(() => '?').join(',');
      mediaList = Database.all(
        `SELECT * FROM class_post_media WHERE post_id IN (${placeholders}) ORDER BY sort_order, id`,
        postIds
      );
    }
    
    // 为每条动态检查是否已读
    let viewedMap = {};
    if (user_id) {
      const viewedRecords = Database.all(
        `SELECT post_id FROM class_post_views WHERE user_id = ? AND post_id IN (${postIds.map(() => '?').join(',')})`,
        [parseInt(user_id), ...postIds]
      );
      viewedRecords.forEach(v => { viewedMap[v.post_id] = true; });
    }
    
    // 组装数据
    const postsWithMedia = posts.map(post => ({
      ...post,
      media: mediaList.filter(m => m.post_id === post.id),
      is_viewed: !!viewedMap[post.id]
    }));
    
    res.json({
      success: true,
      data: postsWithMedia,
      total,
      page: parseInt(page),
      page_size: limit
    });
  } catch (err) {
    console.error('获取班级动态失败:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 获取单条动态详情
router.get('/:id', (req, res) => {
  try {
    const post = Database.get('SELECT cp.*, c.name as class_name FROM class_posts cp LEFT JOIN classes c ON cp.class_id = c.id WHERE cp.id = ?', [parseInt(req.params.id)]);
    if (!post) {
      return res.status(404).json({ success: false, message: '动态不存在' });
    }
    const media = Database.all('SELECT * FROM class_post_media WHERE post_id = ? ORDER BY sort_order, id', [parseInt(req.params.id)]);
    post.media = media;
    res.json({ success: true, data: post });
  } catch (err) {
    console.error('获取动态详情失败:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 发布新动态（支持文件上传）
router.post('/', (req, res) => {
  try {
    const contentType = req.headers['content-type'] || '';
    if (contentType.includes('multipart/form-data')) {
      // multipart 上传：从请求体解析
      let rawBody = Buffer.alloc(0);
      req.on('data', chunk => { rawBody = Buffer.concat([rawBody, chunk]); });
      req.on('end', () => {
        try {
          const boundaryMatch = contentType.match(/boundary=([^;]+)/);
          if (!boundaryMatch) {
            return res.status(400).json({ success: false, message: '无法解析上传格式' });
          }
          const boundary = boundaryMatch[1].trim().replace(/^"|"$/g, '');
          const { fields, files } = parseMultipart(rawBody, boundary);
          handleCreatePost(fields, files, res);
        } catch (err) {
          console.error('解析上传数据失败:', err);
          res.status(500).json({ success: false, message: '解析上传数据失败: ' + err.message });
        }
      });
    } else {
      // JSON 上传（base64 文件内容）
      handleCreatePost(req.body, req.body.files || [], res);
    }
  } catch (err) {
    console.error('发布动态失败:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 处理创建动态的核心逻辑
function handleCreatePost(fields, files, res) {
  const { title = '', content = '', class_id, author_id, author_name, is_pinned = false } = fields;
  
  if (!author_id) {
    return res.status(400).json({ success: false, message: '缺少作者信息' });
  }
  
  if (!title && !content && (!files || files.length === 0)) {
    return res.status(400).json({ success: false, message: '动态内容不能为空' });
  }
  
  const classIdVal = class_id ? (typeof class_id === 'string' ? (class_id === '' ? null : parseInt(class_id)) : class_id) : null;
  const pinnedVal = is_pinned === true || is_pinned === 'true' || is_pinned === 1 || is_pinned === '1' ? 1 : 0;
  
  // 插入动态
  const result = Database.run(
    'INSERT INTO class_posts (title, content, class_id, author_id, author_name, is_pinned, status) VALUES (?, ?, ?, ?, ?, ?, "published")',
    [title, content, classIdVal, parseInt(author_id), author_name || '', pinnedVal]
  );
  const postId = result.lastID;
  
  // 保存上传的文件
  const savedMedia = [];
  if (files && Array.isArray(files) && files.length > 0) {
    files.forEach((file, index) => {
      // 处理上传的文件对象 { fieldName, filename, contentType, data } 或 base64
      let fileInfo;
      if (file.data) {
        fileInfo = saveUploadedFile(file.data, file.filename);
      } else if (file.base64_data) {
        // base64 上传
        const buffer = Buffer.from(file.base64_data, 'base64');
        fileInfo = saveUploadedFile(buffer, file.filename);
      } else {
        return;
      }
      
      if (fileInfo.file_type !== 'other') {
        Database.run(
          'INSERT INTO class_post_media (post_id, file_name, file_path, file_type, file_size, mime_type, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [postId, fileInfo.file_name, fileInfo.file_path, fileInfo.file_type, fileInfo.file_size, fileInfo.mime_type, index]
        );
        savedMedia.push(fileInfo);
      }
    });
  }
  
  res.json({
    success: true,
    message: '发布成功',
    data: { id: postId, media_count: savedMedia.length }
  });
}

// 标记动态为已读
router.post('/:id/view', (req, res) => {
  try {
    const { user_id } = req.body;
    const postId = parseInt(req.params.id);
    if (!user_id) {
      return res.status(400).json({ success: false, message: '缺少用户 ID' });
    }
    
    // 先检查是否已读
    const existing = Database.get('SELECT id FROM class_post_views WHERE post_id = ? AND user_id = ?', [postId, parseInt(user_id)]);
    if (existing) {
      return res.json({ success: true, message: '已标记为已读' });
    }
    
    Database.run('INSERT INTO class_post_views (post_id, user_id) VALUES (?, ?)', [postId, parseInt(user_id)]);
    Database.run('UPDATE class_posts SET view_count = view_count + 1 WHERE id = ?', [postId]);
    
    res.json({ success: true, message: '标记成功' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 删除动态
router.delete('/:id', (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    
    // 先删除媒体文件
    const mediaList = Database.all('SELECT * FROM class_post_media WHERE post_id = ?', [postId]);
    mediaList.forEach(m => {
      const filePath = path.join(__dirname, '../..', m.file_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
    
    Database.run('DELETE FROM class_post_media WHERE post_id = ?', [postId]);
    Database.run('DELETE FROM class_post_views WHERE post_id = ?', [postId]);
    Database.run('DELETE FROM class_posts WHERE id = ?', [postId]);
    
    res.json({ success: true, message: '删除成功' });
  } catch (err) {
    console.error('删除动态失败:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 获取作者自己发布的动态（班主任/管理员管理用）
router.get('/author/:authorId', (req, res) => {
  try {
    const authorId = parseInt(req.params.authorId);
    const posts = Database.all(
      'SELECT cp.*, c.name as class_name FROM class_posts cp LEFT JOIN classes c ON cp.class_id = c.id WHERE cp.author_id = ? ORDER BY cp.is_pinned DESC, cp.created_at DESC',
      [authorId]
    );
    
    const postIds = posts.map(p => p.id);
    let mediaList = [];
    if (postIds.length > 0) {
      const placeholders = postIds.map(() => '?').join(',');
      mediaList = Database.all(
        `SELECT * FROM class_post_media WHERE post_id IN (${placeholders}) ORDER BY sort_order, id`,
        postIds
      );
    }
    
    const postsWithMedia = posts.map(post => ({
      ...post,
      media: mediaList.filter(m => m.post_id === post.id)
    }));
    
    res.json({ success: true, data: postsWithMedia });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 获取所有班级（用于选择发布到哪个班级）
router.get('/options/classes', (req, res) => {
  try {
    const classes = Database.all('SELECT c.*, g.name as grade_name FROM classes c LEFT JOIN grades g ON c.grade_id = g.id ORDER BY g.sort_order, c.id');
    res.json({ success: true, data: classes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
