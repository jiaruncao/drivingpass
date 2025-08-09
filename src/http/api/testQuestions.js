/*
 * author：Gengbaodada
 * create by date：2024/11/11
 * content 试题相关接口统一管理
 */
import fly from "@/utils/request.js";

/*
 * author：huanyun
 * create by date：2025/08/06
 * kind 题库:QUESTION
 * subject_id 科目id
 */
export function getThree(params) {
  return fly.post("/exam/cate/getThree", params);
}
/*
 * author：huanyun
 * create by date：2025/08/06
 * cate_id  按分类查询 分类ID
 * keyword  搜索关键词
 * kind 试题类型查询 Judge:判断题 Single:单选题 Multi:多选题
 * mode normal=普通模式，random=随机查询
 * page_count 每页数量
 * user_id 传入用户ID时，查询收藏状态
 */
export function startTrain(params) {
  return fly.post("/exam/question/train", params);
}
/*
 * author：huanyun
 * create by date：2025/08/06
 * question_id  题目ID
 */
export function collectAdd(params) {
  return fly.post("/exam/question/collectAdd", params);
}
/*
 * author：huanyun
 * create by date：2025/08/06
 * question_id  题目ID
 */
export function collectCancel(params) {
  return fly.post("/exam/question/collectCancel", params);
}
