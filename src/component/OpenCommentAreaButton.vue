<template>
  <div>
    <v-btn
        rounded
        outlined
        :color="!showCommentArea ? '#5b7e91' : '#d0576b'"
        dark
        @click="showCommentsFunc"
        class="text-none"
    >
      <v-icon left>
        {{ showCommentArea ? 'mdi-comment-remove-outline' : 'mdi-comment-processing-outline' }}
      </v-icon>
      {{
      showCommentArea ? 'Close'
      : commentCount >= 0 ? 'Show Comment (' + commentCount + ')'
      : 'Show Comment'
      }}
    </v-btn>
  </div>
</template>
<script>
export default {
  name: 'OpenCommentAreaButton',
  props: {
    commentCount: {},
    showCommentArea: {},
    showCommentsFunc: {}
  }
}
</script>
