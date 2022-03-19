<template>
  <div style="margin-top: 2%">
    <v-card
        :id="c.commentId"
        dark
    >
      <v-card-text>
        <p>
          <!-- 返回 -->
          <v-btn
              style="margin-right: 2%"
              x-small
              class="text-none"
              color="#d3381c"
              @click="goBack"
              rounded
          >
            <v-icon left>mdi-keyboard-return</v-icon>
            Back
          </v-btn>
          <!-- 改变排序 -->
          <v-btn
              style="margin-right: 2%"
              x-small
              class="text-none"
              color="#99ab4e"
              @click="orderChange"
              rounded
          >
            <v-icon left>mdi-restore</v-icon>
            Order
          </v-btn>
          <!-- 用户名 -->
          <v-icon left>
            {{ currentUsername == c.username ? 'mdi-account-check' : 'mdi-account-outline' }}
          </v-icon>
          {{ c.username }}

          <v-divider
              class="mx-2"
              vertical
          ></v-divider>

          <!-- 创建时间 -->
          <v-icon left>
            mdi-clock-outline
          </v-icon>
          {{ c.creationTime | dateFormat}}
        </p>
        <!-- 评论内容 -->
        <p>{{ c.comment }}</p>
      </v-card-text>
    </v-card>
    <hr class="hr-solid-content" :data-content="c.repliesCount > 1 ? 'Replies' : 'Reply'">
  </div>
</template>

<script>
export default {
  name: "ReplyToThisComment",

  data: () => ({
    // 评论
    c: '',
    // 当前用户名
    currentUsername: ''
  }),

  methods: {
    goBack() {
      this.$emit("goBackFromReplies");
    },
    orderChange() {
      this.$emit("changeOrder")
    }
  },

  props: {
    c: {
      type: Array,
      required: true
    },
    currentUsername: {
      type: String,
      required: true
    }
  },
}
</script>

<style scoped>
.hr-solid-content {
  color: #a2a9b6;
  border: 0;
  font-size: 20px;
  padding: 1em 0;
  position: relative;
}

.hr-solid-content::before {
  content: attr(data-content);
  position: absolute;
  padding: 0 1ch;
  line-height: 1px;
  border: solid #d0d0d5;
  border-width: 0 99vw;
  width: fit-content;
  /* for 不支持fit-content浏览器 */
  white-space: nowrap;
  left: 50%;
  transform: translateX(-50%);
}
</style>