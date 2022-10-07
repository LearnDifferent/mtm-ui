<template>
  <div
      style="border-radius: 25px;
              margin-top: 2%;
              border: 2px solid #84a2d4;
              padding: 20px;"
  >
    <v-chip
        style="margin-bottom: 1%"
        color="#84a2d4"
        outlined
        label
    >
      <v-icon left>
        mdi-comment-text-outline
      </v-icon>
      Comments
    </v-chip>

    <!-- 编辑新的评论 -->
    <!-- 在不是 replyMode 的情况下展示 -->
    <v-textarea
        v-show="!replyMode"
        label="Write a comment..."
        counter
        :rules="commentRule"
        auto-grow
        prepend-inner-icon="mdi-send"
        v-model="commentValue"
        @click:prepend-inner="confirmSendComment"
        color="#84a2d4"
        outlined
        rows="1"
        row-height="15"
        style="margin-bottom: 2%"
    ></v-textarea>

    <v-row>
      <v-col v-show="!replyMode">
        <!-- 在不是 replyMode 的情况下展示 -->
        <v-row>
          <!-- 发送评论 -->
          <div style="margin-left: 1%">
            <v-btn
                color="#6c848d"
                rounded
                outlined
                :disabled="!commentValue || commentValue.length > 140"
                @click="confirmSendComment"
            >
              <v-icon left>mdi-send</v-icon>
              Send
            </v-btn>
          </div>

          <v-divider
              class="mx-2"
              vertical
          ></v-divider>

          <!-- 打开评论区  -->
          <OpenCommentAreaButton
              :comment-count="commentCount"
              :show-comment-area="showCommentArea"
              :show-comments-func="showCommentsFunc"/>

          <!-- 选择是否 descending 排序  -->
          <v-divider
              v-show="showCommentArea"
              class="mx-2"
              vertical
          ></v-divider>
          <div v-show="showCommentArea">
            <v-btn
                rounded
                outlined
                color="#b88884"
                dark
                @click="changeOrder"
                class="text-none"
            >
              <v-icon left>
                {{ isDesc ? 'mdi-sort-descending' : 'mdi-sort-ascending' }}
              </v-icon>
              {{ isDesc ? 'Descending' : 'Ascending' }}
            </v-btn>
          </div>
        </v-row>
      </v-col>

      <!-- 回复该条评论时 -->
      <v-col cols="12" v-show="replyMode">
        <ReplyToThisComment @goBackFromReplies="goBackFromReplies"
                            @changeOrder="changeOrder"
                            :c="replyToThisCommentContent"
                            :currentUsername="currentUsername">
        </ReplyToThisComment>
      </v-col>

      <!-- 评论区 -->
      <v-col
          v-show="showCommentArea"
          v-for="(c,index) in comments"
          cols="12"
      >
        <!-- 编辑评论或展示历史时，围成圈 -->
        <div
            :style="editOrReplyCommentId == c.commentId || historyCommentId === c.commentId
            ? 'border-radius: 25px;margin-top: 2%;border: 2px solid #82ae46;padding: 20px;'
            : ''"
        >
          <!-- 展示评论 -->
          <v-card
              :color="prominentCommentId===c.commentId ? '#ee827c' : '#e7e7eb'"
              :id="'comment-' + c.commentId"
              @mouseover="onThisComment = c.commentId"
          >
            <v-card-text>
              <p>
                <!-- 回复按钮 -->
                <v-btn
                    x-small
                    class="text-none"
                    color="#6c848d"
                    @click="openEditCommentOrReply(c.comment, c.commentId, false)"
                    rounded
                >
                  <v-icon left>mdi-reply</v-icon>
                  Reply
                </v-btn>

                <v-divider
                    class="mx-2"
                    vertical
                ></v-divider>

                <v-btn
                    v-show="c.history.length > 0"
                    x-small
                    class="text-none"
                    color="#5c9291"
                    @click="getHistory(c.commentId, c.history)"
                    rounded
                >
                  <v-icon left>mdi-calendar-clock</v-icon>
                  Edit History
                </v-btn>

                <v-divider
                    class="mx-2"
                    vertical
                ></v-divider>
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
                {{ c.creationTime | dateFormat }}

                <!-- 打开重新编辑评论的按钮 -->
                <v-divider
                    v-show="currentUsername == c.username && onThisComment == c.commentId"
                    class="mx-2"
                    vertical
                ></v-divider>
                <v-btn
                    x-small
                    class="text-none"
                    color="#82ae46"
                    v-show="currentUsername == c.username && onThisComment == c.commentId"
                    @click="openEditCommentOrReply(c.comment, c.commentId, true)"
                    rounded
                >
                  <v-icon left>mdi-tooltip-edit-outline</v-icon>
                  Edit
                </v-btn>

                <!-- 删除按钮（只能删除自己的评论） -->
                <v-divider
                    v-show="currentUsername == c.username && onThisComment == c.commentId"
                    class="mx-2"
                    vertical
                ></v-divider>
                <v-btn
                    x-small
                    class="text-none"
                    color="#e83929"
                    v-show="currentUsername == c.username && onThisComment == c.commentId"
                    @click="deleteComment(c.commentId, index)"
                    rounded
                >
                  <v-icon left>mdi-delete-outline</v-icon>
                  Delete
                </v-btn>
              </p>

              <!-- 评论内容 -->
              <p>{{ c.comment }}</p>

              <!-- 回复条数（点击，查看该回复） -->
              <p v-show="c.repliesCount > 0">
                <v-chip label small color="#abced8" @click="showReplies(c)">
                  {{ c.repliesCount }} more {{ c.repliesCount === 1 ? 'reply ...' : 'replies ...' }}
                </v-chip>
              </p>
            </v-card-text>
          </v-card>

          <!-- 展示评论历史 -->
          <div v-show="historyCommentId === c.commentId">
            <v-btn
                large
                block
                class="text-none"
                color="#80989b"
                @click="historyCommentId = -1"
                style="margin-top: 2%"
            >
              <v-icon left>
                mdi-keyboard-backspace
              </v-icon>
              Viewing Edit History. Click Here to Close.
            </v-btn>
            <v-card
                style="margin-top: 2%"
                v-for="h in commentHistory"
                color="#8b968d"
                :id="'comment-history-' + c.commentId"
            >
              <v-card-text>
                <p>
                  <span style="color: #5a544b">{{ h.creationTime | dateFormat }}</span>
                </p>
                <p>{{ h.comment }}</p>
              </v-card-text>
            </v-card>
          </div>

          <div style="margin-top: 2%" v-show="editOrReplyCommentId == c.commentId">
            <!-- 编辑已有的评论，或回复评论 -->
            <v-textarea
                :label="trueEditFalseReply ? 'Edit Comment' : 'Reply to a Comment'"
                counter
                :rules="commentRule"
                auto-grow
                prepend-inner-icon="mdi-send"
                v-model="editOrReplyCommentValue"
                @click:prepend-inner="sendEditCommentOrReply(c)"
                color="#84a2d4"
                outlined
                rows="1"
                row-height="15"
            ></v-textarea>
            <!-- 发送编辑的评论 -->
            <v-btn
                class="text-none"
                color="#6c848d"
                outlined
                :disabled="!editOrReplyCommentValue || editOrReplyCommentValue.length > 140"
                @click="sendEditCommentOrReply(c)"
            >
              <v-icon left>mdi-send</v-icon>
              {{ trueEditFalseReply ? 'Save' : 'Reply' }}
            </v-btn>
            <v-divider
                class="mx-2"
                vertical
            ></v-divider>
            <!-- 取消发送回复或重新编辑的评论 -->
            <v-btn
                class="text-none"
                color="#ee827c"
                outlined
                @click="openEditCommentOrReply('',-1)"
            >
              <v-icon left>mdi-close-circle-outline</v-icon>
              Cancel
            </v-btn>
          </div>
        </div>
      </v-col>

      <!-- 加载新数据 -->
      <v-col>
        <v-btn
            block
            color="#84a2d4"
            v-show="showMore"
            @click="getComment"
        >
          <v-icon left>
            mdi-refresh
          </v-icon>
          More
        </v-btn>
      </v-col>
    </v-row>

  </div>
</template>

<script>
import ReplyToThisComment from "./ReplyToThisComment";
import OpenCommentAreaButton from "@/component/OpenCommentAreaButton";

export default {
  components: {
    OpenCommentAreaButton,
    ReplyToThisComment: ReplyToThisComment
  },
  name: "Comment",
  data: () => ({
    // 是否 descending 排序
    isDesc: true,
    // 加载的条数：默认为每次加载 10 条
    load: 10,
    // 已经加载的数据的条数，用于对比
    count: 0,
    // 当前用户
    currentUsername: '',
    // 评论的限制
    commentRule: [
      v => v.length <= 140 || '140-character limit',
      // v => !!v || 'Please enter a comment',
    ],
    // 悬浮在该 comment id 的位置
    onThisComment: -1,
    // 网页 id
    webId: -1,
    // 是否打开评论区
    showCommentArea: false,
    // 发送的评论内容
    commentValue: '',
    // 编辑已有的评论内容，或回复评论的内容
    editOrReplyCommentValue: '',
    // 被编辑的评论的 ID
    editOrReplyCommentId: -1,
    // true 表示重新编辑，false 表示回复
    trueEditFalseReply: true,
    // 所有评论
    comments: '',
    // 是否没有新的评论
    noMoreResults: false,
    // 某条评论的回复：被回复的评论的内容
    replyToThisCommentContent: null,
    // 查看回复的模式
    replyMode: false,
    // 回复的数量
    commentCount: 0,
    // 突出该条评论
    prominentCommentId: -1,
    // 正在查看该评论的历史
    historyCommentId: -1,
    // 历史列表
    commentHistory: [],
  }),

  props: {
    // web id that mouse entering
    webId: {
      type: Number,
      required: true
    },
    // current web id
    realWebId: {},
    currentUsername: {
      type: String,
      required: true
    },
  },

  computed: {
    showMore() {
      // 注意，因为每次 load 都会加 10，所以结果的数量 count 一定是 10 的倍数，才有新的数据
      return this.count !== 0 && this.count % 10 === 0
          && this.showCommentArea && !this.noMoreResults
    }
  },

  created() {
    this.countComment();
  },

  methods: {
    // 获取评论总数
    countComment() {
      this.axios.get("/comment/bookmark/" + this.realWebId).then(res => {
        if (res.data.code === 200) {
          this.commentCount = res.data.data;
        }
      }).catch(error => {
        // do nothing...
      });
    },


    // 重置数据
    resetDataAndGetComments(isGoingBack, getAll) {
      this.editOrReplyCommentId = -1;
      this.editOrReplyCommentValue = '';
      this.load = 10;
      this.count = 0;
      this.getComment(isGoingBack, getAll);
    },
    // 查看回复
    showReplies(data, getAllReplies) {
      // 开启回复模式
      this.replyMode = true;
      // 设置被回复的评论的信息
      this.replyToThisCommentContent = data;
      // 重新获取评论（此时为该评论的回复）
      this.resetDataAndGetComments(false, getAllReplies);
    },
    // 从回复中，返回上一级后，重新获取 comments 数据
    goBackFromReplies() {
      let commentId = this.replyToThisCommentContent.replyToCommentId;
      // 更新被回复的评论
      this.getCommentByIdForGoingBack(commentId);
      // 更新展示的数据（参数 true 表示正在回退）
      this.resetDataAndGetComments(true);
    },
    // Get a comment 根据评论 ID，获取评论数据
    getCommentByIdForGoingBack(commentId) {
      this.axios.get("/comment", {
        params: {commentId: commentId, bookmarkId: this.realWebId}
      }).then(res => {
        let code = res.data.code;
        if (code === 200) {
          // 200 表示查找成功
          // 设置被回复的评论的信息
          this.replyToThisCommentContent = res.data.data;
        } else if (code === 500) {
          // 500 表示没有上一条，取消 replyMode
          this.replyMode = false;
          // 重置数据
          this.replyToThisCommentContent = null;
          // 重新载入
          this.resetDataAndGetComments();
        } else {
          alert("Something went wrong.");
          // 重置数据
          this.replyToThisCommentContent = null;
          // 重新载入
          this.resetDataAndGetComments();
        }
      }).catch(error => {
        alert("Something went wrong.");
        // 重置数据
        this.replyToThisCommentContent = null;
        // 重新载入
        this.resetDataAndGetComments();
      });
    },
    /**
     * 打开编辑或回复评论的选项
     *
     * @param newCommentValue 新的评论内容
     * @param editOrReplyCommentId 作用于哪条评论
     * @param trueEditFalseReply true 表示重新编辑，false 表示回复
     */
    openEditCommentOrReply(newCommentValue, editOrReplyCommentId, trueEditFalseReply) {
      if (trueEditFalseReply != null) {
        // 赋值
        this.trueEditFalseReply = trueEditFalseReply;
      }
      if (!this.trueEditFalseReply) {
        // 如果是回复评论，记得清除评论内容
        newCommentValue = '';
      }
      this.editOrReplyCommentValue = newCommentValue;
      this.editOrReplyCommentId = editOrReplyCommentId;
    },
    // 重新编辑评论，或回复评论
    sendEditCommentOrReply(data) {
      if (this.trueEditFalseReply) {
        data.id = data.commentId;
        // 给 data 加上 webId 属性
        data.bookmarkId = this.webId;
        // 替换为新的评论内容
        data.comment = this.editOrReplyCommentValue;
        // 重新编辑评论
        this.sendEditComment(data);
      } else {
        // 获取回复的内容
        let comment = this.editOrReplyCommentValue;
        // 获取 web id
        let webId = this.webId;
        // 获取发送评论的用户名
        let username = this.currentUsername;
        // 获取回复
        let replyToCommentId = data.commentId;
        // 发送回复
        this.sendComment(comment, webId, replyToCommentId);
      }
    },
    // 对重新编辑过的已有评论进行发送
    sendEditComment(data) {
      this.axios.post("/comment", data).then(res => {
        if (res.data.code == 200 || res.data.code == 500) {
          // 200 表示成功，500 表示失败
          alert(res.data.msg);
        } else {
          alert("Something went wrong. Please try again later.");
        }
      }).catch(error => {
        let code = error.response.data.code;
        if (code === 2009 || code === 3012
            || code == 2001 || code == 3010 || code == 3011) {
          // 2009 表示没有权限，3012 表示评论不存在
          // 2001 网页不存在，3010 评论为空，3011 评论太长
          alert(error.response.data.msg);
        } else if (code == 3009) {
          // 3009 表示评论已经存在，也就是编辑内容没有发生改变
          alert("No change has been made");
        } else {
          alert("Something went wrong... Please try again later.");
        }
      }).finally(() => {
        // 重置数据
        this.resetDataAndGetComments();
      });
    },
    // 删除评论
    deleteComment(id, arrayIndex) {
      if (confirm("Are you sure you want to delete this comment?")) {
        this.axios.delete("/comment", {
          params: {
            id: id,
          }
        }).then(res => {
          if (res.data.code == 200) {
            // 200 表示删除成功
            alert(res.data.msg);
            this.comments.splice(arrayIndex, 1);
          } else {
            alert("You can't delete this comment");
          }
        }).catch(error => {
          let code = error.response.data.code;
          if (code === 2009 || code === 3012) {
            // 2009 表示没有权限，3012 表示评论不存在
            alert(error.response.data.msg);
          } else {
            alert("Something went wrong... Please try again later.")
          }
        });
      }
    },
    // 打开评论区
    showCommentsFunc() {
      this.showCommentArea = !this.showCommentArea;
      if (this.showCommentArea) {
        // 如果是打开评论区：
        // 获取评论
        this.getComment();
      } else {
        // 如果是关闭评论区，需要重置数据：
        this.load = 10;
        this.count = 0;
      }

      // 如果没有新的评论，需要提示
      if (this.noMoreResults && this.load !== 10) {
        alert("No More Comments");
      }
    },
    // 改变排序顺序
    changeOrder() {
      this.isDesc = !this.isDesc;
      this.resetDataAndGetComments();
    },
    /**
     * 获取评论列表及回复数量
     *
     * @param isGoingBack 是否正在回退
     * @param getAllComments 是否获取所有的评论
     */
    getComment(isGoingBack, getAllComments) {
      let replyToCommentId = null;
      if (this.replyToThisCommentContent != null) {
        // 获取回复这条评论的回复
        replyToCommentId = this.replyToThisCommentContent.id;
      }

      if (this.replyToThisCommentContent != null && isGoingBack === true) {
        // 如果是在回退，就获取上一条（也就是被回复的评论）
        replyToCommentId = this.replyToThisCommentContent.replyToCommentId;
      }

      let load = this.load;
      if (getAllComments === true) {
        // 获取所有
        load = -1;
      }
      this.axios.get("/comment/bookmark", {
        params: {
          id: this.webId,
          load: load,
          order: this.isDesc ? "desc" : "asc",
          replyToCommentId: replyToCommentId
        }
      }).then(res => {
        // 200 表示获取到了数据
        if (res.data.code == 200) {
          // 获取数据
          this.comments = res.data.data;

          // 获取数据条数
          let count = this.comments.length;

          if (count == 0) {
            // 重置数据
            this.load = 10;
            this.count = 0;
            this.showCommentArea = false;
            this.noMoreResults = true;
          } else if (count === this.count) {
            this.noMoreResults = true;
          } else {
            // 统计加载的数量
            this.count = count;
            // 每次都新增 10
            this.load += 10;
            this.noMoreResults = false;
          }
        } else {
          // 如果状态码不为 200，表示没有新数据（比如 2013）
          // 重置数据
          this.load = 10;
          this.count = 0;
          this.showCommentArea = false;
          this.noMoreResults = false;
        }
      }).catch(error => {
        alert(error.response.data.msg);
        // 重置数据
        this.load = 10;
        this.count = 0;
        this.showCommentArea = false;
        this.noMoreResults = false;
      });
    },
    // 确认发送评论
    confirmSendComment() {
      if (confirm("Send this comment?")) {
        let comment = this.commentValue;
        let webId = this.webId;
        this.sendComment(comment, webId);
      }
    },
    // 发送评论
    sendComment(comment, bookmarkId, replyToCommentId) {
      this.axios.get("/comment/create", {
        params: {
          comment: comment,
          bookmarkId: bookmarkId,
          replyToCommentId: replyToCommentId
        }
      }).then(res => {
        if (res.data.code == 200) {
          // 200 表示成功，500 表示失败
          alert(res.data.msg);
          // 重置编辑区
          this.commentValue = '';
        } else if (res.data.code == 500) {
          alert(res.data.msg);
        } else {
          alert("Something went wrong. Please try again later.");
        }
      }).catch(error => {
        let code = error.response.data.code;
        if (code == 2009 || code == 3009 || code == 2001
            || code == 3010 || code == 3011 || code == 3012) {
          // 2009 表示没有权限，3009 表示评论已经存在，2001 网页不存在
          // 3010 评论为空，3011 评论太长，3012 表示要回复的评论不存在
          alert(error.response.data.msg);
        } else {
          alert("Something went wrong. Please try again later.");
        }
      }).finally(() => {
        if (this.showCommentArea) {
          // 发送过后，如果评论区是打开的，就重置数据
          this.resetDataAndGetComments();
        }
      });
    },

    // 从外部打开评论或回复
    openCommentFromOutside(trueCommentFalseReply, id, data) {
      // 打开评论区
      this.showCommentArea = true;

      if (trueCommentFalseReply) {
        // 普通的评论
        // 获取所有的评论
        this.getComment(false, true);
      } else {
        // 回复
        this.showReplies(data, true);
      }

      // 突出该条评论
      this.prominentCommentId = id;

      // 移动到该位置
      setTimeout(() => {
        let selector = '#comment-' + id;
        document.querySelector(selector).scrollIntoView(true)
      }, 500);
    },

    // get comment history
    getHistory(commentId, commentHistory) {
      this.historyCommentId = commentId;
      this.commentHistory = commentHistory;
    },
  },
}
</script>

