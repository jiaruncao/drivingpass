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
      <text class="page-title">Your Records</text>
    </view>

    <!-- 滚动内容区域 -->
    <scroll-view class="container" scroll-y>
      <!-- 学员信息卡片 -->
      <view class="trainee-card fade-in">
        <view class="trainee-info">
          <view class="trainee-details">
            <text class="trainee-label">Trainee: </text>
            <text class="trainee-name">{{ traineeInfo.name }}</text>
          </view>
          <text class="registration-date">{{ formatUKDate(traineeInfo.registrationDate) }}</text>
        </view>
        
        <view class="test-date-card">
          <view class="countdown-badge">
            <text class="countdown-text">{{ daysLeft }} days left</text>
          </view>
          <text class="test-date-number">{{ testDate.day }}/{{ testDate.month }}</text>
          <text class="test-date-label">Test Date</text>
        </view>
      </view>

      <!-- AI 洞察卡片 -->
      <view class="ai-insight-card fade-in">
        <view class="ai-header">
          <text class="ai-icon">🤖</text>
          <text class="ai-title">AI Insight: Your Pass Rate</text>
          <text class="info-icon" @tap="showAIInfo">ⓘ</text>
        </view>
        
        <view class="pass-rate-container">
          <text class="pass-rate" :class="passRateClass">{{ passRate }}</text>
          <text class="percent-symbol" :class="passRateClass">%</text>
        </view>
        
        <view class="ai-message">
           Ahead of
          <span class="highlight-text">{{ comparisonPercent }}%</span>
           of learners—pass
          <span class="highlight-text">{{ morePercent }}%</span>
           more mocks in a row to reach 90%!
        </view>
      </view>

      <!-- 统计数据卡片 -->
      <view class="stats-grid fade-in">
        <view class="stat-card">
          <text class="stat-number">{{ stats.completed }}</text>
          <text class="stat-label">Completed</text>
        </view>
        
        <view class="stat-card">
          <text class="stat-number">{{ stats.passed }}</text>
          <text class="stat-label">Passed</text>
        </view>
        
        <view class="stat-card">
          <text class="stat-number">{{ stats.avgMultipleChoice }}</text>
          <text class="stat-label">Avg Score</text>
          <text class="stat-sublabel">Multiple Choice</text>
        </view>
        
        <view class="stat-card">
          <text class="stat-number">{{ stats.avgHazardPerception }}</text>
          <text class="stat-label">Avg Score</text>
          <text class="stat-sublabel">Hazard Perception</text>
        </view>
      </view>

      <!-- 多选题成绩图表 -->
      <view class="chart-card fade-in">
        <text class="chart-title">Multiple Choice Score</text>
        <view class="chart-container">
          <canvas 
            canvas-id="multipleChoiceChart" 
            id="multipleChoiceChart"
            class="chart-canvas"
            :style="{width: chartWidth + 'px', height: '200px'}">
          </canvas>
        </view>
      </view>

      <!-- 危险感知成绩图表 -->
      <view class="chart-card fade-in">
        <text class="chart-title">Hazard Perception Score</text>
        <view class="chart-container">
          <canvas 
            canvas-id="hazardPerceptionChart" 
            id="hazardPerceptionChart"
            class="chart-canvas"
            :style="{width: chartWidth + 'px', height: '200px'}">
          </canvas>
        </view>
      </view>
    </scroll-view>

    <!-- AI信息模态框 -->
    <view v-if="showModal" class="modal-overlay" @tap="closeModal">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-icon">🤖</text>
          <view>
            <text class="modal-title">AI Insight</text>
          </view>
        </view>
        <text class="modal-body">Our AI-driven model leverages the database of past test results to analyse and predict a data-backed pass rate, so you know exactly where you stand.</text>
        <view class="modal-close" @tap="closeModal">
          <text class="modal-close-text">Got it</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
// 引入图表库（如使用u-charts）
// import uCharts from '@/components/u-charts/u-charts.js';

export default {
  data() {
    return {
      // 学员信息
      traineeInfo: {
        name: 'StormChaser',
        registrationDate: '2025-06-18'
      },
      // 考试日期
      testDate: {
        month: '06',
        day: '28'
      },
      daysLeft: 10,
      // AI洞察数据
      passRate: 79,
      comparisonPercent: 'XX',
      morePercent: 'XX',
      // 统计数据
      stats: {
        completed: 17,
        passed: 9,
        avgMultipleChoice: 71,
        avgHazardPerception: 82
      },
      // 模态框显示状态
      showModal: false,
      // 图表宽度
      chartWidth: 350,
      // 图表上下文
      multipleChoiceCtx: null,
      hazardPerceptionCtx: null
    }
  },
  computed: {
    // 根据pass rate计算颜色类
    passRateClass() {
      const rate = this.passRate;
      if (rate >= 90) return 'excellent';  // 绿色
      if (rate >= 75) return 'good';       // 浅绿色
      if (rate >= 60) return 'average';    // 黄色
      if (rate >= 50) return 'poor';       // 橙色
      return 'failing';                     // 红色
    }
  },
  onLoad() {
    // 页面加载时初始化
    this.getSystemInfo();
    // #ifdef APP-PLUS
    plus.screen.lockOrientation('portrait-primary');
    // #endif
  },
  onReady() {
    // 页面渲染完成后初始化图表
    this.$nextTick(() => {
      this.initCharts();
    });
  },
  methods: {
    // 获取系统信息，设置图表宽度
    getSystemInfo() {
      const systemInfo = uni.getSystemInfoSync();
      // 计算图表宽度（屏幕宽度减去padding）
      this.chartWidth = systemInfo.windowWidth - 80;
    },
    
    // 格式化为英国日期格式
    formatUKDate(dateString) {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack({
        delta: 1,
        fail: () => {
          // 如果没有上级页面，返回首页
          uni.switchTab({
            url: '/pages/index/index'
          });
        }
      });
    },
    
    // 显示AI信息模态框
    showAIInfo() {
      this.showModal = true;
    },
    
    // 关闭模态框
    closeModal() {
      this.showModal = false;
    },
    
    // 初始化图表
    initCharts() {
      // 初始化多选题图表
      this.drawLineChart('multipleChoiceChart', {
        labels: ['09/05', '10/05', '11/05', '12/05', '13/05', '14/05', '15/05', '16/05', '17/05', '18/05'],
        data: [15, 85, 30, 15, 20, 8, 15, 50, 8, 45]
      });
      
      // 初始化危险感知图表
      this.drawLineChart('hazardPerceptionChart', {
        labels: ['09/05', '10/05', '11/05', '12/05', '13/05', '14/05', '15/05', '16/05', '17/05', '18/05'],
        data: [20, 95, 30, 20, 25, 10, 40, 48, 8, 50]
      });
    },
    
    // 绘制折线图（简化版本，实际项目中应使用u-charts或其他图表库）
    drawLineChart(canvasId, chartData) {
      const ctx = uni.createCanvasContext(canvasId, this);
      const width = this.chartWidth;
      const height = 200;
      const padding = 30;
      const graphWidth = width - padding * 2;
      const graphHeight = height - padding * 2;
      
      // 清除画布
      ctx.clearRect(0, 0, width, height);
      
      // 设置样式
      ctx.setStrokeStyle('#E0E0E0');
      ctx.setLineWidth(1);
      
      // 绘制网格线
      for (let i = 0; i <= 5; i++) {
        const y = padding + (graphHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
      }
      
      // 绘制数据线
      ctx.setStrokeStyle('#4A9EFF');
      ctx.setLineWidth(2);
      ctx.setFillStyle('rgba(74, 158, 255, 0.1)');
      
      const maxValue = 100;
      const minValue = 0;
      const range = maxValue - minValue;
      const xStep = graphWidth / (chartData.data.length - 1);
      
      // 开始绘制路径
      ctx.beginPath();
      
      // 绘制数据点和连线
      chartData.data.forEach((value, index) => {
        const x = padding + xStep * index;
        const y = padding + graphHeight - ((value - minValue) / range) * graphHeight;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      // 绘制线条
      ctx.stroke();
      
      // 绘制填充区域
      ctx.lineTo(width - padding, height - padding);
      ctx.lineTo(padding, height - padding);
      ctx.closePath();
      ctx.fill();
      
      // 绘制数据点
      ctx.setFillStyle('#4A9EFF');
      chartData.data.forEach((value, index) => {
        const x = padding + xStep * index;
        const y = padding + graphHeight - ((value - minValue) / range) * graphHeight;
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
        
        // 绘制白色边框
        ctx.setStrokeStyle('#FFFFFF');
        ctx.setLineWidth(2);
        ctx.stroke();
        ctx.setStrokeStyle('#4A9EFF');
      });
      
      // 绘制x轴标签
      ctx.setFillStyle('#999');
      ctx.setFontSize(11);
      ctx.setTextAlign('center');
      
      // 只显示部分标签避免拥挤
      const labelStep = Math.ceil(chartData.labels.length / 5);
      chartData.labels.forEach((label, index) => {
        if (index % labelStep === 0 || index === chartData.labels.length - 1) {
          const x = padding + xStep * index;
          ctx.fillText(label, x, height - 10);
        }
      });
      
      // 绘制y轴标签
      ctx.setTextAlign('right');
      for (let i = 0; i <= 5; i++) {
        const value = (100 / 5) * (5 - i);
        const y = padding + (graphHeight / 5) * i + 4;
        ctx.fillText(value.toString(), padding - 5, y);
      }
      
      // 执行绘制
      ctx.draw();
    },
    
    // 获取用户数据 - API调用示例
    async fetchUserData() {
      try {
        const response = await uni.request({
          url: '/api/user/records',
          method: 'GET'
        });
        
        if (response[1].statusCode === 200) {
          const data = response[1].data;
          this.traineeInfo = data.traineeInfo;
          this.testDate = data.testDate;
          this.daysLeft = data.daysLeft;
          this.passRate = data.passRate;
          this.stats = data.stats;
          
          // 重新绘制图表
          this.$nextTick(() => {
            this.initCharts();
          });
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        uni.showToast({
          title: 'Failed to load data',
          icon: 'none'
        });
      }
    }
  }
}
</script>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
/* 全局样式 */
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
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
  height: 300px;
  z-index: 0;
}

.gradient-top {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 60%;
  background: linear-gradient(180deg, #E3F2FD 0%, #FFFFFF 100%);
}

.gradient-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40%;
  background: linear-gradient(180deg, #FFFFFF 0%, #F8F9FA 100%);
}

/* 头部导航 */
.header {
  padding: 15px 20px;
  display: flex;
  align-items: center;
  position: relative;
  z-index: 10;
  background: transparent;
}

.back-button {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #666;
}

.page-title {
  flex: 1;
  text-align: center;
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-right: 40px;
}

/* 滚动容器 */
.container {
  flex: 1;
  padding: 0 20px 20px;
  position: relative;
  z-index: 5;
  box-sizing: border-box;
}

/* 学员信息卡片 */
.trainee-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
}

.trainee-info {
  flex: 1;
}

.trainee-details {
  display: flex;
  align-items: baseline;
  margin-bottom: 8px;
}

.trainee-label {
  font-size: 16px;
  color: #666;
}

.trainee-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.registration-date {
  font-size: 14px;
  color: #999;
}

.test-date-card {
  background: linear-gradient(135deg, #4A9EFF 0%, #2196F3 100%);
  border-radius: 16px;
  padding: 15px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  min-width: 100px;
  box-sizing: border-box;
}

.countdown-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #FF6B6B;
  border-radius: 12px;
  padding: 4px 10px;
}

.countdown-text {
  color: white;
  font-size: 11px;
  font-weight: 600;
}

.test-date-number {
  color: white;
  font-size: 32px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 4px;
}

.test-date-label {
  color: rgba(255, 255, 255, 0.9);
  font-size: 12px;
}

/* AI洞察卡片 */
.ai-insight-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
}

.ai-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.ai-icon {
  font-size: 20px;
  margin-right: 8px;
}

.ai-title {
  flex: 1;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.info-icon {
  font-size: 16px;
  color: #999;
}

.pass-rate-container {
  display: flex;
  align-items: baseline;
  margin-bottom: 15px;
}

.pass-rate {
  font-size: 48px;
  font-weight: 700;
}

/* Pass rate颜色根据分数动态改变 */
.pass-rate.excellent {
  color: #4CAF50;
}

.pass-rate.good {
  color: #8BC34A;
}

.pass-rate.average {
  color: #FFC107;
}

.pass-rate.poor {
  color: #FF9800;
}

.pass-rate.failing {
  color: #FF6B6B;
}

.percent-symbol {
  font-size: 28px;
  font-weight: 600;
  margin-left: 2px;
}

.percent-symbol.excellent {
  color: #4CAF50;
}

.percent-symbol.good {
  color: #8BC34A;
}

.percent-symbol.average {
  color: #FFC107;
}

.percent-symbol.poor {
  color: #FF9800;
}

.percent-symbol.failing {
  color: #FF6B6B;
}

.ai-message {
  font-size: 15px;
  color: #666;
  line-height: 1.5;
  // display: flex;
  // flex-wrap: wrap;
}

.highlight-text {
  font-weight: 600;
  color: #FF6B6B;
  padding: 0 10rpx;
  box-sizing: border-box;
}

/* 统计数据网格 */
.stats-grid {
  display: flex;
  flex-wrap: wrap;
  // gap: 15px;
  // margin-bottom: 20px;
}

.stat-card {
  flex: 1;
  min-width: calc(50% - 8px);
  background: white;
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  margin-right: 16px;
  margin-bottom: 30rpx;
}
/* 清除最后一列的右侧 margin */
.stat-card:nth-child(2n) {
  margin-right: 0;
}
.stat-number {
  display: block;
  font-size: 32px;
  font-weight: 700;
  color: #333;
  margin-bottom: 4px;
}

.stat-label {
  display: block;
  font-size: 13px;
  color: #666;
  margin-bottom: 2px;
}

.stat-sublabel {
  display: block;
  font-size: 11px;
  color: #999;
}

/* 图表卡片 */
.chart-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  box-sizing: border-box;
}

.chart-title {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
}

.chart-container {
  position: relative;
  height: 200px;
  margin-bottom: 10px;
}

.chart-canvas {
  width: 100%;
  height: 200px;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 20px;
  padding: 25px;
  max-width: 380px;
  width: 90%;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  animation: modalSlideIn 0.3s ease;
}

.modal-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
}

.modal-icon {
  font-size: 24px;
  margin-right: 12px;
  margin-top: 2px;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.modal-body {
  font-size: 15px;
  color: #666;
  line-height: 1.6;
}

.modal-close {
  margin-top: 25px;
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #4A9EFF 0%, #2196F3 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close-text {
  color: white;
  font-size: 16px;
  font-weight: 600;
}

/* 响应式优化 */
@media screen and (max-width: 375px) {
  .trainee-card {
    flex-direction: column;
    align-items: stretch;
  }
  
  .test-date-card {
    margin-top: 15px;
    align-self: center;
  }
  
  .pass-rate {
    font-size: 42px;
  }
  
  .stat-number {
    font-size: 28px;
  }
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.fade-in {
  animation: fadeIn 0.6s ease;
}
</style>