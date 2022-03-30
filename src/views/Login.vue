<template>
  <v-container style="max-height: 30%;margin-top: 10%">
    <v-card
        class="mx-auto"
        max-width="40%"
        max-height="50%"
        outlined
        :loading="isLoading"
    >
      <v-card-title class="justify-center">
        Sign In
      </v-card-title>
      <v-form
          ref="form"
          v-model="valid"
          lazy-validation
      >
        <v-tooltip right>
          <template v-slot:activator="{ on, attrs }">
            <div
                v-bind="attrs"
                v-on="on"
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
                    hint="At least 8 characters"
                    counter
                    :loading="isLoading"
                    @click:append="show1 = !show1"
                    @keyup.enter="validate"
                ></v-text-field>
              </div>
            </div>
          </template>
          <span>Case Sensitive</span>
        </v-tooltip>

        <div style="margin-left: 20px;margin-right: 20px">
          <v-text-field
              v-model="code"
              :rules="verification"
              label="Verification Code"
              required
              :loading="isLoading"
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
        <div v-show="status" style="text-align:center;margin-left: 20px;margin-right: 20px;margin-bottom: 3px">
          <v-alert
              v-model="alert"
              close-text="Close Alert"
              color="#8E2323"
              outlined
              dense
          >
            {{ status }}
          </v-alert>
        </div>

        <div style="text-align:center;margin-bottom: 10px">
          <v-btn
              :disabled="!valid || isLoading"
              color="success"
              class="mr-4 text-none"
              @click="validate"
          >
            Login
          </v-btn>

          <v-btn
              :disabled="isLoading"
              color="error"
              class="mr-4 text-none"
              @click="reset"
          >
            Clear
          </v-btn>
        </div>
        <div style="text-align:center;">
          <a href="javascript:void(0);" style="color: grey;" @click="createAccount">
            Create an account
          </a>
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
  name: "Login",
  data: () => ({
    // 登陆提示条
    isLoading: false,
    // 验证
    valid: true,
    // 用户名相关：
    name: 'Guest',
    nameRules: [
      v => !!v || 'Username is required',
      v => (v && v.length <= 30) || 'Username must be less than 30 characters',
    ],
    // 密码相关：
    show1: false,
    password: 'github.com/LearnDifferent/mtm', //默认密码
    pwdRules: [
      v => !!v || 'Password is required',
      v => (v && v.length >= 8) || 'Password must be greater than 8 characters',
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
    // 信息
    status: '',
    // 正在处理登陆信息
    processing: false
  }),

  methods: {
    // 验证登陆信息
    validate() {
      this.$refs.form.validate();
      this.isLoading = true;
      let data = {
        userName: this.name,
        password: this.password,
      }

      this.axios.post("/log/in", data, {
        params: {
          code: this.code,
          verifyToken: localStorage.getItem("verifyToken"),
        }
      }).then(res => {
        if (res.data.code === 200) {
          // 存储 token 信息
          let tokenValue = res.data.data.tokenValue;
          let tokenName = res.data.data.tokenName;
          localStorage.setItem('tokenValue', tokenValue);
          localStorage.setItem('tokenName', tokenName);
          // 因为可能在其他标签页内登陆，所以使用点击的方式跳转
          document.getElementById("myHomeBtn").click();
        }
      }).catch(error => {
        if (error.response.data.code === 2006) {
          // 代码为 2006 表示登陆错误
          this.status = error.response.data.msg;
        }
        if (error.response.data.code === 2007) {
          // 2007 表示验证码错误
          this.status = error.response.data.msg;
        }
      }).finally(() => {
        this.isLoading = false;
      });
    },
    // 跳转到注册页面
    createAccount() {
      this.$router.push("/register");
    },
    // 清除表单的内容
    reset() {
      this.$refs.form.reset();
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
