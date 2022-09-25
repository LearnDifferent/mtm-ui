<template>
  <v-chip
      color="#683f36"
      @click="openTag(item)"
      outlined
      style="margin-right: 3px"
  >
    <v-icon left>
      mdi-tag-multiple-outline
    </v-icon>
    Tag <span v-show="tagName">: {{ tagName }}</span>
  </v-chip>
</template>
<script>
export default {
  name: 'BookmarkTagButton',

  data: () => ({
    tagName: '',
  }),

  methods: {
    // 打开标签页
    openTag(item) {
      this.$router.push({
        name: 'web',
        params: {
          item: item,
          tagMode: true,
          previousPage: this.previousPage,
          previousPageNum: this.previousPageNum,
          currentUser: this.currentUser,
        }
      });
    },

  },

  props: {
    // 这个 item 是页面初始化的时候就有的，所以不包含 tagName 信息
    item: {},
    previousPageNum: {},
    currentUser: {},
    previousPage: {},
  },

  created() {
    this.axios.get("/tag/one?webId=" + this.item.id).then(res => {
      if (res.data.code === 200) {
        this.tagName = res.data.data;
      }
    }).catch(error => {
      // do nothing...
    });
  }
}
</script>