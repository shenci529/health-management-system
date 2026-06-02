const { chromium } = require('playwright');

async function demonstrateHealthSystem() {
  console.log('🚀 开始健康管理系统自动化演示...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. 访问登录页面
    console.log('📍 步骤1: 访问系统首页');
    await page.goto('http://localhost:3004');
    await page.waitForLoadState('networkidle');
    console.log('✅ 登录页面已打开\n');

    // 2. 等待页面加载
    await page.waitForTimeout(1000);

    // 3. 选择管理员角色
    console.log('📍 步骤2: 选择"校级管理员"角色');
    const adminCard = page.locator('.role-card').first();
    await adminCard.click();
    await page.waitForTimeout(500);
    console.log('✅ 已选择管理员角色\n');

    // 4. 点击登录按钮
    console.log('📍 步骤3: 点击登录按钮');
    const loginButton = page.locator('button:has-text("登录系统")');
    await loginButton.click();
    await page.waitForTimeout(1000);
    console.log('✅ 登录成功，进入仪表盘\n');

    // 5. 等待仪表盘加载
    await page.waitForSelector('.el-container', { timeout: 5000 });
    console.log('📍 步骤4: 仪表盘已加载');
    console.log('✅ 系统主界面已显示\n');

    // 6. 演示各个功能模块
    console.log('📍 步骤5: 开始演示各个功能模块\n');
    console.log('=' .repeat(50));

    const menuItems = [
      { name: '用户管理', icon: '👤' },
      { name: '角色管理', icon: '🎭' },
      { name: '班级年级管理', icon: '🏫' },
      { name: '过敏史管理', icon: '⚠️' },
      { name: '体检管理', icon: '🏥' },
      { name: '视力体态', icon: '👁️' },
      { name: '口腔健康', icon: '🦷' },
      { name: '疫苗管理', icon: '💉' },
      { name: '食谱管理', icon: '🍽️' },
      { name: '体育活动', icon: '⚽' },
      { name: '安全教育', icon: '📚' },
      { name: '心理健康', icon: '🧠' },
      { name: '数据看板', icon: '📊' },
      { name: '健康报告', icon: '📈' },
      { name: '公告管理', icon: '📢' },
    ];

    for (let i = 0; i < Math.min(menuItems.length, 8); i++) {
      const item = menuItems[i];
      console.log(`${item.icon} 演示功能: ${item.name}`);

      // 尝试点击菜单项（使用部分匹配）
      const menuItem = page.locator(`.el-menu-item, .el-submenu__title`).filter({ hasText: item.name }).first();

      if (await menuItem.count() > 0) {
        await menuItem.click();
        await page.waitForTimeout(800);
        console.log(`✅ ${item.name} 功能已打开\n`);
      } else {
        console.log(`⚠️ 未找到 ${item.name} 菜单\n`);
      }
    }

    console.log('=' .repeat(50));
    console.log('\n🎉 演示完成！\n');

    // 7. 返回首页
    console.log('📍 返回仪表盘首页');
    const dashboardLink = page.locator('.el-menu-item').filter({ hasText: '首页' }).first();
    if (await dashboardLink.count() > 0) {
      await dashboardLink.click();
      await page.waitForTimeout(500);
    }
    console.log('✅ 已返回首页\n');

    // 8. 切换角色演示
    console.log('📍 步骤6: 演示切换角色');
    console.log('切换到"教师"角色演示...\n');

    // 点击用户头像或退出按钮
    const logoutButton = page.locator('button:has-text("退出"), button:has-text("Logout"), .el-dropdown-menu__item').filter({ hasText: '退出' });

    if (await logoutButton.count() > 0) {
      await logoutButton.click();
      await page.waitForTimeout(500);
    }

    console.log('✅ 教师端功能演示结束\n');

    // 9. 总结
    console.log('=' .repeat(50));
    console.log('\n📋 系统演示总结：\n');
    console.log('✅ 后端API服务: http://localhost:3002');
    console.log('✅ 前端Web服务: http://localhost:3004');
    console.log('✅ 数据库: SQLite (server/database/health_management.db)');
    console.log('\n🎯 可用角色:');
    console.log('   • 校级管理员 - 拥有所有管理权限');
    console.log('   • 教师 - 班级健康管理和教学功能');
    console.log('   • 家长 - 子女健康查看和家校沟通');
    console.log('   • 学生 - 健康打卡和任务完成');
    console.log('   • 校医 - 健康异常处理和医疗管理');
    console.log('\n📚 学习资源:');
    console.log('   • 详细文档: README_超级详细版.md');
    console.log('   • 演示指南: DEMO_GUIDE.md');
    console.log('\n' + '=' .repeat(50));

  } catch (error) {
    console.error('❌ 演示过程中出现错误:', error.message);
    console.log('\n提示：请确保前端服务已启动（npm run dev）');
  } finally {
    console.log('\n按任意键关闭浏览器...');
    await page.waitForTimeout(2000);
    await browser.close();
    console.log('✅ 浏览器已关闭，演示结束！');
  }
}

// 运行演示
demonstrateHealthSystem();
