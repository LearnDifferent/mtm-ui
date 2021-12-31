<template>
  <v-container style="max-height: 30%;margin-top: 10%">
    <v-card
        class="mx-auto"
        max-width="40%"
        max-height="50%"
        outlined
        :loading="isLoading"
    >
      <v-form
          ref="form"
          v-model="valid"
          lazy-validation
      >
        <div style="margin-left: 20px;margin-right: 20px;margin-top: 10px">
          <v-text-field
              v-model="name"
              :counter="30"
              :rules="nameRules"
              label="Username"
              :loading="isLoading"
              required
              @keyup.enter="validate"
          ></v-text-field>
        </div>
        <div style="margin-left: 20px;margin-right: 20px">
          <v-text-field
              v-model="password"
              :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
              :type="show1 ? 'text' : 'password'"
              :rules="pwdRules"
              name="input-10-1"
              label="Password"
              :loading="isLoading"
              hint="At least 8 characters"
              counter
              @click:append="show1 = !show1"
          ></v-text-field>
        </div>

        <div style="margin-left: 20px;margin-right: 20px">
          <v-text-field
              v-model="code"
              :rules="verification"
              label="Verification Code"
              :loading="isLoading"
              required
              @keyup.enter="validate"
          >
            <template v-slot:append>
              <a href="javascript:void(0);" @click="getVCode">
                <v-fade-transition leave-absolute>
                  <v-progress-circular
                      v-if="loading"
                      size="24"
                      color="info"
                      indeterminate
                  ></v-progress-circular>
                  <img
                      v-else
                      width="80px"
                      height="30px"
                      :src="verCode"
                      alt="verification code"
                      style="margin-bottom: 3px"
                  >
                </v-fade-transition>
              </a>
            </template>
          </v-text-field>
        </div>
        <br/>

        <div v-show="status" style="text-align:center;margin: 3px 20px;">
          <v-alert
              v-model="alert"
              close-text="Close Alert"
              v-bind:color="alertColor"
              outlined
              dense
          >
            <span v-html="status"></span>
          </v-alert>
          <v-chip
              class="ma-2"
              color="indigo"
              outlined
              pill
              @click="jumpToLogin"
              v-show="showJumpToLogin"
          >
            <v-icon left>
              mdi-account-outline
            </v-icon>
            Click here to Login
          </v-chip>

        </div>

        <div style="text-align:center;margin-bottom: 10px" v-show="!showJumpToLogin">
          <v-btn
              :disabled="!valid || isLoading"
              color="success"
              class="mr-4 text-none"
              @click="validate"
          >
            Create Account
          </v-btn>
        </div>

      </v-form>
      <v-progress-linear
          v-show="isLoading"
          color="primary"
          indeterminate
          rounded
          height="6"
          style="margin-top: 4px"
      ></v-progress-linear>
    </v-card>
  </v-container>

</template>

<script>
export default {
  name: "Register",
  data: () => ({
    // 注册提示条
    isLoading: false,
    // 验证
    valid: true,
    // 用户名相关：
    name: '',
    nameRules: [
      v => !!v || 'Username is required',
      v => (v && v.length <= 30) || 'Username must be less than 30 characters',
      v => /^[a-z0-9A-Z]+$/.test(v) || 'Username must contain ONLY letters and numbers',
    ],
    // 密码相关：
    show1: false,
    password: '', //默认密码
    pwdRules: [
      v => !!v || 'Password is required',
      v => (v && v.length >= 8) || 'Password must be greater than 8 characters',
      v => v.length <= 50 || 'Password must be less than 50 characters'
    ],
    // 验证码相关：
    verification: [
      v => !!v || 'Enter the verification code shown in the image',
      v => (v && v.length === 4) || 'Enter 4 characters verification code',
    ],
    // 获取输入的验证码
    code: '',
    // 图片
    verCode: '',
    // checkbox: false,
    // 信息
    status: '',
    success: '',
    alertColor: '#8E2323',
    // 是否显示点击此处立刻跳转按钮
    showJumpToLogin: false
  }),

  methods: {
    // 提交注册相关
    validate() {
      this.$refs.form.validate();
      this.isLoading = true;
      let submitData = {
        userName: this.name,
        password: this.password,
      }
      this.axios.post("/user/create", submitData, {
        params: {
          code: this.code,
          role: "user",
          verifyToken: localStorage.getItem("verifyToken")
        }
      }).then(res => {
        if (res.data.code === 500) {
          // 500 表示错误
          this.status = res.data.msg;
        } else if (res.data.code === 200) {
          this.status = '<b>Success!</b><br>' +
              'Your new account has been registered.<br>' +
              'Please click below if you are not redirected in 3 seconds';
          this.alertColor = 'green';
          this.showJumpToLogin = true;
          setTimeout(() => {
            this.$router.push("/login");
            this.showJumpToLogin = false;
          }, 3000);
        } else {
          // 其他情况，打印信息
          this.status = res.data.msg;
        }
      }).catch(error => {
        // 2004 表示用户已存在
        // 2007 表示验证码错误
        // 2008 表示邀请码错误
        // 3014 表示没有传入用户角色
        // 3003 表示用户名只能为英文和数字，出现其他的字符就报错
        // 3004 和 3005 表示用户名太长和密码太长
        // 3006 和 3007 表示用户名和密码为空
        let code = error.response.data.code;
        if (code === 2004 || 2007 || 2008 || 3014
            || 3003 || 3004 || 3005 || 3006 || 3007) {
          this.status = error.response.data.msg;
        }
      }).finally(() => {
        this.isLoading = false;
      });
    },
    // 点击此处立刻跳转
    jumpToLogin() {
      this.$router.push("/login");
      this.showJumpToLogin = false;
    },
    // 获取随机字符串
    getRandomStr() {
      let text = "";
      let pool = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      for (let i = 0; i < 10; i++)
        text += pool.charAt(Math.floor(Math.random() * pool.length));
      return text;
    },
    // 获取验证码（注意加上时间戳，防止浏览器缓存）
    getVCode() {
      let verifyToken = this.getRandomStr();
      localStorage.setItem("verifyToken", verifyToken);

      this.axios.get("/verify/getVerImg?time=" + new Date().getTime(), {
        params: {verifyToken: verifyToken}
      }).then(resp => {
        this.verCode = resp.data;
      });
    },
  },

  created() {
    // 加载页面之前就获取验证码
    this.getVCode();
  }
}
</script>

<style scoped>

</style>
