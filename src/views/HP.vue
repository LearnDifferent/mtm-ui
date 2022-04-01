<template>
  <v-container fill-height>
    <!-- 发送框 -->
    <MarkUrl :username="currentUser" @showRefresh="showRefresh"/>
    <v-divider></v-divider>
    <br>
    <HomePageButtons :click-filter="clickFilter" :click-most="clickMost"
                     :click-recent="clickRecent"
                     :current-user="currentUser" :filter="filter" :find-all="findAll"
                     :find-mine="findMine" :find-others="findOthers" :is-out="isOut"
                     :most-mark="mostMark" :recent="recent"
                     :show-selected-user="showSelectedUser" :to-user-name="toUserName"/>

    <br>
    <v-container class="mx-auto">

      <!-- 数据筛选模块 -->
      <FilterWebsiteData
          v-show="clickFilter"
          :user-to-select="userToSelect"
          :count="count"
          @filterNewRequestSend="filterNewRequestSend"
      ></FilterWebsiteData>

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
          <!-- 不显示的情况，需要满足：
          1. 在 clickRecent 下
          2. isOut 是 all 或者 mine
          3. isPublic 为 false，也就是私有
          4. 该 website 的所有者不是当前用户
          只有者四个情况同时满足，才不会显示，否则，就显示出来
          -->
          <v-card
              @mouseenter="mouseEnterMethod(item, i)"
              @mouseleave="onThisWebData = -1"
              :id="item.webId"
              v-show="!(clickRecent
              && (isOut == 'all' || isOut == 'mine')
              && !item.isPublic
              && currentUser!=item.userName)"
          >
            <div class="d-flex flex-no-wrap justify-space-between">
              <div>
                <v-card-title
                    class="headline"
                    v-text="item.title"
                    @click="view(item)"
                ></v-card-title>

                <v-card-subtitle v-text="item.desc"></v-card-subtitle>

                <v-card-actions v-show="clickFilter">
                  <v-chip
                      class="ma-2"
                      color="#8AC007"
                      label
                      outlined
                  >
                    <v-icon left>
                      mdi-account-circle-outline
                    </v-icon>
                    {{ item.userName }}
                  </v-chip>
                  <v-chip
                      class="ma-2"
                      color="#8AC009"
                      label
                      outlined
                  >
                    <v-icon left>
                      mdi-clock-outline
                    </v-icon>
                    {{ item.createTime | dateFormat('YYYY-MM-DD HH:mm') }}
                  </v-chip>
                </v-card-actions>

                <v-card-actions v-show="!clickFilter">

                  <div
                      v-show="item.userName"
                      @mouseover="showExcludeUserBtn = item.webId"
                      @mouseleave="showExcludeUserBtn = -1"
                  >
                    <v-chip
                        class="ma-2"
                        color="black"
                        label
                        outlined
                    >
                      <v-icon left @click="toUser(item.userName)">
                        {{ currentUser == item.userName ? 'mdi-account-check' : 'mdi-account' }}
                      </v-icon>
                      <span
                          @click="toUser(item.userName)"
                          :style="onThisWebData == item.webId ? 'color: black' : 'color: grey' "
                      >
                      {{ item.userName }}
                    </span>
                      <span v-show="showCloseIcon">
                      <v-btn
                          icon
                          small
                          v-show="showExcludeUserBtn == item.webId"
                          color="pink"
                          @click="dontShowUser(item.userName)"
                      >
                        <v-icon>mdi-eye-off-outline</v-icon>
                      </v-btn>
                    </span>
                    </v-chip>
                  </div>

                  <v-divider
                      v-show="clickRecent"
                      class="mx-2"
                      vertical
                  ></v-divider>

                  <v-chip
                      v-show="currentUser!=item.userName"
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

                  <v-chip
                      v-show="currentUser==item.userName"
                      :color="item.isPublic ? 'green' : 'pink'"
                      :text-color="item.isPublic ? 'green' : 'pink'"
                      outlined
                      @click="changePrivacy(item.webId, item.userName, item.isPublic)"
                      style="margin-right: 3px"
                  >
                    <v-icon left>{{ item.isPublic ? "mdi-eye" : "mdi-eye-off" }}</v-icon>
                    {{ item.isPublic ? "Public" : "Private" }}
                  </v-chip>

                  <v-chip
                      color="#bf783a"
                      @click="view(item)"
                      outlined
                      style="margin-right: 3px"
                  >
                    <v-icon left>
                      mdi-link-variant
                    </v-icon>
                    View
                  </v-chip>

                  <v-chip
                      v-show="clickRecent"
                      color="#84a2d4"
                      @click="openComment(item.webId)"
                      outlined
                      style="margin-right: 3px"
                  >
                    <v-icon left>
                      {{ showComment == item.webId ? 'mdi-comment-remove-outline' : 'mdi-comment-outline' }}
                    </v-icon>
                    Comment {{ item.commentCount > 0 ? '(' + item.commentCount + ')' : '' }}
                  </v-chip>

                  <v-chip
                      v-show="clickRecent"
                      color="#683f36"
                      @click="openTag(item)"
                      outlined
                      style="margin-right: 3px"
                  >
                    <v-icon left>
                      mdi-tag-multiple-outline
                    </v-icon>
                    Tag <span v-show="item.tagName">: {{ item.tagName }}</span>
                  </v-chip>

                  <v-chip
                      v-show="currentUser == item.userName && onThisWebData == item.webId"
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

                  <div v-show="onThisWebData == item.webId && clickRecent">
                    <v-icon>mdi-clock-outline</v-icon>
                    <span style="color: grey;" v-show="!item.count">
                      {{ item.createTime | dateFormat('YYYY-MM-DD HH:mm') }}
                    </span>
                  </div>

                  <v-divider
                      v-show="clickMost"
                      class="mx-2"
                      vertical
                  ></v-divider>

                  <div style="color: grey" v-show="item.count">Saved by {{ item.count }} user<span
                      v-show="item.count > 1">s</span>
                  </div>

                </v-card-actions>
              </div>

              <v-avatar
                  class="ma-3"
                  size="125"
                  tile
                  @click="view(item)"
              >
                <v-img :src="item.img"></v-img>
              </v-avatar>
            </div>

          </v-card>

          <!-- 评论区 -->
          <div v-show="showComment == item.webId && clickRecent">
            <Comment :webId="showComment"
                     :currentUsername="currentUser"
                     :totalComments="item.commentCount"
            ></Comment>
          </div>

        </v-col>
      </v-row>

      <!-- 没有内容时提示 -->
      <v-alert
          prominent
          type="warning"
          v-show="totalPage===0&&!clickFilter"
      >
        <v-row align="center">
          <v-col class="grow">
            No Data Available
          </v-col>
          <v-col class="shrink">
            <v-btn @click="refreshPage">
              <v-icon>
                mdi-home
              </v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-alert>

      <!-- 回到顶部按钮 -->
      <v-btn
          fab
          large
          dark
          bottom
          right
          absolute
          @click="toTop"
      >
        <v-icon>mdi-rocket</v-icon>
      </v-btn>

      <!-- 点击加载更多数据 -->
      <v-btn
          block
          color="yellow"
          v-show="showMoreBtn"
          @click="filterSendRequest"
      >
        <v-icon left>
          mdi-refresh
        </v-icon>
        More
      </v-btn>

      <!-- 分页：总数大于 0，或者没有点击筛选的时候才显示 -->
      <v-row align-content="center" v-show="totalPage !== 0&&!clickFilter">
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
import FilterWebsiteData from "../component/FilterWebsiteData";
import MarkUrl from "../component/MarkUrl";
import HomePageButtons from "../component/HomePageButtons";

export default {
  components: {
    HomePageButtons,
    MarkUrl,
    // 评论区
    Comment: Comment,
    // 数据筛选
    FilterWebsiteData: FilterWebsiteData
  },
  name: "HP",
  data: () => ({
    // 展示模式
    pattern: 'latest',
    // 跳转的用户
    toUserName: '',
    // 分页
    currentPage: 1,
    totalPage: 1,
    // 当前用户
    currentUser: '',

    // myWebs 存放遍历的 website 的数据：webId,userName,url,img,title,desc
    // （还可能有 count 数据和是否公开 isPublic）
    items: '',
    // 显示该 webId 的评论
    showComment: -1,


    // 是否现实刷新信息
    refreshShow: false,

    //显示该 web id 帖子的排除用户的按钮
    showExcludeUserBtn: -1,
    // 显示该 web id 帖子的创建时间
    onThisWebData: -1,
    // recent 的一些模式，被选中的有 outline 属性
    isOut: "all",
    // 是否点击了 recent
    clickRecent: true,
    // 是否点击了 most
    clickMost: false,
    // 是否点击了 filter
    clickFilter: false,
    // Filter 相关内容
    // 用于筛选：有 userName 和 webCount 的列表
    userToSelect: [],
    // 默认展示 10 条，每次加 10
    filterLoad: 10,
    // 筛选出来的结果的条数，如果新加载的条数和原来保存的条数相同，说明没有新的数据
    count: 0,
    // 子组件中得来的数据：usernames, dates, ifOrderByTime, ifDesc
    usernames: [],
    dates: [],
    ifOrderByTime: false,
    ifDesc: false,
  }),
  methods: {
    // 打开标签页
    openTag(item) {
      this.$router.push({
        name: 'web',
        params: {
          item: item,
          tagMode: true,
          previousPage: 'home',
          previousPageNum: this.currentPage,
          currentUser: this.currentUser,
        }
      });
    },

    // 显示 refreshShow
    showRefresh() {
      this.refreshShow = true;
    },

    // 鼠标在进入时候的方法
    mouseEnterMethod(item, i) {
      let webId = item.webId;
      this.onThisWebData = webId;
      // 在没有 tag 属性的时候，获取 tag
      if (!this.items[i].tagName) {
        this.getFirstTag(webId, i);
      }
    },
    // 获取第一个 tag
    getFirstTag(webId, i) {
      this.axios.get("/tag/first?webId=" + webId).then(res => {
        if (res.data.code === 200) {
          this.items[i].tagName = res.data.data;
        }
      }).catch(error => {
        // do nothing...
      });
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
      this.pattern = 'user';
      this.toUserName = this.currentUser;
      this.currentPage = 1;
      this.loadHome(this.currentPage);
      this.refreshShow = false;
    },
    // 只查看别人的收藏网页
    findOthers() {
      this.isOut = 'others';
      // 这里表示剔除当前用户之外的所有用户
      this.pattern = 'block';
      this.toUserName = this.currentUser;
      this.currentPage = 1;
      this.loadHome(this.currentPage);
      this.refreshShow = false;
    },
    // 不查看某人的收藏网页
    dontShowUser(userName) {
      if (userName === this.currentUser) {
        if (confirm("Don't Show Yours?")) {
          this.findOthers();
        }
      } else {
        if (confirm("Don't Show Bookmarks Shared By " + userName + "?")) {
          this.isOut = 'dontShow';
          this.pattern = 'block';
          this.toUserName = userName;
          this.currentPage = 1;
          this.loadHome(this.currentPage);
        }
      }
    },
    // 查找某个用户收藏的所有网页
    toUser(userName) {
      if (userName === this.currentUser) {
        if (confirm("View Your Bookmarks?")) {
          this.findMine();
        }
      } else {
        if (confirm("View Bookmarks Shared By " + userName + "?")) {
          this.toUserName = userName;
          this.pattern = 'user';
          this.currentPage = 1;
          this.loadHome(this.currentPage);
          this.isOut = 'otherOne';
        }
      }
    },
    // 过滤相关
    // 点击过滤的最顶层选项
    filter() {
      this.clickFilter = true;
      this.clickRecent = false;
      this.clickMost = false;
      // 先清除网页数据记录
      this.items = '';
      this.totalPage = 0;
      this.refreshShow = false;
      // 再重置已有的筛选数据
      this.filterLoad = 10;
      this.count = 0;

      // 获取可供筛选的用户信息
      this.axios.get("/home/filter").then(res => {
        if (res.data.code === 200) {
          this.userToSelect = res.data.data;
        } else {
          alert("No Results");
        }
      });
    },
    // 点击发送筛选按钮：发送新的筛选请求
    filterNewRequestSend(usernames, dates, ifOrderByTime, ifDesc) {
      // 重置筛选的数据
      this.filterLoad = 10;
      this.count = 0;
      // 赋值
      this.usernames = usernames;
      this.dates = dates;
      this.ifOrderByTime = ifOrderByTime;
      this.ifDesc = ifDesc;
      this.filterSendRequest();
    },
    // 发送筛选请求
    filterSendRequest() {
      let data = {
        usernames: this.usernames,
        datetimeList: this.dates,
        load: this.filterLoad,
        isOrderByUsername: !this.ifOrderByTime,
        isDesc: this.ifDesc
      };

      this.axios.post("/home/filter", data).then(res => {
        // 网页数据
        let webs = res.data.data;
        this.items = webs;
        // 网页数据的数量
        let count = webs.length;
        if (count === 0) {
          alert("No Result Found...");
          // 重置数据
          this.filterLoad = 10;
          this.count = 0;
        } else if (count === this.count) {
          alert("No More Results");
        } else {
          // 统计加载的数量
          this.count = count;
          // 每次都新增 10
          this.filterLoad += 10;
        }
      });
    },
    // 查看最近的帖子
    recent() {
      this.clickRecent = true;
      this.clickMost = false;
      this.clickFilter = false;
      this.isOut = 'all';
      this.pattern = 'latest';
      this.currentPage = 1;
      this.loadHome(1);
      this.refreshShow = false;
    },
    // 按照最多收藏排序（注意，这种情况没有用户名，而有收藏次数）
    mostMark() {
      this.clickMost = true;
      this.clickRecent = false;
      this.clickFilter = false;
      this.pattern = 'popular';
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
    // 更新网页数据的隐私设置
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
            this.loadHome(this.currentPage);
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
    // 删除收藏的网页
    delWeb(webId, arrayIndex) {
      if (confirm("Are you sure you want to delete it?")) {
        this.axios.delete("/web", {
          params: {
            "webId": webId,
            "userName": this.currentUser
          }
        }).then(res => {
          if (res.data.code === 3001) {
            // 3001 表示删除成功
            alert(res.data.msg);
            this.items.splice(arrayIndex, 1);
            if (this.items.length === 0) {
              this.loadHome(this.currentPage);
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
    // 进入主页后，获取信息
    loadHome(currentPage) {
      this.axios.get("/home", {
        params: {
          "currentPage": currentPage,
          "timeline": this.pattern,
          "requestedUsername": this.toUserName
        }
      }).then(res => {
        this.currentUser = res.data.currentUser;
        this.items = res.data.websiteDataInfo.webs;
        this.totalPage = res.data.websiteDataInfo.totalPage;
        this.toUserName = res.data.requestedUsername;

        if (this.totalPage < this.currentPage && this.totalPage !== 0) {
          this.currentPage = this.totalPage;
          this.loadHome(this.currentPage);
        }

        // 让页面返回顶部
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
      }).catch((error) => {
        if (error.response.data.code === 2005) {
          this.$router.push("/login");
        }
      });
    },


    // 打开评论
    openComment(webId) {
      if (this.showComment == webId) {
        webId = -1;
      }
      this.showComment = webId;
    },
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
      this.axios.get("/view/incr?webId=" + webId);
    },
    // 页面回到顶部
    toTop() {
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    }
    ,
    // 此用户保存已经存放在数据库内的网页
    mark(item) {
      if (confirm("Add it to your Bookmarks?")) {
        let website = {
          title: item.title,
          url: item.url,
          img: item.img,
          desc: item.desc
        };
        this.axios.post("/web/existing", website, {
          params: {userName: this.currentUser}
        }).then(res => {
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
  computed: {

    showMoreBtn() {
      return this.count !== 0
          && this.clickFilter
          && this.count % 10 === 0
      // 注意，因为每次 filterLoad 都会加 10
      // ，所以结果一定是 10 的倍数，所以才能这样判断
    }
    ,
    showSelectedUser() {
      return !(this.clickFilter || this.clickMost);
    }
    ,
    showCloseIcon() {
      return !(this.clickFilter || this.clickMost || this.isOut === 'others');
    }
  }
  ,
  created() {
    window.onload = function () {
      document.getElementById("myHomeBtn").click();
    }

    let currentPage = this.$route.query.currentPage;
    if (currentPage !== null && currentPage > 1) {
      this.currentPage = currentPage;
    }
    this.loadHome(this.currentPage);
  }
  ,
}
</script>

