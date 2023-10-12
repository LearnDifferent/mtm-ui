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
      </v-card-text>

    </v-card>
    <!-- 显示通知 -->
    <div>
      <v-simple-table>
        <template v-slot:default>
          <thead>
          <tr>
            <th class="text-left">
              Creation Time
            </th>
            <th class="text-left">
              Sender
            </th>
            <th class="text-left">
              Message
            </th>
          </tr>
          </thead>
          <tbody>
          <tr
              v-for="notification in notifications"
              :key="notification.id"
          >
            <td>{{ notification.creationTime | dateFormat('YYYY-MM-DD HH:mm') }}</td>
            <td>{{ notification.sender }}</td>
            <td>{{ notification.message }}</td>
          </tr>
          </tbody>
        </template>
      </v-simple-table>

      <!-- 加载新通知 -->
      <v-col v-show="totalSystemNotificationCount > 0
      && totalSystemNotificationCount > currentSystemNotificationCount">
        <v-btn
            outlined
            block
            color="#eebb23"
            @click="getSystemNotification"
        >
          <v-icon left>
            mdi-refresh
          </v-icon>
          More
        </v-btn>
      </v-col>
    </div>

  </div>
</template>
<script>
export default {
  name: 'AdminNotification',
  data: () => ({
    // 发送的通知内容
    content: '',
    // 所有的通知
    notifications: [],
    // 所有的通知数量
    totalSystemNotificationCount: 0,
    // 当前加载的通知数量
    currentSystemNotificationCount: 0,
  }),
  methods: {
    // 获取通知
    getSystemNotification() {
      this.axios.get("/notification", {
        params: {
          notificationType: 'SYSTEM_NOTIFICATION',
          loadCount: this.currentSystemNotificationCount + 10,
          isOrderReversed: true
        }
      }).then(res => {
        let data = res.data;
        this.notifications = data.notifications;
        this.totalSystemNotificationCount = data.count;
        if (this.notifications.length > 0) {
          this.currentSystemNotificationCount = this.notifications.length;
        }
      }).catch(error=>{
        this.notifications = 0;
        this.totalSystemNotificationCount = 0;
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
  },
}
</script>