<template>
  <v-card-actions>
    <v-row no-gutters>
      <v-col>
        <v-btn
            class="text-none"
            outlined
            rounded
            text
            color="red"
            @click="deleteAccount"
        >
          <v-icon left>
            mdi-delete-outline
          </v-icon>
          Delete My Account
        </v-btn>
      </v-col>
      <v-col>
        <v-btn
            class="text-none"
            outlined
            rounded
            text
            color="orange"
            @click="changeShowPwd"
        >
          Change Password
          <v-icon right>
            {{ showChangePwd ? 'mdi-arrow-right-bold-outline' : 'mdi-lock-plus-outline' }}
          </v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </v-card-actions>
</template>
<script>
export default {
  name: 'ChangeUserInfoButton',
  props: {
    changeShowPwd: {},
    showChangePwd: {},
    currentUsername: {},
  },
  methods:{

    // 删除用户确认框
    deleteAccount() {
      if (confirm("Once you delete your account, there is no going back. Please be certain.\n\n"
          + "Are you absolutely sure?")) {
        let username = this.currentUsername;
        this.$router.push({
          path: `/delete/${username}`,
        })
      }
    },

  },
}
</script>
