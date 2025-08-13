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

export function userFollowed(params) {
  return fly.get("user/userFollowed", params, {
     otherQuery: {
     
     },
  });
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

export function supportPost(params) {
  return fly.post("/exam/forum/supportPost", params, {});
}

export function collectPost(params) {
  return fly.get("forum/collectPost", params, {
     otherQuery: {
     
     },
  });
}


export function replyPost(params) {
  return fly.get("forum/replyPost", params, {
     otherQuery: {
     
     },
  });
}

export function queryPostDetail(params) {
  return fly.get("forum/queryPostDetail", params, {
     otherQuery: {
     
     },
  });
}

export function supportReply(params) {
  return fly.get("forum/supportReply", params, {
     otherQuery: {
     
     },
  });
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

