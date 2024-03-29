<template>
  <div>
    <v-container>
      <v-alert
          v-show="roleChangeMsg !== ''"
          icon="mdi-close-circle-outline"
          color="#e6b422"
          @click="clearRoleChangeMsg"
      >
        {{ roleChangeMsg }}
      </v-alert>

      <MyPageTop
          :user="user"
          :ip="ip"
          @getMyWebsDataByCurrentPage="getMyWebsDataByCurrentPage"
      ></MyPageTop>

      <v-divider></v-divider>

      <div style="text-align: center;margin-top: 1%">
        <v-btn
            class="text-none text-center"
            color="green"
            :outlined="currentDisplayType !== 'BOOKMARK'"
            @click="getMyWebsData(1)"
        >
          <v-icon left>
            mdi-bookmark-check
          </v-icon>
          Bookmarks
        </v-btn>

        <v-divider
            class="mx-2"
            vertical
        ></v-divider>

        <v-btn
            class="text-none text-center"
            color="#ee827c"
            :outlined="currentDisplayType !== 'REPLY_NOTIFICATION'"
            @click="getNotifications('REPLY_NOTIFICATION')"
        >
          <v-badge
              :value="unreadRepliesCount > 0"
              color="red"
              :content="unreadRepliesCount"
          >
            <v-icon left>
              mdi-at
            </v-icon>
            My Notifications
          </v-badge>
        </v-btn>

        <v-divider
            class="mx-2"
            vertical
        ></v-divider>


        <v-btn
            class="text-none text-center"
            color="#eec362"
            :outlined="currentDisplayType !== 'SYSTEM_NOTIFICATION'"
            @click="getNotifications('SYSTEM_NOTIFICATION')"
        >
          <v-badge
              :value="unreadSysNotificationsCount > 0"
              color="red"
              :content="unreadSysNotificationsCount"
          >
            <v-icon left>
              mdi-earth
            </v-icon>
            System Notifications
          </v-badge>
        </v-btn>


        <v-divider
            class="mx-2"
            vertical
        ></v-divider>

        <v-btn
            v-show="isNotificationOff !== null"
            class="text-none text-center"
            :color="isNotificationOff ? '#006e54' : 'red'"
            outlined
            @click="turnOnTurnOffNotifications"
        >
          <v-icon left>
            {{ isNotificationOff ? 'mdi-bell-ring-outline' : 'mdi-bell-off' }}
          </v-icon>
          {{ isNotificationOff ? 'Unmute Notifications' : 'Mute Notifications' }}
        </v-btn>

      </div>

      <MyPageNotification
          ref="myPageNotification"
          v-show="currentDisplayType === 'REPLY_NOTIFICATION' || currentDisplayType === 'SYSTEM_NOTIFICATION'"
          :current-username="user.userName"
          :checkUnreadNotifications="checkUnreadNotifications"
      ></MyPageNotification>

      <v-container class="mx-auto" v-show="currentDisplayType === 'BOOKMARK'">
        <v-row dense>
          <v-col
              v-for="(item, i) in items"
              :key="i"
              cols="12"
          >
            <v-card :id="item.id">
              <div class="d-flex flex-no-wrap justify-space-between">
                <div>
                  <BookmarkTitle :item="item"/>

                  <v-card-actions>

                    <BookmarkPrivacy
                        :is-public="item.isPublic"
                        :web-id="item.id"
                        :user-name="item.userName"
                    />

                    <BookmarkViewButton :item="item"/>

                    <BookmarkCommentButton
                        @openComment="openComment"
                        :key="item.id"
                        :item="item"
                        :show-comment="showComment"/>

                    <BookmarkTagButton :key="item.id" :item="item"
                                       :current-user="user.userName"
                                       :previous-page-num="currentPage"
                                       previous-page="user"/>

                    <v-chip
                        color="red"
                        outlined
                        @click="delWeb(item.id, i)"
                        style="margin-right: 3px"
                    >
                      <v-icon left>
                        mdi-trash-can-outline
                      </v-icon>
                      Delete
                    </v-chip>

                    <BookmarkTime :creationTime="item.createTime"/>

                  </v-card-actions>
                </div>

                <BookmarkPic :item="item"/>
              </div>
            </v-card>

            <!-- 评论区 -->
            <div v-show="showComment == item.id">
              <Comment
                  :realWebId="item.id"
                  :webId="showComment"
                  :currentUsername="user.userName"
                  :key="item.id"
              ></Comment>
            </div>

          </v-col>
        </v-row>

        <v-row align-content="center" v-show="totalPage !== 0">
          <v-col>
            <v-pagination
                v-model="currentPage"
                :length="totalPage"
                circle
                @input="getMyWebsData(currentPage)"
            ></v-pagination>
          </v-col>
        </v-row>
      </v-container>
      <ToTopButton/>

    </v-container>

    <v-snackbar
        v-model="snackbar"
        vertical
    >
      <span v-html="notice"></span>

      <template v-slot:action="{ attrs }">
        <v-btn
            color="red"
            text
            v-bind="attrs"
            @click="snackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>

import BookmarkTime from "@/component/BookmarkTime";
import BookmarkPic from "@/component/BookmarkPic";
import BookmarkTagButton from "@/component/BookmarkTagButton";
import BookmarkCommentButton from "@/component/BookmarkCommentButton";
import BookmarkViewButton from "@/component/BookmarkViewButton";
import BookmarkPrivacy from "@/component/BookmarkPrivacy";
import BookmarkTitle from "@/component/BookmarkTitle";
import ToTopButton from "@/component/ToTopButton";
import MyPageTop from "@/component/MyPageTop";
import MyPageNotification from "@/component/MyPageNotification";
import Comment from "@/component/Comment";

export default {
  name: "UserPage",
  data: () => ({
    // 是否关闭了通知
    isNotificationOff: null,

    // User Role 变化的通知
    roleChangeMsg: '',
    // 收藏的网页
    items: '',
    // 分页
    currentPage: 1,
    totalPage: 1,

    // 当前用户
    user: '',
    // 当前 IP
    ip: '',
    // response 信息
    status: '',
    // 显示该 webId 的评论
    showComment: -1,

    // 回复的通知的数据
    notificationList: '',

    // 未读的回复消息数量
    unreadRepliesCount: 0,

    // 是否有未读的系统通知
    // hasUnreadSystemNotifications: false,
    // 未读的系统通知数量
    unreadSysNotificationsCount: 0,


    // 展示通知相关
    snackbar: false,
    notice: '',

    // 当前显示的内容
    // REPLY_NOTIFICATION 表示回复通知，SYSTEM_NOTIFICATION 表示系统通知，BOOKMARK 表示查看书签
    currentDisplayType: null,
  }),

  components: {
    BookmarkTime,
    BookmarkPic,
    BookmarkTagButton,
    BookmarkCommentButton,
    BookmarkViewButton,
    BookmarkPrivacy,
    BookmarkTitle,
    ToTopButton,
    MyPageTop,
    MyPageNotification,
    // 评论区
    Comment
  },

  watch: {
    currentDisplayType(newVal) {
      this.$refs.myPageNotification.updateCurrentNotificationType(newVal);
    }
  },

  methods: {
    // 打开评论
    openComment(bookmarkId) {
      if (this.showComment == bookmarkId) {
        bookmarkId = -1;
      }
      this.showComment = bookmarkId;
    },

    // 加载用户信息
    getPersonalInfo() {
      this.axios.get("/user").then(res => {
        this.user = res.data.user;
        this.ip = res.data.ip;
      });
    },

    // 获取回复我的通知
    getNotifications(notificationType) {
      // 重置 currentDisplayType
      this.currentDisplayType = notificationType;
      // 重置子组件的 currentNotificationType
      this.$refs.myPageNotification.updateCurrentNotificationType(notificationType)
      // 在子组件中获取通知
      this.$refs.myPageNotification.resetDataAndGetNotifications();
    },

    // 加载当前页面的网页
    getMyWebsDataByCurrentPage() {
      this.getMyWebsData(this.currentPage);
    },
    // 加载收藏的网页
    getMyWebsData(currentPage) {
      this.axios.get("/bookmark/get/user", {
        params: {
          "currentPage": currentPage,
        }
      }).then(res => {
        // total pages
        this.totalPage = res.data.totalPages;

        if (this.totalPage < this.currentPage && this.totalPage !== 0) {
          this.currentPage = this.totalPage;
          this.getMyWebsData(this.currentPage);
        }

        this.items = res.data.bookmarks;

        if (this.items.length === 0) {
          alert("No Bookmarks");
        } else {
          this.currentPage = currentPage;
        }

        // 让页面返回顶部
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
      }).finally(() => {
        this.currentDisplayType = 'BOOKMARK';
      });
    },

    // 删除收藏的网页
    delWeb(id, arrayIndex) {
      if (confirm("Are you sure you want to delete it?")) {
        this.axios.delete("/bookmark", {
          params: {
            "id": id
          }
        }).then(res => {
          if (res.data.code === 3001) {
            // 3001 表示删除成功
            alert(res.data.msg);
            this.items.splice(arrayIndex, 1);
            if (this.items.length === 0) {
              this.getMyWebsData(this.currentPage);
            }
          } else {
            alert(res.data.msg);
          }
        }).catch(error => {
          if (error.response.data.code === 2009) {
            // 2009 表示没有权限
            alert(error.response.data.msg);
          } else {
            alert("Something went wrong... Please try again later.")
          }
        });
      }
    },

    checkUnreadNotifications(notificationType) {
      if (notificationType === 'REPLY_NOTIFICATION') {
        this.countUnreadReplies();
      }
      if (notificationType === 'SYSTEM_NOTIFICATION') {
        this.countUnreadSysNotifications();
      }
    },

    // 获取未读回复消息数量
    countUnreadReplies() {
      this.axios.get("/notification/count/reply").then(res => {
        if (res.data.code === 200) {
          this.unreadRepliesCount = res.data.data;
        }
      });
    },

    // 获取新的系统消息数量
    countUnreadSysNotifications() {
      this.axios.get("/notification/count/system").then(res => {
        if (res.data.code === 200) {
          this.unreadSysNotificationsCount = res.data.data;
        }
      });
    },

    /**
     * 获取是否有未读的系统通知
     * @deprecated
     */
    checkIfHasUnreadSystemNotification() {
      this.axios.get("/notification/system").then(res => {
        this.hasUnreadSystemNotifications = res.data;
      });
    },

    // Get Current User's Role Change Notification
    getRoleChange() {
      this.axios.get("/notification/role-changed").then(res => {
        if (res.data.code === 200) {
          this.roleChangeMsg = res.data.data;
        } else if (res.data.code === 2002) {
          this.roleChangeMsg = '';
        } else {
          // 自定义……
          this.roleChangeMsg = '';
        }
      })
    },
    // clear the role change notification
    clearRoleChangeMsg() {
      if (confirm("Clear this message")) {
        this.axios.delete("/notification/role-changed");
        this.roleChangeMsg = '';
      }
    },

    // turn on / off notifications
    turnOnTurnOffNotifications() {
      let msg = this.isNotificationOff ? "Do you want to unmute notifications?"
          : "Do you want to mute notifications?";
      if (confirm(msg)) {
        this.axios.get("/notification/mute/switch");
        alert("Success");
        location.reload();
      }
    },

    // 是否打开了通知
    checkIfNotificationOff() {
      this.axios.get("/notification/mute").then(res => {
        let code = res.data.code;
        if (code === 200) {
          this.isNotificationOff = true;
        }
        if (code === 500) {
          this.isNotificationOff = false;
        }
      })
    },
  },

  created() {
    window.onload = function () {
      document.getElementById("myUserBtn").click();
    }
    this.getPersonalInfo();
    this.countUnreadReplies();
    this.countUnreadSysNotifications();
    this.getRoleChange();
    this.checkIfNotificationOff();

    let currentPage = this.$route.query.currentPage;
    if (currentPage !== null && currentPage > 0) {
      this.getMyWebsData(parseInt(currentPage));
    }
  }
}
</script>

<style scoped>

</style>