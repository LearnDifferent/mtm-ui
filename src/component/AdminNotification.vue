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
            v-model="noticeCon"
            @keyup.enter="toSendNotify"
        ></v-textarea>

        <v-btn
            color="#c4edde"
            class="mr-4 text-none"
            @click="sendNotify(1)"
        >
          <v-icon left>
            mdi-send
          </v-icon>
          Send Notification
        </v-btn>
        <v-btn
            color="#7ac7c4"
            class="mr-4 text-none"
            @click="sendNotify(0)"
        >
          <v-icon left>
            mdi-hand-pointing-right
          </v-icon>
          Send Push Notification
        </v-btn>
        <v-btn
            color="#f73859"
            class="mr-4 text-none"
            @click="delNotify"
        >
          <v-icon left>
            mdi-delete
          </v-icon>
          Delete Notifications
        </v-btn>
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
    noticeCon: '',
    // 所有通知
    notifications: '',
  }),
  methods: {
    // 删除所有通知
    delNotify() {
      if (confirm("Remove All System Notifications?")) {
        this.axios.delete("/system").then(res => {
          if (res.data.code == 200) {
            alert("Deleted");
          } else {
            alert("Please wait a minute before you try again");
          }
        }).catch(error => {
          if (error.response.data.code === 2009) {
            alert("You are now login as Guest: Guest can't delete system notifications\n\n" +
                "Please login as Standard User or Admin to delete system notifications");
          }
        }).finally(() => {
          // 更新通知
          this.getNotify();
        });
      }
    },
    // 获取通知
    getNotify() {
      this.axios.get("/system").then(res => {
        this.notifications = res.data.data;
      });
    },
    // 发送通知
    sendNotify(priority) {
      if (this.noticeCon.trim() == '') {
        alert("Please enter something..");
        return;
      }
      this.axios.get("/notification/system/send", {
        params: {
          message: this.noticeCon,
        }
      }).then(res => {
        alert("Sent");
      }).catch(()=>{
        alert("Something went wrong, please try again later");
      }).finally(() => {
        // 更新发送的内容
        this.noticeCon = '';
        // 更新通知
        this.getNotify();
      });
    },
    // 回车发送通知
    toSendNotify() {
      this.sendNotify(1);
    },

  },

  created() {
    // 进入页面就获取系统通知
    this.getNotify();
  }
}
</script>