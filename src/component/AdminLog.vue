<template>

  <div style="margin: 20px;
    border-radius: 25px;
    border: 2px solid grey;
    padding: 20px;">

    <v-switch
        @click="reloadLogs"
        v-model="isReadFromDb"
        color="green"
        :label="isReadFromDb ? 'Get logs from database directly'
              : 'Get logs from database and and cache memory'"
    ></v-switch>

    <LogsCard :logs="logs"/>

    <!-- pagination -->
    <div
        style="text-align: center; margin-top: 8px"
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
import AdminRegisterNotification from "@/component/AdminRegisterNotification"
import LogsCard from "@/component/LogsCard"

export default {
  name: 'AdminLog',
  components: {AdminRegisterNotification, LogsCard},
  data: () => ({
    // current page
    currentPage: 1,
    // True if data is read from database directly
    isReadFromDb: false,
    // logs
    logs: [],
  }),
  methods: {
    // 重新载入数据
    reloadLogs() {
      this.currentPage = 1;
      this.getLogs();
    },
    // 切换页面
    movePage(count) {
      if (count === -1 && this.currentPage === 1) {
        // 页面不能 <1
        return;
      }
      this.currentPage += count;
      this.getLogs();
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
    // 获取 logs
    getLogs() {
      let requestPath = "/system/logs";
      if (this.isReadFromDb) {
        requestPath += "/no-cache"
      }
      this.axios.get(requestPath, {
        params: {
          currentPage: this.currentPage,
        }
      }).then(res => {
        if (res.data.code === 200) {
          let array = res.data.data;
          let hasNewValue = this.maxPageCheckAndReturnArrayHasNewValue(array);
          if (hasNewValue === true) {
            this.logs = array;
          }
        } else {
          alert("Something went wrong...");
        }
      }).catch((error) => {
        if (error.response.data.code === 2009) {
          this.isAdmin = false;
        } else {
          alert(error.response.data.msg);
        }
      });
    },


  },

  created() {
    this.getLogs();
  }

}
</script>