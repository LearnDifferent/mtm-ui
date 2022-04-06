<template>
  <v-progress-linear
      v-show="processing"
      color="#b35c44"
      indeterminate
      rounded
      height="30px"
      style="margin-top: 1%;margin-bottom: 1%"
  >
    <div style="size: 20px">{{ processing }}</div>
  </v-progress-linear>
</template>
<script>
export default {
  name: 'ProcessingLinear',
  props: {
    processing: {}
  }
}
</script>