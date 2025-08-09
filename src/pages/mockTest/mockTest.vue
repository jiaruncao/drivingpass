<template>
  <view class="app">
    <!-- 渐变背景 -->
    <view class="gradient-bg">
      <view class="gradient-top"></view>
      <view class="gradient-bottom"></view>
      <!-- 装饰性圆圈 -->
      <view class="decoration-circle circle-1"></view>
      <view class="decoration-circle circle-2"></view>
    </view>

    <!-- 头部导航 -->
    <view class="header">
      <view class="back-button" @tap="goBack">←</view>
    </view>

    <!-- 主内容区域 -->
    <view class="main-container">
      <!-- 标题区域 -->
      <view class="title-section fade-in">
        <text class="main-title">UK DVSA Theory Test (Mock)</text>
        <text class="subtitle">Immersive DVSA Test‑Day Experience</text>
      </view>

      <!-- 测试类型卡片 -->
      <view class="test-types-container fade-in-delay-1">
        <!-- Multiple-choice card -->
        <view class="test-type-card">
          <text class="test-type-title">Multiple-choice</text>
          <view class="test-type-details">
            <text class="test-type-main">50 questions</text>
            <text class="pass-mark">Pass 43/50</text>
          </view>
        </view>

        <!-- Hazard Perception card -->
        <view class="test-type-card">
          <text class="test-type-title">Hazard Perception</text>
          <view class="test-type-details">
            <text class="test-type-main">14 clips · 15 hazards</text>
            <text class="pass-mark">Pass 44/75</text>
          </view>
        </view>
      </view>

      <!-- 按钮区域 -->
      <view class="buttons-container fade-in-delay-2">
        <view class="primary-button" @tap="startTest">
          <text class="primary-button-text">Start Test</text>
        </view>
        <view class="secondary-button" @tap="viewRecords">
          <text class="secondary-button-text">Your Records</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 测试配置
      testConfig: {
        multipleChoice: {
          questions: 50,
          passMarks: 43,
          timeLimit: 57 // 分钟
        },
        hazardPerception: {
          clips: 14,
          hazards: 15,
          passMarks: 44,
          totalMarks: 75
        }
      }
    }
  },
  onLoad() {
    // 设置页面为横屏模式
    this.setLandscapeMode();
  },
  onShow() {
    // 页面显示时确保横屏
    this.setLandscapeMode();
  },
  methods: {
    // 设置横屏模式
    setLandscapeMode() {
      // #ifdef APP-PLUS
      // APP端强制横屏
      plus.screen.lockOrientation('landscape-primary');
      plus.navigator.setFullscreen(true); // 全屏显示，隐藏状态栏和导航栏
      plus.navigator.hideSystemNavigation(); // 隐藏系统导航栏
      // #endif
      
      // #ifdef H5
      // H5端提示横屏效果更佳
      const systemInfo = uni.getSystemInfoSync();
      if (systemInfo.windowWidth < systemInfo.windowHeight) {
        console.log('建议横屏使用以获得最佳体验');
      }
      // #endif
    },
    
    // 返回上一页
    goBack() {
      console.log('Navigating back');
      // 恢复竖屏（如果需要）
      // #ifdef APP-PLUS
      plus.screen.lockOrientation('portrait-primary');
      // #endif
      
      // 返回到APP主页
      uni.navigateBack({
        delta: 1,
        fail: () => {
          // 如果没有上一页，返回到首页
          uni.switchTab({
            url: '/pages/index/index'
          });
        }
      });
    },
    
    // 开始测试
    startTest() {
      console.log('Starting mock test');
      // 显示测试说明
      this.showTestInstructions();
    },
    
    // 查看记录
    viewRecords() {
      console.log('Viewing test records');
      // 导航到历史记录页面
      uni.navigateTo({
        url: '/pages/records/records'
      });
    },
    
    // 显示测试说明
    showTestInstructions() {
      // 显示测试前的说明和准备事项
      uni.showModal({
        title: 'Test Instructions',
        content: 'You will have 57 minutes to complete 50 multiple-choice questions, followed by 14 hazard perception video clips. You must score at least 43/50 in multiple-choice and 44/75 in hazard perception to pass.',
        confirmText: 'Start',
        cancelText: 'Cancel',
        success: (res) => {
          if (res.confirm) {
            // 开始测试
            this.navigateToTest();
          }
        }
      });
    },
    
    // 导航到测试页面
    navigateToTest() {
      uni.navigateTo({
        url: '/pages/mockTest/test',
        success: () => {
          console.log('导航到多选题测试页面');
        }
      });
    }
  },
  onUnload() {
    // 页面卸载时恢复竖屏
    // #ifdef APP-PLUS
    plus.screen.lockOrientation('portrait-primary');
    // #endif
  }
}
</script>

<style lang="scss">
/* 全局重置样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

// 页面配置为横屏布局
page {
  width: 100%;
  height: 100%;
}

.app {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
  color: #333;
  overflow: hidden;
  // 强制横屏布局比例
  min-height: 375rpx; // 模拟iPhone横屏最小高度
}

/* 渐变背景 */
.gradient-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
}

.gradient-top {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(180deg, #E3F2FD 0%, #FFFFFF 100%);
}

.gradient-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(180deg, #FFFFFF 0%, #FFF4F4 100%);
}

/* Header 样式 */
.header {
  padding: 30rpx 60rpx;
  display: flex;
  align-items: center;
  background: transparent;
  position: relative;
  z-index: 10;
  height: 120rpx;
  box-sizing: border-box;
}

.back-button {
  background: none;
  border: none;
  color: #666;
  font-size: 48rpx;
  padding: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80rpx;
  height: 80rpx;
  transition: opacity 0.3s;
  box-sizing: border-box;
  &:active {
    opacity: 0.7;
  }
}

/* 主容器 - 横屏优化布局 */
.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20rpx 80rpx 80rpx 80rpx;
  position: relative;
  z-index: 10;
  margin-top: -40rpx;
  box-sizing: border-box;
}

/* 标题区域 */
.title-section {
  text-align: center;
  margin-bottom: 70rpx;
}

.main-title {
  font-size: 84rpx;
  font-weight: 700;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
  line-height: 1.2;
}

.subtitle {
  font-size: 40rpx;
  background: linear-gradient(90deg, #4A9EFF 0%, #A78BFA 50%, #EC4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 400;
  display: block;
  line-height: 1.4;
}

/* 测试类型卡片容器 */
.test-types-container {
  display: flex;
  flex-direction: row;
  gap: 80rpx;
  margin-bottom: 80rpx;
  width: 100%;
  max-width: 1800rpx;
  justify-content: center;
  box-sizing: border-box;
}

/* 测试类型卡片 */
.test-type-card {
  flex: 1;
  background: white;
  border-radius: 50rpx;
  padding: 70rpx 60rpx;
  box-shadow: 0 20rpx 60rpx rgba(0,0,0,0.08);
  text-align: center;
  position: relative;
  max-width: 800rpx;
  min-width: 600rpx;
  box-sizing: border-box;
}

.test-type-title {
  font-size: 52rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 30rpx;
  display: block;
}

.test-type-details {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.test-type-main {
  font-size: 36rpx;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.pass-mark {
  color: #999;
  font-size: 32rpx;
  display: block;
}

/* 按钮容器 */
.buttons-container {
  display: flex;
  flex-direction: row;
  gap: 60rpx;
  justify-content: center;
}

/* 主要按钮 */
.primary-button {
  padding: 36rpx 120rpx;
  background: linear-gradient(135deg, #4A9EFF 0%, #2196F3 100%);
  border-radius: 100rpx;
  box-shadow: 0 16rpx 48rpx rgba(74, 158, 255, 0.35);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:active {
    transform: scale(0.98);
  }
}

.primary-button-text {
  color: white;
  font-size: 44rpx;
  font-weight: 600;
}

/* 次要按钮 */
.secondary-button {
  padding: 32rpx 96rpx;
  background: white;
  border: 4rpx solid #4A9EFF;
  border-radius: 100rpx;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  &:active {
    transform: scale(0.98);
    background: #F8FBFF;
  }
}

.secondary-button-text {
  color: #4A9EFF;
  font-size: 40rpx;
  font-weight: 600;
}

/* 装饰性元素 */
.decoration-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
  background: #4A9EFF;
}

.circle-1 {
  width: 400rpx;
  height: 400rpx;
  top: 10%;
  right: 5%;
}

.circle-2 {
  width: 300rpx;
  height: 300rpx;
  bottom: 10%;
  left: 5%;
}

/* 小屏幕横屏适配 */
@media screen and (max-height: 400px) {
  .main-title {
    font-size: 64rpx;
  }
  
  .subtitle {
    font-size: 32rpx;
  }
  
  .test-type-card {
    padding: 50rpx 40rpx;
    min-width: 500rpx;
    box-sizing: border-box;
  }
  
  .test-type-title {
    font-size: 40rpx;
  }
  
  .test-type-main {
    font-size: 32rpx;
  }
  
  .pass-mark {
    font-size: 28rpx;
  }
  
  .primary-button {
    padding: 28rpx 80rpx;
    box-sizing: border-box;
  }
  
  .primary-button-text {
    font-size: 36rpx;
  }
  
  .secondary-button {
    padding: 24rpx 72rpx;
    box-sizing: border-box;
  }
  
  .secondary-button-text {
    font-size: 36rpx;
  }
  
  .title-section {
    margin-bottom: 50rpx;
  }
  
  .test-types-container {
    margin-bottom: 60rpx;
    gap: 60rpx;
  }
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(40rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.6s ease;
}

.fade-in-delay-1 {
  animation: fadeIn 0.6s ease 0.2s both;
}

.fade-in-delay-2 {
  animation: fadeIn 0.6s ease 0.4s both;
}

/* 平板适配 */
@media screen and (min-width: 768px) {
  .test-types-container {
    max-width: 2200rpx;
  }
  
  .test-type-card {
    max-width: 960rpx;
  }
}
</style>