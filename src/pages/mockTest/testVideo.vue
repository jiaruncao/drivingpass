<template>
  <view>
    <view class="container">
      <!-- 顶部栏 -->
      <view class="top-bar">
        <view class="question-counter">Video {{ currentQuestion }} of {{questionsData.length}}</view>
        <!-- <text :class="['time-remaining', timeRemaining <= 300 ? 'warning' : '']">
          Time: {{ formattedTime }}
        </text> -->
        
        <view style="display: flex;height: 100%;">
          <view class="control-button previous" @click="previousQuestion">
            <text class="arrow">←</text>
            <text>Previous</text>
          </view>
          <view class="control-button next" @click="nextQuestion">
            <text>Next</text>
            <text class="arrow">→</text>
          </view>
        </view>
      </view>
    
      <!-- 主要内容区域 -->
      <view :class="['main-content', !currentQuestionData.title_video_url ? 'no-image' : '']">
        <view class="video-container" @tap="addMarkAtCurrentTime">
          <view class="video-content">
            <!-- <view class="road-scene">
              <view class="road-lines"></view>
            </view> -->
            <video id="videoId" class="video" :autoplay="true" :controls="false" :show-center-play-btn="false" :src="currentQuestionData.title_video_url" muted playsinline></video>
          </view>
        </view>
        
        <view class="bottom-controls-video">
          <!-- 细进度条 -->
          <view class="thin-progress-bar">
            <view class="thin-progress-fill" :style="{width: progress + '%'}"></view>
          </view>
        
          <!-- 测试模式得分条 - 不显示得分区间，只显示灰色背景 -->
          <view class="score-bar-container">
            <!-- 全灰色背景，不显示得分 -->
            <view class="test-mode-bar"></view>
        
            <!-- 用户标记的旗子 -->
            <view class="user-marks">
              <view v-for="(mark, index) in userMarks" 
                    :key="mark.id"
                    class="user-mark" 
                    :style="{left: mark.position + '%'}"
                    @tap.stop="showMarkInfo(mark, index)">
                <view class="flag-container">
                  <view class="flag-pole"></view>
                  <view class="flag-banner"></view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      
      
      
      <!-- 底部控制栏 -->
      <!-- <view class="bottom-controls">
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
      </view> -->
    
      <!-- Review面板遮罩层 -->
      <view v-if="reviewVisible" class="review-overlay active" @click="handleOverlayClick">
        <view class="review-panel" @click.stop>
          <view class="review-header">
            <text class="review-title">Review Questions</text>
            <button class="review-close" @click="closeReview">×</button>
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
                  (index + 1) === currentQuestion ? 'current' : '',
                  state.answered ? 'answered' : '',
                  state.flagged ? 'flagged' : ''
                ]"
                @click="goToQuestionFromReview(index + 1)"
              >
                <text>{{ state.index }}</text>
              </view>
            </view>
          </scroll-view>
          
          <view class="review-footer">
            <view class="review-action-btn secondary" @click="closeReview">Continue Test</view>
            <view class="review-action-btn primary" @click="endTest">End Test</view>
          </view>
        </view>
      </view>
    </view>
    <u-modal width="400rpx" :show="modalShow" :title="modalTitle" :showCancelButton="showCancel" :content='modalContent' :cancelText="cancelText" :confirmText="confirmText" @cancel="cancel" @confirm="confirm"></u-modal>
  </view>
  
</template>

<script>
import {getExamQuestion, submitExamQuestion} from '@/http/api/testQuestions.js'
export default {
  data() {
    return {
      paper_id: null,
      // 题目数据
      paperInfo: {
        limit_time: 0,
        quantity: 0
      },
      // 当前题目编号
      currentQuestion: 1,
      // 倒计时剩余秒数
      timeRemaining: 57 * 60,
      // Review面板是否显示
      reviewVisible: false,
      // 计时器
      timer: null,
      
      // 题目状态数组
      questionStates: [],
      
      // 题目数据
      questionsData: [],
      
      modalShow: false,
      modalTitle: '',
      modalType: '',
      modalContent: '',
      cancelText: 'Cancel',
      confirmText: 'Confirm',
      showCancel: true,
      
      score_list: [],
      currentTime: 0, // 当前时间（秒）
      duration: 0, // 视频总时长（秒）
      progress: 0, // 进度百分比
      userMarks: [], // 用户标记的危险点
      playInterval: null, // 播放定时器
      clickCount: 0, // 点击计数
      recentClicks: [], // 最近的点击时间记录
      scoreDisqualified: false ,// 分数是否被取消
    }
  },
  
  computed: {
    // 当前题目数据
    currentQuestionData() {
      // 如果当前题号有特定数据，使用特定数据，否则使用默认数据
      if (this.questionsData[this.currentQuestion - 1]) {
        const data = this.questionsData[this.currentQuestion - 1]
        console.log(data)
        const state = this.questionStates[this.currentQuestion - 1]
        console.log('state', state)
        return {
          ...data,
          selectedOption: state ? state.selectedOption : null
        }
      }

      return {}
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
      return this.questionsData.length - this.answeredCount
    }
  },
  
  mounted() {
    this.getExamQuestion()

    // this.startAutoPlay();
  },

  beforeDestroy() {
    // 清理计时器
    if (this.timer) {
      clearInterval(this.timer)
    }
  },
  
  // onUnload() {
  //   console.log('恢复竖屏')
  //   // 页面卸载时恢复竖屏
  //   // #ifdef APP-PLUS
  //   plus.screen.lockOrientation('portrait-primary');
  //   // #endif
  // },
  
  methods: {
    // 取题
    getExamQuestion () {
      const videoMockTest = uni.getStorageSync('videoMockTest')
      // {
      //   paper_id: this.paper_id,
      //   videoData: this.videoData
      // }
      this.paper_id = videoMockTest.paper_id
      
      this.questionsData = videoMockTest.videoData
      
      this.duration = this.currentQuestionData.total_time
      
      this.startAutoPlay()
      
      this.initQuestionStates()
    },
    // 初始化题目状态
    initQuestionStates() {
      console.log('this.questionsData', this.questionsData)
      this.questionStates = this.questionsData.map((item, index) => ({
        index: index + 1,
        id: item.id,
        answered: false,
        flagged: false,
        selectedOption: null,
        hasImage: item.title_video_url ? true : false
      }))
      console.log('this.questionStates', this.questionStates)
    },
    

    // 切换标记状态
    toggleFlag() {
      const current = this.questionStates[this.currentQuestion - 1]
      current.flagged = !current.flagged
    },
    
    // 下一题
    nextQuestion() {
      console.log(this.questionStates)
      if (this.currentQuestion < this.questionsData.length) {
        this.goToQuestion(this.currentQuestion + 1)
      } else {
        uni.showToast({
          title: 'This is the last video. Click Review to check your answers.',
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
          title: 'This is the first video.',
          icon: 'none',
          duration: 2000
        })
      }
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
    confirm () {
      this.modalShow = false
      if (this.modalType === 'EndTest') {
        uni.showToast({
          title: 'Test ended. Calculating results...',
          icon: 'none',
          duration: 2000
        })
        this.closeReview()
        // 这里可以添加跳转到结果页面的逻辑
        submitExamQuestion({
          paper_id: this.paper_id,
          questions: this.questionStates.map(q => ({
            id: q.id,
            answer: q.selectedOption
          }))
        }).then(res => {
          console.log(res)
        })
      } else if (this.modalType === 'Finished') {
        clearInterval(this.timer)
      }
    },
    cancel () {
      this.modalShow = false
    },
    // 结束考试
    endTest() {
      const unanswered = this.questionStates.filter(q => !q.answered).length

      this.modalShow = true
      this.showCancel = true
      this.modalTitle =  'End Test'
      this.modalType = 'EndTest'
      this.modalContent = `Are you sure you want to end the test? You have ${unanswered} unanswered questions.`
    },
    endTestAfter () {
      
      this.modalShow = true
      this.showCancel = false
      this.modalTitle =  'Finished Multiple-Choice'
      this.modalType = 'Finished'
      this.modalContent = `You have finished answering multiple-choice questions and have 3 minutes to rest. You can also choose to skip and continue answering dangerous driving questions. Do you want to skip?`
    },
    // 自动播放
    startAutoPlay() {
      this.playInterval = setInterval(() => {
        if (this.currentTime < this.duration) {
          this.currentTime += 1;
          this.progress = (this.currentTime / this.duration) * 100;
        } else {
          clearInterval(this.playInterval);
          this.currentTime = this.duration;
          this.progress = 100;
          // 跳转到下一题
          this.nextQuestion()
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
      
      // 判断得分
      this.score_list.forEach((item) => {
        item.forEach(jtem => {
          if (this.progress >= jtem.startTime && this.progress <= jtem.endTime) {
            score = jtem.score;
          }
        })
      })
      console.log('this.progress', this.progress)
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
      // uni.showModal({
      //   title: '⚠️ Score Disqualified!',
      //   content: `You scored 0 for this video.\n\nReason: ${reason}`,
      //   showCancel: false,
      //   confirmText: 'OK'
      // });
      this.modalShow = true
      this.modalTitle =  '⚠️ Score Disqualified!'
      this.modalType = 'Score'
      this.showCancelButton = false
      this.confirmText = 'OK'
      this.modalContent = `You scored 0 for this video.\n\nReason: ${reason}`
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
  },
  onLoad (option) {
    // this.paper_id = option.paper_id
    
  }
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}
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
  padding: 0.375rem 1.25rem; /* 6px 20px → 0.375rem 1.25rem */
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border-bottom: 0.0625rem solid #E0E0E0; /* 1px → 0.0625rem */
  height: 2.5rem; /* 40px → 2.5rem */
}

.question-counter {
  font-size: 0.9375rem; /* 15px → 0.9375rem */
  font-weight: 600;
  color: #333333;
}

.time-remaining {
  font-size: 0.875rem; /* 14px → 0.875rem */
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
  /* padding: 0.625rem 0.9375rem; */
  background: #FFFFFF;
  min-height: 0;
  position: relative;
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
  padding-right: 0.9375rem; /* 15px → 0.9375rem */
  overflow: auto;
}

.question-header {
  flex-shrink: 0;
}

.question-text {
  font-size: 1.0625rem; /* 17px → 1.0625rem */
  line-height: 1.45;
  color: #333333;
  margin-bottom: 0.625rem; /* 10px → 0.625rem */
  font-weight: 500;
}

.mark-instruction {
  font-size: 0.875rem; /* 14px → 0.875rem */
  color: #CC0000;
  font-weight: 500;
  margin-bottom: 0.75rem; /* 12px → 0.75rem */
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
  padding: 0.75rem 0.875rem; /* 12px 14px → 0.75rem 0.875rem */
  background: #F9F9F9;
  border-radius: 0.5rem; /* 8px → 0.5rem */
  transition: all 0.2s ease;
  border: 0.125rem solid transparent; /* 2px → 0.125rem */
  min-height: 3rem; /* 48px → 3rem */
  margin-bottom: 0.5rem; /* 8px → 0.5rem */
}

.answer-checkbox {
  width: 1.5rem; /* 24px → 1.5rem */
  height: 1.5rem; /* 24px → 1.5rem */
  border: 0.125rem solid #0099CC; /* 2px → 0.125rem */
  border-radius: 0.25rem; /* 4px → 0.25rem */
  background: white;
  flex-shrink: 0;
  position: relative;
  transition: all 0.2s ease;
  margin-right: 0.75rem; /* 12px → 0.75rem */
}

.answer-option:active {
  background: #E8F4F8;
  transform: scale(0.98);
}

.answer-option.selected {
  background: #E8F4F8;
  border: 0.125rem solid #0099CC; /* 2px → 0.125rem */
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
  font-size: 1rem; /* 16px → 1rem */
  font-weight: bold;
}

.answer-text {
  font-size: 0.9375rem; /* 15px → 0.9375rem */
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
  padding: 0.3125rem; /* 5px → 0.3125rem */
}

.question-image {
  width: 100%;
  height: 100%;
  border-radius: 0.375rem; /* 6px → 0.375rem */
  box-shadow: 0 0.125rem 0.5rem rgba(0,0,0,0.12); /* 2px 8px → 0.125rem 0.5rem */
}

/* 底部控制栏 */
.bottom-controls {
  background: #E8E4DC;
  padding: 0.625rem 0.9375rem; /* 10px 15px → 0.625rem 0.9375rem */
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border-top: 0.0625rem solid #D0D0C0; /* 1px → 0.0625rem */
  height: 4.375rem; /* 70px → 4.375rem */
}

.control-buttons {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  height: 100%;
}

.control-button {
  font-size: 1rem; /* 16px → 1rem */
  border: 0.125rem solid #B0A090; /* 2px → 0.125rem */
  border-radius: 0.5rem; /* 8px → 0.5rem */
  background: #FFFFFF;
  color: #333333;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0.125rem 0.25rem rgba(0,0,0,0.1); /* 2px 4px → 0.125rem 0.25rem */
  white-space: nowrap;
  font-weight: 500;
  
  margin-right: 0.625rem; /* 10px → 0.625rem */
  height: 100%;
}

.control-button:active {
  transform: scale(0.98);
  box-shadow: 0 0.0625rem 0.125rem rgba(0,0,0,0.1); /* 1px 2px → 0.0625rem 0.125rem */
}

/* 各按钮的特定样式 */
.control-button.previous {
  color: #CC0000;
}

.control-button.previous .arrow {
  color: #CC0000;
  font-size: 1.125rem; /* 18px → 1.125rem */
  margin-right: 0.5rem; /* 8px → 0.5rem */
}

.control-button.flag {
  color: #CC0000;
}

.control-button.flag .flag-icon {
  font-size: 1.25rem; /* 20px → 1.25rem */
  margin-right: 0.5rem; /* 8px → 0.5rem */
}

.control-button.flag.flagged {
  background: #FFE4E4;
  border-color: #CC0000;
}

.control-button.review {
  color: #CC0000;
}

.control-button.review .review-icon {
  font-size: 1.25rem; /* 20px → 1.25rem */
  margin-right: 0.5rem; /* 8px → 0.5rem */
}

.control-button.sound {
  padding: 0.75rem 1rem; /* 12px 16px → 0.75rem 1rem */
  min-width: 3.5rem; /* 56px → 3.5rem */
}

.control-button.sound .sound-icon {
  font-size: 1.25rem; /* 20px → 1.25rem */
}

.control-button.next {
  color: #CC0000;
  margin-left: auto;
  margin-right: 0;
}

.control-button.next .arrow {
  color: #CC0000;
  font-size: 1.125rem; /* 18px → 1.125rem */
  margin-left: 0.5rem; /* 8px → 0.5rem */
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
  z-index: 500;
}

.review-overlay.active {
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease;
}

.review-panel {
  background: white;
  border-radius: 0.75rem; /* 12px → 0.75rem */
  box-shadow: 0 0.25rem 1.25rem rgba(0, 0, 0, 0.3); /* 4px 20px → 0.25rem 1.25rem */
  width: 90%;
  max-width: 37.5rem; /* 600px → 37.5rem */
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
}

.review-header {
  padding: 0.4375rem 1.25rem; /* 15px 20px → 0.9375rem 1.25rem */
  border-bottom: 0.125rem solid #E0E0E0; /* 2px → 0.125rem */
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background: #F5F5F5;
  border-radius: 0.75rem 0.75rem 0 0; /* 12px → 0.75rem */
}

.review-title {
  font-size: 1.125rem; /* 18px → 1.125rem */
  font-weight: 600;
  color: #333;
  flex: 1;
}

.review-close {
  width: 2rem; /* 32px → 2rem */
  height: 2rem; /* 32px → 2rem */
  border: none;
  background: #CC0000;
  color: white;
  border-radius: 50%;
  font-size: 1.125rem; /* 18px → 1.125rem */
  display: flex;
  align-items: center;
  justify-content: center;
}

.review-close:active {
  transform: scale(0.9);
}

.review-stats {
  padding: 0.55rem 1.25rem; /* 12px 20px → 0.75rem 1.25rem */
  background: #FFF9E6;
  border-bottom: 0.0625rem solid #E0E0E0; /* 1px → 0.0625rem */
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: 0.875rem; /* 14px → 0.875rem */
  /* margin: 0.3125rem; /* 5px → 0.3125rem */
}

.stat-indicator {
  width: 1.25rem; /* 20px → 1.25rem */
  height: 1.25rem; /* 20px → 1.25rem */
  border-radius: 0.25rem; /* 4px → 0.25rem */
  border: 0.125rem solid #999; /* 2px → 0.125rem */
  margin-right: 0.375rem; /* 6px → 0.375rem */
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
  width: 100%;
  max-height: 11.5rem;
}

.review-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: left;
  max-width: 25rem; /* 400px → 25rem */
  margin: 0 auto;
  padding: 0.625rem 0;
}

.question-box {
  width: 3.75rem; /* 60px → 3.75rem */
  height: 3.75rem; /* 60px → 3.75rem */
  border: 0.125rem solid #CCC; /* 2px → 0.125rem */
  border-radius: 0.5rem; /* 8px → 0.5rem */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem; /* 16px → 1rem */
  font-weight: 600;
  position: relative;
  background: white;
  margin: 0.3125rem; /* 5px → 0.3125rem */
}

.question-box:active {
  transform: scale(0.95);
}

.question-box.current {
  border-color: #0099CC;
  background: #E8F4F8;
  box-shadow: 0 0 0 0.1875rem rgba(0, 153, 204, 0.2); /* 3px → 0.1875rem */
}

.question-box.answered {
  background: #E8F5E9;
  border-color: #4CAF50;
  color: #2E7D32;
}

.question-box.flagged::after {
  content: '🚩';
  position: absolute;
  top: -0.3125rem; /* -5px → -0.3125rem */
  right: -0.3125rem; /* -5px → -0.3125rem */
  font-size: 0.875rem; /* 14px → 0.875rem */
  background: white;
  border-radius: 50%;
  width: 1.25rem; /* 20px → 1.25rem */
  height: 1.25rem; /* 20px → 1.25rem */
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0.125rem 0.25rem rgba(0,0,0,0.2); /* 2px 4px → 0.125rem 0.25rem */
}

.review-footer {
  padding: 0.7375rem 1.25rem; /* 15px 20px → 0.9375rem 1.25rem */
  border-top: 0.125rem solid #E0E0E0; /* 2px → 0.125rem */
  display: flex;
  flex-direction: row;
  justify-content: center;
  background: #F5F5F5;
  border-radius: 0 0 0.75rem 0.75rem; /* 12px → 0.75rem */
  height: 100%;
}

.review-action-btn {
  padding: 0.425rem 1.25rem; /* 10px 20px → 0.625rem 1.25rem */
  border: none;
  border-radius: 0.375rem; /* 6px → 0.375rem */
  font-size: 0.875rem; /* 14px → 0.875rem */
  font-weight: 500;
  box-shadow: 0 0.125rem 0.25rem rgba(0,0,0,0.1); /* 2px 4px → 0.125rem 0.25rem */
  margin: 0 0.3125rem; /* 5px → 0.3125rem */
  height: 100%;
}

.review-action-btn.primary {
  background: #0099CC;
  color: white;
}

.review-action-btn.secondary {
  background: white;
  color: #333;
  border: 0.0625rem solid #CCC; /* 1px → 0.0625rem */
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
    transform: translateY(1.25rem); /* 20px → 1.25rem */
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 横屏模式优化 */
@media screen and (orientation: landscape) and (max-height: 37.5rem) { /* 600px → 37.5rem */
  .top-bar {
    height: 2.25rem; /* 36px → 2.25rem */
    padding: 0.3125rem 0.9375rem; /* 5px 15px → 0.3125rem 0.9375rem */
  }
  
  .question-counter {
    font-size: 0.875rem; /* 14px → 0.875rem */
  }
  
  .time-remaining {
    font-size: 0.8125rem; /* 13px → 0.8125rem */
  }
  
  /* .main-content {
    padding: 0.5rem 0.75rem 0 0.75rem;
  } */
  
  .question-text {
    font-size: 1rem; /* 16px → 1rem */
    margin-bottom: 0.5rem; /* 8px → 0.5rem */
  }
  
  .mark-instruction {
    font-size: 0.8125rem; /* 13px → 0.8125rem */
    margin-bottom: 0.625rem; /* 10px → 0.625rem */
  }
  
  .answer-option {
    padding: 0.625rem 0.75rem; /* 10px 12px → 0.625rem 0.75rem */
    min-height: 2.75rem; /* 44px → 2.75rem */
  }
  
  .answer-text {
    font-size: 0.875rem; /* 14px → 0.875rem */
  }
  
  .answer-checkbox {
    width: 1.375rem; /* 22px → 1.375rem */
    height: 1.375rem; /* 22px → 1.375rem */
  }
  
  .bottom-controls {
    height: 3.75rem; /* 60px → 3.75rem */
    padding: 0.5rem 0.75rem; /* 8px 12px → 0.5rem 0.75rem */
  }
  
  .control-button {
    font-size: 0.875rem; /* 14px → 0.875rem */
    padding: 0.625rem 1rem; /* 10px 16px → 0.625rem 1rem */
    
  }
  
  .review-grid {
    max-width: 37.5rem; /* 600px → 37.5rem */
  }
  
  .question-box {
    width: 3.125rem; /* 50px → 3.125rem */
    height: 3.125rem; /* 50px → 3.125rem */
    font-size: 0.875rem; /* 14px → 0.875rem */
  }
  
  .review-panel {
    max-height: 90vh;
    max-width: 43.75rem;
  }
}

/* 竖屏模式 */
@media screen and (orientation: portrait) {
  .main-content {
    flex-direction: column;
    padding: 0.75rem; /* 12px → 0.75rem */
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
    padding: 0.5rem; /* 8px → 0.5rem */
  }
  
  .question-text {
    font-size: 1rem; /* 16px → 1rem */
    margin-bottom: 0.625rem; /* 10px → 0.625rem */
  }
  
  .answer-option {
    padding: 0.625rem 0.75rem; /* 10px 12px → 0.625rem 0.75rem */
  }
  
  .answer-text {
    font-size: 0.875rem; /* 14px → 0.875rem */
  }
}

/* 视频容器 */
.video-container {
  position: relative;
  width: 100%;
  flex: 1;
  background: #1a1a1a;
  overflow: hidden;
  padding: 0;
  margin: 0;
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

.video-content .video {
  width: 100%;
  height: 100%;
  object-fit: fill;
}

/* 底部控制区域 */
.bottom-controls-video {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1.9375rem; /* 56rpx → 3.5rem */
  background: transparent;
}

/* 细进度条 */
.thin-progress-bar {
  position: absolute;
  height: 1.5625rem; /* 50rpx → 3.125rem */
  left: 0;
  right: 0;
  height: 0.375rem; /* 6rpx → 0.375rem */
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
  height: 1.5625rem; /* 50rpx → 3.125rem */
  display: flex;
  align-items: stretch;
  background: #f5f5f5;
}

/* 测试模式条 - 全灰色 */
.test-mode-bar {
  position: absolute;
  width: 100%;
  height: 100%;
  /* background: #a0a0a0; */
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

/* 旗子样式 */
.flag-container {
  position: relative;
  width: 1.25rem; /* 40rpx → 2.5rem */
  height: 1.5625rem; /* 50rpx → 3.125rem */
}

.flag-pole {
  position: absolute;
  left: 0;
  top: 0;
  width: 0.125rem; /* 4rpx → 0.25rem */
  height: 1.5625rem; /* 50rpx → 3.125rem */
  background: #333;
}

.flag-banner {
  position: absolute;
  left: 0.125rem; /* 4rpx → 0.25rem */
  top: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0.375rem 0 0.375rem 0.75rem; /* 12rpx 0 12rpx 24rpx → 0.75rem 0 0.75rem 1.5rem */
  border-color: transparent transparent transparent #FF0000;
  filter: drop-shadow(0 0.0625rem 0.1875rem rgba(0,0,0,0.3)); /* 2rpx 6rpx → 0.125rem 0.375rem */
}
</style>