<template>
  <v-alert
      prominent
      type="warning"
      v-show="totalPage===0"
  >
    <v-row align="center">
      <v-col class="grow">
        No Data Available
      </v-col>
      <v-col class="shrink">
        <v-btn @click="refreshPage">
          <v-icon>
            mdi-home
          </v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </v-alert>
</template>
<script>
export default {
  name: 'NoDataInHomePage',
  props: {
    refreshPage: {},
    totalPage: {}
  }
}
</script>