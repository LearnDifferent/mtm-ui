<template>
  <v-app>
    <v-app-bar
        app
        dense
        color="dark"
        dark
    >

      <div class="d-flex align-lg-content-center">
        <a href="https://github.com/LearnDifferent/mtm" target="_blank"
           style="color: whitesmoke; text-decoration:none;">
          <span><v-icon> mdi-github </v-icon> GitHub </span>
        </a>
      </div>

      <v-spacer></v-spacer>
      <div class="d-flex justify-center">

        <v-tabs
            center-active
            color="dark"
        >
          <v-tab id="myHomeBtn" @click="changePage('/home')">
            <v-icon left>mdi-home</v-icon>
            Home
          </v-tab>

          <v-tab id="myFindBtn" @click="changePage('/find')">
            <v-icon left>mdi-magnify</v-icon>
            Search
          </v-tab>

          <v-tab id="myUserBtn" @click="changePage('/user')">
            <v-badge
                :value="hasReadNewSystemNotification == false || newNotificationCount > 0"
                color="red"
                dot
            >
              <v-icon left>mdi-account</v-icon>
              User
            </v-badge>
          </v-tab>
        </v-tabs>
      </div>

      <div class="text-center d-flex order-last">
        <v-btn
            dark
            icon
            small
            color="red darken-2"
            @click="logoutNow()"
        >
          <v-icon>
            mdi-logout
          </v-icon>
        </v-btn>
      </div>

      <v-spacer></v-spacer>
    </v-app-bar>
    <v-main>
      <router-view/>
    </v-main>
  </v-app>
</template>

<script>

export default {
  name: 'App',
  data: () => ({
    hasReadNewSystemNotification: true,
    newNotificationCount: 0,
  }),

  components: {},

  methods: {
    // 切换页面
    changePage(page) {
      this.$router.push({path: page});
      if (page !== '/user') {
        this.getNewNotification();
      }
    },
    // 获取新消息数量
    getNewNotification() {
      // 查看是否查看了最新的系统消息
      this.axios.get("/notification/read").then(res => {
        this.hasReadNewSystemNotification = res.data.code === 200;
      });

      // 如果已经查看了新的系统通知，再看看有没有新的回复通知
      if (this.hasReadNewSystemNotification == true) {
        this.axios.get("/notification/reply/new").then(res => {
          if (res.data.code === 200) {
            this.newNotificationCount = res.data.data;
          }
        });
      }
    },
    // 退出登陆
    logoutNow() {
      if (confirm("Are you sure you want to sign out?")) {
        this.axios.get("/log/out").then(res => {
          if (res.data.code === 200) {
            alert("Good Bye")
            this.$router.push("/login");
          }
        });
      }
    }
  },

  created() {
    this.getNewNotification();
  }
};
</script>

<style scoped>

</style>
