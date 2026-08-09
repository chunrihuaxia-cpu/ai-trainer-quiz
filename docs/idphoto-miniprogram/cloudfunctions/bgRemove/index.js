// 云函数: 调用百度AI人像分割 + 返回透明底图
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

// ── 百度 AI 配置（从云函数环境变量读取，或直接替换为你的 key）──
const BAIDU_API_KEY    = process.env.BAIDU_API_KEY    || '0mXlUwyP0gdeWA3NOBcg00kV';
const BAIDU_SECRET_KEY = process.env.BAIDU_SECRET_KEY || 'Ee4h9alLUwbh7RX4i2ZIzhf564eH6mS7';

let cachedToken = null;
let tokenExpires = 0;

/**
 * 获取百度 AI access_token（缓存至过期前5分钟）
 */
async function getBaiduToken() {
  if (cachedToken && Date.now() < tokenExpires) {
    return cachedToken;
  }

  const result = await cloud.callFunction({
    name: 'urlFetch',
    data: {}
  });

  // 直接用 cloud.openapi 做 HTTP 请求（不支持时 fallback 到 http 模块）
  const https = require('https');

  return new Promise((resolve, reject) => {
    const url = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${BAIDU_API_KEY}&client_secret=${BAIDU_SECRET_KEY}`;

    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.access_token) {
            cachedToken = json.access_token;
            tokenExpires = Date.now() + (json.expires_in - 300) * 1000; // 提前5分钟过期
            resolve(cachedToken);
          } else {
            reject(new Error('百度 token 获取失败: ' + JSON.stringify(json)));
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

/**
 * 调用百度 AI 人像分割 body_seg
 * @param {string} imageBase64 - 图片 base64 数据（不含前缀）
 * @returns {object} { labelmap, scoremap, foreground }
 */
async function callBaiduBodySeg(imageBase64) {
  const token = await getBaiduToken();
  const url = `https://aip.baidubce.com/rest/2.0/image-classify/v1/body_seg?access_token=${token}`;

  return new Promise((resolve, reject) => {
    const https = require('https');
    const postData = `image=${encodeURIComponent(imageBase64)}`;
    const fullUrl = `https://aip.baidubce.com/rest/2.0/image-classify/v1/body_seg?access_token=${token}`;
    const urlObj = new (require('url')).URL(fullUrl);

    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      timeout: 15000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error_code) {
            reject(new Error(`百度API错误 [${json.error_code}]: ${json.error_msg}`));
          } else {
            resolve(json);
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('百度API请求超时')); });

    req.write(postData);
    req.end();
  });
}

/**
 * 云函数入口
 * 入参: { fileID: string }  云存储文件 ID
 * 出参: { success: true, foreground: string }  base64 人像前景图
 */
exports.main = async (event, context) => {
  const { fileID } = event;

  if (!fileID) {
    return { success: false, error: '缺少 fileID 参数' };
  }

  try {
    // 1. 从云存储下载图片
    const downloadResult = await cloud.downloadFile({ fileID });
    const imageBuffer = downloadResult.fileContent;

    // 2. 转 base64
    const imageBase64 = imageBuffer.toString('base64');

    // 3. 调用百度AI人像分割
    const segResult = await callBaiduBodySeg(imageBase64);

    // 百度返回 labelmap (png base64), scoremap, foreground (png base64)
    return {
      success: true,
      foreground: segResult.foreground,    // PNG base64 人像前景（透明底）
      labelmap: segResult.labelmap,         // 灰度图（可用做 mask）
      scoremap: segResult.scoremap          // 置信度图
    };

  } catch (err) {
    console.error('bgRemove error:', err);
    return {
      success: false,
      error: err.message || '人像分割失败'
    };
  }
};
