<template>
  <v-btn
      class="text-none text-center"
      color="yellow darken-2"
      outlined
      @click="getSystemNotifications"
  >
    <v-badge
        :value="hasReadNewSystemNotification == false"
        color="red"
        dot
    >
      <v-icon left>
        mdi-earth
      </v-icon>
      System Notifications
    </v-badge>
  </v-btn>
</template>
<script>
export default {
  name: 'SystemNotification',
  data:()=>({
    // 是否查看了最新的系统消息
    hasReadNewSystemNotification: true,
  }),
  methods:{
    // 是否还未查看新的系统通知
    hasNewSystemNotification() {
      this.axios.get("/system/read").then(res => {
        this.hasReadNewSystemNotification = res.data.code === 200;
      });
    },

  },

  created() {
    this.hasNewSystemNotification();
  },

  props: {
    getSystemNotifications: {},
  }
}
</script>
