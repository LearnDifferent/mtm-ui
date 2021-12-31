<template>
  <div>
    <v-tabs
        fixed-tabs
        background-color="#474a4d"
        color="white"
        slider-color="#e0ebaf"
    >
      <v-tab class="text-none" @click="goToAdminPage(false)">
        <v-icon left>
          mdi-account-box
        </v-icon>
        Me
      </v-tab>

      <v-tab class="text-none" @click="goToAdminPage(true)">
        <v-icon left>
          mdi-head-cog
        </v-icon>
        Admin
      </v-tab>
    </v-tabs>

    <my-page :get-system-notifications="showOrCloseNotice" v-show="!viewAdmin"></my-page>
    <admin :get-system-notifications="showOrCloseNotice" v-show="viewAdmin"></admin>

    <v-snackbar
        v-model="snackbar"
        vertical
    >
      <span v-html="notice"></span>

      <template v-slot:action="{ attrs }">
        <v-btn
            color="red"
            text
            v-bind="attrs"
            @click="snackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import MyPage from "./MyPage";
import Admin from "./Admin";

export default {
  name: "UserPage",
  data: () => ({
    // 是否查看 admin
    viewAdmin: false,

    // 通知相关
    snackbar: false,
    notice: '',
  }),
  components: {Admin, MyPage},

  methods: {
    goToAdminPage(viewAdmin) {
      this.viewAdmin = viewAdmin;
    },

    // 查看通知按钮
    showOrCloseNotice() {
      this.snackbar = !this.snackbar;
      if (this.snackbar === true) {
        this.getNotify();
      }
    },
    // 获取通知
    getNotify() {
      this.axios.get("/notify").then(res => {
        this.notice = res.data.data;
      });
    },
  },

  created() {
    window.onload = function () {
      document.getElementById("myUserBtn").click();
    }
  }
}
</script>

<style scoped>

</style>