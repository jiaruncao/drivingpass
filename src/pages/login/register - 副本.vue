<template>
	<view class="login-container">
		<!-- 返回按钮 -->
		<view class="tn-flex tn-flex-direction-row tn-flex-col-center tn-flex-row-center" style="margin-bottom: 48rpx;"
			:style="{ paddingTop: safeAreaTop + 'rpx' }">
			<view @click="handleBack">
				<u-icon name="arrow-leftward" size="24" color="#333"></u-icon>
			</view>
			<view class="tn-flex tn-flex-direction-row tn-flex-col-center tn-flex-row-center" style="width: 100%;">
				<view class="step-active tn-flex tn-flex-col-center tn-flex-row-center">
					<view class="step-active-small"></view>
				</view>
				<u-line color="#DDDDDD" style="width: 40%;"></u-line>
				<view class="step-inactive"></view>
				<u-line color="#DDDDDD" style="width: 40%;"></u-line>
				<view class="step-inactive"></view>
			</view>
		</view>




		<view class="content">
			<!-- 标题 -->
			<view class="title">Welcome, Sign Up</view>

			<!-- 邮箱输入框 -->
			<view class="input-group tn-flex-direction-column" style="padding-top: 130rpx;">
				<view class="tn-flex tn-flex-direction-row tn-flex-col-center tn-flex-row-center">
					<image src="/static/register/rigister_email.png" style="width: 42rpx; height: 32rpx;"></image>
					<u-input v-model="email" placeholder="Email" class="input" :border="false"></u-input>
				</view>
				<u-line color="#D7D7D7"></u-line>
			</view>

			<!-- 密码输入框 -->
			<view class="input-group tn-flex-direction-column">
				<view class="tn-flex tn-flex-direction-row tn-flex-col-center tn-flex-row-center">
					<image src="/static/register/rigister_pwd.png" style="width: 37rpx; height: 43rpx;"></image>
					<u-input v-model="password" placeholder="Set Your Password" class="input" :border="false"
						password></u-input>
				</view>
				<u-line color="#D7D7D7"></u-line>
			</view>

			<!-- 登录按钮 -->
			<u-button class="signin-button" @click="handleSignIn">Next</u-button>

			<!-- 忘记密码 -->
			<view class="tn-flex tn-flex-direction-row tn-padding-top-sm tn-padding-bottom-sm">
				<u-radio shape="square"></u-radio>
				<text class="radioTip">I have read and agree to the Terms and Privacy Policy</text>
			</view>

			<!-- 分割线 -->
			<view class="divider">
				<view class="line"></view>
				<text>Sign in with Google or Apple</text>
				<view class="line"></view>
			</view>

			<!-- 第三方登录按钮 -->
			<u-button class="social-button" @click="handleGoogleLogin">
				<image src="/static/register/register_google.png" class="social-icon"></image>
				Google
			</u-button>
			<u-button class="social-button" @click="handleAppleLogin">
				<image src="/static/register/register_apple.png" class="social-icon"></image>
				Apple
			</u-button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				email: '', // 邮箱
				password: '' // 密码
			};
		},
		methods: {
			// 返回
			handleBack() {
				uni.navigateBack();
			},
			// 登录
			handleSignIn() {
				// if (!this.email || !this.password) {
				// 	uni.showToast({
				// 		title: 'Please enter email and password',
				// 		icon: 'none'
				// 	});
				// 	return;
				// }
				// // 调用登录接口
				// console.log('Email:', this.email);
				// console.log('Password:', this.password);
				// // 模拟登录成功
				// uni.showToast({
				// 	title: 'Sign In Success',
				// 	icon: 'success'
				// });

				uni.navigateTo({
					url: '/pages/login/registerStepQuestion'
				});
			},
			// 忘记密码
			handleForgotPassword() {
				uni.navigateTo({
					url: '/pages/login/forgetPassword'
				});
			},
			// Google 登录
			handleGoogleLogin() {
				// 调用 Google 登录接口
				console.log('Sign in with Google');
			},
			// Apple 登录
			handleAppleLogin() {
				// 调用 Apple 登录接口
				console.log('Sign in with Apple');
			},
			// 注册
			handleSignUp() {
				uni.navigateTo({
					url: '/pages/signup/signup'
				});
			}
		}
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

	.step-active {
		width: 38rpx;
		height: 38rpx;
		background: #419FFF;
		border-radius: 50%;
	}

	.step-active-small {
		height: 12rpx;
		width: 12rpx;
		background: #DDDDDD;
		border-radius: 6rpx;
	}

	.step-inactive {
		width: 12rpx;
		height: 12rpx;
		background: #419FFF;
		box-shadow: 0px 3rpx 7rpx 0prx rgba(0, 46, 135, 0.64);
		border-radius: 50%;
	}

	.step-line {
		height: 4rpx;
		border-radius: 2rpx;
		background-color: red;
		background: red;
	}


	.radioTip {
		font-family: Microsoft YaHei UI;
		font-weight: 400;
		font-size: 20rpx;
		color: #333333;
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
		background: linear-gradient(90deg, #67A6FE 0%, #4180FF 100%);
		border-radius: 43rpx;
		color: #fff;
	}

	.forgot-password {
		text-align: center;
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
		border: 1px solid #D7D7D7;
	}

	.social-icon {
		width: 32rpx;
		height: 32rpx;
		margin-right: 10rpx;
	}
</style>