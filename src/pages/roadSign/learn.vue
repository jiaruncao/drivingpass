<template>
  <view class="app">
    <!-- 头部导航 -->
    <view class="header">
      <view class="back-button" @tap="goBack">←</view>
      <view class="header-content">
        <text class="page-title">{{ currentSign.title || '' }}</text>
        <view class="header-right">
          <view class="share-button" @tap="shareSign">
            <u-icon name="share" size="40rpx"></u-icon>
          </view>
          <view class="progress-circle" :style="{ '--accuracy': Number(categoryProgress) }">
            <text class="progress-text">{{ categoryProgress }}%</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 主要内容 -->
    <view class="container">
      <!-- 滑动容器 -->
      <view class="swipe-container" 
            @touchstart="onTouchStart" 
            @touchmove="onTouchMove" 
            @touchend="onTouchEnd">
        <view class="swipe-wrapper" :style="{ transform: `translateX(${translateX}rpx)` }">
          <view v-for="(sign, index) in signsList" :key="sign.id" class="slide">
            <view class="sign-card">
              <view class="sign-icon-container" v-if="sign.title_video_url">
                <view class="sign-icon">
                  <!-- <view v-if="sign.iconClass === 'no-pedestrians'" class="slash"></view>
                  <text class="pedestrian-icon">🚶</text> -->
                  <image :src="sign.title_video_url" mode=""></image>
                </view>
              </view>
              <text class="sign-title">{{ sign.title }}</text>
              <text class="sign-description">{{ sign.explain }}</text>
              <view class="status-button" :class="{unread: !sign.is_read}" @tap="toggleReadStatus(index)">
                <text class="status-text">{{ sign.is_read ? 'Read' : 'Mark as Read' }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 滑动指示器 -->
      <view class="swipe-indicators">
        <view v-for="(sign, index) in signsList"
              :key="index" 
              class="indicator" 
              :class="{active: currentIndex === index}"
              @tap="goToSlide(index)">
        </view>
      </view>
    </view>

    <view v-if="showCompletionModal" class="result-modal">
      <view class="result-backdrop" @tap.stop></view>
      <view class="result-content completion-content">
        <view class="result-header completion-header">
          <view class="completion-icon">🎉</view>
          <view class="result-title">Learning Complete</view>
          <view class="result-subtitle">You've covered every sign in this category.</view>
        </view>
        <view class="result-actions completion-actions">
          <button class="result-button reset-btn" @tap="resetProgress">Reset Progress</button>
          <button class="result-button home-btn" @tap="returnHome">Return Home</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import {getThree, recordAdd} from '@/http/api/testQuestions.js'
export default {
  data() {
    return {
      subject_id: null,
      cate_id: null,
      question_id: null,
      currentIndex: 0, // 当前标志索引
      categoryProgress: 0, // 分类进度
      translateX: 0, // 滑动偏移量
      startX: 0, // 触摸起始位置
      isDragging: false, // 是否正在拖拽
      slideWidth: 0, // 滑块宽度
      // 标志数据列表
      signsList: [],
      showCompletionModal: false,
      prevCategoryProgress: 0
    }
  },
  computed: {
    // 当前显示的标志
    currentSign() {
      return this.signsList[this.currentIndex] || this.signsList[0];
    },
    // 标志总数
    totalSigns() {
      return this.signsList.length;
    }
  },
  methods: {
    // 返回上一页
    goBack() {
      console.log('Going back to category list');
      // 实际应用中导航回分类列表页面
      uni.navigateBack({
        fail: () => {
          console.log('No previous page, exit app');
        }
      });
    },
    // 分享标志
    shareSign() {
      console.log('Sharing sign:', this.currentSign.name);
      // 实际应用中调用系统分享功能
      uni.share({
        provider: "weixin",
        type: 0,
        title: this.currentSign.name,
        summary: this.currentSign.description,
        success: function (res) {
          console.log("success:" + JSON.stringify(res));
        },
        fail: function (err) {
          console.log("fail:" + JSON.stringify(err));
        }
      });
    },
    persistCurrentIndex (index) {
      if (!this.subject_id || !this.cate_id) return

      this.$utils.updateSubjectStorage('subjects', {
        subjectId: this.subject_id,
        cateId: this.cate_id
      }, {
        'current_question_index': index
      });

      this.$utils.updateSubjectStorage('subjects', {
        subjectId: this.subject_id
      }, {
        'last_learn_cate_id': this.cate_id
      });
    },
    // 切换已读状态
    toggleReadStatus(index) {
      //this.signsList[index].is_read = true;
      //this.updateProgress();
      this.saveProgress(index);
      
      // this.setStorageSyncSubjects(this.signsList[index].id, 'is_read', true)
      
    },
    // 触摸开始
    onTouchStart(e) {
      this.startX = e.touches[0].clientX;
      this.isDragging = true;
      // 获取容器宽度（rpx转px）
      const query = uni.createSelectorQuery().in(this);
      query.select('.swipe-container').boundingClientRect(data => {
        this.slideWidth = data.width;
      }).exec();
    },
    // 触摸移动
    onTouchMove(e) {
      if (!this.isDragging) return;
      
      const currentX = e.touches[0].clientX;
      const diffX = currentX - this.startX;
      const currentTranslate = -this.currentIndex * this.slideWidth;
      
      // 转换为rpx单位
      this.translateX = (currentTranslate + diffX) * 2;
    },
    // 触摸结束
    onTouchEnd(e) {
      if (!this.isDragging) return;
      
      const endX = e.changedTouches[0].clientX;
      const diffX = endX - this.startX;
      const threshold = this.slideWidth * 0.3; // 30% 的滑动距离触发切换
      
      if (diffX > threshold && this.currentIndex > 0) {
        // 向右滑动，前往上一个
        this.currentIndex--;
      } else if (diffX < -threshold && this.currentIndex < this.totalSigns - 1) {
        // 向左滑动，前往下一个
        this.currentIndex++;
      }
      
      this.updateTranslate();
      this.isDragging = false;
    },
    // 直接跳转到指定滑块
    goToSlide(index) {
      this.currentIndex = index;
      this.updateTranslate();
    },
    // 更新滑动位置
    updateTranslate() {
      if (!this.slideWidth) {
        const query = uni.createSelectorQuery().in(this);
        query.select('.swipe-container').boundingClientRect(data => {
          this.slideWidth = data.width;
          this.translateX = -this.currentIndex * this.slideWidth * 2; // 转换为rpx
        }).exec();
      } else {
        this.translateX = -this.currentIndex * this.slideWidth * 2; // 转换为rpx
      }
    },
    // 更新进度
    updateProgress() {
      const previousProgress = this.categoryProgress;
      const readCount = this.signsList.filter(sign => sign.is_read).length;
      const total = this.totalSigns || 0;
      const newProgress = total ? Math.round((readCount / total) * 100) : 0;
      this.categoryProgress = newProgress;

      if (this.signsList.length && newProgress === 100 && previousProgress < 100) {
        this.showCompletionModal = true;
      }

      this.prevCategoryProgress = newProgress;
    },
    resetProgress () {
      const subjects = uni.getStorageSync('subjects');
      if (subjects && this.subject_id && this.cate_id) {
        const subject = subjects.find(item => item.id == this.subject_id);
        if (subject && Array.isArray(subject.cate)) {
          const cate = subject.cate.find(item => item.id == this.cate_id);
          if (cate) {
            if (Array.isArray(cate.question)) {
              cate.question = cate.question.map(question => ({
                ...question,
                is_read: false
              }));
            }
            cate.answerQuestions = [];
            cate.current_question_index = 0;
          }
        }
        uni.setStorageSync('subjects', subjects);
      }

      this.signsList = this.signsList.map(sign => ({
        ...sign,
        is_read: false
      }));
      this.categoryProgress = 0;
      this.prevCategoryProgress = 0;
      this.currentIndex = 0;
      uni.setStorageSync('questions', this.signsList);
      this.persistCurrentIndex(0);
      this.showCompletionModal = false;
    },
    returnHome () {
      this.showCompletionModal = false;
      uni.switchTab({
        url: '/pages/index/index'
      });
    },
    addRecord () {
      // 获取记录数组
      const subjects = uni.getStorageSync('subjects');
      if (!subjects) return;
    
      // 检查并添加
      const added = this.$utils.addQuestionIfNotExists(
        subjects, 
        this.subject_id, 
        this.cate_id, 
        this.currentSign.id
      );
      
      if (added) {
        // 更新缓存
        uni.setStorageSync('subjects', subjects);
      }
    },
    // 保存学习进度 - API调用示例
    async saveProgress(index) {
      
      try {
        const response = await recordAdd({
          question_id: this.currentSign.id
        })
        
        if (response.code == 1) {
          this.addRecord()
          this.$utils.updateSubjectStorage('subjects', {
            subjectId: this.subject_id,
            cateId: this.cate_id,
            questionId: this.currentSign.id
          }, {
            'is_read': true
          });

          this.signsList[index].is_read = true;

          this.updateProgress()
          uni.setStorageSync('questions', this.signsList)
          this.persistCurrentIndex(this.currentIndex)
        }
      } catch (error) {
        console.error('Failed to save progress:', error);
      }
    }
  },
  watch: {
    // 监听当前索引变化，自动保存进度
    currentIndex(newIndex) {
      this.persistCurrentIndex(newIndex)
    }
  },
  onLoad(option) {
    this.cate_id = option.cate_id
    this.subject_id = option.subject_id
    this.question_id = option.question_id
    // 取缓存数据
    const questions = uni.getStorageSync('questions');
    if (questions) {
      this.signsList = questions;
      this.updateProgress()
    }

    let initialIndex = 0

    if (this.question_id) {
      const matchedIndex = this.signsList.findIndex(item => item.id == this.question_id)
      if (matchedIndex >= 0) {
        initialIndex = matchedIndex
      }
    }

    if (!this.question_id && this.subject_id && this.cate_id) {
      const subjects = uni.getStorageSync('subjects')
      if (subjects) {
        const savedIndex = this.$utils.getCurrentQuestionIndex(subjects, this.subject_id, this.cate_id)
        if (savedIndex >= 0 && savedIndex < this.signsList.length) {
          initialIndex = savedIndex
        }
      }
    }

    if (initialIndex < 0) {
      initialIndex = 0
    }
    if (initialIndex >= this.signsList.length) {
      initialIndex = this.signsList.length ? this.signsList.length - 1 : 0
    }

    this.currentIndex = initialIndex

    this.$nextTick(function() {
      this.updateTranslate();
    })

    this.prevCategoryProgress = this.categoryProgress

    if (this.subject_id && this.cate_id) {
      this.persistCurrentIndex(this.currentIndex)
    }

    // 页面加载后初始化数据
    // this.updateProgress();
    // this.updateTranslate();
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

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  background: #F8F9FA;
}

/* Header 样式 */
.header {
  padding: 30rpx 40rpx;
  display: flex;
  align-items: center;
  background: white;
  position: relative;
  z-index: 10;
  min-height: 120rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05);
}

.back-button {
  color: #666;
  font-size: 40rpx;
  padding: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80rpx;
  height: 80rpx;
}

.header-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-left: 40rpx;
}

.page-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.share-button {
  color: #666;
  padding: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72rpx;
  height: 72rpx;
}

.share-icon {
  font-size: 36rpx;
}

.progress-circle {
  width: 90rpx;
  height: 90rpx;
  border-radius: 50%;
  background: conic-gradient(from 0deg, #FFA500 0deg, #FFA500 calc(var(--accuracy) * 3.6deg), #E0E0E0 calc(var(--accuracy) * 3.6deg));
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.progress-circle::before {
  content: '';
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: white;
  position: absolute;
}

.progress-text {
  position: relative;
  font-size: 24rpx;
  font-weight: 600;
  color: #FFA500;
  z-index: 1;
}

/* 容器 */
.container {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 10;
  padding: 80rpx 40rpx 80rpx;
  align-items: center;
  justify-content: center;
}

/* 滑动容器 */
.swipe-container {
  width: 100%;
  max-width: 700rpx;
  position: relative;
  overflow: hidden;
}

.swipe-wrapper {
  display: flex;
  transition: transform 0.3s ease;
  width: 300%;
}

.slide {
  width: 33.333%;
  flex-shrink: 0;
}

/* 标志卡片 */
.sign-card {
  background: white;
  border-radius: 60rpx;
  padding: 120rpx 80rpx;
  box-shadow: 0 16rpx 50rpx rgba(0,0,0,0.08);
  text-align: center;
  width: 100%;
}

.sign-icon-container {
  width: 400rpx;
  height: 400rpx;
  margin: 0 auto 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.sign-icon {
  width: 320rpx;
  height: 320rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border: 12rpx solid;
  > image {
    width: 90%;
    height: 90%;
    border-radius: 50%;
  }
}

/* 禁止类标志 - 红色圆形，添加斜杠 */
.sign-icon.no-pedestrians {
  background: #ff4444;
  border-color: #cc0000;
}

.slash {
  position: absolute;
  width: 280rpx;
  height: 12rpx;
  background: #cc0000;
  transform: rotate(45deg);
  z-index: 2;
}

.pedestrian-icon {
  font-size: 120rpx;
  color: #000;
  z-index: 1;
}

.sign-title {
  font-size: 48rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 40rpx;
  display: block;
}

.sign-description {
  font-size: 32rpx;
  color: #666;
  line-height: 1.5;
  margin-bottom: 60rpx;
  display: block;
}

/* 状态按钮 */
.status-button {
  padding: 24rpx 60rpx;
  border: 4rpx solid #4A9EFF;
  border-radius: 50rpx;
  background: #4A9EFF;
  display: inline-block;
}

.status-button.unread {
  background: transparent;
}

.status-text {
  color: white;
  font-size: 32rpx;
  font-weight: 500;
}

.status-button.unread .status-text {
  color: #4A9EFF;
}

/* 滑动指示器 */
.swipe-indicators {
  display: flex;
  justify-content: center;
  gap: 16rpx;
  margin-top: 60rpx;
}

.indicator {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #E0E0E0;
  transition: all 0.3s ease;
}

.indicator.active {
  background: #4A9EFF;
  width: 40rpx;
  border-radius: 8rpx;
}

/* 响应式优化 */
@media screen and (max-width: 375px) {
  .container {
    padding: 60rpx 30rpx 60rpx;
  }
  
  .swipe-container {
    max-width: 640rpx;
  }
  
  .sign-card {
    padding: 80rpx 50rpx;
  }
  
  .sign-icon-container {
    width: 300rpx;
    height: 300rpx;
    margin-bottom: 60rpx;
  }
  
  .sign-icon {
    width: 240rpx;
    height: 240rpx;
    border-width: 8rpx;
  }

  .slash {
    width: 220rpx;
    height: 8rpx;
  }

  .pedestrian-icon {
    font-size: 90rpx;
  }
  
  .sign-title {
    font-size: 40rpx;
  }
}

.result-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}

.result-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
}

.result-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600rpx;
  background: white;
  border-radius: 30rpx;
  padding: 50rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.3);
}

.completion-header {
  text-align: center;
  margin-bottom: 40rpx;
}

.completion-icon {
  font-size: 90rpx;
  margin-bottom: 20rpx;
}

.result-title {
  font-size: 42rpx;
  font-weight: 600;
  color: #333;
}

.result-subtitle {
  margin-top: 12rpx;
  font-size: 28rpx;
  color: #666;
}

.result-actions {
  display: flex;
  gap: 30rpx;
}

.result-button {
  flex: 1;
  padding: 26rpx;
  border-radius: 50rpx;
  font-size: 28rpx;
  font-weight: 600;
  border: none;
  transition: all 0.3s ease;
}

.reset-btn {
  background: linear-gradient(135deg, #4A9EFF 0%, #2196F3 100%);
  color: white;
  box-shadow: 0 8rpx 30rpx rgba(74, 158, 255, 0.3);
}

.reset-btn:active {
  transform: scale(0.98);
}

.home-btn {
  background: #f5f5f5;
  color: #666;
}

.home-btn:active {
  background: #e0e0e0;
}
</style>
