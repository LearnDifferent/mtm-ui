<template>
  <v-container fill-height>
    <!-- 发送框 -->
    <MarkUrl :username="currentUsername" @showRefresh="showRefresh"/>
    <v-divider></v-divider>
    <br>
    <HomePageButtons :currentUserId="currentUserId"
                     :find-all="findAll"
                     :find-mine="findMine"
                     :find-others="findOthers"
                     :is-out="isOut"
                     :recent="recent"
                     :requested-username="requestedUsername"
                     :requestedUserId="requestedUserId"/>

    <br>
    <v-container class="mx-auto">

      <!-- 刷新 -->
      <v-btn v-show="refreshShow"
             block
             color="orange"
             outlined
             rounded
             @click="refreshPage">
        <v-icon>mdi-cached</v-icon>
        <span>    Something new...</span>
      </v-btn>

      <!-- 网页数据 -->
      <v-row dense>
        <v-col
            v-for="(item, i) in items"
            :key="i"
            cols="12"
        >
          <v-card
              @mouseenter="onThisWebData = item.id"
              @mouseleave="onThisWebData = -1"
              :id="item.id"
          >
            <div class="d-flex flex-no-wrap justify-space-between">
              <div>
                <BookmarkTitle :item="item"/>

                <v-card-actions>

                  <div
                      v-show="item.userName"
                      @mouseover="showExcludeUserBtn = item.id"
                      @mouseleave="showExcludeUserBtn = -1"
                  >
                    <v-chip
                        class="ma-2"
                        color="black"
                        label
                        outlined
                    >
                      <v-icon left @click="toUser(item.userId, item.userName)">
                        {{ currentUserId == item.userId ? 'mdi-account-check' : 'mdi-account' }}
                      </v-icon>
                      <span
                          @click="toUser(item.userId, item.userName)"
                          :style="onThisWebData == item.id ? 'color: black' : 'color: grey' "
                      >
                      {{ item.userName }}
                    </span>
                      <span v-show="!(isOut === 'others')">
                      <v-btn
                          icon
                          small
                          v-show="showExcludeUserBtn == item.id"
                          color="pink"
                          @click="dontShowUser(item.userId, item.userName)"
                      >
                        <v-icon>mdi-eye-off-outline</v-icon>
                      </v-btn>
                    </span>
                    </v-chip>
                  </div>

                  <v-divider
                      class="mx-2"
                      vertical
                  ></v-divider>

                  <v-chip
                      v-show="currentUserId != item.userId"
                      color="green"
                      outlined
                      @click="mark(item)"
                      style="margin-right: 3px"
                  >
                    <v-icon left>
                      mdi-heart-plus
                    </v-icon>
                    Add
                  </v-chip>

                  <BookmarkPrivacy
                      v-show="currentUserId == item.userId"
                      :is-public="item.isPublic"
                      :web-id="item.id"
                      :user-name="item.userName"
                      :id="item.id"
                  />

                  <BookmarkViewButton :item="item"/>

                  <BookmarkCommentButton
                      @openComment="openComment"
                      :key="item.id"
                      :item="item"
                      :show-comment="showComment"/>

                  <BookmarkTagButton :key="item.id" :item="item"
                                     :current-user="currentUsername"
                                     :previous-page-num="currentPage"
                                     previous-page="home"/>

                  <v-chip
                      v-show="currentUserId == item.userId && onThisWebData == item.id"
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

                  <BookmarkTime v-show="onThisWebData == item.id"
                                :creationTime="item.createTime"/>

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
                :currentUsername="currentUsername"
            ></Comment>
          </div>

        </v-col>
      </v-row>

      <!-- 没有内容时提示 -->
      <NoDataInHomePage :refresh-page="refreshPage" :total-page="totalPage"/>

      <!-- 回到顶部按钮 -->
      <ToTopButton/>

      <!-- pagination -->
      <v-row align-content="center" v-show="totalPage !== 0">
        <v-col>
          <v-pagination
              v-model="currentPage"
              :length="totalPage"
              circle
              @input="loadHome(currentPage)"
          ></v-pagination>
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script>
import Comment from "../component/Comment";
import MarkUrl from "../component/MarkUrl";
import HomePageButtons from "../component/HomePageButtons";
import ToTopButton from "@/component/ToTopButton";
import NoDataInHomePage from "@/component/NoDataInHomePage";
import BookmarkTitle from "@/component/BookmarkTitle";
import BookmarkViewButton from "@/component/BookmarkViewButton";
import BookmarkPic from "@/component/BookmarkPic";
import BookmarkPrivacy from "@/component/BookmarkPrivacy";
import BookmarkTagButton from "@/component/BookmarkTagButton";
import BookmarkCommentButton from "@/component/BookmarkCommentButton";
import BookmarkTime from "@/component/BookmarkTime";

export default {
  components: {
    BookmarkTime,
    BookmarkCommentButton,
    BookmarkTagButton,
    BookmarkPrivacy,
    BookmarkPic,
    BookmarkViewButton,
    BookmarkTitle,
    NoDataInHomePage,
    ToTopButton,
    HomePageButtons,
    MarkUrl,
    // 评论区
    Comment: Comment,
  },
  name: "HP",
  data: () => ({
    // 展示模式
    pattern: 'latest-timeline',
    // 被请求的用户 ID
    requestedUserId: -1,
    requestedUsername: '',
    // 分页
    currentPage: 1,
    totalPage: 1,
    // 当前用户
    currentUsername: '',
    // 当前用户 ID
    currentUserId: -1,

    // 存放遍历的 website 的数据：id,userName,url,img,title,desc
    // （还可能有 count 数据和是否公开 isPublic）
    items: '',
    // 显示该 id 的评论
    showComment: -1,
    // 是否现实刷新信息
    refreshShow: false,

    //显示该 web id 帖子的排除用户的按钮
    showExcludeUserBtn: -1,
    // 显示该 web id 帖子的创建时间
    onThisWebData: -1,
    // recent 的一些模式，被选中的有 outline 属性
    isOut: "all",
  }),
  methods: {
    // 显示 refreshShow
    showRefresh() {
      this.refreshShow = true;
    },
    // 查看所有的网页
    findAll() {
      this.recent();
      this.isOut = 'all';
      this.refreshShow = false;
    },
    // 只查看自己的网页
    findMine() {
      this.isOut = 'mine';
      this.pattern = 'user-specific-timeline';
      this.requestedUserId = this.currentUserId;
      this.currentPage = 1;
      this.loadHome(this.currentPage);
      this.refreshShow = false;
    },
    // 只查看别人的收藏网页
    findOthers() {
      this.isOut = 'others';
      // 这里表示剔除当前用户之外的所有用户
      this.pattern = 'timeline-with-blacklist';
      this.requestedUserId = this.currentUserId;
      this.currentPage = 1;
      this.loadHome(this.currentPage);
      this.refreshShow = false;
    },
    // 不查看某人的收藏网页
    dontShowUser(userId, userName) {
      if (userId === this.currentUserId) {
        if (confirm("Don't Show Yours?")) {
          this.findOthers();
        }
      } else {
        if (confirm("Don't Show Bookmarks Shared By " + userName + "?")) {
          this.isOut = 'dontShow';
          this.pattern = 'timeline-with-blacklist';
          this.requestedUserId = userId;
          this.currentPage = 1;
          this.loadHome(this.currentPage);
        }
      }
    },
    // 查找某个用户收藏的所有网页
    toUser(userId, userName) {
      if (userId === this.currentUserId) {
        if (confirm("View Your Bookmarks?")) {
          this.findMine();
        }
      } else {
        if (confirm("View Bookmarks Shared By " + userName + "?")) {
          this.requestedUserId = userId;
          this.requestedUsername = userName;
          this.pattern = 'user-specific-timeline';
          this.currentPage = 1;
          this.loadHome(this.currentPage);
          this.isOut = 'otherOne';
        }
      }
    },

    // 查看最近的帖子
    recent() {
      this.isOut = 'all';
      this.pattern = 'latest-timeline';
      this.currentPage = 1;
      this.loadHome(1);
      this.refreshShow = false;
    },
    // 刷新页面（返回首页）
    refreshPage() {
      // location.reload();
      this.recent();
      this.refreshShow = false;
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
            this.loadHome(this.currentPage);
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
    // 进入主页，获取信息
    loadHome(currentPage) {
      this.items = [];
      this.axios.get("/home", {
        params: {
          "currentPage": currentPage,
          "timeline": this.pattern,
          "requestedUserId": this.requestedUserId
        }
      }).then(res => {
        let data = res.data;
        this.currentUsername = data.currentUsername;
        this.currentUserId = data.currentUserId;
        this.items = data.bookmarksAndTotalPages.bookmarks;
        this.totalPage = data.bookmarksAndTotalPages.totalPages;
        this.requestedUserId = data.requestedUserId;

        if (this.totalPage < this.currentPage && this.totalPage !== 0) {
          this.currentPage = this.totalPage;
          this.loadHome(this.currentPage);
        }

        // 让页面返回顶部
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
      });
    },

    // 打开评论
    openComment(bookmarkId) {
      if (this.showComment == bookmarkId) {
        bookmarkId = -1;
      }
      this.showComment = bookmarkId;
    },

    // 此用户保存已经存放在数据库内的网页
    mark(item) {
      if (confirm("Add it to your Bookmarks?")) {
        let website = {
          title: item.title,
          url: item.url,
          img: item.img,
          desc: item.desc
        };
        this.axios.post("/bookmark", website).then(res => {
          alert(res.data.msg);
          if (res.data.code === 200) {
            // 收藏成功就展示刷新按钮
            this.refreshShow = true;
          }
        }).catch(error => {
          if (error.response.data.code === 2010) {
            // 代码为 2010 表示已经收藏过
            alert(error.response.data.msg);
          }
        });
      }
    },

  },

  created() {
    window.onload = function () {
      document.getElementById("myHomeBtn").click();
    }

    let currentPage = this.$route.query.currentPage;
    if (currentPage !== null && currentPage > 1) {
      this.currentPage = parseInt(currentPage);
    }
    this.loadHome(this.currentPage);
  }
  ,
}
</script>