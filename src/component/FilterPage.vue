<template>
  <div>
    <v-btn
        large
        block
        class="text-none"
        color="#80989b"
        @click="backToHome"
        style="margin-bottom: 5px"
    >
      <v-icon left>
        mdi-keyboard-backspace
      </v-icon>
      Click here to go back
      <v-icon>mdi-home-outline</v-icon>
    </v-btn>

  <v-container class="mx-auto">

    <!-- 数据筛选模块 -->
    <FilterWebsiteData
        :user-to-select="userToSelect"
        :count="count"
        @filterNewRequestSend="filterNewRequestSend"
    ></FilterWebsiteData>

    <v-col
        v-for="(item, i) in items"
        :key="i"
        cols="12"
    >
      <!-- 网页搜索结果 -->
      <WebsiteSearchResults :item="item"/>
    </v-col>

    <!-- 点击加载更多数据 -->
    <v-btn
        block
        color="yellow"
        v-show="showMoreBtn"
        @click="filterSendRequest"
    >
      <v-icon left>
        mdi-refresh
      </v-icon>
      More
    </v-btn>
  </v-container>
  </div>
</template>

<script>

import FilterWebsiteData from "@/component/FilterWebsiteData";
import WebsiteSearchResults from "@/component/WebsiteSearchResults";

export default {
  name: "FilterPage",
  components: {WebsiteSearchResults, FilterWebsiteData},
  data: () => ({
    items: [],
    // 用于筛选：有 userName 和 webCount 的列表
    userToSelect: [],
    // 默认展示 10 条，每次加 10
    filterLoad: 10,
    // 筛选出来的结果的条数，如果新加载的条数和原来保存的条数相同，说明没有新的数据
    count: 0,
    // 子组件中得来的数据：usernames, dates, ifOrderByTime, ifDesc
    usernames: [],
    dates: [],
    ifOrderByTime: false,
    ifDesc: false,
  }),
  methods: {

    // 返回首页
    backToHome() {
      document.getElementById("myHomeBtn").click();
    },

    // 获取可供筛选的用户信息
    loadAllUser() {
      this.axios.get("/home/filter").then(res => {
        if (res.data.code === 200) {
          this.userToSelect = res.data.data;
        }
      });
    },

    // 点击发送筛选按钮：发送新的筛选请求
    filterNewRequestSend(usernames, dates, ifOrderByTime, ifDesc) {
      // 重置筛选的数据
      this.filterLoad = 10;
      this.count = 0;
      // 赋值
      this.usernames = usernames;
      this.dates = dates;
      this.ifOrderByTime = ifOrderByTime;
      this.ifDesc = ifDesc;
      this.filterSendRequest();
    },
    // 发送筛选请求
    filterSendRequest() {
      let data = {
        usernames: this.usernames,
        datetimeList: this.dates,
        load: this.filterLoad,
        isOrderByUsername: !this.ifOrderByTime,
        isDesc: this.ifDesc
      };

      this.axios.post("/home/filter", data).then(res => {
        // 网页数据
        let webs = res.data.data;
        this.items = webs;
        // 网页数据的数量
        let count = webs.length;
        if (count === 0) {
          alert("No Result Found...");
          // 重置数据
          this.filterLoad = 10;
          this.count = 0;
        } else if (count === this.count) {
          alert("No More Results");
        } else {
          // 统计加载的数量
          this.count = count;
          // 每次都新增 10
          this.filterLoad += 10;
        }
      });
    },


    // 打开 view 详情
    view(item) {
      this.axios.get("/view/count", {
        params: {webId: item.webId}
      }).then(res => {
        let msg = "Title: " + item.title + "\n"
            + "URL: " + item.url + "\n"
            + "Bookmarked By: " + item.userName + "\n\n";

        let views;
        if (res.data.code === 200) {
          views = res.data.data;
        } else {
          views = 0;
        }

        if (views != null && views > 1) {
          msg += "Views: " + views + "\n\n"
        }
        if (views != null && views === 1) {
          msg += "View: 1" + "\n\n"
        }

        msg += "Do you want to open this website?";

        if (confirm(msg)) {
          this.jump(item.url, item.webId);
        }
      }).catch((err) => {
        this.jump(item.url, item.webId);
      });
    },
    // 跳转页面
    jump(url, webId) {
      window.open(url, '_blank');
      this.axios.get("/view/incr?webId=" + webId);
    },
  },

  computed: {
    showMoreBtn() {
      return this.count !== 0
          && this.count % 10 === 0
      // 注意，因为每次 filterLoad 都会加 10
      // ，所以结果一定是 10 的倍数，所以才能这样判断
    }
  },

  created() {
    this.loadAllUser();
  }
}
</script>

<style scoped>

</style>