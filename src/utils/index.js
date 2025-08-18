import store from "@/store/index.js";
import http from "@/http/index.js";
import i18n from "@/i18n/i18n.js";

/*
 * author：Gengbaodada
 * create by date：2024/11/11
 * content：toast全局应用
 */
function toast(title, icon = "none", duration = 3000) {
  if (title == "loading") {
    uni.showLoading({
      title: "加载中",
    });
  } else {
    uni.showToast({
      title,
      icon,
      duration,
    });
  }
}

/*
 * author：Gengbaodada
 * create by date：2024/11/11
 * content：文件上传
 */
async function upload(filePath) {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: "http://driving.asszo.com/api/common/upload", // 上传图片的接口地址
      filePath: filePath, // 要上传的图片路径
      name: "file", // 服务器接收图片的字段名
      header: {
        token: uni.getStorageSync("token")
      },
      formData: {
        // 可以在这里添加额外的表单数据
      },
      success: (res) => {
        resolve(JSON.parse(res.data));
      },
    });
  });
}

/*
 * author：Gengbaodada
 * create by date：2025/07/18
 * content：全局切换语言
 */
function handleLanguage() {
  const newLang = i18n.locale === "en" ? "zh" : "en";
  i18n.locale = newLang;
}

/*
 * author：Gengbaodada
 * create by date：2024/06/07
 * content：格式化uview时间
 */
function handleTime(data) {
  const date = new Date(data);
  return `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
}

function setStore(key, data) {
  if (!key) return;
  uni.setStorageSync(key, data);
}
function getStore(key) {
  if (!key) return;
  return uni.getStorageSync(key);
}
function removeStore(key) {
  if (!key) return;
  uni.removeStorageSync(key);
}
function clearStore() {
  const roleType = uni.getStorageSync("roleType");
  uni.clearStorageSync();
  if (roleType) {
    uni.setStorageSync("roleType", roleType);
  }
}

const utils = {
  clearStore,
  getStore,
  handleTime,
  removeStore,
  setStore,
  toast,
  upload,
  handleLanguage,
};

export default utils;
