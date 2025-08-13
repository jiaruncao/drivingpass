<template>
	<view class="container">
		<view :style="{ paddingTop: safeAreaTop + 'rpx' }"
			style="position: fixed; top: 0; left: 0; width: 100%; background: #fff; z-index: 99;">
			<u-tabs class="tn-flex tn-flex-center tn-margin" :activeStyle="{
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
		    paddingTop: (safeAreaTop + 176) + 'rpx',
		    height: `calc(100vh - ${safeAreaTop + 176}rpx)`
		  }" >
			<swiper :current="swiperCurrent" style="height: 100%;" @change="onSwiperChange" :duration="300"
  :circular="false">
				<swiper-item class="swiper-item" v-for="(item, index) in list1" :key="index">
					<scroll-view scroll-y class="content-wrapper" ref="scrollView">
						<view v-if="index == 1" style="height: 100%;">
							<view v-if="postList && postList.length > 0">
								<view class="post-item" v-for="(item, index) in postList" :key="item.id">
									<!-- 用户信息 -->
									<view class="user-section" @click="userProfileClick">
										<u-avatar :src="item.avatar" size="40"></u-avatar>
										<view class="user-info">
											<text class="username">{{ item.nickname }}</text>
											<text class="test-center">{{ item.test_center }}</text>
										</view>
									</view>

									<view class="content-detail">
										<!-- 帖子内容 -->
										<view class="post-content">
											<image src="/static/community/community_essence.png"
												style="top: 2px; width: 28px; height: 14.5px;" v-if="item.elite == 2">
											</image>
											<text class="content-text">{{ item.content }}</text>
										</view>

										<view class="post-images">
											<u--image v-for="(img, index) in item.file_url" :key="index" :src="img"
												mode="aspectFill" :errorIcon="error-circle" :loadingIcon="photo"
												class="post-images-uimage" width="90" height="90"></u--image>
										</view>


										<!-- 评论和互动区 -->
										<view class="interaction-section">
											<!-- 评论 -->
											<view class="comment-box" v-if="item.first_reply.nickname">
												<view class="comment-content">
													<text class="comment-user">{{ item.first_reply.nickname }}</text>
													<text class="comment-text">{{ item.first_reply.content }}</text>
													<text class="view-replies" @click="gotoDetail(index)">View all replies></text>
												</view>
											</view>

											<!-- 标签和点赞 -->
											<view class="bottom-section">
												<view class="tags">
													<view v-for="(tag, tagIndex) in item.tag_ids" class="tag-item"
														:key="tagIndex"># {{tag}}
													</view>
												</view>
												<view class="like-section">
													<u-icon name="thumb-up" size="18"
														:color="item.isLiked ? '#419FFF' : '#000000'"
														@click="likeClick(index)"></u-icon>
													<text class="like-count">{{ item.support_count }}</text>
												</view>
												<view class="like-section tn-padding-left">
													<image src="/static/community/community_comment.png"
														style="width: 30rpx; height: 30rpx;" @click="addComment(index)">
													</image>
													<text
														class="like-count tn-padding-left-sx">{{ item.reply_count }}</text>
												</view>
											</view>
										</view>
									</view>
									<!-- 分隔线 -->
									<u-line color="#f5f5f5"></u-line>
								</view>
							</view>
							<view v-else style="width: 100%; height: 100%;">
								<view class="tn-flex tn-flex-center tn-flex-col-center tn-flex-row-center" style="height: 100%;" v-show="nodata">
									<u-empty mode="data">
									</u-empty>
								</view>
							</view>

						</view>
						<view v-else style="height: 100%;">
							<view v-if="postList && postList.length > 0" >
							<view class="post-item" v-for="(item, index) in postList" :key="item.id">
								<!-- 用户信息 -->
								<view class="user-section" @click="userProfileClick">
									<u-avatar :src="item.avatar" size="40"></u-avatar>
									<view class="user-info">
										<text class="username">{{ item.nickname }}</text>
										<text class="test-center">{{ item.test_center }}</text>
									</view>
								</view>

								<view class="content-detail">
									<!-- 帖子内容 -->
									<view class="post-content">
										<image src="/static/community/community_essence.png"
											style="top: 2px; width: 28px; height: 14.5px;" v-if="item.elite == 2">
										</image>
										<text class="content-text">{{ item.content }}</text>
									</view>

									<view class="post-images">
										<u--image v-for="(img, index) in item.file_url" :key="index" :src="img"
											mode="aspectFill" :errorIcon="error-circle" :loadingIcon="photo"
											class="post-images-uimage" width="90" height="90"></u--image>
									</view>


									<!-- 评论和互动区 -->
									<view class="interaction-section">
										<!-- 评论 -->
										<view class="comment-box" v-if="item.first_reply.nickname">
											<view class="comment-content">
												<text class="comment-user">{{ item.first_reply.nickname }}</text>
												<text class="comment-text">{{ item.first_reply.content }}</text>
												<text class="view-replies" @click="gotoDetail(index)">View all replies></text>
											</view>
										</view>

										<!-- 标签和点赞 -->
										<view class="bottom-section">
											<view class="tags">
												<view v-for="(tag, tagIndex) in item.tag_ids" class="tag-item"
													:key="tagIndex"># {{tag}}
												</view>
											</view>
											<view class="like-section">
												<u-icon name="thumb-up" size="18"
													:color="item.isLiked ? '#419FFF' : '#000000'"
													@click="likeClick(index)"></u-icon>
												<text class="like-count">{{ item.support_count }}</text>
											</view>
											<view class="like-section tn-padding-left">
												<image src="/static/community/community_comment.png"
													style="width: 30rpx; height: 30rpx;" @click="addComment(index)">
												</image>
												<text
													class="like-count tn-padding-left-sx">{{ item.reply_count }}</text>
											</view>
										</view>
									</view>
								</view>



								<!-- 分隔线 -->
								<u-line color="#f5f5f5"></u-line>
							</view>
							</view>
							<view v-else style="width: 100%; height: 100%;">
								<view class="tn-flex tn-flex-center tn-flex-col-center tn-flex-row-center" style="height: 100%;" v-show="nodata">
									<u-empty mode="data">
									</u-empty>
								</view>
							</view>
						</view>
					</scroll-view>
				</swiper-item>
			</swiper>
		</view>


		<!-- 发布按钮 -->
		<view class="publish-btn" @click="goToPublish">
			<u-icon name="edit-pen" size="32" color="#FFFFFF"></u-icon>
		</view>

	</view>


</template>

<script>
	export default {
		data() {
			return {
				list1: [{
					name: 'Followed',
				}, {
					name: 'Discover',
				}],
				nodata: false,
				swiperCurrent: 0,
				postList: [{
						id: 4,
						room_id: 2,
						avatar: 'https://cdn.uviewui.com/uview/template/niannian.jpg',
						nickname: 'StormChaser',
						test_center: 'Test Centre: xxx',
						featured: true,
						elite: 2,
						file_url: [
							'https://img1.baidu.com/it/u=2172818577,3783888802&fm=253&app=138&f=JPEG?w=800&h=1422',
							'https://img1.baidu.com/it/u=2172818577,3783888802&fm=253&app=138&f=JPEG?w=800&h=1422',
							'https://img1.baidu.com/it/u=2172818577,3783888802&fm=253&app=138&f=JPEG?w=800&h=1422'
						],
						content: 'Pass your driving theory test in just 3 days! Private tutoring makes ALL the difference, ladies! The exam is simpler than you think - just focus on',
						first_reply: {
							avatar: 'https://cdn.uviewui.com/uview/template/nan.png',
							nickname: 'GOOOgo',
							content: 'Just passed with 97%!'
						},
						tag_ids: ['Theory Test', 'Test', 'good lt'],
						support_count: 999,
						reply_count: 100,
						collect_count: 0,
						isLiked: false // 添加是否点赞状态
					},
					{
						id: 4,
						room_id: 2,
						avatar: 'https://cdn.uviewui.com/uview/template/niannian.jpg',
						nickname: 'StormChaser',
						test_center: 'Test Centre: xxx',
						elite: 0,
						featured: false,
						content: 'Pass your driving theory test in just 3 days! Private tutoring makes ALL the difference, ladies! The exam is simpler than you think - just focus on',
						first_reply: {},
						tag_ids: ['Theory Test', 'Test', 'good lt'],
						support_count: 999,
						reply_count: 100,
						collect_count: 0,
						isLiked: false // 添加是否点赞状态
					}
				]
			}
		},
		onShow() {
			this.getqueryPostList();
		},
		methods: {
			click(item) {
				console.log('item', item);
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
				this.activeTab = e.index;
				this.swiperCurrent = e.index;
			},

			onSwiperChange(e) {
				console.log(e.detail.current);
				this.swiperCurrent = e.detail.current;
				this.$nextTick(() => {
				    const scrollViews = this.$refs.scrollView; // 给 scroll-view 添加 ref="scrollView"
				    if (scrollViews) {
				      scrollViews.forEach(scroll => {
				        scroll.scrollTo({ scrollTop: 0, animated: false });
				      });
				    }
				  });
				this.getqueryPostList();
			},

			getqueryPostList() {
				console.log('getqueryPostList');
				const params = {
					type: this.swiperCurrent + 1,
				};
				this.$http
					.queryPostList(params)
					.then((res) => {
						if (res.code === 1) {
							// 登录成功逻辑
							console.log('操作成功', res.data.list.data);
							this.postList = res.data.list.data;
							if (res.data.list.data.length > 0 ){
								this.nodata = false;
							}else{
								this.nodata = true;
							}
						} else {
							// 登录失败（业务错误）
							console.log('操作失败', res.msg);
						}
					});
			}

		},
	};
</script>

<style lang="scss" scoped>
	.container {
		background-color: #F7F7F7;
		background: #F7F7F7;
		height: 100%;
		/* 让容器占满屏幕 */
		overflow: hidden;
		/* 防止容器自身滚动 */
	}
	
	.swiper-item {
	  background-color: #F7F7F7; /* 和容器背景一致 */
	  overflow: hidden; /* 防止内部内容溢出 */
	}

	.content-wrapper {
		flex: 1;
		padding: 20rpx;
		box-sizing: border-box;
		height: 100%;
		
	}
	
	.swiper-container {
	  will-change: transform;
	}

	.publish-btn {
		position: fixed; // 固定定位，相对于视窗
		right: 30rpx; // 距离右侧30rpx
		bottom: 80rpx; // 距离底部30rpx（如果有底部导航栏，可适当增大）
		width: 100rpx; // 按钮宽度
		height: 100rpx; // 按钮高度（与宽度一致实现圆形）
		border-radius: 50%; // 圆角50%实现圆形
		background-color: #419FFF; // 按钮背景色（可根据需求修改）
		display: flex;
		justify-content: center;
		align-items: center;
		box-shadow: 0 4rpx 12rpx rgba(65, 159, 255, 0.3); // 添加阴影增强立体感
		z-index: 999; // 确保按钮在其他内容上方
	}

	.content-detail {
		padding-left: 80rpx;
	}

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

		.post-images-uimage {
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
</style>