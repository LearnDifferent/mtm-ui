<template>
  <v-alert
      prominent
      type="error"
  >
    <v-row align="center">
      <v-col class="grow">
        The Search-Engine Database has no {{
          searchMode === 'user' ? 'User'
              : searchMode === 'web' ? 'Bookmark' : 'Tag'
        }} Data for searching.
        You will NOT get any search results unless you
        Generate {{
          searchMode === 'user' ? 'User'
              : searchMode === 'web' ? 'Bookmark' : 'Tag'
        }} Data.
        Please <a href="javascript:void(0)" @click="updateData" style="color: aliceblue">click here</a> or the right
        button to Generate {{
          searchMode === 'user' ? 'User'
              : searchMode === 'web' ? 'Bookmark' : 'Tag'
        }} Data.
      </v-col>
      <v-col class="shrink">
        <v-btn class="text-none" @click="updateData">Generate</v-btn>
      </v-col>
    </v-row>
  </v-alert>
</template>
<script>
export default {
  name: 'AlertWhenNoData',
  props: {
    updateData: {},
    searchMode: {}
  }
}
</script>
