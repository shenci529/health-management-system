@echo off
set PATH=C:\Program Files\nodejs;%PATH%
cd /d "c:\Users\13194652066\Desktop\幼儿中小学生健康管理系统"
echo 安装依赖中...
npm install
echo 启动服务器...
npm run dev