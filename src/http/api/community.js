import fly from "@/utils/request.js";
/*
 * author：Gengbaodada
 * create by date：2024/06/11
 * content：获取主题列表
 */


export function userFollowedList(params) {
  return fly.get("user/userFollowedList", params, {
     otherQuery: {
     
     },
  });
}
/*
 * 关注/取消关注
 * author：huanyun
 * follow_user_id 关注/取消关注用户ID
 * create by date：2025/08/16
 */
export function userFollowed(params) {
  return fly.post("/exam/user/userFollowed", params);
}


export function roomIndex(params) {
  return fly.get("room/index", params, {
     otherQuery: {
     
     },
  });
}

export function addTag(params) {
  return fly.get("forum/addTags", params, {
     otherQuery: {
     
     },
  });
}

export function queryTags(params) {
  return fly.get("forum/queryTags", params, {
     otherQuery: {
     
     },
  });
}


export function createPost(params) {
  return fly.get("/exam/forum/createPost", params, {
    
  });
}

export function queryPostList(params) {
  return fly.post("/exam/forum/queryPostList", params, {});
}
/*
 * 点赞/取消点赞帖子
 * author：huanyun
 * post_id 帖子ID
 * create by date：2025/08/16
 */
export function supportPost(params) {
  return fly.post("/exam/forum/supportPost", params, {});
}

/*
 * 收藏/取消收藏帖子
 * author：huanyun
 * post_id 帖子ID
 * create by date：2025/08/16
 */
export function collectPost(params) {
  return fly.post("/exam/forum/collectPost", params);
}

/*
 * 回复帖子
 * author：huanyun
 * post_id 帖子ID
 * content 内容
 * pid 父级评论ID(为空则评论帖子)
 * create by date：2025/08/16
 */
export function replyPost(params) {
  return fly.post("/exam/forum/replyPost", params);
}
/*
 * 查询帖子详情
 * author：huanyun
 * post_id 帖子ID
 * create by date：2025/08/16
 */
export function queryPostDetail(params) {
  return fly.post("/exam/forum/queryPostDetail", params);
}
/*
 * 点赞/取消点赞评论
 * author：huanyun
 * post_id 帖子ID
 * reply_id 评论ID
 * create by date：2025/08/16
 */
export function supportReply(params) {
  return fly.post("/exam/forum/supportReply", params);
}

export function collectList(params) {
  return fly.get("question/collectList", params, {
     otherQuery: {
     
     },
  });
}

// upload
// {
//     "code": 1,
//     "msg": "上传成功",
//     "time": "1753627432",
//     "data": {
//         "url": "/uploads/20250727/157a4782e5c915e141fc588d1a7ce9ea.png",
//         "fullurl": "http://driving.asszo.com/uploads/20250727/157a4782e5c915e141fc588d1a7ce9ea.png"
//     }
// }

