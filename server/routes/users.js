// 引入需要的模块
const express = require('express');
const router = express.Router(); // 创建一个路由实例
const { Database } = require('../database/db'); // 引入封装好的数据库操作类
const bcrypt = require('bcryptjs'); // 引入密码加密库

// ==================== API接口1：获取所有用户列表 ====================
// 请求方式：GET
// 请求路径：/
// 功能：查询数据库中所有用户（不包含密码字段）
router.get('/', async (req, res) => {
  try {
    // 执行SQL查询：从users表中获取指定字段，按id排序
    const users = await Database.all(
      'SELECT id, username, real_name, role, gender, age, phone, email, status, created_at FROM users ORDER BY id'
    );
    // 返回成功响应
    res.json({ success: true, data: users });
  } catch (error) {
    // 捕获异常，返回失败响应
    res.status(500).json({ success: false, message: '获取用户列表失败', error: error.message });
  }
});

// ==================== API接口2：获取单个用户详情 ====================
// 请求方式：GET
// 请求路径：/:id（id是用户ID，通过URL参数传递）
// 功能：根据用户ID查询单个用户的详细信息
router.get('/:id', async (req, res) => {
  try {
    // req.params.id 是从URL中获取的用户ID
    const user = await Database.get(
      'SELECT id, username, real_name, role, gender, age, phone, email, status, created_at FROM users WHERE id = ?',
      [req.params.id]
    );
    // 如果用户不存在
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    // 如果用户存在，返回用户数据
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取用户失败', error: error.message });
  }
});

// ==================== API接口3：创建新用户 ====================
// 请求方式：POST
// 请求路径：/
// 功能：向数据库中插入一个新用户
router.post('/', async (req, res) => {
  try {
    // 从请求体中获取用户提交的数据（req.body）
    const { username, password, role, real_name, gender, age, phone, email } = req.body;
    
    // 【第一步】先检查用户名是否已存在（避免重复用户名）
    const existingUser = await Database.get('SELECT id FROM users WHERE username = ?', [username]);
    if (existingUser) {
      return res.status(400).json({ success: false, message: '用户名已存在' });
    }
    
    // 【第二步】对密码进行加密（不能存储明文密码！）
    // 如果用户没传密码，默认密码是123456
    const hashedPassword = await bcrypt.hash(password || '123456', 10); // 10是加密强度
    
    // 【第三步】执行插入操作，将新用户保存到数据库
    const result = await Database.run(
      'INSERT INTO users (username, password, role, real_name, gender, age, phone, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [username, hashedPassword, role || 'student', real_name, gender, age, phone, email]
    );
    
    // 返回成功响应，并告诉前端新用户的ID
    res.json({ 
      success: true, 
      message: '用户创建成功', 
      data: { id: result.lastID } // result.lastID是新插入记录的自增ID
    });
  } catch (error) {
    res.status(500).json({ success: false, message: '创建用户失败', error: error.message });
  }
});

// ==================== API接口4：更新用户信息 ====================
// 请求方式：PUT
// 请求路径：/:id
// 功能：根据用户ID，更新该用户的信息
router.put('/:id', async (req, res) => {
  try {
    const { real_name, gender, age, phone, email, role, status } = req.body;
    
    // 【第一步】先检查要更新的用户是否存在
    const user = await Database.get('SELECT id FROM users WHERE id = ?', [req.params.id]);
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    
    // 【第二步】执行更新操作
    await Database.run(
      'UPDATE users SET real_name = ?, gender = ?, age = ?, phone = ?, email = ?, role = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [real_name, gender, age, phone, email, role, status, req.params.id]
    );
    
    // 返回成功响应
    res.json({ success: true, message: '用户更新成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '更新用户失败', error: error.message });
  }
});

// ==================== API接口5：删除用户 ====================
// 请求方式：DELETE
// 请求路径：/:id
// 功能：根据用户ID，从数据库中删除该用户
router.delete('/:id', async (req, res) => {
  try {
    // 执行删除操作
    const result = await Database.run('DELETE FROM users WHERE id = ?', [req.params.id]);
    // result.changes 表示受影响的行数，如果是0说明没找到这个用户
    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    res.json({ success: true, message: '用户删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '删除用户失败', error: error.message });
  }
});

// ==================== API接口6：用户登录 ====================
// 请求方式：POST
// 请求路径：/login
// 功能：验证用户名和密码，登录成功后返回用户信息
router.post('/login', async (req, res) => {
  try {
    // 从请求体中获取用户名和密码
    const { username, password } = req.body;
    
    // 【第一步】根据用户名查找用户
    const user = await Database.get('SELECT * FROM users WHERE username = ?', [username]);
    if (!user) {
      // 没找到用户，返回401错误（未授权）
      return res.status(401).json({ success: false, message: '用户名或密码错误' });
    }
    
    // 【第二步】验证密码是否正确
    // 说明：兼容两种情况——有的密码是加密后的，有的是明文（为了兼容演示数据）
    let isValid = false;
    if (user.password.startsWith('$2b$')) {
      // 如果密码是bcrypt加密的（以$2b$开头），用bcrypt.compare验证
      isValid = await bcrypt.compare(password, user.password);
    } else {
      // 否则直接明文对比（仅用于演示，生产环境不要这样！）
      isValid = user.password === password;
    }
    
    if (!isValid) {
      return res.status(401).json({ success: false, message: '用户名或密码错误' });
    }
    
    // 【第三步】检查账号状态是否正常（status=1表示正常）
    if (user.status !== 1) {
      return res.status(403).json({ success: false, message: '账号已被禁用' });
    }
    
    // 【第四步】返回用户信息（重要：不要把密码返回给前端！）
    // 这里用了对象解构，把password字段提取出来赋值给_（忽略），剩下的放在userInfo里
    const { password: _, ...userInfo } = user;
    res.json({ 
      success: true, 
      message: '登录成功', 
      data: userInfo 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: '登录失败', error: error.message });
  }
});

// 导出这个路由模块，供server.js引用
module.exports = router;
