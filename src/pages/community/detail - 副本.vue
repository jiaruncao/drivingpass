<template>
	<view class="container">
		<u-navbar :safeAreaInsetTop="true" :autoBack="true">
			<view class="u-nav-slot" slot="left">
				<view class="tn-flex-direction-row tn-flex tn-flex-center tn-flex-col-center ">
					<u-icon name="arrow-leftward" size="24" color="#333"></u-icon>
					<u-avatar size="60rpx" shape="circle" class="tn-margin-left-xs"></u-avatar>
					<text class="tn-margin-left-xs nav-title">user Profile</text>
				</view>
			</view>
			<view class="u-nav-slot" slot="right">
				<view class="tn-flex-direction-row tn-flex tn-flex-col-center  tn-flex-center">
					<u-button type="primary" :plain="true" text="Follow" shape="circle" size="small"></u-button>
					<image src="/static/community/community_navShare.png" style="width: 33rpx; height: 33rpx;"
						class="tn-flex tn-margin-left-sm " @click="sharePop()"></image>
				</view>
			</view>
		</u-navbar>

		<!-- 帖子内容 -->
		<view class="post-card tn-padding-sm">
			<u-swiper :list="post.file_url" indicator indicatorMode="dot" circular style="height: 665rpx;"
				indicatorActiveColor="#419FFF" indicatorInactiveColor="#D7D7D7"></u-swiper>

			<!-- 精华标签 -->
			<view class="elite-badge tn-flex tn-flex-direction-row tn-flex-col-center tn-flex-center"
				style="background-color: red;" v-if="post.elite == 2">
				<image src="/static/community/community_jingxuan.png" style="width: 104rpx; height: 42rpx;"
					class="tn-flex tn-padding-left-sx"></image>
				<text class="elite-desc tn-flex tn-flex-col-center tn-flex-row-center">此条内容被收录为精华内容</text>
			</view>

			<!-- 帖子正文 -->
			<view class="post-content">
				<text class="content-text">{{ post.content }}</text>
				<!-- 标签 -->
				<view class="tags">
					<text class="tag" v-for="(tag, index) in post.tag_ids" :key="index">#{{ tag }}</text>
				</view>
				<!-- 发布信息 -->
				<view class="post-info">
					<text>{{ post.days_ago }} days ago IP Location: </text>
					<image src="/static/community/community_more.png" style="width: 40rpx; height: 8rpx;"
						class="tn-flex tn-margin-right-sm"></image>
				</view>
			</view>
		</view>

		<view class="post-sectionBg"></view>

		<!-- 评论区 -->
		<view class="comment-section tn-padding-left-sm tn-padding-right-sm">
			<view class="comment-header">
				<text class="comment-title">全部回复 · {{ post.reply_count }}</text>
			</view>

			<!-- 评论列表 -->
			<view class="comment-list">
				<view class="comment-item" v-for="(comment, index) in post.reply" :key="index">
					<u-avatar class="comment-avatar" size="40" :src="comment.avator"></u-avatar>
					<view class="comment-content" @click="pupClick(comment)">
						<text class="comment-username">{{ comment.nickname }}</text>
						<text class="comment-text">{{ comment.content }}</text>
						<view class="comment-footer">
							<text class="comment-test-center">Test Centre: {{ comment.testCenter }}</text>
							<view class="comment-interaction">
								<text class="comment-like" @click="likeComment(index)"
									:style="comment.liked ? { color: '#419FFF' } : { color: '#999999' }">{{ comment.support_count }}</text>
								<u-icon class="like-icon" :name="comment.liked ? 'thumb-up-fill' : 'thumb-up'" size="18"
									:color="comment.liked ? '#419FFF' : '#999999'"></u-icon>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 评论输入框 -->
		<view class="comment-input-section tn-flex tn-flex-row-between">
			<view
				class="tn-flex tn-flex-direction-row tn-flex tn-padding-left-sm comment-input-bg tn-flex-6 tn-flex-col-center tn-flex-row-center">
				<image src="/static/community/community_write.png" style="width: 28rpx; height: 28rpx;"></image>
				<u--textarea class="comment-input" style="background-color: #F7F7F7;" v-model="commentInput" placeholder="Say something..."
					autoHeight :maxHeight="400" @input="adjustInputHeight" adjustPosition="true" @confirm="addComment"/>
			</view>
			<view class="tn-padding-left-sm tn-flex-4">
				<view class="tn-flex-direction-row tn-flex tn-padding-left-sx">
					<view class="tn-flex tn-flex-direction-column tn-flex-1 tn-flex-col-center" @click="toggleLike">
						<u-icon :name="post.liked ? 'thumb-up-fill' : 'thumb-up'" size="24"
							:color="post.liked ? '#419FFF' : '#666'"></u-icon>
						<text class="action-text">{{ post.support_count }}</text>
					</view>
					<view class="tn-flex tn-flex-direction-column tn-flex-1 tn-flex-col-center" @click="toggleCollect">
						<u-icon :name="post.collected ? 'star-fill' : 'star'" size="24"
							:color="post.collected ? '#FF9900' : '#666'"></u-icon>
						<text class="action-text">{{ post.collect_count }}</text>
					</view>
					<view class="tn-flex tn-flex-direction-column tn-flex-1 tn-flex-col-center tn-flex-row-center">
						<image src="/static/community/community_comment.png" style="width: 36rpx; height: 36rpx;"
							class="tn-padding-top-xs"></image>
						<text class="action-text">{{post.reply_count}}</text>
					</view>
				</view>
			</view>
		</view>

		<view>
			<u-action-sheet :actions="popList" :closeOnClickOverlay="true" :closeOnClickAction="true" :title="poptitle"
				:show="popshow" cancelText="Cancel" @cancel="onCancel" @select="selectClick"
				@close="close"></u-action-sheet>
		</view>

		<view>
			<u-popup :show="shareshow" @close="shareclose" @open="shareopen">
				<view class="tn-flex tn-flex-direction-column" style="width: 100%; background-color: #F7F7F7;">
					<view class="tn-flex tn-flex-direction-row tn-padding-top-sm tn-padding-bottom-sm">
						<view class="tn-flex tn-flex-col-center tn-flex-row-center tn-flex-direction-column" style="width: 25%;" @click="shareClick('Instagram')">
							<image src="/static/share/share_instagram.png" class="share-item-image"></image>
							<text class="share-item-text">Instagram</text>
						</view>
						<view class="tn-flex tn-flex-col-center tn-flex-row-center tn-flex-direction-column" style="width: 25%;" @click="shareClick('Tiktok')">
							<image src="/static/share/share_tiktok.png" class="share-item-image"></image>
							<text class="share-item-text">Tiktok</text>
						</view>
						<view class="tn-flex tn-flex-col-center tn-flex-row-center tn-flex-direction-column" style="width: 25%;" @click="shareClick('Facebook')">
							<image src="/static/share/share_facebook.png" class="share-item-image"></image>
							<text class="share-item-text">Facebook</text>
						</view>
						<view class="tn-flex tn-flex-col-center tn-flex-row-center tn-flex-direction-column" style="width: 25%;" @click="shareClick('Whatsapp')">
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
				post: {
					id: 3,
					elite: 2,
					file_url: [
						'https://img1.baidu.com/it/u=2172818577,3783888802&fm=253&app=138&f=JPEG?w=800&h=1422',
						'https://img1.baidu.com/it/u=2172818577,3783888802&fm=253&app=138&f=JPEG?w=800&h=1422',
						'https://img1.baidu.com/it/u=2172818577,3783888802&fm=253&app=138&f=JPEG?w=800&h=1422'
					],
					content: 'Pass your driving theory test in just 3 days! Private tutoring makes ALL the difference, ladies! The exam is simpler than you think.',
					tag_ids: ['Theory Test', 'Test', 'good luck'],
					days_ago: '5',
					location: 'XXX',
					reply_count: 2,
					support_count: 999, // 帖子点赞数
					liked: false, // 帖子点赞状态
					collect_count: 31, // 帖子收藏数
					collected: false, // 帖子收藏状态，
					reply: [{
						    id: 3,
							avatar: 'https://via.placeholder.com/40',
							nickname: 'StormChaser',
							content: 'Catch the good luck!',
							testCenter: 'xxx',
							support_count: '999',
							liked: false
						},
						{
							id: 3,
							avatar: 'https://via.placeholder.com/40',
							nickname: 'StormChaser',
							content: 'Catch the good luck!',
							testCenter: 'xxx',
							support_count: '999',
							liked: false,
						}
					]
				},
				popshow: false,
				shareshow: false,
				poptitle: '',
				popList: [{
						name: 'Copy',
						color: '#333333',
					},
					{
						name: 'Replay',
						color: '#333333',
					},
					{
						name: 'Report',
						color: '#E30000',
					}
				],
				textareaHeight: 60 ,// 初始高度
				post_id : 4,
				commentInput: '',
			};
		},
		onLoad(option) {
			this.post_id = option.post_id;
			this.getqueryPostDetail();
		},
		methods: {
			async likeComment(index) {
				const comment = this.post.reply[index];
				if (comment.liked) {
					comment.likes--;
				} else {
					comment.likes++;
				}
				comment.liked = !comment.liked;
				
				try {
					// 准备登录参数
					const params = {
						post_id: this.post_id,
						reply_id: comment.id,
					};
							
					// 调用community模块的userLogin接口
					const res = await this.$http.supportReply(params);
							
					// 处理返回结果
					if (res.code === this.$http.STATUS_OK) {
						// 登录成功逻辑
						console.log('操作成功', res.data);
						uni.showToast({
							title: '操作成功',
							icon: 'success'
						});
						this.post.liked = !this.post.liked;
					} else {
						// 登录失败（业务错误）
						console.log('操作失败', res.msg);
						uni.showToast({
							title: res.msg || '操作失败',
							icon: 'none'
						});
					}
				} catch (error) {
					// 捕获异常（网络错误等）
					console.error('登录请求异常', error);
					uni.showToast({
						title: '网络异常，请稍后再试',
						icon: 'none'
					});
				}
			},
			adjustInputHeight(e) {
				// 可以在这里根据内容长度动态调整高度限制
				// 实际使用中，u--textarea的autoHeight已经能自动处理高度变化
			},
			async toggleLike() {
				if (this.post.liked) {
					// 已点赞：取消点赞，数量减1
					this.post.likes--;
				} else {
					// 未点赞：点赞，数量加1
					this.post.likes++;
				}
				// 切换点赞状态
				this.post.liked = !this.post.liked;
				try {
					// 准备登录参数
					const params = {
						post_id: this.post_id
					};
							
					// 调用community模块的userLogin接口
					const res = await this.$http.supportPost(params);
							
					// 处理返回结果
					if (res.code === this.$http.STATUS_OK) {
						// 登录成功逻辑
						console.log('操作成功', res.data);
						uni.showToast({
							title: '操作成功',
							icon: 'success'
						});
						this.post.liked = !this.post.liked;
					} else {
						// 登录失败（业务错误）
						console.log('操作失败', res.msg);
						uni.showToast({
							title: res.msg || '操作失败',
							icon: 'none'
						});
					}
				} catch (error) {
					// 捕获异常（网络错误等）
					console.error('登录请求异常', error);
					uni.showToast({
						title: '网络异常，请稍后再试',
						icon: 'none'
					});
				}
			},
			
			async addComment(){
				try {
					// 准备登录参数
					const params = {
						post_id: this.post_id,
						content: this.commentInput,
					};
							
					// 调用community模块的userLogin接口
					const res = await this.$http.collectPost(params);
							
					// 处理返回结果
					if (res.code === this.$http.STATUS_OK) {
						// 登录成功逻辑
						console.log('操作成功', res.data);
						uni.showToast({
							title: '操作成功',
							icon: 'success'
						});
						this.getqueryPostDetail();
					} else {
						// 登录失败（业务错误）
						console.log('操作失败', res.msg);
						uni.showToast({
							title: res.msg || '操作失败',
							icon: 'none'
						});
					}
				} catch (error) {
					// 捕获异常（网络错误等）
					console.error('登录请求异常', error);
					uni.showToast({
						title: '网络异常，请稍后再试',
						icon: 'none'
					});
				}
			},

			// 帖子收藏功能
			async toggleCollect() {
				if (this.post.collected) {
					// 已收藏：取消收藏，数量减1
					this.post.collects--;
				} else {
					// 未收藏：收藏，数量加1
					this.post.collects++;
				}
				// 切换收藏状态
				this.post.collected = !this.post.collected;
				
				try {
					// 准备登录参数
					const params = {
						post_id: this.post_id
					};
							
					// 调用community模块的userLogin接口
					const res = await this.$http.collectPost(params);
							
					// 处理返回结果
					if (res.code === this.$http.STATUS_OK) {
						// 登录成功逻辑
						console.log('操作成功', res.data);
						uni.showToast({
							title: '操作成功',
							icon: 'success'
						});
						this.post.collected = !this.post.collected;
					} else {
						// 登录失败（业务错误）
						console.log('操作失败', res.msg);
						uni.showToast({
							title: res.msg || '操作失败',
							icon: 'none'
						});
					}
				} catch (error) {
					// 捕获异常（网络错误等）
					console.error('登录请求异常', error);
					uni.showToast({
						title: '网络异常，请稍后再试',
						icon: 'none'
					});
				}
			},
			
			
			pupClick(comment) {
				this.poptitle = comment.username + ': ' + comment.content;
				this.popshow = true;
			},

			onCancel() {
				// 处理取消按钮点击事件
				this.popshow = false;
			},

			close() {
				this.popshow = false;
			},

			selectClick(index) {
				this.popshow = false;
			},
			
			shareClick(item){
				this.shareshow = false;
			},
			
			shareclose(){
				this.shareshow = false;
			},
			
			sharePop(){
				this.shareshow = true;
			},
			
			
			async getqueryPostDetail() {
				try {
					// 准备登录参数
					const params = {
						post_id: this.post_id
					};
			
					// 调用community模块的userLogin接口
					const res = await this.$http.queryPostDetail(params);
			
					// 处理返回结果
					if (res.code === this.$http.STATUS_OK) {
						// 登录成功逻辑
						console.log('操作成功', res.data);
						this.post = res.data.detail;
						this.post.reply = res.data.reply;
						uni.showToast({
							title: '操作成功',
							icon: 'success'
						});
						//this.followList[index].followed = !this.followList[index].followed;
					} else {
						// 登录失败（业务错误）
						console.log('操作失败', res.msg);
						uni.showToast({
							title: res.msg || '操作失败',
							icon: 'none'
						});
					}
				} catch (error) {
					// 捕获异常（网络错误等）
					console.error('登录请求异常', error);
					uni.showToast({
						title: '网络异常，请稍后再试',
						icon: 'none'
					});
				}
			},
		}
	};
</script>

<style>
	.container {
		flex: 1;
		background-color: #fff;
		padding-bottom: 80rpx;
		/* 为底部输入区预留空间 */
	}

	.nav-title {
		font-family: Microsoft YaHei UI;
		font-weight: 400;
		font-size: 28rpx;
		color: #333333;
	}

	/* 帖子卡片样式 */
	.post-card {
		background-color: #fff;
		border-radius: 12rpx;
		margin-bottom: 16rpx;
	}

	.post-image {
		width: 100%;
		border-radius: 8rpx;
		margin-bottom: 16rpx;
	}

	.elite-badge {
		background: linear-gradient(47deg, #F7CB6B 0%, #FBA980 100%);
		border-radius: 12rpx;
		padding: 8rpx;
		margin-bottom: 16rpx;
	}

	.elite-desc {
		font-family: Microsoft YaHei UI;
		font-weight: bold;
		font-size: 26rpx;
		color: #FFFFFF;
	}

	.content-text {
		font-family: Microsoft YaHei UI;
		font-weight: 400;
		font-size: 32rpx;
		color: #333333;
		margin-bottom: 16rpx;
		display: block;
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		margin-bottom: 16rpx;
	}

	.tag {
		font-family: Microsoft YaHei UI;
		font-weight: 400;
		font-size: 20rpx;
		color: #999999;
		background: #F7F7F7;
		border-radius: 24rpx;
		padding: 4rpx 12rpx;
		margin-right: 12rpx;
		margin-bottom: 8rpx;
	}

	.post-info {
		display: flex;
		justify-content: space-between;
		font-size: 24rpx;
		color: #999;
	}

	.post-sectionBg {
		width: 100%;
		height: 20rpx;
		background: #F7F7F7;
	}

	/* 评论区样式 */
	.comment-section {
		background-color: #fff;
		border-radius: 12rpx;
		padding: 16rpx;
	}

	.comment-header {
		margin-bottom: 16rpx;
	}

	.comment-title {
		font-size: 28rpx;
		color: #333;
		font-family: Microsoft YaHei UI;
		font-weight: 400;
	}

	.comment-list {
		margin-bottom: 16rpx;
	}

	.comment-item {
		display: flex;
		margin-bottom: 16rpx;
	}

	.comment-avatar {
		margin-right: 12rpx;
	}

	.comment-content {
		flex: 1;
	}

	.comment-username {
		font-family: Microsoft YaHei UI;
		font-weight: 400;
		font-size: 26rpx;
		color: #999999;
		margin-bottom: 4rpx;
		display: block;
	}

	.comment-text {
		font-weight: 400;
		font-size: 28rpx;
		color: #333333;
		margin-bottom: 8rpx;
		display: block;
	}

	.comment-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.comment-test-center {
		font-family: Microsoft YaHei UI;
		font-weight: 400;
		font-size: 20rpx;
		color: #999999;
	}

	.comment-interaction {
		display: flex;
		align-items: center;
	}

	.comment-like {
		font-size: 24rpx;
		color: #666;
		margin-right: 8rpx;
	}

	.like-icon {
		margin-right: 4rpx;
	}

	/* 评论输入框样式 - 关键修改部分 */
	.comment-input-section {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		background-color: white;
	}

	.comment-input {
		flex: 1;
		min-height: 60rpx;
		/* 最小高度 */
		max-height: 500rpx;
		/* 最大高度，超过则滚动 */
		margin-right: 16rpx;
		/* 优化行高 */
		overflow-y: auto;
		/* 关键：超过最大高度时显示垂直滚动条 */
		/* 可选：移除默认滚动条样式（根据需求保留） */
		scrollbar-width: thin;
		/* 细滚动条（兼容Firefox） */
	}

	.comment-input::-webkit-scrollbar {
		width: 4rpx;
		/* 滚动条宽度 */
	}

	.comment-input::-webkit-scrollbar-thumb {
		background-color: #ddd;
		/* 滚动条滑块颜色 */
		border-radius: 2rpx;
		/* 滑块圆角 */
	}

	.comment-input-bg {
		background-color: #F7F7F7;
		border-radius: 32rpx;
		/* 增加内边距 */
	}

	.action-text {
		font-size: 24rpx;
		color: #666;
		margin: 0 8rpx;
	}

	::v-deep .u-action-sheet__item:nth-last-child(2) {
		color: #ff4d4f !important;
	}

	/* 可选：调整取消按钮样式 */
	::v-deep .u-action-sheet__cancel {
		margin-top: 10rpx;
		font-weight: normal;
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
	
	.cancelBottom{
	  background: #FFFFFF;	
	  font-family: Microsoft YaHei UI;
	  font-weight: 400;
	  font-size: 28rpx;
	  color: #333333;
	  height: 93rpx;
	}
</style>