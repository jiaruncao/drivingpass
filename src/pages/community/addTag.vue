<template>
	<view class="container">
		<u-navbar leftText="Link test center" :safeAreaInsetTop="true" :autoBack="true">
			<view class="u-nav-slot" slot="right" @click="completeAddTag()">
				<text>Completed</text>
			</view>
		</u-navbar>

		<view class="content" :style="{ paddingTop: safeAreaTop + 'rpx' }">
			<!-- 已选标签 -->
			<view class="section tn-padding-sm">
				<text class="section-title">Selected Tags</text>
				<view class="selected-tags">
					<view class="tag-item selected" v-for="(item, index) in selectedTags" :key="item.id">
						<text class="tag-text">#{{ item.tag }}</text>
						<u-icon name="close" size="14" color="#999" class="tag-close"
							@click="removeTag(index)"></u-icon>
					</view>
					<view class="add-tag-btn tn-flex tn-flex-col-center tn-flex-row-center"
						@click="showTagDialog = true">
						+ Add
					</view>
				</view>
			</view>

			<!-- 热门标签 -->
			<view class="section tn-padding-sm">
				<text class="section-title">Trending Tags</text>
				<view class="tag-list">
					<view class="tag-item" v-for="(item, index) in trendingTags" :key="item.id"
						:class="{ active: isTagSelected(item.id) }" @click="toggleTag(item.id)">
						<text class="tag-text">{{ item.tag }}</text>
					</view>
				</view>
			</view>

			<!-- 添加标签弹窗 -->
			<u-popup :show="showTagDialog" mode="center" width="80%">
				<view class="dialog-content">
					<text class="dialog-title">Add New Tag</text>
					<u-input v-model="newTag" placeholder="Enter tag name" class="tag-input"></u-input>
					<view class="dialog-buttons">
						<u-button class="dialog-btn" type="primary" @click="addNewTag">
							Confirm
						</u-button>
						<u-button class="dialog-btn" @click="showTagDialog = false">
							Cancel
						</u-button>
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
				selectedTags: [{
					"id": 4,
					"tag": "License Reveal"
				}],
				trendingTags: [{
						"id": 4,
						"tag": "License Reveal"
					},
					{
						"id": 3,
						"tag": "Driving Journal"
					},
					{
						"id": 2,
						"tag": "Theory Test"
					}
				],
				newTag: '',
				showTagDialog: false
			};
		},
		onLoad(options){
			this.selectedTags = JSON.parse(decodeURIComponent(options.tags));
			this.queryTags();
		},
		methods: {
			// 检查标签是否被选中
			isTagSelected(tagId) {
				return this.selectedTags.some(tag => tag.id === tagId);
			},

			// 移除已选标签
			removeTag(index) {
				this.selectedTags.splice(index, 1);
			},
			
			

			// 切换热门标签选中状态
			toggleTag(tagId) {
				const isSelected = this.isTagSelected(tagId);

				if (isSelected) {
					// 移除已选中的标签
					this.selectedTags = this.selectedTags.filter(tag => tag.id !== tagId);
				} else {
					// 添加未选中的标签
					const tagToAdd = this.trendingTags.find(tag => tag.id === tagId);
					if (tagToAdd) {
						this.selectedTags.push(tagToAdd);
					}
				}
			},

			completeAddTag() {
				uni.$emit('communityTagSelectBack',{data: this.selectedTags});
				uni.navigateBack();
			},
			
			async queryTags(){
				try {
					const params = {
						
					};
					const res = await this.$http.addTags(params);
					// 处理返回结果
					if (res.code === this.$http.STATUS_OK) {
						console.log('成功', res.data.list);
						this.trendingTags = res.data.list;
					} else {
						// 登录失败（业务错误）
						console.log('操作失败', res.msg);
						uni.showToast({
							title: res.msg || '登录失败',
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('登录请求异常', error);
					uni.showToast({
						title: '网络异常，请稍后再试',
						icon: 'none'
					});
				}
			},
			
			async addNewTag() {
				const tagName = this.newTag.trim();
				if (!tagName) return;
				
				// 检查标签是否已存在
				const tagExists = this.selectedTags.some(tag => tag.tag === tagName);
				if (tagExists) {
					uni.showToast({
						title: 'Tag already exists',
						icon: 'none'
					});
					return;
				}
				
				
				const allTags = [...this.selectedTags, ...this.trendingTags];
				const maxId = allTags.length > 0 ?
					Math.max(...allTags.map(tag => tag.id)) :
					0;
				
				// 添加新标签
				this.selectedTags.push({
					id: maxId + 1,
					tag: tagName
				});
				
				this.newTag = '';
				this.showTagDialog = false;
				
				
				try {
					const params = {
						tag: tagName,
					};
					const res = await this.$http.addTags(params);
					// 处理返回结果
					if (res.code === this.$http.STATUS_OK) {
						console.log('登录成功', res.data);
						
					} else {
						// 登录失败（业务错误）
						console.log('操作失败', res.msg);
						uni.showToast({
							title: res.msg || '登录失败',
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('登录请求异常', error);
					uni.showToast({
						title: '网络异常，请稍后再试',
						icon: 'none'
					});
				}
			}
			
		}
	};
</script>

<style>
	.container {
		flex: 1;
		background-color: #fff;
	}

	.content {
		margin-top: 64px;
	}

	.section {
		margin-bottom: 30rpx;
	}

	.section-title {
		font-size: 28rpx;
		color: #999;
		margin-bottom: 16rpx;
		display: block;
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
	}

	.tag-item.selected {
		background-color: #e6f7ff;
		border-color: #91d5ff;
	}

	.tag-text {
		font-size: 24rpx;
		margin-right: 8rpx;
	}

	.tag-close {
		margin-left: 8rpx;
	}

	.add-tag-btn {
		width: 124rpx;
		height: 60rpx;
		background: #FFFFFF;
		color: #419FFF;
		border-radius: 24px;
		border: 1rpx solid #419FFF;
		padding: 0 20rpx;
		margin-bottom: 16rpx;
	}

	/* 热门标签样式 */
	.tag-list {
		display: flex;
		flex-wrap: wrap;
	}

	.tag-item.active {
		background-color: #e6f7ff;
		border-color: #91d5ff;
	}

	/* 弹窗样式 */
	.dialog-content {
		padding: 30rpx;
		background-color: #fff;
		border-radius: 16rpx;
	}

	.dialog-title {
		font-size: 32rpx;
		font-weight: bold;
		margin-bottom: 20rpx;
		display: block;
	}

	.tag-input {
		margin-bottom: 20rpx;
	}

	.dialog-buttons {
		display: flex;
		justify-content: space-around;
	}

	.dialog-btn {
		width: 45%;
	}
</style>