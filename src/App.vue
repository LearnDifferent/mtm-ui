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
        <!-- 用户浏览界面 -->
        <div v-show="!isAdminPanel">
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
                  :value="unreadSysNotifications > 0 || unreadReplies > 0"
                  color="red"
                  dot
              >
                <v-icon left>mdi-account-box-outline</v-icon>
                User
              </v-badge>
            </v-tab>
          </v-tabs>
        </div>

        <!-- 管理员界面 -->
        <div v-show="isAdminPanel" style="color: #f7b977">
          Admin Panel
        </div>

      </div>

      <div class="text-center d-flex order-last">
        <a
            style="color: #e45e32; text-decoration:none;"
            href="javascript:void(0);"
            @click="logoutNow"
        >
        <span>
          Sign Out <v-icon dense color="#e45e32"> mdi-logout </v-icon>
        </span>
        </a>
      </div>

      <v-spacer></v-spacer>
    </v-app-bar>
    <v-main>
      <router-view @setIsAdminPanel="goToAdminPanelIfTrue"/>
    </v-main>
  </v-app>
</template>

<script>

export default {
  name: 'App',
  data: () => ({
    unreadReplies: 0,
    unreadSysNotifications: 0,
    isAdminPanel: false,
  }),

  components: {},

  methods: {
    // 跳转页面
    changePage(page) {
      this.$router.push({path: page});
      this.checkIfHasNewNotifications();
    },
    /**
     * 当页面为管理员面板时，隐藏 tabs，并跳转到管理员页面
     *
     * @param isAdminPanel true 表示当前页面为管理员面板
     */
    goToAdminPanelIfTrue(isAdminPanel) {
      this.isAdminPanel = isAdminPanel;
      if (this.isAdminPanel) {
        this.$router.push("/admin");
      }
    },
    // 获取新消息数量
    checkIfHasNewNotifications() {
      // 查看是否查看了最新的系统消息
      this.axios.get("/notification/count/system").then(res => {
        if (res.data.code === 200) {
          this.unreadSysNotifications = res.data.data;
        }
      });

      // 如果没有未读的系统消息，再查看有没有未读的评论通知
      if (this.unreadSysNotifications === 0) {
        this.axios.get("/notification/count/reply").then(res => {
          if (res.data.code === 200) {
            this.unreadReplies = res.data.data;
          }
        });
      }
    },
    // 退出登陆
    logoutNow() {
      if (confirm("Are you sure you want to sign out?")) {
        this.axios.get("/logout").then(res => {
          if (res.data.code === 200) {
            alert("Good Bye")
            this.$router.push("/login");
          }
        });
      }
    }
  },

  created() {
    this.checkIfHasNewNotifications();
  }
};
</script>

<style scoped>

</style>
