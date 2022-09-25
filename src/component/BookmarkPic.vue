<template>
  <v-avatar
      class="ma-3"
      size="125"
      tile
      @click="view(item)"
  >
    <v-img :src="item.img"></v-img>
  </v-avatar>
</template>
<script>
export default {
  name: 'BookmarkPic',
  methods:{
    // 打开 view 详情
    view(item) {
      this.axios.get("/view/count", {
        params: {webId: item.id}
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
          this.jump(item.url, item.id);
        }
      }).catch((err) => {
        this.jump(item.url, item.id);
      });
    },
    // 跳转页面
    jump(url, bookmarkId) {
      window.open(url, '_blank');
      this.axios.get("/view?webId=" + bookmarkId);
    },
  },
  props: {
    item: {},
  }
}
</script>