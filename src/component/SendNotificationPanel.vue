<template>
  <v-expansion-panel>
    <v-expansion-panel-header>
      <h3>Send System Notifications</h3>
    </v-expansion-panel-header>

    <v-expansion-panel-content style="font-size: small">
      Note: Everyone has the permission to send system notifications
    </v-expansion-panel-content>
    <v-expansion-panel-content style="font-size: small">
      Note: The limit for system notifications is 20
    </v-expansion-panel-content>

    <v-expansion-panel-content>
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
          color="success"
          class="mr-4 text-none"
          @click="sendNotify"
      >
        <v-icon left>
          mdi-send
        </v-icon>
        Send
      </v-btn>
      <v-btn
          class="mr-4 text-none"
          @click="getSystemNotifications"
      >
        <v-icon left>
          mdi-email-open-outline
        </v-icon>
        View System Notifications
      </v-btn>
      <v-btn
          color="error"
          class="mr-4 text-none"
          @click="delNotify"
      >
        <v-icon left>
          mdi-delete
        </v-icon>
        Delete All System Notifications
      </v-btn>
    </v-expansion-panel-content>
  </v-expansion-panel>
</template>
<script>
export default {
  name: 'SendNotificationPanel',
  data:()=>({
    // 通知相关
    noticeCon: '',

  }),
  methods: {
    // 删除所有通知
    delNotify() {
      if (confirm("Remove All System Notifications?")) {
        this.axios.delete("/notify").then(res => {
          if (res.data.code == 200) {
            alert("Deleted");
          } else {
            alert("Please wait a minute before you try again");
          }
        });
      }
    },

    // 发送通知
    sendNotify() {
      if (this.noticeCon.trim() == '') {
        alert("Please enter something..");
      } else {
        this.axios.get("/notify/send/" + this.noticeCon).then(res => {
          alert(res.data.msg);
        });
        this.noticeCon = '';
      }
    },
    // 回车发送通知
    toSendNotify() {
      this.sendNotify();
    },

  },
  props: {
    getSystemNotifications: {},
  }
}
</script>