<template>
  <div>
    <BackToHomeButton msg="You are viewing popular bookmarks. "/>

    <v-container class="mx-auto">
      <v-row dense>
        <v-col
            v-for="(item, i) in items"
            :key="i"
            cols="12"
        >
          <v-card>
            <div class="d-flex flex-no-wrap justify-space-between">
              <div>
                <v-card-title
                    class="headline"
                    v-text="item.title"
                    @click="jump(item.url)"
                ></v-card-title>
                <v-card-subtitle v-text="item.desc"></v-card-subtitle>
                <v-card-actions>
                  <v-chip
                      color="green"
                      outlined
                      @click="mark(item)"
                      style="margin-right: 3px"
                  >
                    <v-icon left>
                      mdi-heart-plus
                    </v-icon>
                    Add
                  </v-chip>
                  <v-chip
                      color="#bf783a"
                      @click="jump(item.url)"
                      outlined
                      style="margin-right: 3px"
                  >
                    <v-icon left>
                      mdi-link-variant
                    </v-icon>
                    View
                  </v-chip>

                  <v-divider
                      class="mx-2"
                      vertical
                  ></v-divider>

                  <div style="color: grey">Saved by {{ item.count }} user<span
                      v-show="item.count > 1">s</span>
                  </div>
                </v-card-actions>
              </div>

              <v-avatar
                  class="ma-3"
                  size="125"
                  tile
                  @click="jump(item.url)"
              >
                <v-img :src="item.img"></v-img>
              </v-avatar>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- pagination -->
      <v-row align-content="center" v-show="totalPage !== 0">
        <v-col>
          <v-pagination
              v-model="currentPage"
              :length="totalPage"
              circle
              @input="loadHome(currentPage)"
          ></v-pagination>
        </v-col>
      </v-row>

      <!-- 没有内容时提示 -->
      <NoDataInHomePage :total-page="totalPage"/>
    </v-container>

    <ToTopButton/>
  </div>
</template>

<script>
import BackToHomeButton from "@/component/BackToHomeButton";
import ToTopButton from "@/component/ToTopButton";
import NoDataInHomePage from "@/component/NoDataInHomePage";

export default {
  name: "PopularBookmarks",
  components: {NoDataInHomePage, ToTopButton, BackToHomeButton},
  data: () => ({
    items: [],
    // 分页
    currentPage: 1,
    totalPage: 1,
  }),

  methods: {
    // 跳转页面
    jump(url) {
      window.open(url, '_blank');
    },

    // 此用户保存已经存放在数据库内的网页
    mark(item) {
      if (confirm("Add it to your Bookmarks?")) {
        let website = {
          title: item.title,
          url: item.url,
          img: item.img,
          desc: item.desc
        };
        this.axios.post("/bookmark", website).then(res => {
          alert(res.data.msg);
          if (res.data.code === 200) {
            // 收藏成功就展示刷新按钮
            this.refreshShow = true;
          }
        }).catch(error => {
          if (error.response.data.code === 2010) {
            // 代码为 2010 表示已经收藏过
            alert(error.response.data.msg);
          }
          if (error.response.data.code === 3020) {
            // 3020 表示输入有误
            let msg = error.response.data.msg + ':\n';

            let errorList = error.response.data.data;
            for (let i = 0; i < errorList.length; i++) {
              msg += errorList[i] + "\n";
            }
            alert(msg);
          }
        });
      }
    },

    loadHome(currentPage) {
      this.axios.get("/home/popular", {
        params: {
          "currentPage": currentPage,
        }
      }).then(res => {
        this.items = res.data.bookmarks;
        this.totalPage = res.data.totalPages;

        if (this.totalPage < this.currentPage && this.totalPage !== 0) {
          this.currentPage = this.totalPage;
          this.loadHome(this.currentPage);
        }
        // 让页面返回顶部
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
      });
    },
  },

  created() {
    this.loadHome(1);
  }
}
</script>

<style scoped>

</style>