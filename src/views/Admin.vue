<template>

  <v-card
      class="mx-auto overflow-hidden"
      height="100%"
  >
    <v-app-bar
        color="#ffaa64"
        dark
        dense
        flat
    >
      <v-app-bar-nav-icon @click="drawer = true"></v-app-bar-nav-icon>

      <v-toolbar-title>{{ pageTitle }}</v-toolbar-title>
    </v-app-bar>

    <v-navigation-drawer
        v-model="drawer"
        absolute
        temporary
    >
      <v-list
          nav
          dense
      >
        <v-list-item-group
            v-model="group"
            active-class="orange--text text--accent-4"
        >
          <v-list-item @click="changePage('/admin/admin-notification', 'System Notifications')">
            <v-list-item-title>
              System Notifications
            </v-list-item-title>
          </v-list-item>

          <v-list-item @click="changePage('/admin/admin-log', 'System Logs')">
            <v-list-item-title>Logs</v-list-item-title>
          </v-list-item>

          <v-list-item>
            <v-list-item-title
                @click="changePage('/admin/admin-user', 'List All Users')"
            >
              All Users
            </v-list-item-title>
          </v-list-item>

          <v-list-item>
            <v-list-item-title
                @click="changePage('/admin/admin-bookmark', 'All Visited Bookmarks')"
            >
              Visited Bookmarks
            </v-list-item-title>
          </v-list-item>

          <v-list-item>
            <v-list-item-title
                @click="changePage('/admin/admin-user-bookmark-rank', 'Ranking')"
            >
              Ranking
            </v-list-item-title>
          </v-list-item>

        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>

    <router-view></router-view>
  </v-card>

</template>

<script>

import AdminRegisterNotification from "@/component/AdminRegisterNotification";
import AdminNotification from "@/component/AdminNotification";
import AdminLog from "@/component/AdminLog";

export default {
  name: "Admin",
  components: {AdminLog, AdminNotification, AdminRegisterNotification},
  data: () => ({
    // 是否打开侧边抽屉
    drawer: false,
    // 侧边抽屉相关
    group: null,
    // 页面标题
    pageTitle: 'Admin Panel',
  }),

  methods: {
    // 切换页面
    changePage(link, title) {
      // 切换页面前，检查是否为管理员
      this.axios.get("/user/admin").then(res => {
        // 如果是管理员：
        // 切换标题
        this.pageTitle = title;
        // 切换上方 bar 为管理员面板
        this.$emit('setIsAdminPanel', true);
        // 切换页面
        this.$router.push(link);
      }).catch((error) => {
        if (error.response.data.code === 2009) {
          // 如果不管理员，就退出当前账号
          this.axios.get("/logout");
          // 代码 2009 表示没有权限，此时跳转到登陆页面
          alert("Please Login as Admin!");
        } else {
          alert(error.response.data.msg);
        }
        // 如果不是管理员，跳转到管理员登陆界面
        this.$router.push({
          path: '/login',
          query: {
            isAdminPage: 'true',
          }
        });
      });

    },
  },

  created() {
    this.changePage('/admin/admin-notification', 'System Notifications')
  }
}
</script>

