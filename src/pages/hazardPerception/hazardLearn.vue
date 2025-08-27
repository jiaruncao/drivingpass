<template>
  <view class="app">
    <!-- 视频区域 - 点击任何地方都能添加标记 -->
    <view class="video-container" @tap="addMarkAtCurrentTime">
      <view class="video-content">
        <view class="road-scene">
          <view class="road-lines"></view>
        </view>
      </view>

      <!-- 退出按钮 -->
      <button class="exit-button" @tap.stop="exitLearnMode">Exit</button>
    </view>

    <!-- 底部控制区域 -->
    <view class="bottom-controls">
      <!-- 细进度条 -->
      <view class="thin-progress-bar">
        <view class="thin-progress-fill" :style="{width: progress + '%'}"></view>
      </view>

      <!-- 得分条 -->
      <view class="score-bar-container">
        <!-- 得分区间 - 分段显示，模拟两个危险区间 -->
        <!-- 第一个危险区间：15%-45% -->
        <!-- <view class="gray-zone" style="left: 0; width: 15%;"></view> -->
        <view class="score-zone zone-5" style="left: 15%; width: 5%;">5</view>
        <view class="score-zone zone-4" style="left: 20%; width: 5%;">4</view>
        <view class="score-zone zone-3" style="left: 25%; width: 10%;">3</view>
        <view class="score-zone zone-2" style="left: 35%; width: 10%;">2</view>
        
        <!-- 中间无分区域 -->
        <!-- <view class="gray-zone" style="left: 45%; width: 15%;"></view> -->
        
        <!-- 第二个危险区间：60%-80% -->
        <view class="score-zone zone-5" style="left: 60%; width: 5%;">5</view>
        <view class="score-zone zone-4" style="left: 65%; width: 5%;">4</view>
        <view class="score-zone zone-3" style="left: 70%; width: 5%;">3</view>
        <view class="score-zone zone-2" style="left: 75%; width: 5%;">2</view>
        
        <!-- 结尾无分区域 -->
        <!-- <view class="gray-zone" style="left: 80%; width: 20%;"></view> -->

        <!-- 用户标记的旗子 -->
        <view class="user-marks">
          <view v-for="(mark, index) in userMarks" 
                :key="mark.id"
                class="user-mark" 
                :style="{left: mark.position + '%'}"
                @tap.stop="showMarkInfo(mark, index)">
            <view class="mark-tooltip">
              Click {{ index + 1 }} - {{ mark.time }}s ({{ mark.score }} points)
            </view>
            <view class="flag-container">
              <view class="flag-pole"></view>
              <view class="flag-banner"></view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      currentTime: 0, // 当前时间（秒）
      duration: 70, // 视频总时长（秒）
      progress: 0, // 进度百分比
      userMarks: [], // 用户标记的危险点
      playInterval: null, // 播放定时器
      clickCount: 0, // 点击计数
      recentClicks: [], // 最近的点击时间记录
      scoreDisqualified: false // 分数是否被取消
    }
  },
  methods: {
    // 自动播放
    startAutoPlay() {
      this.playInterval = setInterval(() => {
        if (this.currentTime < this.duration) {
          this.currentTime += 0.1;
          this.progress = (this.currentTime / this.duration) * 100;
        } else {
          clearInterval(this.playInterval);
          this.currentTime = this.duration;
          this.progress = 100;
        }
      }, 100);
    },
    
    // 在当前时间添加标记
    addMarkAtCurrentTime() {
      // 检查是否已被取消资格
      if (this.scoreDisqualified) {
        return;
      }

      // 防作弊检测
      if (this.checkForCheating()) {
        return;
      }

      // 计算当前进度对应的得分
      // 得分区间设置（只在危险区间内有分数）
      let score = 0;
      
      // 第一个危险区间：15%-45% (早期反应得高分)
      if (this.progress >= 15 && this.progress < 20) {
        score = 5;
      } else if (this.progress >= 20 && this.progress < 25) {
        score = 4;
      } else if (this.progress >= 25 && this.progress < 35) {
        score = 3;
      } else if (this.progress >= 35 && this.progress < 45) {
        score = 2;
      }
      // 第二个危险区间：60%-80% (另一个危险)
      else if (this.progress >= 60 && this.progress < 65) {
        score = 5;
      } else if (this.progress >= 65 && this.progress < 70) {
        score = 4;
      } else if (this.progress >= 70 && this.progress < 75) {
        score = 3;
      } else if (this.progress >= 75 && this.progress < 80) {
        score = 2;
      }
      // 其他区域不得分
      else {
        score = 0;
      }
      
      // 添加标记
      this.addMark(this.progress, score);
    },
    
    // 防作弊检测
    checkForCheating() {
      const now = Date.now();
      
      // 规则1: 两次点击之间至少要间隔0.5秒（500ms）
      if (this.recentClicks.length > 0) {
        const lastClick = this.recentClicks[this.recentClicks.length - 1];
        if (now - lastClick < 500) {
          this.handleCheating('Clicks too fast (minimum 0.5s between clicks)');
          return true;
        }
      }
      
      // 清理3秒前的点击记录
      this.recentClicks = this.recentClicks.filter(time => now - time < 3000);
      
      // 添加当前点击
      this.recentClicks.push(now);
      
      // 规则2: 3秒内不超过3次点击
      if (this.recentClicks.length > 3) {
        this.handleCheating('Too many clicks in 3 seconds (max 3)');
        return true;
      }
      
      // 规则3: 整个视频最多15次点击
      if (this.clickCount >= 15) {
        this.handleCheating('Maximum 15 clicks exceeded');
        return true;
      }
      
      return false;
    },
    
    // 处理作弊行为
    handleCheating(reason) {
      this.scoreDisqualified = true;
      
      // 清除所有标记的分数
      this.userMarks.forEach(mark => {
        mark.score = 0;
      });
      
      // 显示警告
      uni.showModal({
        title: '⚠️ Score Disqualified!',
        content: `You scored 0 for this video.\n\nReason: ${reason}`,
        showCancel: false,
        confirmText: 'OK'
      });
      
      console.log('Score disqualified:', reason);
    },
    
    // 添加标记
    addMark(position, score) {
      this.clickCount++;
      
      // 如果已被取消资格，分数为0
      const finalScore = this.scoreDisqualified ? 0 : score;
      
      const newMark = {
        id: Date.now(),
        time: Math.round((position / 100) * this.duration),
        position: position,
        score: finalScore,
        clickNumber: this.clickCount
      };
      
      // 添加标记（允许重叠）
      this.userMarks.push(newMark);
      
      console.log(`Mark ${this.clickCount} added at ${newMark.time}s with score ${finalScore}`);
    },
    
    // 显示标记信息
    showMarkInfo(mark, index) {
      console.log(`Mark ${index + 1} at ${mark.time}s with score ${mark.score}`);
    },
    
    // 退出学习模式
    exitLearnMode() {
      if (this.playInterval) {
        clearInterval(this.playInterval);
      }
      
      uni.showModal({
        title: 'Exit',
        content: 'Are you sure you want to exit?',
        success: (res) => {
          if (res.confirm) {
            // 返回上一页
            uni.navigateBack();
          }
        }
      });
    }
  },
  
  onLoad() {
    console.log('Hazard Perception Learn Mode loaded');
    // 自动开始播放
    this.startAutoPlay();
    // #ifdef APP-PLUS
    // APP端强制横屏
    plus.screen.lockOrientation('landscape-primary');
    plus.navigator.setFullscreen(true); // 全屏显示，隐藏状态栏和导航栏
    plus.navigator.hideSystemNavigation(); // 隐藏系统导航栏
    // #endif
  },
  
  onUnload() {
    // 清理定时器
    if (this.playInterval) {
      clearInterval(this.playInterval);
    }
    // #ifdef APP-PLUS
    plus.screen.lockOrientation('portrait-primary');
    // #endif
  }
}
</script>

<style lang="scss">
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  background: #000;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
}

/* 视频容器 */
.video-container {
  position: relative;
  width: 100%;
  flex: 1;
  background: #1a1a1a;
  overflow: hidden;
}

/* 模拟视频背景 - 道路场景 */
.video-content {
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, #4a5568 0%, #2d3748 40%, #1a202c 100%);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 道路模拟 */
.road-scene {
  width: 100%;
  height: 100%;
  position: relative;
  background: linear-gradient(to bottom, 
    #87CEEB 0%,    /* 天空 */
    #87CEEB 35%,   
    #90A955 35%,   /* 地平线 */
    #4a5f3a 45%,   /* 远山 */
    #3d4f33 55%,   /* 近景 */
    #2a2a2a 55%,   /* 路面 */
    #1a1a1a 100%
  );
}

.road-scene::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 200%;
  height: 45%;
  background: linear-gradient(to top,
    #2a2a2a 0%,
    #3a3a3a 50%,
    transparent 100%
  );
  clip-path: polygon(45% 100%, 50% 0%, 55% 100%);
}

/* 道路中线 */
.road-lines {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 8rpx;
  height: 45%;
  background: repeating-linear-gradient(
    to bottom,
    #FFD700 0rpx,
    #FFD700 40rpx,
    transparent 40rpx,
    transparent 80rpx
  );
}

/* 退出按钮 */
.exit-button {
  position: absolute;
  top: 60rpx;
  left: 60rpx;
  padding: 20rpx 50rpx;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50rpx;
  font-size: 32rpx;
  font-weight: 500;
  z-index: 100;
  transition: all 0.3s ease;
}

.exit-button:hover {
  background: rgba(0, 0, 0, 0.8);
}

/* 底部控制区域 */
.bottom-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 56rpx;
  background: transparent;
}

/* 细进度条 */
.thin-progress-bar {
  position: absolute;
  bottom: 50rpx;
  left: 0;
  right: 0;
  height: 6rpx;
  background: rgba(255, 255, 255, 0.2);
}

.thin-progress-fill {
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  width: 0%;
  transition: width 0.1s linear;
}

/* 得分条容器 */
.score-bar-container {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50rpx;
  display: flex;
  align-items: stretch;
  background: #f5f5f5;
}

/* 灰色无分区域 */
.gray-zone {
  position: absolute;
  height: 100%;
  background: #e0e0e0;
}

/* 得分区间 */
.score-zone {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24rpx;
  font-weight: bold;
  text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.5);
  height: 100%;
}

/* 得分区间样式 - 渐变效果 */
.zone-5 {
  background: linear-gradient(135deg, #FFA726 0%, #FF9800 100%);
}

.zone-4 {
  background: linear-gradient(135deg, #EF5350 0%, #F44336 100%);
}

.zone-3 {
  background: linear-gradient(135deg, #42A5F5 0%, #2196F3 100%);
}

.zone-2 {
  background: linear-gradient(135deg, #66BB6A 0%, #4CAF50 100%);
}

/* 区间分隔线 */
.score-zone::after {
  content: '';
  position: absolute;
  right: 0;
  top: 20%;
  bottom: 20%;
  width: 2rpx;
  background: rgba(255,255,255,0.3);
}

.score-zone:last-child::after {
  display: none;
}

/* 用户标记旗子 */
.user-marks {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.user-mark {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  pointer-events: auto;
  z-index: 10;
  transition: transform 0.2s ease;
}

.user-mark:hover {
  transform: translate(-50%, -50%) scale(1.2);
  z-index: 20;
}

/* 旗子样式 */
.flag-container {
  position: relative;
  width: 40rpx;
  height: 50rpx;
}

.flag-pole {
  position: absolute;
  left: 0;
  top: 0;
  width: 4rpx;
  height: 50rpx;
  background: #333;
}

.flag-banner {
  position: absolute;
  left: 4rpx;
  top: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 12rpx 0 12rpx 24rpx;
  border-color: transparent transparent transparent #FF0000;
  filter: drop-shadow(0 2rpx 6rpx rgba(0,0,0,0.3));
}

/* 悬停提示 */
.mark-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 20rpx;
  padding: 12rpx 24rpx;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  font-size: 24rpx;
  border-radius: 12rpx;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.user-mark:hover .mark-tooltip {
  opacity: 1;
}

/* 响应式调整 - 小屏幕适配 */
@media screen and (max-width: 375px) {
  .exit-button {
    top: 40rpx;
    left: 40rpx;
    padding: 16rpx 40rpx;
    font-size: 28rpx;
  }

  .score-zone {
    font-size: 20rpx;
  }

  .bottom-controls {
    height: 46rpx;
  }

  .thin-progress-bar {
    bottom: 46rpx;
  }

  .score-bar-container {
    height: 46rpx;
  }
}
</style>
