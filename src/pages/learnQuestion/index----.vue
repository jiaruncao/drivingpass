<template>
  <view class="app" :class="fontSizeClass">
    <!-- 极简头部 -->
    <view class="header">
      <button class="back-button" @tap="goBack">
        <view class="back-arrow"></view>
      </button>
      <view style="flex: 1;"></view>
      <button class="settings-button" @tap="openSettings">Settings</button>
    </view>

    <!-- Settings 弹窗 -->
    <view class="settings-overlay" :class="{ active: showSettings }" @tap="closeSettings">
      <view class="settings-panel" @tap.stop>
        <view class="settings-header">
          <text class="settings-title">Settings</text>
          <button class="close-settings" @tap="closeSettings">
            <view class="close-icon">×</view>
          </button>
        </view>

        <!-- 设置选项 -->
        <view class="setting-item">
          <view class="setting-row">
            <text class="setting-label">Auto-advance to Next Question</text>
            <view class="toggle-switch" :class="{ active: settings.autoAdvance }" @tap="toggleAutoAdvance"></view>
          </view>
          <text class="setting-description">
            Automatically move to the next question after answering correctly
          </text>
        </view>

        <view class="setting-item">
          <view class="setting-row">
            <text class="setting-label">Voice Auto-read Questions</text>
            <view class="toggle-switch" :class="{ active: settings.voiceAutoRead }" @tap="toggleVoiceAutoRead"></view>
          </view>
          <text class="setting-description">
            Automatically read questions aloud when you navigate to them
          </text>
        </view>

        <view class="setting-item">
          <view class="setting-row">
            <text class="setting-label">Streak Celebration</text>
            <view class="toggle-switch" :class="{ active: settings.streakCelebration }" @tap="toggleStreakCelebration"></view>
          </view>
          <text class="setting-description">
            Show celebration animation when you get multiple correct answers in a row
          </text>
        </view>

        <view class="setting-item">
          <text class="setting-label">Font Size</text>
          <view class="font-size-slider">
            <view class="slider-container">
              <slider class="range-slider" 
                      :value="settings.fontSize * 25" 
                      :min="25" 
                      :max="100" 
                      :step="25"
                      @change="onFontSizeChange"
                      activeColor="#667eea"
                      backgroundColor="#e5e7eb"
                      block-color="#ffffff"
                      block-size="28"/>
            </view>
            <view class="slider-labels">
              <text class="slider-label">Small</text>
              <text class="slider-label">Medium</text>
              <text class="slider-label">Large</text>
              <text class="slider-label">Extra Large</text>
            </view>
          </view>
        </view>

        <view class="setting-item">
          <text class="setting-label">Theme</text>
          <view class="theme-options">
            <view class="theme-option" :class="{ active: settings.theme === 'light' }" @tap="setTheme('light')">
              <text class="theme-icon">☀️</text>
              <text class="theme-label">Light</text>
            </view>
            <view class="theme-option" :class="{ active: settings.theme === 'dark' }" @tap="setTheme('dark')">
              <text class="theme-icon">🌙</text>
              <text class="theme-label">Dark</text>
            </view>
            <view class="theme-option" :class="{ active: settings.theme === 'system' }" @tap="setTheme('system')">
              <text class="theme-icon">⚙️</text>
              <text class="theme-label">System</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 连续答对庆祝动画 -->
    <view v-if="showStreakCelebration" class="streak-celebration">🎉</view>

    <!-- 滑动容器 -->
    <swiper class="swipe-container" 
            :current="currentQuestionIndex"
            @change="onSwiperChange"
            :duration="300">
      <!-- 每道题一个滑动页 -->
      <swiper-item v-for="(question, index) in questions" :key="index">
        <scroll-view scroll-y class="slide" @scroll="onScroll"
    :scroll-with-animation="true">
          <view class="question-page">
            <!-- 题目区域 -->
            <view class="question-section">
              <!-- 题目头部 -->
              <view class="question-header">
                <!-- 音频播放按钮 -->
                <button class="audio-button" 
                        :class="{ playing: playingIndex === index }"
                        @tap="playAudio(index)">
                  <text class="audio-icon">🔊</text>
                </button>
                <!-- 题目文本 -->
                <text class="question-text">{{ question.text }}</text>
              </view>

              <!-- 题目图片 -->
              <view class="question-image" v-if="question.hasImage">
                <view class="driving-scene">
                  <view class="road-perspective">
                    <view class="road-markings"></view>
                  </view>
                  <view class="floating-sign">{{ question.sign || 'P' }}</view>
                </view>
              </view>
            </view>

            <!-- 选项列表 -->
            <view class="options-list">
              <view v-for="(option, optIndex) in question.options" 
                   :key="optIndex"
                   class="option-item"
                   :class="{
                     selected: question.selectedOption === optIndex && !question.showAnswer,
                     correct: question.showAnswer && option.isCorrect,
                     incorrect: question.showAnswer && question.selectedOption === optIndex && !option.isCorrect
                   }"
                   @tap="selectOption(index, optIndex)">
                <view class="option-label">
                  <text v-if="!question.showAnswer || (!option.isCorrect && question.selectedOption !== optIndex)">{{ option.label }}</text>
                  <text v-else-if="option.isCorrect" class="option-label-icon check">✔</text>
                  <text v-else-if="question.selectedOption === optIndex && !option.isCorrect" class="option-label-icon cross">✗</text>
                </view>
                <text class="option-text">{{ option.text }}</text>
              </view>
            </view>

            <!-- Key Point - 极简设计，直接跟在选项后面 -->
            <view v-if="question.showAnswer && !isCorrectAnswer(question)" class="key-point-section">
              <text class="key-point-text">💡 {{ question.keyPoint }}</text>
            </view>

            <!-- AI解释 - 只在答错时显示 -->
            <view v-if="question.showAnswer && !isCorrectAnswer(question)" class="ai-explanation">
              <view class="ai-header">
                <view class="ai-avatar">
                  <text class="ai-avatar-icon">🤖</text>
                </view>
                <text class="ai-title">AI Explanation</text>
              </view>
              <view class="ai-content">
                <text>{{ question.aiExplanation }}</text>
                <text class="remember-tip">
                  <text class="strong">Remember:</text> {{ question.rememberTip || 'Always check your mirrors and follow the Highway Code.' }}
                </text>
              </view>
            </view>

            <!-- 统计信息 - 只在答错时显示 -->
            <view v-if="question.showAnswer && !isCorrectAnswer(question)" class="stats-container">
              <view class="stat-card">
                <text class="stat-label">Difficulty Level</text>
                <view class="difficulty-visual">
                  <view v-for="i in 5" :key="i" 
                       class="difficulty-bar" 
                       :class="{ active: i <= question.difficulty }"></view>
                </view>
              </view>
              <view class="stat-card">
                <text class="stat-label">Pass Rate</text>
                <view class="accuracy-visual">
                  <view class="accuracy-circle" :style="{ '--accuracy': question.accuracy }">
                    <text class="accuracy-value">{{ question.accuracy }}%</text>
                  </view>
                </view>
              </view>
            </view>

            <!-- 社区评论区 - 只在答错时显示 -->
            <view v-if="question.showAnswer && !isCorrectAnswer(question)" class="comments-section">
              <view class="comments-header">
                <text>Community Discussion</text>
                <text class="comments-count">{{ question.comments.length }} comments</text>
              </view>
              
              <!-- 评论列表 -->
              <view v-for="(comment, cIndex) in question.displayedComments" :key="comment.id" class="comment-item">
                <!-- 精选标签 -->
                <view v-if="comment.featured" class="featured-badge">
                  <text>🌟 Featured</text>
                </view>
                
                <view class="comment-header">
                  <view class="comment-avatar">
                    <text>{{ comment.avatar }}</text>
                  </view>
                  <view class="comment-info">
                    <text class="comment-username">{{ comment.username }}</text>
                    <text class="comment-meta">{{ comment.testCentre }}</text>
                  </view>
                  <view class="comment-actions">
                    <button class="comment-like-button" :class="{ liked: comment.isLiked }" @tap="toggleCommentLike(comment)">
                      <text class="comment-like-icon">{{ comment.isLiked ? '❤️' : '🤍' }}</text>
                      <text class="comment-like-count">{{ comment.likes }}</text>
                    </button>
                    <button class="comment-reply-button" @tap="replyToComment(comment)">
                      <text class="comment-reply-icon">💬</text>
                      <text class="comment-reply-label">Reply</text>
                    </button>
                  </view>
                </view>
                <text class="comment-text">{{ comment.content }}</text>
                
                <!-- 回复列表 - 只显示前2条 -->
                <view v-if="comment.replies && comment.replies.length > 0" class="replies-container">
                  <view v-for="(reply, replyIndex) in comment.displayedReplies" :key="reply.id" class="reply-item">
                    <view class="reply-header">
                      <view class="reply-avatar">
                        <text>{{ reply.avatar }}</text>
                      </view>
                      <view class="reply-info">
                        <text class="reply-username">{{ reply.username }}</text>
                        <text class="reply-meta">{{ reply.testCentre || 'Birmingham' }}</text>
                      </view>
                      <view class="reply-actions">
                        <button class="reply-like-button" :class="{ liked: reply.isLiked }" @tap="toggleReplyLike(comment, reply)">
                          <text class="reply-like-icon">{{ reply.isLiked ? '❤️' : '🤍' }}</text>
                          <text class="reply-like-count">{{ reply.likes || 0 }}</text>
                        </button>
                        <button class="comment-reply-button" @tap="replyToReply(comment, reply)">
                          <text class="comment-reply-label">Reply</text>
                        </button>
                      </view>
                    </view>
                    <text class="reply-text">{{ reply.text }}</text>
                  </view>
                  
                  <!-- Load more replies - 超过2条时显示 -->
                  <view v-if="comment.replies.length > 2 && !comment.showAllReplies" class="load-more-replies">
                    <text class="load-more-replies-text" @tap="loadMoreReplies(comment)">
                      View more replies ({{ comment.replies.length - 2 }} more)
                    </text>
                  </view>
                </view>
              </view>

              <!-- 加载更多评论 -->
              <view v-if="!question.showAllComments">
                <button v-if="question.comments.length > 3" 
                        class="view-more-button" 
                        @tap="showMoreComments(question)">
                  View More Comments ({{ question.comments.length - 3 }} more)
                </button>
              </view>
              
              <!-- 加载中提示 -->
              <view v-if="question.isLoadingComments" class="load-more-container">
                <view class="loading-spinner"></view>
              </view>
            </view>
          </view>
        </scroll-view>
      </swiper-item>
    </swiper>

    <!-- 底部操作栏 -->
    <view class="bottom-bar" :class="{ 'comment-mode': showCommentInput }">
      <!-- 普通模式：显示Save和题号 -->
      <view v-if="!showCommentInput" class="save-section">
        <button class="save-button" :class="{ saved: currentQuestion.isSaved }" @tap="toggleSave">
          <text class="save-icon">{{ currentQuestion.isSaved ? '⭐' : '☆' }}</text>
          <text>Save</text>
        </button>
        <view class="question-counter" @tap="showQuestionList">
          {{ currentQuestionIndex + 1 }}/{{ totalQuestions }}
        </view>
      </view>
      
      <!-- 评论模式：显示评论输入框 -->
      <view v-else class="comment-input-bottom">
        <input type="text" 
               class="comment-input-field" 
               v-model="commentText"
               placeholder="Leave your comment..."
               @confirm="sendComment">
        <button class="send-button" @tap="sendComment">
          <text>➤</text>
        </button>
      </view>
    </view>

    <!-- 滑动提示 -->
    <view class="swipe-hint" v-if="showSwipeHint">Swipe left or right to navigate</view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 核心状态
      currentQuestionIndex: 0, // 当前题目索引（从0开始）
      totalQuestions: 1590, // 题目总数
      playingIndex: null, // 正在播放音频的题目索引
      showSwipeHint: true, // 显示滑动提示
      showSettings: false, // 显示设置面板
      showStreakCelebration: false, // 显示连续答对庆祝
      correctStreak: 0, // 连续答对数
      commentText: '', // 评论输入
      showCommentInput: false, // 是否显示评论输入框
      audioContext: null, // 音频上下文
      
      // 设置选项
      settings: {
        autoAdvance: true, // 答对自动跳转
        voiceAutoRead: false, // 语音自动读题
        streakCelebration: true, // 连续答对庆祝
        fontSize: 2, // 字体大小 (1-4: small, medium, large, extra-large)
        theme: 'system' // 主题模式
      },
      
      // 题目数据数组
      questions: []
    }
  },
  
  computed: {
    // 当前题目
    currentQuestion() {
      return this.questions[this.currentQuestionIndex] || this.questions[0];
    },
    
    // 字体大小类名
    fontSizeClass() {
      const sizes = ['font-size-small', 'font-size-medium', 'font-size-large', 'font-size-extra-large'];
      return sizes[this.settings.fontSize - 1];
    }
  },
  
  methods: {
    onScroll(e) {
      console.log(e)
        // 只在答错时才需要切换评论输入框
        if (!this.currentQuestion.showAnswer || this.isCorrectAnswer(this.currentQuestion)) {
          this.showCommentInput = false;
          return;
        }
        
        // 获取滚动位置
        const scrollTop = e.detail.scrollTop;
        const scrollHeight = e.detail.scrollHeight;
        const clientHeight = e.detail.clientHeight;
        
        // 判断是否滚动到评论区（页面下半部分）
        const scrollPercentage = scrollTop / scrollHeight;
        
        // 当滚动超过50%时显示评论输入框
        this.showCommentInput = scrollPercentage > 0.3;
        console.log(this.showCommentInput)
      },
    // 返回上一页
    goBack() {
      uni.navigateBack({
        fail: () => {
          // 如果没有上一页，返回首页
          uni.switchTab({
            url: '/pages/index/index'
          });
        }
      });
    },
    
    // 打开设置面板
    openSettings() {
      this.showSettings = true;
    },
    
    // 关闭设置面板
    closeSettings() {
      this.showSettings = false;
      // 保存设置到本地存储
      this.saveSettings();
    },
    
    // 切换自动前进
    toggleAutoAdvance() {
      this.settings.autoAdvance = !this.settings.autoAdvance;
      this.saveSettings();
    },
    
    // 切换语音自动读题
    toggleVoiceAutoRead() {
      this.settings.voiceAutoRead = !this.settings.voiceAutoRead;
      if (this.settings.voiceAutoRead) {
        this.readCurrentQuestion();
      }
      this.saveSettings();
    },
    
    // 切换连续答对庆祝
    toggleStreakCelebration() {
      this.settings.streakCelebration = !this.settings.streakCelebration;
      this.saveSettings();
    },
    
    // 设置主题
    setTheme(theme) {
      this.settings.theme = theme;
      this.applyTheme();
      this.saveSettings();
    },
    
    // 应用主题
    applyTheme() {
      // UniApp中主题切换需要通过全局样式或条件编译实现
      uni.setStorageSync('theme', this.settings.theme);
      
      // 通知全局主题变化
      getApp().globalData.theme = this.settings.theme;
      
      // 刷新页面样式
      this.$forceUpdate();
    },
    
    // 字体大小改变
    onFontSizeChange(e) {
      this.settings.fontSize = Math.round(e.detail.value / 25);
      this.saveSettings();
    },
    
    // Swiper切换事件
    onSwiperChange(e) {
      this.currentQuestionIndex = e.detail.current;
      
      // 清空评论输入框状态
      this.showCommentInput = false;
      this.commentText = '';
      
      // 如果开启了语音自动读题
      if (this.settings.voiceAutoRead) {
        this.readCurrentQuestion();
      }
      
      // 保存学习进度
      this.saveProgress();
    },
    
    // 播放音频
    playAudio(index) {
      if (this.playingIndex === index) {
        // 停止播放
        this.stopAudio();
      } else {
        // 开始播放
        this.playingIndex = index;
        
        // 创建音频上下文
        if (!this.audioContext) {
          this.audioContext = uni.createInnerAudioContext();
        }
        
        // 设置音频源（实际应用中替换为真实音频文件）
        this.audioContext.src = '/static/audio/question_' + index + '.mp3';
        
        // 播放音频
        this.audioContext.play();
        
        // 监听播放结束
        this.audioContext.onEnded(() => {
          this.playingIndex = null;
        });
        
        // 监听播放错误
        this.audioContext.onError((err) => {
          console.error('音频播放错误:', err);
          this.playingIndex = null;
          
          // 如果音频文件不存在，使用TTS朗读
          this.readQuestionWithTTS(index);
        });
      }
    },
    
    // 停止音频播放
    stopAudio() {
      if (this.audioContext) {
        this.audioContext.stop();
      }
      this.playingIndex = null;
    },
    
    // 使用TTS朗读题目
    readQuestionWithTTS(index) {
      const question = this.questions[index];
      if (!question) return;
      
      // UniApp中可以使用插件实现TTS功能
      // 这里使用模拟的方式
      uni.showToast({
        title: 'Reading question...',
        icon: 'none',
        duration: 2000
      });
      
      // 模拟播放时间
      setTimeout(() => {
        this.playingIndex = null;
      }, 3000);
    },
    
    // 读当前题目
    readCurrentQuestion() {
      if (!this.currentQuestion) return;
      this.readQuestionWithTTS(this.currentQuestionIndex);
    },
    
    // 选择选项
    selectOption(questionIndex, optionIndex) {
      const question = this.questions[questionIndex];
      if (question.showAnswer) return; // 已经答过了
      
      // 记录选择
      question.selectedOption = optionIndex;
      question.showAnswer = true;
      
      // 判断是否答对
      const isCorrect = question.options[optionIndex].isCorrect;
      
      if (isCorrect) {
        // 答对了
        this.handleCorrectAnswer();
      } else {
        // 答错了
        this.handleIncorrectAnswer();
      }
      
      // 保存答题记录
      this.saveAnswerRecord(questionIndex, optionIndex, isCorrect);
    },
    
    // 处理答对
    handleCorrectAnswer() {
      this.correctStreak++;
      
      // 显示连续答对庆祝
      if (this.settings.streakCelebration && this.correctStreak >= 3) {
        this.showCelebration();
      }
      
      // 自动跳转下一题
      if (this.settings.autoAdvance) {
        setTimeout(() => {
          this.goToNextQuestion();
        }, 1000);
      }
      
      // 播放成功音效
      this.playSuccessSound();
    },
    
    // 处理答错
    handleIncorrectAnswer() {
      this.correctStreak = 0;
      
      // 震动反馈
      uni.vibrateShort({
        type: 'light'
      });
      
      // 播放错误音效
      this.playErrorSound();
    },
    
    // 显示庆祝动画
    showCelebration() {
      this.showStreakCelebration = true;
      setTimeout(() => {
        this.showStreakCelebration = false;
      }, 600);
    },
    
    // 播放成功音效
    playSuccessSound() {
      // 实际应用中播放音效文件
      console.log('Play success sound');
    },
    
    // 播放错误音效
    playErrorSound() {
      // 实际应用中播放音效文件
      console.log('Play error sound');
    },
    
    // 前往下一题
    goToNextQuestion() {
      if (this.currentQuestionIndex < this.questions.length - 1) {
        this.currentQuestionIndex++;
        
        // 如果开启了语音自动读题
        if (this.settings.voiceAutoRead) {
          this.$nextTick(() => {
            this.readCurrentQuestion();
          });
        }
      } else {
        // 已经是最后一题
        this.showCompletionDialog();
      }
    },
    
    // 显示完成对话框
    showCompletionDialog() {
      uni.showModal({
        title: 'Congratulations!',
        content: 'You have completed all questions. Would you like to review your answers?',
        confirmText: 'Review',
        cancelText: 'Exit',
        success: (res) => {
          if (res.confirm) {
            this.enterReviewMode();
          } else {
            this.goBack();
          }
        }
      });
    },
    
    // 进入复习模式
    enterReviewMode() {
      // 跳转到错题复习页面
      uni.navigateTo({
        url: '/pages/review/review'
      });
    },
    
    // 判断是否答对
    isCorrectAnswer(question) {
      if (question.selectedOption === null) return false;
      return question.options[question.selectedOption].isCorrect;
    },
    
    // 切换评论点赞
    toggleCommentLike(comment) {
      comment.isLiked = !comment.isLiked;
      comment.likes += comment.isLiked ? 1 : -1;
      
      // 保存点赞状态
      this.saveLikeStatus(comment.id, comment.isLiked);
    },
    
    // 回复评论
    replyToComment(comment) {
      this.showCommentInput = true;
      this.commentText = `@${comment.username} `;
      
      // 聚焦输入框
      this.$nextTick(() => {
        // UniApp中需要使用特定方式聚焦输入框
        console.log('Focus comment input');
      });
    },
    
    // 回复回复
    replyToReply(comment, reply) {
      this.showCommentInput = true;
      this.commentText = `@${reply.username} `;
    },
    
    // 切换回复点赞
    toggleReplyLike(comment, reply) {
      reply.isLiked = !reply.isLiked;
      if (!reply.likes) reply.likes = 0;
      reply.likes += reply.isLiked ? 1 : -1;
      
      // 保存点赞状态
      this.saveLikeStatus(`reply_${reply.id}`, reply.isLiked);
    },
    
    // 加载更多回复
    loadMoreReplies(comment) {
      comment.showAllReplies = true;
      
      // 实际应用中从服务器加载更多回复
      this.fetchMoreReplies(comment.id);
    },
    
    // 显示更多评论
    showMoreComments(question) {
      question.showAllComments = true;
      
      // 模拟异步加载
      if (!question.isLoadingComments) {
        question.isLoadingComments = true;
        
        // 从服务器加载更多评论
        this.fetchMoreComments(question).then(() => {
          question.isLoadingComments = false;
        });
      }
    },
    
    // 发送评论
    sendComment() {
      if (!this.commentText.trim()) return;
      
      const newComment = {
        id: Date.now(),
        avatar: 'U',
        username: 'You',
        content: this.commentText,
        testCentre: this.getUserTestCentre(),
        likes: 0,
        isLiked: false,
        featured: false,
        replies: [],
        showAllReplies: false,
        get displayedReplies() {
          return this.showAllReplies ? this.replies : this.replies.slice(0, 2);
        }
      };
      
      // 添加评论到当前题目
      this.currentQuestion.comments.unshift(newComment);
      
      // 清空输入
      this.commentText = '';
      this.showCommentInput = false;
      
      // 发送到服务器
      this.submitComment(newComment);
      
      // 显示成功提示
      uni.showToast({
        title: 'Comment posted',
        icon: 'success'
      });
    },
    
    // 切换收藏状态
    toggleSave() {
      this.currentQuestion.isSaved = !this.currentQuestion.isSaved;
      
      // 保存收藏状态
      this.saveBookmark(this.currentQuestionIndex, this.currentQuestion.isSaved);
      
      // 显示提示
      uni.showToast({
        title: this.currentQuestion.isSaved ? 'Saved' : 'Removed',
        icon: 'none',
        duration: 1500
      });
    },
    
    // 显示题目列表
    showQuestionList() {
      // 跳转到题目列表页面
      uni.navigateTo({
        url: `/pages/question-list/question-list?current=${this.currentQuestionIndex}`
      });
    },
    
    // 获取用户考试中心
    getUserTestCentre() {
      // 从本地存储或用户信息中获取
      return uni.getStorageSync('userTestCentre') || 'Birmingham';
    },
    
    // 保存设置到本地存储
    saveSettings() {
      uni.setStorageSync('theoryTestSettings', this.settings);
    },
    
    // 加载设置
    loadSettings() {
      const savedSettings = uni.getStorageSync('theoryTestSettings');
      if (savedSettings) {
        Object.assign(this.settings, savedSettings);
      }
    },
    
    // 保存学习进度
    saveProgress() {
      const progress = {
        currentIndex: this.currentQuestionIndex,
        totalQuestions: this.totalQuestions,
        timestamp: Date.now()
      };
      uni.setStorageSync('theoryTestProgress', progress);
    },
    
    // 加载学习进度
    loadProgress() {
      const progress = uni.getStorageSync('theoryTestProgress');
      if (progress) {
        this.currentQuestionIndex = progress.currentIndex || 0;
      }
    },
    
    // 保存答题记录
    saveAnswerRecord(questionIndex, optionIndex, isCorrect) {
      const record = {
        questionId: this.questions[questionIndex].id || questionIndex,
        selectedOption: optionIndex,
        isCorrect: isCorrect,
        timestamp: Date.now()
      };
      
      // 保存到本地存储
      let records = uni.getStorageSync('answerRecords') || [];
      records.push(record);
      uni.setStorageSync('answerRecords', records);
      
      // 同步到服务器
      this.syncAnswerRecord(record);
    },
    
    // 同步答题记录到服务器
    syncAnswerRecord(record) {
      // 实际应用中发送到服务器
      console.log('Sync answer record:', record);
    },
    
    // 保存点赞状态
    saveLikeStatus(id, isLiked) {
      let likes = uni.getStorageSync('commentLikes') || {};
      likes[id] = isLiked;
      uni.setStorageSync('commentLikes', likes);
    },
    
    // 保存收藏状态
    saveBookmark(questionIndex, isSaved) {
      let bookmarks = uni.getStorageSync('bookmarks') || [];
      const questionId = this.questions[questionIndex].id || questionIndex;
      
      if (isSaved) {
        if (!bookmarks.includes(questionId)) {
          bookmarks.push(questionId);
        }
      } else {
        const index = bookmarks.indexOf(questionId);
        if (index > -1) {
          bookmarks.splice(index, 1);
        }
      }
      
      uni.setStorageSync('bookmarks', bookmarks);
    },
    
    // 提交评论到服务器
    submitComment(comment) {
      // 实际应用中的API调用
      uni.request({
        url: '/api/comments',
        method: 'POST',
        data: comment,
        success: (res) => {
          console.log('Comment submitted:', res);
        },
        fail: (err) => {
          console.error('Failed to submit comment:', err);
        }
      });
    },
    
    // 获取更多评论
    fetchMoreComments(question) {
      return new Promise((resolve) => {
        // 模拟API调用
        setTimeout(() => {
          // 实际应用中从服务器获取
          console.log('Fetching more comments for question');
          resolve();
        }, 1000);
      });
    },
    
    // 获取更多回复
    fetchMoreReplies(commentId) {
      // 实际应用中的API调用
      uni.request({
        url: `/api/comments/${commentId}/replies`,
        method: 'GET',
        success: (res) => {
          console.log('More replies loaded:', res);
        }
      });
    },
    
    // 初始化题目数据
    initQuestions() {
      // 初始化示例题目
      this.questions = [
        {
          id: 1,
          text: "Which document must you carry when driving a motor vehicle?",
          hasImage: true,
          sign: 'P',
          selectedOption: null,
          showAnswer: false,
          isSaved: false,
          showAllComments: false,
          isLoadingComments: false,
          options: [
            { label: 'A', text: 'Employee ID', isCorrect: false },
            { label: 'B', text: "Driver's License", isCorrect: true },
            { label: 'C', text: 'ID Card', isCorrect: false },
            { label: 'D', text: 'Professional Certification', isCorrect: false }
          ],
          keyPoint: "2 Licenses, 2 Stickers, 1 Plate",
          aiExplanation: "This question tests the legal requirements for driving. Motorists must carry both the driver's license and vehicle registration.",
          rememberTip: "Always keep your driving license with you when driving - it's a legal requirement!",
          difficulty: 3,
          accuracy: 41.3,
          comments: [
            {
              id: 1,
              avatar: 'S',
              username: 'StormChaser',
              content: 'Got this wrong in my first mock test! The key is to remember that your license is the ONLY document you must legally carry.',
              testCentre: 'Birmingham',
              likes: 124,
              isLiked: false,
              featured: true,
              replies: [
                {
                  id: 101,
                  avatar: 'J',
                  username: 'JohnDoe',
                  text: 'Thanks for the tip! This really helped me.',
                  testCentre: 'London',
                  likes: 5,
                  isLiked: false
                },
                {
                  id: 102,
                  avatar: 'M',
                  username: 'Mary123',
                  text: 'Same here, I always confused this with insurance documents.',
                  testCentre: 'Manchester',
                  likes: 3,
                  isLiked: false
                }
              ],
              showAllReplies: false,
              get displayedReplies() {
                return this.showAllReplies ? this.replies : this.replies.slice(0, 2);
              }
            }
          ],
          get displayedComments() {
            return this.showAllComments ? this.comments : this.comments.slice(0, 3);
          }
        },
        {
          id: 2,
          text: "What is the speed limit in a built-up area unless otherwise signed?",
          hasImage: false,
          selectedOption: null,
          showAnswer: false,
          isSaved: false,
          showAllComments: false,
          isLoadingComments: false,
          options: [
            { label: 'A', text: '20 mph', isCorrect: false },
            { label: 'B', text: '30 mph', isCorrect: true },
            { label: 'C', text: '40 mph', isCorrect: false },
            { label: 'D', text: '50 mph', isCorrect: false }
          ],
          keyPoint: "Default speed limit is 30 mph in built-up areas",
          aiExplanation: "The national speed limit for built-up areas in the UK is 30 mph unless road signs indicate otherwise.",
          difficulty: 2,
          accuracy: 78.5,
          comments: [],
          get displayedComments() {
            return this.showAllComments ? this.comments : this.comments.slice(0, 3);
          }
        }
      ];
      
      // 生成更多示例题目
      for (let i = this.questions.length; i < 50; i++) {
        this.questions.push({
          id: i + 1,
          text: `Sample question ${i + 1}: What should you do in this situation?`,
          hasImage: i % 2 === 0,
          sign: ['P', '30', '!', 'X'][i % 4],
          selectedOption: null,
          showAnswer: false,
          isSaved: false,
          showAllComments: false,
          isLoadingComments: false,
          options: [
            { label: 'A', text: `Option A for question ${i + 1}`, isCorrect: false },
            { label: 'B', text: `Option B for question ${i + 1}`, isCorrect: true },
            { label: 'C', text: `Option C for question ${i + 1}`, isCorrect: false },
            { label: 'D', text: `Option D for question ${i + 1}`, isCorrect: false }
          ],
          keyPoint: `Key point for question ${i + 1}`,
          aiExplanation: `AI explanation for question ${i + 1}`,
          difficulty: (i % 5) + 1,
          accuracy: Math.round(Math.random() * 60 + 30),
          comments: [],
          get displayedComments() {
            return this.showAllComments ? this.comments : this.comments.slice(0, 3);
          }
        });
      }
      
      // 从服务器加载真实题目
      this.loadQuestionsFromServer();
    },
    
    // 从服务器加载题目
    loadQuestionsFromServer() {
      uni.request({
        url: '/api/questions',
        method: 'GET',
        success: (res) => {
          if (res.statusCode === 200 && res.data) {
            // 合并服务器数据
            console.log('Questions loaded from server');
          }
        },
        fail: (err) => {
          console.error('Failed to load questions:', err);
        }
      });
    }
  },
  
  onLoad(options) {
    // 初始化题目数据
    this.initQuestions();
    
    // 加载设置
    this.loadSettings();
    
    // 加载进度
    this.loadProgress();
    
    // 应用主题
    this.applyTheme();
    
    // 如果有传入的题目索引，跳转到指定题目
    if (options.index) {
      this.currentQuestionIndex = parseInt(options.index) || 0;
    }
    
    // 3秒后隐藏滑动提示
    setTimeout(() => {
      this.showSwipeHint = false;
    }, 3000);
    
    // 如果开启了语音自动读题，读第一题
    if (this.settings.voiceAutoRead) {
      this.readCurrentQuestion();
    }
  },
  
  onUnload() {
    // 页面卸载时保存进度
    this.saveProgress();
    
    // 清理音频资源
    if (this.audioContext) {
      this.audioContext.destroy();
    }
  },
  
  onShow() {
    // 页面显示时刷新主题
    this.applyTheme();
  },
  
  onHide() {
    // 页面隐藏时停止音频
    this.stopAudio();
  }
}
</script>

<style lang="scss">
/* =====================================================
   理论考试答题界面 - 完整样式文件
   UniApp Vue2 专用
   ===================================================== */

/* 全局样式重置 */
page {
  height: 100vh;
  overflow: hidden;
  background: #ffffff;
}

.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* 可调节字体大小的样式 */
.font-size-small .question-text { font-size: 32rpx !important; }
.font-size-small .option-text { font-size: 28rpx !important; }
.font-size-small .ai-content { font-size: 28rpx !important; }
.font-size-small .key-point-text { font-size: 28rpx !important; }
.font-size-small .comment-text { font-size: 26rpx !important; }
.font-size-small .reply-text { font-size: 24rpx !important; }

.font-size-medium .question-text { font-size: 40rpx !important; }
.font-size-medium .option-text { font-size: 32rpx !important; }
.font-size-medium .ai-content { font-size: 32rpx !important; }
.font-size-medium .key-point-text { font-size: 32rpx !important; }
.font-size-medium .comment-text { font-size: 28rpx !important; }
.font-size-medium .reply-text { font-size: 26rpx !important; }

.font-size-large .question-text { font-size: 48rpx !important; }
.font-size-large .option-text { font-size: 36rpx !important; }
.font-size-large .ai-content { font-size: 36rpx !important; }
.font-size-large .key-point-text { font-size: 36rpx !important; }
.font-size-large .comment-text { font-size: 32rpx !important; }
.font-size-large .reply-text { font-size: 30rpx !important; }

.font-size-extra-large .question-text { font-size: 56rpx !important; }
.font-size-extra-large .option-text { font-size: 40rpx !important; }
.font-size-extra-large .ai-content { font-size: 40rpx !important; }
.font-size-extra-large .key-point-text { font-size: 40rpx !important; }
.font-size-extra-large .comment-text { font-size: 36rpx !important; }
.font-size-extra-large .reply-text { font-size: 34rpx !important; }

/* 极简头部 */
.header {
  padding: 30rpx 40rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  position: relative;
  z-index: 100;
  transition: background 0.3s ease;
}

.back-button {
  background: none;
  border: none;
  width: 72rpx;
  height: 72rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.back-button:active {
  background: rgba(0,0,0,0.05);
  transform: scale(0.95);
}

.back-arrow {
  width: 40rpx;
  height: 40rpx;
  border-left: 4rpx solid #1a1a1a;
  border-bottom: 4rpx solid #1a1a1a;
  transform: rotate(45deg);
  margin-left: 8rpx;
}

.settings-button {
  background: none;
  border: none;
  padding: 16rpx 24rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  font-weight: 500;
  color: #6b7280;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.settings-button:active {
  background: rgba(0,0,0,0.05);
  transform: scale(0.95);
}

/* Settings 弹窗 */
.settings-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.settings-overlay.active {
  opacity: 1;
  pointer-events: auto;
}

.settings-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-radius: 60rpx 60rpx 0 0;
  padding: 60rpx 50rpx 80rpx;
  z-index: 1001;
  transform: translateY(100%);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 80vh;
  overflow-y: auto;
}

.settings-overlay.active .settings-panel {
  transform: translateY(0);
}

/* Settings 头部 */
.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 60rpx;
  padding-bottom: 40rpx;
  border-bottom: 2rpx solid #e5e7eb;
}

.settings-title {
  font-size: 48rpx;
  font-weight: 700;
  color: #1a1a1a;
}

.close-settings {
  background: none;
  border: none;
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-settings:active {
  background: rgba(0,0,0,0.05);
  transform: scale(0.95);
}

.close-icon {
  width: 48rpx;
  height: 48rpx;
  font-size: 48rpx;
  color: #6b7280;
  text-align: center;
  line-height: 48rpx;
}

/* Settings 选项 */
.setting-item {
  margin-bottom: 60rpx;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.setting-label {
  font-size: 32rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.setting-description {
  font-size: 26rpx;
  color: #6b7280;
  line-height: 1.4;
  margin-bottom: 30rpx;
  display: block;
}

/* Toggle Switch */
.toggle-switch {
  width: 104rpx;
  height: 64rpx;
  background: #e5e7eb;
  border-radius: 32rpx;
  position: relative;
  transition: background 0.3s ease;
}

.toggle-switch.active {
  background: #667eea;
}

.toggle-switch::after {
  content: '';
  position: absolute;
  width: 52rpx;
  height: 52rpx;
  background: white;
  border-radius: 50%;
  top: 6rpx;
  left: 6rpx;
  transition: transform 0.3s ease;
  box-shadow: 0 4rpx 8rpx rgba(0,0,0,0.2);
}

.toggle-switch.active::after {
  transform: translateX(40rpx);
}

/* Font Size Slider */
.font-size-slider {
  margin-top: 30rpx;
}

.slider-container {
  position: relative;
  padding: 20rpx 0;
}

.range-slider {
  width: 100%;
  margin: 20rpx 0;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 20rpx;
}

.slider-label {
  font-size: 24rpx;
  color: #6b7280;
  font-weight: 500;
}

/* Theme Selector */
.theme-options {
  display: flex;
  gap: 20rpx;
  margin-top: 30rpx;
}

.theme-option {
  flex: 1;
  padding: 24rpx;
  border: 4rpx solid #e5e7eb;
  border-radius: 24rpx;
  text-align: center;
  background: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease;
}

.theme-option.active {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
}

.theme-icon {
  font-size: 48rpx;
  margin-bottom: 16rpx;
}

.theme-label {
  font-size: 26rpx;
  color: #6b7280;
  font-weight: 500;
}

.theme-option.active .theme-label {
  color: #667eea;
}

/* Streak Celebration Animation */
@keyframes streak-celebration {
  0% {
    transform: scale(1) rotate(0deg);
  }
  25% {
    transform: scale(1.1) rotate(5deg);
  }
  50% {
    transform: scale(1.2) rotate(-5deg);
  }
  75% {
    transform: scale(1.1) rotate(5deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}

.streak-celebration {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 120rpx;
  z-index: 2000;
  animation: streak-celebration 0.6s ease;
  pointer-events: none;
}

/* 滑动容器 */
.swipe-container {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.slide {
  width: 100%;
  height: 100%;
}

/* 题目内容容器 - 单页显示 */
.question-page {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  padding: 40rpx;
  padding-bottom: 200rpx;
}

/* 题目区域 */
.question-section {
  margin-bottom: 60rpx;
}

/* 题目头部 - 音频按钮和题目文本 */
.question-header {
  display: flex;
  align-items: flex-start;
  gap: 30rpx;
  margin-bottom: 50rpx;
}

/* 音频播放按钮 */
.audio-button {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 30rpx rgba(102, 126, 234, 0.3);
  flex-shrink: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.audio-button:active {
  transform: scale(0.95);
}

.audio-button.playing {
  animation: pulse-audio 1.5s infinite;
}

@keyframes pulse-audio {
  0% {
    box-shadow: 0 8rpx 30rpx rgba(102, 126, 234, 0.3);
  }
  50% {
    box-shadow: 0 8rpx 50rpx rgba(102, 126, 234, 0.5);
  }
  100% {
    box-shadow: 0 8rpx 30rpx rgba(102, 126, 234, 0.3);
  }
}

.audio-icon {
  font-size: 48rpx;
  color: white;
}

/* 题目文本 */
.question-text {
  flex: 1;
  font-size: 40rpx;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.5;
  letter-spacing: -0.6rpx;
}

/* 题目图片 */
.question-image {
  width: 100%;
  height: 400rpx;
  border-radius: 40rpx;
  overflow: hidden;
  margin-bottom: 50rpx;
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 20rpx 80rpx rgba(102, 126, 234, 0.15);
}

/* 3D驾驶场景 */
.driving-scene {
  width: 100%;
  height: 100%;
  position: relative;
  background: linear-gradient(to bottom, #87CEEB 0%, #98D8E8 60%);
  overflow: hidden;
}

.road-perspective {
  position: absolute;
  bottom: 0;
  left: -50%;
  right: -50%;
  height: 240rpx;
  background: #4a4a4a;
  transform: perspective(400rpx) rotateX(40deg);
  transform-origin: bottom;
}

.road-markings {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 12rpx;
  height: 100%;
  background: repeating-linear-gradient(
    to bottom,
    #ffffff 0rpx,
    #ffffff 40rpx,
    transparent 40rpx,
    transparent 80rpx
  );
}

.floating-sign {
  position: absolute;
  top: 60rpx;
  right: 60rpx;
  width: 100rpx;
  height: 100rpx;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  font-weight: bold;
  color: #ff4757;
  box-shadow: 0 10rpx 40rpx rgba(0,0,0,0.2);
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20rpx); }
}

/* 选项列表 */
.options-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 36rpx;
  background: #f8f9fa;
  border-radius: 32rpx;
  border: 4rpx solid transparent;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.option-item:active {
  transform: scale(0.98);
}

.option-item.selected {
  background: white;
  border-color: #667eea;
  box-shadow: 0 8rpx 30rpx rgba(102, 126, 234, 0.15);
}

.option-item.correct {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-color: #22c55e;
}

.option-item.incorrect {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border-color: #ef4444;
}

/* 选项标签样式 - 直接显示对勾或错叉 */
.option-label {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  margin-right: 28rpx;
  flex-shrink: 0;
  background: white;
  border-radius: 20rpx;
  font-size: 28rpx;
  position: relative;
}

.option-item.correct .option-label {
  background: #22c55e;
  color: white;
}

.option-item.incorrect .option-label {
  background: #ef4444;
  color: white;
}

.option-label-icon {
  position: absolute;
  font-size: 36rpx;
  font-weight: bold;
  display: none;
}

.option-item.correct .option-label-icon.check,
.option-item.incorrect .option-label-icon.cross {
  display: block;
}

.option-text {
  flex: 1;
  font-size: 32rpx;
  color: #1a1a1a;
  line-height: 1.4;
  font-weight: 500;
}

/* Key Point - 极简设计，直接显示在选项后面 */
.key-point-section {
  margin-top: 40rpx;
  padding: 0;
}

.key-point-text {
  font-size: 32rpx;
  color: #dc2626;
  line-height: 1.5;
  font-weight: 500;
  display: block;
}

/* AI解释 - 增强设计 */
.ai-explanation {
  margin-top: 48rpx;
  padding: 56rpx;
  background: white;
  border-radius: 48rpx;
  box-shadow: 0 40rpx 120rpx rgba(0,0,0,0.1);
  position: relative;
  overflow: hidden;
}

.ai-explanation::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 12rpx;
  background: linear-gradient(90deg, 
    #667eea 0%, 
    #764ba2 25%, 
    #f093fb 50%, 
    #f5576c 75%, 
    #667eea 100%);
  background-size: 200% 100%;
  animation: gradient-shift 3s ease infinite;
}

@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.ai-header {
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;
}

.ai-avatar {
  width: 96rpx;
  height: 96rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 28rpx;
  box-shadow: 0 16rpx 48rpx rgba(102, 126, 234, 0.4);
  position: relative;
}

.ai-avatar::after {
  content: '';
  position: absolute;
  top: -4rpx;
  left: -4rpx;
  right: -4rpx;
  bottom: -4rpx;
  border-radius: 28rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 0.5;
  z-index: -1;
}

.ai-avatar-icon {
  font-size: 56rpx;
  color: white;
}

.ai-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #1a1a1a;
}

.ai-content {
  font-size: 32rpx;
  color: #374151;
  line-height: 1.8;
}

.ai-content .remember-tip {
  display: block;
  margin-top: 20rpx;
}

.ai-content .strong {
  color: #1a1a1a;
  font-weight: 600;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

/* 统计信息 - 卡片式设计 */
.stats-container {
  margin-top: 48rpx;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32rpx;
}

.stat-card {
  padding: 40rpx;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border-radius: 40rpx;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%);
}

.stat-label {
  font-size: 26rpx;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 2rpx;
  font-weight: 600;
  margin-bottom: 24rpx;
  position: relative;
  display: block;
}

.difficulty-visual {
  display: flex;
  justify-content: center;
  gap: 12rpx;
  position: relative;
}

.difficulty-bar {
  width: 16rpx;
  height: 64rpx;
  background: #d1d5db;
  border-radius: 8rpx;
  transition: all 0.3s;
}

.difficulty-bar.active {
  background: linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%);
  transform: scaleY(1.2);
}

.accuracy-visual {
  position: relative;
  width: 160rpx;
  height: 160rpx;
  margin: 0 auto;
}

.accuracy-circle {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    #667eea 0deg,
    #764ba2 calc(var(--accuracy) * 3.6deg),
    #e5e7eb calc(var(--accuracy) * 3.6deg)
  );
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.accuracy-circle::before {
  content: '';
  position: absolute;
  top: 16rpx;
  left: 16rpx;
  right: 16rpx;
  bottom: 16rpx;
  border-radius: 50%;
  background: white;
}

.accuracy-value {
  font-size: 36rpx;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
  position: relative;
  z-index: 1;
}

/* 评论区 */
.comments-section {
  margin-top: 60rpx;
  background: white;
  border-radius: 40rpx;
  padding: 40rpx;
  box-shadow: 0 10rpx 36rpx rgba(0,0,0,0.06);
  margin-bottom: 40rpx;
}

.comments-header {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 40rpx;
  padding-bottom: 30rpx;
  border-bottom: 2rpx solid #F5F5F5;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.comments-count {
  font-size: 28rpx;
  color: #999;
  font-weight: 400;
}

.comment-item {
  padding: 30rpx 0;
  border-bottom: 2rpx solid #F5F5F5;
}

.comment-item:last-child {
  border-bottom: none;
}

/* 精选评论标签 */
.featured-badge {
  display: inline-flex;
  align-items: center;
  gap: 12rpx;
  background: linear-gradient(135deg, #FFB74D 0%, #FF9800 100%);
  color: white;
  padding: 6rpx 20rpx;
  font-size: 22rpx;
  font-weight: 600;
  border-radius: 16rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(255, 152, 0, 0.3);
  text-transform: uppercase;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin-bottom: 24rpx;
}

.comment-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #4A9EFF 0%, #2196F3 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 28rpx;
  flex-shrink: 0;
}

.comment-info {
  flex: 1;
}

.comment-username {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 6rpx;
}

.comment-meta {
  font-size: 24rpx;
  color: #999;
}

.comment-actions {
  display: flex;
  align-items: center;
  gap: 30rpx;
}

.comment-like-button,
.comment-reply-button {
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 10rpx;
  transition: all 0.3s ease;
}

.comment-like-button:active,
.comment-reply-button:active {
  transform: scale(0.95);
}

.comment-like-icon,
.comment-reply-icon {
  font-size: 36rpx;
}

.comment-like-count,
.comment-reply-label {
  font-size: 28rpx;
  color: #666;
  font-weight: 500;
}

.comment-like-button.liked .comment-like-count {
  color: #FF6B6B;
}

.comment-text {
  font-size: 28rpx;
  line-height: 1.5;
  color: #333;
  padding-left: 96rpx;
}

/* 回复容器 */
.replies-container {
  margin-top: 30rpx;
  padding-left: 40rpx;
  border-left: 4rpx solid #F0F0F0;
}

.reply-item {
  padding: 20rpx 0;
  border-bottom: 2rpx solid #F8F8F8;
}

.reply-item:last-child {
  border-bottom: none;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 16rpx;
}

.reply-avatar {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24rpx;
  font-weight: 600;
  flex-shrink: 0;
}

.reply-info {
  flex: 1;
}

.reply-username {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 4rpx;
}

.reply-meta {
  font-size: 22rpx;
  color: #999;
}

.reply-actions {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.reply-like-button {
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx;
  transition: all 0.3s ease;
}

.reply-like-button:active {
  transform: scale(0.95);
}

.reply-like-icon {
  font-size: 32rpx;
}

.reply-like-count {
  font-size: 26rpx;
  color: #666;
  font-weight: 500;
}

.reply-like-button.liked .reply-like-count {
  color: #FF6B6B;
}

.reply-text {
  font-size: 26rpx;
  color: #333;
  line-height: 1.4;
  padding-left: 76rpx;
}

/* Load more replies */
.load-more-replies {
  margin-top: 20rpx;
  padding-left: 80rpx;
}

.load-more-replies-text {
  color: #4A9EFF;
  font-size: 26rpx;
  font-weight: 500;
}

.load-more-replies-text:active {
  opacity: 0.7;
}

/* View More 按钮 */
.view-more-button {
  width: 100%;
  padding: 24rpx;
  background: white;
  border: 4rpx solid #4A9EFF;
  border-radius: 50rpx;
  color: #4A9EFF;
  font-size: 28rpx;
  font-weight: 600;
  margin-top: 24rpx;
  transition: all 0.3s ease;
}

.view-more-button:hover {
  background: #F8FBFF;
  border-color: #4A9EFF;
}

.view-more-button:active {
  transform: scale(0.98);
}

/* 加载更多评论 */
.load-more-container {
  text-align: center;
  padding: 40rpx 0 20rpx;
}

.loading-spinner {
  display: inline-block;
  width: 40rpx;
  height: 40rpx;
  border: 6rpx solid #F0F0F0;
  border-top: 6rpx solid #4A9EFF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 底部操作栏 */
.bottom-bar {
  position: fixed;
  bottom: 40rpx;
  left: 40rpx;
  right: 40rpx;
  background: white;
  padding: 32rpx 40rpx;
  box-shadow: 0 20rpx 80rpx rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 20;
  border-radius: 40rpx;
  backdrop-filter: blur(20rpx);
  background: rgba(255,255,255,0.95);
  transition: all 0.3s ease;
}

/* 评论输入模式的底部栏 */
.bottom-bar.comment-mode {
  padding: 24rpx 32rpx;
}

.bottom-bar.comment-mode .save-section {
  display: none;
}

.comment-input-bottom {
  display: flex;
  align-items: center;
  gap: 24rpx;
  width: 100%;
}

.comment-input-field {
  flex: 1;
  padding: 24rpx 36rpx;
  background: #f8f9fa;
  border: 2rpx solid #e5e7eb;
  border-radius: 50rpx;
  font-size: 28rpx;
  outline: none;
  transition: all 0.3s ease;
}

.comment-input-field:focus {
  background: white;
  border-color: #667eea;
  box-shadow: 0 0 0 6rpx rgba(102, 126, 234, 0.1);
}

.send-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
  font-size: 40rpx;
  color: white;
  transition: all 0.3s ease;
}

.send-button:active {
  transform: scale(0.95);
}

.save-section {
  display: flex;
  align-items: center;
  gap: 40rpx;
  width: 100%;
  justify-content: space-between;
}

/* 收藏按钮 */
.save-button {
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx 32rpx;
  border-radius: 24rpx;
  font-weight: 600;
  color: #6b7280;
  transition: all 0.3s ease;
}

.save-button:active {
  transform: scale(0.95);
}

.save-button.saved {
  color: #fbbf24;
}

.save-icon {
  font-size: 40rpx;
}

/* 题目计数器 - 集成到底部栏（完整版）*/
.question-counter {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20rpx 40rpx;
  border-radius: 50rpx;
  font-size: 32rpx;
  font-weight: 600;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.question-counter:active {
  transform: scale(0.95);
}

/* 滑动提示器 */
.swipe-hint {
  position: fixed;
  bottom: 200rpx;
  left: 50%;
  transform: translateX(-50%);
  font-size: 24rpx;
  color: #9ca3af;
  opacity: 0;
  animation: fadeInOut 3s;
  pointer-events: none;
}

@keyframes fadeInOut {
  0% { opacity: 0; }
  50% { opacity: 1; }
  100% { opacity: 0; }
}

/* 夜间模式样式 */
.dark-mode {
  background: #1a1a1a;
  color: #e5e5e5;
}

.dark-mode .header {
  background: #2a2a2a;
}

.dark-mode .back-arrow {
  border-color: #e5e5e5;
}

.dark-mode .settings-button {
  color: #9ca3af;
}

.dark-mode .settings-panel {
  background: #2a2a2a;
}

.dark-mode .settings-header {
  border-bottom-color: #3a3a3a;
}

.dark-mode .settings-title {
  color: #e5e5e5;
}

.dark-mode .close-settings:active {
  background: rgba(255,255,255,0.1);
}

.dark-mode .close-icon {
  color: #9ca3af;
}

.dark-mode .setting-label {
  color: #e5e5e5;
}

.dark-mode .setting-description {
  color: #9ca3af;
}

.dark-mode .toggle-switch {
  background: #3a3a3a;
}

.dark-mode .slider-label {
  color: #9ca3af;
}

.dark-mode .theme-option {
  background: #2a2a2a;
  border-color: #3a3a3a;
}

.dark-mode .theme-label {
  color: #9ca3af;
}

.dark-mode .question-text {
  color: #e5e5e5;
}

.dark-mode .option-item {
  background: #2a2a2a;
  color: #e5e5e5;
}

.dark-mode .option-text {
  color: #e5e5e5;
}

.dark-mode .key-point-text {
  color: #fca5a5;
}

.dark-mode .ai-explanation {
  background: #2a2a2a;
  box-shadow: 0 40rpx 120rpx rgba(0,0,0,0.3);
}

.dark-mode .ai-title {
  color: #e5e5e5;
}

.dark-mode .ai-content {
  color: #9ca3af;
}

.dark-mode .ai-content .strong {
  color: #e5e5e5;
  background: linear-gradient(135deg, rgba(254, 243, 199, 0.2) 0%, rgba(253, 230, 138, 0.2) 100%);
}

.dark-mode .stat-card {
  background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
}

.dark-mode .stat-card::before {
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
}

.dark-mode .stat-label {
  color: #9ca3af;
}

.dark-mode .difficulty-bar {
  background: #4a4a4a;
}

.dark-mode .accuracy-circle {
  background: conic-gradient(
    from 0deg,
    #667eea 0deg,
    #764ba2 calc(var(--accuracy) * 3.6deg),
    #3a3a3a calc(var(--accuracy) * 3.6deg)
  );
}

.dark-mode .accuracy-circle::before {
  background: #2a2a2a;
}

.dark-mode .comments-section {
  background: #2a2a2a;
}

.dark-mode .comments-header {
  color: #e5e5e5;
  border-bottom-color: #3a3a3a;
}

.dark-mode .comments-count {
  color: #9ca3af;
}

.dark-mode .comment-item {
  border-bottom-color: #3a3a3a;
}

.dark-mode .comment-username {
  color: #e5e5e5;
}

.dark-mode .comment-meta {
  color: #9ca3af;
}

.dark-mode .comment-like-count {
  color: #9ca3af;
}

.dark-mode .comment-reply-label {
  color: #9ca3af;
}

.dark-mode .comment-text {
  color: #e5e5e5;
}

.dark-mode .replies-container {
  border-left-color: #3a3a3a;
}

.dark-mode .reply-item {
  border-bottom-color: #3a3a3a;
}

.dark-mode .reply-username {
  color: #e5e5e5;
}

.dark-mode .reply-meta {
  color: #9ca3af;
}

.dark-mode .reply-like-count {
  color: #9ca3af;
}

.dark-mode .reply-text {
  color: #e5e5e5;
}

.dark-mode .view-more-button {
  background: #2a2a2a;
}

.dark-mode .view-more-button:hover {
  background: #3a3a3a;
}

.dark-mode .bottom-bar {
  background: rgba(42, 42, 42, 0.95);
}

.dark-mode .save-button {
  color: #9ca3af;
}

.dark-mode .comment-input-field {
  background: #2a2a2a;
  border-color: #3a3a3a;
  color: #e5e5e5;
}

.dark-mode .comment-input-field:focus {
  background: #3a3a3a;
}

/* 响应式优化 */
@media screen and (max-width: 375px) {
  .question-text {
    font-size: 36rpx;
  }
  
  .option-text {
    font-size: 30rpx;
  }

  .question-page {
    padding: 30rpx;
  }
}

/* 平板适配 */
@media screen and (min-width: 768px) {
  .question-page {
    max-width: 1200rpx;
    margin: 0 auto;
  }
  
  .options-list {
    max-width: 800rpx;
    margin: 0 auto;
  }
  
  .ai-explanation,
  .comments-section {
    max-width: 900rpx;
    margin-left: auto;
    margin-right: auto;
  }
}

/* iOS安全区域适配 */
.bottom-bar {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

/* Android状态栏适配 */
.header {
  padding-top: var(--status-bar-height);
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6rpx;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3rpx;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* 防止文字选中 */
.question-text,
.option-text,
.ai-content,
.comment-text,
.reply-text {
  -webkit-user-select: none;
  user-select: none;
}

/* 输入框可以选中 */
.comment-input-field {
  -webkit-user-select: text;
  user-select: text;
}

/* 过渡动画优化 */
view,
text,
button {
  transition-property: transform, opacity, background-color;
  transition-duration: 0.3s;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* 防止按钮点击出现蓝色高亮（iOS）*/
button {
  -webkit-tap-highlight-color: transparent;
  outline: none;
}

/* 修复某些Android设备上的圆角问题 */
.option-item,
.ai-explanation,
.comments-section,
.bottom-bar {
  -webkit-border-radius: inherit;
}

/* 确保图标垂直居中 */
.audio-icon,
.save-icon,
.comment-like-icon,
.comment-reply-icon,
.reply-like-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
}

/* 修复某些设备上的flex布局问题 */
.question-header,
.comment-header,
.reply-header,
.comment-actions,
.reply-actions {
  display: -webkit-flex;
  display: flex;
  -webkit-align-items: center;
  align-items: center;
}

/* 性能优化：使用硬件加速 */
.swipe-container,
.slide,
.floating-sign,
.streak-celebration {
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}

/* 修复长文本溢出问题 */
.question-text,
.option-text,
.comment-text,
.reply-text,
.ai-content {
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
}

/* 确保模态框在最上层 */
.settings-overlay {
  z-index: 9999;
}

.settings-panel {
  z-index: 10000;
}

.streak-celebration {
  z-index: 10001;
}

/* 修复某些设备上渐变显示问题 */
.audio-button,
.question-counter,
.ai-avatar,
.accuracy-circle {
  background-image: -webkit-linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-image: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 确保底部栏始终在最上层（除了模态框）*/
.bottom-bar {
  z-index: 999;
}

/* 修复评论输入框焦点样式 */
.comment-input-field:focus {
  outline: none;
  -webkit-appearance: none;
}

/* 防止iOS橡皮筋效果 */
.swipe-container {
  -webkit-overflow-scrolling: touch;
}

/* 修复部分机型上的按钮点击区域 */
button {
  position: relative;
  -webkit-tap-highlight-color: transparent;
}

button::before {
  content: '';
  position: absolute;
  top: -10rpx;
  left: -10rpx;
  right: -10rpx;
  bottom: -10rpx;
}

/* 优化加载动画性能 */
.loading-spinner {
  will-change: transform;
}

/* 修复评论头像文字居中 */
.comment-avatar text,
.reply-avatar text {
  line-height: 1;
  display: block;
}

/* 防止页面横向滚动 */
page {
  overflow-x: hidden;
}

/* 确保滑动容器不会超出屏幕 */
.swipe-wrapper {
  width: 100%;
}

/* 优化触摸反馈 */
button,
.option-item,
.category-card,
.comment-like-button,
.comment-reply-button,
.reply-like-button {
  touch-action: manipulation;
}



/* 底部操作栏 - 修正版 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 32rpx 40rpx;
  padding-bottom: calc(32rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(32rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -4rpx 20rpx rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 100;
  border-top: 1rpx solid #f0f0f0;
  transition: all 0.3s ease;
}

/* 确保内容不被底部栏遮挡 */
.question-page {
  padding-bottom: 180rpx; /* 增加底部padding */
}

/* Save按钮布局调整 */
.save-section {
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-between;
}

.save-button {
  display: flex;
  align-items: center;
  gap: 12rpx;
  background: none;
  border: none;
  padding: 16rpx 24rpx;
  color: #666;
  font-size: 32rpx;
  font-weight: 500;
}

.save-button.saved {
  color: #fbbf24;
}

.save-icon {
  font-size: 36rpx;
}

/* 题目计数器位置 */
.question-counter {
  background: #667eea;
  color: white;
  padding: 16rpx 32rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: 600;
}

/* 评论输入模式动画 */
.bottom-bar.comment-mode {
  background: #f8f9fa;
  padding: 24rpx 32rpx;
}

.comment-input-bottom {
  display: flex;
  align-items: center;
  gap: 20rpx;
  width: 100%;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.comment-input-field {
  flex: 1;
  padding: 20rpx 32rpx;
  background: white;
  border: 2rpx solid #e5e7eb;
  border-radius: 40rpx;
  font-size: 28rpx;
  transition: all 0.3s ease;
}
</style>