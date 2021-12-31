<template>
  <div class="text-center" style="margin-top: 6%">

    <v-row justify="center" v-show="!deleting">
      <v-card ref="form" width="50%" class="text-center">
        Confirm Deletion
        <v-card-text>
          <p><b>Unexpected bad things will happen if you don’t read this!</b></p>
          <p>
            This action cannot be undone. This will permanently delete your account <a>{{ username }}</a> and remove all
            your data.
          </p>
          <v-text-field
              v-model="password"
              :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
              :rules="[rules.required, rules.min, rules.max]"
              :type="show ? 'text' : 'password'"
              name="input-10-1"
              label="Please type your password to confirm"
              hint="Type your password and click the 'Confirm' button"
              counter
              @keyup.enter="deleteAccount"
              @click:append="show = !show"
              style="margin-bottom: 4%;"
          ></v-text-field>
          <v-btn class="text-none" color="orange" @click="deleteAccount">Confirm</v-btn>
        </v-card-text>
      </v-card>
    </v-row>

    <v-progress-circular
        v-show="deleting"
        indeterminate
        color="orange"
        size="500"
        width="20"
    >
      <p style="color: coral">
        <b>Deleting Account: {{ username }}</b><br><br>
        Please wait a few minutes.
      </p>
    </v-progress-circular>
  </div>
</template>

<script>
export default {
  name: "DeletingPage",
  data: () => ({
    username: '',
    // 是否正在删除
    deleting: '',
    password: '',
    // 密码是否明文显示
    show: false,
    // 密码规则
    rules: {
      required: value => !!value || 'Please type your password to continue.',
      min: v => v.length >= 8 || 'Password must be greater than 8 characters',
      max: v => v.length <= 50 || 'Password must be less than 50 characters'
    },
  }),

  methods: {
    deleteAccount() {
      this.deleting = true;
      this.axios.delete("/user", {
        params: {
          userName: this.username,
          password: this.password
        }
      }).then(res => {
        if (res.data.code == 200) {
          this.$router.push("/login");
          alert("You account has been deleted");
        } else if (res.data.code == 500) {
          alert(res.data.msg);
          document.getElementById("myUserBtn").click();
        } else {
          alert(res.data.msg);
          this.$router.push("/login");
        }
      }).catch(error => {
        if (error.response.data.code == 2009) {
          alert("'" + this.username + "' is not your account. You can only delete your own account.")
          document.getElementById("myUserBtn").click();
        } else if (error.response.data.code == 2006) {
          alert(error.response.data.msg);
          location.reload();
        } else {
          alert("Fail to delete for some reasons. Please try again later.");
          document.getElementById("myHomeBtn").click();
        }
      }).finally(() => {
        this.deleting = false
      });
    }
  },

  created() {
    this.username = this.$route.params.username;
  }
}
</script>

<style scoped>

</style>
