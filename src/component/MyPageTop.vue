<template>
  <v-row no-gutters>
    <v-col order="first">
      <v-card
          class="pa-2"
          outlined
          style="margin-bottom: 2%;margin-right: 1%"
      >
        <!-- 用户信息列表 -->
        <UserInfoList :ip="ip" :user="user"></UserInfoList>

        <ChangeUserInfoButton
            :change-show-pwd="changeShowPwd"
            :current-username="this.user.userName"
            :show-change-pwd="showChangePwd"/>
      </v-card>
    </v-col>

    <v-col order="last" v-show="!showChangePwd">
      <ExportAndImport :current-username="user.userName"
                       @openMyBookmarks="openMyBookmarks"/>
    </v-col>

    <v-col order="last" v-show="showChangePwd">
      <v-card
          outlined
          style="margin-top: 2%;margin-bottom: 2%"
      >
        <v-form
            ref="form"
            v-model="valid"
            lazy-validation
        >
          <div style="margin-left: 20px;margin-right: 20px;margin-top: 10px">
            <v-text-field
                v-model="user.userName"
                label="Username"
                disabled
            ></v-text-field>
          </div>
          <div style="margin-left: 20px;margin-right: 20px">
            <v-text-field
                v-model="oldPassword"
                :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                :type="show1 ? 'text' : 'password'"
                :rules="pwdRules"
                name="input-10-1"
                label="Old password"
                hint="At least 8 characters"
                :loading="isLoading"
                counter
                @click:append="show1 = !show1"
            ></v-text-field>
          </div>

          <div style="margin-left: 20px;margin-right: 20px">
            <v-text-field
                v-model="newPassword"
                :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                :type="show1 ? 'text' : 'password'"
                :rules="pwdRules"
                name="input-10-1"
                label="New password"
                hint="At least 8 characters"
                counter
                :loading="isLoading"
                @click:append="show1 = !show1"
            ></v-text-field>
          </div>

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
                :disabled="!valid"
                color="success"
                class="mr-4"
                @click="validate"
            >
              Update Password
            </v-btn>
          </div>
        </v-form>
      </v-card>
    </v-col>

  </v-row>
</template>

<script>
import UserInfoList from "./UserInfoList";
import ChangeUserInfoButton from "@/component/ChangeUserInfoButton";
import ExportAndImport from "@/component/ExportAndImport";

export default {
  name: "MyPageTop",
  components: {ExportAndImport, ChangeUserInfoButton, UserInfoList},
  data: () => ({
    // 密码相关：
    show1: false,
    oldPassword: '',
    newPassword: '',
    pwdRules: [
      v => !!v || 'Password is required',
      v => (v && v.length >= 8) || 'Password must be greater than 8 characters',
    ],
    // 验证表单
    valid: true,
    // 当前用户
    user: '',
    // 当前 IP
    ip: '',
    // 是否显示修改密码的框
    showChangePwd: false,
    // 修改密码的进度提示
    isLoading: false,
  }),

  props: {
    user: {
      type: Map,
      required: true
    },
    ip: {
      type: String,
      required: true,
    },
  },

  methods: {

    openMyBookmarks() {
      this.$emit("getMyWebsDataByCurrentPage");
    },

    changeShowPwd() {
      this.showChangePwd = !this.showChangePwd
    },

    // 验证登陆信息，用于修改密码
    validate() {
      this.$refs.form.validate();
      this.isLoading = true;
      let submitData = {
        userName: this.user.userName,
        oldPassword: this.oldPassword,
        newPassword: this.newPassword
      }
      this.axios.post("/user/change-password", submitData).then(res => {
        alert(res.data.msg);
        this.oldPassword = '';
        this.newPassword = '';
        this.showChangePwd = false;
        // 成功修改密码会返回 2014
        if (res.data.code == 2014) {
          this.axios.get("/log/out").then(res => {
            if (res.data.code === 200) {
              this.$router.push("/login");
              alert("Please Login again with the new password.");
            }
          });
        }
      }).catch(error => {
        if (error.response.data.code === 3002) {
          // 3002 表示密码错误
          alert(error.response.data.msg);
        }
        if (error.response.data.code === 2009) {
          // 2009 表示没有权限，这里指 Guest 用户无法修改密码
          alert("Guest don't have permission to change password");
        }
      }).finally(() => {
        this.isLoading = false
      });
    },

  },
}
</script>

