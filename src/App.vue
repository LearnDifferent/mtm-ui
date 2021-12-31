<template>
  <v-app>
    <v-app-bar
        app
        dense
        color="dark"
        dark
    >

      <div class="d-flex align-lg-content-center">
        <a href="https://github.com/LearnDifferent/mtm" target="_blank"
           style="color: whitesmoke; text-decoration:none;">
          <span><v-icon> mdi-github </v-icon> GitHub </span>
        </a>
      </div>

      <v-spacer></v-spacer>
      <div class="d-flex justify-center">

        <v-tabs
            center-active
            color="dark"
        >
          <v-tab id="myHomeBtn" @click="changePage('/home')">
            <v-icon left>mdi-home</v-icon>
            Home
          </v-tab>

          <v-tab id="myFindBtn" @click="changePage('/find')">
            <v-icon left>mdi-magnify</v-icon>
            Search
          </v-tab>

          <v-tab id="myUserBtn" @click="changePage('/user')">
            <v-icon left>mdi-account</v-icon>
            User
          </v-tab>
        </v-tabs>
      </div>

      <div class="text-center d-flex order-last">
        <v-btn
            dark
            icon
            small
            color="red darken-2"
            @click="logoutNow()"
        >
          <v-icon>
            mdi-logout
          </v-icon>
        </v-btn>
      </div>

      <v-spacer></v-spacer>
    </v-app-bar>
    <v-main>
      <router-view/>
    </v-main>
  </v-app>
</template>

<script>

export default {
  name: 'App',

  components: {},

  methods: {
    // 切换页面
    changePage(page) {
      this.$router.push({path: page})
    },
    // 退出登陆
    logoutNow() {
      if (confirm("Are you sure you want to Sign Out?")) {
        this.axios.get("/log/out").then(res => {
          if (res.data.code === 200) {
            alert("Good Bye")
            this.$router.push("/login");
          }
        });
      }
    }
  },
};
</script>

<style scoped>

</style>
