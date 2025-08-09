<template>
  <view class="login-container">
    <!-- 返回按钮 -->
    <view
      class="back-button"
      @click="handleBack"
      :style="{ paddingTop: safeAreaTop + 'rpx' }"
    >
      <u-icon name="arrow-leftward" size="24" color="#333"></u-icon>
    </view>

    <view class="content">
      <!-- 标题 -->
      <view class="title">Welcome, Sign In</view>

      <!-- 邮箱输入框 -->
      <view
        class="input-group tn-flex-direction-column"
        style="padding-top: 130rpx"
      >
        <view
          class="tn-flex tn-flex-direction-row tn-flex-col-center tn-flex-row-center"
        >
          <image
            src="/static/register/rigister_email.png"
            style="width: 42rpx; height: 32rpx"
          ></image>
          <u-input
            v-model="email"
            placeholder="Email"
            class="input"
            :border="false"
          ></u-input>
        </view>
        <u-line color="#D7D7D7"></u-line>
      </view>

      <!-- 密码输入框 -->
      <view class="input-group tn-flex-direction-column">
        <view
          class="tn-flex tn-flex-direction-row tn-flex-col-center tn-flex-row-center"
        >
          <image
            src="/static/register/rigister_pwd.png"
            style="width: 37rpx; height: 43rpx"
          ></image>
          <u-input
            v-model="password"
            placeholder="Your Password"
            class="input"
            :border="false"
            password
          ></u-input>
        </view>
        <u-line color="#D7D7D7"></u-line>
      </view>

      <!-- 登录按钮 -->
      <u-button class="signin-button" @click="loginRequest()">Sign In</u-button>

      <!-- 忘记密码 -->
      <view class="forgot-password" @click="handleForgotPassword"
        >Forgot Password?</view
      >

      <!-- 分割线 -->
      <view class="divider">
        <view class="line"></view>
        <text>Sign in with Google or Apple</text>
        <view class="line"></view>
      </view>

      <!-- 第三方登录按钮 -->
      <u-button class="social-button" @click="handleGoogleLogin">
        <image
          src="/static/register/register_google.png"
          class="social-icon"
        ></image>
        Google
      </u-button>
      <u-button class="social-button" @click="handleAppleLogin">
        <image
          src="/static/register/register_apple.png"
          class="social-icon"
        ></image>
        Apple
      </u-button>

      <!-- 注册链接 -->
      <view class="signup-link">
        Don't have an account?
        <text class="signup-text" @click="handleSignUp">Sign Up</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      email: "13999999999", // 邮箱
      password: "test123", // 密码
    };
  },
  methods: {
    // 返回
    handleBack() {
      uni.navigateBack();
    },

    loginRequest() {
      if (!this.email || !this.password) {
        uni.showToast({
          title: "Please enter email and password",
          icon: "none",
        });
        return;
      }
      const loginParams = {
        username: this.email,
        password: this.password,
      };
	  
      this.$http
        .userLogin({ username: this.email, password: this.password })
        .then((res) => {
           if (res.code === 1) {
           	// 登录成功逻辑
           	console.log('登录成功', res.data);
           	// 可以进行跳转、保存token等操作
           	uni.setStorageSync('token', res.data.token);
           	uni.showToast({
           		title: '登录成功',
           		icon: 'success'
           	});
			uni.navigateBack();
           } else {
           	// 登录失败（业务错误）
           	console.log('登录失败', res.msg);
           	uni.showToast({
           		title: res.msg || '登录失败',
           		icon: 'none'
           	});
           }
        });
    },

    // 登录
    async handleSignIn() {
      if (!this.email || !this.password) {
        uni.showToast({
          title: "Please enter email and password",
          icon: "none",
        });
        return;
      }

      try {
        // 准备登录参数
        const loginParams = {
          username: this.email,
          password: this.password,
        };

        // 调用community模块的userLogin接口
        const res = await this.$http.userLogin(loginParams);

        // 处理返回结果
        if (res.code === this.$http.STATUS_OK) {
          // 登录成功逻辑
          console.log("登录成功", res.data);
          // 可以进行跳转、保存token等操作
          uni.setStorageSync("token", res.data.token);
          uni.showToast({
            title: "登录成功",
            icon: "success",
          });
        } else {
          // 登录失败（业务错误）
          console.log("登录失败", res.msg);
          uni.showToast({
            title: res.msg || "登录失败",
            icon: "none",
          });
        }
      } catch (error) {
        // 捕获异常（网络错误等）
        console.error("登录请求异常", error);
        uni.showToast({
          title: "网络异常，请稍后再试",
          icon: "none",
        });
      }
    },

    // 忘记密码
    handleForgotPassword() {
      uni.navigateTo({
        url: "/pages/login/forgetPassword",
      });
    },
    // Google 登录
    handleGoogleLogin() {
      // 调用 Google 登录接口
      console.log("Sign in with Google");
    },
    // Apple 登录
    handleAppleLogin() {
      // 调用 Apple 登录接口
      console.log("Sign in with Apple");
    },
    // 注册
    handleSignUp() {
      uni.navigateTo({
        url: "/pages/login/register",
      });
    },
  },
};
</script>

<style scoped>
.login-container {
  padding: 40rpx 30rpx;
  background: linear-gradient(to bottom right, #e6f7ff, #fff0f0);
  min-height: 100vh;
}

.content {
  padding-left: 45rpx;
  padding-right: 94rpx;
}

.back-button {
  margin-bottom: 60rpx;
}

.title {
  font-family: Microsoft YaHei UI;
  font-weight: bold;
  font-size: 48rpx;
  color: #333333;
  padding-left: 107rpx;
}

.input-group {
  display: flex;
  border-radius: 8rpx;
}

.input {
  flex: 1;
  height: 80rpx;
}

.signin-button {
  height: 87rpx;
  background: linear-gradient(90deg, #67a6fe 0%, #4180ff 100%);
  border-radius: 43rpx;
  color: #fff;
}

.forgot-password {
  text-align: right;
  font-family: Microsoft YaHei UI;
  font-weight: 400;
  font-size: 24rpx;
  color: #999999;
  padding-top: 25rpx;
  margin-bottom: 60rpx;
}

.divider {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 40rpx 0;

  font-family: Microsoft YaHei UI;
  font-weight: 400;
  font-size: 20rpx;
  color: #999999;
}

.line {
  flex: 1;
  height: 1rpx;
  background-color: #ccc;
}

.divider text {
  padding: 0 20rpx;
  color: #999;
}

.social-button {
  margin: 20rpx 0;
  height: 80rpx;
  background-color: #fff;
  color: #333;
  border-radius: 43px;
  border: 1px solid #d7d7d7;
}

.social-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 10rpx;
}

.signup-link {
  text-align: center;
  margin-top: 105rpx;
  color: #999;

  font-family: Microsoft YaHei UI;
  font-weight: 400;
  font-size: 26rpx;
}

.signup-text {
  color: #64a4fe;
}
</style>
