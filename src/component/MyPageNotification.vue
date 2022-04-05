<template>
  <v-container class="mx-auto">
    <v-col
        v-for="(notification, i) in notificationList"
        :key="i"
        cols="12"
    >

      <v-card
          class="mx-auto"
          :color="notification.message === null ? 'grey' : '#ee827c'"
          dark
      >
        <v-card-title style="font-size: medium">
          <v-icon left>
            {{ notification.replyToCommentId !== null ? 'mdi-message-reply-text' : 'mdi-comment-text-outline' }}
          </v-icon>

          <!-- message 为 null，说明不存在 -->
          <span v-show="notification.message === null">
           <del>
              <b>{{ notification.sendUsername === currentUsername ? 'You' : notification.sendUsername }} </b>
              {{
               notification.replyToCommentId !== null ?
                   notification.sendUsername === currentUsername ? 'replied to yourself' : 'replied to you'
                   : 'posted a comment on your activity'
             }}
            </del>
          </span>

          <!-- message 不为 null，说明存在 -->
          <span v-show="notification.message !== null">
           <b>{{ notification.sendUsername === currentUsername ? 'You' : notification.sendUsername }} </b>
            {{
              notification.replyToCommentId !== null ?
                  notification.sendUsername === currentUsername ? 'replied to yourself :' : 'replied to you :'
                  : 'posted a comment on your activity :'
            }}
          </span>
        </v-card-title>

        <v-card-text class="font-weight-bold">
          {{
            notification.message === null ?
                notification.replyToCommentId !== null ?
                    'This reply has been deleted' : 'This comment has been deleted'
                : notification.message
          }}
        </v-card-text>

        <v-card-actions>
          <v-list-item class="grow">
            <v-list-item-content>
              <v-list-item-title style="font-size: small">
                <span style="color: #d3cbc6">
                  <v-icon color="#d3cbc6" small>
                    mdi-clock-outline
                  </v-icon>
                  {{ notification.creationTime | dateFormat('YYYY-MM-DD HH:mm')}}
                </span>
              </v-list-item-title>
            </v-list-item-content>

            <v-row
                align="center"
                justify="end"
            >
              <v-col class="shrink">
                <v-btn
                    small
                    v-show="notification.message !== null"
                    color="#d0576b"
                    class="text-none"
                    @click="openReplyNotification(i, notification)"
                >
                  <v-icon left small>mdi-eye</v-icon>
                  View
                </v-btn>
              </v-col>
              <v-col class="shrink">
                <v-btn
                    small
                    color="#bf242a"
                    class="text-none"
                    @click="deleteReplyNotification(i, notification)"
                >
                  <v-icon left small>mdi-delete</v-icon>
                  Delete
                </v-btn>
              </v-col>
            </v-row>
          </v-list-item>
        </v-card-actions>
      </v-card>

      <!-- 显示通知 -->
      <div v-show="showNotification==='notify' + i">

        <v-card :id="websiteData.webId">
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
            :web-id="notification.webId"
        ></comment>

      </div>
    </v-col>

    <!-- 加载新通知 -->
    <v-col v-show="totalNotifications > 0 && totalNotifications > countNotifications">
      <v-btn
          block
          color="#ee827c"
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
    // 消息提醒的总数
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
  }),

  methods: {
    // 清除数据并打开通知
    resetDataAndGetNotifications() {
      this.showNotification = null;
      this.getMyNotifications();
    },

    // 获取回复我的通知
    getMyNotifications() {

      // 让 size + 10
      this.size = this.size + 10;
      this.axios.get("/notify/reply", {
        params: {
          "lastIndex": this.size
        }
      }).then(res => {
        let code = res.data.code;
        if (code === 200) {
          this.notificationList = res.data.data;
          this.countNotifications = this.notificationList.length;
        } else {
          alert("Something went wrong... Please try again later.")
        }
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
      this.axios.get("/view?webId=" + webId);
    },

    // 删除该通知
    deleteReplyNotification(index, notificationData) {
      if (confirm("Are you sure you want to delete it?")) {
        this.axios.post("/notify/reply/delete", notificationData).then(res => {
          // 删除数组中的元素
          this.notificationList.splice(index, 1);
          // 重置数据
          this.showNotification = '';
          alert("Deleted");
        }).catch(error => {
          alert(error.response.data.msg);
        })
      }
    },

    // 打开评论通知的内容
    openReplyNotification(index, notificationData) {
      this.showNotification = 'notify' + index;
      this.getWebsiteDataAndContinue(index, notificationData);
    },
    getWebsiteDataAndContinue(index, notificationData) {
      let webId = notificationData.webId;
      this.axios.get("/bookmark/get", {
        params: {
          webId: webId
        }
      }).then(res => {
        let code = res.data.code;
        if (code === 200) {
          this.websiteData = res.data.data;
        } else {
          alert("Something went wrong..");
          this.websiteData = '';
        }
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
      this.axios.get("/comment/get?commentId=" + notificationData.commentId).then(res => {
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
      });
    },
    checkReplyDataAndContinue(index, notificationData) {
      // 获取 replyToCommentId 的评论数据，也就是"被回复的评论"，用于传递值
      this.axios.get("/comment/get?commentId=" + notificationData.replyToCommentId).then(res => {
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
    }
  },

  props: {
    currentUsername: {
      type: String,
      required: true
    },
    totalNotifications: {
      type: Number,
      required: true
    }
  },
}
</script>

<style scoped>

</style>