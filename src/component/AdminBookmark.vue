<template>

  <div style="margin: 20px;
    border-radius: 25px;
    border: 2px solid grey;
    padding: 20px;">

    <div style="margin: 10px">
      Data will be updated every 12 hours. You can
      <a @click="updateViews">
        click here to
        <v-btn class="text-none" color="#93ca76" x-small>
          <v-icon x-small>
            mdi-refresh
          </v-icon>
          Update Immediately
        </v-btn>
      </a>
    </div>
    <v-card>
      <v-card-title>
        All Visited Bookmarks
        <v-spacer></v-spacer>
      </v-card-title>
      <v-simple-table
          fixed-header
      >
        <template v-slot:default>
          <thead>
          <tr>
            <th class="text-left">
              Views
            </th>
            <th class="text-left">
              ID
            </th>
            <th class="text-left">
              Title
            </th>
            <th class="text-left">
              Username
            </th>
            <th class="text-left">
              Privacy (Edit)
            </th>
          </tr>
          </thead>
          <tbody>
          <tr
              v-for="item in visitedBookmarks"
              :key="item.bookmarkId"
          >
            <td>{{ item.views }}</td>
            <td>{{ item.bookmarkId }}</td>
            <td>
              <a :href="item.url" target="_blank">{{ item.title }}</a>
            </td>
            <td>{{ item.username }}</td>
            <td>
              <v-btn
                  class="text-none"
                  x-small
                  :color="item.isPublic ? 'green' : 'red'"
                  @click="changePrivacy(item.bookmarkId, item.username, item.isPublic)"
              >
                {{ item.isPublic ? 'Public' : 'Private' }}
              </v-btn>
            </td>
          </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-card>

    <!-- pagination -->
    <div
        style="text-align: center;
                  margin-top: 15px"
    >
      <v-btn small rounded @click="movePage(-1)">
        <v-icon>mdi-skip-previous</v-icon>
      </v-btn>
      <input
          :placeholder="currentPage"
          readonly="readonly"
          style="width:30px;height:30px;text-align: center;border: solid grey;"
      >
      <v-btn small rounded @click="movePage(1)">
        <v-icon>mdi-skip-next</v-icon>
      </v-btn>
    </div>
    <!-- pagination -->
  </div>
</template>

<script>
export default {
  name: "AdminBookmark",

  data: () => ({
    // current page
    currentPage: 1,
    // 网页 ID 及其阅读数
    visitedBookmarks: [],
  }),

  methods: {

    // 获取数据库中的被阅读过的网页的数据
    getVisitedBookmarks() {
      this.axios.get("/bookmark/visited-bookmarks?currentPage=" + this.currentPage).then(res => {
        let array = res.data;
        let hasNewValue = this.maxPageCheckAndReturnArrayHasNewValue(array);
        if (hasNewValue === true) {
          this.visitedBookmarks = array;
        }
      }).catch((error) => {
        if (error.response.data.code === 2009) {
          this.isAdmin = false;
        } else {
          alert(error.response.data.msg);
        }
      });
    },

    // 修改网页的隐私权限
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
            this.getVisitedBookmarks();
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


    // 更新阅读量数据
    updateViews() {
      if (confirm("Are you sure you want to update now? It might take a long time.")) {
        this.axios.get("/view/update").then(res => {
          if (res.data.code === 200) {
            let failKeys = res.data.data;
            if (failKeys === null || failKeys.length === 0) {
              alert("Success");
            } else {
              alert("Not Fully Successful.\nHere are the keys that failed to update: \n\n"
                  + failKeys + "\n\n"
                  + "You can check the keys in Redis to fix the error.");
            }
            // refresh
            this.getVisitedBookmarks();
          } else {
            // res.data.code 不是 200 时：
            alert("Something went wrong...");
          }
        }).catch((error) => {
          alert(error.response.data.msg);
        });
      }
    },

    // 切换页面
    movePage(count) {
      if (count === -1 && this.currentPage === 1) {
        // 页面不能 <1
        return;
      }
      this.currentPage += count;
      this.getVisitedBookmarks();
    },

    // 限定最大页数，并返回是否有新的数据
    maxPageCheckAndReturnArrayHasNewValue(array) {
      if (array === null || array.length === 0) {
        // 此时已经没有数据
        if (this.currentPage > 1) {
          // 页面如果不是 1 的话，就 -1
          this.currentPage -= 1;
        }
        // 没有新的数据
        alert("No More Data");
        return false;
      }
      // 有新的数据
      return true;
    },

  },

  created() {
    this.getVisitedBookmarks();
  }
}
</script>

<style scoped>

</style>