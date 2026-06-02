# 微信公众号本地测试指南

本文档说明如何在本地开发环境中测试微信公众号功能。

## 📋 准备工作

### 1. 安装Node.js
确保你的电脑已安装Node.js（包含npm）：
- 下载地址：https://nodejs.org/
- 推荐安装LTS版本（长期支持版）

### 2. 安装依赖
运行以下命令安装项目依赖：
```bash
# 使用PowerShell
.\setup.ps1

# 或使用CMD
start.bat
```

## 🚀 启动开发服务器

### 方法一：使用脚本启动（推荐）
```bash
# PowerShell
.\setup.ps1

# 或CMD
start.bat
```

### 方法二：手动启动
```bash
# 设置环境变量
$env:Path = "C:\Program Files\nodejs;$env:Path"

# 安装依赖
npm install

# 启动服务器
npm run dev
```

### 方法三：使用完整路径
```bash
# 安装依赖
"C:\Program Files\nodejs\npm.cmd" install

# 启动服务器
"C:\Program Files\nodejs\npm.cmd" run dev
```

## 🌐 配置内网穿透

由于微信公众号要求使用HTTPS和外网可访问的域名，你需要配置内网穿透。

### 选项一：ngrok（推荐，免费）

#### 1. 下载ngrok
访问 https://ngrok.com/download 下载Windows版本

#### 2. 注册账号并获取Authtoken
- 访问 https://ngrok.com 注册账号
- 登录后在Dashboard复制你的authtoken

#### 3. 配置ngrok
```bash
# 添加authtoken
ngrok config add-authtoken 你的token

# 启动ngrok转发本地3000端口
ngrok http 3000
```

#### 4. 使用ngrok提供的URL
启动后会显示类似：
```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:3000
```
复制 `https://abc123.ngrok-free.app` 这个地址。

### 选项二：natapp（国内服务）

#### 1. 下载natapp
访问 https://natapp.cn 下载客户端

#### 2. 注册并购买隧道
- 注册账号
- 购买隧道（推荐选择免费隧道）
- 获取authtoken

#### 3. 配置并启动
```bash
# Windows
natapp.exe -authtoken=你的token

# 或创建配置文件 natapp.cfg
[config]
authtoken=你的token
```

### 选项三：花生壳

#### 1. 下载花生壳
访问 https://hsk.oray.com/download 下载

#### 2. 注册账号并登录

#### 3. 添加内网穿透规则
- 内网主机：127.0.0.1
- 内网端口：3000

## 📱 在微信公众号中测试

### 1. 配置公众号后台

登录微信公众平台 https://mp.weixin.qq.com/

#### 设置网页授权域名
1. 进入 **设置与开发** → **公众号设置**
2. 点击 **功能设置**
3. 在 **网页授权域名** 中添加你的ngrok/natapp域名
   - 例如：`abc123.ngrok-free.app`

#### 添加自定义菜单（可选）
1. 进入 **内容与互动** → **自定义菜单**
2. 添加菜单，类型选择 **网页**
3. 链接地址填写你的公网URL
   - 例如：`https://abc123.ngrok-free.app`

### 2. 访问测试

#### 方法一：通过菜单访问
在公众号底部菜单点击你的菜单项

#### 方法二：通过链接访问
在公众号对话框发送链接：
```
https://abc123.ngrok-free.app
```

#### 方法三：扫码访问
使用二维码生成工具生成二维码：
```
https://abc123.ngrok-free.app
```

## ⚠️ 注意事项

### 常见问题

1. **ngrok连接不稳定**
   - 免费版每8小时需要重新连接
   - 建议注册账号获取更稳定的连接

2. **微信授权失败**
   - 确保已正确配置授权域名
   - 域名必须使用HTTPS

3. **页面显示空白**
   - 检查浏览器控制台是否有错误
   - 确保服务正常运行

### 安全建议

- 仅用于开发和测试
- 不要在公网暴露敏感数据
- 测试完成后及时停止ngrok

## 🔧 调试技巧

### 使用微信开发者工具
1. 下载微信开发者工具：https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html
2. 导入项目，选择 **公众号网页**
3. 粘贴你的ngrok URL进行调试

### 检查网络请求
- 打开浏览器开发者工具（F12）
- 切换到Network标签
- 查看请求和响应

## 📞 获取帮助

如果遇到问题：
1. 检查ngrok/natapp是否正常运行
2. 确认微信公众号后台配置正确
3. 查看浏览器控制台错误信息

## 🎯 快速测试流程

1. ✅ 启动开发服务器（`npm run dev`）
2. ✅ 启动ngrok（`ngrok http 3000`）
3. ✅ 复制ngrok提供的HTTPS地址
4. ✅ 在微信公众号配置授权域名
5. ✅ 在公众号中访问测试

祝你测试顺利！
