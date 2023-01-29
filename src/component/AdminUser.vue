<template>
  <div style="margin: 20px;
    border-radius: 25px;
    border: 2px solid grey;
    padding: 20px;">
    <v-card>
      <v-card-title>
        All Users
      </v-card-title>
      <v-simple-table
          fixed-header
      >
        <template v-slot:default>
          <thead>
          <tr>
            <th class="text-left">
              ID
            </th>
            <th class="text-left">
              Username
            </th>
            <th class="text-left">
              Creation Time
            </th>
            <th class="text-left">
              Role (Edit)
            </th>
          </tr>
          </thead>
          <tbody>
          <tr
              v-for="item in users"
              :key="item.id"
          >
            <td>{{ item.id }}</td>
            <td>{{ item.userName }}</td>
            <td>{{ item.createTime | dateFormat }}</td>
            <td>
              <v-btn
                  class="text-none"
                  x-small
                  :color="item.role === 'admin' ? '#ecc960' : item.role === 'user' ? 'green' : 'white'"
                  @click="changeUserRole(item.id, item.userName, item.role)"
              >
                {{ item.role === 'admin' ? 'Admin' : item.role === 'user' ? 'User' : 'Guest' }}
              </v-btn>
            </td>
          </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-card>

    <!-- pagination -->
    <div
        style="text-align: center;margin-top: 20px;"
    >
      <v-btn small rounded @click="movePage(-1)">
        <v-icon>mdi-skip-previous</v-icon>
      </v-btn>
      <input
          :placeholder="currentPage"
          readonly="readonly"
          style="width:30px;height:30px;text-align: center;border: solid grey;"
      >
      <v-btn small rounded @click="movePage(1)">
        <v-icon>mdi-skip-next</v-icon>
      </v-btn>
    </div>
    <!-- pagination -->

  </div>
</template>

<script>
export default {
  name: "AdminUser",
  data: () => ({
    // current page
    currentPage: 1,
    // 用户
    users: [],
  }),
  methods: {
    getUsers() {
      this.axios.get("/user/all?currentPage=" + this.currentPage).then(res => {
        let array = res.data;
        let hasNewValue = this.maxPageCheckAndReturnArrayHasNewValue(array);
        if (hasNewValue === true) {
          this.users = array;
        }
      }).catch((error) => {
        if (error.response.data.code === 2009) {
          this.isAdmin = false;
        } else {
          alert(error.response.data.msg);
        }
      });
    },

    // 修改用户角色
    changeUserRole(userId, userName, role) {

      if (role === 'guest') {
        alert("You don't have permission to modify the Guest");
        return;
      }
      let msg;
      let newRole;
      if (role === 'admin') {
        msg = "Do you want to Downgrade '" + userName
            + "' from Admin to Standard User?";
        newRole = 'user';
      } else if (role === 'user') {
        msg = "Do you want to Upgrade '" + userName
            + "' from Standard User to Admin?";
        newRole = 'admin';
      } else {
        alert("You don't have permission to modify this user")
        return;
      }

      if (confirm(msg)) {
        this.sendChangeUserRoleRequest(userId, newRole);
      }
    },
    sendChangeUserRoleRequest(userId, newRole) {
      this.axios.get("/user/role", {
        params: {
          id: userId,
          newRole: newRole
        }
      }).then(res => {
        if (res.data.code === 200) {
          // 成功的话，刷新列表
          this.getUsers();
        }
        alert(res.data.msg);
      }).catch((error) => {
        alert(error.response.data.msg);
      });
    },


    // 切换页面
    movePage(count) {
      if (count === -1 && this.currentPage === 1) {
        // 页面不能 <1
        return;
      }
      this.currentPage += count;
      this.getUsers();
    },

    // 限定最大页数，并返回是否有新的数据
    maxPageCheckAndReturnArrayHasNewValue(array) {
      if (array === null || array.length === 0) {
        // 此时已经没有数据
        if (this.currentPage > 1) {
          // 页面如果不是 1 的话，就 -1
          this.currentPage -= 1;
        }
        // 没有新的数据
        alert("No More Data");
        return false;
      }
      // 有新的数据
      return true;
    },
  },

  created() {
    this.getUsers();
  }
}
</script>

<style scoped>

</style>