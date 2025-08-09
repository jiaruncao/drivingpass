<template>
  <view class="container">
    <!-- 顶部栏 -->
    <view class="top-bar">
      <text class="question-counter">Question {{ currentQuestion }} of 50</text>
      <text :class="['time-remaining', timeRemaining <= 300 ? 'warning' : '']">
        Time: {{ formattedTime }}
      </text>
    </view>

    <!-- 主要内容区域 -->
    <view :class="['main-content', !currentQuestionData.hasImage ? 'no-image' : '']">
      <!-- 左侧问题区域 -->
      <view class="question-section">
        <view class="question-header">
          <text class="question-text">{{ currentQuestionData.questionText }}</text>
          <text class="mark-instruction">Mark one answer</text>
        </view>

        <view class="answer-options">
          <view 
            v-for="(option, index) in currentQuestionData.options" 
            :key="index"
            :class="['answer-option', currentQuestionData.selectedOption === index ? 'selected' : '']"
            @tap="selectAnswer(index)"
          >
            <view class="answer-checkbox"></view>
            <text class="answer-text">{{ option }}</text>
          </view>
        </view>
      </view>

      <!-- 右侧图片区域 -->
      <view v-if="currentQuestionData.hasImage" class="image-section">
        <image 
          :src="currentQuestionData.imageUrl" 
          class="question-image"
          mode="aspectFit"
        />
      </view>
    </view>

    <!-- 底部控制栏 -->
    <view class="bottom-controls">
      <view class="control-buttons">
        <button class="control-button previous" @tap="previousQuestion">
          <text class="arrow">←</text>
          <text>Previous</text>
        </button>
        <button 
          :class="['control-button', 'flag', questionStates[currentQuestion - 1].flagged ? 'flagged' : '']" 
          @tap="toggleFlag"
        >
          <text class="flag-icon">!</text>
          <text>Flag</text>
        </button>
        <button class="control-button review" @tap="showReview">
          <text class="review-icon">👓</text>
          <text>Review</text>
        </button>
        <button class="control-button sound" @tap="playAudio">
          <text class="sound-icon">🔊</text>
        </button>
      </view>
      <button class="control-button next" @tap="nextQuestion">
        <text>Next</text>
        <text class="arrow">→</text>
      </button>
    </view>

    <!-- Review面板遮罩层 -->
    <view v-if="reviewVisible" class="review-overlay active" @tap="handleOverlayClick">
      <view class="review-panel" @tap.stop>
        <view class="review-header">
          <text class="review-title">Review Questions</text>
          <button class="review-close" @tap="closeReview">×</button>
        </view>
        
        <view class="review-stats">
          <view class="stat-item">
            <view class="stat-indicator answered"></view>
            <text>Answered: <text class="stat-bold">{{ answeredCount }}</text></text>
          </view>
          <view class="stat-item">
            <view class="stat-indicator flagged"></view>
            <text>Flagged: <text class="stat-bold">{{ flaggedCount }}</text></text>
          </view>
          <view class="stat-item">
            <view class="stat-indicator unanswered"></view>
            <text>Unanswered: <text class="stat-bold">{{ unansweredCount }}</text></text>
          </view>
        </view>
        
        <scroll-view class="review-grid-container" scroll-y>
          <view class="review-grid">
            <view 
              v-for="(state, index) in questionStates" 
              :key="index"
              :class="[
                'question-box',
                state.id === currentQuestion ? 'current' : '',
                state.answered ? 'answered' : '',
                state.flagged ? 'flagged' : ''
              ]"
              @tap="goToQuestionFromReview(state.id)"
            >
              <text>{{ state.id }}</text>
            </view>
          </view>
        </scroll-view>
        
        <view class="review-footer">
          <button class="review-action-btn secondary" @tap="closeReview">Continue Test</button>
          <button class="review-action-btn primary" @tap="endTest">End Test</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 当前题目编号
      currentQuestion: 9,
      // 倒计时剩余秒数
      timeRemaining: 54 * 60 + 24,
      // Review面板是否显示
      reviewVisible: false,
      // 计时器
      timer: null,
      
      // 题目状态数组
      questionStates: [],
      
      // 题目数据
      questionsData: {
        9: {
          questionText: 'You want to turn left at this junction. The view of the main road is restricted. What should you do?',
          options: [
            'Stay well back and wait to see if something comes',
            'Stop and apply the handbrake even if the road is clear',
            'Build up your speed so that you can emerge quickly',
            'Approach slowly and edge out until you can see more clearly'
          ],
          hasImage: true,
          imageUrl: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'300\' viewBox=\'0 0 400 300\'%3E%3Crect fill=\'%23587A8A\' width=\'400\' height=\'300\'/%3E%3Crect fill=\'%23404040\' x=\'0\' y=\'180\' width=\'400\' height=\'120\'/%3E%3Crect fill=\'%23FFF\' stroke-dasharray=\'15,8\' stroke=\'%23FFF\' stroke-width=\'2\' fill=\'none\' x=\'195\' y=\'180\' width=\'10\' height=\'120\'/%3E%3Crect fill=\'%238B7355\' x=\'300\' y=\'130\' width=\'80\' height=\'60\'/%3E%3Cpolygon fill=\'%23A0522D\' points=\'300,130 340,110 380,130\'/%3E%3Crect fill=\'%23228B22\' x=\'0\' y=\'170\' width=\'150\' height=\'10\'/%3E%3Crect fill=\'%23228B22\' x=\'250\' y=\'170\' width=\'150\' height=\'10\'/%3E%3Cpath d=\'M 170 250 Q 190 230 200 180\' stroke=\'%23FFF\' stroke-width=\'2\' fill=\'none\'/%3E%3Cpolygon fill=\'%23FFF\' points=\'197,183 200,180 203,183 200,175\'/%3E%3C/svg%3E',
          selectedOption: null
        },
        10: {
          questionText: 'What is the maximum penalty for driving without insurance in the UK? Consider both the fixed penalty and potential court penalties.',
          options: [
            'Fixed penalty of £300 and 6 penalty points',
            'Fixed penalty of £200 and 3 penalty points',
            'Fixed penalty of £100 and 3 penalty points',
            'Fixed penalty of £500 and 9 penalty points'
          ],
          hasImage: false,
          imageUrl: '',
          selectedOption: null
        }
      }
    }
  },
  
  computed: {
    // 格式化的时间显示
    formattedTime() {
      const minutes = Math.floor(this.timeRemaining / 60)
      const seconds = this.timeRemaining % 60
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    },
    
    // 当前题目数据
    currentQuestionData() {
      // 如果当前题号有特定数据，使用特定数据，否则使用默认数据
      if (this.questionsData[this.currentQuestion]) {
        const data = this.questionsData[this.currentQuestion]
        const state = this.questionStates[this.currentQuestion - 1]
        return {
          ...data,
          selectedOption: state ? state.selectedOption : null
        }
      }
      
      // 默认题目数据
      return {
        questionText: 'You want to turn left at this junction. The view of the main road is restricted. What should you do?',
        options: [
          'Stay well back and wait to see if something comes',
          'Stop and apply the handbrake even if the road is clear',
          'Build up your speed so that you can emerge quickly',
          'Approach slowly and edge out until you can see more clearly'
        ],
        hasImage: true,
        imageUrl: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'300\' viewBox=\'0 0 400 300\'%3E%3Crect fill=\'%23587A8A\' width=\'400\' height=\'300\'/%3E%3Crect fill=\'%23404040\' x=\'0\' y=\'180\' width=\'400\' height=\'120\'/%3E%3Crect fill=\'%23FFF\' stroke-dasharray=\'15,8\' stroke=\'%23FFF\' stroke-width=\'2\' fill=\'none\' x=\'195\' y=\'180\' width=\'10\' height=\'120\'/%3E%3Crect fill=\'%23228B22\' x=\'0\' y=\'170\' width=\'150\' height=\'10\'/%3E%3Crect fill=\'%23228B22\' x=\'250\' y=\'170\' width=\'150\' height=\'10\'/%3E%3Cpath d=\'M 170 250 Q 190 230 200 180\' stroke=\'%23FFF\' stroke-width=\'2\' fill=\'none\'/%3E%3Cpolygon fill=\'%23FFF\' points=\'197,183 200,180 203,183 200,175\'/%3E%3C/svg%3E',
        selectedOption: this.questionStates[this.currentQuestion - 1] ? 
          this.questionStates[this.currentQuestion - 1].selectedOption : null
      }
    },
    
    // 已回答题目数
    answeredCount() {
      return this.questionStates.filter(q => q.answered).length
    },
    
    // 已标记题目数
    flaggedCount() {
      return this.questionStates.filter(q => q.flagged).length
    },
    
    // 未回答题目数
    unansweredCount() {
      return 50 - this.answeredCount
    }
  },
  
  onLoad() {
    // 设置页面为横屏模式
    this.setLandscapeMode()
    // 初始化题目状态
    this.initQuestionStates()
    // 启动倒计时
    this.startTimer()
  },
  
  onUnload() {
    // 清理计时器
    if (this.timer) {
      clearInterval(this.timer)
    }
    // 恢复竖屏
    // #ifdef APP-PLUS
    plus.screen.lockOrientation('portrait-primary')
    // #endif
  },
  
  methods: {
    // 设置横屏模式
    setLandscapeMode() {
      // #ifdef APP-PLUS
      // APP端强制横屏
      plus.screen.lockOrientation('landscape-primary')
      // #endif
      
      // #ifdef H5
      // H5端提示横屏效果更佳
      const systemInfo = uni.getSystemInfoSync()
      if (systemInfo.windowWidth < systemInfo.windowHeight) {
        console.log('建议横屏使用以获得最佳体验')
      }
      // #endif
    },
    
    // 初始化题目状态
    initQuestionStates() {
      this.questionStates = Array(50).fill(null).map((_, index) => ({
        id: index + 1,
        answered: false,
        flagged: false,
        selectedOption: null,
        hasImage: index % 3 !== 0
      }))
      
      // 模拟一些已答题目
      ;[1, 2, 3, 4, 5, 6, 7, 8].forEach(q => {
        this.questionStates[q - 1].answered = true
        this.questionStates[q - 1].selectedOption = Math.floor(Math.random() * 4)
      })
      
      // 模拟一些标记的题目
      ;[3, 5, 7].forEach(q => {
        this.questionStates[q - 1].flagged = true
      })
    },
    
    // 启动倒计时
    startTimer() {
      this.timer = setInterval(() => {
        if (this.timeRemaining > 0) {
          this.timeRemaining--
        } else {
          clearInterval(this.timer)
          uni.showModal({
            title: 'Time is up!',
            content: 'The test will now end.',
            showCancel: false,
            success: () => {
              this.endTest()
            }
          })
        }
      }, 1000)
    },
    
    // 选择答案
    selectAnswer(index) {
      this.questionStates[this.currentQuestion - 1].answered = true
      this.questionStates[this.currentQuestion - 1].selectedOption = index
    },
    
    // 切换标记状态
    toggleFlag() {
      const current = this.questionStates[this.currentQuestion - 1]
      current.flagged = !current.flagged
    },
    
    // 下一题
    nextQuestion() {
      if (this.currentQuestion < 50) {
        this.goToQuestion(this.currentQuestion + 1)
      } else {
        uni.showToast({
          title: 'This is the last question. Click Review to check your answers.',
          icon: 'none',
          duration: 2000
        })
      }
    },
    
    // 上一题
    previousQuestion() {
      if (this.currentQuestion > 1) {
        this.goToQuestion(this.currentQuestion - 1)
      } else {
        uni.showToast({
          title: 'This is the first question.',
          icon: 'none',
          duration: 2000
        })
      }
    },
    
    // 播放音频
    playAudio() {
      uni.showToast({
        title: 'No audio available for this question',
        icon: 'none',
        duration: 2000
      })
    },
    
    // 显示Review面板
    showReview() {
      this.reviewVisible = true
    },
    
    // 关闭Review面板
    closeReview() {
      this.reviewVisible = false
    },
    
    // 处理遮罩层点击
    handleOverlayClick() {
      this.closeReview()
    },
    
    // 跳转到指定题目
    goToQuestion(questionNumber) {
      this.currentQuestion = questionNumber
      
      // 恢复该题目的选择状态
      const state = this.questionStates[questionNumber - 1]
      if (this.questionsData[questionNumber]) {
        this.questionsData[questionNumber].selectedOption = state.selectedOption
      }
    },
    
    // 从Review面板跳转到题目
    goToQuestionFromReview(questionNumber) {
      this.goToQuestion(questionNumber)
      this.closeReview()
    },
    
    // 结束考试
    endTest() {
      const unanswered = this.questionStates.filter(q => !q.answered).length
      uni.showModal({
        title: 'End Test',
        content: `Are you sure you want to end the test? You have ${unanswered} unanswered questions.`,
        success: (res) => {
          if (res.confirm) {
            uni.showToast({
              title: 'Test ended. Calculating results...',
              icon: 'none',
              duration: 2000
            })
            this.closeReview()
            // 这里可以添加跳转到结果页面的逻辑
          }
        }
      })
    }
  }
}
</script>

<style lang="scss">
/* 全局样式重置 */
page {
  width: 100%;
  height: 100%;
}

.container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #FFFFFF;
  overflow: hidden;
}

/* 顶部栏 */
.top-bar {
  background: #F5F5F5;
  padding: 12rpx 40rpx;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2rpx solid #E0E0E0;
  height: 80rpx;
  box-sizing: border-box;
}

.question-counter {
  font-size: 30rpx;
  font-weight: 600;
  color: #333333;
}

.time-remaining {
  font-size: 28rpx;
  color: #666666;
  font-weight: 500;
  transition: color 0.3s ease;
}

.time-remaining.warning {
  color: #CC0000;
  font-weight: 600;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* 主要内容区域 - 横屏优化 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: row;
  padding: 20rpx 30rpx;
  background: #FFFFFF;
  min-height: 0;
  box-sizing: border-box;
}

/* 当没有图片时，问题区域占满 */
.main-content.no-image .question-section {
  max-width: 100%;
  flex: 1;
}

/* 左侧问题区域 */
.question-section {
  flex: 1.2;
  display: flex;
  flex-direction: column;
  max-width: 55%;
  justify-content: space-between;
  padding-right: 30rpx;
  box-sizing: border-box;
}

.question-header {
  flex-shrink: 0;
}

.question-text {
  font-size: 34rpx;
  line-height: 1.45;
  color: #333333;
  margin-bottom: 20rpx;
  font-weight: 500;
  display: block;
}

.mark-instruction {
  font-size: 28rpx;
  color: #CC0000;
  font-weight: 500;
  margin-bottom: 24rpx;
  display: block;
}

/* 答案选项 */
.answer-options {
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: space-evenly;
}

.answer-option {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 24rpx 28rpx;
  background: #F9F9F9;
  border-radius: 16rpx;
  transition: all 0.2s ease;
  border: 4rpx solid transparent;
  min-height: 96rpx;
  margin-bottom: 16rpx;
  box-sizing: border-box;
}

.answer-checkbox {
  width: 48rpx;
  height: 48rpx;
  border: 4rpx solid #0099CC;
  border-radius: 8rpx;
  background: white;
  flex-shrink: 0;
  position: relative;
  transition: all 0.2s ease;
  margin-right: 24rpx;
}

.answer-option:active {
  background: #E8F4F8;
  transform: scale(0.98);
}

.answer-option.selected {
  background: #E8F4F8;
  border: 4rpx solid #0099CC;
}

.answer-option.selected .answer-checkbox {
  background: #0099CC;
}

.answer-option.selected .answer-checkbox::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 32rpx;
  font-weight: bold;
}

.answer-text {
  font-size: 30rpx;
  line-height: 1.35;
  color: #333333;
  flex: 1;
}

/* 右侧图片区域 */
.image-section {
  flex: 0.8;
  max-width: 45%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10rpx;
  box-sizing: border-box;
}

.question-image {
  width: 100%;
  height: 100%;
  border-radius: 12rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.12);
}

/* 底部控制栏 */
.bottom-controls {
  background: #E8E4DC;
  padding: 20rpx 30rpx;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border-top: 2rpx solid #D0D0C0;
  height: 140rpx;
  box-sizing: border-box;
}

.control-buttons {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex: 1;
}

.control-button {
  padding: 24rpx 40rpx;
  font-size: 32rpx;
  border: 4rpx solid #B0A090;
  border-radius: 16rpx;
  background: #FFFFFF;
  color: #333333;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 8rpx rgba(0,0,0,0.1);
  white-space: nowrap;
  font-weight: 500;
  min-height: 96rpx;
  margin-right: 20rpx;
  box-sizing: border-box;
}

.control-button:active {
  transform: scale(0.98);
  box-shadow: 0 2rpx 4rpx rgba(0,0,0,0.1);
}

/* 各按钮的特定样式 */
.control-button.previous {
  color: #CC0000;
}

.control-button.previous .arrow {
  color: #CC0000;
  font-size: 36rpx;
  margin-right: 16rpx;
}

.control-button.flag {
  color: #CC0000;
}

.control-button.flag .flag-icon {
  font-size: 40rpx;
  margin-right: 16rpx;
}

.control-button.flag.flagged {
  background: #FFE4E4;
  border-color: #CC0000;
}

.control-button.review {
  color: #CC0000;
}

.control-button.review .review-icon {
  font-size: 40rpx;
  margin-right: 16rpx;
}

.control-button.sound {
  padding: 24rpx 32rpx;
  min-width: 112rpx;
}

.control-button.sound .sound-icon {
  font-size: 40rpx;
}

.control-button.next {
  color: #CC0000;
  margin-left: auto;
  margin-right: 0;
}

.control-button.next .arrow {
  color: #CC0000;
  font-size: 36rpx;
  margin-left: 16rpx;
}

/* Review面板遮罩层 */
.review-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: none;
  z-index: 1000;
}

.review-overlay.active {
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease;
}

.review-panel {
  background: white;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 40rpx rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 1200rpx;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
}

.review-header {
  padding: 30rpx 40rpx;
  border-bottom: 4rpx solid #E0E0E0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background: #F5F5F5;
  border-radius: 24rpx 24rpx 0 0;
}

.review-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.review-close {
  width: 64rpx;
  height: 64rpx;
  border: none;
  background: #CC0000;
  color: white;
  border-radius: 50%;
  font-size: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.review-close:active {
  transform: scale(0.9);
}

.review-stats {
  padding: 24rpx 40rpx;
  background: #FFF9E6;
  border-bottom: 2rpx solid #E0E0E0;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: 28rpx;
  margin: 10rpx;
}

.stat-indicator {
  width: 40rpx;
  height: 40rpx;
  border-radius: 8rpx;
  border: 4rpx solid #999;
  margin-right: 12rpx;
}

.stat-indicator.answered {
  background: #4CAF50;
  border-color: #4CAF50;
}

.stat-indicator.flagged {
  background: #FF9800;
  border-color: #FF9800;
}

.stat-indicator.unanswered {
  background: white;
  border-color: #999;
}

.stat-bold {
  font-weight: 600;
}

.review-grid-container {
  flex: 1;
  padding: 40rpx;
}

.review-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 800rpx;
  margin: 0 auto;
}

.question-box {
  width: 120rpx;
  height: 120rpx;
  border: 4rpx solid #CCC;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  font-weight: 600;
  position: relative;
  background: white;
  margin: 10rpx;
}

.question-box:active {
  transform: scale(0.95);
}

.question-box.current {
  border-color: #0099CC;
  background: #E8F4F8;
  box-shadow: 0 0 0 6rpx rgba(0, 153, 204, 0.2);
}

.question-box.answered {
  background: #E8F5E9;
  border-color: #4CAF50;
  color: #2E7D32;
}

.question-box.flagged::after {
  content: '🚩';
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  font-size: 28rpx;
  background: white;
  border-radius: 50%;
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 8rpx rgba(0,0,0,0.2);
}

.review-footer {
  padding: 30rpx 40rpx;
  border-top: 4rpx solid #E0E0E0;
  display: flex;
  flex-direction: row;
  justify-content: center;
  background: #F5F5F5;
  border-radius: 0 0 24rpx 24rpx;
  box-sizing: border-box;
}

.review-action-btn {
  padding: 20rpx 40rpx;
  border: none;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 500;
  box-shadow: 0 4rpx 8rpx rgba(0,0,0,0.1);
  margin: 0 10rpx;
  box-sizing: border-box;
}

.review-action-btn.primary {
  background: #0099CC;
  color: white;
}

.review-action-btn.secondary {
  background: white;
  color: #333;
  border: 2rpx solid #CCC;
}

.review-action-btn:active {
  transform: scale(0.95);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    transform: translateY(40rpx);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 小屏幕横屏优化 */
@media screen and (max-height: 400px) {
  .top-bar {
    height: 72rpx;
    padding: 10rpx 30rpx;
    box-sizing: border-box;
  }
  
  .question-counter {
    font-size: 28rpx;
  }
  
  .time-remaining {
    font-size: 26rpx;
  }
  
  .main-content {
    padding: 16rpx 24rpx;
    box-sizing: border-box;
  }
  
  .question-text {
    font-size: 32rpx;
    margin-bottom: 16rpx;
  }
  
  .mark-instruction {
    font-size: 26rpx;
    margin-bottom: 20rpx;
  }
  
  .answer-option {
    padding: 20rpx 24rpx;
    min-height: 88rpx;
    box-sizing: border-box;
  }
  
  .answer-text {
    font-size: 28rpx;
  }
  
  .answer-checkbox {
    width: 44rpx;
    height: 44rpx;
  }
  
  .bottom-controls {
    height: 120rpx;
    padding: 16rpx 24rpx;
    box-sizing: border-box;
  }
  
  .control-button {
    font-size: 28rpx;
    padding: 20rpx 32rpx;
    min-height: 88rpx;
    box-sizing: border-box;
  }
  
  .review-grid {
    max-width: 1200rpx;
  }
  
  .question-box {
    width: 100rpx;
    height: 100rpx;
    font-size: 28rpx;
  }
}
</style>