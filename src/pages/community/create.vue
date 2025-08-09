<template>
	<view class="container">
		<view class="tn-flex tn-flex-direction-row tn-flex-row-between tn-flex-col-center tn-flex-row-center"
			style="margin-bottom: 48rpx;" :style="{ paddingTop: safeAreaTop + 'rpx' }">
			<view @click="handleBack" class="tn-flex tn-flex-direction-row">
				<u-icon name="arrow-leftward" size="24" color="#333"></u-icon>
				<text class="nav-title tn-padding-left-xs">Exam Analysis</text>
			</view>
			<view>
				<u-button type="primary" text="Post" shape="circle" size="small"></u-button>
			</view>
		</view>


		<!-- 内容区域 -->
		<view class="content tn-padding-sm">
			<!-- 图片和视频上传 -->
			<view class="upload-section">
				<view class="image-list">
					<view class="image-item" v-for="(img, index) in selectedPhotos" :key="index">
						<image :src="img" width="100%" height="100%" mode="aspectFill"></u--image>
							<!-- 删除按钮 -->
							<u-icon name="close-circle" size="20" color="#fff" class="delete-btn"
								@click="deleteImage(index)"></u-icon>
					</view>
					<view class="image-item-add" @click="handleAddPhoto" v-if="selectedPhotos.length < 9">
						<image src="/static/community/create_pic.png" class="image-item-addIcon"></image>
						<text>Add Photo</text>
					</view>
					<view class="image-item-add" @click="handleAddVideo">
						<image src="/static/community/create_vedio.png" class="image-item-addIcon"></image>
						<!-- 	<u-icon name="video" size="22" color="#999"></u-icon> -->
						<text>Add Video</text>
					</view>
				</view>
			</view>

			<!-- 文本输入 -->
			<view class="text-section">
				<textarea v-model="content"
					placeholder="Share your driving tips & experiences!\nPosts with 50+ words get priority recommendation!"
					maxlength="-1" class="tn-padding-xs"></textarea>
			</view>

			<u-line color="#f5f5f5"></u-line>

			<!-- 关联考试中心 -->
			<view class="link-section" @click="handleLinkTestCenter">
				<view class="tn-flex-direction-row tn-flex">
					<u-image src="/static/community/create_link.png" width="24px" height="24px"
						@click="click"></u-image>
					<text class="tn-padding-left-sm">Link test center</text>
				</view>
				<u-icon name="arrow-right" size="12" color="#999"></u-icon>
			</view>
			<view class="linkDetai" v-if="textCenter.id">
				<view class="tn-flex tn-flex-row-between tn-flex-col-center tn-flex-row-center">
					<view class="tn-flex tn-flex-direction-row">
						<image :src="textCenter.cover_image" style="height: 123rpx; width: 180.8rpx;"
							class="tn-padding-xs"></image>
						<view class="tn-flex tn-flex-direction-column tn-flex-col-center tn-flex-row-center">
							<text
								class="tn-padding-left-sm tn-flex-col-center tn-flex-row-center tn-flex">{{textCenter.name}}</text>
							<text
								class="tn-padding-left-sm tn-flex-col-center tn-flex-row-center tn-flex">{{textCenter.contents}}</text>
						</view>
					</view>
					<view class="tn-flex">
						<image src="/static/community/community_link_close.png" style="width: 28rpx; height: 28rpx;"
							class="tn-padding-right-sm" @click="deleteTest()"></image>
					</view>
				</view>
			</view>

			<!-- 添加标签 -->
			<view class="tag-section" @click="handleAddTags">
				<view class="tn-flex-direction-row tn-flex">
					<u-image src="/static/community/create_tag.png" width="24px" height="24px" @click="click"></u-image>
					<text class="tn-padding-left-sm">Add Tag</text>
				</view>
				<u-icon name="arrow-right" size="12" color="#999"></u-icon>
			</view>

			<view class="selected-tags">
				<view class="tag-item selected" v-for="(item ,index) in selectedTags" :key="item.id">
					<text class="tag-text"># {{ item.tag }}</text>
					<u-icon name="close" size="13" color="#419FFF"
						class="tag-close tn-flex tn-padding-left-xs tn-padding-right-xs"
						@click="removeTag(index)"></u-icon>
				</view>
			</view>


		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				content: '', // 文本内容
				selectedTestCenter: '', // 关联的考试中心
				selectedTags: [], // 选中的标签
				selectedPhotos: [], // 已选图片列表（支持多张）
				src: '', // 图片占位符
				selectedVideo: '', // 选中的视频
				tags: [],
				textCenter: {
					
				},
			};
		},
			
		onShow() {
			uni.$on('centerSelectBack', (event)=> {
				console.log('data =====',event.data);
				this.textCenter = event.data;
			});
			
			uni.$on('communityTagSelectBack', (event)=> {
				console.log('communityTagSelectBack =====',event.data);
				this.selectedTags = event.data;
			});
		},
		methods: {
			handleBack() {
				uni.navigateBack();
			},
			// 处理添加图片
			handleAddPhoto() {
				const maxCount = 9 - this.selectedPhotos.length;
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: (res) => {
						// 将新选择的图片添加到列表
						this.selectedPhotos = [...this.selectedPhotos, ...res.tempFilePaths];
					}
				});
			},
			removeTag(index) {
				this.selectedTags.splice(index, 1);
			},
			// 删除图片
			deleteImage(index) {
				this.selectedPhotos.splice(index, 1);
			},
			// 处理添加视频
			handleAddVideo() {
				uni.chooseVideo({
					sourceType: ['album', 'camera'],
					maxDuration: 60,
					camera: 'back',
					success: (res) => {
						this.selectedVideo = res.tempFilePath;
					}
				});
			},
			// 处理关联考试中心
			handleLinkTestCenter() {
				// 这里可以跳转到选择考试中心的页面
				// 假设选择后返回结果
				this.selectedTestCenter = 'Test Center A';
				uni.navigateTo({
					url: '/pages/community/centerSelect'
				});
			},
			// 处理添加标签
			handleAddTags() {
				// 这里可以跳转到选择标签的页面
				// 假设选择后返回结果
				uni.navigateTo({
					url: `/pages/community/addTag?tags=${encodeURIComponent(JSON.stringify(this.selectedTags))}`
				});
			},
			deleteTest() {
				this.textCenter = {};
			},
			// 处理发布
			handlePost() {
				const postData = {
					content: this.content,
					testCenter: this.selectedTestCenter,
					tags: this.selectedTags,
					photos: this.selectedPhotos, // 提交多张图片
					video: this.selectedVideo
				};
				console.log('发布内容：', postData);
				// 这里可以将数据提交到服务器
				uni.showToast({
					title: '发布成功',
					icon: 'success'
				});
			},
			
			
			
			async createPostRequest() {
				try {
					// 准备登录参数
					const params = {
						content: this.content,
						room_id: this.textCenter.id,
						tag_ids: this.selectedTags,
						photo_url: this.selectedPhotos,
						video_url: this.selectedVideo,
                        ip:'',
					};
			
					// 调用community模块的userLogin接口
					const res = await this.$http.createPost(params);
			
					// 处理返回结果
					if (res.code === this.$http.STATUS_OK) {
						// 登录成功逻辑
						console.log('操作成功', res.data);
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

<style scoped>
	.container {
		flex: 1;
		background-color: #fff;
		padding: 40rpx 30rpx;
		overflow: hidden;
	}

	.upload-section {
		display: flex;
		margin-bottom: 40rpx;
	}

	.content {
		margin-top: 64rpx;
	}

	.upload-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 200rpx;
		height: 200rpx;
		margin-right: 20rpx;
		background-color: #f5f5f5;
		border-radius: 10rpx;
	}

	/* 已选图片列表 */
	.image-list {
		display: flex;
		flex-wrap: wrap;
		gap: 20rpx;
	}

	/* 单张图片容器 */
	.image-item {
		width: 200rpx;
		height: 200rpx;
		border-radius: 10rpx;
		position: relative;
		/* 用于删除按钮定位 */
		overflow: hidden;
		/* 防止图片溢出 */
	}

	.linkDetai {
		background: #ECF5FF;
		border-radius: 8rpx;
		border: 1rpx solid #419FFF
	}

	.image-item-add {
		width: 200rpx;
		height: 200rpx;
		border-radius: 10rpx;
		position: relative;
		/* 用于删除按钮定位 */
		overflow: hidden;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background-color: #f5f5f5;

		font-family: Microsoft YaHei UI;
		font-weight: 400;
		font-size: 24rpx;
		color: #999999;
	}

	.image-item-addIcon {
		width: 43rpx;
		height: 43rpx;
	}


	/* 删除按钮 */
	.delete-btn {
		position: absolute;
		top: -5rpx;
		right: -5rpx;
		background-color: rgba(255, 0, 0, 0.7);
		border-radius: 50%;
	}


	.upload-item text {
		margin-top: 10rpx;
		color: #999;
	}

	.text-section {
		margin-bottom: 40rpx;
	}

	.text-section textarea {
		width: 98%;
		height: 200rpx;
		border-radius: 10rpx;
	}


	.link-section,
	.tag-section {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20rpx 0;


		font-family: Microsoft YaHei UI;
		font-weight: 400;
		font-size: 28rpx;
		color: #333333;
	}

	/* 已选标签样式 */
	.selected-tags {
		display: flex;
		flex-wrap: wrap;
	}

	.tag-item {
		display: flex;
		align-items: center;
		background-color: #fff;
		border: 1px solid #ddd;
		border-radius: 30rpx;
		padding: 8rpx 16rpx;
		margin-right: 16rpx;
		margin-bottom: 16rpx;

		font-family: Microsoft YaHei UI;
		font-weight: 400;
		font-size: 24rpx;
		color: #419FFF;
	}

	.tag-item.selected {
		background: #ECF5FF;
		border-radius: 24rpx;
		border: 1rpx solid #419FFF;
	}
</style>