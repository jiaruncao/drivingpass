<template>
  <view class="app">
    <view class="gradient-bg">
      <view class="gradient-top"></view>
      <view class="gradient-bottom"></view>
    </view>

    <!-- 顶部标签切换 -->
    <view class="tabs-header">
      <view class="tabs-container">
        <view class="tab-button" :class="{active: activeTab === 'followed'}" @tap="switchTab('followed')">
          Followed
        </view>
        <view class="tab-button" :class="{active: activeTab === 'discover'}" @tap="switchTab('discover')">
          Discover
        </view>
      </view>
    </view>

    <!-- 分类筛选 -->
    <scroll-view class="categories-scroll" scroll-x>
      <view class="categories-container">
        <view v-for="category in categories" :key="category.id" class="category-chip"
          :class="{active: selectedCategory === category.id}" @tap="selectCategory(category.id)">
          <text class="category-icon">{{ category.icon }}</text>
          <text>{{ category.name }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 主内容容器 -->
    <scroll-view class="container" scroll-y @scrolltolower="loadMorePosts" :lower-threshold="100">

      <!-- 帖子列表 -->
      <view v-for="post in filteredPosts" :key="post.id" class="post-card">
        <!-- 用户信息头部 -->
        <view class="user-header" @click="userProfileClick">
          <view class="user-avatar">
            {{ post.avatar ? post.avatar : getInitial(post.nickname) }}
          </view>
          <view class="user-info">
            <text class="username">{{ post.nickname }}</text>
            <text class="test-centre">Test Centre: {{ post.test_center }}</text>
          </view>
        </view>

        <!-- 帖子内容 -->
        <view class="post-content">
          <text v-if="post.highlight" class="highlight-badge">{{ post.highlight }}</text>
          <text class="post-text">{{ post.content }}</text>

          <!-- 图片网格 -->
          <view v-if="post.file_url && post.file_url.length > 0" class="images-grid">
            <image v-for="(image, index) in post.file_url" :key="index" :src="image" class="post-image"
              mode="aspectFill" @tap="viewImage(image)">
            </image>
          </view>
        </view>

        <!-- 评论预览 -->
        <view v-if="post.first_reply.nickname" class="comment-preview">
          <text class="comment-text">
            <text class="comment-author">{{ post.first_reply.nickname }}:</text>
            {{ post.first_reply.content }}
          </text>
          <text v-if="post.reply_count > 1" class="view-replies-button" @tap="viewAllReplies(post.id)">
            View all replies →
          </text>
        </view>

        <!-- 标签 -->
        <view class="tags-container">
          <text v-for="tag in post.tag_ids" :key="tag" class="tag">#{{ tag }}</text>
        </view>

        <!-- 互动栏 -->
        <view class="actions-bar">
          <view class="actions-left">
            <view class="action-button" :class="{liked: post.isLiked}" @tap="toggleLike(post)">
              <view class="action-icon">
                <svg viewBox="0 0 24 24">
                  <path
                    d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </view>
              <text class="action-count">{{ post.support_count }}</text>
            </view>
            <view class="action-button" @tap="openComments(post.id)">
              <view class="action-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </view>
              <text class="action-count">{{ post.reply_count }}</text>
            </view>
          </view>
          <view class="actions-right">
            <view class="action-button share" @tap="sharePost(post.id)">
              <view class="action-icon">
                <svg viewBox="0 0 24 24">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>

              </view>
            </view>
            <view class="action-button report" @tap="reportPost(post.id)">
              <view class="action-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M3 3h18v18H3zM12 9v4M12 17h.01" />
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                </svg>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 加载更多 -->
      <view v-if="hasMorePosts && filteredPosts.length > 0" class="load-more-container">
        <text class="load-more-text">{{ isLoading ? 'Loading...' : 'Load more' }}</text>
      </view>

      <!-- 空状态 -->
      <view v-if="filteredPosts.length === 0 && !isLoading" class="empty-state">
        <view class="empty-icon">
          <image src="/static/icons/empty.svg" class="empty-icon-image"></image>
        </view>
        <text class="empty-title">No posts in this category</text>
        <text class="empty-description">Be the first to share in {{ getCategoryName(selectedCategory) }}!</text>
      </view>
    </scroll-view>

    <!-- 浮动操作按钮 -->
    <view class="floating-action-button" @tap="goToPublish">
      <text class="fab-icon">+</text>
    </view>

    <!-- 底部导航 -->
    <!-- <view class="bottom-nav">
      <view class="nav-item" @tap="navigateTo('home')">
        <view class="nav-icon">
          <image src="/static/icons/home.svg" class="nav-icon-image"></image>
        </view>
        <text class="nav-label">Home</text>
      </view>
      <view class="nav-item active">
        <view class="nav-icon">
          <image src="/static/icons/forum-active.svg" class="nav-icon-image"></image>
        </view>
        <text class="nav-label">Forum</text>
      </view>
      <view class="nav-item" @tap="navigateTo('account')">
        <view class="nav-icon">
          <image src="/static/icons/account.svg" class="nav-icon-image"></image>
        </view>
        <text class="nav-label">Account</text>
      </view>
    </view> -->
  </view>
</template>

<script>
  import {supportPost, queryPostList} from '@/http/api/community.js'
  export default {
    data() {
      return {
        activeTab: 'discover', // 当前激活的标签
        selectedCategory: 'all', // 选中的分类
        isLoading: false,
        hasMorePosts: true,
        // 分类数据
        categories: [{
            id: 'all',
            name: 'All Posts',
            icon: '🌟'
          },
          {
            id: 'theory_test',
            name: 'Theory Test',
            icon: '📝'
          },
          {
            id: 'hazard_perception',
            name: 'Hazard',
            icon: '⚠️'
          },
          {
            id: 'practical_test',
            name: 'Practical',
            icon: '🚗'
          },
          {
            id: 'tips_tricks',
            name: 'Tips',
            icon: '💡'
          },
          {
            id: 'questions',
            name: 'Questions',
            icon: '❓'
          },
          {
            id: 'success_stories',
            name: 'Passed!',
            icon: '🎉'
          },
          {
            id: 'study_groups',
            name: 'Study Groups',
            icon: '👥'
          }
        ],
        // Discover标签的帖子数据
        discoverPosts: [],
        // Followed标签的帖子数据
        followedPosts: []
      }
    },
    computed: {
      // 根据当前标签显示对应的帖子
      displayedPosts() {

        return this.activeTab === 'discover' ? this.discoverPosts : this.followedPosts;
      },
      // 根据分类筛选帖子
      filteredPosts() {
        if (this.selectedCategory === 'all') {
          console.log('this.displayedPosts', this.displayedPosts)
          return this.displayedPosts;
        }
        return this.displayedPosts.filter(post => post.category === this.selectedCategory);
      }
    },
    methods: {
      // 切换标签
      switchTab(tab) {
        this.activeTab = tab;
        console.log(`Switched to ${tab} tab`);
        this.loadTabData(tab);
      },

      // 选择分类
      selectCategory(categoryId) {
        this.selectedCategory = categoryId;
        console.log(`Selected category: ${categoryId}`);
      },

      // 获取分类名称
      getCategoryName(categoryId) {
        const category = this.categories.find(c => c.id === categoryId);
        return category ? category.name : 'All Posts';
      },

      // 获取用户名首字母
      getInitial(username) {
        return username.charAt(0).toUpperCase();
      },

      // 切换点赞状态
      toggleLike(post) {
        // post.isLiked = !post.isLiked;
        // post.support_count += post.isLiked ? 1 : -1;
        console.log(`${post.isLiked ? 'Liked' : 'Unliked'} post ${post.id}`);
        this.updateLikeStatus(post.id, post.isLiked);
      },

      // 打开评论
      openComments(postId) {
        console.log(`Opening comments for post ${postId}`);
        uni.navigateTo({
          url: `/pages/forum/postDetail?id=${postId}`
        });
      },

      // 分享帖子
      sharePost(postId) {
        console.log(`Sharing post ${postId}`);
        uni.share({
          provider: 'weixin',
          type: 0,
          title: 'UK Driving Theory Test Forum',
          summary: 'Check out this post!',
          href: `https://yourapp.com/post/${postId}`,
          success: () => {
            uni.showToast({
              title: 'Shared successfully',
              icon: 'success'
            });
          }
        });
      },

      // 举报帖子
      reportPost(postId) {
        console.log(`Reporting post ${postId}`);
        uni.showModal({
          title: 'Report Post',
          content: 'Are you sure you want to report this post?',
          success: (res) => {
            if (res.confirm) {
              this.submitReport(postId);
            }
          }
        });
      },

      // 查看所有回复
      viewAllReplies(postId) {
        console.log(`Viewing all replies for post ${postId}`);
        uni.navigateTo({
          url: `/pages/community/detail?id=${postId}`
        });
      },

      // 查看图片
      viewImage(imageUrl) {
        console.log(`Viewing image: ${imageUrl}`);
        uni.previewImage({
          current: imageUrl,
          urls: [imageUrl]
        });
      },

      // 加载更多帖子
      loadMorePosts() {
        if (this.isLoading || !this.hasMorePosts) return;

        this.isLoading = true;
        console.log('Loading more posts...');

        // 模拟API调用
        setTimeout(() => {
          const newPost = {
            id: Date.now(),
            username: 'NewUser',
            testCentre: 'Oxford',
            category: 'theory_test',
            highlight: null,
            text: 'This is a newly loaded post from the API...',
            images: [],
            topComment: null,
            replyCount: 0,
            tags: ['#New'],
            likeCount: 0,
            commentCount: 0,
            isLiked: false
          };

          if (this.activeTab === 'discover') {
            this.discoverPosts.push(newPost);
          } else {
            this.followedPosts.push(newPost);
          }

          this.isLoading = false;

          // 模拟没有更多内容
          if (this.displayedPosts.length > 10) {
            this.hasMorePosts = false;
          }
        }, 1000);
      },

      // 导航到其他页面
      navigateTo(page) {
        console.log(`Navigating to ${page}`);
        switch (page) {
          case 'home':
            uni.switchTab({
              url: '/pages/index/index'
            });
            break;
          case 'forum':
            // 当前页面
            break;
          case 'account':
            uni.switchTab({
              url: '/pages/account/account'
            });
            break;
        }
      },

      // 加载标签数据 - API调用示例
      async loadTabData(tab) {

        const params = {
          type: tab == 'followed' ? 1 : 2, // 关注1 发现2
        };
        queryPostList(params)
          .then((res) => {
            if (res.code === 1) {
              // 登录成功逻辑
              console.log('操作成功', res.data.list.data);
              this.discoverPosts = res.data.list.data;
              if (res.data.list.data.length > 0) {
                this.nodata = false;
              } else {
                this.nodata = true;
              }
            } else {
              // 登录失败（业务错误）
              console.log('操作失败', res.msg);
            }
          });

      },

      // 更新点赞状态
      async updateLikeStatus(postId, isLiked) {
        supportPost({
          post_id: postId
        }).then(res => {
          console.log(res)
          if (res.code == 1) {
            
          }
        })
        // try {
        //   const [error, response] = await uni.request({
        //     url: `/api/posts/${postId}/like`,
        //     method: isLiked ? 'POST' : 'DELETE',
        //     header: {
        //       'Content-Type': 'application/json'
        //     }
        //   });

        //   if (error || response.statusCode !== 200) {
        //     throw new Error('Failed to update like status');
        //   }
        // } catch (error) {
        //   console.error('Failed to update like status:', error);
        //   // 恢复原状态
        //   const post = this.displayedPosts.find(p => p.id === postId);
        //   if (post) {
        //     post.isLiked = !post.isLiked;
        //     post.likeCount += post.isLiked ? 1 : -1;
        //   }
        // }
      },

      // 提交举报 - API调用示例
      async submitReport(postId) {
        try {
          const [error, response] = await uni.request({
            url: `/api/posts/${postId}/report`,
            method: 'POST',
            header: {
              'Content-Type': 'application/json'
            },
            data: {
              reason: 'inappropriate'
            }
          });

          if (!error && response.statusCode === 200) {
            uni.showToast({
              title: 'Report submitted',
              icon: 'success'
            });
          }
        } catch (error) {
          console.error('Failed to submit report:', error);
        }
      },

      // 初始化示例数据
      initSampleData() {
        this.discoverPosts = [{
            id: 1,
            username: 'StormChaser',
            testCentre: 'Birmingham',
            category: 'tips_tricks',
            highlight: 'Featured',
            text: 'Pass your driving theory test in just 3 days! Private tutoring makes ALL the difference, ladies! The exam is simpler than you think - just focus on',
            images: ['/static/images/sample1.jpg', '/static/images/sample2.jpg', '/static/images/sample3.jpg'],
            topComment: {
              author: 'GOOOgo',
              text: 'Just passed with 97%!'
            },
            replyCount: 5,
            tags: ['#TheoryTest', '#Tips', '#GoodLuck'],
            likeCount: 999,
            commentCount: 16,
            isLiked: false
          },
          {
            id: 2,
            username: 'DrivingPro',
            testCentre: 'London',
            category: 'hazard_perception',
            highlight: null,
            text: 'Finally passed my hazard perception test! Here are my top tips: 1. Click as soon as you see a potential hazard developing 2. Don\'t click too many times or you\'ll get 0 3. Practice with the official DVSA videos',
            images: [],
            topComment: null,
            replyCount: 0,
            tags: ['#HazardPerception', '#Tips', '#Passed'],
            likeCount: 234,
            commentCount: 8,
            isLiked: true
          }
        ];

        this.followedPosts = [{
          id: 3,
          username: 'MyFriend',
          testCentre: 'Leeds',
          category: 'theory_test',
          highlight: null,
          text: 'Just finished my 5th mock test today - scored 48/50! The app is really helping me prepare. Next test date is in 2 weeks, feeling confident! 💪',
          images: [],
          topComment: null,
          replyCount: 0,
          tags: ['#Progress', '#MockTest', '#Confident'],
          likeCount: 123,
          commentCount: 5,
          isLiked: true
        }];
      },
      // 跳转user
      userProfileClick() {
      	uni.navigateTo({
      		url: '/pages/community/userProfile'
      	});
      	console.log('点击了UserProfile');
      },
      // 新增发布按钮点击事件
      goToPublish() {
      	// 这里可以跳转到发布页面，示例使用路由跳转
      	uni.navigateTo({
      		url: '/pages/community/create'
      	});
      	console.log('点击了发布按钮');
      },
    },
    onLoad() {
      // 页面加载时初始化数据
      // this.initSampleData();
      // 实际应用中调用API
      this.loadTabData(this.activeTab);
    }
  }
</script>

<style lang="scss">
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  /* 全局样式 */
  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  /* 渐变背景 */
  .gradient-bg {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 0;
  }

  .gradient-top {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 45%;
    background: linear-gradient(180deg, #E3F2FD 0%, #FFFFFF 100%);
  }

  .gradient-bottom {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 55%;
    background: linear-gradient(180deg, #FFFFFF 0%, #FFF4F4 100%);
  }

  /* 顶部标签切换 */
  .tabs-header {
    background: transparent;
    padding: 40rpx 40rpx 20rpx;
    position: relative;
    z-index: 10;
  }

  .tabs-container {
    display: flex;
    justify-content: center;
    gap: 100rpx;
    position: relative;
  }

  .tab-button {
    padding: 20rpx 0;
    font-size: 36rpx;
    font-weight: 500;
    color: #999;
    position: relative;
    transition: color 0.3s ease;
  }

  .tab-button.active {
    color: #333;
    font-weight: 600;
  }

  .tab-button.active::after {
    content: '';
    position: absolute;
    bottom: -4rpx;
    left: 50%;
    transform: translateX(-50%);
    width: 80rpx;
    height: 6rpx;
    background: #4A9EFF;
    border-radius: 4rpx;
  }

  /* 分类滚动条 */
  .categories-scroll {
    background: transparent;
    padding: 20rpx 40rpx;
    position: relative;
    z-index: 10;
    white-space: nowrap;
  }

  .categories-container {
    display: inline-flex;
    gap: 24rpx;
  }

  .category-chip {
    display: inline-flex;
    align-items: center;
    padding: 16rpx 32rpx;
    background: white;
    border-radius: 40rpx;
    font-size: 28rpx;
    font-weight: 500;
    color: #666;
    transition: all 0.3s ease;
    border: 4rpx solid transparent;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
  }

  .category-chip.active {
    background: linear-gradient(135deg, #4A9EFF 0%, #2196F3 100%);
    color: white;
    box-shadow: 0 8rpx 24rpx rgba(74, 158, 255, 0.25);
  }

  .category-icon {
    margin-right: 12rpx;
    font-size: 32rpx;
  }

  /* 主内容容器 */
  .container {
    flex: 1;
    padding: 40rpx;
    position: relative;
    z-index: 10;
    padding-bottom: 180rpx;
    /* 为底部导航留空间 */
  }

  /* 帖子卡片 */
  .post-card {
    background: white;
    border-radius: 40rpx;
    padding: 40rpx;
    margin-bottom: 30rpx;
    box-shadow: 0 10rpx 36rpx rgba(0, 0, 0, 0.06);
  }

  /* 用户信息头部 */
  .user-header {
    display: flex;
    align-items: center;
    margin-bottom: 30rpx;
  }

  .user-avatar {
    width: 90rpx;
    height: 90rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 36rpx;
    margin-right: 24rpx;
  }

  .user-info {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .username {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 6rpx;
  }

  .test-centre {
    font-size: 26rpx;
    color: #999;
  }

  /* 帖子内容 */
  .post-content {
    margin-bottom: 30rpx;
  }

  .highlight-badge {
    display: inline-block;
    background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
    color: white;
    padding: 10rpx 24rpx;
    border-radius: 12rpx;
    font-size: 26rpx;
    font-weight: 600;
    margin-bottom: 24rpx;
  }

  .post-text {
    font-size: 30rpx;
    line-height: 1.5;
    color: #333;
    margin-bottom: 30rpx;
    display: block;
  }

  /* 图片网格 */
  .images-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
    margin-bottom: 30rpx;
  }

  .post-image {
    width: calc(33.333% - 14rpx);
    height: 100%;
    aspect-ratio: 1;
    border-radius: 20rpx;
    background: #F0F0F0;
  }

  /* 评论预览 */
  .comment-preview {
    padding: 24rpx;
    background: #F8F9FA;
    border-radius: 20rpx;
    margin-bottom: 24rpx;
  }

  .comment-text {
    font-size: 28rpx;
    color: #333;
    line-height: 1.4;
  }

  .comment-author {
    font-weight: 600;
    color: #333;
  }

  .view-replies-button {
    color: #4A9EFF;
    font-size: 28rpx;
    display: block;
    margin-top: 16rpx;
    font-weight: 500;
  }

  /* 标签 */
  .tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
    margin-bottom: 30rpx;
  }

  .tag {
    font-size: 26rpx;
    color: #999;
  }

  /* 互动栏 */
  .actions-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 30rpx;
    border-top: 2rpx solid #F5F5F5;
  }

  .actions-left,
  .actions-right {
    display: flex;
    align-items: center;
    gap: 40rpx;
  }

  .action-button {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }

  .action-icon {
    width: 44rpx;
    height: 44rpx;
  }

  .action-button.liked .action-icon svg {
    fill: #FF6B6B;
    stroke: #FF6B6B;
  }

  .action-icon svg {
    width: 100%;
    height: 100%;
    stroke: #999;
    fill: none;
    stroke-width: 2;
    transition: all 0.3s ease;
  }

  .icon-image,
  .nav-icon-image {
    width: 100%;
    height: 100%;
  }

  .action-count {
    font-size: 30rpx;
    color: #666;
    font-weight: 500;
  }

  .action-button.liked .action-count {
    color: #FF6B6B;
  }

  /* 分享和举报按钮样式 */
  .action-button.share:hover .action-icon svg {
    stroke: #4A9EFF;
  }

  .action-button.report:hover .action-icon svg {
    stroke: #FF6B6B;
  }

  /* 浮动操作按钮 */
  .floating-action-button {
    position: fixed;
    bottom: 180rpx;
    right: 40rpx;
    width: 112rpx;
    height: 112rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #4A9EFF 0%, #2196F3 100%);
    box-shadow: 0 12rpx 40rpx rgba(74, 158, 255, 0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 20;
  }

  .fab-icon {
    color: white;
    font-size: 48rpx;
    font-weight: 300;
  }

  /* 底部导航 */
  .bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 140rpx;
    background: white;
    box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
    display: flex;
    justify-content: space-around;
    align-items: center;
    z-index: 20;
  }

  .nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 16rpx;
  }

  .nav-icon {
    margin-bottom: 8rpx;
    width: 48rpx;
    height: 48rpx;
  }

  .nav-label {
    font-size: 24rpx;
    color: #999;
  }

  .nav-item.active .nav-label {
    color: #4A9EFF;
  }

  /* 加载更多 */
  .load-more-container {
    text-align: center;
    padding: 40rpx;
  }

  .load-more-text {
    color: #999;
    font-size: 28rpx;
  }

  /* 空状态 */
  .empty-state {
    text-align: center;
    padding: 120rpx 40rpx;
  }

  .empty-icon {
    width: 160rpx;
    height: 160rpx;
    margin: 0 auto 40rpx;
    background: #F8F9FA;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .empty-icon-image {
    width: 80rpx;
    height: 80rpx;
  }

  .empty-title {
    font-size: 36rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 16rpx;
    display: block;
  }

  .empty-description {
    font-size: 28rpx;
    color: #999;
    display: block;
  }
</style>