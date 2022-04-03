<template>
  <v-container>
    <!-- 选择按钮 -->
    <div class="d-flex justify-center" style="margin-bottom: 2%">
      <v-btn
          rounded
          color="black"
          dark
          @click="recent"
      >
        <v-icon left>
          mdi-home
        </v-icon>
        Home
      </v-btn>
      <v-divider vertical style="margin-left: 1%;margin-right: 1%"></v-divider>
      <v-btn
          rounded
          outlined
          color="black"
          dark
          @click="goToPopularPage"
      >
        <v-icon left>
          mdi-fire
        </v-icon>
        Popular
      </v-btn>
      <v-divider vertical style="margin-left: 1%;margin-right: 1%"></v-divider>
      <v-btn
          rounded
          outlined
          color="black"
          dark
          @click="goToFilter"
      >
        <v-icon left>
          mdi-filter-plus-outline
        </v-icon>
        Filter
      </v-btn>

      <!-- Tag -->
      <v-divider vertical style="margin-left: 1%;margin-right: 1%"></v-divider>
      <v-btn
          class="text-none"
          rounded
          outlined
          color="black"
          dark
          @click="openAllTagsPage"
      >
        <v-icon left>
          mdi-tag-multiple-outline
        </v-icon>
        Tag
      </v-btn>
    </div>

    <div class="text-center">
      <v-chip
          class="ma-2"
          label
          color="black"
          :outlined="isOut!=='all'"
          dark
          @click="findAll"
      >
        <v-icon left>
          mdi-account-circle
        </v-icon>
        All
      </v-chip>
      <v-chip
          class="ma-2"
          label
          :outlined="isOut!=='mine'"
          color="black"
          dark
          @click="findMine"
      >
        <v-icon left>
          mdi-account-circle
        </v-icon>
        Only Mine
      </v-chip>
      <v-chip
          class="ma-2"
          label
          :outlined="isOut!=='others'"
          color="black"
          dark
          @click="findOthers"
      >
        <v-icon left>
          mdi-account-circle
        </v-icon>
        Only Others
      </v-chip>
      <!-- 导出用户收藏的网页数据（在 mine 和 otherOne 的情况下才会显示-->
      <v-chip
          v-show="isOut === 'mine' || isOut === 'otherOne'"
          color="#b6d7de"
          @click="exportHtmlFile"
      >
        <v-icon left>
          mdi-download
        </v-icon>
        Download {{ toUserName == currentUser ? "My" : toUserName + "'s" }} Bookmarks
      </v-chip>
    </div>

    <!-- 其他选择按钮 -->
    <div
        class="text-center"
        v-show="isOut === 'otherOne' || isOut === 'dontShow'"
    >
      <v-chip
          class="ma-2"
          label
          :outlined="isOut !== 'otherOne' && isOut !== 'dontShow'"
          color="black"
          dark
          @click="recent"
      >
        <v-icon left>
          mdi-account-circle
        </v-icon>
        <span :style="isOut === 'otherOne' ? '':'text-decoration: line-through'">
            {{ toUserName }}
          </span>
      </v-chip>
    </div>

  </v-container>
</template>
<script>
export default {
  name: 'HomePageButtons',

  methods:{
    // 下载（导出）用户的网页数据
    exportHtmlFile() {
      // 打开 3000 端口的 /file 路径，而 3000 号端口映射了后端服务器的端口
      window.open("/file?username=" + this.toUserName, "_blank");
    },
    // 打开所有标签页面
    openAllTagsPage() {
      this.$router.push("/all-tags");
    },
    // 去 filter 页面
    goToFilter() {
      this.$router.push("/filter");
    },
    // 去最多收藏的页面
    goToPopularPage() {
      this.$router.push("/popular");
    }
  },

  props: {
    currentUser: {},
    findAll: {},
    findMine: {},
    findOthers: {},
    isOut: {},
    recent: {},
    toUserName: {}
  }
}
</script>