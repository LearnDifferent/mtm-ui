<template>
  <div>
    <!-- 切换搜索模式 -->
    <v-tabs
        v-show="!isSpecialMode"
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
      <v-tab class="text-none" @click="changeSearchMode('tag')">
        <v-icon left>
          mdi-tag-multiple-outline
        </v-icon>
        Search Tags
      </v-tab>
    </v-tabs>

    <!-- 不查看特殊页面，返回搜索页面 -->
    <v-btn
        block
        v-show="isSpecialMode"
        class="text-none"
        :color="searchingTag && items.length === 0 ? '#c53d43' : '#d0af4c'"
        @click="backToSearch"
    >
      <v-icon left>
        mdi-keyboard-backspace
      </v-icon>
      <div v-show="showBookmarks">
        You are now viewing {{ showBookmarks }}'s bookmarks. Click here to go back.
      </div>
      <div v-show="searchingTag && items.length > 0">
        Viewing bookmarks associated with "{{ searchingTag }}". Note that some bookmarks are private. Click here to go
        back.
      </div>
      <div v-show="searchingTag && items.length === 0">
        These bookmarks are private. You can click here to go back.
      </div>
    </v-btn>

    <v-container fill-height>

      <!-- 提示更新网页搜索的数据库 -->
      <AlertWhenDataHasChanges
          v-show="hasNewUpdate && hasDb && searchMode === 'web' && !isSpecialMode"
          :update-data="genDb"
      />

      <!-- 提示更新用户搜索的数据库 -->
      <AlertWhenDataHasChanges
          v-show="hasNewUserUpdate && hasUserData && searchMode === 'user' && !isSpecialMode"
          :update-data="updateUserData"
      />

      <!-- 提示更新 Tag 搜索的数据库 -->
      <AlertWhenDataHasChanges
          v-show="hasNewTagUpdate && hasTags && searchMode === 'tag' && !isSpecialMode"
          :update-data="updateTagData"
      />

      <!-- 没有网页数据的时候，提示生成数据 -->
      <AlertWhenNoData
          v-show="!hasDb && searchMode === 'web' && !isSpecialMode"
          :update-data="genDb"
          :search-mode="searchMode"/>

      <!-- 没有用户数据的时候，提示生成数据 -->
      <AlertWhenNoData
          v-show="!hasUserData && searchMode === 'user' && !isSpecialMode"
          :update-data="updateUserData"
          :search-mode="searchMode"/>

      <!-- 没有 tag 数据的时候，提示生成数据 -->
      <AlertWhenNoData
          v-show="!hasTags && searchMode === 'tag' && !isSpecialMode"
          :update-data="updateTagData"
          :search-mode="searchMode"/>

      <div style="margin-top: 1%" v-show="!isSpecialMode">
        <!-- 显示网页热搜按钮 -->
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
            v-for="tile in searchMode === 'web' ? tiles
            : searchMode === 'user' ? userTitles : tagTitles"
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
      <ProcessingLinear :processing="processing"/>

      <!-- 搜索框 -->
      <v-row style="margin-top: 1%" v-show="!isSpecialMode">
        <v-col cols="12">
          <!-- 提示 Elasticsearch 不可用-->
          <div v-show="!isElasticsearchAlive">
            <v-alert
                outlined
                dense
                color="#ffbe00"
                type="info"
                icon="mdi-lan-disconnect"
                dismissible
            >
              Elasticsearch is not available
            </v-alert>
          </div>
        </v-col>
        <v-col cols="12">
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

      <!-- 切换搜索引擎 -->
      <v-row justify="center" v-show="!isSpecialMode">
        <v-radio-group
            v-model="searchEngine"
            row
        >
          <v-radio
              label="Elasticsearch"
              value="es"
              color="#f98b60"
              :disabled="!isElasticsearchAlive"
          ></v-radio>
          <v-radio
              label="MySQL"
              value="mysql"
              color="#ffc057"
          ></v-radio>
        </v-radio-group>
      </v-row>

      <!-- Tag Range -->
      <v-row justify="center" v-show="!isSpecialMode && searchMode === 'tag' && inputMsg">
        <v-col
            cols="6"
            md="3"
        >
          <v-text-field
              @keyup.enter="searchRequest(inputMsg, 1)"
              v-model="rangeFrom"
              :rules="numberRule"
              label="Range (From)"
          ></v-text-field>
        </v-col>

        <v-col
            cols="6"
            md="3"
        >
          <v-text-field
              @keyup.enter="searchRequest(inputMsg, 1)"
              v-model="rangeTo"
              :rules="numberRule"
              label="Range (To)"
          ></v-text-field>
        </v-col>

      </v-row>

      <!-- SearchingLinear -->
      <SearchingLinear v-show="isSearching"/>

      <!-- 热搜数据 -->
      <div class="text-center" v-show="this.showTrending && searchMode === 'web' && !isSpecialMode">
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
            <v-card v-show="searchMode==='user' && !isSpecialMode">
              <UserInfoList :user="item" v-show="searchMode==='user'"></UserInfoList>
              <v-card-actions>
                <v-btn class="text-none" color="#e198b4" @click="checkoutBookmarks(item.userName, item.bookmarkNumber)">
                  <v-icon left>mdi-bookmark-outline</v-icon>
                  {{
                    item.bookmarkNumber > 0 ? 'View Bookmarks (' + item.bookmarkNumber + ')' : 'No Bookmarks'
                  }}
                </v-btn>
              </v-card-actions>
            </v-card>

            <!-- 网页搜索结果 -->
            <WebsiteSearchResults :item="item" v-show="searchMode==='web' || isSpecialMode"/>

            <!-- tag 搜索结果 -->
            <v-row dense>
              <v-col class="text-center">
                <span>
                  <v-chip
                      v-show="searchMode==='tag' && !isSpecialMode"
                      class="ma-2"
                      color="#e95464"
                      text-color="white"
                      @click="openTagSearch(item.tag, 1)"
                  >
                    {{ item.tag }} ({{ item.number }})
                  </v-chip>
                </span>
              </v-col>
            </v-row>
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
import ProcessingLinear from "@/component/ProcessingLinear";
import SearchingLinear from "@/component/SearchingLinear";

export default {
  components: {
    SearchingLinear,
    ProcessingLinear, WebsiteSearchResults, AlertWhenDataHasChanges, AlertWhenNoData, UserInfoList
  },
  computed: {
    isSpecialMode() {
      return this.showBookmarks || this.searchingTag;
    }
  },
  name: "Find",
  data: () => ({
    // MySQL 和 Elasticsearch 的选项条
    searchEngine: 'es',
    // Elasticsearch 是否可以连接，true 表示可以连接
    isElasticsearchAlive: true,
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
    // 筛选 tag 数据
    rangeFrom: '',
    rangeTo: '',
    // 验证正数
    numberRule: [
      v => /^([0-9]*[1-9][0-9]*)?$/.test(v)
          || "Please enter a positive number"
    ],
    // 操作搜索数据库相关
    // 搜索网页时的选项
    tiles: [
      {
        title: 'Delete All Trending Searches',
        tId: 'tags',
        icon: 'mdi-tag-off-outline',
        color: 'red lighten-1'
      },
      {
        title: 'Generate (Update) Bookmark Data',
        tId: 'gen',
        icon: 'mdi-database-refresh',
        color: 'green darken-2'
      },
      {
        title: 'Delete All Bookmark Data',
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
    // 搜索 tag 时候的选项
    tagTitles: [
      {
        title: 'Update (Generate) Tag Data',
        tId: 'updateTag',
        icon: 'mdi-tag-outline',
        color: 'green lighten-1'
      },
      {
        title: 'Delete All Tag Data',
        tId: 'deleteAllTags',
        icon: 'mdi-delete-variant',
        color: 'red lighten-1'
      }
    ],
    // 是否有用户数据
    hasUserData: true,
    // 是否有网页
    hasDb: true,
    // 是否有 tag 数据
    hasTags: true,
    // 网页数据是否发生了变化
    hasNewUpdate: false,
    // 用户数据是否发生了变化
    hasNewUserUpdate: false,
    // tag 数据是否发生了变化
    hasNewTagUpdate: false,
    // 正在进行搜索数据库相关操作
    processing: '',
    // search mode: web, user, tag
    searchMode: 'web',
    // 查看 bookmarks，value 为用户名
    showBookmarks: null,
    // 正在被搜索的 tag
    searchingTag: null,
  }),

  methods: {

    openTagSearch(searchingTag, currentPage) {
      this.searchingTag = searchingTag;
      this.tagSearching(currentPage);
    },
    tagSearching(currentPage) {
      // 点击上面的按钮，返回的是 searchingTag = null
      this.axios.get("/tag/search/" + this.searchingTag, {
        params: {
          currentPage: currentPage
        }
      }).then(res => {
        this.items = res.data.bookmarks;
        this.totalPage = res.data.totalPages;
      }).catch((error) => {
        if (error.response.data.code === 2013) {
          alert("No Bookmarks associated with this tag");
        }
      });
    },

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
      this.rangeFrom = '';
      this.rangeTo = '';
    },

    // 切换搜索模式
    changeSearchMode(searchMode) {
      // 切换模式
      this.searchMode = searchMode;
      // 重置数据
      this.resetData();
      // 获取数据状态
      this.axios.get("/search/status?mode=" + searchMode).then(res => {
        let exists = res.data.exists;
        let hasChanges = res.data.hasChanges;

        if (searchMode === 'user') {
          this.hasUserData = exists;
          this.hasNewUserUpdate = hasChanges;
        } else if (searchMode === 'web') {
          this.hasDb = exists;
          this.hasNewUpdate = hasChanges;
        } else if (searchMode === 'tag') {
          this.hasTags = exists;
          this.hasNewTagUpdate = hasChanges;
        }
      });
    },

    // 删除某个热搜词
    delTrend(word, arrayIndex) {
      if (confirm("Delete this Trending Tag?")) {
        this.axios.delete("/search/trending/" + word).then(res => {
          if (res.data.data === true) {
            alert("Deleted");
            this.trending.splice(arrayIndex, 1);
          } else {
            alert("Can't delete it...");
          }
        }).catch(error => {
          if (error.response.data.code === 2009) {
            alert("You are now login as Guest: Guest can't delete trending searches\n\n" +
                "Please login as Standard User or Admin to delete trending searches");
          } else {
            alert("Something went wrong. Please try again later.")
          }
        });
      }
    },
    // 删除所有热搜标签
    delAllTrending() {
      this.processing = 'Delete All Trending Searches.... Please wait a minute.';
      this.axios.delete("/search/trending").then(res => {
        if (res.data.data === true) {
          alert("Deleted");
          this.trending = '';
        } else {
          alert("Already Deleted");
        }
      }).catch(error => {
        if (error.response.data.code === 2009) {
          alert("You are now login as Guest: Guest can't delete trending searches\n\n" +
              "Please login as Standard User or Admin to delete trending searches");
        } else {
          alert("Something went wrong. Please try again later.");
        }
      }).finally(() => {
        this.processing = '';
      });
    },
    // 更多操作（打开生成/删除搜索数据库的按钮等）
    moreOptions(tId) {
      if (!this.isElasticsearchAlive) {
        alert('You can only do it when Elasticsearch is available!')
        return;
      }
      if (tId === 'del') {
        if (confirm("Are you sure you want to Delete All Bookmark Data in Elasticsearch?")) {
          this.deleteData('web');
        }
      }
      if (tId === 'gen') {
        if (confirm("Are you sure you want to Generate (Update) Bookmark Data? in Elasticsearch")) {
          this.genDb();
        }
      }
      if (tId === 'tags') {
        if (confirm("Are you sure you want to Delete All Trending Searches?")) {
          this.delAllTrending();
        }
      }
      if (tId === 'updateUser') {
        if (confirm("Are you sure you want to Update (Generate) User Data? in Elasticsearch")) {
          this.updateUserData();
        }
      }
      if (tId === 'deleteAllUsers') {
        if (confirm("Are you sure you want to Delete All User Data in Elasticsearch?")) {
          this.deleteData("user");
        }
      }
      if (tId === 'updateTag') {
        if (confirm("Are you sure you want to Update (Generate) Tag Data in Elasticsearch?")) {
          this.updateTagData();
        }
      }
      if (tId === 'deleteAllTags') {
        if (confirm("Are you sure you want to Delete All Tag Data in Elasticsearch?")) {
          this.deleteData("tag");
        }
      }
    },
    updateData(mode) {
      this.axios.get("/search/build?mode=" + mode).then(res => {
        if (res.data.data === true) {
          alert("Success!");
          if (mode === 'user') {
            this.hasUserData = true;
          } else if (mode === 'web') {
            this.hasDb = true;
          } else if (mode === 'tag') {
            this.hasTags = true;
          }
        } else {
          alert("Something went wrong. Please try again.")
        }
      }).catch(error => {
        if (error.response.data.code === 5001) {
          // 5001 表示网络异常
          alert(error.response.data.msg);
        }
      }).finally(() => {
        this.processing = '';
      });
    },
    // 更新 tag 数据
    updateTagData() {
      this.hasNewTagUpdate = false;
      this.processing = 'Updating Tag Data... Please wait a minute.';
      this.updateData("tag");
    },
    // 生成搜索数据库操作
    genDb() {
      this.hasNewUpdate = false;
      this.processing = 'Generating Bookmark Data... Please wait a minute.';
      this.updateData("web");
    },
    // 更新用户数据
    updateUserData() {
      this.hasNewUserUpdate = false;
      this.processing = 'Updating User Data... Please wait a minute.';
      this.updateData("user");
    },

    deleteData(searchMode) {
      let msg = searchMode === 'web' ? 'bookmark' : searchMode;
      this.processing = "Deleting all " + msg + " data.... Please wait a minute.";
      this.axios.delete("/search?mode=" + searchMode).then(res => {
        if (res.data.data == true) {
          alert("Deleted");
          if (searchMode === 'web') {
            this.hasDb = false;
          } else if (searchMode === 'user') {
            this.hasUserData = false;
          } else if (searchMode === 'tag') {
            this.hasTags = false;
          }
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
          alert("Only Admin can delete " + msg + " data.\n\n"
              + "Standard user Or Guest can only generate or update data.");
        } else {
          alert(message);
        }
      }).finally(() => {
        this.processing = '';
      });
    },

    // 返回搜索页面
    backToSearch() {
      this.showBookmarks = null;
      this.searchingTag = null;
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
      this.axios.get("/bookmark/get/user/" + this.showBookmarks, {
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
      } else if (this.searchingTag) {
        // 搜索标签中
        this.tagSearching(currentPage);
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
        alert("No Data to Search. Please Generate Bookmark Data.")
      } else if (!this.hasUserData && this.searchMode === 'user') {
        alert("No Data to Search. Please Generate User Data.")
      } else if (!this.hasTags && this.searchMode === 'tag') {
        alert("No Data to Search. Please Generate Tag Data.");
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

        // 重新定义搜索模式
        // 如果搜索引擎选择的是 MySQL，就要重置搜索模式。其他情况不用重置。
        let searchMode = this.searchMode;
        if (this.searchEngine === 'mysql' && searchMode === 'web') {
          searchMode = 'bookmark_mysql';
        }
        if (this.searchEngine === 'mysql' && searchMode === 'tag') {
          searchMode = 'tag_mysql';
        }
        if (this.searchEngine === 'mysql' && searchMode === 'user') {
          searchMode = 'user_mysql';
        }

        this.axios.get("/search", {
          params: {
            "currentPage": currentPage,
            "keyword": keyword,
            "mode": searchMode,
            "rangeTo": this.rangeTo,
            "rangeFrom": this.rangeFrom,
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
      this.placeholderMsg = keyword;
    },
    load() {
      this.axios.get("/search/load").then(res => {
        this.trending = res.data.trendingList;
        this.hasDb = res.data.dataStatus;
        this.hasNewUpdate = res.data.hasNewUpdate;
      }).catch((error) => {
        if (error.response.data.code === 5001) {
          // 5001 表示无法连接 Elasticsearch
          // Elasticsearch 为无法连接状态
          this.isElasticsearchAlive = false;
          // 搜索引擎设定为 MySQL
          this.searchEngine = 'mysql';
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

