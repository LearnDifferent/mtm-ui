<template>
  <div>
    <!-- 展示筛选的数据 -->
    <div style="border-radius: 25px;border: 2px solid #8AC007;padding: 20px;">

      <!-- 数据筛选 -> 筛选出来的用户-->
      <span v-for="(sel, i) in selected" :key="i">
            <v-chip
                class="ma-2search"
                color="green"
                outlined
                label
                style="margin: 1px"
            >
              <v-icon left>
                mdi-account-circle-outline
              </v-icon>
              {{ sel.userName }}
            </v-chip>
          </span>

      <!-- 数据筛选 -> 筛选出来的日期-->
      <v-row>
        <v-col
            cols="12"
            order-lg="6"
        >
          <v-datetime-picker label="Select Datetime" v-model="fromDate">
            <template slot="dateIcon">
              <v-icon>mdi-calendar-clock</v-icon>
            </template>
            <template slot="timeIcon">
              <v-icon>mdi-clock</v-icon>
            </template>
          </v-datetime-picker>

          <v-datetime-picker label="Select Another Datetime"
                             v-model="toDate">
            <template slot="dateIcon">
              <v-icon>mdi-calendar-clock</v-icon>
            </template>
            <template slot="timeIcon">
              <v-icon>mdi-clock</v-icon>
            </template>
          </v-datetime-picker>

        </v-col>
      </v-row>

      <!-- 筛选相关按钮： -->
      <!-- 发送筛选请求 -->
      <v-btn
          rounded
          class="text-none"
          color="#8AC007"
          dark
          @click="sendNewFilterRequest"
      >
        <v-icon left>mdi-send</v-icon>
        Find
      </v-btn>
      <v-divider vertical style="margin-left: 3px;margin-right: 3px"></v-divider>
      <!-- 打开筛选器 -->
      <v-btn
          rounded
          color="black"
          class="text-none"
          outlined
          @click="showFilter = !showFilter"
      >
        <v-icon left>{{ showFilter ? 'mdi-arrow-down-thick' : 'mdi-filter-plus-outline' }}</v-icon>
        Select Users
      </v-btn>
    </div>

    <v-row>
      <v-divider style="margin-top: 20px;margin-bottom: 1%"></v-divider>
    </v-row>

    <!-- 筛选器 Filter-->
    <div v-show="showFilter">
      <v-row>
        <!-- 数据筛选 -> 筛选用户的表格-->
        <v-col
            cols="12"
            lg="12"
        >
          <v-text-field
              background-color="#484848"
              dark
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              label="Search Username"
              single-line
              hide-details
          ></v-text-field>
          <v-data-table
              :search="search"
              dark
              calculate-widths
              height="320px"
              v-model="selected"
              :headers="userHeaders"
              :items="userToSelect"
              item-key="userName"
              show-select
              class="elevation-1"
              :single-select="singleSelect"
          >
          </v-data-table>
        </v-col>
      </v-row>
    </div>

    <!-- 对筛选结果进行排序 -->
    <div style="text-align: center" v-show="count > 0">

      <v-chip
          class="ma-2"
          color="success"
          outlined
          @click="changeFilterOrder"
      >
        <v-icon left>
          <!-- 0：User - Ascend -->
          {{ !this.ifDesc && !this.ifOrderByTime ? 'mdi-sort-alphabetical-ascending' : '' }}
          <!-- 1：Time - Ascend -->
          {{ !this.ifDesc && this.ifOrderByTime ? 'mdi-sort-clock-ascending-outline' : '' }}
          <!-- 2：User - Descend -->
          {{ this.ifDesc && !this.ifOrderByTime ? 'mdi-sort-alphabetical-descending' : '' }}
          <!-- 3：Time - Descend -->
          {{ this.ifDesc && this.ifOrderByTime ? 'mdi-sort-clock-descending-outline' : '' }}
        </v-icon>

        <!-- 0：User - Ascend -->
        {{ !this.ifDesc && !this.ifOrderByTime ? 'Username - Ascend' : '' }}
        <!-- 1：Time - Ascend -->
        {{ !this.ifDesc && this.ifOrderByTime ? 'Time - Ascend' : '' }}
        <!-- 2：User - Descend -->
        {{ this.ifDesc && !this.ifOrderByTime ? 'Username - Descend' : '' }}
        <!-- 3：Time - Descend -->
        {{ this.ifDesc && this.ifOrderByTime ? 'Time - Descend' : '' }}
      </v-chip>
    </div>
  </div>
</template>

<script>
import moment from "moment";

export default {
  name: "FilterWebsiteData",
  data: () => ({
    // 用于筛选：有 userName 和 webCount 的列表
    userToSelect: [],
    // Filter 相关内容：
    // 展示筛选器
    showFilter: true,
    // 用户筛选
    selected: [],
    singleSelect: false,
    userHeaders: [
      {
        text: 'Username',
        align: 'start',
        sortable: false,
        value: 'userName',
      },
      {text: 'Bookmark(s)', value: 'webCount'},
    ],
    // 用于搜索：
    search: '',
    // 加载了多少条数据
    count: 0,
    // 对筛选出来对结果进行排序
    ifOrderByTime: true,
    ifDesc: false,
    // 筛选时间
    fromDate: '',
    toDate: '',
  }),

  props: {
    userToSelect: {
      type: Array,
      required: true
    },
    count: {
      type: Number,
      required: true
    }
  },

  methods: {
    // 修改排序方式
    changeFilterOrder() {
      if (!this.ifDesc && !this.ifOrderByTime) {
        this.ifDesc = true;
        this.ifOrderByTime = false;
      } else if (this.ifDesc && !this.ifOrderByTime) {
        this.ifDesc = true;
        this.ifOrderByTime = true;
      } else if (this.ifDesc && this.ifOrderByTime) {
        this.ifDesc = false;
        this.ifOrderByTime = true;
      } else {
        this.ifDesc = false;
        this.ifOrderByTime = false;
      }
      this.sendNewFilterRequest();
    },
    // 点击发送筛选按钮
    sendNewFilterRequest() {
      this.showFilter = false;

      // 获取被选中的用户名
      let usernames = [];
      for (let s of this.selected) {
        usernames.push(s.userName);
      }

      let dates = [];
      if (this.fromDate != null && this.fromDate !== '') {
        let fromDate = moment(this.fromDate).local(true);
        dates.push(fromDate);
      }
      if (this.toDate != null && this.toDate !== '') {
        let toDate = moment(this.toDate).local(true);
        dates.push(toDate);
      }

      this.$emit("filterNewRequestSend",
          usernames, dates, this.ifOrderByTime, this.ifDesc);
    },
  },

}
</script>

<style scoped>

</style>