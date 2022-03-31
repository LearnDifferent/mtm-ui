<template>
  <div>
    <v-btn block v-show="tagMode === true" class="text-none" color="#d0af4c" @click="goBack">
      <v-icon left>
        mdi-keyboard-backspace
      </v-icon>
      You are now viewing tags. Click here to go back.
    </v-btn>
    <v-card>
      <div class="d-flex flex-no-wrap justify-space-between">
        <div>
          <v-card-title
              class="headline"
              v-html="item.title"
              @click="openWebPage(item)"
          ></v-card-title>

          <v-card-subtitle v-html="item.desc" @click="openWebPage(item)"></v-card-subtitle>

          <v-card-actions v-show="item.createTime">
            <v-chip
                class="ma-2"
                color="#8AC009"
                label
                outlined
            >
              <v-icon left>
                mdi-clock-outline
              </v-icon>
              {{ item.createTime | dateFormat('YYYY-MM-DD HH:mm') }}
            </v-chip>

          </v-card-actions>
        </div>

        <v-avatar
            class="ma-3"
            size="125"
            tile
            @click="openWebPage(item)"
        >
          <v-img :src="item.img"></v-img>
        </v-avatar>
      </div>

    </v-card>

    <v-divider v-show="tagMode" style="margin-top: 20px;margin-bottom: 1%"></v-divider>
    <!-- tags -->
    <div v-show="tagMode === true" class="text-center">
      <!-- add new tag -->
      <v-row>
        <v-col align="center">
          <v-text-field
              style="max-width: 30%;align-content: center"

              v-model="newTag"
              label="Apply a Tag"
              clearable
              @click:prepend-inner="applyTag(item.webId)"
              prepend-inner-icon="mdi-send"
              @keyup.enter="applyTag(item.webId)"
          ></v-text-field>
        </v-col>
      </v-row>

      <!-- show tags -->
      <v-chip
          v-for="(tag, i) in tagsArray"
          :key="i"
          class="ma-2"
          color="#dc3023"
          text-color="white"
          @click="goToTagSearchPage(tag)"
      >
        {{ tag }}
        <v-icon right @click.stop="deleteTag(tag)">
          mdi-close
        </v-icon>
      </v-chip>
    </div>

  </div>
</template>
<script>

export default {
  name: 'WebsiteSearchResults',

  data: () => ({
    tagMode: false,
    tagsArray: [],
    newTag: '',
  }),

  props: {
    item: {},
    tagMode: {},
    previousPage: {},
    previousPageNum: {},
  },

  methods: {
    // 跳转页面
    openWebPage(item) {
      let msg = "Title: " + item.title + "\n"
          + "URL: " + item.url + "\n\n"
          + "Do you want to open this website?";
      if (confirm(msg)) {
        window.open(item.url, '_blank');
      }
    },
    // 回到之前的页面
    goBack() {
      this.$router.push({
        path: this.previousPage,
        query: {currentPage: this.previousPageNum}
      });
    },

    // 搜索该标签的所有网页数据
    goToTagSearchPage(searchingTag) {
      this.$router.push({
        name: 'tag-search',
        params: {
          searchingTag: searchingTag,
          formerItem: this.item,
        }
      });
    },

    // 删除标签
    deleteTag(tag) {
      if (confirm("Do you want to delete this tag?")) {
        let webId = this.item.webId;
        this.axios.delete("/tag", {
          params: {
            webId: webId,
            tagName: tag
          }
        }).then(res => {
          if (res.data.code === 200) {
            this.getTags(webId);
          }
          alert(res.data.msg);
        }).catch((error) => {
          if (error.response.data.code === 2009) {
            alert("You don't have permission to delete this tag: This is not your bookmark");
          } else {
            alert(error.response.data.msg);
          }
        });
      }
    },

    // 添加标签
    applyTag(webId) {
      let tag = this.newTag;
      if (tag === null || tag === '') {
        alert("Please enter a tag");
        return;
      }
      this.axios.get("/tag/apply", {
        params: {
          webId: webId,
          tag: tag
        }
      }).then(res => {
        alert(res.data.msg);
        if (res.data.code === 200) {
          this.getTags(webId);
        }
      }).catch((error) => {
        if (error.response.data.code === 2009) {
          alert("This is not your bookmark. You can only add tags for your own bookmark.");
        } else {
          alert(error.response.data.msg);
        }
      }).finally(() => {
        this.newTag = '';
      });
    },

    // 获取标签
    getTags(webId) {
      this.axios.get("/tag?webId=" + webId).then(res => {
        if (res.data.code === 200) {
          this.tagsArray = res.data.data;
        } else {
          // 特殊情况
          alert("No Tags");
          this.goBack();
        }
      }).catch((error) => {
        if (error.response.data.code === 2013) {
          this.tagsArray = [];
        } else {
          alert(error.response.data.msg);
        }
      });
    }
  },

  watch: {
    tagMode: {
      handler(newVal, oldVal) {
        if (newVal === true) {
          this.getTags(this.item.webId);
        }
      },
      immediate: true
    },
  },

}
</script>