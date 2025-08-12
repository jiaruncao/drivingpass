<template>
  <view class="app">
    <view class="gradient-bg">
      <view class="gradient-top"></view>
      <view class="gradient-bottom"></view>
    </view>

    <!-- 头部导航 -->
    <view class="header">
      <view class="back-button" @tap="goBack">
        <text class="back-arrow">←</text>
      </view>
      <text class="page-title">Choose Your Plan</text>
    </view>

    <!-- 主要内容 -->
    <view class="container">
      <!-- 当前计划状态 -->
      <view class="current-plan-card">
        <view class="current-plan-badge" :class="currentPlan.toLowerCase()">
          <text class="badge-text">
            {{ currentPlan === 'Free' ? 'FREE USER' : currentPlan.toUpperCase() + ' MEMBER' }}
          </text>
        </view>
        <text class="current-plan-name">{{ getCurrentPlanText() }}</text>
        <view class="current-plan-expiry" v-if="currentPlan !== 'Free'">
          <text v-if="priceType === 'lifetime'" class="expiry-text">
            Lifetime Access • Never Expires
          </text>
          <text v-else class="expiry-text">
            {{ currentPlanExpiry ? `Expires: ${currentPlanExpiry}` : 'Monthly Subscription' }}
          </text>
        </view>
        <view class="current-plan-expiry" v-else>
          <text class="limited-text">Limited access • Upgrade for full features</text>
        </view>
      </view>

      <!-- 价格卡片 -->
      <view class="pricing-cards">
        <view class="pricing-card free" @tap="selectedPlan = 'free'">
          <text class="pricing-plan-icon">🆓</text>
          <text class="pricing-plan-name">Free</text>
          <text class="pricing-plan-price">£0</text>
          <text class="pricing-plan-period">Forever</text>
        </view>
        <view class="pricing-card silver" @tap="selectedPlan = 'silver'">
          <text class="pricing-plan-icon">🥈</text>
          <text class="pricing-plan-name">Silver</text>
          <text class="pricing-plan-price">
            {{ priceType === 'monthly' ? '£7.99' : '£14.99' }}
          </text>
          <text class="pricing-plan-period">
            {{ priceType === 'monthly' ? 'per month' : 'lifetime' }}
          </text>
        </view>
        <view class="pricing-card gold recommended" @tap="selectedPlan = 'gold'">
          <text class="popular-badge">POPULAR</text>
          <text class="pricing-plan-icon">🏆</text>
          <text class="pricing-plan-name">Gold</text>
          <text class="pricing-plan-price gold-price">
            {{ priceType === 'monthly' ? '£9.99' : '£19.99' }}
          </text>
          <text class="pricing-plan-period">
            {{ priceType === 'monthly' ? 'per month' : 'lifetime' }}
          </text>
        </view>
      </view>

      <!-- 价格类型切换 -->
      <view class="price-toggle">
        <text class="price-toggle-label" :class="{active: priceType === 'monthly'}">Monthly</text>
        <view class="toggle-switch-wrapper" :class="priceType" @tap="togglePriceType">
          <view class="toggle-switch-bg"></view>
          <view class="toggle-switch-handle"></view>
        </view>
        <view class="price-toggle-label" :class="{active: priceType === 'lifetime'}">
          <text>Lifetime</text>
          <text class="save-badge">SAVE 80%</text>
        </view>
      </view>

      <!-- 全功能对比表 -->
      <view class="comparison-section">
        <text class="section-title">Complete Features Comparison</text>
        <view class="comparison-table">
          <view class="comparison-header">
            <text class="comparison-header-cell">Features</text>
            <text class="comparison-header-cell free">Free</text>
            <text class="comparison-header-cell silver">Silver</text>
            <text class="comparison-header-cell gold">Gold</text>
          </view>

          <!-- Theory Test 组 -->
          <view class="comparison-group">
            <text class="comparison-group-title">📚 Theory Test</text>
            <view class="comparison-row">
              <text class="comparison-feature">DVSA Official Questions</text>
              <text class="comparison-value comparison-limited">3 only</text>
              <text class="comparison-value comparison-check">✓</text>
              <text class="comparison-value comparison-check">✓</text>
            </view>
            <view class="comparison-row">
              <text class="comparison-feature">Exclusive Questions</text>
              <text class="comparison-value comparison-cross">✗</text>
              <text class="comparison-value comparison-cross">✗</text>
              <text class="comparison-value comparison-check">✓</text>
            </view>
            <view class="comparison-row">
              <text class="comparison-feature">Learn Mode</text>
              <text class="comparison-value comparison-limited">Limited</text>
              <text class="comparison-value comparison-check">✓</text>
              <text class="comparison-value comparison-check">✓</text>
            </view>
            <view class="comparison-row">
              <text class="comparison-feature">Test Mode</text>
              <text class="comparison-value comparison-limited">1/day</text>
              <text class="comparison-value comparison-check">✓</text>
              <text class="comparison-value comparison-check">✓</text>
            </view>
            <view class="comparison-row">
              <text class="comparison-feature">Questions per Test</text>
              <text class="comparison-value comparison-limited">10 max</text>
              <text class="comparison-value comparison-check">✓</text>
              <text class="comparison-value comparison-check">✓</text>
            </view>
            <view class="comparison-row">
              <text class="comparison-feature">Deep Explanations</text>
              <text class="comparison-value comparison-cross">✗</text>
              <text class="comparison-value comparison-check">✓</text>
              <text class="comparison-value comparison-check">✓</text>
            </view>
          </view>

          <!-- Hazard Perception 组 -->
          <view class="comparison-group">
            <text class="comparison-group-title">🎬 Hazard Perception</text>
            <view class="comparison-row">
              <text class="comparison-feature">Official CGI Videos</text>
              <text class="comparison-value comparison-limited">2 samples</text>
              <text class="comparison-value">All videos</text>
              <text class="comparison-value">All videos</text>
            </view>
            <view class="comparison-row">
              <text class="comparison-feature">Exclusive CGI Videos</text>
              <text class="comparison-value comparison-cross">✗</text>
              <text class="comparison-value comparison-cross">✗</text>
              <text class="comparison-value comparison-check">✓</text>
            </view>
            <view class="comparison-row">
              <text class="comparison-feature">Test Mode</text>
              <text class="comparison-value comparison-limited">Limited</text>
              <text class="comparison-value comparison-check">✓</text>
              <text class="comparison-value comparison-check">✓</text>
            </view>
            <view class="comparison-row">
              <text class="comparison-feature">Scoring Analysis</text>
              <text class="comparison-value comparison-cross">✗</text>
              <text class="comparison-value comparison-check">✓</text>
              <text class="comparison-value comparison-check">✓</text>
            </view>
          </view>

          <!-- Study Materials 组 -->
          <view class="comparison-group">
            <text class="comparison-group-title">📖 Study Materials</text>
            <view class="comparison-row">
              <text class="comparison-feature">Highway Code - Learn Mode</text>
              <text class="comparison-value comparison-limited">Ch. 1 only</text>
              <text class="comparison-value">All chapters</text>
              <text class="comparison-value">All chapters</text>
            </view>
            <view class="comparison-row">
              <text class="comparison-feature">Highway Code - Test Mode</text>
              <text class="comparison-value comparison-cross">✗</text>
              <text class="comparison-value comparison-cross">✗</text>
              <text class="comparison-value comparison-check">✓</text>
            </view>
            <view class="comparison-row">
              <text class="comparison-feature">Road Signs - Learn Mode</text>
              <text class="comparison-value comparison-limited">Ch. 1 only</text>
              <text class="comparison-value">All signs</text>
              <text class="comparison-value">All signs</text>
            </view>
            <view class="comparison-row">
              <text class="comparison-feature">Road Signs - Test Mode</text>
              <text class="comparison-value comparison-cross">✗</text>
              <text class="comparison-value comparison-cross">✗</text>
              <text class="comparison-value comparison-check">✓</text>
            </view>
            <view class="comparison-row">
              <text class="comparison-feature">Offline Access</text>
              <text class="comparison-value comparison-cross">✗</text>
              <text class="comparison-value comparison-check">✓</text>
              <text class="comparison-value comparison-check">✓</text>
            </view>
          </view>

          <!-- Mock Test 组 -->
          <view class="comparison-group">
            <text class="comparison-group-title">🎯 Mock Exam</text>
            <view class="comparison-row">
              <text class="comparison-feature">Realistic Mock Tests</text>
              <text class="comparison-value comparison-cross">✗</text>
              <text class="comparison-value comparison-check">✓</text>
              <text class="comparison-value comparison-check">✓</text>
            </view>
            <view class="comparison-row">
              <text class="comparison-feature">Test History</text>
              <text class="comparison-value comparison-cross">✗</text>
              <text class="comparison-value comparison-check">✓</text>
              <text class="comparison-value comparison-check">✓</text>
            </view>
            <view class="comparison-row">
              <text class="comparison-feature">Performance Analytics</text>
              <text class="comparison-value comparison-cross">✗</text>
              <text class="comparison-value comparison-check">✓</text>
              <text class="comparison-value comparison-check">✓</text>
            </view>
            <view class="comparison-row">
              <text class="comparison-feature">Weakness Analysis</text>
              <text class="comparison-value comparison-cross">✗</text>
              <text class="comparison-value comparison-check">✓</text>
              <text class="comparison-value comparison-check">✓</text>
            </view>
          </view>

          <!-- Community 组 -->
          <view class="comparison-group">
            <text class="comparison-group-title">👥 Community & Support</text>
            <view class="comparison-row">
              <text class="comparison-feature">Browse Posts</text>
              <text class="comparison-value comparison-check">✓</text>
              <text class="comparison-value comparison-check">✓</text>
              <text class="comparison-value comparison-check">✓</text>
            </view>
            <view class="comparison-row">
              <text class="comparison-feature">Comment on Posts</text>
              <text class="comparison-value comparison-cross">✗</text>
              <text class="comparison-value comparison-check">✓</text>
              <text class="comparison-value comparison-check">✓</text>
            </view>
            <view class="comparison-row">
              <text class="comparison-feature">Create Posts</text>
              <text class="comparison-value comparison-cross">✗</text>
              <text class="comparison-value comparison-check">✓</text>
              <text class="comparison-value comparison-check">✓</text>
            </view>
            <view class="comparison-row">
              <text class="comparison-feature">Exclusive Badge</text>
              <text class="comparison-value comparison-cross">✗</text>
              <text class="comparison-value comparison-cross">✗</text>
              <text class="comparison-value comparison-check">✓</text>
            </view>
            <view class="comparison-row">
              <text class="comparison-feature">Priority Support</text>
              <text class="comparison-value comparison-cross">✗</text>
              <text class="comparison-value comparison-cross">✗</text>
              <text class="comparison-value comparison-check">✓</text>
            </view>
          </view>

          <!-- Technical 组 -->
          <view class="comparison-group">
            <text class="comparison-group-title">⚙️ Technical Features</text>
            <view class="comparison-row">
              <text class="comparison-feature">Device Support</text>
              <text class="comparison-value comparison-limited">1 device</text>
              <text class="comparison-value comparison-limited">1 device</text>
              <text class="comparison-value comparison-exclusive">3 devices</text>
            </view>
            <view class="comparison-row">
              <text class="comparison-feature">Cloud Sync</text>
              <text class="comparison-value comparison-cross">✗</text>
              <text class="comparison-value comparison-check">✓</text>
              <text class="comparison-value comparison-check">✓</text>
            </view>
            <view class="comparison-row">
              <text class="comparison-feature">No Ads</text>
              <text class="comparison-value comparison-cross">✗</text>
              <text class="comparison-value comparison-check">✓</text>
              <text class="comparison-value comparison-check">✓</text>
            </view>
            <view class="comparison-row">
              <text class="comparison-feature">Updates</text>
              <text class="comparison-value comparison-limited">Basic</text>
              <text class="comparison-value">Regular</text>
              <text class="comparison-value comparison-exclusive">Priority</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 固定底部按钮 -->
    <view class="subscribe-buttons">
      <!-- Silver用户显示升级到Gold的选项 -->
      <button 
        v-if="currentPlan === 'Silver'"
        class="subscribe-button gold primary"
        @tap="subscribeToPlan('gold')">
        Upgrade to Gold - {{ priceType === 'monthly' ? '£2/month extra' : '£5 one-time' }}
      </button>
      <!-- 其他用户显示两个选项 -->
      <template v-else>
        <button 
          v-for="plan in ['silver', 'gold']" 
          :key="plan"
          class="subscribe-button" 
          :class="[plan, {primary: selectedPlan === plan, current: currentPlan.toLowerCase() === plan}]"
          @tap="subscribeToPlan(plan)"
          :disabled="currentPlan.toLowerCase() === plan">
          {{ getButtonText(plan) }}
        </button>
      </template>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 当前用户的订阅计划
      currentPlan: 'Free',
      currentPlanExpiry: null,
      
      // 选中的计划和价格类型
      selectedPlan: 'silver',
      priceType: 'monthly', // monthly or lifetime
      
      // 计划信息
      plans: {
        free: {
          name: 'Free',
          icon: '🆓'
        },
        silver: {
          name: 'Silver',
          icon: '🥈',
          monthlyPrice: '£7.99',
          lifetimePrice: '£14.99'
        },
        gold: {
          name: 'Gold',
          icon: '🏆',
          monthlyPrice: '£9.99',
          lifetimePrice: '£19.99'
        }
      }
    }
  },
  computed: {
    // 计算到期文本
    expiryText() {
      if (this.currentPlanExpiry) {
        return `Expires: ${this.currentPlanExpiry}`;
      }
      return this.priceType === 'lifetime' ? 'Lifetime access' : '';
    }
  },
  methods: {
    // 返回上一页
    goBack() {
      console.log('Navigate back');
      // 实际应用中调用导航API
      uni.navigateBack();
    },
    
    // 获取当前计划文本
    getCurrentPlanText() {
      if (this.currentPlan === 'Free') {
        return 'Upgrade to unlock all features';
      }
      return `You're on ${this.currentPlan} Plan`;
    },
    
    // 切换价格类型
    togglePriceType() {
      this.priceType = this.priceType === 'monthly' ? 'lifetime' : 'monthly';
    },
    
    // 获取按钮文本
    getButtonText(plan) {
      if (this.currentPlan.toLowerCase() === plan) {
        return 'Current Plan';
      }
      const planName = this.plans[plan].name;
      const price = this.priceType === 'monthly' 
        ? this.plans[plan].monthlyPrice 
        : this.plans[plan].lifetimePrice;
      return `Get ${planName} - ${price}`;
    },
    
    // 订阅计划
    subscribeToPlan(plan) {
      if (this.currentPlan.toLowerCase() === plan) {
        return;
      }
      
      this.selectedPlan = plan;
      
      console.log(`Subscribing to ${plan} plan`);
      console.log(`Price type: ${this.priceType}`);
      
      // 实际应用中调用支付API
      this.initiatePayment(plan);
    },
    
    // 初始化支付
    initiatePayment(plan) {
      let price;
      
      // 如果是Silver升级到Gold，显示差价
      if (this.currentPlan === 'Silver' && plan === 'gold') {
        price = this.priceType === 'monthly' ? '£2.00' : '£5.00';
        console.log(`Processing upgrade payment: ${price}`);
      } else {
        price = this.priceType === 'monthly' 
          ? this.plans[plan].monthlyPrice 
          : this.plans[plan].lifetimePrice;
        console.log(`Processing payment: ${price}`);
      }
      
      // 显示加载提示
      uni.showLoading({
        title: 'Processing...'
      });
      
      // 模拟支付成功
      setTimeout(() => {
        uni.hideLoading();
        uni.showToast({
          title: `Welcome to ${this.plans[plan].name} Plan! 🎉`,
          icon: 'success',
          duration: 2000
        });
        
        this.currentPlan = plan.charAt(0).toUpperCase() + plan.slice(1);
        
        if (this.priceType === 'monthly') {
          // 设置到期日期（30天后）
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + 30);
          this.currentPlanExpiry = expiryDate.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          });
        } else {
          this.currentPlanExpiry = null; // 终身版
        }
      }, 1000);
    },
    
    // 获取用户当前订阅状态
    async fetchUserSubscription() {
      try {
        // 模拟API调用获取用户订阅信息
        const [error, response] = await uni.request({
          url: '/api/user/subscription',
          method: 'GET'
        });
        
        if (!error && response.statusCode === 200) {
          this.currentPlan = response.data.plan;
          this.currentPlanExpiry = response.data.expiry;
        }
        
        // 模拟数据
        // this.currentPlan = 'Free';
        // this.currentPlanExpiry = null;
      } catch (error) {
        console.error('Failed to fetch subscription:', error);
      }
    }
  },
  onLoad() {
    // 页面加载时获取用户订阅信息
    this.fetchUserSubscription();
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
  padding: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80rpx;
  height: 80rpx;
}

.back-arrow {
  color: #666;
  font-size: 40rpx;
}

.page-title {
  font-size: 48rpx;
  font-weight: 600;
  color: #333;
  flex: 1;
  text-align: center;
  margin-right: 80rpx;
}

/* 容器 */
.container {
  flex: 1;
  padding: 40rpx;
  position: relative;
  z-index: 10;
  padding-bottom: 200rpx;
}

/* 当前计划卡片 */
.current-plan-card {
  background: white;
  border-radius: 40rpx;
  padding: 40rpx;
  margin-bottom: 50rpx;
  box-shadow: 0 16rpx 50rpx rgba(0,0,0,0.08);
  text-align: center;
}

.current-plan-badge {
  display: inline-block;
  padding: 12rpx 24rpx;
  border-radius: 24rpx;
  margin-bottom: 20rpx;
}

.badge-text {
  font-size: 24rpx;
  color: #666;
}

.current-plan-badge.free {
  background: #F5F5F5;
}

.current-plan-badge.free .badge-text {
  color: #999;
}

.current-plan-badge.silver {
  background: linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%);
}

.current-plan-badge.silver .badge-text {
  color: white;
}

.current-plan-badge.gold {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
}

.current-plan-badge.gold .badge-text {
  color: white;
}

.current-plan-name {
  font-size: 44rpx;
  font-weight: 600;
  margin-bottom: 16rpx;
  display: block;
}

.current-plan-expiry {
  display: block;
}

.expiry-text {
  font-size: 28rpx;
  color: #666;
}

.limited-text {
  font-size: 28rpx;
  color: #FF6B6B;
}

/* 价格卡片组 */
.pricing-cards {
  display: flex;
  gap: 24rpx;
  margin-bottom: 50rpx;
  overflow-x: auto;
  padding-bottom: 10rpx;
}

.pricing-card {
  flex: 1;
  min-width: 200rpx;
  background: white;
  border-radius: 32rpx;
  padding: 32rpx 24rpx;
  text-align: center;
  box-shadow: 0 8rpx 30rpx rgba(0,0,0,0.06);
  position: relative;
  overflow: hidden;
}

.pricing-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6rpx;
}

.pricing-card.free::before {
  background: #E0E0E0;
}

.pricing-card.silver::before {
  background: linear-gradient(90deg, #C0C0C0 0%, #A8A8A8 100%);
}

.pricing-card.gold::before {
  background: linear-gradient(90deg, #FFD700 0%, #FFA500 100%);
}

.pricing-card.recommended {
  transform: scale(1.05);
  box-shadow: 0 16rpx 50rpx rgba(74, 158, 255, 0.2);
  animation: pulse 2s infinite;
}

.popular-badge {
  position: absolute;
  top: 16rpx;
  right: -40rpx;
  background: #FF6B6B;
  color: white;
  font-size: 18rpx;
  padding: 4rpx 40rpx;
  transform: rotate(45deg);
  font-weight: 600;
}

.pricing-plan-icon {
  font-size: 48rpx;
  margin-bottom: 16rpx;
  display: block;
}

.pricing-plan-name {
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 8rpx;
  display: block;
}

.pricing-plan-price {
  font-size: 36rpx;
  font-weight: 700;
  color: #4A9EFF;
  margin-bottom: 4rpx;
  display: block;
}

.pricing-card.free .pricing-plan-price {
  color: #999;
}

.pricing-card.silver .pricing-plan-price {
  color: #808080;
}

.pricing-plan-price.gold-price {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.pricing-plan-period {
  font-size: 20rpx;
  color: #999;
  display: block;
}

/* 价格切换 */
.price-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24rpx;
  margin-bottom: 40rpx;
  padding: 24rpx;
  background: white;
  border-radius: 32rpx;
  box-shadow: 0 8rpx 30rpx rgba(0,0,0,0.06);
}

.price-toggle-label {
  font-size: 28rpx;
  color: #666;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.price-toggle-label.active {
  color: #4A9EFF;
  font-weight: 600;
}

.toggle-switch-wrapper {
  position: relative;
  width: 112rpx;
  height: 60rpx;
}

.toggle-switch-bg {
  width: 100%;
  height: 100%;
  background: #4A9EFF;
  border-radius: 30rpx;
}

.toggle-switch-handle {
  position: absolute;
  width: 48rpx;
  height: 48rpx;
  background: white;
  border-radius: 50%;
  top: 6rpx;
  left: 6rpx;
  transition: transform 0.3s;
  box-shadow: 0 4rpx 8rpx rgba(0,0,0,0.2);
}

.toggle-switch-wrapper.lifetime .toggle-switch-handle {
  transform: translateX(52rpx);
}

.save-badge {
  display: inline-block;
  padding: 6rpx 16rpx;
  background: #4CAF50;
  color: white;
  border-radius: 16rpx;
  font-size: 20rpx;
  font-weight: 600;
  margin-left: 10rpx;
}

/* 对比表格 - 增强对比度 */
.comparison-section {
  background: white;
  border-radius: 40rpx;
  padding: 40rpx 30rpx;
  box-shadow: 0 16rpx 50rpx rgba(0,0,0,0.08);
  margin-bottom: 40rpx;
}

.section-title {
  font-size: 36rpx;
  font-weight: 600;
  margin-bottom: 40rpx;
  text-align: center;
  color: #333;
  display: block;
}

.comparison-table {
  width: 100%;
}

.comparison-header {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1fr;
  gap: 16rpx;
  padding-bottom: 30rpx;
  border-bottom: 4rpx solid #F0F0F0;
  margin-bottom: 16rpx;
  position: sticky;
  top: 0;
  background: white;
  z-index: 5;
}

.comparison-header-cell {
  font-size: 26rpx;
  font-weight: 700;
  text-align: center;
  padding: 10rpx;
}

.comparison-header-cell:first-child {
  text-align: left;
  font-weight: 600;
  color: #666;
}

/* 增强对比度的标题颜色 */
.comparison-header-cell.free {
  color: #999;
}

.comparison-header-cell.silver {
  color: #606060;
  font-weight: 800;
}

.comparison-header-cell.gold {
  color: #FF8C00;
  font-weight: 800;
}

.comparison-group {
  margin-bottom: 30rpx;
}

.comparison-group-title {
  font-size: 24rpx;
  font-weight: 600;
  color: #4A9EFF;
  text-transform: uppercase;
  letter-spacing: 1rpx;
  padding: 16rpx 0;
  margin-top: 20rpx;
  border-bottom: 2rpx solid #E8F2FF;
  display: block;
}

.comparison-row {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1fr;
  gap: 16rpx;
  padding: 20rpx 0;
  border-bottom: 2rpx solid #F8F8F8;
  align-items: center;
}

.comparison-row:last-child {
  border-bottom: none;
}

.comparison-feature {
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
  padding-right: 10rpx;
}

.comparison-value {
  text-align: center;
  font-size: 24rpx;
  color: #666;
  padding: 8rpx;
}

/* 增强对比度的值样式 */
.comparison-check {
  color: #4CAF50;
  font-size: 36rpx;
  font-weight: bold;
}

.comparison-cross {
  color: #E0E0E0;
  font-size: 36rpx;
}

.comparison-limited {
  color: #999;
  font-size: 22rpx;
  font-weight: 500;
}

.comparison-unlimited {
  color: #4CAF50;
  font-size: 22rpx;
  font-weight: 600;
}

.comparison-exclusive {
  color: #FF8C00;
  font-size: 22rpx;
  font-weight: 700;
}

/* Free列特殊样式 - 更淡的显示 */
.comparison-row > .comparison-value:nth-child(2) {
  opacity: 0.6;
}

/* Gold列特殊样式 - 更强的显示 */
.comparison-row > .comparison-value:nth-child(4) {
  font-weight: 600;
}

/* 订阅按钮组 */
.subscribe-buttons {
  display: flex;
  gap: 20rpx;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 30rpx 40rpx 50rpx;
  background: linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.9) 20%, white 100%);
  z-index: 20;
}

.subscribe-button {
  flex: 1;
  padding: 28rpx;
  background: white;
  color: #333;
  border: 4rpx solid #E0E0E0;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: 600;
  text-align: center;
}

.subscribe-button.primary {
  background: linear-gradient(135deg, #4A9EFF 0%, #2196F3 100%);
  color: white;
  border: none;
  box-shadow: 0 12rpx 40rpx rgba(74, 158, 255, 0.35);
}

.subscribe-button.silver.primary {
  background: linear-gradient(135deg, #808080 0%, #606060 100%);
  box-shadow: 0 12rpx 40rpx rgba(128, 128, 128, 0.35);
}

.subscribe-button.gold.primary {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  box-shadow: 0 12rpx 40rpx rgba(255, 215, 0, 0.35);
}

.subscribe-button.current {
  background: #F5F5F5;
  color: #999;
  border-color: #F0F0F0;
}

.subscribe-button:active:not(.current) {
  transform: scale(0.98);
}

/* 响应式设计 */
@media screen and (max-width: 375px) {
  .container {
    padding: 30rpx;
  }

  .comparison-header,
  .comparison-row {
    font-size: 22rpx;
  }

  .comparison-feature {
    font-size: 24rpx;
  }

  .pricing-card {
    min-width: 180rpx;
  }
}

/* 动画效果 */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
</style>