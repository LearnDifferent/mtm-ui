<template>
  <div>
    <v-card-title
        style="margin-bottom: 5px"
        class="headline"
        v-text="item.title"
        @click="view(item)"
    ></v-card-title>
    <v-card-subtitle v-text="item.desc"></v-card-subtitle>
  </div>
</template>
<script>
export default {
  name: 'BookmarkTitle',
  methods: {
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
    jump(url, id) {
      window.open(url, '_blank');
      this.axios.get("/view?bookmarkId=" + id);
    },
  },
  props: {
    item: {},
  }
}
</script>