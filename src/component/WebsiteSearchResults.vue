<template>
  <div>
    <v-btn block v-show="tagMode === true" class="text-none" color="#d0af4c" @click="goBack">
      <v-icon left>
        mdi-keyboard-backspace
      </v-icon>
      You are now viewing tags. Click here to go back.
    </v-btn>
    <v-card>
      <div class="d-flex flex-no-wrap justify-space-between">
        <div>
          <v-card-title
              class="headline"
              v-html="item.title"
              @click="openWebPage(item)"
          ></v-card-title>

          <v-card-subtitle v-html="item.desc" @click="openWebPage(item)"></v-card-subtitle>

          <v-card-actions v-show="item.createTime">
            <v-chip
                v-show="item.userName"
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
        </div>

        <v-avatar
            class="ma-3"
            size="125"
            tile
            @click="openWebPage(item)"
        >
          <v-img :src="item.img"></v-img>
        </v-avatar>
      </div>

    </v-card>

    <v-divider v-show="tagMode" style="margin-top: 20px;margin-bottom: 1%"></v-divider>
    <!-- tags -->
    <div v-show="tagMode === true" class="text-center">
      <!-- add new tag -->
      <v-row v-show="currentUser === item.userName">
        <v-col align="center">
          <v-text-field
              style="max-width: 30%;align-content: center"

              v-model="newTag"
              label="Apply a Tag"
              clearable
              @click:prepend-inner="applyTag()"
              prepend-inner-icon="mdi-send"
              @keyup.enter="applyTag()"
          ></v-text-field>
        </v-col>
      </v-row>

      <!-- alert if no data available -->
      <v-alert
          v-show="showNoDataAlert"
          color="#d0576b"
          dismissible
      >
        <div style="text-align: center">
          No Tags
        </div>
      </v-alert>

      <!-- show tags -->
      <span v-for="tag in tagsArray">
        <v-chip
            class="ma-2"
            color="#dc3023"
            text-color="white"
            @click="goToTagSearchPage(tag)"
        >
          {{ tag }}
          <v-icon
              v-show="currentUser === item.userName"
              right @click.stop="deleteTag(tag)"
          >
            mdi-close
          </v-icon>
        </v-chip>
      </span>
    </div>

    <!-- pagination -->
    <div
        v-show="tagMode === true"
        style="text-align: center;
        position:absolute;
        bottom: 20px;
        margin: auto;
        left: 0;
        right: 0;"
    >
      <v-btn small rounded @click="changePage(-1)">
        <v-icon>mdi-skip-previous</v-icon>
      </v-btn>
      <input
          :placeholder="currentPage"
          readonly="readonly"
          style="width:30px;height:30px;text-align: center;border: solid grey;"
      >
      <v-btn small rounded @click="changePage(1)">
        <v-icon>mdi-skip-next</v-icon>
      </v-btn>
    </div>
    <!-- pagination -->

  </div>
</template>
<script>

export default {
  name: 'WebsiteSearchResults',

  data: () => ({
    tagMode: false,
    tagsArray: [],
    newTag: '',
    currentPage: 1,
    showNoDataAlert: false,
  }),

  props: {
    item: {},
    tagMode: {},
    previousPage: {},
    previousPageNum: {},
    currentUser: {}
  },

  methods: {

    // 切换页面
    changePage(count) {
      if (count === -1 && this.currentPage === 1) {
        // 页面不能 <1
        return;
      }
      this.currentPage += count;
      this.getTags();
    },
    // 限定最大页数，并返回是否有新的数据
    maxPageCheckAndReturnArrayHasNewValue(array) {
      if (array === null || array.length === 0) {
        // 此时已经没有数据
        this.noMoreData();
        return false;
      } else {
        // 有新的数据
        return true;
      }
    },
    noMoreData() {

      if (this.currentPage > 1) {
        // 页面如果不是 1 的话，就 -1
        this.currentPage -= 1;
        // 没有新的数据
        alert("Last Page");
        this.showNoDataAlert = false;
      } else {
        // 第一页，且没有数据
        this.tagsArray = [];
        this.showNoDataAlert = true;
      }
    },

    // 跳转页面
    openWebPage(item) {
      if (this.tagMode === true) {
        this.view(item);
      } else {
        this.openLink(item);
      }
    },

    // 如果不是唯一 ID 的 bookmark
    openLink(item) {
      let msg = "Title: " + item.title + "\n"
          + "URL: " + item.url + "\n\n"
          + "Do you want to open this website?";
      if (confirm(msg)) {
        window.open(item.url, '_blank');
      }
    },

    // 打开 view 详情
    view(item) {
      this.axios.get("/view/count", {
        params: {bookmarkId: item.webId}
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
      this.axios.get("/view?bookmarkId=" + webId);
    },

    // 回到之前的页面
    goBack() {
      this.$router.push({
        path: this.previousPage,
        query: {currentPage: this.previousPageNum}
      });
    },

    // 搜索该标签的所有网页数据
    goToTagSearchPage(searchingTag) {
      this.$router.push({
        name: 'tag-search',
        params: {
          searchingTag: searchingTag,
          formerItem: this.item,
          placeToGoBack: 'bookmark'
        }
      });
    },

    // 删除标签
    deleteTag(tag) {
      if (confirm("Do you want to delete this tag?")) {
        this.axios.delete("/tag", {
          params: {
            bookmarkId: this.item.id,
            tagName: tag
          }
        }).then(res => {
          if (res.data.code === 200) {
            this.getTags();
          }
          alert(res.data.msg);
        }).catch((error) => {
          if (error.response.data.code === 2009) {
            alert("You don't have permission to delete this tag: This is not your bookmark");
          } else {
            alert(error.response.data.msg);
          }
        });
      }
    },

    // 添加标签
    applyTag() {
      let tag = this.newTag;
      if (tag === null || tag === '') {
        alert("Please enter a tag");
        return;
      }
      this.axios.get("/tag/apply", {
        params: {
          bookmarkId: this.item.id,
          tag: tag
        }
      }).then(res => {
        if (res.data.code === 200 && res.data.data !== '') {
          alert("Success");
          this.getTags();
        } else {
          alert("Please try again later...");
        }
      }).catch((error) => {
        if (error.response.data.code === 2009) {
          alert("This is not your bookmark. You can only add tags for your own bookmark.");
        } else {
          alert(error.response.data.msg);
        }
      }).finally(() => {
        this.newTag = '';
      });
    },

    // 获取该 bookmark 的 tag
    getTags() {
      this.axios.get("/tag", {
        params: {
          bookmarkId: this.item.id,
          currentPage: this.currentPage
        }
      }).then(res => {
        if (res.data.code === 200) {
          let array = res.data.data;
          let hasNewValue = this.maxPageCheckAndReturnArrayHasNewValue(array);
          if (hasNewValue === true) {
            this.tagsArray = array;
            this.showNoDataAlert = false;
          }
        } else {
          // 特殊情况
          alert("No Public Tags");
          this.goBack();
        }
      }).catch((error) => {
        if (error.response.data.code === 2013) {
          this.noMoreData();
        } else {
          alert(error.response.data.msg);
        }
      });
    }
  },

  watch: {
    tagMode: {
      handler(newVal, oldVal) {
        if (newVal === true) {
          this.getTags();
        }
      },
      immediate: true
    },
  },

}
</script>