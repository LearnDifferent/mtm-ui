<template>
  <div v-show="isAdmin===false">
    <v-expansion-panel-content>
      Please Login as Admin Or Create New Admin Account
    </v-expansion-panel-content>
    <v-expansion-panel-content>
      <AdminRegister :key="key"/>
    </v-expansion-panel-content>
  </div>
</template>
<script>
import AdminRegister from "./AdminRegister"

export default {
  name: 'AdminRegisterNotification',
  components: {AdminRegister},
  props: {
    isAdmin: {},
    key: {}
  }
}
</script>