<template>
  <view class="app">
    <!-- 渐变背景 -->
    <view class="gradient-bg">
      <view class="gradient-top"></view>
      <view class="gradient-bottom"></view>
    </view>

    <!-- 头部导航 -->
    <view class="header">
      <view class="back-button" @tap="goBack">←</view>
      <text class="page-title">Saved Items</text>
    </view>

    <!-- 标签切换 -->
    <view class="tabs-container">
      <view class="tabs">
        <view 
          class="tab" 
          :class="{active: activeTab === 'questions'}"
          @tap="activeTab = 'questions'">
          Test Questions
        </view>
        <view 
          class="tab"
          :class="{active: activeTab === 'posts'}"
          @tap="activeTab = 'posts'">
          Community Posts
        </view>
      </view>
    </view>

    <!-- 主要内容 -->
    <view class="container">
      <!-- Test Questions 标签内容 -->
      <view v-if="activeTab === 'questions'">
        <!-- 错题本/收藏切换 -->
        <view class="analytics-toggle">
          <view class="toggle-buttons">
            <view 
              class="toggle-btn" 
              :class="{active: questionView === 'wrongs'}"
              @tap="questionView = 'wrongs'">
              <text class="toggle-title">Wrongs Bookmarks</text>
              <text class="toggle-subtitle">{{ wrongsCount }} mistakes</text>
            </view>
            <view 
              class="toggle-btn"
              :class="{active: questionView === 'saved'}"
              @tap="questionView = 'saved'">
              <text class="toggle-title">Saved Questions</text>
              <text class="toggle-subtitle">{{ savedCount }} saved</text>
            </view>
          </view>
        </view>

        <!-- 错题本视图 -->
        <view v-if="questionView === 'wrongs'">
          <!-- 错题统计 -->
          <view class="stats-card">
            <view class="stats-header">
              <text class="stats-title">Mistake Analytics</text>
              <view class="clear-btn" @tap="clearMistakes">🗑 Clear All</view>
            </view>

            <!-- 自动移除开关 -->
            <view class="auto-remove-toggle">
              <text class="toggle-label">Auto-remove when corrected</text>
              <view 
                class="toggle-switch" 
                :class="{active: autoRemove}"
                @tap="autoRemove = !autoRemove">
              </view>
            </view>

            <!-- 统计数据 -->
            <view class="stats-grid">
              <view class="stat-item">
                <text class="stat-value">{{ totalErrors }}</text>
                <text class="stat-label">Total Errors</text>
              </view>
              <view class="stat-item">
                <text class="stat-value">{{ todayMistakes }}</text>
                <text class="stat-label">Today's Mistakes</text>
              </view>
              <view class="stat-item error-rate">
                <text class="stat-value">{{ errorRate }}%</text>
                <text class="stat-label">Error Rate</text>
              </view>
            </view>
          </view>

          <!-- 错题分类 -->
          <view class="category-list">
            <view class="category-header">
              <text class="category-title">Mistake Distribution</text>
            </view>

            <view 
              v-for="(category, index) in mistakeCategories" 
              :key="category.id"
              class="category-item"
              @tap="viewCategory(category)">
              <view class="category-number">{{ index + 1 }}</view>
              <view class="category-info">
                <text class="category-name">{{ category.name }}</text>
                <text class="category-type">{{ category.type }}</text>
              </view>
              <text class="category-count">{{ category.count }}</text>
              <text class="category-arrow">›</text>
            </view>
          </view>
        </view>

        <!-- 收藏题目视图 -->
        <view v-if="questionView === 'saved'">
          <!-- 题目类型选择 -->
          <view class="question-type-selector">
            <view 
              v-for="(type, index) in questionTypes" 
              :key="type.id"
              class="type-card"
              :class="{active: selectedType === type.id}"
              @tap="selectedType = type.id">
              <text class="type-icon">{{ type.icon }}</text>
              <text class="type-name">{{ type.name }}</text>
              <text class="type-count">{{ type.count }} questions</text>
            </view>
          </view>

          <!-- 收藏统计 -->
          <view class="stats-card">
            <view class="stats-header">
              <text class="stats-title">Saved Analytics</text>
              <view class="clear-btn" @tap="clearSaved">🗑 Clear All</view>
            </view>

            <!-- 统计数据 -->
            <view class="stats-grid">
              <view class="stat-item">
                <text class="stat-value">{{ totalSaved }}</text>
                <text class="stat-label">Total Saved</text>
              </view>
              <view class="stat-item">
                <text class="stat-value">{{ todaySaved }}</text>
                <text class="stat-label">Today's Saved</text>
              </view>
            </view>
          </view>

          <!-- 收藏分类 -->
          <view class="category-list">
            <view class="category-header">
              <text class="category-title">Saved Distribution</text>
            </view>

            <view 
              v-for="(category, index) in savedCategories" 
              :key="category.id"
              class="category-item"
              @tap="viewCategory(category)">
              <view class="category-number">{{ index + 1 }}</view>
              <view class="category-info">
                <text class="category-name">{{ category.name }}</text>
                <text class="category-type">{{ category.type }}</text>
              </view>
              <text class="category-count">{{ category.count }}</text>
              <text class="category-arrow">›</text>
            </view>
          </view>
        </view>
      </view>

      <!-- Community Posts 标签内容 -->
      <view v-if="activeTab === 'posts'">
        <view v-if="savedPosts.length > 0">
          <view v-for="post in savedPosts" :key="post.id" class="post-card">
            <!-- 用户信息 -->
            <view class="user-info">
              <view class="user-avatar">{{ post.username[0] }}</view>
              <view class="user-details">
                <text class="username">{{ post.username }}</text>
                <text class="test-centre">Test Centre: {{ post.testCentre }}</text>
              </view>
              <view class="post-menu" @tap="showPostMenu(post.id)">⋯</view>
            </view>

            <!-- 帖子内容 -->
            <view class="post-content">
              <text class="post-text">{{ post.content }}</text>
              
              <!-- 图片网格 -->
              <view v-if="post.images && post.images.length > 0" class="image-grid">
                <view v-for="(image, index) in post.images.slice(0, 3)" :key="index" class="image-item">
                  <image :src="image" mode="aspectFill"></image>
                </view>
              </view>
            </view>

            <!-- 交互栏 -->
            <view class="post-actions">
              <view class="action-button" :class="{liked: post.liked}" @tap="toggleLike(post.id)">
                ❤️ {{ post.likes }}
              </view>
              <view class="action-button">
                💬 {{ post.comments }}
              </view>
              <view class="action-button saved" @tap="unsavePost(post.id)">
                🔖 Saved
              </view>
            </view>
          </view>
        </view>

        <!-- 空状态 -->
        <view v-else class="empty-state">
          <view class="empty-icon">🔖</view>
          <text class="empty-title">No Saved Posts</text>
          <text class="empty-message">
            Save interesting posts from the community to read them again later.
          </text>
          <view class="browse-button" @tap="goToForum">Browse Forum</view>
        </view>
      </view>
    </view>

    <!-- 操作菜单 -->
    <view class="menu-overlay" :class="{show: showMenu}" @tap="closeMenu"></view>
    <view class="action-menu" :class="{show: showMenu}">
      <view class="menu-item" @tap="sharePost">
        <text class="menu-item-icon">📤</text>
        <text class="menu-item-text">Share Post</text>
      </view>
      <view class="menu-item" @tap="reportPost">
        <text class="menu-item-icon">⚠️</text>
        <text class="menu-item-text">Report Post</text>
      </view>
      <view class="menu-item" @tap="deletePost">
        <text class="menu-item-icon">🗑️</text>
        <text class="menu-item-text">Delete This Post</text>
      </view>
      <view class="menu-divider"></view>
      <view class="menu-item" @tap="followUser">
        <text class="menu-item-icon">👤</text>
        <text class="menu-item-text">Follow User</text>
      </view>
    </view>

    <!-- 题目列表模态框 -->
    <view class="questions-modal" :class="{show: showQuestionsModal}">
      <view class="modal-header">
        <view class="close-modal" @tap="closeQuestions">←</view>
        <text class="modal-title">{{ currentCategoryName }}</text>
      </view>
      <scroll-view class="questions-content" scroll-y="true">
        <!-- 筛选栏 -->
        <view class="filter-bar">
          <view 
            class="filter-chip"
            :class="{active: questionFilter === 'all'}"
            @tap="questionFilter = 'all'">
            All ({{ filteredQuestions.length }})
          </view>
          <view 
            class="filter-chip"
            :class="{active: questionFilter === 'easy'}"
            @tap="questionFilter = 'easy'">
            Easy
          </view>
          <view 
            class="filter-chip"
            :class="{active: questionFilter === 'medium'}"
            @tap="questionFilter = 'medium'">
            Medium
          </view>
          <view 
            class="filter-chip"
            :class="{active: questionFilter === 'hard'}"
            @tap="questionFilter = 'hard'">
            Hard
          </view>
        </view>

        <!-- 题目列表 -->
        <view v-for="question in filteredQuestions" :key="question.id" class="question-card" :class="{collapsed: question.collapsed}">
          <view class="question-header" @tap="toggleQuestion(question.id)">
            <view class="question-number">Q{{ question.number }}</view>
            <view class="question-meta">
              <text class="question-category">{{ question.category }}</text>
              <view class="question-badges">
                <text class="badge" :class="'difficulty-' + question.difficulty">
                  {{ question.difficulty }}
                </text>
                <text class="badge accuracy">
                  {{ question.accuracy }}% accuracy
                </text>
              </view>
            </view>
            <view class="remove-button" @tap.stop="removeQuestion(question.id)">✕</view>
            <view class="expand-icon">{{ question.collapsed ? '▼' : '▲' }}</view>
          </view>
          
          <view class="question-body">
            <text class="question-text">{{ question.text }}</text>
            
            <image v-if="question.image" :src="question.image" class="question-image" mode="aspectFill"></image>
            
            <!-- 只在错题本视图显示选项和答案 -->
            <view v-if="questionView === 'wrongs'" class="options-list">
              <view 
                v-for="(option, index) in question.options" 
                :key="index"
                class="option-item"
                :class="{
                  correct: question.showAnswer && index === question.correctAnswer,
                  incorrect: question.showAnswer && question.userAnswer === index && index !== question.correctAnswer,
                  'user-selected': question.showAnswer && question.userAnswer === index
                }">
                <text class="option-marker">{{ String.fromCharCode(65 + index) }}</text>
                <text>{{ option }}</text>
              </view>
            </view>
            
            <!-- 收藏题目只显示选项，不显示对错 -->
            <view v-else class="options-list">
              <view 
                v-for="(option, index) in question.options" 
                :key="index"
                class="option-item">
                <text class="option-marker">{{ String.fromCharCode(65 + index) }}</text>
                <text>{{ option }}</text>
              </view>
            </view>

            <view class="question-footer">
              <view class="question-stats">
                <view class="stat">
                  <text class="stat-value">{{ question.lastAttempt }}</text>
                  <text class="stat-label">Last Attempt</text>
                </view>
              </view>
              <view class="action-buttons">
                <view class="action-btn" @tap="practiceQuestion(question.id)">Practice</view>
                <view class="action-btn primary" @tap="viewExplanation(question.id)">Explanation</view>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      activeTab: 'questions', // 'questions' or 'posts'
      questionView: 'wrongs', // 'wrongs' or 'saved'
      selectedType: 'theory', // 选中的题目类型
      autoRemove: false, // 自动移除开关
      showMenu: false, // 显示菜单
      selectedPostId: null, // 选中的帖子ID
      showQuestionsModal: false, // 显示题目列表模态框
      currentCategoryName: '', // 当前分类名称
      currentQuestions: [], // 当前分类的题目
      questionFilter: 'all', // 题目筛选
      
      // 统计数据
      wrongsCount: 12,
      savedCount: 15,
      totalErrors: 12,
      todayMistakes: 0,
      errorRate: 11,
      totalSaved: 12,
      todaySaved: 3,
      
      // 题目类型
      questionTypes: [
        { id: 'theory', name: 'Theory Test', icon: '📚', count: 6 },
        { id: 'hazard', name: 'Hazard Perception', icon: '⚠️', count: 3 },
        { id: 'highway', name: 'Highway Code', icon: '🛣️', count: 2 },
        { id: 'roadsign', name: 'Road Signs', icon: '🚦', count: 4 }
      ],
      
      // 错题分类
      mistakeCategories: [
        { id: 1, name: 'Road Rule Violations', type: 'Theory Test', count: 6 },
        { id: 2, name: 'Prohibitory Signs', type: 'Road Signs', count: 4 },
        { id: 3, name: 'Freeway Entry/Exit Errors', type: 'Highway Code', count: 1 },
        { id: 4, name: 'Warning Signs', type: 'Road Signs', count: 1 }
      ],
      
      // 收藏分类
      savedCategories: [
        { id: 1, name: 'Road Rule Violations', type: 'Theory Test', count: 6 },
        { id: 2, name: 'Prohibitory Signs', type: 'Road Signs', count: 4 },
        { id: 3, name: 'Freeway Entry/Exit Errors', type: 'Highway Code', count: 1 },
        { id: 4, name: 'Warning Signs', type: 'Road Signs', count: 1 }
      ],
      
      // 模拟题目数据
      questionsDatabase: {
        1: [ // Road Rule Violations
          {
            id: 101,
            number: 1,
            category: 'Road Rule Violations',
            difficulty: 'medium',
            accuracy: 72,
            text: 'What is the minimum safe following distance on a motorway in good conditions?',
            image: '/static/images/motorway-distance.jpg',
            options: [
              'One second',
              'Two seconds',
              'Three seconds',
              'Four seconds'
            ],
            correctAnswer: 1,
            userAnswer: 2,
            showAnswer: true,
            lastAttempt: '2 days ago',
            collapsed: false
          },
          {
            id: 102,
            number: 2,
            category: 'Road Rule Violations',
            difficulty: 'hard',
            accuracy: 45,
            text: 'When can you overtake on the left on a motorway?',
            options: [
              'Never',
              'When traffic in the right lane is moving slowly',
              'When the vehicle ahead is turning right',
              'In heavy traffic when your lane is moving faster'
            ],
            correctAnswer: 3,
            userAnswer: 0,
            showAnswer: true,
            lastAttempt: '1 week ago',
            collapsed: true
          }
        ],
        2: [ // Prohibitory Signs
          {
            id: 201,
            number: 3,
            category: 'Prohibitory Signs',
            difficulty: 'easy',
            accuracy: 89,
            text: 'What does a circular sign with a red border and white background mean?',
            image: '/static/images/prohibitory-sign.jpg',
            options: [
              'Warning sign',
              'Prohibitory sign',
              'Mandatory sign',
              'Information sign'
            ],
            correctAnswer: 1,
            userAnswer: 1,
            showAnswer: true,
            lastAttempt: 'Today',
            collapsed: true
          }
        ],
        3: [ // Freeway Entry/Exit
          {
            id: 301,
            number: 4,
            category: 'Freeway Entry/Exit Errors',
            difficulty: 'medium',
            accuracy: 68,
            text: 'When joining a motorway from a slip road, you should:',
            options: [
              'Stop at the end of the slip road',
              'Give way to traffic already on the motorway',
              'Force your way into the traffic',
              'Use the hard shoulder if necessary'
            ],
            correctAnswer: 1,
            userAnswer: 0,
            showAnswer: true,
            lastAttempt: '3 days ago',
            collapsed: true
          }
        ],
        4: [ // Warning Signs
          {
            id: 401,
            number: 5,
            category: 'Warning Signs',
            difficulty: 'easy',
            accuracy: 92,
            text: 'What shape are most warning signs?',
            options: [
              'Circular',
              'Triangular',
              'Rectangular',
              'Octagonal'
            ],
            correctAnswer: 1,
            userAnswer: 1,
            showAnswer: true,
            lastAttempt: 'Yesterday',
            collapsed: true
          }
        ]
      },
      
      // 保存的帖子
      savedPosts: [
        {
          id: 1,
          username: 'StormChaser',
          testCentre: 'Birmingham',
          content: 'Just passed my theory test with 49/50! The key is to practice every day and focus on the topics you find most challenging. Good luck everyone!',
          images: [
            '/static/images/post-image-1.jpg',
            '/static/images/post-image-2.jpg',
            '/static/images/post-image-3.jpg'
          ],
          likes: 156,
          comments: 23,
          liked: true,
          saved: true
        },
        {
          id: 2,
          username: 'LearnerLisa',
          testCentre: 'Manchester',
          content: 'Anyone else finding the hazard perception clips really tricky? I keep clicking too early or too late. Any tips would be appreciated!',
          images: [
            '/static/images/tip-1.jpg',
            '/static/images/tip-2.jpg',
            '/static/images/tip-3.jpg'
          ],
          likes: 89,
          comments: 45,
          liked: false,
          saved: true
        }
      ]
    }
  },
  computed: {
    // 筛选后的题目
    filteredQuestions() {
      if (this.questionFilter === 'all') {
        return this.currentQuestions;
      }
      return this.currentQuestions.filter(q => q.difficulty === this.questionFilter);
    }
  },
  methods: {
    // 返回
    goBack() {
      uni.navigateBack();
    },
    
    // 清除错题
    clearMistakes() {
      uni.showModal({
        title: 'Clear All Mistakes',
        content: 'Are you sure you want to clear all mistakes?',
        success: (res) => {
          if (res.confirm) {
            this.mistakeCategories = [];
            this.totalErrors = 0;
            this.todayMistakes = 0;
            this.errorRate = 0;
            uni.showToast({
              title: 'Cleared',
              icon: 'success'
            });
          }
        }
      });
    },
    
    // 清除收藏
    clearSaved() {
      uni.showModal({
        title: 'Clear All Saved',
        content: 'Are you sure you want to clear all saved questions?',
        success: (res) => {
          if (res.confirm) {
            this.savedCategories = [];
            this.totalSaved = 0;
            this.todaySaved = 0;
            uni.showToast({
              title: 'Cleared',
              icon: 'success'
            });
          }
        }
      });
    },
    
    // 查看分类
    viewCategory(category) {
      console.log('Viewing category:', category);
      this.currentCategoryName = category.name;
      // 从数据库获取该分类的题目
      this.currentQuestions = this.questionsDatabase[category.id] || [];
      // 根据当前视图决定是否显示答案
      this.currentQuestions.forEach(q => {
        q.isFromWrongs = this.questionView === 'wrongs';
      });
      this.showQuestionsModal = true;
    },
    
    // 切换题目展开/收起
    toggleQuestion(questionId) {
      const question = this.currentQuestions.find(q => q.id === questionId);
      if (question) {
        this.$set(question, 'collapsed', !question.collapsed);
      }
    },
    
    // 关闭题目列表
    closeQuestions() {
      this.showQuestionsModal = false;
      this.currentQuestions = [];
      this.questionFilter = 'all';
    },
    
    // 移除题目
    removeQuestion(questionId) {
      uni.showModal({
        title: 'Remove Question',
        content: 'Remove this question from saved items?',
        success: (res) => {
          if (res.confirm) {
            this.currentQuestions = this.currentQuestions.filter(q => q.id !== questionId);
            // 更新统计
            if (this.questionView === 'wrongs') {
              this.totalErrors = Math.max(0, this.totalErrors - 1);
            } else {
              this.totalSaved = Math.max(0, this.totalSaved - 1);
            }
            uni.showToast({
              title: 'Removed',
              icon: 'success'
            });
          }
        }
      });
    },
    
    // 练习题目
    practiceQuestion(questionId) {
      console.log('Practice question:', questionId);
      // 实际应用中导航到练习页面
      uni.navigateTo({
        url: `/pages/practice/practice?questionId=${questionId}`
      });
    },
    
    // 查看解释
    viewExplanation(questionId) {
      console.log('View explanation for question:', questionId);
      // 实际应用中显示题目解释
      uni.navigateTo({
        url: `/pages/explanation/explanation?questionId=${questionId}`
      });
    },
    
    // 显示帖子菜单
    showPostMenu(postId) {
      this.selectedPostId = postId;
      this.showMenu = true;
    },
    
    // 关闭菜单
    closeMenu() {
      this.showMenu = false;
    },
    
    // 分享帖子
    sharePost() {
      console.log('Sharing post:', this.selectedPostId);
      this.closeMenu();
      uni.share({
        provider: 'weixin',
        type: 0,
        title: 'Check out this post!',
        success: () => {
          uni.showToast({
            title: 'Shared!',
            icon: 'success'
          });
        }
      });
    },
    
    // 举报帖子
    reportPost() {
      console.log('Reporting post:', this.selectedPostId);
      this.closeMenu();
      uni.showToast({
        title: 'Reported',
        icon: 'success'
      });
    },
    
    // 删除帖子
    deletePost() {
      uni.showModal({
        title: 'Delete Post',
        content: 'Are you sure you want to delete this saved post?',
        success: (res) => {
          if (res.confirm) {
            this.savedPosts = this.savedPosts.filter(p => p.id !== this.selectedPostId);
            this.closeMenu();
            uni.showToast({
              title: 'Deleted',
              icon: 'success'
            });
          }
        }
      });
    },
    
    // 关注用户
    followUser() {
      const post = this.savedPosts.find(p => p.id === this.selectedPostId);
      if (post) {
        console.log('Following user:', post.username);
        uni.showToast({
          title: `Following ${post.username}`,
          icon: 'success'
        });
      }
      this.closeMenu();
    },
    
    // 切换点赞
    toggleLike(postId) {
      const post = this.savedPosts.find(p => p.id === postId);
      if (post) {
        post.liked = !post.liked;
        post.likes += post.liked ? 1 : -1;
      }
    },
    
    // 取消保存帖子
    unsavePost(postId) {
      uni.showModal({
        title: 'Unsave Post',
        content: 'Remove this post from saved items?',
        success: (res) => {
          if (res.confirm) {
            this.savedPosts = this.savedPosts.filter(p => p.id !== postId);
            uni.showToast({
              title: 'Removed',
              icon: 'success'
            });
          }
        }
      });
    },
    
    // 前往论坛
    goToForum() {
      console.log('Navigate to forum');
      uni.navigateTo({
        url: '/pages/forum/forum'
      });
    },
    // 加载保存的数据
    loadSavedData() {
      // 从本地存储或API加载数据
      const savedData = uni.getStorageSync('savedItems');
      if (savedData) {
        // 解析并设置数据
        console.log('Loading saved data...');
      }
    },
    
    // 刷新数据
    refreshData() {
      // 刷新统计数据
      console.log('Refreshing data...');
    }
  },
  onLoad() {
    // 页面加载时初始化数据
    this.loadSavedData();
  },
  onShow() {
    // 页面显示时刷新数据
    this.refreshData();
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
  color: #333;
}

/* 渐变背景 */
.gradient-bg {
  position: fixed;
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
  height: 45%;
  background: linear-gradient(180deg, #E3F2FD 0%, #FFFFFF 100%);
}

.gradient-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 55%;
  background: linear-gradient(180deg, #FFFFFF 0%, #FFF4F4 100%);
}

/* Header 样式 */
.header {
  padding: 30rpx 40rpx;
  display: flex;
  align-items: center;
  background: transparent;
  position: relative;
  z-index: 10;
  min-height: 120rpx;
}

.back-button {
  background: none;
  border: none;
  color: #666;
  font-size: 40rpx;
  padding: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80rpx;
  height: 80rpx;
}

.page-title {
  font-size: 48rpx;
  font-weight: 600;
  color: #333;
  flex: 1;
  text-align: center;
  margin-right: 80rpx;
}

/* 标签切换 - Theory Test风格 */
.tabs-container {
  padding: 0 40rpx;
  margin-bottom: 40rpx;
  position: relative;
  z-index: 10;
}

.tabs {
  display: flex;
  background: white;
  border-radius: 50rpx;
  padding: 8rpx;
  box-shadow: 0 16rpx 50rpx rgba(0,0,0,0.08);
}

.tab {
  flex: 1;
  padding: 24rpx;
  text-align: center;
  font-size: 30rpx;
  font-weight: 500;
  color: #666;
  background: transparent;
  border: none;
  border-radius: 40rpx;
  transition: all 0.3s ease;
}

.tab.active {
  background: linear-gradient(135deg, #4A9EFF 0%, #2196F3 100%);
  color: white;
  box-shadow: 0 8rpx 30rpx rgba(74, 158, 255, 0.3);
}

/* 容器 */
.container {
  flex: 1;
  padding: 0 40rpx 40rpx;
  position: relative;
  z-index: 10;
  max-width: 800rpx;
  width: 100%;
  margin: 0 auto;
}

/* 错题本/收藏题目切换卡片 */
.analytics-toggle {
  background: white;
  border-radius: 40rpx;
  padding: 40rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 16rpx 50rpx rgba(0,0,0,0.08);
}

.toggle-buttons {
  display: flex;
  gap: 30rpx;
}

.toggle-btn {
  flex: 1;
  padding: 30rpx;
  background: #F8F9FA;
  border: 4rpx solid transparent;
  border-radius: 30rpx;
  transition: all 0.3s ease;
  text-align: center;
  display: flex;
  flex-direction: column;
}

.toggle-btn.active {
  background: linear-gradient(135deg, #4A9EFF 0%, #2196F3 100%);
  border-color: #4A9EFF;
}

.toggle-btn.active .toggle-title,
.toggle-btn.active .toggle-subtitle {
  color: white;
}

.toggle-title {
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 10rpx;
  color: #333;
}

.toggle-subtitle {
  font-size: 24rpx;
  color: #666;
  opacity: 0.8;
}

/* 统计卡片 */
.stats-card {
  background: white;
  border-radius: 40rpx;
  padding: 50rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 16rpx 50rpx rgba(0,0,0,0.08);
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40rpx;
}

.stats-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.clear-btn {
  padding: 16rpx 32rpx;
  background: #F5F5F5;
  border: none;
  border-radius: 30rpx;
  color: #666;
  font-size: 28rpx;
  transition: all 0.3s ease;
}

.clear-btn:active {
  background: #E0E0E0;
}

/* 自动移除开关 */
.auto-remove-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  background: #F8F9FA;
  border-radius: 30rpx;
  margin-bottom: 40rpx;
}

.toggle-label {
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
}

.toggle-switch {
  width: 96rpx;
  height: 56rpx;
  background: #E0E0E0;
  border-radius: 28rpx;
  position: relative;
  transition: background 0.3s;
}

.toggle-switch.active {
  background: #4A9EFF;
}

.toggle-switch::after {
  content: '';
  position: absolute;
  width: 44rpx;
  height: 44rpx;
  background: white;
  border-radius: 50%;
  top: 6rpx;
  left: 6rpx;
  transition: transform 0.3s;
  box-shadow: 0 4rpx 8rpx rgba(0,0,0,0.2);
}

.toggle-switch.active::after {
  transform: translateX(40rpx);
}

/* 统计数据 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30rpx;
}

.stat-item {
  text-align: center;
  padding: 30rpx;
  background: #F8F9FA;
  border-radius: 30rpx;
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 64rpx;
  font-weight: 700;
  color: #4A9EFF;
  margin-bottom: 10rpx;
}

.stat-label {
  font-size: 28rpx;
  color: #666;
}

.error-rate {
  grid-column: span 2;
  background: #F8F9FA;
}

.error-rate .stat-value {
  color: #FF5252;
}

.error-rate .stat-label {
  color: #666;
}

/* 分类列表 */
.category-list {
  background: white;
  border-radius: 40rpx;
  padding: 40rpx;
  box-shadow: 0 16rpx 50rpx rgba(0,0,0,0.08);
}

.category-header {
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;
}

.category-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

/* 分类项目 */
.category-item {
  display: flex;
  align-items: center;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #F5F5F5;
  transition: all 0.3s ease;
}

.category-item:last-child {
  border-bottom: none;
}

.category-item:active {
  background: #F8F9FA;
  margin: 0 -30rpx;
  padding-left: 30rpx;
  padding-right: 30rpx;
  border-radius: 24rpx;
}

.category-number {
  width: 70rpx;
  height: 70rpx;
  background: linear-gradient(135deg, #4A9EFF 0%, #2196F3 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 28rpx;
  margin-right: 30rpx;
}

.category-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.category-name {
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 6rpx;
}

.category-type {
  font-size: 24rpx;
  color: #999;
}

.category-count {
  font-size: 40rpx;
  font-weight: 600;
  color: #666;
  margin-right: 10rpx;
}

.category-arrow {
  color: #999;
  font-size: 36rpx;
}

/* 题目类型选择器 */
.question-type-selector {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  margin-bottom: 40rpx;
}

.type-card {
  background: white;
  border-radius: 30rpx;
  padding: 30rpx;
  text-align: center;
  box-shadow: 0 10rpx 36rpx rgba(0,0,0,0.06);
  transition: all 0.3s ease;
  border: 4rpx solid transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.type-card.active {
  border-color: #4A9EFF;
  background: #F8FBFF;
}

.type-card:active {
  transform: scale(0.98);
}

.type-icon {
  font-size: 56rpx;
  margin-bottom: 16rpx;
}

.type-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 6rpx;
}

.type-count {
  font-size: 24rpx;
  color: #999;
}

/* 帖子卡片 */
.post-card {
  background: white;
  border-radius: 40rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 10rpx 36rpx rgba(0,0,0,0.06);
}

/* 用户信息 */
.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
}

.user-avatar {
  width: 90rpx;
  height: 90rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  color: white;
  font-size: 36rpx;
  font-weight: 600;
}

.user-details {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.username {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 4rpx;
}

.test-centre {
  font-size: 26rpx;
  color: #666;
}

.post-menu {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 40rpx;
}

/* 帖子内容 */
.post-content {
  margin-bottom: 30rpx;
}

.post-text {
  font-size: 30rpx;
  color: #333;
  line-height: 1.6;
  margin-bottom: 30rpx;
}

/* 图片网格 */
.image-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
  margin-bottom: 30rpx;
}

.image-item {
  aspect-ratio: 1;
  border-radius: 24rpx;
  overflow: hidden;
  background: #F5F5F5;
}

.image-item image {
  width: 100%;
  height: 100%;
}

/* 交互栏 */
.post-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 30rpx;
  border-top: 1rpx solid #F0F0F0;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx 24rpx;
  background: transparent;
  border: none;
  border-radius: 40rpx;
  font-size: 28rpx;
  color: #666;
}

.action-button.liked {
  color: #FF6B6B;
}

.action-button.saved {
  color: #4A9EFF;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;
  text-align: center;
}

.empty-icon {
  width: 200rpx;
  height: 200rpx;
  background: #F8F9FA;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40rpx;
  font-size: 80rpx;
}

.empty-title {
  font-size: 40rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
}

.empty-message {
  font-size: 28rpx;
  color: #666;
  line-height: 1.5;
  margin-bottom: 60rpx;
}

.browse-button {
  padding: 28rpx 64rpx;
  background: linear-gradient(135deg, #4A9EFF 0%, #2196F3 100%);
  color: white;
  border: none;
  border-radius: 50rpx;
  font-size: 32rpx;
  font-weight: 600;
  box-shadow: 0 12rpx 40rpx rgba(74, 158, 255, 0.35);
}

/* 操作菜单 */
.action-menu {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-radius: 50rpx 50rpx 0 0;
  padding: 50rpx 40rpx 70rpx;
  box-shadow: 0 -10rpx 40rpx rgba(0,0,0,0.1);
  z-index: 100;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.action-menu.show {
  transform: translateY(0);
}

.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 99;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.menu-overlay.show {
  opacity: 1;
  pointer-events: auto;
}

.menu-item {
  padding: 30rpx;
  display: flex;
  align-items: center;
  gap: 30rpx;
  border-radius: 24rpx;
  transition: background 0.2s ease;
}

.menu-item:active {
  background: #F8F9FA;
}

.menu-item-icon {
  font-size: 48rpx;
  color: #666;
}

.menu-item-text {
  flex: 1;
  font-size: 32rpx;
  color: #333;
}

.menu-divider {
  height: 1rpx;
  background: #F0F0F0;
  margin: 20rpx 0;
}

/* 题目详情模态框 */
.questions-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  z-index: 101;
  transform: translateX(100%);
  transition: transform 0.3s ease;
}

.questions-modal.show {
  transform: translateX(0);
}

.modal-header {
  padding: 30rpx 40rpx;
  border-bottom: 1rpx solid #F0F0F0;
  display: flex;
  align-items: center;
  background: white;
  position: sticky;
  top: 0;
  z-index: 10;
}

.close-modal {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 40rpx;
}

.modal-title {
  flex: 1;
  text-align: center;
  font-size: 40rpx;
  font-weight: 600;
  color: #333;
  margin-right: 80rpx;
}

.questions-content {
  padding: 40rpx;
  height: calc(100vh - 140rpx);
}

/* 题目卡片 */
.question-card {
  background: white;
  border-radius: 40rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 10rpx 36rpx rgba(0,0,0,0.06);
  border: 4rpx solid transparent;
  transition: all 0.3s ease;
}

.question-card.collapsed {
  padding-bottom: 30rpx;
}

.question-card:active {
  transform: scale(0.98);
}

.question-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 30rpx;
}

.question-card.collapsed .question-header {
  margin-bottom: 0;
}

.expand-icon {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  margin-left: auto;
  transition: transform 0.3s ease;
  font-size: 36rpx;
}

.question-card.collapsed .expand-icon {
  transform: rotate(180deg);
}

.question-body {
  max-height: 2000rpx;
  overflow: hidden;
  transition: max-height 0.3s ease, opacity 0.3s ease;
  opacity: 1;
}

.question-card.collapsed .question-body {
  max-height: 0;
  opacity: 0;
}

.question-number {
  width: 70rpx;
  height: 70rpx;
  background: linear-gradient(135deg, #4A9EFF 0%, #2196F3 100%);
  color: white;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 28rpx;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.question-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.question-category {
  font-size: 24rpx;
  color: #4A9EFF;
  margin-bottom: 6rpx;
}

.question-badges {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
}

.badge {
  padding: 8rpx 20rpx;
  border-radius: 24rpx;
  font-size: 22rpx;
  font-weight: 500;
}

.badge.difficulty-easy {
  background: #E8F5E9;
  color: #4CAF50;
}

.badge.difficulty-medium {
  background: #FFF8E1;
  color: #FFA000;
}

.badge.difficulty-hard {
  background: #FFEBEE;
  color: #FF5252;
}

.badge.accuracy {
  background: #F3E5F5;
  color: #9C27B0;
}

.remove-button {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 36rpx;
}

.question-text {
  font-size: 30rpx;
  color: #333;
  line-height: 1.6;
  margin-bottom: 30rpx;
}

.question-image {
  width: 100%;
  border-radius: 24rpx;
  margin-bottom: 30rpx;
  background: #F5F5F5;
  aspect-ratio: 16/9;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.option-item {
  padding: 24rpx 30rpx;
  background: #F8F9FA;
  border-radius: 24rpx;
  font-size: 28rpx;
  color: #333;
  border: 4rpx solid transparent;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.option-marker {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: white;
  border: 4rpx solid #E0E0E0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: 600;
  color: #666;
  flex-shrink: 0;
}

.option-item.correct {
  border-color: #4CAF50;
  background: #E8F5E9;
}

.option-item.correct .option-marker {
  background: #4CAF50;
  border-color: #4CAF50;
  color: white;
}

.option-item.incorrect {
  border-color: #FF5252;
  background: #FFEBEE;
}

.option-item.incorrect .option-marker {
  background: #FF5252;
  border-color: #FF5252;
  color: white;
}

.option-item.user-selected.incorrect::after {
  content: '✗';
  color: #FF5252;
  font-weight: bold;
  margin-left: auto;
}

.option-item.correct::after {
  content: '✓';
  color: #4CAF50;
  font-weight: bold;
  margin-left: auto;
}

/* 题目底部信息 */
.question-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 30rpx;
  border-top: 1rpx solid #F0F0F0;
}

.question-stats {
  display: flex;
  gap: 30rpx;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.stat-label {
  font-size: 22rpx;
  color: #999;
  margin-top: 4rpx;
}

.action-buttons {
  display: flex;
  gap: 20rpx;
}

.action-btn {
  padding: 16rpx 32rpx;
  background: #F8F9FA;
  border: none;
  border-radius: 30rpx;
  font-size: 26rpx;
  color: #666;
  transition: all 0.3s ease;
}

.action-btn:active {
  background: #E0E0E0;
}

.action-btn.primary {
  background: linear-gradient(135deg, #4A9EFF 0%, #2196F3 100%);
  color: white;
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  gap: 20rpx;
  margin-bottom: 40rpx;
  overflow-x: auto;
  padding-bottom: 10rpx;
}

.filter-chip {
  padding: 16rpx 32rpx;
  background: white;
  border: 2rpx solid #E0E0E0;
  border-radius: 40rpx;
  font-size: 28rpx;
  color: #666;
  white-space: nowrap;
  transition: all 0.3s ease;
}

.filter-chip.active {
  background: linear-gradient(135deg, #4A9EFF 0%, #2196F3 100%);
  color: white;
  border-color: transparent;
}

/* 响应式 */
@media screen and (max-width: 750rpx) {
  .container {
    padding: 0 30rpx 30rpx;
  }

  .post-card {
    padding: 30rpx;
  }

  .stats-card,
  .category-list {
    padding: 40rpx;
  }

  .question-card {
    padding: 30rpx;
  }
}
</style>