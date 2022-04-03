<template>
  <div>
    <!-- 切换搜索模式 -->
    <v-tabs
        v-show="!showBookmarks"
        fixed-tabs
        background-color="#474a4d"
        color="white"
        slider-color="#e0ebaf"
    >
      <v-tab class="text-none" @click="changeSearchMode('web')">
        <v-icon left>
          mdi-file-find
        </v-icon>
        Search Bookmarks
      </v-tab>
      <v-tab class="text-none" @click="changeSearchMode('user')">
        <v-icon left>
          mdi-account-search
        </v-icon>
        Search Users
      </v-tab>
    </v-tabs>

    <!-- 不查看 Bookmarks，返回搜索页面 -->
    <v-btn block v-show="showBookmarks" class="text-none" color="#d0af4c" @click="backToSearch">
      <v-icon left>
        mdi-keyboard-backspace
      </v-icon>
      You are now viewing {{showBookmarks}}'s bookmarks. Click here to go back.
    </v-btn>

    <v-container fill-height>

      <!-- 提示更新网页搜索的数据库 -->
      <AlertWhenDataHasChanges
          v-show="hasNewUpdate && hasDb && searchMode === 'web' && !showBookmarks"
          :update-data="genDb"
      />

      <!-- 提示更新用户搜索的数据库 -->
      <AlertWhenDataHasChanges
          v-show="hasNewUserUpdate && hasUserData && searchMode === 'user' && !showBookmarks"
          :update-data="updateUserData"
      />

      <!-- 没有网页数据的时候，提示生成数据 -->
      <AlertWhenNoData
          v-show="!hasDb && searchMode === 'web' && !showBookmarks"
          :update-data="genDb"
          :search-mode="searchMode"/>

      <!-- 没有用户数据的时候，提示生成数据 -->
      <AlertWhenNoData
          v-show="!hasUserData && searchMode === 'user' && !showBookmarks"
          :update-data="updateUserData"
          :search-mode="searchMode"/>

      <div style="margin-top: 1%" v-show="!showBookmarks">
        <!-- 显示网页热搜 -->
        <v-btn
            v-show="searchMode === 'web'"
            class="mx-2"
            color="red"
            dark
            small
            fab
            @click="showTrending =! showTrending"
        >
          <v-icon dark>
            {{ showTrending ? 'mdi-fire' : 'mdi-close' }}
          </v-icon>
        </v-btn>

        <!-- 点击更多选项 -->
        <v-btn
            class="mx-2"
            color="#808080"
            dark
            small
            fab
            @click="hidden = !hidden"
        >
          <v-icon dark>
            {{ hidden ? 'mdi-cog' : 'mdi-close' }}
          </v-icon>
        </v-btn>

        <!-- 展开网页相关的更多选项 -->
        <v-expand-x-transition
            v-for="tile in searchMode === 'web' ? tiles : userTitles"
        >
          <v-chip
              :key="tile.title"
              v-show="!hidden"
              outlined
              @click="moreOptions(tile.tId)"
              style="margin: 2px"
              :text-color="tile.color"
          >
            <v-icon
                left
                :color="tile.color"
            >
              {{ tile.icon }}
            </v-icon>
            {{ tile.title }}
          </v-chip>
        </v-expand-x-transition>
      </div>

      <!-- 进度条 -->
      <v-progress-linear
          v-show="processing"
          color="#b35c44"
          indeterminate
          rounded
          height="30px"
          style="margin-top: 1%;margin-bottom: 1%"
      >
        <div style="size: 20px">{{ processing }}</div>
      </v-progress-linear>

      <!--搜索框-->
      <v-row style="margin-top: 1%" v-show="!showBookmarks">
        <v-col>
          <v-text-field
              id="inputField"
              v-model="inputMsg"
              :append-icon="inputMsg ? 'mdi-magnify' : ''"
              :label="placeholderMsg ? 'Searching：'+placeholderMsg:''"
              single-line
              outlined
              clearable
              @keyup.enter="searchRequest(inputMsg, currentPage)"
              @click:append="searchRequest(inputMsg, currentPage)"
          ></v-text-field>
          <p v-show="totalCount !== -1 && !errorMsg">
            Total {{ totalCount >= 1 ? totalCount : 0 }} result{{ totalCount > 1 ? 's' : '' }}
          </p>
          <p v-show="errorMsg" style="color: red">{{ errorMsg }}</p>
        </v-col>
      </v-row>

      <v-progress-linear
          v-show="isSearching"
          color="orange"
          indeterminate
          rounded
          height="30px"
      >
        <div style="size: 20px">Searching....</div>
      </v-progress-linear>

      <!-- 网页热搜数据 -->
      <div class="text-center" v-show="this.showTrending && searchMode !== 'user' && !showBookmarks">
        <v-row>
          <v-col
              class="text-center"
              v-for="(trend, i) in trending"
              :key="i"
              cols="20"
              v-show="trending"
          >
            <v-chip
                v-show="i < 6"
                class="ma-2"
                color="#dc3023"
                text-color="white"
                @click="searchRequest(trend, currentPage)"
            >
              {{ trend }}
              <v-icon right @click.stop="delTrend(trend, i)">
                mdi-close
              </v-icon>
            </v-chip>

            <v-chip
                v-show="6 <= i && i <= 12"
                class="ma-2"
                color="#f35336"
                text-color="white"
                @click="searchRequest(trend, currentPage)"
            >
              {{ trend }}
              <v-icon right @click.stop="delTrend(trend)">
                mdi-close
              </v-icon>
            </v-chip>

            <v-chip
                v-show="i > 12"
                class="ma-2"
                color="#ea5506"
                text-color="white"
                @click="searchRequest(trend, currentPage)"
            >
              {{ trend }}
              <v-icon right @click.stop="delTrend(trend)">
                mdi-close
              </v-icon>
            </v-chip>

          </v-col>
        </v-row>
      </div>

      <v-container class="mx-auto">
        <!-- 搜索结果 -->
        <v-row dense>
          <v-col
              v-for="(item, i) in items"
              :key="i"
              cols="12"
          >
            <!-- 用户搜索结果 -->
            <v-card v-show="searchMode==='user' && !showBookmarks">
              <UserInfoList :user="item" v-show="searchMode==='user'"></UserInfoList>
              <v-card-actions>
                <v-btn class="text-none" color="#e198b4" @click="checkoutBookmarks(item.userName, item.webCount)">
                  <v-icon left>mdi-bookmark-outline</v-icon>
                  {{
                    item.webCount > 0 ? 'View Bookmarks (' + item.webCount + ')' : 'No Bookmarks'
                  }}
                </v-btn>
              </v-card-actions>
            </v-card>

            <!-- 网页搜索结果 -->
            <WebsiteSearchResults :item="item" v-show="searchMode==='web' || showBookmarks"/>
          </v-col>
        </v-row>

        <!--分页-->
        <v-row v-show="currentPage > 0 && totalCount > 0" align-content="center">
          <v-col>
            <v-pagination
                v-model="currentPage"
                :length="totalPage"
                circle
                @input="changePage(keyword, currentPage)"
            ></v-pagination>
          </v-col>
        </v-row>

      </v-container>
    </v-container>
  </div>
</template>

<script>
import UserInfoList from "../component/UserInfoList";
import AlertWhenNoData from "../component/AlertWhenNoData";
import AlertWhenDataHasChanges from "../component/AlertWhenDataHasChanges";
import WebsiteSearchResults from "../component/WebsiteSearchResults";

export default {
  components: {WebsiteSearchResults, AlertWhenDataHasChanges, AlertWhenNoData, UserInfoList},
  name: "Find",
  data: () => ({
    // 是否隐藏更多选项
    hidden: true,
    inputMsg: '',
    placeholderMsg: '',
    // 关键词
    keyword: '',
    // 错误信息
    errorMsg: '',
    // 总数
    totalCount: -1,
    // 分页
    currentPage: 0,
    totalPage: 1,
    // 当前用户
    currentUser: '',
    // 网页数据
    items: '',
    // 热搜
    trending: '',
    // 是否显示热搜
    showTrending: true,
    // 是否正在搜索
    isSearching: false,
    // 操作搜索数据库相关
    // 搜索网页时的选项
    tiles: [
      {
        title: 'Delete All Trending Tags',
        tId: 'tags',
        icon: 'mdi-tag-off-outline',
        color: 'red lighten-1'
      },
      {
        title: 'Generate (Update) Website Data',
        tId: 'gen',
        icon: 'mdi-database-refresh',
        color: 'green darken-2'
      },
      {
        title: 'Delete All Website Data',
        tId: 'del',
        icon: 'mdi-database-remove',
        color: 'red darken-2'
      },
    ],
    // 搜索用户时的选项
    userTitles: [
      {
        title: 'Update (Generate) User Data',
        tId: 'updateUser',
        icon: 'mdi-account-convert',
        color: 'green lighten-1'
      },
      {
        title: 'Delete All User Data',
        tId: 'deleteAllUsers',
        icon: 'mdi-account-off',
        color: 'red lighten-1'
      }
    ],
    // 是否有用户数据
    hasUserData: true,
    // 是否有网页
    hasDb: true,
    // 网页数据是否发生了变化
    hasNewUpdate: false,
    // 用户数据是否发生了变化
    hasNewUserUpdate: false,
    // 正在进行搜索数据库相关操作
    processing: '',
    // search mode: web, user
    searchMode: 'web',
    // 查看 bookmarks，value 为用户名
    showBookmarks: null,
  }),
  methods: {

    resetData() {
      this.items = '';
      this.hidden = true;
      this.inputMsg = '';
      this.placeholderMsg = '';
      this.keyword = '';
      this.errorMsg = '';
      this.totalCount = -1;
      this.currentPage = 0;
      this.totalPage = 1;
      this.isSearching = false;
    },

    // 切换搜索模式
    changeSearchMode(searchMode) {
      // 切换模式
      this.searchMode = searchMode;
      // 重置数据
      this.resetData();
      // 获取数据状态
      this.axios.get("/find/status?mode=" + this.searchMode).then(res => {
        let exists = res.data.exists;
        let hasChanges = res.data.hasChanges;

        if (searchMode === 'user') {
          this.hasUserData = exists;
          this.hasNewUserUpdate = hasChanges;
        } else {
          this.hasDb = exists;
          this.hasNewUpdate = hasChanges;
        }
      });
    },

    // 删除某个热搜词
    delTrend(word, arrayIndex) {
      if (confirm("Delete this Trending Tag?")) {
        this.axios.delete("/find/trends/" + word).then(res => {
          if (res.data === true) {
            alert("Deleted");
            this.trending.splice(arrayIndex, 1);
          } else {
            alert("Can't delete it...");
          }
        }).catch(error => {
          if (error.response.data.code === 2009) {
            alert("You are now Login as Guest. Guest can't delete this tag.\n\n" +
                "Please Login as Normal User or Admin to delete.");
          } else {
            alert("Something went wrong. Please try again later.")
          }
        });
      }
    },
    // 删除所有热搜标签
    delAllTrending() {
      // this.dialog3 = false;
      this.processing = 'Delete All Trending Tags.... Please wait a minute.';
      this.axios.delete("/find/trends").then(res => {
        if (res.data === true) {
          alert("Deleted");
          this.trending = '';
        } else {
          alert("Already Deleted");
        }
      }).catch(error => {
        if (error.response.data.code === 2009) {
          alert("You are now Login as Guest and Guest can't delete tags.\n\n" +
              "Please Login as Normal User or Admin to delete.");
        } else {
          alert("Something went wrong. Please try again later.");
        }
      }).finally(() => {
        this.processing = '';
      });
    },
    // 更多操作（打开生成/删除搜索数据库的按钮等）
    moreOptions(tId) {
      if (tId === 'del') {
        if (confirm("Are you sure you want to Delete All Website Data?")) {
          this.delDb();
        }
      }
      if (tId === 'gen') {
        if (confirm("Are you sure you want to Generate (Update) Website Data?")) {
          this.genDb();
        }
      }
      if (tId === 'tags') {
        if (confirm("Are you sure you want to Delete All Trending Tags?")) {
          this.delAllTrending();
        }
      }
      if (tId === 'updateUser') {
        if (confirm("Are you sure you want to Update (Generate) User Data?")) {
          this.updateUserData();
        }
      }
      if (tId === 'deleteAllUsers') {
        if (confirm("Are you sure you want to Delete All User Data?")) {
          this.deleteAllUserData();
        }
      }
    },
    // 更新用户数据
    updateUserData() {
      this.hasNewUserUpdate = false;
      this.processing = 'Updating User Data... Please wait a minute.';
      this.axios.get("/find/build?mode=user").then(res => {
        if (res.data == true) {
          alert("Success!");
          this.hasUserData = true;
        } else {
          alert("Something went wrong. Please try again.")
        }
        this.processing = '';
      }).catch(error => {
        if (error.response.data.code === 5001) {
          this.processing = '';
          // 5001 表示网络异常
          alert(error.response.data.msg);
        }
      });
    },
    // 删除用户数据
    deleteAllUserData() {
      this.processing = 'Deleting All User Data.... Please wait a minute.';
      this.axios.delete("/find/delete?mode=user").then(res => {
        if (res.data == true) {
          alert("Deleted");
          this.hasUserData = false;
        } else {
          alert("Something went wrong. Please try again.")
        }
      }).catch(error => {
        let code = error.response.data.code;
        let message = error.response.data.msg;

        if (code === 5001) {
          // 5001 表示网络异常
          alert(message);
        } else if (code === 2009) {
          // 2009 表示没有权限
          alert("Only Admin Can Delete User Data.\n\n"
              + "Normal User Or Guest Can Only Generate Or Update Data.");
        } else {
          alert(message);
        }
      }).finally(() => {
        this.processing = '';
      });
    },
    // 删除搜索数据库
    delDb() {
      this.processing = 'Deleting All Website Data.... Please wait a minute.';
      this.axios.delete("/find/delete?mode=web").then(res => {
        if (res.data == true) {
          alert("Deleted");
          this.hasDb = false;
        } else {
          alert("Something went wrong. Please try again.")
        }
      }).catch(error => {
        let code = error.response.data.code;
        let message = error.response.data.msg;

        if (code === 5001) {
          // 5001 表示网络异常
          alert(message);
        } else if (code === 2009) {
          // 2009 表示没有权限
          alert("Only Admin Can Delete Website Data.\n\n"
              + "Normal User Or Guest Can Only Generate Or Update Data.");
        } else {
          alert(message);
        }
      }).finally(() => {
        this.processing = '';
      });
    },
    // 生成搜索数据库操作
    genDb() {
      this.hasNewUpdate = false;
      this.processing = 'Generating Website Data... Please wait a minute.';
      this.axios.get("/find/build?mode=web").then(res => {
        if (res.data == true) {
          alert("Success!");
          this.hasDb = true;
        } else {
          alert("Something went wrong. Please try again.")
        }
        this.processing = '';
      }).catch(error => {
        if (error.response.data.code === 5001) {
          this.processing = '';
          // 5001 表示网络异常
          alert(error.response.data.msg);
        }
      });
    },

    // 取消查看 bookmarks，返回搜索
    backToSearch() {
      this.showBookmarks = null;
      this.resetData();
    },

    checkoutBookmarks(username, websiteDataCount) {
      if (websiteDataCount < 1) {
        alert("No Bookmarks");
      } else {
        this.showBookmarks = username;
        this.checkOutUserBookmarks(1);
      }
    },
    // 查看该用户收藏的网页
    checkOutUserBookmarks(currentPage) {
      this.axios.get("/bookmark/get/" + this.showBookmarks, {
        params: {currentPage: currentPage}
      }).then(res => {
        this.items = res.data.bookmarks;
        this.totalPage = res.data.totalPages;
      });
    },

    // 切换下一页
    changePage(keyword, currentPage) {
      if (this.showBookmarks) {
        // 在 showBookmarks 模式下
        this.checkOutUserBookmarks(currentPage);
      } else {
        this.searchRequest(keyword, currentPage);
      }

      // 让页面返回顶部
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    },
    searchRequest(keyword, currentPage) {
      if (keyword.trim() === '') {
        alert("Please enter something...");
      } else if (!this.hasDb && this.searchMode === 'web') {
        // 如果数据库中没有数据，且 search mode 为 web，就提示：
        alert("No Data to Search. Please Generate Website Data.")
      } else if (!this.hasUserData && this.searchMode === 'user') {
        alert("No Data to Search. Please Generate User Data.")
      } else {
        if (this.keyword !== keyword) {
          currentPage = 1;
          this.currentPage = currentPage;
        }

        // 进行搜索的时候，不显示热搜
        this.showTrending = false;
        // 正在进行搜索
        this.isSearching = true;

        // 重新搜索的时候，删除错误信息
        this.errorMsg = '';

        this.axios.get("/find/search", {
          params: {
            "currentPage": currentPage,
            "keyword": keyword,
            "mode": this.searchMode
          }
        }).then(resp => {
          this.items = resp.data.data.paginatedResults;
          this.totalPage = resp.data.data.totalPage;
          let totalCount = resp.data.data.totalCount;
          if (totalCount === 0 || !totalCount) {
            // 没有搜索结果的时候，清除数据
            this.items = '';
          }
          this.totalCount = totalCount;
          this.keyword = keyword;
          let inputField = document.getElementById("inputField");
          inputField.blur();
          // 搜索结束
          this.isSearching = false;
        }).catch(error => {
          this.processing = '';
          this.errorMsg = error.response.data.msg;
          this.isSearching = false;
          this.items = '';
          this.totalCount = 0;
          this.totalPage = 0;
        });

        this.clearMessage(keyword);
      }
    },
    clearMessage(keyword) {
      this.placeholderMsg = keyword
      this.inputMsg = ''
    },
    load() {
      this.axios.get("/find/load").then(res => {
        this.trending = res.data.trendingList;
        this.hasDb = res.data.dataStatus;
        this.hasNewUpdate = res.data.hasNewUpdate;
      }).catch((error) => {
        if (error.response.data.code === 2005) {
          this.$router.push("/login")
        } else if (error.response.data.code === 5001) {
          alert("Unable to connect to Search Engine.");
        } else {
          alert("Something went wrong. Can't load this page.")
        }
      });
    },
  },
  created() {
    window.onload = function () {
      document.getElementById("myFindBtn").click();
    }
    this.load();
  }
}
</script>

