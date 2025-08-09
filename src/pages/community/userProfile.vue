<template>
	<view class="container">
		<u-navbar leftText="user Profile" :safeAreaInsetTop="true" :autoBack="true" left-icon="arrow-leftward">
		</u-navbar>


		<!-- 内容区域 -->
		<view class="content tn-padding-sm" :style="{ paddingTop: safeAreaTop + 'rpx' }">
			<view>
				<!-- 用户信息 -->
				<view class="user-info">
					<!-- 头像 -->
					<view class="avatar-container">
						<u-avatar :src="userInfo.avatar" size="120rpx" shape="circle"></u-avatar>
					</view>

					<!-- 用户名和考试中心 -->
					<view class="user-details">
						<text class="username">{{ userInfo.username }}</text>
						<text class="test-center">{{ userInfo.testCenter }}</text>
					</view>
				</view>

				<!-- 简介 -->
				<view class="bio-section">
					<text class="bio-label">Bio:</text>
					<text class="bio-text">{{ userInfo.bio }}</text>
				</view>

				<!-- 统计数据 -->
				<view class="stats-section">
					<view class="stat-item">
						<text class="stat-number">{{ userInfo.followed }}</text>
						<text class="stat-label">Followed</text>
					</view>
					<view class="stat-item">
						<text class="stat-number">{{ userInfo.followers }}</text>
						<text class="stat-label">Followers</text>
					</view>
					<view class="stat-item">
						<text class="stat-number">{{ userInfo.likes }}</text>
						<text class="stat-label">Likes</text>
					</view>
				</view>
			</view>
			<view style="height: 20rpx; width: 100%; background-color: #F7F7F7;"></view>
			<view>
				<u-tabs class="tn-flex" :activeStyle="{
				    color: '#333333',
				    fontWeight: 'bold',
				    transform: 'scale(1.05)'
					
				}" :inactiveStyle="{
				    color: '#999999',
				    transform: 'scale(1)'
				}" itemStyle="padding-left: 15px; padding-right: 15px; height: 34px;" :list="list1"
					@click="handleTabChange"></u-tabs>
			</view>


			<view :style="{
                  height: `calc(100vh - ${safeAreaTop + 176}rpx)`
                }" style="height: 100%;">
				<swiper :current="swiperCurrent" style="height: 100%;" @change="onSwiperChange">
					<swiper-item class="swiper-item" v-for="(item, index) in list1" :key="index">
						<scroll-view scroll-y class="content-wrapper" style="height: 100%;">
							<view v-if="index == 1">
								<!-- 帖子列表 -->
								<view class="post-item" v-for="(item, index) in postList" :key="index">
									<!-- 用户信息 -->
									<view class="user-section" @click="userProfileClick">
										<u-avatar :src="item.avatar" size="40"></u-avatar>
										<view class="user-info">
											<text class="username">{{ item.username }}</text>
											<text class="test-center">{{ item.testCenter }}</text>
										</view>
									</view>

									<view class="content-detail">
										<!-- 帖子内容 -->
										<view class="post-content">
											<image src="/static/community/community_essence.png"
												style="top: 2px; width: 28px; height: 14.5px;">
											</image>
											<text class="content-text">{{ item.content }}</text>
										</view>

										<view class="post-images">
											<image v-for="(img, index) in item.images" :key="index" :src="img"
												mode="aspectFill"></image>
										</view>


										<!-- 评论和互动区 -->
										<view class="interaction-section">
											<!-- 评论 -->
											<view class="comment-box" v-if="item.comment.username">
												<view class="comment-content">
													<text class="comment-user">{{ item.comment.username }}</text>
													<text class="comment-text">{{ item.comment.content }}</text>
													<text class="view-replies" @click="gotoDetail(index)">View all replies wefwef></text>
												</view>
											</view>

											<!-- 标签和点赞 -->
											<view class="bottom-section">
												<view class="tags">
													<view v-for="(tag, tagIndex) in item.tags" :key="tagIndex" class="tag-item">#
														{{tag}}
													</view>
												</view>
												<view class="like-section">
													<u-icon name="thumb-up" size="18"
														:color="item.isLiked ? '#419FFF' : '#000000'"
														@click="likeClick(index)"></u-icon>
													<text class="like-count">{{ item.likes }}</text>
												</view>
												<view class="like-section tn-padding-left">
													<image src="/static/community/community_comment.png"
														style="width: 30rpx; height: 30rpx;" @click="addComment(index)">
													</image>
													<text
														class="like-count tn-padding-left-sx">{{ item.commentNo }}</text>
												</view>
											</view>
										</view>
									</view>
									<!-- 分隔线 -->
									<u-line color="#f5f5f5"></u-line>
								</view>
							</view>
							<view v-else>
								<view class="post-item" v-for="(item, index) in postList" :key="index">
									<!-- 用户信息 -->
									<view class="user-section" @click="userProfileClick">
										<u-avatar :src="item.avatar" size="40"></u-avatar>
										<view class="user-info">
											<text class="username">{{ item.username }}</text>
											<text class="test-center">{{ item.testCenter }}</text>
										</view>
									</view>

									<view class="content-detail">
										<!-- 帖子内容 -->
										<view class="post-content">
											<image src="/static/community/community_essence.png"
												style="top: 2px; width: 28px; height: 14.5px;">
											</image>
											<text class="content-text">{{ item.content }}</text>
										</view>

										<view class="post-images">
											<image v-for="(img, index) in item.images" :key="index" :src="img"
												mode="aspectFill"></image>
										</view>


										<!-- 评论和互动区 -->
										<view class="interaction-section">
											<!-- 评论 -->
											<view class="comment-box" v-if="item.comment.username">
												<view class="comment-content">
													<text class="comment-user">{{ item.comment.username }}</text>
													<text class="comment-text">{{ item.comment.content }}</text>
													<text class="view-replies" @click="gotoDetail(index)">View all replies></text>
												</view>
											</view>

											<!-- 标签和点赞 -->
											<view class="bottom-section">
												<view class="tags">
													<view v-for="(tag, tagIndex) in item.tags" :key="tagIndex" class="tag-item">#
														{{tag}}
													</view>
												</view>
												<view class="like-section">
													<u-icon name="thumb-up" size="18"
														:color="item.isLiked ? '#419FFF' : '#000000'"
														@click="likeClick(index)"></u-icon>
													<text class="like-count">{{ item.likes }}</text>
												</view>
												<view class="like-section tn-padding-left">
													<image src="/static/community/community_comment.png"
														style="width: 30rpx; height: 30rpx;" @click="addComment(index)">
													</image>
													<text
														class="like-count tn-padding-left-sx">{{ item.commentNo }}</text>
												</view>
											</view>
										</view>
									</view>



									<!-- 分隔线 -->
									<u-line color="#f5f5f5"></u-line>
								</view>
							</view>
						</scroll-view>
					</swiper-item>
				</swiper>
			</view>
		</view>
		<!-- 固定在屏幕底部的Follow按钮 -->
		<view class="follow-btn" @click="followClick()">
			<text>Follow</text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				swiperCurrent: 0,
				postList: [{
						avatar: 'https://cdn.uviewui.com/uview/template/niannian.jpg',
						username: 'StormChaser',
						testCenter: 'Test Centre: xxx',
						featured: true,
						images: [
							'https://img1.baidu.com/it/u=2172818577,3783888802&fm=253&app=138&f=JPEG?w=800&h=1422',
							'https://img1.baidu.com/it/u=2172818577,3783888802&fm=253&app=138&f=JPEG?w=800&h=1422',
							'https://img1.baidu.com/it/u=2172818577,3783888802&fm=253&app=138&f=JPEG?w=800&h=1422'
						],
						content: 'Pass your driving theory test in just 3 days! Private tutoring makes ALL the difference, ladies! The exam is simpler than you think - just focus on',
						comment: {
							avatar: 'https://cdn.uviewui.com/uview/template/nan.png',
							username: 'GOOOgo',
							content: 'Just passed with 97%!'
						},
						tags: ['Theory Test', 'Test', 'good lt'],
						likes: 999,
						commentNo: 100,
						isLiked: false
					},
					{
						avatar: 'https://cdn.uviewui.com/uview/template/niannian.jpg',
						username: 'StormChaser',
						testCenter: 'Test Centre: xxx',
						featured: false,
						content: 'Pass your driving theory test in just 3 days! Private tutoring makes ALL the difference, ladies! The exam is simpler than you think - just focus on',
						comment: {},
						tags: ['Theory Test', 'Test', 'good lt'],
						likes: 999,
						commentNo: 100,
						isLiked: false
					}
				],
				list1: [{
					name: 'Challenges',
				}, {
					name: 'Short Videos',
				}],
				userInfo: {
					avatar: 'https://cdn.uviewui.com/uview/template/niannian.jpg',
					username: 'StormChaser',
					testCenter: 'Test Centre: xxx',
					bio: 'Road to licensure~',
					followed: 18,
					followers: 99,
					likes: 999
				}
			};
		},
		methods: {
			// 补充缺失的方法定义
			click(item) {
				console.log('tab clicked:', item);
			},
			followClick() {
				console.log('follow button clicked');
			},
			// 添加点赞方法
			likeClick(index) {
				const post = this.postList[index];
				post.isLiked = !post.isLiked; // 切换点赞状态
				// 点赞数+1或-1
				if (post.isLiked) {
					post.likes += 1;
				} else {
					post.likes -= 1;
				}
			},
			addComment(index) {
				uni.navigateTo({
					url: '/pages/community/detail'
				});
			},
			// 新增发布按钮点击事件
			goToPublish() {
				// 这里可以跳转到发布页面，示例使用路由跳转
				uni.navigateTo({
					url: '/pages/community/create'
				});
				console.log('点击了发布按钮');
			},
			userProfileClick() {
				uni.navigateTo({
					url: '/pages/community/userProfile'
				});
				console.log('点击了UserProfile');
			},
			gotoDetail() {
				uni.navigateTo({
					url: '/pages/community/detail'
				});
				console.log('点击了detail');
			},
			handleTabChange(e) {
				this.swiperCurrent = e.index;
			},
			onSwiperChange(e) {
				// e.detail.current 是当前滑动到的 swiper-item 索引
				this.swiperCurrent = e.detail.current;
			}
		}
	};
</script>

<style scoped>
	.container {
		flex: 1;
		background-color: #fff;
		/* 修正背景色为白色，原红色影响视觉 */
		/* 移除margin-bottom，避免内容被按钮遮挡 */
	}

	.content {
		margin-top: 64px;
		/* 给内容底部留出按钮高度的空间，避免被按钮遮挡 */
		padding-bottom: 80rpx;
	}

	/* 用户信息样式保持不变 */
	.user-info {
		display: flex;
		align-items: center;
		margin-bottom: 30rpx;
	}

	.avatar-container {
		margin-right: 20rpx;
	}

	.user-details {
		display: flex;
		flex-direction: column;
	}

	.username {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 10rpx;
	}

	.test-center {
		font-size: 28rpx;
		color: #999;
	}

	/* 简介样式保持不变 */
	.bio-section {
		margin-bottom: 30rpx;
	}

	.bio-label {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		margin-right: 10rpx;
	}

	.bio-text {
		font-size: 32rpx;
		color: #666;
	}

	/* 统计数据样式保持不变 */
	.stats-section {
		display: flex;
	}

	.stat-item {
		display: flex;
		flex-direction: row;
		align-items: center;
		padding-right: 30rpx;
	}

	.stat-number {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 10rpx;
	}

	.stat-label {
		padding-left: 10rpx;
		font-size: 28rpx;
		color: #999;
	}

	/* 内容滚动区域样式保持不变 */
	.content-wrapper {
		flex: 1;
		padding: 20rpx;
		box-sizing: border-box;
	}

	/* 帖子列表样式保持不变 */
	.post-item {
		background-color: #ffffff;
		border-radius: 12rpx;
		padding: 24rpx;
		margin-bottom: 24rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

		.user-section {
			display: flex;
			align-items: center;
			margin-bottom: 20rpx;

			.user-info {
				margin-left: 16rpx;
				display: flex;
				flex-direction: column;

				.username {
					font-family: Microsoft YaHei UI;
					font-weight: 400;
					font-size: 13px;
					color: #333333;

				}

				.test-center {
					font-family: Microsoft YaHei UI;
					font-weight: 400;
					font-size: 10px;
					color: #999999;

				}
			}
		}

		.post-content {
			margin-bottom: 24rpx;

			.content-text {
				font-family: Microsoft YaHei UI;
				font-weight: 400;
				font-size: 15px;
				color: #333333;
				margin-left: 5px;
			}
		}

		.post-images {
			display: flex;
			flex-wrap: wrap;
			margin-bottom: 16rpx;
		}

		.post-images image {
			width: 180rpx;
			height: 180rpx;
			margin-right: 16rpx;
			margin-bottom: 16rpx;
			border-radius: 8rpx;
		}

		.interaction-section {


			.comment-box {
				background: #F7F7F7;
				border-radius: 4px;
				display: flex;
				padding: 16rpx 0;

				.comment-content {
					margin-left: 12rpx;
					flex: 1;

					.comment-user {
						font-size: 26rpx;
						font-weight: bold;
						color: #333;
						margin-right: 12rpx;
					}

					.comment-text {
						font-size: 26rpx;
						color: #333;
					}

					.view-replies {
						display: block;
						font-size: 24rpx;
						color: #419FFF;
						margin-top: 6rpx;
					}
				}
			}

			.bottom-section {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-top: 16rpx;

				.tags {
					flex: 1;
					display: flex;
					flex-wrap: wrap;

					.tag-item {
						font-family: Microsoft YaHei UI;
						font-weight: 400;
						font-size: 20rpx;
						color: #999999;

						padding-left: 10rpx;
						padding-right: 10rpx;
						margin-right: 12rpx;
						margin-bottom: 8rpx;
						background-color: #F7F7F7;
						border-radius: 24rpx;
					}
				}

				.like-section {
					display: flex;
					align-items: center;
					color: #666;

					.like-count {
						font-size: 24rpx;
						margin-left: 6rpx;
					}
				}
			}
		}
	}

	/* 关键修改：固定在屏幕底部的Follow按钮样式 */
	.follow-btn {
		position: fixed;
		/* 固定定位，确保在屏幕底部 */
		left: 0;
		right: 0;
		bottom: 0;
		/* 紧贴屏幕底部 */
		height: 80rpx;
		/* 增加高度，提高点击区域 */
		display: flex;
		justify-content: center;
		align-items: center;
		background: #FFFFFF;
		border-top: 1px solid #D7D7D7;
		/* 确保按钮在最上层，不被其他内容遮挡 */
		z-index: 999;

		text {
			font-family: Microsoft YaHei UI;
			font-weight: 400;
			font-size: 26rpx;
			color: #333333;
			line-height: 13rpx;
		}
	}
</style>