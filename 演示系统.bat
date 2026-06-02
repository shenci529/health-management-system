@echo off
chcp 65001 > nul
echo ========================================
echo   幼儿中小学生健康管理系统 - 功能演示
echo ========================================
echo.

echo [1/8] 检查系统状态...
echo.
echo    后端API服务: http://localhost:3002
echo    前端Web应用: http://localhost:3004
echo    数据库: 已初始化（24张表）
echo.

echo [2/8] 打开浏览器演示...
start http://localhost:3004
echo.

echo [3/8] 演示登录流程...
echo.
echo    步骤1: 访问 http://localhost:3004
echo    步骤2: 选择角色（管理员/教师/家长/学生/校医）
echo    步骤3: 输入密码: 123456
echo    步骤4: 点击登录按钮
echo.

echo [4/8] 演示管理员功能（24个模块）...
echo.
echo    1. 用户管理 - 增删改查用户
echo    2. 角色管理 - 设置不同角色权限
echo    3. 班级年级管理 - 管理学校组织架构
echo    4. 健康档案中心
echo       - 过敏史管理
echo       - 体检管理
echo       - 视力体态
echo       - 口腔健康
echo       - 疫苗管理
echo    5. 校园健康管控
echo       - 健康看板
echo       - 缺勤追踪
echo       - 疾病预警
echo    6. 膳食营养管理
echo       - 食谱管理
echo       - 就餐记录
echo       - 营养分析
echo    7. 体育活动管理
echo       - 体育活动
echo       - 排行榜
echo    8. 健康教育资源
echo       - 课件管理
echo       - 季节性科普
echo       - 安全教育
echo    9. 数据统计报表
echo       - 健康数据仪表盘
echo       - 健康报告
echo       - 归档导出
echo    10. 消息中心
echo       - 公告管理
echo       - 推送消息
echo       - 咨询管理
echo.

echo [5/8] 演示角色切换...
echo.
echo    教师角色:
echo       - 班级健康看板
echo       - 缺勤登记
echo       - 疾病预警查看
echo       - 任务发布
echo       - 健康作业批改
echo.
echo    家长角色:
echo       - 子女健康查看
echo       - 疫苗管理
echo       - 请假申请
echo       - 亲子打卡
echo.
echo    学生角色:
echo       - 每日健康打卡
echo       - 完成任务
echo       - 积分排行榜
echo       - 活动报名
echo.
echo    校医角色:
echo       - 异常处理
echo       - 隔离管理
echo       - 健康指导
echo.

echo [6/8] 演示后端API...
echo.
echo    API地址: http://localhost:3002
echo.
echo    可用接口:
echo       GET  /api/health              - 健康检查
echo       GET  /api/users               - 用户列表
echo       POST /api/users/login         - 用户登录
echo       POST /api/student/morning-check  - 晨间打卡
echo       POST /api/student/exercise-check - 运动打卡
echo       GET  /api/teacher/class-health   - 班级健康
echo       GET  /api/teacher/disease-warning - 疾病预警
echo       GET  /api/teacher/recipes       - 食谱列表
echo.

echo [7/8] 技术架构说明...
echo.
echo    前端: Vue 2 + ElementUI + ECharts
echo    后端: Express + SQLite
echo    数据库: SQLite 3
echo.

echo [8/8] 代码注释...
echo.
echo    所有代码都添加了详细的中文注释:
echo       - 后端: server/ 目录
echo       - 前端: src/ 目录
echo       - 小程序: miniprogram/ 目录
echo.

echo ========================================
echo   演示完成！
echo ========================================
echo.
echo 下一步操作:
echo   1. 在打开的浏览器中体验系统功能
echo   2. 查看 README_超级详细版.md 学习修改代码
echo   3. 尝试不同的角色登录
echo   4. 测试各个功能模块
echo.
echo 登录账号:
echo   - 管理员: 超级管理员 / 123456
echo   - 教师: 张老师 / 123456
echo   - 家长: 小明妈妈 / 123456
echo   - 学生: 小明 / 123456
echo   - 校医: 李校医 / 123456
echo.
pause
