<template>
  <v-container>

    <v-expansion-panels style="margin-top: 1%">

      <SendNotificationPanel :get-system-notifications="getSystemNotifications"/>

      <!-- logs -->
      <v-expansion-panel @click="openLogs">
        <v-expansion-panel-header>
          <h3>View Logs {{ isAdmin ? "" : " (Please Login as Admin)" }}</h3>
        </v-expansion-panel-header>
        <v-expansion-panel-content v-if="isAdmin===true">
          <v-switch
              v-model="isReadFromDb"
              color="green"
              :label="isReadFromDb ? 'Get logs from database directly'
              : 'Get logs from database and and cache memory'"
          ></v-switch>
          <LogsCard :logs="logs"/>

          <!-- pagination -->
          <div
              style="text-align: center;
              margin-top: 3px"
          >
            <v-btn small rounded @click="changePage(-1, 'getLogs')">
              <v-icon>mdi-skip-previous</v-icon>
            </v-btn>
            <input
                :placeholder="currentPage"
                readonly="readonly"
                style="width:30px;height:30px;text-align: center;border: solid grey;"
            >
            <v-btn small rounded @click="changePage(1, 'getLogs')">
              <v-icon>mdi-skip-next</v-icon>
            </v-btn>
          </div>
          <!-- pagination -->

        </v-expansion-panel-content>

        <!-- 提示注册 Admin -->
        <AdminRegisterNotification :is-admin="isAdmin" :key="key"/>

      </v-expansion-panel>

      <!-- users -->
      <v-expansion-panel @click="openUsers">
        <v-expansion-panel-header>
          <h3>List All Users {{ isAdmin ? "" : " (Please Login as Admin)" }}</h3>
        </v-expansion-panel-header>
        <v-expansion-panel-content v-if="isAdmin===true">
          <v-card>
            <v-card-title>
              Users
            </v-card-title>
            <v-simple-table
                fixed-header
                height="500px"
            >
              <template v-slot:default>
                <thead>
                <tr>
                  <th class="text-left">
                    ID
                  </th>
                  <th class="text-left">
                    Username
                  </th>
                  <th class="text-left">
                    Creation Time
                  </th>
                  <th class="text-left">
                    Role (Edit)
                  </th>
                </tr>
                </thead>
                <tbody>
                <tr
                    v-for="item in users"
                    :key="item.userId"
                >
                  <td>{{ item.userId }}</td>
                  <td>{{ item.userName }}</td>
                  <td>{{ item.createTime | dateFormat }}</td>
                  <td>
                    <v-btn
                        class="text-none"
                        x-small
                        :color="item.role === 'admin' ? '#ecc960' : item.role === 'user' ? 'green' : 'white'"
                        @click="changeUserRole(item.userId, item.userName, item.role)"
                    >
                      {{ item.role === 'admin' ? 'Admin' : item.role === 'user' ? 'User' : 'Guest' }}
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
            <v-btn small rounded @click="changePage(-1, 'getUsers')">
              <v-icon>mdi-skip-previous</v-icon>
            </v-btn>
            <input
                :placeholder="currentPage"
                readonly="readonly"
                style="width:30px;height:30px;text-align: center;border: solid grey;"
            >
            <v-btn small rounded @click="changePage(1, 'getUsers')">
              <v-icon>mdi-skip-next</v-icon>
            </v-btn>
          </div>
          <!-- pagination -->

        </v-expansion-panel-content>

        <!-- 提示注册 Admin -->
        <AdminRegisterNotification :is-admin="isAdmin" :key="key"/>
      </v-expansion-panel>

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
                    :key="item.webId"
                >
                  <td>{{ item.views }}</td>
                  <td>{{ item.webId }}</td>
                  <td>
                    <a :href="item.url" target="_blank">{{ item.title }}</a>
                  </td>
                  <td>{{ item.userName }}</td>
                  <td>
                    <v-btn
                        class="text-none"
                        x-small
                        :color="item.isPublic ? 'green' : 'red'"
                        @click="changePrivacy(item.webId, item.userName, item.isPublic)"
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

  </v-container>

</template>

<script>

import AdminRegisterNotification from "@/component/AdminRegisterNotification";
import SendNotificationPanel from "@/component/SendNotificationPanel";
import LogsCard from "@/component/LogsCard";

export default {
  name: "Admin",
  components: {LogsCard, SendNotificationPanel, AdminRegisterNotification},
  data: () => ({
    // current page
    currentPage: 1,


    // 管理员相关
    isAdmin: false,

    // 管理员注册组件的 key
    key: 1,

    // logs
    logs: [],
    // 用户
    users: [],
    // 网页 ID 及其阅读数
    visitedBookmarks: [],

    // True if data is read from database directly
    isReadFromDb: false,
  }),

  methods: {

    // 获取随机字符串
    getRandomStr() {
      let text = "";
      let pool = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      for (let i = 0; i < 10; i++)
        text += pool.charAt(Math.floor(Math.random() * pool.length));
      return text;
    },

    // 获取日志信息、所有用户、"是否为管理员"以及注册管理员的验证码
    checkAdmin() {
      let verifyToken = this.getRandomStr();
      localStorage.setItem("verifyToken", verifyToken);

      this.axios.get("/verification").then(res => {
        // result code 为 200 表示是 admin
        this.isAdmin = res.data.code === 200;
      }).catch((error) => {
        if (error.response.data.code === 2009) {
          // 代码 2009 表示没有权限，此时获取验证码来注册管理员
          this.getVCode();
        } else {
          alert(error.response.data.msg);
        }
      });
    },

    // 切换页面
    changePage(count, mode) {
      if (count === -1 && this.currentPage === 1) {
        // 页面不能 <1
        return;
      }
      this.currentPage += count;
      if (mode === 'getLogs') {
        this.getLogs();
      }
      if (mode === 'getUsers') {
        this.getUsers();
      }
      if (mode === 'getVisitedBookmarks') {
        this.getVisitedBookmarks();
      }

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

    openUsers() {
      this.resetPageData();
      this.getUsers();
    },
    getUsers() {
      this.axios.get("/user/all?currentPage=" + this.currentPage).then(res => {
        let array = res.data;
        let hasNewValue = this.maxPageCheckAndReturnArrayHasNewValue(array);
        if (hasNewValue === true) {
          this.users = array;
        }
      }).catch((error) => {
        if (error.response.data.code === 2009) {
          this.isAdmin = false;
        } else {
          alert(error.response.data.msg);
        }
      });
    },
    // 修改用户角色
    changeUserRole(userId, userName, role) {

      if (role === 'guest') {
        alert("You don't have permission to modify the Guest");
        return;
      }
      let msg;
      let newRole;
      if (role === 'admin') {
        msg = "Do you want to Downgrade '" + userName
            + "' from Admin to Standard User?";
        newRole = 'user';
      } else if (role === 'user') {
        msg = "Do you want to Upgrade '" + userName
            + "' from Standard User to Admin?";
        newRole = 'admin';
      } else {
        alert("You don't have permission to modify this user")
        return;
      }

      if (confirm(msg)) {
        this.sendChangeUserRoleRequest(userId, newRole);
      }
    },
    sendChangeUserRoleRequest(userId, newRole) {
      this.axios.get("/user/role", {
        params: {
          userId: userId,
          newRole: newRole
        }
      }).then(res => {
        if (res.data.code === 200) {
          // 成功的话，刷新列表
          this.getUsers();
        }
        alert(res.data.msg);
      }).catch((error) => {
        alert(error.response.data.msg);
      });
    },

    openLogs() {
      this.resetPageData();
      this.getLogs();
    },
    // 获取 logs
    getLogs() {
      let requestPath = "/system/logs";
      if (this.isReadFromDb) {
        requestPath += "/no-cache"
      }
      this.axios.get(requestPath, {
        params: {
          currentPage: this.currentPage,
        }
      }).then(res => {
        if (res.data.code === 200) {
          let array = res.data.data;
          let hasNewValue = this.maxPageCheckAndReturnArrayHasNewValue(array);
          if (hasNewValue === true) {
            this.logs = array;
          }
        } else {
          alert("Something went wrong...");
        }
      }).catch((error) => {
        if (error.response.data.code === 2009) {
          this.isAdmin = false;
        } else {
          alert(error.response.data.msg);
        }
      });
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
    changePrivacy(webId, userName, isPublic) {
      let publicOrPrivate = isPublic ? "private" : "public";
      if (confirm("Are you sure you want to make it "
          + publicOrPrivate + " ?")) {
        this.axios.get("/bookmark/privacy", {
          params: {
            "webId": webId
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

  props: {
    getSystemNotifications: {},
  },

  created() {
    this.checkAdmin();
  }
}
</script>

