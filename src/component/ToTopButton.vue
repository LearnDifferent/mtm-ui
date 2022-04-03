<template>
  <v-btn
      fab
      large
      dark
      bottom
      right
      absolute
      @click="toTop"
  >
    <v-icon>mdi-rocket</v-icon>
  </v-btn>
</template>
<script>
export default {
  name: 'ToTopButton',
  methods:{
    // 页面回到顶部
    toTop() {
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    }
  }
}
</script>