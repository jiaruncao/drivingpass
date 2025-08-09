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
          <view class="mark-instruction">Mark one answer</view>
        </view>

        <view class="answer-options">
          <view 
            v-for="(option, index) in currentQuestionData.options" 
            :key="index"
            :class="['answer-option', currentQuestionData.selectedOption === index ? 'selected' : '']"
            @click="selectAnswer(index)"
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
        <button class="control-button previous" @click="previousQuestion">
          <text class="arrow">←</text>
          <text>Previous</text>
        </button>
        <button 
          :class="['control-button', 'flag', questionStates[currentQuestion - 1].flagged ? 'flagged' : '']" 
          @click="toggleFlag"
        >
          <text class="flag-icon">!</text>
          <text>Flag</text>
        </button>
        <button class="control-button review" @click="showReview">
          <text class="review-icon">👓</text>
          <text>Review</text>
        </button>
        <button class="control-button sound" @click="playAudio">
          <text class="sound-icon">🔊</text>
        </button>
      </view>
      <button class="control-button next" @click="nextQuestion">
        <text>Next</text>
        <text class="arrow">→</text>
      </button>
    </view>

    <!-- Review面板遮罩层 -->
    <view v-if="reviewVisible" class="review-overlay active" @click="handleOverlayClick">
      <view class="review-panel" @click.stop>
        <view class="review-header">
          <text class="review-title">Review Questions</text>
          <view class="review-close" @click="closeReview">×</view>
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
              @click="goToQuestionFromReview(state.id)"
            >
              <text>{{ state.id }}</text>
            </view>
          </view>
        </scroll-view>
        
        <view class="review-footer">
          <button class="review-action-btn secondary" @click="closeReview">Continue Test</button>
          <button class="review-action-btn primary" @click="endTest">End Test</button>
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
        imageUrl: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'300\' viewBox=\'0 0 400 300\'%3E%3Crect fill=\'%23587A8A\' width=\'400\' height=\'300\'/%3E%3Crect fill=\'%23404040\' x=\'0\' y=\'180\' width=\'400\' height=\'120\'/%3E%3Crect fill=\'%23FFF\' stroke-dasharray=\'15,8\' stroke=\'%23FFF\' stroke-width=\'2\' fill=\'none\' x=\'195\' y=\'180\' width=\'10\' height=\'120\'/%3E%3Crect fill=\'%238B7355\' x=\'300\' y=\'130\' width=\'80\' height=\'60\'/%3E%3Cpolygon fill=\'%23A0522D\' points=\'300,130 340,110 380,130\'/%3E%3Crect fill=\'%23228B22\' x=\'0\' y=\'170\' width=\'150\' height=\'10\'/%3E%3Crect fill=\'%23228B22\' x=\'250\' y=\'170\' width=\'150\' height=\'10\'/%3E%3Cpath d=\'M 170 250 Q 190 230 200 180\' stroke=\'%23FFF\' stroke-width=\'2\' fill=\'none\'/%3E%3Cpolygon fill=\'%23FFF\' points=\'197,183 200,180 203,183 200,175\'/%3E%3C/svg%3E',
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
  
  mounted() {
    // 初始化题目状态
    this.initQuestionStates()
    // 启动倒计时
    this.startTimer()
  },
  
  beforeDestroy() {
    // 清理计时器
    if (this.timer) {
      clearInterval(this.timer)
    }
  },
  
  methods: {
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

<style scoped>
/* 全局样式重置 */
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
  padding: 6px 20px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #E0E0E0;
  height: 40px;
  box-sizing: border-box;
}

.question-counter {
  font-size: 15px;
  font-weight: 600;
  color: #333333;
}

.time-remaining {
  font-size: 14px;
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

/* 主要内容区域 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: row;
  padding: 10px 15px;
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
  padding-right: 15px;
}

.question-header {
  flex-shrink: 0;
}

.question-text {
  font-size: 17px;
  line-height: 1.45;
  color: #333333;
  margin-bottom: 10px;
  font-weight: 500;
}

.mark-instruction {
  font-size: 14px;
  color: #CC0000;
  font-weight: 500;
  margin-bottom: 12px;
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
  padding: 12px 14px;
  background: #F9F9F9;
  border-radius: 8px;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  min-height: 48px;
  margin-bottom: 8px;
  box-sizing: border-box;
}

.answer-checkbox {
  width: 24px;
  height: 24px;
  border: 2px solid #0099CC;
  border-radius: 4px;
  background: white;
  flex-shrink: 0;
  position: relative;
  transition: all 0.2s ease;
  margin-right: 12px;
}

.answer-option:active {
  background: #E8F4F8;
  transform: scale(0.98);
}

.answer-option.selected {
  background: #E8F4F8;
  border: 2px solid #0099CC;
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
  font-size: 16px;
  font-weight: bold;
}

.answer-text {
  font-size: 15px;
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
  padding: 5px;
}

.question-image {
  width: 100%;
  height: 100%;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}

/* 底部控制栏 */
.bottom-controls {
  background: #E8E4DC;
  padding: 10px 15px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #D0D0C0;
  height: 70px;
}

.control-buttons {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  height: 100%;
}

.control-button {
  padding: 12px 20px;
  font-size: 16px;
  border: 2px solid #B0A090;
  border-radius: 8px;
  background: #FFFFFF;
  color: #333333;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  white-space: nowrap;
  font-weight: 500;
  min-height: 48px;
  margin-right: 10px;
  box-sizing: border-box;
  height: 100%;
}

.control-button:active {
  transform: scale(0.98);
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

/* 各按钮的特定样式 */
.control-button.previous {
  color: #CC0000;
}

.control-button.previous .arrow {
  color: #CC0000;
  font-size: 18px;
  margin-right: 8px;
}

.control-button.flag {
  color: #CC0000;
}

.control-button.flag .flag-icon {
  font-size: 20px;
  margin-right: 8px;
}

.control-button.flag.flagged {
  background: #FFE4E4;
  border-color: #CC0000;
}

.control-button.review {
  color: #CC0000;
}

.control-button.review .review-icon {
  font-size: 20px;
  margin-right: 8px;
}

.control-button.sound {
  padding: 12px 16px;
  min-width: 56px;
}

.control-button.sound .sound-icon {
  font-size: 20px;
}

.control-button.next {
  color: #CC0000;
  margin-left: auto;
  margin-right: 0;
}

.control-button.next .arrow {
  color: #CC0000;
  font-size: 18px;
  margin-left: 8px;
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
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
}

.review-header {
  padding: 15px 20px;
  border-bottom: 2px solid #E0E0E0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background: #F5F5F5;
  border-radius: 12px 12px 0 0;
  box-sizing: border-box;
}

.review-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.review-close {
  width: 32px;
  height: 32px;
  border: none;
  background: #CC0000;
  color: white;
  border-radius: 50%;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.review-close:active {
  transform: scale(0.9);
}

.review-stats {
  padding: 12px 20px;
  background: #FFF9E6;
  border-bottom: 1px solid #E0E0E0;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  flex-wrap: wrap;
  box-sizing: border-box;
}

.stat-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: 14px;
  /* margin: 5px; */
}

.stat-indicator {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 2px solid #999;
  margin-right: 6px;
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
  /* flex: 1;
  padding: 20px;
  box-sizing: border-box; */
  height: 200px; /* 已经设置 */
  width: 100%; /* 确保宽度正确 */
  padding: 20px;
  box-sizing: border-box;
  display: flex; /* 新增 */
  flex-direction: column; /* 新增 */
}

.review-grid {
  /* display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 400px;
  max-height: 100%;
  margin: 0 auto;
  overflow: hidden; /* 确保不会意外溢出 */
  display: grid;
  grid-template-columns: repeat(10, 60px); /* 每行10个60px的盒子 */
  gap: 5px;
  justify-content: center;
  /* max-width: 400px; */
}

.question-box {
  width: 60px;
  height: 60px;
  border: 2px solid #CCC;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  position: relative;
  background: white;
  margin: 5px;
}

.question-box:active {
  transform: scale(0.95);
}

.question-box.current {
  border-color: #0099CC;
  background: #E8F4F8;
  box-shadow: 0 0 0 3px rgba(0, 153, 204, 0.2);
}

.question-box.answered {
  background: #E8F5E9;
  border-color: #4CAF50;
  color: #2E7D32;
}

.question-box.flagged::after {
  content: '🚩';
  position: absolute;
  top: -5px;
  right: -5px;
  font-size: 14px;
  background: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.review-footer {
  padding: 15px 20px;
  border-top: 2px solid #E0E0E0;
  display: flex;
  flex-direction: row;
  justify-content: center;
  background: #F5F5F5;
  border-radius: 0 0 12px 12px;
  box-sizing: border-box;
}

.review-action-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin: 0 5px;
  box-sizing: border-box;
  height: 100%;
}

.review-action-btn.primary {
  background: #0099CC;
  color: white;
}

.review-action-btn.secondary {
  background: white;
  color: #333;
  border: 1px solid #CCC;
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
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 横屏模式优化 */
@media screen and (orientation: landscape) and (max-height: 600px) {
  .top-bar {
    height: 36px;
    padding: 5px 15px;
    box-sizing: border-box;
  }
  
  .question-counter {
    font-size: 14px;
  }
  
  .time-remaining {
    font-size: 13px;
  }
  
  .main-content {
    padding: 8px 12px;
    box-sizing: border-box;
  }
  
  .question-text {
    font-size: 16px;
    margin-bottom: 8px;
  }
  
  .mark-instruction {
    font-size: 13px;
    margin-bottom: 10px;
  }
  
  .answer-option {
    padding: 10px 12px;
    min-height: 44px;
    box-sizing: border-box;
  }
  
  .answer-text {
    font-size: 14px;
  }
  
  .answer-checkbox {
    width: 22px;
    height: 22px;
  }
  
  .bottom-controls {
    height: 60px;
    padding: 8px 12px;
    box-sizing: border-box;
  }
  
  .control-button {
    font-size: 14px;
    padding: 10px 16px;
    min-height: 44px;
    box-sizing: border-box;
  }
  
  /* .review-grid {
    max-width: 600px;
  } */
  
  .question-box {
    width: 50px;
    height: 50px;
    font-size: 14px;
  }
}

/* 竖屏模式 */
@media screen and (orientation: portrait) {
  .main-content {
    flex-direction: column;
    padding: 12px;
  }
  
  .question-section {
    max-width: 100%;
    flex: 0.55;
    justify-content: flex-start;
    padding-right: 0;
  }
  
  .image-section {
    max-width: 100%;
    flex: 0.45;
    padding: 8px;
  }
  
  .question-text {
    font-size: 16px;
    margin-bottom: 10px;
  }
  
  .answer-option {
    padding: 10px 12px;
    box-sizing: border-box;
  }
  
  .answer-text {
    font-size: 14px;
  }
}
</style>