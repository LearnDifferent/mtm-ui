<template>
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
</template>
<script>
export default {
  name: 'BookmarkViewButton',
  methods: {
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
      this.axios.get("/view?webId=" + webId);
    },
  },
  props: {
    item: {},
  }
}
</script>