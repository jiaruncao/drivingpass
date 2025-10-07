<template>
  <view class="app">
    <view class="gradient-bg">
      <view class="gradient-top"></view>
      <view class="gradient-bottom"></view>
    </view>

    <!-- 主要内容 -->
    <view class="container">
      <!-- 用户信息卡片 -->
      <view class="profile-card">
        <view class="edit-profile-btn" @tap="editProfile">
          <text class="edit-icon">✏️</text>
        </view>
        <view class="profile-content">
          <view class="avatar-container">
            <view class="avatar" v-if="userData.avatar">
              <image class="image" :src="userData.avatar" mode="aspectFill"></image>
            </view>
            <view class="avatar" v-else>
              <text class="avatar-text">{{ userInitial }}</text>
            </view>
          </view>
          <text class="username">{{ userData.nickname }}</text>
          <view v-if="userData.testCentre" class="test-centre">
            <text class="location-icon">📍</text>
            <text class="test-centre-text">{{ userData.testCentre }}</text>
          </view>
          <text v-if="userData.examDate" class="next-attempt">Test Date: {{ userData.examDate }}</text>
          <text class="bio">{{ userData.bio }}</text>
          <view class="stats-row">
            <view class="stat-item">
              <text class="stat-value">{{ userData.following || 0 }}</text>
              <text class="stat-label">Following</text>
            </view>
            <view class="stat-item">
              <text class="stat-value">{{ userData.followers || 0 }}</text>
              <text class="stat-label">Followers</text>
            </view>
            <view class="stat-item">
              <text class="stat-value">{{ userData.likes || 0 }}</text>
              <text class="stat-label">Likes</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 订阅卡片 -->
      <view class="subscription-card"  @click="toFeature">
        <view class="subscription-header">
          <text class="subscription-title">Subscription</text>
          <!-- <view class="subscription-badge" :class="getBadgeClass">
            <text class="badge-text">{{ replace(subscriptionData.type) }}</text>
          </view> -->
          <view>
            Change plan
          </view>
        </view>
        <view class="expires-text" v-if="replace(subscriptionData.type) !== 'free'">
          Current plan: 
          <view style="margin-left: 16rpx;" class="subscription-badge" :class="getBadgeClass">
            <text class="badge-text">{{ replace(subscriptionData.type) }}</text>
          </view>
        </view>
        
        <view class="features-grid">
          <!-- Silver Features - 第一行 -->
          <view class="feature-item" 
                :class="getFeatureClass('silver', 'official_questions')"
                @tap.stop="handleFeatureClick('official_questions')">
            <view class="feature-icon-wrapper">
              <view class="feature-icon">
                <text class="icon-text">📝</text>
              </view>
            </view>
            <text class="feature-label">DVSA Official Questions</text>
          </view>
          
          <view class="feature-item" 
                :class="getFeatureClass('silver', 'official_hazard')"
                @tap.stop="handleFeatureClick('official_hazard')">
            <view class="feature-icon-wrapper">
              <view class="feature-icon">
                <text class="icon-text">🎬</text>
              </view>
            </view>
            <text class="feature-label">Official Hazard Videos</text>
          </view>
          
          <view class="feature-item" 
                :class="getFeatureClass('silver', 'mock_tests')"
                @tap.stop="handleFeatureClick('mock_tests')">
            <view class="feature-icon-wrapper">
              <view class="feature-icon">
                <text class="icon-text">📊</text>
              </view>
            </view>
            <text class="feature-label">Realistic Mock Tests</text>
          </view>
          
          <view class="feature-item" 
                :class="getFeatureClass('silver', 'study_material')"
                @tap.stop="handleFeatureClick('study_material')">
            <view class="feature-icon-wrapper">
              <view class="feature-icon">
                <text class="icon-text">📚</text>
              </view>
            </view>
            <text class="feature-label">Highway Code + Road Signs</text>
          </view>

          <!-- 分隔线 -->
          <view class="subscription-divider"></view>

          <!-- Gold Features - 第二行 -->
          <view class="feature-item" 
                :class="getFeatureClass('gold', 'exclusive_questions')"
                @tap.stop="handleFeatureClick('exclusive_questions')">
            <view class="feature-icon-wrapper">
              <view class="feature-icon">
                <text class="icon-text">⭐</text>
              </view>
            </view>
            <text class="feature-label">Exclusive Question Banks</text>
          </view>
          
          <view class="feature-item" 
                :class="getFeatureClass('gold', 'exclusive_hazard')"
                @tap.stop="handleFeatureClick('exclusive_hazard')">
            <view class="feature-icon-wrapper">
              <view class="feature-icon">
                <text class="icon-text">🎯</text>
              </view>
            </view>
            <text class="feature-label">Exclusive Hazard Videos</text>
          </view>
          
          <view class="feature-item" 
                :class="getFeatureClass('gold', 'exclusive_study')"
                @tap.stop="handleFeatureClick('exclusive_study')">
            <view class="feature-icon-wrapper">
              <view class="feature-icon">
                <text class="icon-text">🛣️</text>
              </view>
            </view>
            <text class="feature-label">Exclusive Study Material</text>
          </view>
          
          <view class="feature-item" 
                :class="getFeatureClass('gold', 'priority_support')"
                @tap.stop="handleFeatureClick('priority_support')">
            <view class="feature-icon-wrapper">
              <view class="feature-icon">
                <text class="icon-text">💎</text>
              </view>
            </view>
            <text class="feature-label">Priority Support</text>
          </view>
        </view>
      </view>

      <!-- 测试进度卡片 -->
      <view class="progress-card">
        <view class="progress-header">
          <text class="progress-title">Test Progress</text>
          <view class="view-details-btn" @tap="viewDetails">
            <text class="btn-text">View Details›</text>
          </view>
        </view>
        <view class="question-bank-selector">
          <text class="bank-label">Question Bank:</text>
          <view class="bank-type" @tap="switchQuestionBank">
            <text class="bank-type-text">{{ currentQuestionBank }}</text>
            <text class="arrow">›</text>
          </view>
        </view>
        <view class="pass-rate">
          <text class="pass-rate-label">Current pass rate: </text>
          <view class="pass-rate-value" style="margin-left: 16rpx;">{{ passRate }}%</view>
        </view>
      </view>

      <!-- 菜单列表 -->
      <view class="menu-list">
        <view class="menu-item" @tap="navigateTo('saved')">
          <view class="menu-icon star">
            <text class="menu-icon-text">⭐</text>
          </view>
          <text class="menu-text">Saved Items</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @tap="rateApp">
          <view class="menu-icon rate">
            <text class="menu-icon-text">💙</text>
          </view>
          <text class="menu-text">Rate the App</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @tap="shareApp">
          <view class="menu-icon share">
            <text class="menu-icon-text">🔗</text>
          </view>
          <text class="menu-text">Share App</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @tap="contactUs">
          <view class="menu-icon contact">
            <text class="menu-icon-text">📧</text>
          </view>
          <text class="menu-text">Contact Us</text>
          <text class="menu-arrow">›</text>
        </view>
      </view>

      <!-- 政策链接列表 -->
      <view class="menu-list">
        <view class="menu-item" @tap="navigateTo('privacy')">
          <view class="menu-icon">
            <text class="menu-icon-text">🔒</text>
          </view>
          <text class="menu-text">Privacy Policy</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @tap="navigateTo('terms')">
          <view class="menu-icon">
            <text class="menu-icon-text">📄</text>
          </view>
          <text class="menu-text">Terms of Use</text>
          <text class="menu-arrow">›</text>
        </view>
      </view>
    </view>
    
    <!-- 升级弹框 -->
    <u-modal title="Feature Locked" :show="showFeature" :showCancelButton="true" cancelText="Cancel" confirmText="Upgrade" :content='content' @confirm="confirmFeature" @cancel="cancelFeature"></u-modal>
  </view>
</template>

<script>
import {getUserInfo, queryMemberInfo} from '@/http/api/login.js'
import {getTestStatistics} from '@/http/api/testQuestions.js'
export default {
  data() {
    return {
      // 用户数据
      userData: {},
      // 订阅数据
      subscriptionData: {
        // 可选: 'free', 'silver', 'gold'
      },
      // 测试进度数据
      // ['Car', 'Motorcycle', 'ADI', 'LGV', 'PCV']
      currentQuestionBank: 'Car',
      passRate: 70,
      showFeature: false,
      content: ''
    }
  },
  computed: {
    // 获取用户名首字母
    userInitial() {
      return this.userData.nickname ? this.userData.nickname.charAt(0).toUpperCase() : null;
    },
    // 获取订阅徽章样式
    getBadgeClass() {
      return `badge-${this.replace(this.subscriptionData.type)}`;
    }
  },
  methods: {
    // 获取功能项的样式类
    getFeatureClass(requiredLevel, featureName) {
      const levels = ['free', 'silver', 'gold'];
      const userLevel = levels.indexOf(this.subscriptionData.type);
      const requiredLevelIndex = levels.indexOf(requiredLevel);
      
      if (userLevel >= requiredLevelIndex) {
        return `unlocked ${requiredLevel}`;
      }
      return 'locked';
    },
    // 处理功能点击
    handleFeatureClick(feature) {
      const silverFeatures = ['official_questions', 'official_hazard', 'mock_tests', 'study_material'];
      const goldFeatures = ['exclusive_questions', 'exclusive_hazard', 'exclusive_study', 'priority_support'];
      
      const levels = ['free', 'silver', 'gold'];
      const userLevel = levels.indexOf(this.subscriptionData.type);
      
      let requiredLevel = 0; // free
      if (silverFeatures.includes(feature)) {
        requiredLevel = 1; // silver
      } else if (goldFeatures.includes(feature)) {
        requiredLevel = 2; // gold
      }
      
      if (userLevel >= requiredLevel) {
        console.log(`Accessing feature: ${feature}`);
        // 导航到相应功能
        uni.showToast({
          title: `Opening ${feature.replace(/_/g, ' ')}`,
          icon: 'none'
        });
      } else {
        console.log(`Feature locked. Upgrade to ${levels[requiredLevel]} to unlock.`);
        // 显示升级提示
        this.showFeature = true
        this.content = `Upgrade to ${levels[requiredLevel].toUpperCase()} to unlock this feature`
        // uni.showModal({
        //   title: 'Feature Locked',
        //   content: `Upgrade to ${levels[requiredLevel].toUpperCase()} to unlock this feature`,
        //   confirmText: 'Upgrade',
        //   cancelText: 'Cancel',
        //   success: (res) => {
        //     if (res.confirm) {
        //       uni.navigateTo({
        //         url: '/pages/my/subscription',
        //       })
        //     }
        //   }
        // });
      }
    },
    confirmFeature () {
      this.showFeature = false
      uni.navigateTo({
        url: '/pages/my/subscription',
      })
    },
    cancelFeature () {
      this.showFeature = false
    },
    toFeature () {
      uni.navigateTo({
        url: '/pages/my/subscription',
      })
    },
    // 编辑个人资料
    editProfile() {
      console.log('Edit profile clicked');
      // 实际应用中导航到编辑页面
      uni.navigateTo({
        url: '/pages/my/editProfile'
      });
    },
    // 查看详情
    viewDetails() {
      console.log('View details clicked');
      // 实际应用中导航到详情页面
      uni.navigateTo({
        url: '/pages/mockTest/record'
      });
    },
    // 切换题库
    switchQuestionBank() {
      console.log('Switch question bank clicked');
      // 实际应用中显示题库选择器
      const banks = ['Car', 'Motorcycle', 'ADI', 'LGV', 'PCV'];
      const currentIndex = banks.indexOf(this.currentQuestionBank);
      this.currentQuestionBank = banks[(currentIndex + 1) % banks.length];
    },
    // 评价应用
    rateApp() {
      console.log('Rate app clicked');
      // 实际应用中打开应用商店评价页面
      uni.showToast({
        title: 'Opening App Store',
        icon: 'none'
      });
    },
    // 分享应用
    shareApp() {
      console.log('Share app clicked');
      // 实际应用中调用系统分享功能
      uni.share({
        provider: 'weixin',
        type: 0,
        title: 'UK Driving Theory Test',
        summary: 'Best app for UK driving theory test preparation!'
      });
    },
    // 联系我们
    contactUs() {
      console.log('Contact us clicked');
      // 实际应用中打开联系页面或邮件客户端
      uni.navigateTo({
        url: '/pages/my/contact'
      });
    },
    // 导航到其他页面
    navigateTo(page) {
      console.log(`Navigate to ${page}`);
      // 实际应用中进行页面导航
      const pages = {
        'home': '/pages/index/index',
        'forum': '/pages/forum/index',
        'saved': '/pages/my/mySaved',
        'privacy': '/pages/my/privacy',
        'terms': '/pages/my/terms'
      };
      
      if (pages[page]) {
        if (page === 'home') {
          uni.switchTab({
            url: pages[page]
          });
        } else {
          uni.navigateTo({
            url: pages[page]
          });
        }
      }
    },
    // 获取用户数据
    async fetchUserData() {
      const response = await getUserInfo()
      if (response.code == 1) {
        this.userData = response.data
        // this.subscriptionData = response.data.info
      }
    },
    // 查询会员信息
    queryMemberInfo () {
      queryMemberInfo().then(res => {
        console.log(res)
        if (res.code == 1) {
          this.subscriptionData = res.data
        }
      })
    },
    // 替换
    replace (type) {
      switch (type){
        case 'NORMAL':
          return 'free'
          break;
        default:
          return type
          break;
      }
    },
    getTestStatistics () {
      getTestStatistics().then(res => {
        console.log(res)
      })
    }
  },
  onLoad() {
    // 页面加载时获取数据
    // this.fetchUserData();
    // this.queryMemberInfo()
    // this.updateStats();
    
    // 测试不同订阅等级的效果
    // this.subscriptionData.type = 'free';    // 免费用户
    // this.subscriptionData.type = 'silver';  // 银牌会员
    // this.subscriptionData.type = 'gold';    // 金牌会员
  },
  onShow () {
    this.fetchUserData();
    this.queryMemberInfo()
    this.getTestStatistics()
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
  padding-bottom: 140rpx; /* 为底部导航预留空间 */
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
  color: #333;
  background: #F8F9FA;
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

/* 容器 */
.container {
  flex: 1;
  padding: 60rpx 40rpx 40rpx;
  position: relative;
  z-index: 10;
}

/* 用户信息卡片 */
.profile-card {
  background: white;
  border-radius: 40rpx;
  padding: 50rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 16rpx 50rpx rgba(0,0,0,0.08);
  position: relative;
}

.edit-profile-btn {
  position: absolute;
  top: 40rpx;
  right: 40rpx;
  width: 64rpx;
  height: 64rpx;
  background: #F8F9FA;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-profile-btn:active {
  background: #E0E0E0;
  transform: scale(0.95);
}

.edit-icon {
  font-size: 32rpx;
}

.profile-content {
  text-align: center;
}

.avatar-container {
  position: relative;
  width: 200rpx;
  height: 200rpx;
  margin: 0 auto 30rpx;
}

.avatar {
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.avatar .image {
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
}

.avatar-text {
  font-size: 80rpx;
  color: white;
  font-weight: 600;
}

.username {
  font-size: 44rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
  display: block;
}

.test-centre {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  margin-bottom: 10rpx;
}

.location-icon {
  font-size: 28rpx;
}

.test-centre-text {
  font-size: 28rpx;
  color: #666;
}

.next-attempt {
  font-size: 26rpx;
  color: #FF6B6B;
  margin-bottom: 24rpx;
  display: block;
}

.bio {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 40rpx;
  line-height: 1.4;
  display: block;
}

.stats-row {
  display: flex;
  justify-content: space-around;
  padding-top: 40rpx;
  border-top: 1rpx solid #F0F0F0;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 48rpx;
  font-weight: 700;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 26rpx;
  color: #999;
  display: block;
}

/* 订阅卡片 - 增加轻微对比度 */
.subscription-card {
  background: linear-gradient(135deg, #FAFBFC 0%, #F5F7FA 100%);
  border-radius: 40rpx;
  padding: 50rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 16rpx 50rpx rgba(0,0,0,0.1);
  border: 2rpx solid rgba(74, 158, 255, 0.08);
}

.subscription-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40rpx;
}

.subscription-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.subscription-badge {
  padding: 12rpx 28rpx;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge-text {
  font-size: 26rpx;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1rpx;
  color: white;
}

.badge-free {
  background: #F5F5F5;
}

.badge-free .badge-text {
  color: #666;
}

.badge-silver {
  background: linear-gradient(135deg, #C0C0C0 0%, #999999 100%);
}

.badge-gold {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
}

.expires-text {
  font-size: 26rpx;
  color: #999;
  margin-bottom: 40rpx;
  display: flex;
  align-items: center;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30rpx;
}

.feature-item {
  text-align: center;
}

.feature-item:active {
  transform: scale(0.95);
}

.feature-icon-wrapper {
  width: 120rpx;
  height: 120rpx;
  margin: 0 auto 16rpx;
  position: relative;
}

.feature-icon {
  width: 100%;
  height: 100%;
  background: #F8F9FA;
  border-radius: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4rpx solid transparent;
  position: relative;
}

.icon-text {
  font-size: 48rpx;
}

/* 不同订阅等级的图标样式 */
.feature-item.unlocked.silver .feature-icon {
  background: linear-gradient(135deg, #F5F5F5 0%, #E8E8E8 100%);
  border-color: #C0C0C0;
}

.feature-item.unlocked.gold .feature-icon {
  background: linear-gradient(135deg, #FFF9E6 0%, #FFF3CD 100%);
  border-color: #FFD700;
}

.feature-item.locked .feature-icon {
  background: #F5F5F5;
  position: relative;
  overflow: hidden;
}

.feature-item.locked .icon-text {
  opacity: 0.5;
}

.feature-item.locked .feature-icon::after {
  content: '🔒';
  position: absolute;
  bottom: 4rpx;
  right: 4rpx;
  width: 32rpx;
  height: 32rpx;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
}

.feature-label {
  font-size: 20rpx;
  line-height: 1.2;
  color: #666;
  display: block;
}

.feature-item.unlocked .feature-label {
  color: #333;
  font-weight: 500;
}

.subscription-divider {
  grid-column: 1 / -1;
  height: 2rpx;
  background: #E0E0E0;
  margin: 10rpx 0;
}

/* 测试进度卡片 */
.progress-card {
  background: white;
  border-radius: 40rpx;
  padding: 40rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 10rpx 36rpx rgba(0,0,0,0.06);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.progress-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.view-details-btn {
  padding: 12rpx 28rpx;
  background: transparent;
  border: 2rpx solid #4A9EFF;
  border-radius: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.view-details-btn:active {
  background: #F8FBFF;
}

.btn-text {
  font-size: 26rpx;
  color: #4A9EFF;
}

.question-bank-selector {
  display: flex;
  align-items: center;
  // gap: 16rpx;
  margin-bottom: 24rpx;
}

.bank-label {
  font-size: 30rpx;
  color: #666;
}

.bank-type {
  display: flex;
  align-items: center;
  // gap: 8rpx;
  margin-left: 16rpx;
}

.bank-type-text {
  color: #4A9EFF;
  font-weight: 600;
  font-size: 30rpx;
}

.arrow {
  color: #999;
  font-size: 30rpx;
  margin-left: 8rpx;
}

.pass-rate {
  display: flex;
  align-items: baseline;
}

.pass-rate-label {
  font-size: 30rpx;
  color: #666;
}

.pass-rate-value {
  font-weight: 700;
  color: #4CAF50;
  font-size: 36rpx;
}

/* 菜单列表 */
.menu-list {
  background: white;
  border-radius: 40rpx;
  overflow: hidden;
  box-shadow: 0 10rpx 36rpx rgba(0,0,0,0.06);
  margin-bottom: 40rpx;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 36rpx 40rpx;
  border-bottom: 2rpx solid #F5F5F5;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:active {
  background: #F8F9FA;
}

.menu-icon {
  width: 80rpx;
  height: 80rpx;
  background: #F8F9FA;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 30rpx;
}

.menu-icon-text {
  font-size: 40rpx;
}

.menu-icon.star { background: #FFF8E1; }
.menu-icon.rate { background: #E3F2FD; }
.menu-icon.share { background: #F3E5F5; }
.menu-icon.contact { background: #E8F5E9; }

.menu-text {
  flex: 1;
  font-size: 32rpx;
  color: #333;
  font-weight: 500;
}

.menu-arrow {
  color: #C0C0C0;
  font-size: 36rpx;
}

/* 底部导航 */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 140rpx;
  background: white;
  box-shadow: 0 -4rpx 20rpx rgba(0,0,0,0.05);
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 20;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16rpx;
}

.nav-item:active {
  transform: scale(0.95);
}

.nav-icon {
  margin-bottom: 8rpx;
}

.nav-icon-text {
  font-size: 48rpx;
  color: #999;
}

.nav-icon-text.active {
  color: #4A9EFF;
}

.nav-label {
  font-size: 24rpx;
  color: #999;
}

.nav-item.active .nav-label {
  color: #4A9EFF;
}

/* 响应式优化 */
@media screen and (max-width: 375px) {
  .container {
    padding: 40rpx 30rpx;
  }

  .features-grid {
    gap: 20rpx;
  }

  .feature-icon-wrapper {
    width: 100rpx;
    height: 100rpx;
  }

  .icon-text {
    font-size: 40rpx;
  }

  .feature-label {
    font-size: 18rpx;
  }
}
</style>