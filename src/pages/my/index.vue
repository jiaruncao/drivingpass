<template>
	<view class="container">
		<!-- 用户信息区域 -->
		<view :style="{ paddingTop: safeAreaTop + 'rpx' }">
			<view class="tn-flex tn-flex-direction-row tn-flex-col-center">
				<u-avatar :src="user.avatar" size="120rpx" shape="circle"></u-avatar>
				<view class="tn-flex tn-flex-row-between tn-flex-9 tn-flex-col-center">
					<view class="tn-flex tn-flex-direction-row tn-padding-left-sm">
						<view class="tn-flex tn-flex-direction-column">
							<text class="user-name">{{ user.name }}</text>
							<view class="exam-countdown tn-flex tn-flex-direction-row">
								<text class="exam-countdownday">{{user.countdown}} </text>
								<text class="countdown-text tn-padding-left-xs">days until next attempt</text>
								<u-icon name="arrow-right" size="12" color="#999"></u-icon>
							</view>
						</view>
					</view>
					<view class="tn-flex edit-btn tn-flex-col-center tn-flex-row-center" @click="editClick()">
						Edit Profile
					</view>
				</view>
			</view>
		</view>

		<!-- 个人简介 -->
		<view class="bio-section">
			<text class="bio-text">Bio：{{ user.bio }}</text>
		</view>

		<!-- 统计数据 -->
		<view class="tn-flex tn-flex-row-between tn-margin-bottom-sm">
			<view class="stat-item" @click="followerClick()">
				<text class="stat-number">{{ user.following }}</text>
				<text class="stat-label tn-padding-left-xs">Followed</text>
			</view>
			<view class="stat-item" @click="fansClick()">
				<text class="stat-number">{{ user.followers }}</text>
				<text class="stat-label tn-padding-left-xs">Fans</text>
			</view>
			<view class="stat-item">
				<text class="stat-number">{{ user.likes }}</text>
				<text class="stat-label tn-padding-left-xs">Likes</text>
			</view>
		</view>


		<!-- 会员订阅 -->
		<view class="member-bg tn-flex-direction-column tn-flex">
			<view class="tn-flex tn-flex-direction-row tn-flex-row-between tn-padding-sm">
				<view class="tn-flex tn-flex-direction-column">
					<text class="member-name">Monthly Subscription</text>
					<text class="member-expire">Expires 08.11.2025</text>
				</view>
				<view class="member-useBtn tn-flex-col-center tn-flex-row-center tn-flex">
					<text>Use Now ></text>
				</view>
			</view>

			<view class="tn-flex tn-flex-direction-row">
				<view
					class="tn-flex tn-flex-direction-column tn-flex-col-center tn-flex-row-center tn-text-center tn-padding-right-sm tn-padding-left-sm">
					<image class="member-image" :src="user.avatar" mode="aspectFill"></image>
					<text class="member-item-des tn-padding-top-xs">Real Exam Simulation</text>
				</view>
				<view
					class="tn-flex tn-flex-direction-column tn-flex-col-center tn-flex-row-center tn-text-center tn-padding-right-sm tn-padding-left-sm">
					<image class="member-image" :src="user.avatar" mode="aspectFill"></image>
					<text class="member-item-des tn-padding-top-xs">Community Posts</text>
				</view>
				<view
					class="tn-flex tn-flex-direction-column tn-flex-col-center tn-flex-row-center tn-text-center tn-padding-right-sm tn-padding-left-sm">
					<image class="member-image" :src="user.avatar" mode="aspectFill"></image>
					<text class="member-item-des tn-padding-top-xs">All Official Questions</text>
				</view>
				<view
					class="tn-flex tn-flex-direction-column tn-flex-col-center tn-flex-row-center tn-text-center tn-padding-right-sm tn-padding-left-sm">
					<image class="member-image" :src="user.avatar" mode="aspectFill"></image>
					<text class="member-item-des tn-padding-top-xs">Exclusive Questions</text>
				</view>
			</view>
		</view>



		<!-- 题库信息 -->
		<view class="exam-info-section tn-margin-top-xs">
			<view class="exam-switch">
				<text>Switch Question Bank：</text>
				<text class="exam-type" @click="switchQuestionClick()">{{ user.examType }}</text>
				<u-icon name="arrow-right" size="20" color="#999"></u-icon>
			</view>
			<view class="pass-rate-section">
				<text>Current pass rate:{{ user.passRate }}</text>
				<view class="tn-flex tn-flex-direction-row" @click="pushExamDetail()">
					<text class="view-details">View Details</text>
					<u-icon name="arrow-right" size="16" color="#999"></u-icon>
				</view>
			</view>
		</view>

		<!-- 功能列表 -->
		<view class="feature-list">
			<view class="feature-item" v-for="(item, index) in features" :key="index" @click="itemClick(index)">
				<u--image :src="item.icon" width="34rpx" height="34rpx"></u--image>
				<text class="feature-text">{{ item.text }}</text>
				<u-icon name="arrow-right" size="16" color="#999"></u-icon>
			</view>
		</view>

		<view class="tn-flex" style="width: 100%;">
			<u-popup :show="shareshow" @close="shareclose" @open="shareopen">
				<view class="tn-flex tn-flex-direction-column" style="width: 100%; background-color: #F7F7F7;">
					<view class="tn-flex tn-flex-direction-row tn-padding-top-sm tn-padding-bottom-sm">
						<view class="tn-flex tn-flex-col-center tn-flex-row-center tn-flex-direction-column"
							style="width: 25%;" @click="shareClick('Instagram')">
							<image src="/static/share/share_instagram.png" class="share-item-image"></image>
							<text class="share-item-text">Instagram</text>
						</view>
						<view class="tn-flex tn-flex-col-center tn-flex-row-center tn-flex-direction-column"
							style="width: 25%;" @click="shareClick('Tiktok')">
							<image src="/static/share/share_tiktok.png" class="share-item-image"></image>
							<text class="share-item-text">Tiktok</text>
						</view>
						<view class="tn-flex tn-flex-col-center tn-flex-row-center tn-flex-direction-column"
							style="width: 25%;" @click="shareClick('Facebook')">
							<image src="/static/share/share_facebook.png" class="share-item-image"></image>
							<text class="share-item-text">Facebook</text>
						</view>
						<view class="tn-flex tn-flex-col-center tn-flex-row-center tn-flex-direction-column"
							style="width: 25%;" @click="shareClick('Whatsapp')">
							<image src="/static/share/share_whatsapp.png" class="share-item-image"></image>
							<text class="share-item-text">Whatsapp</text>
						</view>
					</view>
					<view class="tn-flex tn-flex-col-center tn-flex-row-center cancelBottom" style="width: 100%;">
						Cancel
					</view>
				</view>
			</u-popup>
		</view>
	</view>


</template>

<script>
	export default {
		data() {
			return {
				shareshow: false,
				user: {
					avatar: 'https://img1.baidu.com/it/u=2172818577,3783888802&fm=253&app=138&f=JPEG?w=800&h=1422',
					name: 'StormChaser',
					countdown: 14,
					bio: 'Road to licensure~',
					following: 18,
					followers: 99,
					likes: 999,
					examType: 'Type 1',
					passRate: '70%'
				},
				features: [{
						icon: 'star',
						text: 'Saved items'
					},
					{
						icon: 'heart',
						text: 'Rate the App'
					},
					{
						icon: 'share',
						text: 'Share App'
					},
					{
						icon: 'address-book',
						text: 'Contract Us'
					},
					{
						icon: 'information',
						text: 'Privacy Policy'
					},
					{
						icon: 'clipboard',
						text: 'Terms of Use'
					}
				],
			};
		},
		methods: {
			followerClick() {
				uni.navigateTo({
					url: '/pages/my/fansAndFollowes'
				});
			},
			fansClick() {
				uni.navigateTo({
					url: '/pages/my/fansAndFollowes'
				});
			},
			itemClick(index) {
				console.log(index);
				if (index == 0) {
					uni.navigateTo({
						url: '/pages/my/mySaved'
					});
				} else if (index == 2) {
					console.log('分享APP');
					//this.sharePop();
				}
			},
			editClick() {
				uni.navigateTo({
					url: '/pages/my/editProfile'
				});
			},
			switchQuestionClick() {
				uni.navigateTo({
					url: '/pages/login/index'
				});
				// uni.navigateTo({ url: '/pages/my/switchQuestion' });
			},
			pushExamDetail() {
				uni.navigateTo({
					url: '/pages/my/testAnalysis'
				});
			},
			shareClick(item) {
				this.shareshow = false;
			},

			shareclose() {
				this.shareshow = false;
			},

			sharePop() {
				this.shareshow = true;
			},
		},
	};
</script>

<style>
	.container {
		flex: 1;
		padding: 20rpx;
		background-color: #F7F7F7;
		background: #F7F7F7;
	}

	/* 用户信息区域 */
	.user-info-section {
		padding-top: 83rpx;
	}

	.user-name {
		font-family: Microsoft YaHei UI;
		font-weight: 400;
		font-size: 32rpx;
		color: #333333;
		line-height: 13rpx;
	}

	.exam-countdown {
		font-family: Microsoft YaHei UI;
		font-weight: 400;
		font-size: 28rpx;
		color: #999999;
		margin-top: 30rpx;
	}

	.exam-countdownday {
		font-family: Microsoft YaHei UI;
		font-weight: 400;
		font-size: 28rpx;
		color: #419FFF;
	}



	.edit-btn {
		width: 180rpx;
		height: 51rpx;
		border-radius: 26rpx;
		border: 2rpx solid #D7D7D7;

		font-family: Microsoft YaHei UI;
		font-weight: 400;
		font-size: 22rpx;
		color: #999999;
	}

	/* 个人简介 */
	.bio-section {
		font-size: 28rpx;
		color: #999999;
		margin-top: 27rpx;
		margin-bottom: 20rpx;
	}

	.bio-label {
		font-weight: bold;
		color: #333;
	}

	/* 统计数据 */
	.stats-section {
		display: flex;
		justify-content: space-around;
		margin-bottom: 20rpx;
	}


	.stat-number {
		font-family: Microsoft YaHei UI;
		font-weight: 400;
		font-size: 36rpx;
		color: #333333;
	}

	.stat-label {
		font-family: Microsoft YaHei UI;
		font-weight: 400;
		font-size: 22rpx;
		color: #999999;
	}

	/* 题库信息 */
	.exam-info-section {
		background: white;
		border-radius: 16rpx;
		padding: 20rpx;
		margin-bottom: 20rpx;
	}

	.exam-switch {
		font-family: Microsoft YaHei UI;
		font-weight: 400;
		font-size: 28rpx;
		color: #333333;
		display: flex;
		align-items: center;
		margin-bottom: 10rpx;
	}

	.exam-type {
		color: #419FFF;
		margin: 0 10rpx;
		font-family: Microsoft YaHei UI;
		font-weight: 400;
		font-size: 28rpx;
	}

	.pass-rate-section {
		display: flex;
		justify-content: space-between;
		align-items: center;

		font-family: Microsoft YaHei UI;
		font-weight: 400;
		font-size: 24rpx;
		color: #333333;

	}

	.view-details {
		font-family: Microsoft YaHei UI;
		font-weight: 400;
		font-size: 24rpx;
		color: #999999;
	}

	/* 功能列表 */
	.feature-list {
		background-color: #fff;
		border-radius: 12rpx;
		overflow: hidden;
	}

	.feature-item {
		display: flex;
		align-items: center;
		padding: 20rpx;
		height: 123rpx;
		border-bottom: 1px solid #f0f0f0;
	}

	.feature-item:last-child {
		border-bottom: none;
	}

	.feature-text {
		flex: 1;
		margin: 0 20rpx;
		font-family: Microsoft YaHei UI;
		font-weight: 400;
		font-size: 28rpx;
		color: #333333;
	}

	.member-bg {
		background: linear-gradient(118deg, #0057E3 0%, #1F83FF 100%);
		border-radius: 16px;
		height: 326rpx;

		.member-name {
			font-family: Microsoft YaHei UI;
			font-weight: 400;
			font-size: 28rpx;
			color: #FFFFFF;
		}

		.member-expire {
			font-family: Microsoft YaHei UI;
			font-weight: 400;
			font-size: 20rpx;
			color: #FFFFFF;
		}

		.member-useBtn {
			width: 169rpx;
			height: 49rpx;
			background: #FFFFFF;
			border-radius: 25rpx;

			font-family: Microsoft YaHei UI;
			font-weight: 400;
			font-size: 24rpx;
			color: #419FFF;
		}

		.member-image {
			width: 77rpx;
			height: 77rpx;
			border-radius: 50%;
			border: 1px solid #FFFFFF;
		}

		.member-item-des {
			font-family: Microsoft YaHei UI;
			font-weight: 400;
			font-size: 20rpx;
			color: #FFFFFF;
		}

		.share-item-image {
			width: 93rpx;
			height: 93rpx;
			background: #FFFFFF;
			border-radius: 50%;
		}

		.share-item-text {
			font-family: Microsoft YaHei UI;
			font-weight: 400;
			font-size: 24rpx;
			color: #333333;
		}

	}
</style>