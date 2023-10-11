<template>
  <div style="margin: 20px">
    <v-card
        class="mx-auto"
    >
      <v-card-title>
        Send System Notifications
      </v-card-title>

      <v-card-subtitle>
        The limit for system notifications is 20
      </v-card-subtitle>

      <v-card-text>
        <v-textarea
            name="input-7-1"
            filled
            color="grey"
            label="Notification Editor"
            auto-grow
            v-model="content"
            @keyup.enter="triggerSendSystemNotification"
        ></v-textarea>

        <v-btn
            color="#c4edde"
            class="mr-4 text-none"
            @click="sendSystemNotification()"
        >
          <v-icon left>
            mdi-send
          </v-icon>
          Send Notification
        </v-btn>

<!--        <v-btn-->
<!--            color="#f73859"-->
<!--            class="mr-4 text-none"-->
<!--            @click="delNotify"-->
<!--        >-->
<!--          <v-icon left>-->
<!--            mdi-delete-->
<!--          </v-icon>-->
<!--          Delete Notifications-->
<!--        </v-btn>-->
      </v-card-text>

    </v-card>
    <!-- 显示通知 -->
    <v-alert
        outlined
        style="margin-top: 20px"
    >
      <div v-html="notifications"></div>
    </v-alert>

  </div>
</template>
<script>
export default {
  name: 'AdminNotification',
  data: () => ({
    // 通知相关
    content: '',
    // 所有通知
    notifications: '',
  }),
  methods: {
    // 删除所有通知
    // delNotify() {
    //   if (confirm("Remove All System Notifications?")) {
    //     this.axios.delete("/system").then(res => {
    //       if (res.data.code == 200) {
    //         alert("Deleted");
    //       } else {
    //         alert("Please wait a minute before you try again");
    //       }
    //     }).catch(error => {
    //       if (error.response.data.code === 2009) {
    //         alert("You are now login as Guest: Guest can't delete system notifications\n\n" +
    //             "Please login as Standard User or Admin to delete system notifications");
    //       }
    //     }).finally(() => {
    //       // 更新通知
    //       this.getSystemNotification();
    //     });
    //   }
    // },
    // 获取通知
    getSystemNotification() {
      this.axios.get("/system").then(res => {
        this.notifications = res.data.data;
      });
    },
    // 发送通知
    sendSystemNotification() {
      if (this.content.trim() == '') {
        alert("Please enter something..");
        return;
      }
      this.axios.get("/notification/system/send", {
        params: {
          message: this.content,
        }
      }).then(res => {
        alert("Sent");
      }).catch(()=>{
        alert("Something went wrong, please try again later");
      }).finally(() => {
        // 更新发送的内容
        this.content = '';
        // 更新通知
        this.getSystemNotification();
      });
    },
    // 回车发送通知
    triggerSendSystemNotification() {
      this.sendSystemNotification();
    },

  },

  created() {
    // 进入页面就获取系统通知
    this.getSystemNotification();
  }
}
</script>