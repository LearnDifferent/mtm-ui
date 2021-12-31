<template>
  <v-btn
      class="text-none"
      block
      color="orange"
      outlined
      rounded
      @click="updateData">
    <v-icon>mdi-cached</v-icon>
    <span>Detected Data Changes... Click here to Update Data</span>
  </v-btn>
</template>
<script>
export default {
  name: 'AlertWhenDataHasChanges',
  props: {
    updateData: {},
  }
}
</script>