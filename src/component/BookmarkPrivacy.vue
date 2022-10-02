<template>
  <v-chip
      :color="getPublic ? 'green' : 'pink'"
      :text-color="getPublic ? 'green' : 'pink'"
      outlined
      @click="changePrivacy(webId, userName, getPublic)"
      style="margin-right: 3px"
  >
    <v-icon left>{{ getPublic ? "mdi-eye" : "mdi-eye-off" }}</v-icon>
    {{ getPublic ? "Public" : "Private" }}
  </v-chip>
</template>
<script>
export default {
  name: 'BookmarkPrivacy',
  data: () => ({
    isPublicValue: null,
  }),
  computed:{
    getPublic() {
      if (this.isPublicValue === null) {
        this.isPublicValue = this.isPublic;
      }
      return this.isPublicValue;
    }
  },
  methods: {
    // 更新网页数据的隐私设置
    changePrivacy(id, userName, isPublic) {
      let publicOrPrivate = isPublic ? "private" : "public";
      if (confirm("Are you sure you want to make it "
          + publicOrPrivate + " ?")) {
        this.axios.get("/bookmark/privacy", {
          params: {
            "id": id
          }
        }).then(res => {
          if (res.data.code === 200 || res.data.code === 500) {
            alert(res.data.msg);
            this.isPublicValue = !isPublic;
          } else {
            alert("Something went wrong... Please try again later.")
          }
        }).catch(error => {
          if (error.response.data.code === 2009
              || error.response.data.code === 2001) {
            // 2009 表示没有权限，2001 表示网页不存在
            alert(error.response.data.msg);
          } else {
            alert("Something went wrong... Please try again later.")
          }
        });
      }
    },
  },
  props: {
    isPublic: {},
    webId: {},
    userName: {},
  }
}
</script>