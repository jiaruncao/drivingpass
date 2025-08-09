<template>
  <view class="app">
    <!-- 分块渐变背景 -->
    <view class="gradient-bg">
      <view class="gradient-top"></view>
      <view class="gradient-bottom"></view>
    </view>

    <!-- Header -->
    <view class="header">
      <view v-if="currentView !== 'home'" class="back-button" @click="goBack">←</view>
      <text class="page-title">{{ pageTitle }}</text>
    </view>

    <!-- Main Content -->
    <view class="container">
      <!-- Home View -->
      <view v-if="currentView === 'home'" class="mode-cards-container">
        <view class="mode-card learn" @click="selectMode('learn')">
          <view class="mode-icon">📚</view>
          <text class="mode-title">Learn Mode</text>
          <text class="mode-subtitle">Study at your own pace</text>
          <view class="progress-info">
            <text class="progress-label">Progress</text>
            <text class="progress-value">{{ overallProgress }}%</text>
          </view>
        </view>

        <view class="mode-card test" @click="selectMode('test')">
          <view class="mode-icon">📝</view>
          <text class="mode-title">Test Mode</text>
          <text class="mode-subtitle">Practice like the real exam</text>
          <view class="progress-info">
            <text class="progress-label">Practiced</text>
            <text class="progress-value">{{ testsPracticed }}x</text>
          </view>
        </view>
      </view>

      <!-- Test Mode View -->
      <view v-if="currentView === 'test'" class="options-container">
        <view class="options-card">
          <view class="option-item">
            <text class="option-label">Number of Questions</text>
            <view class="option-value" @click="showQuantityPicker = true">
              <text>{{ testOptions.questionCount }}</text>
              <text style="color: #999;">›</text>
            </view>
          </view>
          <view class="option-item">
            <text class="option-label">Test All Questions</text>
            <view class="toggle-switch" :class="{active: testOptions.testAll}" @click="toggleTestAll"></view>
          </view>
          <view class="option-item">
            <text class="option-label">Skip Correct Answers</text>
            <view class="toggle-switch" :class="{active: testOptions.skipCorrect}" @click="toggleSkipCorrect"></view>
          </view>
        </view>
      </view>

      <!-- Learn Mode View -->
      <view v-if="currentView === 'learn'" class="categories-container">
        <view v-for="category in categories" 
              :key="category.id"
              class="category-card" 
              :class="{selected: selectedCategory === category.id}"
              @click="selectCategory(category.id)">
          <view class="category-header">
            <view class="category-left">
              <view class="radio-button" :class="{selected: selectedCategory === category.id}"></view>
              <text class="category-name">{{ category.name }}</text>
            </view>
            <text class="category-progress">{{ category.progress }}%</text>
          </view>
          <view class="category-stats">
            <text>Total: {{ category.total }}</text>
            <text>Wrong: {{ category.wrong }}</text>
          </view>
          <view class="progress-bar">
            <view class="progress-fill" :style="{width: category.progress + '%'}"></view>
          </view>
        </view>
      </view>
    </view>

    <!-- Action Button -->
    <view v-if="currentView !== 'home'" class="button-container">
      <view class="action-button" @click="handleActionButton">
        {{ currentView === 'test' ? 'Start Exam' : 'Start Learning' }}
      </view>
    </view>

    <!-- Quantity Picker Modal -->
    <view v-if="showQuantityPicker" class="modal-backdrop" @click="closeModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">Select Number of Questions</text>
        </view>
        <view class="picker-container">
          <text class="range-value">{{ tempQuestionCount }}</text>
          <slider class="range-slider" 
                  :value="tempQuestionCount" 
                  :min="10" 
                  :max="100" 
                  :step="10"
                  @change="onSliderChange"
                  activeColor="#4A9EFF"
                  backgroundColor="#E0E0E0"
                  block-color="#4A9EFF"
                  block-size="28"/>
          <view class="range-labels">
            <text>10</text>
            <text>100</text>
          </view>
        </view>
        <view class="modal-actions">
          <view class="modal-button cancel" @click="showQuantityPicker = false">Cancel</view>
          <view class="modal-button confirm" @click="confirmQuantity">Confirm</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      currentView: 'home', // 当前视图状态
      overallProgress: 81, // 整体进度
      testsPracticed: 12, // 练习次数
      showQuantityPicker: false, // 显示数量选择器
      tempQuestionCount: 50, // 临时题目数量
      selectedCategory: 1, // 选中的分类
      testOptions: {
        questionCount: 50, // 题目数量
        testAll: true, // 测试所有题目
        skipCorrect: false // 跳过正确答案
      },
      categories: [
        {
          id: 1,
          name: 'Category 1',
          total: 124,
          wrong: 24,
          progress: 95
        },
        {
          id: 2,
          name: 'Category 2',
          total: 235,
          wrong: 24,
          progress: 0
        },
        {
          id: 3,
          name: 'Category 3',
          total: 564,
          wrong: 24,
          progress: 60
        },
        {
          id: 4,
          name: 'Category 4',
          total: 332,
          wrong: 24,
          progress: 24
        }
      ]
    }
  },
  computed: {
    pageTitle() {
      switch(this.currentView) {
        case 'home':
          return 'Theory Test';
        case 'test':
          return 'Test Mode';
        case 'learn':
          return 'Learn Mode';
        default:
          return 'Theory Test';
      }
    }
  },
  methods: {
    // 选择模式
    selectMode(mode) {
      this.currentView = mode;
    },
    // 返回上一页
    goBack() {
      this.currentView = 'home';
    },
    // 选择分类
    selectCategory(categoryId) {
      this.selectedCategory = categoryId;
    },
    // 切换测试所有题目
    toggleTestAll() {
      this.testOptions.testAll = !this.testOptions.testAll;
    },
    // 切换跳过正确答案
    toggleSkipCorrect() {
      this.testOptions.skipCorrect = !this.testOptions.skipCorrect;
    },
    // 滑块变化事件
    onSliderChange(e) {
      this.tempQuestionCount = e.detail.value;
    },
    // 确认数量选择
    confirmQuantity() {
      this.testOptions.questionCount = this.tempQuestionCount;
      this.showQuantityPicker = false;
    },
    // 关闭模态框
    closeModal() {
      this.showQuantityPicker = false;
    },
    // 处理操作按钮点击
    handleActionButton() {
      if (this.currentView === 'test') {
        this.startTest();
      } else if (this.currentView === 'learn') {
        this.startLearning();
      }
    },
    // 开始测试
    startTest() {
      console.log('Starting test with options:', this.testOptions);
      // 实际应用中这里会导航到测试页面
      uni.showToast({
        title: '开始测试',
        icon: 'success'
      });
    },
    // 开始学习
    startLearning() {
      const category = this.categories.find(c => c.id === this.selectedCategory);
      console.log('Starting learning for category:', category);
      // 实际应用中这里会导航到学习页面
      uni.showToast({
        title: '开始学习',
        icon: 'success'
      });
    },
    // 获取用户进度 - API调用示例
    async fetchUserProgress() {
      try {
        const response = await uni.request({
          url: '/api/user/progress',
          method: 'GET'
        });
        if (response.statusCode === 200) {
          this.overallProgress = response.data.overallProgress;
          this.testsPracticed = response.data.testsPracticed;
        }
      } catch (error) {
        console.error('Failed to fetch user progress:', error);
      }
    },
    // 获取分类数据 - API调用示例
    async fetchCategories() {
      try {
        const response = await uni.request({
          url: '/api/categories',
          method: 'GET'
        });
        if (response.statusCode === 200) {
          this.categories = response.data;
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    }
  },
  onLoad() {
    // 页面加载时获取数据
    // this.fetchUserProgress();
    // this.fetchCategories();
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

/* 分块渐变背景 */
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

/* Header Styles */
.header {
  padding: 20px;
  display: flex;
  align-items: center;
  background: transparent;
  position: relative;
  z-index: 10;
}

.back-button {
  background: none;
  border: none;
  color: #666;
  font-size: 24px;
  padding: 8px;
  margin-right: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
}

.page-title {
  font-size: 32px;
  font-weight: 600;
  color: #333;
  flex: 1;
  text-align: center;
  margin-right: 52px;
}

/* Container */
.container {
  flex: 1;
  padding: 40px 20px 30px;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 10;
}

/* Mode Selection Cards */
.mode-cards-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 30px;
  max-width: 400px;
  width: 100%;
  margin: -40px auto 0;
}

.mode-card {
  background: white;
  border-radius: 30px;
  padding: 40px 35px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  position: relative;
  overflow: hidden;
}

.mode-card:active {
  transform: scale(0.98);
}

.mode-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
}

.mode-card.learn::before {
  background: linear-gradient(90deg, #4A9EFF 0%, #2196F3 100%);
}

.mode-card.test::before {
  background: linear-gradient(90deg, #FF6B6B 0%, #FF5252 100%);
}

.mode-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 25px;
  background: #F8F9FA;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
}

.mode-title {
  font-size: 26px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #333;
  display: block;
}

.mode-subtitle {
  font-size: 16px;
  color: #666;
  margin-bottom: 25px;
  line-height: 1.4;
  display: block;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding-top: 20px;
  border-top: 1px solid #F0F0F0;
}

.progress-label {
  font-size: 15px;
  color: #999;
}

.progress-value {
  font-size: 28px;
  font-weight: 700;
}

.learn .progress-value {
  color: #4A9EFF;
}

.test .progress-value {
  color: #FF6B6B;
}

/* Options Section */
.options-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 400px;
  width: 100%;
  margin: 0 auto;
}

.options-card {
  background: white;
  border-radius: 30px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
}

.option-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 22px 0;
  border-bottom: 1px solid #F5F5F5;
}

.option-item:last-child {
  border-bottom: none;
}

.option-label {
  font-size: 17px;
  color: #333;
  font-weight: 500;
}

.option-value {
  font-size: 17px;
  color: #4A9EFF;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.toggle-switch {
  width: 52px;
  height: 32px;
  background: #E0E0E0;
  border-radius: 16px;
  position: relative;
  transition: background 0.3s;
}

.toggle-switch.active {
  background: #4A9EFF;
}

.toggle-switch::after {
  content: '';
  position: absolute;
  width: 26px;
  height: 26px;
  background: white;
  border-radius: 50%;
  top: 3px;
  left: 3px;
  transition: transform 0.3s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.toggle-switch.active::after {
  transform: translateX(20px);
}

/* Category Selection */
.categories-container {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 100px;
  max-width: 400px;
  width: 100%;
  margin: 0 auto;
}

.category-card {
  background: white;
  border-radius: 25px;
  padding: 24px;
  margin-bottom: 18px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.06);
  border: 2px solid transparent;
}

.category-card:active {
  transform: scale(0.98);
}

.category-card.selected {
  border-color: #4A9EFF;
  background: #F8FBFF;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.category-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.radio-button {
  width: 24px;
  height: 24px;
  border: 2px solid #4A9EFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  flex-shrink: 0;
}

.radio-button.selected::after {
  content: '';
  width: 12px;
  height: 12px;
  background: #4A9EFF;
  border-radius: 50%;
}

.category-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.category-progress {
  font-size: 18px;
  font-weight: 600;
  color: #4A9EFF;
}

.category-stats {
  display: flex;
  gap: 30px;
  font-size: 15px;
  color: #666;
  margin-bottom: 15px;
  padding-left: 39px;
}

.progress-bar {
  width: calc(100% - 39px);
  height: 8px;
  background: #F0F0F0;
  border-radius: 4px;
  overflow: hidden;
  margin-left: 39px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4A9EFF 0%, #2196F3 100%);
  border-radius: 4px;
  transition: width 0.5s ease;
}

/* Action Button */
.button-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background: linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 30%, white 100%);
  z-index: 20;
}

.action-button {
  width: 100%;
  max-width: 360px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  background: linear-gradient(135deg, #4A9EFF 0%, #2196F3 100%);
  color: white;
  border: none;
  border-radius: 50px;
  font-size: 18px;
  font-weight: 600;
  box-shadow: 0 8px 24px rgba(74, 158, 255, 0.35);
}

.action-button:active {
  transform: scale(0.98);
}

/* Modal */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 100;
  display: flex;
  align-items: flex-end;
}

.modal-content {
  background: white;
  border-radius: 30px 30px 0 0;
  padding: 30px 25px 40px;
  width: 100%;
  animation: slideUp 0.3s ease;
}

.modal-header {
  text-align: center;
  margin-bottom: 30px;
}

.modal-title {
  font-size: 22px;
  font-weight: 600;
  color: #333;
}

.picker-container {
  padding: 20px 0;
}

.range-slider {
  width: 100%;
  margin: 20px 0;
}

.range-value {
  text-align: center;
  font-size: 48px;
  font-weight: 700;
  color: #4A9EFF;
  margin: 20px 0;
  display: block;
}

.range-labels {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #999;
  margin-top: 10px;
}

.modal-actions {
  display: flex;
  gap: 15px;
  margin-top: 40px;
}

.modal-button {
  flex: 1;
  padding: 16px;
  border-radius: 25px;
  font-size: 17px;
  font-weight: 600;
  border: none;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-button.cancel {
  background: #F5F5F5;
  color: #666;
}

.modal-button.confirm {
  background: linear-gradient(135deg, #4A9EFF 0%, #2196F3 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(74, 158, 255, 0.3);
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
</style>