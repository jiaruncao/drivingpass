<template>
  <u-popup :show="submitShow" @close="close" mode="center" round="16">
    <div class="submit_main">
      <div class="submit_title">Time Used 14:24</div>
      <div class="submit_percentage">
        <div class="percentage_main">
          <div class="percentage_sum">79 <span>%</span></div>
          <div class="percentage_title">Accuracy</div>
        </div>
      </div>
      <div class="submit_content">
        <div class="left">
          <div class="left_sum">9</div>
          <div class="left_title">Wrong Answers</div>
        </div>
        <div class="right">
          <div class="right_sum">12</div>
          <div class="right_title">Total</div>
        </div>
      </div>
      <div class="submit_btn">
        <div class="back_home" @click="backHome">Back to Home</div>
        <div class="view_details" @click="findDetails">View Details</div>
      </div>
    </div>
  </u-popup>
</template>

<script>
export default {
  data() {
    return {
      submitShow: false,
    };
  },
  methods: {
    backHome() {
      uni.reLaunch({
        url: "/pages/index/index",
      });
    },
    findDetails() {
      this.submitShow = false;
      this.$emit("findAllQuestion");
    },
    init() {
      this.submitShow = true;
    },
    close() {
      this.submitShow = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.submit_main {
  width: 608rpx;
  height: 787rpx;
  background: #ffffff;
  border-radius: 16rpx;
  .submit_btn {
    display: flex;
    padding: 0 35rpx;
    margin-top: 48rpx;
    .view_details {
      width: 45%;
      height: 81rpx;
      background: #ffffff;
      border-radius: 41rpx;
      border: 1px solid #999999;
      font-weight: 400;
      font-size: 24rpx;
      color: #333333;
      text-align: center;
      line-height: 81rpx;
      margin-left: 10%;
    }
    .back_home {
      width: 45%;
      height: 81rpx;
      background: #ffffff;
      border-radius: 41rpx;
      border: 1px solid #999999;
      font-weight: 400;
      font-size: 24rpx;
      color: #333333;
      text-align: center;
      line-height: 81rpx;
    }
  }
  .submit_content {
    width: 100%;
    display: flex;
    margin-top: 41rpx;
    .right {
      width: 50%;
      border-right: 1px solid #d7d7d7;
      text-align: center;
      .right_title {
        font-weight: 400;
        font-size: 24rpx;
        color: #999999;
      }
      .right_sum {
        font-weight: 400;
        font-size: 48rpx;
        color: #333333;
      }
    }
    .left {
      width: 50%;
      border-right: 1px solid #d7d7d7;
      text-align: center;
      .left_title {
        font-weight: 400;
        font-size: 24rpx;
        color: #999999;
      }
      .left_sum {
        font-weight: 400;
        font-size: 48rpx;
        color: #ff6666;
      }
    }
  }
  .submit_percentage {
    width: 100%;
    display: flex;
    justify-content: center;
    .percentage_main {
      width: 257rpx;
      height: 257rpx;
      background: #43a0ff;
      border-radius: 50%;
      .percentage_title {
        text-align: center;
        font-weight: 400;
        font-size: 24rpx;
        color: #ffffff;
      }
      .percentage_sum {
        padding-top: 50rpx;
        text-align: center;
        font-weight: bold;
        font-size: 72rpx;
        color: #fefefe;
        span {
          font-size: 24rpx;
        }
      }
    }
  }
  .submit_title {
    text-align: center;
    font-weight: 400;
    font-size: 28rpx;
    color: #333333;
    padding: 85rpx 0;
  }
}
</style>
