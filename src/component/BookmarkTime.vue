<template>
  <div>
    <v-icon>mdi-clock-outline</v-icon>
    <span style="color: grey;">
      {{ creationTime | dateFormat('YYYY-MM-DD HH:mm') }}
    </span>
  </div>
</template>
<script>
export default {
  name: 'BookmarkTime',
  props: {
    creationTime: {}
  }
}
</script>