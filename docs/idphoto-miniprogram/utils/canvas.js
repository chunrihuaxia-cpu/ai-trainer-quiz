// Canvas 图片处理工具

/**
 * 获取 Canvas 2D 节点和上下文
 * @param {string} selector - Canvas 选择器
 * @returns {Promise<{canvas: object, ctx: CanvasRenderingContext2D}>}
 */
function getCanvas2D(selector) {
  return new Promise((resolve, reject) => {
    const query = wx.createSelectorQuery();
    query.select(selector)
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res || !res[0] || !res[0].node) {
          reject(new Error('Canvas 节点未找到'));
          return;
        }
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        resolve({ canvas, ctx });
      });
  });
}

/**
 * 加载图片到 Image 对象
 */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = { src }; // 微信小程序中 Canvas 2D 用 canvas.createImage()
    resolve({ src });
  });
}

/**
 * 创建 Canvas Image 对象
 */
function createCanvasImage(canvas, src) {
  return new Promise((resolve, reject) => {
    const img = canvas.createImage();
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error('图片加载失败: ' + (err?.errMsg || 'unknown')));
    img.src = src;
  });
}

/**
 * 将 base64 转为 ArrayBuffer
 */
function base64ToArrayBuffer(base64) {
  const binaryStr = wx.base64ToArrayBuffer(base64);
  return binaryStr;
}

/**
 * 将 ArrayBuffer 转为 base64
 */
function arrayBufferToBase64(buffer) {
  return wx.arrayBufferToBase64(buffer);
}

/**
 * 保存 Canvas 内容为临时图片
 * @param {object} canvas - Canvas 节点
 * @returns {Promise<string>} 临时文件路径
 */
function canvasToTempFile(canvas) {
  return new Promise((resolve, reject) => {
    wx.canvasToTempFilePath({
      canvas,
      destWidth: canvas.width,
      destHeight: canvas.height,
      fileType: 'png',
      quality: 1,
      success: (res) => resolve(res.tempFilePath),
      fail: reject
    });
  });
}

module.exports = {
  getCanvas2D,
  createCanvasImage,
  canvasToTempFile,
  base64ToArrayBuffer,
  arrayBufferToBase64
};
