<template>
  <v-btn
      large
      block
      class="text-none"
      color="#80989b"
      @click="backToHome"
      style="margin-bottom: 5px"
  >
    <v-icon left>
      mdi-keyboard-backspace
    </v-icon>
    {{msg}} Click here to go back
    <v-icon>mdi-home-outline</v-icon>
  </v-btn>
</template>
<script>
export default {
  name: 'BackToHomeButton',
  methods: {
    // 返回首页
    backToHome() {
      document.getElementById("myHomeBtn").click();
    },
  },
  props:{
    msg:{}
  }
}
</script>
