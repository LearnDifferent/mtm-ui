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
            <v-list-item-title @click="changePage('/admin/admin-user', 'List All Users')">All Users</v-list-item-title>
          </v-list-item>

          <v-list-item>
            <v-list-item-title>Visited Bookmarks</v-list-item-title>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>

    <router-view></router-view>
    <!-- 临时不显示 -->
    <v-expansion-panels v-show="false" style="margin-top: 1%">

      <!-- Visited Bookmarks -->
      <v-expansion-panel @click="openVisitedBookmarks">
        <v-expansion-panel-header>
          <h3>List All Visited Bookmarks {{ isAdmin ? "" : " (Please Login as Admin)" }}</h3>
        </v-expansion-panel-header>
        <v-expansion-panel-content style="font-size: small" v-if="isAdmin===true">
          Data will be updated every 12 hours. You can
          <a @click="updateViews">
            click here to
            <v-btn class="text-none" color="#93ca76" x-small>
              <v-icon x-small>
                mdi-refresh
              </v-icon>
              Update Immediately
            </v-btn>
          </a>
        </v-expansion-panel-content>
        <v-expansion-panel-content v-if="isAdmin===true">
          <v-card>
            <v-card-title>
              All Visited Bookmarks
              <v-spacer></v-spacer>
            </v-card-title>
            <v-simple-table
                fixed-header
                height="500px"
            >
              <template v-slot:default>
                <thead>
                <tr>
                  <th class="text-left">
                    Views
                  </th>
                  <th class="text-left">
                    ID
                  </th>
                  <th class="text-left">
                    Title
                  </th>
                  <th class="text-left">
                    Username
                  </th>
                  <th class="text-left">
                    Privacy (Edit)
                  </th>
                </tr>
                </thead>
                <tbody>
                <tr
                    v-for="item in visitedBookmarks"
                    :key="item.bookmarkId"
                >
                  <td>{{ item.views }}</td>
                  <td>{{ item.bookmarkId }}</td>
                  <td>
                    <a :href="item.url" target="_blank">{{ item.title }}</a>
                  </td>
                  <td>{{ item.userName }}</td>
                  <td>
                    <v-btn
                        class="text-none"
                        x-small
                        :color="item.isPublic ? 'green' : 'red'"
                        @click="changePrivacy(item.bookmarkId, item.userName, item.isPublic)"
                    >
                      {{ item.isPublic ? 'Public' : 'Private' }}
                    </v-btn>
                  </td>
                </tr>
                </tbody>
              </template>
            </v-simple-table>
          </v-card>

          <!-- pagination -->
          <div
              style="text-align: center;
                  margin-top: 3px"
          >
            <v-btn small rounded @click="changePage(-1, 'getVisitedBookmarks')">
              <v-icon>mdi-skip-previous</v-icon>
            </v-btn>
            <input
                :placeholder="currentPage"
                readonly="readonly"
                style="width:30px;height:30px;text-align: center;border: solid grey;"
            >
            <v-btn small rounded @click="changePage(1, 'getVisitedBookmarks')">
              <v-icon>mdi-skip-next</v-icon>
            </v-btn>
          </div>
          <!-- pagination -->

        </v-expansion-panel-content>

        <!-- 提示注册 Admin -->
        <AdminRegisterNotification :is-admin="isAdmin" :key="key"/>
      </v-expansion-panel>

    </v-expansion-panels>
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

    // current page
    currentPage: 1,

    // 管理员相关
    isAdmin: false,

    // 管理员注册组件的 key
    key: 1,

    // 网页 ID 及其阅读数
    visitedBookmarks: [],
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

    // 限定最大页数，并返回是否有新的数据
    maxPageCheckAndReturnArrayHasNewValue(array) {
      if (array === null || array.length === 0) {
        // 此时已经没有数据
        if (this.currentPage > 1) {
          // 页面如果不是 1 的话，就 -1
          this.currentPage -= 1;
        }
        // 没有新的数据
        alert("No More Data");
        return false;
      }
      // 有新的数据
      return true;
    },

    // 重制页面数据
    resetPageData() {
      this.key++;
      this.currentPage = 1;
    },


    openVisitedBookmarks() {
      this.resetPageData();
      this.getVisitedBookmarks();
    },
    // 获取数据库中的被阅读过的网页的数据
    getVisitedBookmarks() {
      this.axios.get("/bookmark/visited-bookmarks?currentPage=" + this.currentPage).then(res => {
        let array = res.data;
        let hasNewValue = this.maxPageCheckAndReturnArrayHasNewValue(array);
        if (hasNewValue === true) {
          this.visitedBookmarks = array;
        }
      }).catch((error) => {
        if (error.response.data.code === 2009) {
          this.isAdmin = false;
        } else {
          alert(error.response.data.msg);
        }
      });
    },

    // 修改网页的隐私权限
    changePrivacy(id, userName, isPublic) {
      let publicOrPrivate = isPublic ? "private" : "public";
      if (confirm("Are you sure you want to make it "
          + publicOrPrivate + " ?")) {
        this.axios.get("/bookmark/privacy", {
          params: {
            "id": id
          }
        }).then(res => {
          if (res.data.code === 200 || res.data.code === 500) {
            alert(res.data.msg);
            this.getVisitedBookmarks();
          } else {
            alert("Something went wrong... Please try again later.")
          }
        }).catch(error => {
          if (error.response.data.code === 2009
              || error.response.data.code === 2001) {
            // 2009 表示没有权限，2001 表示网页不存在
            alert(error.response.data.msg);
          } else {
            alert("Something went wrong... Please try again later.")
          }
        });
      }
    },


    // 更新阅读量数据
    updateViews() {
      if (confirm("Are you sure you want to update now? It might take a long time.")) {
        this.axios.get("/view/update").then(res => {
          if (res.data.code === 200) {
            let failKeys = res.data.data;
            if (failKeys === null || failKeys.length === 0) {
              alert("Success");
            } else {
              alert("Not Fully Successful.\nHere are the keys that failed to update: \n\n"
                  + failKeys + "\n\n"
                  + "You can check the keys in Redis to fix the error.");
            }
            // refresh
            this.getVisitedBookmarks();
          } else {
            // res.data.code 不是 200 时：
            alert("Something went wrong...");
          }
        }).catch((error) => {
          alert(error.response.data.msg);
        });
      }

    },

  },

  created() {
    this.changePage('/admin/admin-notification', 'System Notifications')
  }
}
</script>

