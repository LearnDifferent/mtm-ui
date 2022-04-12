<template>
  <v-chip
      color="#84a2d4"
      outlined
      @click="openCommentOutside(item.webId)"
      style="margin-right: 3px"
  >
    <v-icon left>
      {{ showComment == item.webId ? 'mdi-comment-remove-outline' : 'mdi-comment-outline' }}
    </v-icon>
    Comment {{ commentCount > 0 ? '(' + commentCount + ')' : '' }}
  </v-chip>
</template>
<script>
export default {
  name: 'BookmarkCommentButton',
  data:()=>({
    commentCount: 0,
  }),
  props: {
    item: {},
    showComment: {}
  },
  methods:{
    openCommentOutside(webId) {
      this.$emit("openComment", webId);
    },
    countComment() {
      this.axios.get("/comment/get/number/" + this.item.webId).then(res => {
        if (res.data.code === 200) {
          this.commentCount = res.data.data;
        }
      }).catch(error => {
        // do nothing...
      });
    },
  },
  created() {
    this.countComment();
  }
}
</script>