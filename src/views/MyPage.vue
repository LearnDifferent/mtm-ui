<template>
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
          :outlined="trueMarkedWebsFalseNotifications!==true"
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
          :outlined="trueMarkedWebsFalseNotifications!==false"
          @click="getMyNotifications"
      >
        <v-badge
            :value="newNotificationCount > 0"
            color="red"
            :content="newNotificationCount"
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
          color="yellow darken-2"
          outlined
          @click="getSystemNotifications"
      >
        <v-badge
            :value="hasReadNewSystemNotification == false"
            color="red"
            dot
        >
          <v-icon left>
            mdi-bell-ring-outline
          </v-icon>
          System Notifications
        </v-badge>
      </v-btn>
    </div>

    <MyPageNotification
        ref="myPageNotification"
        v-show="trueMarkedWebsFalseNotifications===false"
        :current-username="user.userName"
        :total-notifications="totalNotifications"
    ></MyPageNotification>

    <v-container class="mx-auto" v-show="trueMarkedWebsFalseNotifications===true">
      <v-row dense>
        <v-col
            v-for="(item, i) in items"
            :key="i"
            cols="12"
        >
          <v-card :id="item.webId">
            <div class="d-flex flex-no-wrap justify-space-between">
              <div>
                <BookmarkTitle :item="item"/>

                <v-card-actions>

                  <BookmarkPrivacy
                      :is-public="item.isPublic"
                      :web-id="item.webId"
                      :user-name="item.userName"
                  />

                  <BookmarkViewButton :item="item"/>

                  <BookmarkCommentButton
                      @openComment="openComment"
                      :key="item.webId"
                      :item="item"
                      :show-comment="showComment"/>

                  <BookmarkTagButton :key="item.webId" :item="item"
                                     :current-user="user.userName"
                                     :previous-page-num="currentPage"
                                     previous-page="mypage"/>

                  <v-chip
                      color="red"
                      outlined
                      @click="delWeb(item.webId, i)"
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
          <div v-show="showComment == item.webId">
            <Comment
                :realWebId="item.webId"
                :webId="showComment"
                :currentUsername="user.userName"
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
</template>

<script>
import Comment from "../component/Comment";
import MyPageTop from "../component/MyPageTop";
import MyPageNotification from "../component/MyPageNotification";
import ToTopButton from "@/component/ToTopButton";
import BookmarkTitle from "@/component/BookmarkTitle";
import BookmarkPrivacy from "@/component/BookmarkPrivacy";
import BookmarkViewButton from "@/component/BookmarkViewButton";
import BookmarkCommentButton from "@/component/BookmarkCommentButton";
import BookmarkTagButton from "@/component/BookmarkTagButton";
import BookmarkPic from "@/component/BookmarkPic";
import BookmarkTime from "@/component/BookmarkTime";

export default {
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
  name: "MyPage",
  data: () => ({
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

    // true 显示网页数据，false 显示回复的通知
    trueMarkedWebsFalseNotifications: '',
    // 回复的通知的数据
    notificationList: '',
    // 消息提醒的总数
    totalNotifications: 0,
    // 新消息的数量
    newNotificationCount: 0,
    // 是否查看了最新的系统消息
    hasReadNewSystemNotification: true,
  }),

  methods: {
    // 打开评论
    openComment(webId) {
      if (this.showComment == webId) {
        webId = -1;
      }
      this.showComment = webId;
    },

    // 加载用户信息
    getPersonalInfo() {
      this.axios.get("mypage").then(res => {
        this.user = res.data.user;
        this.ip = res.data.ip;
        this.totalNotifications = res.data.totalReplyNotifications;
      }).catch((error) => {
        if (error.response.data.code === 2005) {
          this.$router.push("/login")
        }
      });
    },

    // 获取回复我的通知
    getMyNotifications() {
      this.trueMarkedWebsFalseNotifications = false;
      this.$refs.myPageNotification.resetDataAndGetNotifications();
    },

    // 加载当前页面的网页
    getMyWebsDataByCurrentPage() {
      this.getMyWebsData(this.currentPage);
    },
    // 加载收藏的网页
    getMyWebsData(currentPage) {
      this.axios.get("/mypage/bookmarks", {
        params: {
          "currentPage": currentPage,
        }
      }).then(res => {
        // total page
        this.totalPage = res.data.totalPages;

        if (this.totalPage < this.currentPage && this.totalPage !== 0) {
          this.currentPage = this.totalPage;
          this.getMyWebsData(this.currentPage);
        }

        // 网页数据
        this.items = res.data.myBookmarks;

        if (this.items.length === 0) {
          alert("No Bookmarks");
        }

        // 让页面返回顶部
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
      }).catch((error) => {
        if (error.response.data.code === 2005) {
          this.$router.push("/login")
        }
      }).finally(() => {
        this.trueMarkedWebsFalseNotifications = true;
      });
    },

    // 删除收藏的网页
    delWeb(webId, arrayIndex) {
      if (confirm("Are you sure you want to delete it?")) {
        this.axios.delete("/bookmark", {
          params: {
            "webId": webId
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

    // 获取新的回复消息数量
    getNewReplyNotification() {
      this.axios.get("/notify/reply/new").then(res => {
        if (res.data.code === 200) {
          this.newNotificationCount = res.data.data;
        }
      });
    },
    // 是否还未查看新的系统通知
    hasNewSystemNotification() {
      this.axios.get("/notify/read").then(res => {
        if (res.data.code === 200) {
          this.hasReadNewSystemNotification = res.data.data;
        }
      });
    },

    // Get Current User's Role Change Notification
    getRoleChange() {
      this.axios.get("/notify/role-changed").then(res => {
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
        this.axios.delete("/notify/role-changed");
        this.roleChangeMsg = '';
      }
    }
  },

  props: {
    getSystemNotifications: {},
  },

  created() {
    this.getPersonalInfo();
    this.getNewReplyNotification();
    this.hasNewSystemNotification();
    this.getRoleChange();

    let currentPage = this.$route.query.currentPage;
    if (currentPage !== null && currentPage > 0) {
      this.getMyWebsData(currentPage);
    }
  }
}
</script>

<style scoped>

</style>
