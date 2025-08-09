<template>
  <view class="app">
    <view class="gradient-bg">
      <view class="gradient-top"></view>
      <view class="gradient-bottom"></view>
    </view>

    <!-- 头部导航 -->
    <view class="header">
      <view class="back-button" @tap="goBack">←</view>
      <text class="page-title">Road Sign</text>
    </view>

    <!-- 主要内容 -->
    <view class="container">
      <!-- 首页视图 -->
      <view v-if="currentView === 'home'" class="mode-cards-container">
        <view class="mode-card learn" @tap="selectMode('learn')">
          <view class="mode-icon">📚</view>
          <text class="mode-title">Learn Mode</text>
          <text class="mode-subtitle">Study at your own pace</text>
          <view class="progress-info">
            <text class="progress-label">Progress</text>
            <text class="progress-value">{{ overallProgress }}%</text>
          </view>
        </view>

        <view class="mode-card test" @tap="selectMode('test')">
          <view class="mode-icon">📝</view>
          <text class="mode-title">Test Mode</text>
          <text class="mode-subtitle">Practice like the real exam</text>
          <view class="progress-info">
            <text class="progress-label">Practiced</text>
            <text class="progress-value">{{ testsPracticed }}x</text>
          </view>
        </view>
      </view>

      <!-- 测试模式视图 -->
      <view v-if="currentView === 'test'" class="options-container">
        <view class="options-card">
          <view class="option-item">
            <text class="option-label">Number of Questions</text>
            <view class="option-value" @tap="showQuantityPicker = true">
              <text>{{ testOptions.questionCount }}</text>
              <text style="color: #999;">›</text>
            </view>
          </view>
          <view class="option-item">
            <text class="option-label">Test All Questions</text>
            <view class="toggle-switch" :class="{active: testOptions.testAll}" @tap="testOptions.testAll = !testOptions.testAll"></view>
          </view>
          <view class="option-item">
            <text class="option-label">Skip Correct Answers</text>
            <view class="toggle-switch" :class="{active: testOptions.skipCorrect}" @tap="testOptions.skipCorrect = !testOptions.skipCorrect"></view>
          </view>
        </view>

        <view class="button-container">
          <view class="action-button" @tap="startTest">Start Exam</view>
        </view>
      </view>

      <!-- Road Signs 页面视图 -->
      <view v-if="currentView === 'road-signs'" class="road-signs-container">
        <!-- 搜索栏 -->
        <view class="search-container">
          <input type="text" class="search-input" placeholder="Search by keywords" v-model="searchKeyword" />
          <view class="search-button" @tap="searchSigns">Search</view>
        </view>

        <!-- 道路标志分类列表 -->
        <view v-for="category in filteredCategories" :key="category.id" class="category-section">
          <view class="category-header" @tap="enterCategoryDetail(category)">
            <text class="category-title">{{ category.name }}</text>
            <view class="category-meta">
              <text class="category-count">{{ category.signs.length }} signs</text>
              <text class="next-arrow">›</text>
            </view>
          </view>

          <!-- 道路标志网格 -->
          <view class="signs-grid" @tap="enterCategoryDetail(category)">
            <view v-for="sign in category.signs" :key="sign.id" class="sign-item">
              <view class="sign-icon" :class="sign.iconClass">{{ sign.symbol }}</view>
            </view>
          </view>

          <!-- 进度条 -->
          <view class="category-progress" @tap="enterCategoryDetail(category)">
            <view class="progress-bar">
              <view class="progress-fill" :style="{width: category.progress + '%'}"></view>
            </view>
            <text class="progress-percentage">{{ category.progress }}%</text>
          </view>
        </view>
      </view>

      <!-- 分类详情页面视图 -->
      <view v-if="currentView === 'category-detail' && selectedCategory" class="category-detail-container">
        <!-- 分类完成度 -->
        <view class="category-detail-header">
          <view class="category-completion">Completed: {{ selectedCategory.progress }}%</view>
        </view>

        <!-- 道路标志详情网格 - 2列布局 -->
        <view class="detail-signs-grid">
          <view v-for="sign in selectedCategory.signs" :key="sign.id" class="detail-sign-item" @tap="selectDetailSign(sign)">
            <view class="detail-sign-icon" :class="sign.iconClass">{{ sign.symbol }}</view>
            <text class="detail-sign-name">{{ sign.name }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 数量选择器模态框 -->
    <view v-if="showQuantityPicker" class="modal-backdrop" @tap="closeModal">
      <view class="modal-content" @tap.stop>
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
                  block-size="24"/>
          <view class="range-labels">
            <text>10</text>
            <text>100</text>
          </view>
        </view>
        <view class="modal-actions">
          <view class="modal-button cancel" @tap="showQuantityPicker = false">Cancel</view>
          <view class="modal-button confirm" @tap="confirmQuantity">Confirm</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      currentView: 'home', // 当前视图状态：home, test, road-signs, category-detail
      overallProgress: 21, // 整体学习进度
      testsPracticed: 12, // 测试练习次数
      showQuantityPicker: false, // 是否显示数量选择器
      tempQuestionCount: 50, // 临时题目数量
      searchKeyword: '', // 搜索关键词
      selectedCategoryId: null, // 选中的分类ID
      testOptions: {
        questionCount: 50, // 测试题目数量
        testAll: true, // 是否测试所有题目
        skipCorrect: false // 是否跳过已答对的题目
      },
      // 道路标志分类数据
      roadSignCategories: [
        {
          id: 1,
          name: 'Prohibitory Signs',
          progress: 95,
          signs: [
            { id: 1, symbol: '🚫', iconClass: 'no-entry', name: 'No Entry' },
            { id: 2, symbol: '↻', iconClass: 'no-right-turn', name: 'No Right Turn' },
            { id: 3, symbol: '🚗', iconClass: 'no-overtaking', name: 'No Overtaking' },
            { id: 4, symbol: '⛔', iconClass: 'no-stopping', name: 'No Stopping' },
            { id: 17, symbol: '🚶', iconClass: 'no-pedestrians', name: 'No Pedestrians' },
            { id: 18, symbol: '📯', iconClass: 'no-horn', name: 'No Sounding Horn' },
            { id: 19, symbol: '🚲', iconClass: 'no-pedestrians', name: 'No Bicycles' },
            { id: 20, symbol: '🚛', iconClass: 'no-horn', name: 'No Heavy Vehicles' }
          ]
        },
        {
          id: 2,
          name: 'Warning Signs',
          progress: 80,
          signs: [
            { id: 5, symbol: '⚠️', iconClass: 'warning-general', name: 'General Warning' },
            { id: 6, symbol: '🛣️', iconClass: 'road-narrows', name: 'Road Narrows' },
            { id: 7, symbol: '🚸', iconClass: 'children-crossing', name: 'Children Crossing' },
            { id: 8, symbol: '🦌', iconClass: 'animals-crossing', name: 'Animals Crossing' }
          ]
        },
        {
          id: 3,
          name: 'Mandatory Signs',
          progress: 80,
          signs: [
            { id: 9, symbol: '➡️', iconClass: 'turn-right', name: 'Turn Right Only' },
            { id: 10, symbol: '⬅️', iconClass: 'turn-left', name: 'Turn Left Only' },
            { id: 11, symbol: '⬆️', iconClass: 'ahead-only', name: 'Ahead Only' },
            { id: 12, symbol: '🔄', iconClass: 'roundabout', name: 'Mini Roundabout' }
          ]
        },
        {
          id: 4,
          name: 'Information Signs',
          progress: 80,
          signs: [
            { id: 13, symbol: 'ℹ️', iconClass: 'information', name: 'General Information' },
            { id: 14, symbol: '🅿️', iconClass: 'parking', name: 'Parking' },
            { id: 15, symbol: '🏥', iconClass: 'hospital', name: 'Hospital' },
            { id: 16, symbol: '⛽', iconClass: 'petrol-station', name: 'Petrol Station' }
          ]
        }
      ]
    }
  },
  computed: {
    // 计算页面标题
    pageTitle() {
      switch(this.currentView) {
        case 'home':
          return 'Theory Test';
        case 'test':
          return 'Test Mode';
        case 'road-signs':
          return 'Road Sign';
        case 'category-detail':
          const category = this.selectedCategory;
          return category ? category.name : 'Category Detail';
        default:
          return 'Theory Test';
      }
    },
    // 过滤后的分类列表（用于搜索功能）
    filteredCategories() {
      if (!this.searchKeyword.trim()) {
        return this.roadSignCategories;
      }
      
      return this.roadSignCategories.map(category => {
        const filteredSigns = category.signs.filter(sign => 
          sign.name.toLowerCase().includes(this.searchKeyword.toLowerCase())
        );
        return {
          ...category,
          signs: filteredSigns
        };
      }).filter(category => category.signs.length > 0);
    },
    // 当前选中的分类
    selectedCategory() {
      return this.roadSignCategories.find(cat => cat.id === this.selectedCategoryId);
    }
  },
  methods: {
    // 选择学习或测试模式
    selectMode(mode) {
      if (mode === 'learn') {
        this.currentView = 'road-signs'; // Learn模式直接进入Road Signs页面
      } else {
        this.currentView = mode;
      }
    },
    // 返回上一页或退出应用
    goBack() {
      if (this.currentView === 'home') {
        // 首页的返回按钮可以关闭应用或返回上级页面
        console.log('Navigate back or close app');
        // 实际应用中可以调用返回上级页面的API
        uni.navigateBack({
          fail: () => {
            // 如果没有上级页面，可以退出应用
            console.log('No previous page, exit app');
          }
        });
      } else if (this.currentView === 'category-detail') {
        this.currentView = 'road-signs'; // 从分类详情返回道路标志列表
        this.selectedCategoryId = null;
      } else if (this.currentView === 'road-signs') {
        this.currentView = 'home'; // 从Road Signs页面返回首页
      } else {
        this.currentView = 'home';
      }
    },
    // 进入分类详情页面
    enterCategoryDetail(category) {
      console.log('Entering category detail for:', category.name);
      this.selectedCategoryId = category.id;
      this.currentView = 'category-detail';
    },
    // 搜索道路标志
    searchSigns() {
      console.log('Searching for signs with keyword:', this.searchKeyword);
      // 搜索功能已通过computed属性filteredCategories实现
    },
    // 选择特定道路标志
    selectSign(sign) {
      console.log('Selected road sign:', sign);
      // 这里可以导航到标志详情页面或开始学习
    },
    // 选择详情页面中的道路标志
    selectDetailSign(sign) {
      console.log('Selected detail sign:', sign);
      // 这里可以导航到标志学习页面或显示标志详细信息
    },
    // 滑块变化事件
    onSliderChange(e) {
      this.tempQuestionCount = e.detail.value;
    },
    // 确认题目数量选择
    confirmQuantity() {
      this.testOptions.questionCount = this.tempQuestionCount;
      this.showQuantityPicker = false;
    },
    // 关闭模态框
    closeModal() {
      this.showQuantityPicker = false;
    },
    // 开始测试
    startTest() {
      console.log('Starting test with options:', this.testOptions);
      // 这里可以调用API开始测试
      uni.showToast({
        title: '开始测试',
        icon: 'success'
      });
    },
    // 获取用户进度数据 - API调用示例
    async fetchUserProgress() {
      try {
        const response = await uni.request({
          url: '/api/user/progress',
          method: 'GET'
        });
        if (response[1].statusCode === 200) {
          this.overallProgress = response[1].data.overallProgress;
          this.testsPracticed = response[1].data.testsPracticed;
        }
      } catch (error) {
        console.error('Failed to fetch user progress:', error);
      }
    },
    // 获取道路标志分类数据 - API调用示例
    async fetchRoadSignCategories() {
      try {
        const response = await uni.request({
          url: '/api/road-signs/categories',
          method: 'GET'
        });
        if (response[1].statusCode === 200) {
          this.roadSignCategories = response[1].data;
        }
      } catch (error) {
        console.error('Failed to fetch road sign categories:', error);
      }
    }
  },
  onLoad() {
    // 页面加载时获取数据
    // this.fetchUserProgress();
    // this.fetchRoadSignCategories();
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
  padding: 15px 20px;
  display: flex;
  align-items: center;
  background: transparent;
  position: relative;
  z-index: 10;
  min-height: 60px;
}

.back-button {
  background: none;
  border: none;
  color: #666;
  font-size: 20px;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  flex: 1;
  text-align: center;
  margin-right: 40px;
}

/* 容器 */
.container {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 10;
}

/* 搜索栏 */
.search-container {
  margin-bottom: 30px;
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-input {
  flex: 1;
  background: #f5f5f5;
  border: none;
  border-radius: 25px;
  padding: 15px 20px;
  font-size: 16px;
  color: #333;
  outline: none;
  height: 100%;
}

.search-input::placeholder {
  color: #999;
}

.search-button {
  background: linear-gradient(135deg, #4A9EFF 0%, #2196F3 100%);
  color: white;
  border: none;
  border-radius: 20px;
  padding: 15px 25px;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(74, 158, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-button:active {
  transform: scale(0.98);
}

/* 模式选择卡片 */
.mode-cards-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 20px;
  max-width: 350px;
  width: 100%;
  margin: 0 auto;
}

.mode-card {
  background: white;
  border-radius: 20px;
  padding: 30px 25px;
  text-align: center;
  box-shadow: 0 8px 25px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
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
  height: 4px;
}

.mode-card.learn::before {
  background: linear-gradient(90deg, #4A9EFF 0%, #2196F3 100%);
}

.mode-card.test::before {
  background: linear-gradient(90deg, #FF6B6B 0%, #FF5252 100%);
}

.mode-icon {
  width: 60px;
  height: 60px;
  margin: 0 auto 20px;
  background: #F8F9FA;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.mode-title {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
  display: block;
}

.mode-subtitle {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
  line-height: 1.4;
  display: block;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding-top: 16px;
  border-top: 1px solid #F0F0F0;
}

.progress-label {
  font-size: 14px;
  color: #999;
}

.progress-value {
  font-size: 24px;
  font-weight: 700;
}

.learn .progress-value {
  color: #4A9EFF;
}

.test .progress-value {
  color: #FF6B6B;
}

/* 选项容器 */
.options-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 350px;
  width: 100%;
  margin: 0 auto;
}

.options-card {
  background: white;
  border-radius: 20px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.08);
}

.option-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 0;
  border-bottom: 1px solid #F5F5F5;
}

.option-item:last-child {
  border-bottom: none;
}

.option-label {
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

.option-value {
  font-size: 16px;
  color: #4A9EFF;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

.toggle-switch {
  width: 48px;
  height: 28px;
  background: #E0E0E0;
  border-radius: 14px;
  position: relative;
  transition: background 0.3s;
}

.toggle-switch.active {
  background: #4A9EFF;
}

.toggle-switch::after {
  content: '';
  position: absolute;
  width: 22px;
  height: 22px;
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

/* Road Sign分类列表 */
.road-signs-container {
  flex: 1;
  overflow-y: auto;
  max-width: 400px;
  width: 100%;
  margin: 0 auto;
}

.category-section {
  margin-bottom: 30px;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding: 0 5px;
}

.category-header:active {
  opacity: 0.7;
}

.category-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.category-meta {
  display: flex;
  align-items: center;
  gap: 15px;
}

.category-count {
  font-size: 14px;
  color: #999;
}

.next-arrow {
  font-size: 16px;
  color: #999;
}

/* 道路标志网格 */
.signs-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 15px;
}

.signs-grid:active {
  opacity: 0.7;
}

.sign-item {
  aspect-ratio: 1;
  background: white;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
  position: relative;
  pointer-events: none; /* 阻止单个标志的点击事件 */
}

.sign-item image {
  width: 80%;
  height: 80%;
  object-fit: contain;
}

/* 用CSS创建道路标志图标 */
.sign-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  font-weight: bold;
}

/* 禁止类标志 - 红色圆形 */
.sign-icon.no-entry,
.sign-icon.no-right-turn,
.sign-icon.no-overtaking,
.sign-icon.no-stopping,
.sign-icon.no-pedestrians,
.sign-icon.no-horn {
  background: #ff4444;
  border: 3px solid #cc0000;
}

/* 警告类标志 - 黄色三角形 */
.sign-icon.warning-general,
.sign-icon.road-narrows,
.sign-icon.children-crossing,
.sign-icon.animals-crossing {
  background: #ffcc00;
  border: 3px solid #ff9900;
  color: #000;
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
  border-radius: 0;
}

/* 强制类标志 - 蓝色圆形 */
.sign-icon.turn-right,
.sign-icon.turn-left,
.sign-icon.ahead-only,
.sign-icon.roundabout {
  background: #4A9EFF;
  border: 3px solid #2196F3;
}

/* 信息类标志 - 绿色或蓝色方形 */
.sign-icon.information,
.sign-icon.parking,
.sign-icon.hospital,
.sign-icon.petrol-station {
  background: #00cc66;
  border: 3px solid #009944;
  border-radius: 8px;
}

/* 分类详情页面样式 */
.category-detail-container {
  flex: 1;
  overflow-y: auto;
  max-width: 400px;
  width: 100%;
  margin: 0 auto;
  padding-bottom: 20px;
}

.category-detail-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 5px 5px 20px 5px;
}

.category-completion {
  font-size: 16px;
  color: #4A9EFF;
  font-weight: 500;
}

/* 详情页面的道路标志网格 - 2列布局 */
.detail-signs-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  padding: 0 10px;
}

.detail-sign-item {
  background: white;
  border-radius: 20px;
  padding: 25px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
}

.detail-sign-item:active {
  transform: scale(0.96);
}

.detail-sign-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: white;
  font-weight: bold;
}

/* 详情页面图标样式 */
.detail-sign-icon.no-entry,
.detail-sign-icon.no-right-turn,
.detail-sign-icon.no-overtaking,
.detail-sign-icon.no-stopping,
.detail-sign-icon.no-pedestrians,
.detail-sign-icon.no-horn {
  background: #ff4444;
  border: 4px solid #cc0000;
}

.detail-sign-icon.warning-general,
.detail-sign-icon.road-narrows,
.detail-sign-icon.children-crossing,
.detail-sign-icon.animals-crossing {
  background: #ffcc00;
  border: 4px solid #ff9900;
  color: #000;
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
  border-radius: 0;
}

.detail-sign-icon.turn-right,
.detail-sign-icon.turn-left,
.detail-sign-icon.ahead-only,
.detail-sign-icon.roundabout {
  background: #4A9EFF;
  border: 4px solid #2196F3;
}

.detail-sign-icon.information,
.detail-sign-icon.parking,
.detail-sign-icon.hospital,
.detail-sign-icon.petrol-station {
  background: #00cc66;
  border: 4px solid #009944;
  border-radius: 12px;
}

.detail-sign-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  text-align: center;
  line-height: 1.3;
}

/* 进度条 */
.category-progress {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 5px;
}

.category-progress:active {
  opacity: 0.7;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4A9EFF 0%, #2196F3 100%);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.progress-percentage {
  font-size: 16px;
  font-weight: 600;
  color: #4A9EFF;
  min-width: 45px;
}

/* 操作按钮 */
.button-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 15px 20px;
  background: linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 30%, white 100%);
  z-index: 20;
}

.action-button {
  width: 100%;
  max-width: 330px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: linear-gradient(135deg, #4A9EFF 0%, #2196F3 100%);
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 6px 20px rgba(74, 158, 255, 0.35);
  transition: all 0.3s ease;
  text-align: center;
}

.action-button:active {
  transform: scale(0.98);
}

/* 模态框 */
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
  border-radius: 25px 25px 0 0;
  padding: 25px 20px 35px;
  width: 100%;
  animation: slideUp 0.3s ease;
}

.modal-header {
  text-align: center;
  margin-bottom: 25px;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.picker-container {
  padding: 15px 0;
}

.range-slider {
  width: 100%;
  margin: 20px 0;
}

.range-value {
  text-align: center;
  font-size: 42px;
  font-weight: 700;
  color: #4A9EFF;
  margin: 15px 0;
  display: block;
}

.range-labels {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #999;
  margin-top: 8px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 35px;
}

.modal-button {
  flex: 1;
  padding: 14px;
  border-radius: 20px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.modal-button.cancel {
  background: #F5F5F5;
  color: #666;
}

.modal-button.confirm {
  background: linear-gradient(135deg, #4A9EFF 0%, #2196F3 100%);
  color: white;
  box-shadow: 0 3px 12px rgba(74, 158, 255, 0.3);
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

/* 移动端优化 */
@media screen and (max-width: 375px) {
  .mode-cards-container {
    max-width: 320px;
  }
  
  .options-container,
  .road-signs-container {
    max-width: 320px;
  }
  
  .mode-card {
    padding: 25px 20px;
  }
  
  .mode-title {
    font-size: 20px;
  }
  
  .mode-icon {
    width: 50px;
    height: 50px;
    font-size: 24px;
  }

  .signs-grid {
    gap: 10px;
  }

  .sign-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }
}
</style>
