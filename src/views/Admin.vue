<template>
  <v-container>

    <v-expansion-panels style="margin-top: 1%">

      <v-expansion-panel>
        <v-expansion-panel-header>
          <h3>Send System Notifications</h3>
        </v-expansion-panel-header>

        <v-expansion-panel-content style="font-size: small">
          Note: Everyone has the permission to send
        </v-expansion-panel-content>
        <v-expansion-panel-content style="font-size: small">
          Note: The limit for system notifications is 20
        </v-expansion-panel-content>

        <v-expansion-panel-content>
          <v-textarea
              name="input-7-1"
              filled
              color="grey"
              label="Notification Editor"
              auto-grow
              v-model="noticeCon"
              @keyup.enter="toSendNotify"
          ></v-textarea>
          <v-btn
              color="success"
              class="mr-4 text-none"
              @click="sendNotify"
          >
            <v-icon left>
              mdi-send
            </v-icon>
            Send
          </v-btn>
          <v-btn
              class="mr-4 text-none"
              @click="getSystemNotifications"
          >
            <v-icon left>
              mdi-email-open-outline
            </v-icon>
            View System Notifications
          </v-btn>
          <v-btn
              color="error"
              class="mr-4 text-none"
              @click="delNotify"
          >
            <v-icon left>
              mdi-delete
            </v-icon>
            Delete All System Notifications
          </v-btn>
        </v-expansion-panel-content>
      </v-expansion-panel>


      <v-expansion-panel @click="key++">
        <v-expansion-panel-header>
          <h3>List All Users {{ isAdmin ? "" : " (Please Login as Admin)" }}</h3>
        </v-expansion-panel-header>
        <v-expansion-panel-content style="font-size: small" v-if="isAdmin===true">
          Cache will be refreshed every hour on the hour automatically, or you can
          <v-btn class="text-none" color="#93ca76" @click="refreshAllUsers" x-small>
            <v-icon left x-small>
              mdi-refresh
            </v-icon>
            Refresh Cache Now
          </v-btn>
        </v-expansion-panel-content>
        <v-expansion-panel-content v-if="isAdmin===true">
          <v-card>
            <v-card-title>
              Users
              <v-spacer></v-spacer>
              <v-spacer></v-spacer>
              <v-text-field
                  v-model="search"
                  append-icon="mdi-magnify"
                  label="Search"
                  single-line
                  hide-details
              ></v-text-field>
            </v-card-title>
            <v-data-table
                :headers="headers"
                :items="users"
                :search="search"
            ></v-data-table>
          </v-card>
        </v-expansion-panel-content>

        <!-- 提示注册 Admin -->
        <AdminRegisterNotification :is-admin="isAdmin" :key="key"/>
      </v-expansion-panel>


      <v-expansion-panel @click="key++">
        <v-expansion-panel-header>
          <h3>View Logs {{ isAdmin ? "" : " (Please Login as Admin)" }}</h3>
        </v-expansion-panel-header>
        <v-expansion-panel-content v-if="isAdmin===true">
          <v-card>
            <v-card-title>
              Logs
              <v-spacer></v-spacer>
              <v-text-field
                  v-model="sysSearch"
                  append-icon="mdi-magnify"
                  label="Search"
                  single-line
                  hide-details
              ></v-text-field>
            </v-card-title>
            <v-data-table
                :headers="sysHeaders"
                :items="logs"
                :search="sysSearch"
            ></v-data-table>
          </v-card>
        </v-expansion-panel-content>

        <!-- 提示注册 Admin -->
        <AdminRegisterNotification :is-admin="isAdmin" :key="key"/>

      </v-expansion-panel>


      <v-expansion-panel @click="key++">
        <v-expansion-panel-header>
          <h3>List All Visited Bookmarks {{ isAdmin ? "" : " (Please Login as Admin)" }}</h3>
        </v-expansion-panel-header>
        <v-expansion-panel-content v-if="isAdmin===true">
          <v-card>
            <v-card-title>
              All Visited Bookmarks
              <v-spacer></v-spacer>
            </v-card-title>
            <v-simple-table
                fixed-header
                height="300px"
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
        </v-expansion-panel-content>

        <!-- 提示注册 Admin -->
        <AdminRegisterNotification :is-admin="isAdmin" :key="key"/>
      </v-expansion-panel>

    </v-expansion-panels>

  </v-container>

</template>

<script>

import AdminRegister from "../component/AdminRegister";
import AdminRegisterNotification from "@/component/AdminRegisterNotification";

export default {
  name: "Admin",
  components: {AdminRegisterNotification, AdminRegister},
  data: () => ({
    // 通知相关
    noticeCon: '',

    // 管理员相关
    isAdmin: false,

    // 管理员注册组件的 key
    key: 1,

    success: '',
    // 系统记录相关
    sysSearch: '',
    sysHeaders: [
      {
        text: 'Time',
        align: 'start',
        value: 'optTime',
      },
      {text: 'Title', value: 'title'},
      {text: 'Method', value: 'method'},
      {text: 'Option Type', value: 'optType'},
      {text: 'Status', value: 'status'},
      {text: 'Message', value: 'msg'},
    ],
    logs: '',
    // 所有用户数据相关：
    search: '',
    headers: [
      {
        text: 'ID',
        align: 'start',
        value: 'userId',
      },
      {text: 'Username', value: 'userName'},
      {text: 'Creation Date', value: 'createTime'},
      {text: 'Role', value: 'role'},
    ],
    users: '',
    // 网页 ID 及其阅读数
    visitedBookmarks: [],
  }),

  methods: {
    // 修改网页的隐私权限
    changePrivacy(webId, userName, isPublic) {
      let publicOrPrivate = isPublic ? "private" : "public";
      if (confirm("Are you sure you want to make it "
          + publicOrPrivate + " ?")) {
        this.axios.get("/web", {
          params: {
            "webId": webId,
            "userName": userName
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
    // 删除所有通知
    delNotify() {
      if (confirm("Remove All System Notifications?")) {
        this.axios.delete("/notify").then(res => {
          if (res.data.code == 200) {
            alert("Deleted");
          } else {
            alert("Please wait a minute before you try again");
          }
        });
      }
    },
    // 更新所有用户信息
    refreshAllUsers() {
      this.axios.get("/user").then(res => {
        if (res.data.code === 200) {
          this.users = res.data.data;
          alert("Success");
        } else {
          alert("Something went wrong...");
        }
      }).catch(error => {
        alert("Something went wrong...");
      })
    },

    // 获取随机字符串
    getRandomStr() {
      let text = "";
      let pool = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      for (let i = 0; i < 10; i++)
        text += pool.charAt(Math.floor(Math.random() * pool.length));
      return text;
    },
    // 获取日志信息、所有用户、"是否为管理员"以及注册管理员的验证码
    getInfo() {
      let verifyToken = this.getRandomStr();
      localStorage.setItem("verifyToken", verifyToken);

      this.axios.get("/admin").then(res => {
        this.isAdmin = res.data.admin;
        this.logs = res.data.logs;
        this.users = res.data.users;
        // 如果是 admin，再获取 all visited bookmarks
        if (this.isAdmin === true) {
          this.getVisitedBookmarks();
        }
      }).catch((error) => {
        if (error.response.data.code === 2009) {
          // 代码 2009 表示没有权限，此时获取验证码来注册管理员
          this.getVCode();
        }
        if (error.response.data.code === 2005) {
          // 2005 表示没有登陆
          this.$router.push("/login")
        }
      });
    },

    // 发送通知
    sendNotify() {
      if (this.noticeCon.trim() == '') {
        alert("Please enter something..");
      } else {
        this.axios.get("/notify/send/" + this.noticeCon).then(res => {
          alert(res.data.msg);
        });
        this.noticeCon = '';
      }
    },
    // 回车发送通知
    toSendNotify() {
      this.sendNotify();
    },
    // 获取数据库中的被阅读过的网页的数据
    getVisitedBookmarks() {
      this.axios.get("/view/visited-bookmarks").then(res => {
        if (res.data.code === 200) {
          this.visitedBookmarks = res.data.data;
        }
      }).catch((error) => {
        if (error.response.data.code === 2009) {
          alert("Please Login as Admin");
        } else {
          alert(error.response.data.msg);
        }
      });
    }
  },

  props: {
    getSystemNotifications: {},
  },

  created() {
    this.getInfo();

  }
}
</script>

