<template>
  <div>
    <v-row dense>
      <v-btn
          large
          block
          class="text-none"
          color="#d0af4c"
          @click="backToHome"
      >
        <v-icon left>
          mdi-keyboard-backspace
        </v-icon>
        You are now viewing
        <v-icon small>
          {{ showing === 'popular tags' ? 'mdi-fire' : 'mdi-tag-multiple-outline' }}
        </v-icon>
        <span style="margin-left: 1px" :style="showing === 'popular tags' ? 'color: #bf242a' : 'color: #9e3d3f'">
          {{ showing }}
        </span>
        <v-icon small>
          {{ showing === 'popular tags' ? 'mdi-fire' : 'mdi-tag-multiple-outline' }}
        </v-icon>
        .
        Click here to go back
        <v-icon>mdi-home-outline</v-icon>
      </v-btn>
    </v-row>

    <v-row dense style="margin-bottom: 2%">
      <v-btn
          x-large
          block
          class="text-none"
          :color="notShowing === 'popular tags' ? '#ce5242' : '#c85554'"
          @click="changeShowMode"
      >
        <v-icon large left>
          {{ notShowing === 'popular tags' ? 'mdi-fire' : 'mdi-tag-multiple-outline' }}
        </v-icon>
        Click here to view {{ notShowing }}
        <v-icon large right>
          {{ notShowing === 'popular tags' ? 'mdi-fire' : 'mdi-tag-multiple-outline' }}
        </v-icon>
      </v-btn>
    </v-row>
    <v-row dense>
      <v-col class="text-center">
        <!-- show all tags -->
        <span v-for="tag in allTagsArray" v-show="showing === 'all tags'">
          <v-chip
              class="ma-2"
              color="#ee827c"
              outlined
              text-color="#f0908d"
              @click="goToTagSearchPage(tag)"
          >
            {{ tag }}
          </v-chip>
        </span>

        <!-- show popular tags -->
        <span v-for="tag in poplarTagsArray" v-show="showing === 'popular tags'">
          <v-chip
              class="ma-2"
              color="#e95464"
              text-color="white"
              @click="goToTagSearchPage(tag.tag)"
          >
            {{ tag.tag }} ({{ tag.number }})
          </v-chip>
        </span>

        <!-- No popular tags -->
        <div
            v-show="showing === 'popular tags'
            && currentPage === 1
            && poplarTagsArray.length === 0"
        >
          <v-alert
              color="#f2f2b0"
              @click="changeShowMode"
          >
            <div style="text-align: center">
              <v-icon>
                mdi-emoticon-sad-outline
              </v-icon>
              No Popular Tags
            </div>
          </v-alert>
          <div style="font-size: small">
            * Popular Tags: Tags that are used more than once
          </div>
        </div>

        <!-- No Tags -->
        <v-alert
            v-show="showing === 'all tags'
            && currentPage === 1
            && allTagsArray.length === 0"
            color="#f2f2b0"
            @click="backToHome"
        >
          <div style="text-align: center">
            <v-icon>
              mdi-emoticon-sad-outline
            </v-icon>
            No Public Tags
          </div>
        </v-alert>
      </v-col>

      <!-- pagination -->
      <div
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
    </v-row>
  </div>

</template>

<script>
export default {
  name: "AllTags",

  data: () => ({
    allTagsArray: [],
    poplarTagsArray: [],
    showing: 'all tags',
    notShowing: 'popular tags',
    currentPage: 1,
  }),

  methods: {
    backToHome() {
      document.getElementById("myHomeBtn").click();
    },

    // 切换页面
    changePage(count) {
      if (count === -1 && this.currentPage === 1) {
        // 页面不能 <1
        return;
      }
      this.currentPage += count;
      // 打开页面
      if (this.showing === 'popular tags') {
        this.openPopularTags();
      }
      if (this.showing === 'all tags') {
        this.openAllTags();
      }
    },
    lastPage() {
      if (this.currentPage > 1) {
        // 页面如果不是 1 的话，就 -1
        this.currentPage -= 1;
        // 没有新的数据
        alert("Last Page");
      }
    },

    // 打开热门标签页
    openPopularTags() {
      this.showing = 'popular tags';
      this.notShowing = 'all tags';
      this.getPopularTags();
    },
    // 打开全部标签页
    openAllTags() {
      this.showing = 'all tags';
      this.notShowing = 'popular tags';
      this.getAllTags();
    },

    // 切换标签页
    changeShowMode() {
      this.currentPage = 1;
      if (this.showing === 'all tags') {
        this.openPopularTags();
      } else {
        this.openAllTags();
      }
    },

    // 搜索该标签的所有网页数据
    goToTagSearchPage(searchingTag) {
      this.$router.push({
        name: 'tag-search',
        params: {
          searchingTag: searchingTag,
          formerItem: [],
          placeToGoBack: this.showing,
        }
      });
    },

    // 热门标签
    getPopularTags() {
      this.axios.get("/tag/popular?currentPage=" + this.currentPage).then(res => {
        if (res.data.code === 200) {
          this.poplarTagsArray = res.data.data;
        } else {
          // 特殊情况
          alert("No Tags");
          this.backToHome();
        }
      }).catch((error) => {
        if (error.response.data.code === 2013) {
          // 只有 >1 的 tags 才会被统计，
          // 所以要先判断当前页面是否为第一页
          if (this.currentPage === 1) {
            // 如果是第一页，会出现提示
            this.poplarTagsArray = [];
          } else {
            // 如果不是第一页，再继续
            this.lastPage();
          }
        } else {
          this.backToHome();
        }
      });
    },

    // 所有标签
    getAllTags() {
      this.axios.get("/tag?currentPage=" + this.currentPage).then(res => {
        if (res.data.code === 200) {
          this.allTagsArray = res.data.data;
        } else {
          // 特殊情况
          alert("No Tags");
          this.backToHome();
        }
      }).catch((error) => {

        if (error.response.data.code === 2013) {
          if (this.currentPage === 1) {
            // 如果是第一页，会出现提示
            this.allTagsArray = [];
          } else {
            // 如果不是第一页，再继续
            this.lastPage();
          }
        } else {
          alert(error.response.data.msg);
        }
      });
    }
  },

  created() {
    let showMode = this.$route.query.showMode;
    if (showMode === 'popular tags') {
      this.showing = 'popular tags';
      this.notShowing = 'all tags';
      this.getPopularTags();
    } else {
      this.getAllTags();
    }
  }
}
</script>

<style scoped>

</style>