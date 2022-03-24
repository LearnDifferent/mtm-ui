<template>
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
</template>
<script>
export default {
  name: 'WebsiteSearchResults',

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
  },

  props: {
    item: {},
  }
}
</script>