<template>
  <div style="margin: 20px;
    border-radius: 25px;
    border: 2px solid grey;
    padding: 20px;">
    <v-simple-table>
      <template v-slot:default>
        <thead>
        <tr>
          <th class="text-left">
            Role
          </th>
          <th class="text-left">
            Ranking
          </th>
          <th class="text-left">
            Username
          </th>
          <th class="text-left">
            Bookmarks
          </th>
        </tr>
        </thead>
        <tbody>
        <tr
            v-for="item in ranking"
            :key="item.userName"
            :style="item.role === 'admin' ? 'color: #ffbd39'
          : item.role === 'user' ? 'color: #4d606e' : ''"
        >
          <td>{{ item.role }}</td>
          <td> # {{ item.ranking }}</td>
          <td>{{ item.userName }}</td>
          <td>{{ item.bookmarkNumber }}</td>
        </tr>
        </tbody>
      </template>
    </v-simple-table>
  </div>
</template>

<script>
export default {
  name: "AdminUserBookmarkRank",
  methods: {
    getData() {
      this.axios.get("/user/bookmarks-ranking-by-role").then(res => {
        this.ranking = res.data;
      })
    }
  },
  data() {
    return {
      ranking: [],
    }
  },

  created() {
    this.getData();
  }

}
</script>
<style scoped>

</style>