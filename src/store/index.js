import Vue from "vue";
import Vuex from "vuex";
import http from "@/http/index.js";
Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    moreOptions: {},
    userWXInfo: null,
    learnModeQuestion: {},
    // 语音播报
    storeIds: [],
    audioList: []
  },
  mutations: {
    saveMoreOptions(state, data) {
      state.moreOptions = data;
    },
    saveLearnModeQuestion(state, data) {
      state.learnModeQuestion = data;
    },
    setData (stats, data) {
      state[data.key] = data.val;
    }
  },
  actions: {},
});

export default store;
