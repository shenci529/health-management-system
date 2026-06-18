/**
 * 短信服务模块 - 阿里云短信服务
 * 
 * 使用方法：
 * 1. 安装依赖：npm install @alicloud/dysmsapi20170525
 * 2. 配置环境变量或修改下面的配置
 * 3. 调用 sendVerifyCode(手机号, 验证码) 发送短信
 */

const Dysmsapi = require('@alicloud/dysmsapi20170525');
const OpenApi = require('@alicloud/openapi-client');
const Util = require('@alicloud/tea-util');

// ============================================
// 配置信息 - 请填写您的阿里云配置
// ============================================
const config = {
  // 阿里云 AccessKey ID（从阿里云控制台获取）
  accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID || '您的AccessKeyId',
  
  // 阿里云 AccessKey Secret（从阿里云控制台获取）
  accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET || '您的AccessKeySecret',
  
  // 短信签名名称（必须在阿里云已审核通过）
  signName: process.env.ALIYUN_SMS_SIGN_NAME || '健康管理系统',
  
  // 短信模板CODE（必须在阿里云已审核通过）
  templateCode: process.env.ALIYUN_SMS_TEMPLATE_CODE || 'SMS_xxxxxx'
};

// 创建阿里云客户端
let client = null;

function createClient() {
  try {
    const openApiConfig = new OpenApi.Config({
      accessKeyId: config.accessKeyId,
      accessKeySecret: config.accessKeySecret
    });
    openApiConfig.endpoint = 'dysmsapi.aliyuncs.com';
    client = new Dysmsapi(openApiConfig);
    return client;
  } catch (error) {
    console.error('创建阿里云短信客户端失败:', error.message);
    return null;
  }
}

/**
 * 发送短信验证码
 * @param {string} phone - 手机号（需要带国际区号，国内为86开头或纯数字）
 * @param {string} code - 验证码
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function sendVerifyCode(phone, code) {
  // 检查配置是否已修改
  if (config.accessKeyId === '您的AccessKeyId' || 
      config.accessKeySecret === '您的AccessKeySecret' ||
      config.templateCode === 'SMS_xxxxxx') {
    console.warn('⚠️ 阿里云短信未配置，使用模拟模式');
    return {
      success: true,
      message: '模拟短信已发送（验证码：' + code + '）',
      mock: true
    };
  }
  
  try {
    if (!client) {
      createClient();
    }
    
    if (!client) {
      throw new Error('短信客户端初始化失败');
    }
    
    const sendSmsRequest = new Dysmsapi.SendSmsRequest({
      phoneNumbers: phone,
      signName: config.signName,
      templateCode: config.templateCode,
      templateParam: JSON.stringify({ code: code })
    });
    
    const runtime = new Util.RuntimeOptions({});
    
    const result = await client.sendSmsWithOptions(sendSmsRequest, runtime);
    
    if (result.body.code === 'OK') {
      console.log('✅ 短信发送成功:', phone, 'Code:', code);
      return {
        success: true,
        message: '短信发送成功',
        requestId: result.body.requestId
      };
    } else {
      console.error('❌ 短信发送失败:', result.body.code, result.body.message);
      return {
        success: false,
        message: result.body.message || '短信发送失败'
      };
    }
  } catch (error) {
    console.error('❌ 短信发送异常:', error.message);
    return {
      success: false,
      message: '短信发送失败: ' + error.message
    };
  }
}

/**
 * 验证手机号格式
 * @param {string} phone - 手机号
 * @returns {boolean}
 */
function isValidPhone(phone) {
  // 中国大陆手机号格式：1开头，11位数字
  const phoneRegex = /^(86)?1[3-9]\d{9}$/;
  return phoneRegex.test(String(phone));
}

/**
 * 生成随机验证码
 * @param {number} length - 验证码长度，默认6位
 * @returns {string}
 */
function generateCode(length = 6) {
  const code = Math.floor(Math.random() * Math.pow(10, length));
  return String(code).padStart(length, '0');
}

module.exports = {
  sendVerifyCode,
  isValidPhone,
  generateCode,
  config
};
