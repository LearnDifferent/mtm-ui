<template>
  <div>

    <v-row dense>
      <v-btn block class="text-none" color="#d0af4c" @click="goBack">
        <v-icon left>
          mdi-keyboard-backspace
        </v-icon>
        Click here to go back
      </v-btn>
    </v-row>

    <v-row dense>
      <v-col>
        <v-btn block class="text-none" color="#a2d7dd" @click="goBack">
          Viewing bookmarks associated with: {{ this.searchingTag }}
        </v-btn>
      </v-col>
    </v-row>
    <v-row dense>
      <v-col
          v-for="(item, i) in items"
          :key="i"
          cols="12"
      >
        <!-- 网页搜索结果 -->
        <WebsiteSearchResults :item="item"/>
      </v-col>
      <v-col>
        <!-- pagination -->
        <div
            v-show="this.items.length > 1"
            style="text-align: center;
              margin-top: 3px"
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
      </v-col>
    </v-row>

  </div>
</template>

<script>

import WebsiteSearchResults from "@/component/WebsiteSearchResults";

export default {
  components: {WebsiteSearchResults},
  data: () => ({
    items: [],
    formerItem: [],
    searchingTag: '',
    currentPage: 1,
  }),

  methods: {
    // 回到前面
    goBack() {
      this.$router.push({
        name: 'web',
        params: {
          item: this.formerItem,
          tagMode: true,
          previousPage: 'home',
        }
      });
    },

    // 切换页面
    changePage(count) {
      if (count === -1 && this.currentPage === 1) {
        // 页面不能 <1
        return;
      }
      this.currentPage += count;
      this.getBookmarksByTagName();
    },
    // 限定最大页数，并返回是否有新的数据
    maxPageCheckAndReturnArrayHasNewValue(array) {
      if (array === null || array.length === 0) {
        // 此时已经没有数据
        this.noMoreData();
        return false;
      }
      // 有新的数据
      return true;
    },
    noMoreData() {
      if (this.currentPage > 1) {
        // 页面如果不是 1 的话，就 -1
        this.currentPage -= 1;
      }
      // 没有新的数据
      alert("No More Data");
    },

    // 根据 tag 搜索 bookmarks
    getBookmarksByTagName() {
      this.axios.get("/tag/search", {
        params: {
          tagName: this.searchingTag,
          currentPage: this.currentPage
        }
      }).then(res => {
        if (res.data.code === 200) {
          let array = res.data.data;
          let hasNewValue = this.maxPageCheckAndReturnArrayHasNewValue(array);
          if (hasNewValue === true) {
            this.items = array;
          }
        } else {
          alert("No Bookmarks associated with this tag");
        }
      }).catch((error) => {
        if (error.response.data.code === 2013) {
          this.noMoreData();
        } else {
          alert(error.response.data.msg);
        }
      });
    },

  },

  props: {
    searchingTag: {},
    formerItem: {},
  },

  watch: {
    searchingTag: {
      handler(newVal, oldVal) {
        if (newVal !== '') {
          this.getBookmarksByTagName();
        }
      },
      immediate: true
    },
  },
}
</script>

<style scoped>

</style>