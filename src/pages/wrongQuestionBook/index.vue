<template>
  <div>
    <div class="top_nav">
      <div class="go_back" @click="goBack">
        <u-icon name="arrow-leftward" size="20"></u-icon>
      </div>
      <div
        class="head_name"
        v-for="(item, i) in headerType"
        :key="i"
        :style="{
          color: headerTypeI == i ? '#333333' : '',
          fontWeight: headerTypeI == i ? 'bold' : '',
        }"
        @click="handleHeaderType(i)"
      >
        {{ item.name }}
        <div class="shu" v-if="headerTypeI == i"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      headerTypeI: 0,
      headerType: [
        {
          name: "Wrongs Bookmarks",
        },
        {
          name: "Saved Questions",
        },
      ],
    };
  },
  methods: {
    handleHeaderType(i) {
      this.headerTypeI = i;
    },
  },
};
</script>

<style lang="scss" scoped>
.top_nav {
  padding: 60rpx 30rpx;
  display: flex;
  .head_name {
    margin-left: 20rpx;
    font-weight: 400;
    font-size: 28rpx;
    color: #999999;
    position: relative;
    .shu {
      position: absolute;
      bottom: -10rpx;
      width: 43rpx;
      height: 8rpx;
      background: #000000;
      left: 50%;
      transform: translateX(-50%);
    }
  }
}
</style>
