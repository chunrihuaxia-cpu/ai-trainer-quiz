// 云函数调用封装

/**
 * 调用 bgRemove 云函数，进行人像分割
 * @param {string} fileID - 云存储文件 ID
 * @returns {Promise<{foreground: string}>} base64 人像前景
 */
async function removeBackground(fileID) {
  try {
    const res = await wx.cloud.callFunction({
      name: 'bgRemove',
      data: { fileID }
    });

    if (res.result && res.result.success) {
      return res.result;
    } else {
      throw new Error(res.result?.error || '人像分割失败');
    }
  } catch (err) {
    console.error('云函数调用失败:', err);
    throw err;
  }
}

/**
 * 上传图片到云存储
 * @param {string} filePath - 本地临时文件路径
 * @returns {Promise<string>} 云存储 fileID
 */
async function uploadImage(filePath) {
  const cloudPath = `idphoto/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;
  const res = await wx.cloud.uploadFile({
    cloudPath,
    filePath
  });
  return res.fileID;
}

module.exports = { removeBackground, uploadImage };
