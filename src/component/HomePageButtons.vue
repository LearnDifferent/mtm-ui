<template>
  <v-container>
    <!-- 选择按钮 -->
    <div class="d-flex justify-center" style="margin-bottom: 2%">
      <v-btn
          rounded
          color="black"
          dark
          @click="recent"
      >
        <v-icon left>
          mdi-home
        </v-icon>
        Home
      </v-btn>
      <v-divider vertical style="margin-left: 1%;margin-right: 1%"></v-divider>
      <v-btn
          rounded
          outlined
          color="black"
          dark
          @click="goToPopularPage"
      >
        <v-icon left>
          mdi-fire
        </v-icon>
        Popular
      </v-btn>
      <v-divider vertical style="margin-left: 1%;margin-right: 1%"></v-divider>
      <v-btn
          rounded
          outlined
          color="black"
          dark
          @click="goToFilter"
      >
        <v-icon left>
          mdi-filter-plus-outline
        </v-icon>
        Filter
      </v-btn>

      <!-- Tag -->
      <v-divider vertical style="margin-left: 1%;margin-right: 1%"></v-divider>
      <v-btn
          class="text-none"
          rounded
          outlined
          color="black"
          dark
          @click="openAllTagsPage"
      >
        <v-icon left>
          mdi-tag-multiple-outline
        </v-icon>
        Tag
      </v-btn>
    </div>

    <div class="text-center">
      <v-chip
          class="ma-2"
          label
          color="black"
          :outlined="isOut!=='all'"
          dark
          @click="findAll"
      >
        <v-icon left>
          mdi-account-circle
        </v-icon>
        All
      </v-chip>
      <v-chip
          class="ma-2"
          label
          :outlined="isOut!=='mine'"
          color="black"
          dark
          @click="findMine"
      >
        <v-icon left>
          mdi-account-circle
        </v-icon>
        Only Mine
      </v-chip>
      <v-chip
          class="ma-2"
          label
          :outlined="isOut!=='others'"
          color="black"
          dark
          @click="findOthers"
      >
        <v-icon left>
          mdi-account-circle
        </v-icon>
        Only Others
      </v-chip>
      <!-- 导出用户收藏的网页数据（在 mine 和 otherOne 的情况下才会显示-->
      <v-chip
          v-show="isOut === 'mine' || isOut === 'otherOne'"
          color="#b6d7de"
          @click="exportHtmlFile"
      >
        <v-icon left>
          mdi-download
        </v-icon>
        Download {{ requestedUserId == currentUserId ? "My" : requestedUsername + "'s" }} Bookmarks
      </v-chip>
    </div>

    <!-- 其他选择按钮 -->
    <div
        class="text-center"
        v-show="isOut === 'otherOne' || isOut === 'dontShow'"
    >
      <v-chip
          class="ma-2"
          label
          :outlined="isOut !== 'otherOne' && isOut !== 'dontShow'"
          color="black"
          dark
          @click="recent"
      >
        <v-icon left>
          mdi-account-circle
        </v-icon>
        <span :style="isOut === 'otherOne' ? '':'text-decoration: line-through'">
            {{ requestedUsername }}
          </span>
      </v-chip>
    </div>

  </v-container>
</template>
<script>
export default {
  name: 'HomePageButtons',

  methods: {
    // 下载（导出）用户的网页数据
    exportHtmlFile() {
      this.axios.get('/file', {
        params: {
          userId: this.requestedUserId
        },
        responseType: 'blob'
      }).then(res => {
        // data 后面可以包装为一个包含二进制数据的 Blob 对象（因为设置了 responseType: 'blob'）
        // headers 是 response 的请求头
        // 分开写为 let data = res.data; 和 let headers = res.headers; 也可以
        let {data, headers} = res;

        // 通过 new 一个 Blob 对象来获取 blob
        // 直接 new Blob([data]) 也可以
        let blob = new Blob([data], {type: headers['content-type']});

        // 获取 headers 中包含 filename 的信息，并提取出 filename
        let searchString = "attachment; filename=";
        // 删除第一次出现的 searchString
        let regex = new RegExp(searchString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        // 最后，获取输出的文件名
        let fileName = headers['content-disposition'].replace(regex, '');

        // 在 dom 中创建一个 a 标签并下载，下载后删除该元素
        let url = window.URL.createObjectURL(blob);
        let aElement = document.createElement('a');
        aElement.style.display = 'none';
        aElement.href = url;
        // 设置下载的属性和值，其值为下载后的文件名
        aElement.setAttribute('download', fileName);
        document.body.appendChild(aElement);
        aElement.click();
        window.URL.revokeObjectURL(aElement.href);
        document.body.removeChild(aElement);
      }).catch(error => {
        alert(error.response.data.msg);
      });
    },
    // 打开所有标签页面
    openAllTagsPage() {
      this.$router.push("/all-tags");
    },
    // 去 filter 页面
    goToFilter() {
      this.$router.push("/filter");
    },
    // 去最多收藏的页面
    goToPopularPage() {
      this.$router.push("/popular");
    }
  },

  props: {
    currentUserId: {},
    findAll: {},
    findMine: {},
    findOthers: {},
    isOut: {},
    recent: {},
    requestedUserId: {},
    requestedUsername: {},
  }
}
</script>