<template>
  <view class="app">
    <view class="gradient-bg">
      <view class="gradient-top"></view>
      <view class="gradient-bottom"></view>
    </view>

    <!-- Header导航栏 -->
    <view class="header">
      <view class="header-left">
        <view class="back-button" @tap="goBack">←</view>
        <view class="user-info-header">
          <view class="header-avatar">{{ getInitial(post.username) }}</view>
          <text class="header-username">{{ post.username }}</text>
        </view>
      </view>
      <view class="header-right">
        <view class="follow-button" :class="{following: isFollowing}" @tap="toggleFollow">
          {{ isFollowing ? 'Following' : 'Follow' }}
        </view>
        <view class="more-button" @tap="showMoreOptions">
          <image src="/static/icons/more.svg" class="more-icon"></image>
        </view>
      </view>
    </view>

    <!-- 主内容容器 -->
    <scroll-view 
      class="container" 
      scroll-y
      @scrolltolower="handleScrollToBottom"
      :lower-threshold="100">
      
      <!-- 帖子主体卡片 -->
      <view class="post-card">
        <!-- 图片轮播 -->
        <swiper 
          v-if="post.images && post.images.length > 0" 
          class="image-carousel"
          :current="currentImageIndex"
          @change="onImageChange">
          <swiper-item v-for="(image, index) in post.images" :key="index">
            <image 
              :src="image" 
              class="carousel-image"
              mode="aspectFill"
              @tap="viewFullImage(image)">
            </image>
          </swiper-item>
        </swiper>

        <!-- Featured徽章 -->
        <text v-if="post.highlight" class="highlight-badge">
          🌟 {{ post.highlight }}
        </text>

        <!-- 帖子文本 -->
        <text class="post-text">{{ post.text }}</text>

        <!-- 标签 -->
        <view class="tags-container">
          <text v-for="tag in post.tags" :key="tag" class="tag">{{ tag }}</text>
        </view>

        <!-- 帖子元信息 -->
        <view class="post-meta">
          <text>{{ post.timeAgo }}</text>
          <text>Test Centre: {{ post.testCentre }}</text>
        </view>
      </view>

      <!-- 互动栏卡片 -->
      <view class="actions-card">
        <view class="actions-bar">
          <view class="action-button" :class="{liked: post.isLiked}" @tap="toggleLike">
            <view class="action-icon">
              <image src="/static/icons/heart.svg" class="icon-image"></image>
            </view>
            <text class="action-label">{{ post.likeCount }}</text>
          </view>

          <view class="action-button" :class="{saved: post.isSaved}" @tap="toggleSave">
            <view class="action-icon">
              <image src="/static/icons/star.svg" class="icon-image"></image>
            </view>
            <text class="action-label">{{ post.saveCount }}</text>
          </view>

          <view class="action-button" @tap="openCommentInput">
            <view class="action-icon">
              <image src="/static/icons/comment.svg" class="icon-image"></image>
            </view>
            <text class="action-label">{{ post.commentCount }}</text>
          </view>
        </view>
      </view>

      <!-- 评论区卡片 -->
      <view class="comments-card">
        <view class="comments-header">
          All Comments · {{ comments.length }}
        </view>

        <!-- 评论列表 -->
        <view v-for="comment in comments" :key="comment.id" class="comment-item">
          <view class="comment-header">
            <view class="comment-avatar">{{ getInitial(comment.username) }}</view>
            <view class="comment-info">
              <text class="comment-username">{{ comment.username }}</text>
              <text class="comment-meta">{{ comment.testCentre }}</text>
            </view>
            <view class="comment-actions">
              <view class="comment-like-button" 
                    :class="{liked: comment.isLiked}" 
                    @tap="toggleCommentLike(comment)">
                <view class="comment-like-icon">
                  <image src="/static/icons/heart.svg" class="icon-image"></image>
                </view>
                <text class="comment-like-count">{{ comment.likeCount }}</text>
              </view>
              <view class="comment-reply-button" @tap="replyToComment(comment)">
                <view class="comment-reply-icon">
                  <image src="/static/icons/reply.svg" class="icon-image"></image>
                </view>
                <text class="comment-reply-label">Reply</text>
              </view>
            </view>
          </view>
          <text class="comment-text">{{ comment.text }}</text>
          
          <!-- 回复列表 - 只显示第一条 -->
          <view v-if="comment.replies && comment.replies.length > 0" class="replies-container">
            <view class="reply-item">
              <view class="comment-header">
                <view class="comment-avatar reply-avatar">
                  {{ getInitial(comment.replies[0].username) }}
                </view>
                <view class="comment-info">
                  <text class="comment-username reply-username">{{ comment.replies[0].username }}</text>
                  <text class="comment-meta reply-meta">{{ comment.replies[0].testCentre }}</text>
                </view>
              </view>
              <text class="comment-text reply-text">{{ comment.replies[0].text }}</text>
            </view>
            
            <!-- Load more replies -->
            <view v-if="comment.replies.length > 1 && !comment.showAllReplies" class="load-more-replies">
              <text class="load-more-replies-text" @tap="loadMoreReplies(comment)">
                Load more replies ({{ comment.replies.length - 1 }})
              </text>
            </view>
            
            <!-- 显示所有回复 -->
            <view v-if="comment.showAllReplies">
              <view v-for="(reply, index) in comment.replies.slice(1)" 
                   :key="reply.id" 
                   class="reply-item">
                <view class="comment-header">
                  <view class="comment-avatar reply-avatar">
                    {{ getInitial(reply.username) }}
                  </view>
                  <view class="comment-info">
                    <text class="comment-username reply-username">{{ reply.username }}</text>
                    <text class="comment-meta reply-meta">{{ reply.testCentre }}</text>
                  </view>
                </view>
                <text class="comment-text reply-text">{{ reply.text }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 加载更多评论 -->
        <view v-if="hasMoreComments" class="load-more-container">
          <view v-if="!isLoadingComments" class="load-more-button" @tap="loadMoreComments">
            Load more comments
          </view>
          <view v-else class="loading-spinner"></view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部输入框 -->
    <view class="input-bar">
      <input 
        type="text" 
        class="input-field" 
        v-model="commentText"
        placeholder="Say something..."
        @confirm="sendComment" />
      <view class="send-button" @tap="sendComment">
        <image src="/static/icons/send.svg" class="send-icon"></image>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 帖子数据
      post: {
        id: 1,
        username: 'StormChaser',
        testCentre: 'Birmingham',
        highlight: 'Featured',
        text: 'Pass your driving theory test in just 3 days! Private tutoring makes ALL the difference, ladies! The exam is simpler than you think',
        images: [
          '/static/images/study-notes.jpg',
          '/static/images/car-photo.jpg',
          '/static/images/test-result.jpg'
        ],
        tags: ['#Theory Test', '#Test', '#good luck'],
        timeAgo: '5days ago',
        likeCount: 999,
        saveCount: 31,
        commentCount: 14,
        isLiked: false,
        isSaved: false
      },
      // 评论数据
      comments: [],
      // 界面状态
      currentImageIndex: 0,
      isFollowing: false,
      commentText: '',
      replyingTo: null, // 正在回复的评论
      hasMoreComments: true,
      isLoadingComments: false
    }
  },
  methods: {
    // 返回上一页
    goBack() {
      console.log('Going back to forum list');
      uni.navigateBack();
    },
    
    // 获取用户名首字母
    getInitial(username) {
      return username.charAt(0).toUpperCase();
    },
    
    // 切换关注状态
    toggleFollow() {
      this.isFollowing = !this.isFollowing;
      console.log(this.isFollowing ? 'Following user' : 'Unfollowed user');
      this.updateFollowStatus();
    },
    
    // 显示更多选项
    showMoreOptions() {
      console.log('Showing more options');
      uni.showActionSheet({
        itemList: ['Share', 'Report', 'Copy Link', 'Block User'],
        success: (res) => {
          console.log('Selected option:', res.tapIndex);
          this.handleMoreOption(res.tapIndex);
        }
      });
    },
    
    // 处理更多选项
    handleMoreOption(index) {
      switch(index) {
        case 0: // Share
          this.sharePost();
          break;
        case 1: // Report
          this.reportPost();
          break;
        case 2: // Copy Link
          this.copyLink();
          break;
        case 3: // Block User
          this.blockUser();
          break;
      }
    },
    
    // 图片轮播变化
    onImageChange(e) {
      this.currentImageIndex = e.detail.current;
    },
    
    // 查看完整图片
    viewFullImage(imageUrl) {
      console.log('Viewing full image:', imageUrl);
      uni.previewImage({
        current: imageUrl,
        urls: this.post.images
      });
    },
    
    // 切换点赞
    toggleLike() {
      this.post.isLiked = !this.post.isLiked;
      this.post.likeCount += this.post.isLiked ? 1 : -1;
      console.log(this.post.isLiked ? 'Liked post' : 'Unliked post');
      this.updateLikeStatus();
    },
    
    // 切换收藏
    toggleSave() {
      this.post.isSaved = !this.post.isSaved;
      this.post.saveCount += this.post.isSaved ? 1 : -1;
      console.log(this.post.isSaved ? 'Saved post' : 'Unsaved post');
      this.updateSaveStatus();
    },
    
    // 打开评论输入框
    openCommentInput() {
      // UniApp中输入框自动聚焦需要特殊处理
      this.$nextTick(() => {
        // 可以使用 focus 属性控制
      });
    },
    
    // 切换评论点赞
    toggleCommentLike(comment) {
      comment.isLiked = !comment.isLiked;
      comment.likeCount += comment.isLiked ? 1 : -1;
      console.log(comment.isLiked ? 'Liked comment' : 'Unliked comment');
      this.updateCommentLikeStatus(comment.id, comment.isLiked);
    },
    
    // 加载更多回复
    loadMoreReplies(comment) {
      console.log('Loading more replies for comment:', comment.id);
      this.$set(comment, 'showAllReplies', true);
    },
    
    // 回复评论
    replyToComment(comment) {
      console.log('Replying to comment:', comment.id);
      this.replyingTo = comment;
      this.commentText = `@${comment.username} `;
    },
    
    // 发送评论
    sendComment() {
      if (!this.commentText.trim()) return;
      
      // 检查是否是回复
      if (this.replyingTo) {
        const newReply = {
          id: Date.now(),
          username: 'CurrentUser',
          testCentre: 'Test Centre: Birmingham',
          text: this.commentText.replace(`@${this.replyingTo.username} `, '')
        };
        
        // 添加回复到对应评论
        if (!this.replyingTo.replies) {
          this.$set(this.replyingTo, 'replies', []);
        }
        this.replyingTo.replies.push(newReply);
        
        // 如果回复超过1条且未展开，自动展开
        if (this.replyingTo.replies.length > 1 && !this.replyingTo.showAllReplies) {
          this.$set(this.replyingTo, 'showAllReplies', true);
        }
        
        this.replyingTo = null;
      } else {
        // 普通评论
        const newComment = {
          id: Date.now(),
          username: 'CurrentUser',
          testCentre: 'Test Centre: Birmingham',
          text: this.commentText,
          likeCount: 0,
          isLiked: false,
          replies: [],
          showAllReplies: false
        };
        
        this.comments.unshift(newComment);
        this.post.commentCount++;
      }
      
      this.commentText = '';
      console.log('Comment/Reply sent');
    },
    
    // 加载更多评论
    loadMoreComments() {
      if (this.isLoadingComments) return;
      
      this.isLoadingComments = true;
      console.log('Loading more comments...');
      
      // 模拟API调用
      setTimeout(() => {
        const moreComments = [
          {
            id: Date.now(),
            username: 'NewUser',
            testCentre: 'Test Centre: Bristol',
            text: 'Thanks for sharing this valuable information!',
            likeCount: 12,
            isLiked: false,
            replies: [],
            showAllReplies: false
          },
          {
            id: Date.now() + 1,
            username: 'TestTaker',
            testCentre: 'Test Centre: Leeds',
            text: 'I have my test next week, this gives me confidence!',
            likeCount: 8,
            isLiked: false,
            replies: [],
            showAllReplies: false
          }
        ];
        
        this.comments.push(...moreComments);
        this.isLoadingComments = false;
        
        // 模拟没有更多评论
        if (this.comments.length > 10) {
          this.hasMoreComments = false;
        }
      }, 1000);
    },
    
    // 处理滚动到底部
    handleScrollToBottom() {
      if (this.hasMoreComments && !this.isLoadingComments) {
        console.log('Auto loading more comments...');
        this.loadMoreComments();
      }
    },
    
    // API调用示例 - 更新关注状态
    async updateFollowStatus() {
      try {
        const [error, response] = await uni.request({
          url: `/api/users/${this.post.userId}/follow`,
          method: this.isFollowing ? 'POST' : 'DELETE',
          header: {
            'Content-Type': 'application/json'
          }
        });
        
        if (error) throw new Error('Failed to update follow status');
      } catch (error) {
        console.error('Failed to update follow status:', error);
        this.isFollowing = !this.isFollowing; // 恢复状态
      }
    },
    
    // API调用示例 - 更新点赞状态
    async updateLikeStatus() {
      try {
        const [error, response] = await uni.request({
          url: `/api/posts/${this.post.id}/like`,
          method: this.post.isLiked ? 'POST' : 'DELETE',
          header: {
            'Content-Type': 'application/json'
          }
        });
        
        if (error) throw new Error('Failed to update like status');
      } catch (error) {
        console.error('Failed to update like status:', error);
        this.post.isLiked = !this.post.isLiked;
        this.post.likeCount += this.post.isLiked ? 1 : -1;
      }
    },
    
    // 初始化示例数据
    initSampleData() {
      this.comments = [
        {
          id: 1,
          username: 'StormChaser',
          testCentre: 'Test Centre: Birmingham',
          text: 'Catch the good luck!',
          likeCount: 999,
          isLiked: true,
          replies: [],
          showAllReplies: false
        },
        {
          id: 2,
          username: 'StormChaser',
          testCentre: 'Test Centre: Birmingham',
          text: 'Let me try too!',
          likeCount: 999,
          isLiked: false,
          replies: [],
          showAllReplies: false
        },
        {
          id: 3,
          username: 'LearnerPro',
          testCentre: 'Test Centre: London',
          text: 'This is really helpful! I\'ve been struggling with the theory test for weeks.',
          likeCount: 45,
          isLiked: false,
          replies: [
            {
              id: 301,
              username: 'Helper',
              testCentre: 'Test Centre: London',
              text: 'I can help you with practice questions if you need!'
            },
            {
              id: 302,
              username: 'StudyBuddy',
              testCentre: 'Test Centre: Leeds',
              text: 'Join our study group, we meet online every week!'
            },
            {
              id: 303,
              username: 'Instructor',
              testCentre: 'Test Centre: Manchester',
              text: 'The key is to practice mock tests regularly.'
            }
          ],
          showAllReplies: false
        }
      ];
    },
    
    // 加载帖子详情
    async loadPostDetail() {
      const postId = this.postId;
      if (!postId) return;
      
      try {
        const [error, response] = await uni.request({
          url: `/api/posts/${postId}`,
          method: 'GET'
        });
        
        if (!error && response.statusCode === 200) {
          this.post = response.data.post;
          this.comments = response.data.comments;
        }
      } catch (error) {
        console.error('Failed to load post detail:', error);
      }
    }
  },
  onLoad(options) {
    // 获取帖子ID
    this.postId = options.id;
    
    // 初始化示例数据
    this.initSampleData();
    
    // 实际应用中加载真实数据
    // this.loadPostDetail();
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

/* Header样式 */
.header {
  padding: 30rpx 40rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: transparent;
  position: relative;
  z-index: 10;
  min-height: 120rpx;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.back-button {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 40rpx;
}

.user-info-header {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.header-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 30rpx;
}

.header-username {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.follow-button {
  padding: 16rpx 40rpx;
  background: white;
  border: 4rpx solid #4A9EFF;
  border-radius: 50rpx;
  color: #4A9EFF;
  font-size: 28rpx;
  font-weight: 600;
  transition: all 0.3s ease;
}

.follow-button.following {
  background: linear-gradient(135deg, #4A9EFF 0%, #2196F3 100%);
  color: white;
  border-color: transparent;
}

.more-button {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.more-icon {
  width: 40rpx;
  height: 40rpx;
}

/* 容器 */
.container {
  flex: 1;
  padding: 40rpx;
  position: relative;
  z-index: 10;
  padding-bottom: 170rpx; /* 为底部输入框留空间 */
}

/* 帖子卡片 */
.post-card {
  background: white;
  border-radius: 40rpx;
  padding: 40rpx;
  box-shadow: 0 10rpx 36rpx rgba(0,0,0,0.06);
  margin-bottom: 30rpx;
}

/* 图片轮播 */
.image-carousel {
  margin: -40rpx -40rpx 40rpx -40rpx;
  height: 600rpx;
  border-radius: 40rpx 40rpx 0 0;
  overflow: hidden;
}

.carousel-image {
  width: 100%;
  height: 600rpx;
}

/* Featured徽章 */
.highlight-badge {
  display: inline-block;
  background: linear-gradient(135deg, #FFB74D 0%, #FF9800 100%);
  color: white;
  padding: 12rpx 28rpx;
  border-radius: 16rpx;
  font-size: 26rpx;
  font-weight: 600;
  margin-bottom: 30rpx;
}

/* 帖子文本 */
.post-text {
  font-size: 30rpx;
  line-height: 1.6;
  color: #333;
  margin-bottom: 30rpx;
  display: block;
}

/* 标签 */
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.tag {
  font-size: 28rpx;
  color: #4A9EFF;
}

/* 帖子元信息 */
.post-meta {
  display: flex;
  align-items: center;
  gap: 30rpx;
  font-size: 26rpx;
  color: #999;
  padding-top: 30rpx;
  border-top: 2rpx solid #F5F5F5;
}

/* 互动栏卡片 */
.actions-card {
  background: white;
  border-radius: 40rpx;
  padding: 30rpx;
  box-shadow: 0 10rpx 36rpx rgba(0,0,0,0.06);
  margin-bottom: 30rpx;
}

.actions-bar {
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.action-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  flex: 1;
}

.action-icon {
  width: 48rpx;
  height: 48rpx;
}

.icon-image {
  width: 100%;
  height: 100%;
}

.action-label {
  font-size: 28rpx;
  color: #666;
  font-weight: 500;
}

.action-button.liked .action-label {
  color: #FF6B6B;
}

.action-button.saved .action-label {
  color: #FFD700;
}

/* 评论区卡片 */
.comments-card {
  background: white;
  border-radius: 40rpx;
  padding: 40rpx;
  box-shadow: 0 10rpx 36rpx rgba(0,0,0,0.06);
}

.comments-header {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 40rpx;
  padding-bottom: 30rpx;
  border-bottom: 2rpx solid #F5F5F5;
}

.comment-item {
  padding: 30rpx 0;
  border-bottom: 2rpx solid #F5F5F5;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin-bottom: 24rpx;
}

.comment-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #4A9EFF 0%, #2196F3 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 28rpx;
}

.reply-avatar {
  width: 56rpx;
  height: 56rpx;
  font-size: 24rpx;
}

.comment-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.comment-username {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 6rpx;
}

.reply-username {
  font-size: 28rpx;
}

.comment-meta {
  font-size: 24rpx;
  color: #999;
}

.reply-meta {
  font-size: 22rpx;
}

.comment-actions {
  display: flex;
  align-items: center;
  gap: 30rpx;
}

.comment-like-button,
.comment-reply-button {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.comment-like-icon,
.comment-reply-icon {
  width: 36rpx;
  height: 36rpx;
}

.comment-like-count {
  font-size: 28rpx;
  color: #666;
  font-weight: 500;
}

.comment-like-button.liked .comment-like-count {
  color: #FF6B6B;
}

.comment-reply-label {
  font-size: 28rpx;
  color: #666;
  font-weight: 500;
}

.comment-text {
  font-size: 28rpx;
  line-height: 1.5;
  color: #333;
  padding-left: 96rpx;
  display: block;
}

.reply-text {
  padding-left: 80rpx;
  font-size: 26rpx;
}

/* 回复相关样式 */
.replies-container {
  margin-top: 30rpx;
  padding-left: 40rpx;
  border-left: 4rpx solid #F0F0F0;
}

.reply-item {
  padding: 20rpx 0;
  border-bottom: 2rpx solid #F8F8F8;
}

.reply-item:last-child {
  border-bottom: none;
}

.load-more-replies {
  margin-top: 20rpx;
  padding-left: 80rpx;
}

.load-more-replies-text {
  color: #4A9EFF;
  font-size: 26rpx;
  font-weight: 500;
}

/* 加载更多 */
.load-more-container {
  text-align: center;
  padding: 40rpx 0 20rpx;
}

.load-more-button {
  width: 90%;
  max-width: 700rpx;
  margin: 0 auto;
  padding: 28rpx 60rpx;
  background: white;
  border: 4rpx solid #4A9EFF;
  border-radius: 50rpx;
  color: #4A9EFF;
  font-size: 30rpx;
  font-weight: 600;
  display: block;
  text-align: center;
}

.loading-spinner {
  display: inline-block;
  width: 40rpx;
  height: 40rpx;
  border: 6rpx solid #F0F0F0;
  border-top: 6rpx solid #4A9EFF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 底部输入框 */
.input-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 30rpx 40rpx;
  display: flex;
  align-items: center;
  gap: 30rpx;
  box-shadow: 0 -4rpx 20rpx rgba(0,0,0,0.05);
  z-index: 20;
}

.input-field {
  flex: 1;
  padding: 24rpx 40rpx;
  background: #F8F9FA;
  border: none;
  border-radius: 50rpx;
  font-size: 30rpx;
  height: 80rpx;
}

.send-button {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #4A9EFF 0%, #2196F3 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6rpx 20rpx rgba(74, 158, 255, 0.3);
}

.send-icon {
  width: 40rpx;
  height: 40rpx;
}
</style>