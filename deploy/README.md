# 健康管理系统 - 部署文档

## 📋 系统要求

- **服务器配置**: 4核CPU + 8GB内存 + 10Mbps带宽
- **操作系统**: Ubuntu 20.04 LTS / CentOS 7+
- **并发支持**: 400人同时访问
- **域名**: 可选，可直接使用IP访问

---

## 🚀 一键部署步骤

### 1. 购买云服务器

推荐平台：
- 阿里云ECS: https://www.aliyun.com
- 腾讯云CVM: https://cloud.tencent.com
- 华为云ECS: https://www.huaweicloud.com

**配置选择**:
- 实例规格: 4核8G
- 带宽: 10Mbps
- 系统盘: 50GB SSD
- 操作系统: Ubuntu 20.04 LTS

### 2. 连接服务器

```bash
# Windows使用PowerShell或Git Bash
ssh root@你的服务器IP

# 输入密码登录
```

### 3. 上传项目文件

**方式一：使用scp命令**
```bash
# 在本地项目目录执行
scp -r . root@你的服务器IP:/root/health-management/
```

**方式二：使用FTP工具**
- 安装FileZilla
- 连接服务器SFTP
- 上传项目文件到 `/root/health-management/`

### 4. 运行部署脚本

```bash
# 进入项目目录
cd /root/health-management

# 给脚本执行权限
chmod +x deploy/install.sh

# 运行部署脚本（使用IP访问）
sudo ./deploy/install.sh

# 或者使用域名
sudo ./deploy/install.sh your-domain.com
```

### 5. 等待部署完成

脚本会自动完成：
- ✅ 系统更新
- ✅ 安装Node.js 16
- ✅ 安装Nginx
- ✅ 安装PM2
- ✅ 安装项目依赖
- ✅ 构建生产环境
- ✅ 配置Nginx
- ✅ 启动服务

预计耗时：5-10分钟

---

## 🔧 常用运维命令

### 查看服务状态
```bash
# 查看PM2状态
pm2 status

# 查看Nginx状态
systemctl status nginx

# 查看实时日志
pm2 logs

# 查看Nginx访问日志
tail -f /var/www/health-management/logs/nginx-access.log
```

### 重启服务
```bash
# 重启应用
pm2 restart health-management

# 重启Nginx
systemctl restart nginx

# 重载Nginx配置
nginx -s reload
```

### 更新代码
```bash
# 进入项目目录
cd /var/www/health-management

# 拉取最新代码（如果是git仓库）
git pull

# 重新构建
npm run build

# 重启服务
pm2 restart health-management
```

---

## 🌐 配置域名（可选）

### 1. 域名解析
在域名管理平台添加A记录：
- 主机记录: @ 或 www
- 记录值: 你的服务器IP

### 2. 修改Nginx配置
```bash
# 编辑配置文件
nano /etc/nginx/sites-available/health-management

# 修改 server_name
server_name your-domain.com www.your-domain.com;

# 测试配置
nginx -t

# 重载Nginx
nginx -s reload
```

### 3. 配置HTTPS（推荐）
```bash
# 安装Certbot
apt-get install -y certbot python3-certbot-nginx

# 申请SSL证书
certbot --nginx -d your-domain.com

# 自动续期测试
certbot renew --dry-run
```

---

## 📊 性能监控

### 查看并发连接数
```bash
# 当前并发数
netstat -an | grep :80 | wc -l

# Nginx连接状态
ss -ant | grep :80
```

### 查看服务器资源
```bash
# CPU和内存
top

# 磁盘空间
df -h

# 内存详情
free -h
```

---

## 🛡️ 安全建议

### 1. 修改SSH端口
```bash
# 编辑SSH配置
nano /etc/ssh/sshd_config

# 修改Port为其他端口，如 2222
Port 2222

# 重启SSH
systemctl restart sshd
```

### 2. 配置防火墙
```bash
# 安装ufw
apt-get install -y ufw

# 允许HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# 允许SSH（如果改了端口）
ufw allow 2222/tcp

# 启用防火墙
ufw enable
```

### 3. 定期备份
```bash
# 创建备份脚本
cat > /root/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d)
tar -czf /root/backup-$DATE.tar.gz /var/www/health-management/dist
EOF

# 添加定时任务
crontab -e
# 添加：0 2 * * * /root/backup.sh
```

---

## ❓ 常见问题

### Q1: 部署后无法访问
```bash
# 检查Nginx是否运行
systemctl status nginx

# 检查端口是否监听
netstat -tlnp | grep :80

# 检查防火墙
ufw status
```

### Q2: 页面显示空白
```bash
# 检查dist目录是否存在
ls -la /var/www/health-management/dist

# 检查Nginx错误日志
tail -f /var/www/health-management/logs/nginx-error.log
```

### Q3: 修改代码后未生效
```bash
# 重新构建
cd /var/www/health-management
npm run build

# 重启服务
pm2 restart health-management
```

---

## 📞 技术支持

如有问题，请检查：
1. 服务器是否满足最低配置要求
2. 部署脚本是否有报错信息
3. 日志文件中的错误详情

---

## 📁 部署文件说明

```
deploy/
├── install.sh          # 一键部署脚本
├── nginx.conf          # Nginx配置模板
├── ecosystem.config.js # PM2配置
└── README.md           # 本文档
```

部署完成后，访问 `http://你的服务器IP` 即可使用系统。
