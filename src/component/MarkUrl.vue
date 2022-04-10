<template>
  <v-container
      style="border-radius: 25px;
        border: 2px solid grey;
        padding: 20px;">
    <v-text-field
        label="Paste a Website Link (URL) here"
        v-model="newWebUrl"
        @keyup.enter="saveNewWeb"
    ></v-text-field>
    <div>
      <v-switch
          v-model="publicPrivacy"
          color="green"
          :label="publicPrivacy ? 'Public: Anyone on this website': 'Private: Only Me'"
          :prepend-icon="publicPrivacy ? 'mdi-earth' : 'mdi-lock'"
      ></v-switch>
    </div>
    <div v-show="publicPrivacy">
      <v-switch
          v-model="addToSearch"
          color="green"
          :prepend-icon="addToSearch ? 'mdi-magnify' : 'mdi-magnify-minus'"
          :label="addToSearch ? 'Make it searchable' : 'Don\'t make it searchable'"
      ></v-switch>
    </div>

    <div v-show="addToSearch" style="margin-bottom: 1%">
      <a @click="goToSearchPage">
        <v-icon left>mdi-alert-circle-outline</v-icon>
        This bookmark will be searchable on Search Page
      </a>
    </div>
    <div>
      <v-btn
          color="success"
          class="mr-4 text-none"
          @click="saveNewWeb"
      >
        <v-icon left>
          mdi-plus-box-multiple
        </v-icon>
        Bookmark
      </v-btn>
      <span style="color: slategray" v-show="!saveWebMsg">⬅ Press this button</span>
      <span v-bind:style="saveWebMsgColor" v-show="saveWebMsg">{{ saveWebMsg }}</span>
      <v-progress-linear
          v-show="isLoading"
          color="orange accent-4"
          indeterminate
          rounded
          height="6"
          style="margin-top: 5px"
      ></v-progress-linear>
    </div>

    <v-alert
        v-show="analyseError"
        style="margin-top: 1%"
        border="top"
        close-text="Close Alert"
        outlined
        color="#f2a0a1"
        dark
        dismissible
    >
      {{ analyseError }}
    </v-alert>
  </v-container>
</template>
<script>
export default {
  name: 'MarkUrl',

  data: () => ({
    // 当前用户
    username: '',
    // 是否在收藏的同时，加入到搜索引擎中
    addToSearch: false,
    // 是否正在解析网页
    isLoading: false,
    // 需要存储的网页链接
    newWebUrl: '',
    // 是否将网页公开
    publicPrivacy: true,
    // 存储网页链接后返回的信息
    saveWebMsg: '',
    // 返回信息的颜色
    saveWebMsgColor: 'color: orange',
    // 展示错误信息排查
    analyseError: '',
  }),

  props: {
    username: {
      type: String,
      required: true
    }
  },

  methods: {
    // 跳转到搜索页面
    goToSearchPage() {
      document.getElementById("myFindBtn").click();
    },

    // 点击 mark 按钮，根据URL保存新的网页
    saveNewWeb() {
      this.analyseError = '';
      this.saveWebMsg = "Saving this Web Page. Please wait......";
      this.isLoading = true;
      this.axios.get("/bookmark",{
        params:{
          url: this.newWebUrl,
          mode: this.addToSearch ? 1 : 0,
          privacy: this.publicPrivacy ? 'public' : 'private'
        }
      }).then(res => {

            let hasSavedToDatabase = res.data.hasSavedToDatabase;
            let hasSavedToElasticsearch = res.data.hasSavedToElasticsearch;

            if (hasSavedToElasticsearch === null) {
              // 无需同步到 Elasticsearch 的情况
              if (hasSavedToDatabase === true) {
                this.saveWebMsg = "Success!";
                this.saveWebMsgColor = 'color: green';
                this.$emit("showRefresh");
              } else {
                this.saveWebMsg = "Fail to bookmark this website.";
                this.saveWebMsgColor = 'color: red';
              }
            } else {
              // 需要同步到数据库的情况
              if (hasSavedToDatabase === true && hasSavedToElasticsearch === true) {
                this.saveWebMsg = "Success!";
                this.saveWebMsgColor = 'color: green';
                this.$emit("showRefresh");
              } else if (hasSavedToDatabase === true && hasSavedToElasticsearch === false) {
                this.saveWebMsg = "Saved successfully, but fail to make it searchable";
                this.saveWebMsgColor = 'color: orange';
                this.$emit("showRefresh");
              } else {
                // 只要没有存入数据库，就当作失败处理
                this.saveWebMsg = "Fail to bookmark this website.";
                this.saveWebMsgColor = 'color: red';
              }
            }

          }
      ).catch(error => {
        let code = error.response.data.code;
        if (code === 2012) {
          // 网页链接被拒绝
          this.analyseError = "Access denied because " +
              "the server is blocked by the website or " +
              "the server is located in the country that has blocked the website";
        } else if (code === 5001) {
          // 连接超时
          this.analyseError = 'There seems to be a problem with your Network Connection. ' +
              'Or the server is located in the country that has blocked the website';
        } else {
          this.analyseError = '';
        }
        this.saveWebMsg = error.response.data.msg;
        this.saveWebMsgColor = 'color: red';
      }).finally(() => {
        this.isLoading = false;
      });

      this.newWebUrl = '';
    },
  },
}
</script>
