<template>
  <v-list-item three-line>
    <v-list-item-content>

      <v-list-item-title class="headline mb-1">
        <v-textarea
            label="Username"
            no-resize
            readonly
            rows="1"
            :value="user.userName"
        ></v-textarea>
      </v-list-item-title>

      <v-list-item-title class="headline mb-1">
        <v-textarea
            label="ID"
            no-resize
            readonly
            rows="1"
            :value="user.userId"
        ></v-textarea>
      </v-list-item-title>

      <v-list-item-title class="headline mb-1">
        <v-textarea
            label="Signed in"
            no-resize
            readonly
            rows="1"
            :value="user.createTime"
        ></v-textarea>
      </v-list-item-title>

      <v-list-item-title class="headline mb-1">
        <v-textarea
            label="Role"
            no-resize
            readonly
            rows="1"
            :value="user.role"
        ></v-textarea>
      </v-list-item-title>

      <v-list-item-title class="headline mb-1" v-show="ip">
        <v-textarea
            label="Your IP"
            no-resize
            readonly
            rows="1"
            :value="ip"
        ></v-textarea>
      </v-list-item-title>

    </v-list-item-content>

    <v-list-item-avatar
        size="60"
        :color="user.role === 'admin' ? '#e6b422' : 'black lighten-1'"
    >
      <span class="white--text headline">{{ user.userName.charAt(0) }}</span>
    </v-list-item-avatar>
  </v-list-item>
</template>

<script>
export default {
  name: "UserInfoList",
  data: () => ({
    // 用户信息
    user: [],
    // ip
    ip: '',
  }),

  props: {
    user: {
      type: Array,
      required: true
    },
    ip: {
      type: String,
      required: false
    },
  }
}
</script>

<style scoped>

</style>