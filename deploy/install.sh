#!/bin/bash

# ============================================
# 健康管理系统 - 一键部署脚本
# 适用于：400人同时访问
# 服务器配置：4核8G + 10Mbps
# ============================================

set -e

echo "=========================================="
echo "  健康管理系统部署脚本"
echo "=========================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置变量
PROJECT_NAME="health-management"
PROJECT_DIR="/var/www/$PROJECT_NAME"
NGINX_CONF="/etc/nginx/sites-available/$PROJECT_NAME"
DOMAIN="${1:-localhost}"

# 检查root权限
if [ "$EUID" -ne 0 ]; then
   echo -e "${RED}请使用 sudo 运行此脚本${NC}"
   exit 1
fi

echo -e "${YELLOW}[1/8] 更新系统...${NC}"
apt-get update -y
apt-get upgrade -y

echo -e "${YELLOW}[2/8] 安装Node.js 16...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
    apt-get install -y nodejs
fi
node -v
npm -v

echo -e "${YELLOW}[3/8] 安装Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    apt-get install -y nginx
fi
nginx -v

echo -e "${YELLOW}[4/8] 安装PM2...${NC}"
npm install -g pm2
pm2 -v

echo -e "${YELLOW}[5/8] 创建项目目录...${NC}"
mkdir -p $PROJECT_DIR
mkdir -p $PROJECT_DIR/logs

# 如果当前目录有项目文件，复制过去
if [ -f "package.json" ]; then
    echo -e "${YELLOW}复制项目文件...${NC}"
    cp -r . $PROJECT_DIR/
else
    echo -e "${RED}错误：请在项目根目录运行此脚本${NC}"
    exit 1
fi

echo -e "${YELLOW}[6/8] 安装项目依赖并构建...${NC}"
cd $PROJECT_DIR
npm install
npm run build

echo -e "${YELLOW}[7/8] 配置Nginx...${NC}"
cat > $NGINX_CONF << EOF
server {
    listen 80;
    server_name $DOMAIN;
    root $PROJECT_DIR/dist;
    index index.html;

    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header X-Content-Type-Options "nosniff";
    }

    # 前端路由支持
    location / {
        try_files \$uri \$uri/ /index.html;
        add_header X-Frame-Options "SAMEORIGIN";
        add_header X-Content-Type-Options "nosniff";
        add_header X-XSS-Protection "1; mode=block";
    }

    # 日志
    access_log $PROJECT_DIR/logs/nginx-access.log;
    error_log $PROJECT_DIR/logs/nginx-error.log;
}
EOF

# 启用配置
ln -sf $NGINX_CONF /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 测试Nginx配置
nginx -t

# 重启Nginx
systemctl restart nginx
systemctl enable nginx

echo -e "${YELLOW}[8/8] 配置PM2...${NC}"
cat > $PROJECT_DIR/ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '$PROJECT_NAME',
    script: 'npm',
    args: 'run preview',
    cwd: '$PROJECT_DIR',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    log_file: '$PROJECT_DIR/logs/combined.log',
    out_file: '$PROJECT_DIR/logs/out.log',
    error_file: '$PROJECT_DIR/logs/error.log',
    time: true,
    max_memory_restart: '500M',
    restart_delay: 3000,
    max_restarts: 5,
    min_uptime: '10s'
  }]
};
EOF

# 启动PM2
cd $PROJECT_DIR
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root

echo ""
echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}  部署完成！${NC}"
echo -e "${GREEN}==========================================${NC}"
echo ""
echo "访问地址: http://$DOMAIN"
echo "项目目录: $PROJECT_DIR"
echo "日志目录: $PROJECT_DIR/logs"
echo ""
echo "常用命令:"
echo "  pm2 status          - 查看应用状态"
echo "  pm2 logs            - 查看日志"
echo "  pm2 restart health  - 重启应用"
echo "  nginx -t            - 测试Nginx配置"
echo "  nginx -s reload     - 重载Nginx"
echo ""
