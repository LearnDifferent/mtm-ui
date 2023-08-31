<template>
  <v-container class="mx-auto">
    <v-col
        v-for="(notification, i) in notificationList"
        :key="i"
        cols="12"
    >

      <!-- 每一条通知卡片 -->
      <v-card
          class="mx-auto"
          :color="getNotificationCardColor(notification)"
          dark
          outlined
      >
        <!-- 通知标题位置 -->
        <v-card-title style="font-size: medium">
          <!-- 标题图标 -->
          <v-icon left v-show="notification.notificationType === 'REPLY_NOTIFICATION'">
            {{
              notification.replyToCommentId !== null ? 'mdi-message-reply-text'
                  : 'mdi-comment-text-outline'
            }}
          </v-icon>

          <v-icon left v-show="notification.notificationType === 'SYSTEM_NOTIFICATION'">
            mdi-comment-account-outline
          </v-icon>

          <!-- 标题内容 -->
          <!-- 不可以访问 reply notification 时的标题内容-->
          <span v-show="notification.notificationType === 'REPLY_NOTIFICATION'
          && notification.accessStatus !== 'ACCESSIBLE'">
           <del>
              <b>{{ notification.sender === currentUsername ? 'You' : notification.sender }} </b>
              {{
               notification.replyToCommentId !== null ?
                   notification.sender === currentUsername ? 'replied to yourself' : 'replied to you'
                   : 'posted a comment on your activity'
             }}
            </del>
          </span>

          <!-- 可以访问 reply notification 时的标题内容-->
          <span v-show="notification.notificationType === 'REPLY_NOTIFICATION'
          && notification.accessStatus === 'ACCESSIBLE'">
           <b>{{ notification.sender === currentUsername ? 'You' : notification.sender }} </b>
            {{
              notification.replyToCommentId !== null ?
                  notification.sender === currentUsername ? 'replied to yourself :'
                      : 'replied to you :'
                  : 'posted a comment on your activity :'
            }}
          </span>

          <!-- system notification 的标题内容 -->
          <span v-show="notification.notificationType === 'SYSTEM_NOTIFICATION'">
            {{ notification.sender }}
          </span>
        </v-card-title>

        <!-- 通知内容 -->
        <v-card-text
            class="font-weight-bold"
        >
          <!-- Bookmark 不存在的情况-->
          <div v-show="notification.notificationType === 'REPLY_NOTIFICATION'
          && notification.accessStatus === 'BOOKMARK_NOT_EXIST'">
            The bookmark has been deleted or doesn't exist
          </div>

          <!-- Comment 不存在的情况 -->
          <div v-show="notification.notificationType === 'REPLY_NOTIFICATION'
          && notification.accessStatus === 'COMMENT_NOT_EXIST'">
            {{
              notification.replyToCommentId !== null ? 'This reply has been deleted'
                  : 'This comment has been deleted'
            }}
          </div>

          <!-- 没有访问 Bookmark 的权限 -->
          <div
              style="font-size: larger"
              v-show="notification.notificationType === 'REPLY_NOTIFICATION'
                 && notification.accessStatus === 'UNAUTHORIZED'"
          >
            Access to view the bookmark is not granted to the user
          </div>

          <!-- 可以正常查看 reply notification 或 system notification 的情况 -->
          <div
              v-show="
              (notification.notificationType === 'REPLY_NOTIFICATION' && notification.accessStatus === 'ACCESSIBLE')
                || notification.notificationType === 'SYSTEM_NOTIFICATION'"
          >
            {{ notification.message }}
          </div>

        </v-card-text>

        <!-- 通知按钮位置 -->
        <v-card-actions>
          <v-list-item class="grow">
            <!-- 通知按钮位置放置时间 -->
            <v-list-item-content>
              <v-list-item-title style="font-size: small">
                <span :style="'color:' + getCreationTimeColor(notification)">
                  <v-icon :color="getCreationTimeColor(notification)" small>
                    mdi-clock-outline
                  </v-icon>
                  {{ notification.creationTime | dateFormat('YYYY-MM-DD HH:mm') }}
                </span>
              </v-list-item-title>
            </v-list-item-content>

            <!-- 通知按钮 -->
            <v-row
                align="center"
                justify="end"
            >
              <!-- Mark notification as read or unread buttons -->
              <v-col
                  class="shrink"
                  v-show="
                  (notification.accessStatus === 'ACCESSIBLE'
                  || notification.accessStatus === 'UNAUTHORIZED'
                  || notification.notificationType === 'SYSTEM_NOTIFICATION')
                  && notification.isRead == false"
              >
                <v-btn
                    small
                    :color="notification.notificationType === 'REPLY_NOTIFICATION' ? '#bf242a' : '#ff9a00'"
                    class="text-none"
                    @click="markAsRead(notification)"
                    :outlined="notification.notificationType === 'REPLY_NOTIFICATION'"
                >
                  <v-icon left small>mdi-eye</v-icon>
                  Mark as read
                </v-btn>
              </v-col>
              <v-col
                  class="shrink"
                  v-show="
                  (notification.accessStatus === 'ACCESSIBLE'
                  || notification.accessStatus === 'UNAUTHORIZED'
                  || notification.notificationType === 'SYSTEM_NOTIFICATION')
                  && notification.isRead == true"
              >
                <v-btn
                    small
                    :color="notification.notificationType === 'REPLY_NOTIFICATION' ? '#bf242a' : '#ff9a00'"
                    class="text-none"
                    @click="markAsUnread(notification)"
                    :outlined="notification.notificationType === 'REPLY_NOTIFICATION'"
                >
                  <v-icon left small>mdi-eye-off</v-icon>
                  Mark as unread
                </v-btn>
              </v-col>
              <!-- 查看通知详情按钮 -->
              <v-col
                  class="shrink"
                  v-show="notification.notificationType === 'REPLY_NOTIFICATION'
                  && notification.accessStatus === 'ACCESSIBLE'"
              >
                <v-btn
                    small
                    color="#d0576b"
                    class="text-none"
                    @click="openReplyNotification(i, notification)"
                >
                  <v-icon left small>mdi-read</v-icon>
                  View
                </v-btn>
              </v-col>
            </v-row>
          </v-list-item>
        </v-card-actions>
      </v-card>

      <!-- 显示消息通知中的 bookmark 的 reply 详情页 -->
      <div v-show="showNotification==='notify' + i">

        <v-card :id="websiteData.id">
          <div class="d-flex flex-no-wrap justify-space-between">
            <div>
              <v-card-title
                  class="headline"
                  v-text="websiteData.title"
                  @click="view(websiteData)"
              ></v-card-title>

              <v-card-subtitle v-text="websiteData.desc"></v-card-subtitle>

              <v-card-actions>
                <v-chip
                    class="ma-2"
                    color="black"
                    label
                    outlined
                >
                  <v-icon left>
                    {{ currentUsername === websiteData.userName ? 'mdi-account-check' : 'mdi-account' }}
                  </v-icon>
                  {{ websiteData.userName }}
                </v-chip>

                <v-chip
                    color="#bf783a"
                    @click="view(websiteData)"
                    outlined
                    style="margin-right: 3px"
                >
                  <v-icon left>
                    mdi-link-variant
                  </v-icon>
                  View
                </v-chip>

                <v-divider
                    class="mx-2"
                    vertical
                ></v-divider>

                <div>
                  <v-icon>mdi-clock-outline</v-icon>
                  <span style="color: grey;">
                      {{ websiteData.createTime | dateFormat }}
                    </span>
                </div>
              </v-card-actions>
            </div>

            <v-avatar
                class="ma-3"
                size="125"
                tile
                @click="view(websiteData)"
            >
              <v-img :src="websiteData.img"></v-img>
            </v-avatar>
          </div>
        </v-card>

        <comment
            ref="commentArea"
            :current-username="currentUsername"
            :real-web-id="notification.bookmarkId"
            :web-id="notification.bookmarkId"
        ></comment>

      </div>
    </v-col>

    <!-- 加载新通知 -->
    <v-col v-show="totalNotifications > 0 && totalNotifications > countNotifications">
      <v-btn
          block
          :color="this.currentNotificationType === 'REPLY_NOTIFICATION' ? '#ee827c' : '#eebb23'"
          @click="getMyNotifications"
      >
        <v-icon left>
          mdi-refresh
        </v-icon>
        More
      </v-btn>
    </v-col>

  </v-container>
</template>

<script>
import Comment from "./Comment";

export default {
  name: "MyPageNotification",
  components: {Comment},
  data: () => ({
    // 所有通知的总数
    totalNotifications: 0,
    // 需要加载多少条数据
    size: 0,
    // 当前加载了多少条数据
    countNotifications: 0,
    // 消息提醒列表数据
    notificationList: '',
    // 当前用户名
    currentUsername: '',
    // 显示该 id 的消息：id 为: 'notify' + index
    showNotification: null,
    // 网页数据
    websiteData: '',
    // 当前 Notification Type
    currentNotificationType: 'REPLY_NOTIFICATION',
  }),

  methods: {
    // 清除数据并打开通知
    resetDataAndGetNotifications() {
      this.showNotification = null;
      // reset load count
      this.size = 0;
      // reset total notifications count
      this.updateTotalNotificationNumber();
      // get notifications
      this.getMyNotifications();
    },

    updateTotalNotificationNumber() {
      this.axios.get("/notification/count/all", {
        params: {
          "notificationType": this.currentNotificationType
        }
      }).then(res => {
        this.totalNotifications = res.data;
      });
    },

    getNotificationCardColor(notification) {
      let notificationType = notification.notificationType;
      let accessStatus = notification.accessStatus;
      let isRead = notification.isRead;

      if ((notificationType === 'REPLY_NOTIFICATION' && accessStatus === 'ACCESSIBLE') && isRead == true) {
        return '#eebbcb';
      }
      if (notificationType === 'REPLY_NOTIFICATION' && accessStatus === 'ACCESSIBLE' && isRead == false) {
        return '#ee827c';
      }
      if (notificationType === 'REPLY_NOTIFICATION' && accessStatus === 'UNAUTHORIZED') {
        return 'rgba(199,179,112,0.89)';
      }
      if (notificationType === 'SYSTEM_NOTIFICATION' && isRead == true) {
        return 'rgba(248,220,136,0.8)'
      }
      if (notificationType === 'SYSTEM_NOTIFICATION' && isRead == false) {
        return '#eebb23'
      }
      return 'grey';
    },

    getCreationTimeColor(notification) {
      let notificationType = notification.notificationType;
      let isRead = notification.isRead;
      if (notificationType === 'REPLY_NOTIFICATION' && isRead == false) {
        return '#d3cbc6';
      }
      if (notificationType === 'REPLY_NOTIFICATION' && isRead == true) {
        return '#e7e2e1';
      }

      return 'white';
    },

    // 获取回复我的通知
    getMyNotifications() {
      // 让 size + 10
      this.size = this.size + 10;
      this.axios.get("/notification", {
        params: {
          "notificationType": this.currentNotificationType,
          "loadCount": this.size
        }
      }).then(res => {
        this.notificationList = res.data;
        this.countNotifications = this.notificationList.length;
      }).catch(error => {
        let code = error.response.data.code;
        if (code === 2013) {
          // 2013 表示没有数据
          alert("No Notifications Yet");
        } else if (code === 2009) {
          // 2009 表示没有权限
          alert(error.response.data.msg);
        } else {
          alert("Something went wrong... Please try again later.")
        }
      });
    },

    // 跳转页面
    // 打开 view 详情
    view(item) {
      this.axios.get("/view/count", {
        params: {bookmarkId: item.id}
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
          this.jump(item.url, item.id);
        }
      }).catch((err) => {
        this.jump(item.url, item.id);
      });
    },
    // 跳转页面
    jump(url, id) {
      window.open(url, '_blank');
      this.axios.get("/view?bookmarkId=" + id);
    },

    /**
     * 删除该通知
     *
     * @deprecated 通知应该不需要删除
     * @param index 该通知在通知数组中的位置
     * @param notificationData 该通知
     */
    deleteReplyNotification(index, notificationData) {
      if (confirm("Are you sure you want to delete it?")) {
        this.axios.post("/notification", notificationData).then(res => {
          // 删除数组中的元素
          this.notificationList.splice(index, 1);
          // 重置数据
          this.showNotification = '';
          alert("Deleted");
        }).catch(error => {
          alert(error.response.data.msg);
        }).finally(() => {
          this.markAsRead(notificationData);
        });
      }
    },

    // 刷新未读通知
    retrieveUnreadNotifications() {
      this.checkUnreadNotifications(this.currentNotificationType);
    },

    // 标记该评论为 read（已阅读）
    markAsRead(notificationData) {
      this.axios.post("/notification/read", notificationData)
          .finally(() => {
            notificationData.isRead = true;
            this.retrieveUnreadNotifications();
          });
    },

    // 标记该评论为 unread（未阅读）
    markAsUnread(notificationData) {
      this.axios.post("/notification/unread", notificationData)
          .finally(() => {
            notificationData.isRead = false;
            this.retrieveUnreadNotifications();
          });
    },

    // 打开评论通知的内容
    openReplyNotification(index, notificationData) {
      this.showNotification = 'notify' + index;
      this.markAsRead(notificationData);
      this.getWebsiteDataAndContinue(index, notificationData);
    },
    getWebsiteDataAndContinue(index, notificationData) {
      let id = notificationData.bookmarkId;
      this.axios.get("/bookmark/get", {
        params: {
          id: id
        }
      }).then(res => {
        this.websiteData = res.data;
      }).catch(error => {
        let code = error.response.data.code;

        if (code === 2009) {
          // 代码 2009 表示没有权限
          alert("You don't have permission to view the post");
        } else if (code === 2001) {
          // 2001 表示网页数据不存在
          alert("The post doesn't exist");
        } else {
          alert("Something went wrong..");
        }

        this.websiteData = '';
      }).finally(() => {
        this.checkWebsiteDataAndContinue(index, notificationData);
      })
    },
    checkWebsiteDataAndContinue(index, notificationData) {
      if (this.websiteData === '') {
        // 不存在该网页数据，所以重置数据
        this.showNotification = '';
      } else {
        // 存在该网页数据，检查评论是否存在并继续
        this.checkCommentDataAndContinue(index, notificationData);
      }
    },
    checkCommentDataAndContinue(index, notificationData) {
      this.axios.get("/comment", {
        params: {
          id: notificationData.commentId,
          bookmarkId: notificationData.bookmarkId
        }
      }).then(res => {
        if (res.data.code !== 200) {
          // 不等于 200 说明该评论不存在
          alert("The comment does not exist");
          this.showNotification = '';
        } else {
          // 存在该评论的时候，判断并继续
          if (notificationData.replyToCommentId !== null) {
            // replyToCommentId 不为 null，说明是回复
            this.checkReplyDataAndContinue(index, notificationData);
          } else {
            // replyToCommentId 为 null 时，说明是普通的评论
            this.$refs.commentArea[index].openCommentFromOutside(true, notificationData.commentId);
          }
        }
      }).catch(resp => {
        console.log(resp.response.data);
      });
    },
    checkReplyDataAndContinue(index, notificationData) {
      // 获取 replyToCommentId 的评论数据，也就是"被回复的评论"，用于传递值
      this.axios.get("/comment", {
        params: {
          id: notificationData.replyToCommentId,
          bookmarkId: notificationData.bookmarkId
        }
      }).then(res => {
        if (res.data.code === 200) {
          // 200，说明存在
          // 赋值，并传递
          let data = res.data.data;
          this.$refs.commentArea[index].openCommentFromOutside(false,
              notificationData.commentId, data);
        } else {
          // 不存在时，重置数据
          alert("The reply does not exist");
          this.showNotification = '';
        }
      });
    },

    updateCurrentNotificationType(notificationType) {
      this.currentNotificationType = notificationType;
    },
  },

  props: {
    currentUsername: {
      type: String,
      required: true
    },
    checkUnreadNotifications: {
      type: Function,
    }
  },
}
</script>

<style scoped>

</style>