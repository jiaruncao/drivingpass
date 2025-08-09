<template>
	<view class="profile-container">
		<u-navbar leftText="Edit Profile" :safeAreaInsetTop="true" :autoBack="true"
			:style="{ paddingTop: safeAreaTop + 'rpx' }" left-icon="arrow-leftward">
		</u-navbar>

		<view class="content">
			<!-- 头像 -->
			<view class="profile-item" @click="showAvatarPopup = true">
				<text class="item-label">Profile Photo</text>
				<view class="item-content">
					<image :src="userInfo.avatar" class="avatar" mode="aspectFill"></image>
					<u-icon name="arrow-right" size="18" color="#999"></u-icon>
				</view>
			</view>

			<!-- 用户名 -->
			<view class="profile-item" @click="goEditUsername()">
				<text class="item-label">Username</text>
				<view class="item-content">
					<text class="item-value">{{ userInfo.username }}</text>
					<u-icon name="arrow-right" size="18" color="#999"></u-icon>
				</view>
			</view>

			<!-- 简介 -->
			<view class="profile-item" @click="goEditBio()">
				<text class="item-label">Bio</text>
				<view class="item-content">
					<text class="item-value">{{ userInfo.bio || 'Road to licensure~' }}</text>
					<u-icon name="arrow-right" size="18" color="#999"></u-icon>
				</view>
			</view>

			<!-- 邮箱 -->
			<view class="profile-item" @click="goEditEmail()">
				<text class="item-label">Linked Email</text>
				<view class="item-content">
					<text class="item-value">{{ userInfo.email || '1144@mail.com' }}</text>
					<u-icon name="arrow-right" size="18" color="#999"></u-icon>
				</view>
			</view>

			<!-- 退出登录 -->
			<view class="action-button" @click="handleSignOut">Sign Out</view>

			<!-- 删除账户 -->
			<view class="action-button danger" @click="handleDeleteAccount">Delete Account</view>

		</view>

		<!-- 选择头像弹窗 -->
		<u-popup :show="showAvatarPopup" mode="bottom">
			<view class="popup-content">
				<view class="popup-title">Change Profile Photo</view>
				<view class="popup-option" @click="chooseImage('camera')">
					<text>Take Photo</text>
				</view>
				<view class="popup-option" @click="chooseImage('album')">
					<text>Choose from Album</text>
				</view>
				<view class="popup-cancel" @click="showAvatarPopup = false">
					<text>Cancel</text>
				</view>
			</view>
		</u-popup>

	</view>
</template>

<script>
	export default {
		data() {
			return {
				userInfo: {
					avatar: 'https://img0.baidu.com/it/u=605907382,111954907&fm=253&app=138&f=JPEG?w=500&h=500', // 头像 URL
					username: 'StormChaser',
					bio: 'Road to licensure~',
					email: '1144@mail.com'
				},
				showAvatarPopup: false,
				tempAvatar: ''
			};
		},
		methods: {
			// 选择图片
			chooseImage(sourceType) {
				uni.chooseImage({
					count: 1, // 最多选择 1 张图片
					sourceType: [sourceType], // 选择图片的来源：相册或相机
					success: (res) => {
						const tempFilePath = res.tempFilePaths[0];
						// 上传图片到服务器
						this.uploadImage(tempFilePath);
					},
					fail: (err) => {
						console.error('选择图片失败', err);
					}
				});
			},
			// 上传图片
			uploadImage(filePath) {
				// 模拟上传图片到服务器
				console.log('上传图片到服务器:', filePath);
				// 上传成功后更新头像 URL
				this.userInfo.avatar = filePath;
				// 关闭弹窗
				this.showAvatarPopup = false;
			},
			// 前往编辑用户名页面（移动到这里）
			goEditUsername() {
				uni.showModal({
					title: '编辑用户名',
					content: '请输入新的用户名',
					editable: true,
					success: (res) => {
						if (res.confirm && res.content) {
							this.userInfo.username = res.content; // 注意这里需要修改为 this.userInfo.username
						}
					}
				});
			},
			// 前往编辑个人简介页面（移动到这里）
			goEditBio() {
				uni.showModal({
					title: '编辑个人简介',
					content: '请输入新的简介内容',
					editable: true,
					success: (res) => {
						if (res.confirm && res.content) {
							this.userInfo.bio = res.content; // 注意这里需要修改为 this.userInfo.bio
						}
					}
				});
			},
			// 前往编辑邮箱页面（移动到这里）
			goEditEmail() {
				uni.showModal({
					title: '编辑邮箱',
					content: '请输入新的邮箱',
					editable: true,
					success: (res) => {
						if (res.confirm && res.content) {
							this.userInfo.email = res.content; // 注意这里需要修改为 this.userInfo.email
						}
					}
				});
			},
			// 退出登录
			handleSignOut() {
				uni.showModal({
					title: '确认退出',
					content: '确定要退出登录吗？',
					success: (res) => {
						if (res.confirm) {
							// 调用退出登录接口
							console.log('用户点击确定');
							// 退出后跳转到登录页
							uni.reLaunch({
								url: '/pages/login/login'
							});
						}
					}
				});
			},
			// 删除账户
			handleDeleteAccount() {
				uni.showModal({
					title: '警告',
					content: '删除账户将无法恢复，确定要删除吗？',
					success: (res) => {
						if (res.confirm) {
							// 调用删除账户接口
							console.log('用户点击确定');
							// 删除后跳转到登录页
							uni.reLaunch({
								url: '/pages/login/login'
							});
						}
					}
				});
			}
		}
	}
</script>

<style scoped>
	.profile-container {
		background-color: #fff;
		padding: 20rpx;
	}

	.content {
		margin-top: 64px;
		/* 给内容底部留出按钮高度的空间，避免被按钮遮挡 */
		padding-bottom: 80rpx;
	}

	.profile-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20rpx 0;
		border-bottom: 1rpx solid #f5f5f5;
	}

	.item-label {
		font-size: 28rpx;
		color: #333;
	}

	.item-content {
		display: flex;
		align-items: center;
	}

	.item-value {
		font-size: 28rpx;
		color: #999;
		margin-right: 10rpx;
	}

	.avatar {
		width: 60rpx;
		height: 60rpx;
		border-radius: 50%;
		margin-right: 10rpx;
	}

	.action-button {
		margin: 40rpx 20rpx;
		padding: 20rpx;
		text-align: center;
		font-size: 28rpx;
		background-color: #f5f5f5;
		border-radius: 8rpx;
	}

	.danger {
		color: #ff4d4f;
	}

	/* 弹窗样式 */
	.popup-content {
		background-color: #fff;
		padding: 30rpx;
	}

	.popup-title {
		font-size: 32rpx;
		font-weight: bold;
		text-align: center;
		margin-bottom: 40rpx;
	}

	.popup-option {
		padding: 20rpx;
		text-align: center;
		font-size: 28rpx;
		border-bottom: 1rpx solid #f5f5f5;
	}

	.popup-cancel {
		padding: 20rpx;
		text-align: center;
		font-size: 28rpx;
		color: #999;
		margin-top: 20rpx;
	}
</style>