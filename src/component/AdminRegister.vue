<template>
  <v-container style="max-height: 30%;margin-top: 10%">
    <v-card
        class="mx-auto"
        max-width="40%"
        max-height="50%"
        outlined
        :loading="isLoading"
    >
      <v-card-title class="justify-center" style="color: #f7b977">
        Admin Registration
      </v-card-title>
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
              required
              :loading="isLoading"
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
        <div style="margin-left: 20px;margin-right: 20px">
          <v-text-field
              v-model="adminCode"
              label="Invitation Code"
              :rules="adminRule"
          >
            <template v-slot:append>
              <template>
                <v-row justify="center" style="margin-right: 1px">
                  <v-dialog
                      v-model="dialog"
                      persistent
                      max-width="600px"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                          class="text-none"
                          color="grey darken-1"
                          dark
                          v-bind="attrs"
                          v-on="on"
                      >
                        Get Code
                      </v-btn>
                    </template>
                    <v-card>
                      <v-card-title>
                        <span class="headline">Send invitation code to Email</span>
                      </v-card-title>
                      <v-card-text>
                        <v-container>
                          <v-row>
                            <v-col>
                              <v-text-field
                                  label="Email"
                                  v-model="email"
                              ></v-text-field>
                            </v-col>
                          </v-row>
                        </v-container>
                        <div>
                          <span>
                            <b>
                            *Click the <a @click="sendEmail">SEND</a> button and you will get the invitation code immediately.
                            </b>
                          </span>
                          <br><br>
                          <span style="color: grey">
                            *This application can send invitation code via email. However, the email service is not configured because it's easy to reach the sending limits if the application sends too many emails, which means <b>you will not get any email</b>.
                          </span>
                          <br><br>
                          <span style="color: grey">
                            *You can configure your own SMTP server if you want this application to send real emails.
                            <a href="https://github.com/LearnDifferent/mtm#email-service" target="_blank">
                               Click here to learn how.
                            </a>
                          </span>
                        </div>
                      </v-card-text>
                      <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn
                            color="red"
                            text
                            @click="dialog = false"
                        >
                          <span style="font-weight: lighter">Close</span>
                        </v-btn>
                        <v-btn
                            color="grey darken-1"
                            text
                            @click="sendEmail"
                        >
                          <span style="font-weight: bolder"><b>Send</b></span>
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </v-row>
              </template>
            </template>
          </v-text-field>
        </div>
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
        <div v-show="status"
             style="text-align:center;margin: 5px 20px 3px;">
          <v-alert
              v-model="alert"
              close-text="Close Alert"
              v-bind:color="alertColor"
              outlined
              dense
          >
            <span v-html="status"></span>
            <v-chip
                class="ma-2"
                color="#028760"
                outlined
                pill
                @click="goToAdminSignInPage"
                v-show="shouldShowAdminLogin"
            >
              <v-icon left>
                mdi-account-outline
              </v-icon>
              Click here to Login as Admin
            </v-chip>
          </v-alert>
        </div>

        <div style="text-align:center">
          <div style="margin-bottom: 10px">
            <v-btn
                :disabled="!valid || isLoading"
                color="#7ebea5"
                class="mr-4 text-none"
                @click="validate"
                v-show="!shouldShowAdminLogin"
            >
              Create new Admin account
            </v-btn>
          </div>
          <div style="margin-bottom: 2px">
            <a href="javascript:void(0);" style="color: #e6b422" @click="goToAdminSignInPage">
              Sign in to your Admin console
            </a>
          </div>
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
  name: 'AdminRegister',

  data: () => ({
    // 注册提示条
    isLoading: false,
    // Invitation Code
    invitationCodeValue: '',
    adminRule: [v => !!v || "Click 'Get Code' button to get your invitation code"],
    adminCode: '',
    // 邮箱
    email: '',
    // emailRules: [
    //   v => !!v || 'E-mail is required',
    //   v => /.+@.+\..+/.test(v) || 'E-mail must be valid',
    // ],
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
      v => v.length <= 50 || 'Password must be less than 50 characters',
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
    // 弹窗相关
    dialog: false,
    // 信息
    status: '',
    // 提示的颜色
    alertColor: '#8E2323',
    // 是否显示登陆管理员按钮
    shouldShowAdminLogin: false
  }),

  methods: {
    // 跳转到管理员登陆页面
    goToAdminSignInPage() {
      this.$router.push({
        path: 'login',
        query: {
          isAdminPage: 'true',
        }
      });
    },
    // 发送邮件
    sendEmail() {
      let invitationToken = this.getRandomStr();
      localStorage.setItem("invitationToken", invitationToken);

      this.axios.get("/verification/invitation-code", {
        params: {
          email: this.email,
          token: invitationToken
        }
      }).then(res => {
        alert("Sent. Please check your Email.");
      }).catch((error) => {
        if (error.response.data.code == 3008) {
          let invitationCode = error.response.data.data;
          alert("Your Invitation Code is: " + invitationCode);
          this.adminCode = invitationCode;
        } else {
          alert(error.response.data.msg);
        }
      }).finally(() => {
        this.dialog = false;
      });
    },
    // 获取随机字符串
    getRandomStr() {
      let text = "";
      let pool = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      for (let i = 0; i < 10; i++)
        text += pool.charAt(Math.floor(Math.random() * pool.length));
      return text;
    },
    // 获取验证码
    getVCode() {
      let verifyToken = this.getRandomStr();
      localStorage.setItem("verifyToken", verifyToken);

      this.axios.get("/verification/code?time=" + new Date().getTime(), {
        params: {token: verifyToken}
      }).then(resp => {
        this.verCode = resp.data;
      });
    },

    // 提交注册信息
    validate() {
      this.$refs.form.validate();
      this.isLoading = true;
      let submitData = {
        userName: this.name,
        password: this.password,
        role: "admin"
      }
      this.axios.post("/user", submitData, {
        params: {
          code: this.code,
          role: "admin",
          invitationCode: this.adminCode,
          token: localStorage.getItem("verifyToken"),
          invitationToken: localStorage.getItem("invitationToken")
        }
      }).then(res => {
        if (res.data.code === 500) {
          // 500 表示错误
          this.status = res.data.msg;
        } else if (res.data.code === 200) {
          // 200 表示成功
          this.status = '<b>Success!</b><br>' +
              'New admin account has been registered.<br>';
          this.alertColor = 'green';
          this.shouldShowAdminLogin = true;
        } else {
          // 其他情况，打印信息
          this.status = res.data.msg;
        }
      }).catch(error => {
        // 2004 表示用户已存在
        // 2007 表示验证码错误
        // 2008 表示邀请码错误
        // 3003 表示用户名只能为英文和数字，出现其他的字符就报错
        // 3004 和 3005 表示用户名太长和密码太长
        // 3006 和 3007 表示用户名和密码为空
        let code = error.response.data.code;
        if (code === 2004 || 2007 || 2008
            || 3003 || 3004 || 3005 || 3006 || 3007) {
          this.status = error.response.data.msg;
        }
      }).finally(() => {
        this.isLoading = false;
      });
    },

  },

  created() {
    this.getVCode();
  }

}
</script>
