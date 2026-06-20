const http = require('http');

console.log('=== 检查端口 3002 ===');
http.get('http://localhost:3002/api/health', (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('✅ 后端已运行:', body);
    console.log('\n=== 测试 GET /api/license ===');
    http.get('http://localhost:3002/api/license', (r2) => {
      let b2 = '';
      r2.on('data', c => b2 += c);
      r2.on('end', () => {
        console.log('  状态码:', r2.statusCode);
        try {
          const d = JSON.parse(b2);
          console.log('  success:', d.success, ', 数据:', d.data ? d.data.length + ' 条' : '无');
          if (d.data && d.data.length > 0) {
            console.log('  第一条: id=' + d.data[0].id + ', formatted_code=' + d.data[0].formatted_code + ', status=' + d.data[0].status);
          }
        } catch (e) {
          console.log('  响应:', b2.substring(0, 200));
        }
        console.log('\n=== 测试 GET /api/license/stats ===');
        http.get('http://localhost:3002/api/license/stats', (r3) => {
          let b3 = '';
          r3.on('data', c => b3 += c);
          r3.on('end', () => {
            console.log('  状态码:', r3.statusCode);
            try {
              const d = JSON.parse(b3);
              console.log('  统计:', JSON.stringify(d.data));
            } catch (e) {
              console.log('  响应:', b3.substring(0, 200));
            }
          });
        }).on('error', (e) => console.log('  失败:', e.message));
      });
    }).on('error', (e) => console.log('  失败:', e.message));
  });
}).on('error', (e) => {
  console.log('❌ 后端未运行:', e.message);
  console.log('  需要启动: node server/server.js 或 node server/server-prod.js');
});
