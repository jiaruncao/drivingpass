<template>
  <u-popup :show="allQuestionShow" @close="close" :closeOnClickOverlay="true">
    <div class="question_all">
      <div class="bottom_nav">
        <div class="save_icon" @click="saveQuestion">
          <u-icon
            :name="startLearnQuestion.save ? 'star-fill' : 'star'"
            size="20"
            :color="startLearnQuestion.save ? '#ff9900' : '#000'"
          ></u-icon>
        </div>
        <div class="save_name" @click="saveQuestion">
          {{ startLearnQuestion.save ? "Saved" : "Save" }}
        </div>
        <div class="success">
          <u-icon
            name="checkmark-circle-fill"
            color="#419FFF"
            size="20"
          ></u-icon>
        </div>
        <div class="success_sum">16</div>
        <div class="error">
          <u-icon name="close-circle-fill" size="20" color="#FF6666"></u-icon>
        </div>
        <div class="error_sum">16</div>
        <div class="all_question_icon" size="20">
          <u-icon name="grid" size="20"></u-icon>
        </div>
        <div class="answer_sum">23</div>
        <div class="answer_all_sum">/1590</div>
      </div>
      <div class="question_list">
        <div
          class="question_item"
          v-for="(item, i) in 99"
          :key="i"
          :style="{
            color:
              i == 1 || i == 2 || i == 3
                ? '#FF6666'
                : i == 7 || i == 5 || i == 11
                ? '#419FFF'
                : '',
            background:
              i == 1 || i == 2 || i == 3
                ? '#FFD4D4'
                : i == 7 || i == 5 || i == 11
                ? '#CAE4FF'
                : '',
            border:
              i == 1 || i == 2 || i == 3
                ? '2px solid #FFD4D4'
                : i == 7 || i == 5 || i == 11
                ? '2px solid #CAE4FF'
                : '',
          }"
        >
          {{ i + 1 }}
        </div>
      </div>
    </div>
  </u-popup>
</template>

<script>
export default {
  props: {
    startLearnQuestion: {
      type: Object,
      default: {},
    },
  },
  data() {
    return {
      allQuestionShow: false,
    };
  },
  methods: {
    close() {
      this.allQuestionShow = false;
    },
    init() {
      this.allQuestionShow = true;
    },
  },
};
</script>

<style lang="scss" scoped>
.question_list {
  padding: 0 18rpx;
  display: flex;
  flex-wrap: wrap;
  max-height: 70vh;
  overflow-y: scroll;
  .question_item {
    margin: 18rpx;
    width: 80rpx;
    height: 80rpx;
    border-radius: 100%;
    text-align: center;
    line-height: 80rpx;
    background: #ffffff;
    border: 2px solid #d7d7d7;
  }
}
.bottom_nav {
  width: calc(100vw - 60rpx);
  display: flex;
  height: 107rpx;
  line-height: 107rpx;
  border-top: 1px solid #d7d7d7;
  padding: 0 30rpx;
  background: #fff;
  z-index: 9;
  .all_question_icon {
    margin: 0 3rpx 0 30rpx;
    display: flex;
    justify-items: center;
  }
  .answer_sum {
    font-weight: 400;
    font-size: 28rpx;
    color: #333333;
  }
  .answer_all_sum {
    font-weight: 400;
    font-size: 28rpx;
    color: #999999;
  }
  .error {
    margin-left: 30rpx;
    margin-right: 8rpx;
    display: flex;
    justify-items: center;
  }
  .error_sum {
    font-weight: 400;
    font-size: 28rpx;
    color: #ff6666;
  }
  .success {
    margin-right: 8rpx;
    margin-left: auto;
    display: flex;
    justify-items: center;
  }
  .success_sum {
    font-weight: 400;
    font-size: 28rpx;
    color: #419fff;
  }
  .save_name {
    margin-left: 5rpx;
    font-weight: 400;
    font-size: 28rpx;
    color: #333333;
  }
  .save_icon {
    display: flex;
    justify-items: center;
    // padding: 42rpx 0;
  }
}
</style>
