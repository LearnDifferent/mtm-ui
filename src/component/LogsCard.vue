<template>
  <v-card>
    <v-card-title>
      Logs
    </v-card-title>
    <v-simple-table
        fixed-header
    >
      <template v-slot:default>
        <thead>
        <tr>
          <th class="text-left">
            ID
          </th>
          <th class="text-left">
            Time
          </th>
          <th class="text-left">
            Title
          </th>
          <th class="text-left">
            Method
          </th>
          <th class="text-left">
            Option Type
          </th>
          <th class="text-left">
            Status
          </th>
          <th class="text-left">
            Message
          </th>
        </tr>
        </thead>
        <tbody>
        <tr
            v-for="item in logs"
            :key="item.id"
        >
          <td>{{ item.id }}</td>
          <td>{{ item.optTime | dateFormat }}</td>
          <td>{{ item.title }}</td>
          <td>{{ item.method }}</td>
          <td>{{ item.optType }}</td>
          <td>{{ item.status }}</td>
          <td>{{ item.msg }}</td>
        </tr>
        </tbody>
      </template>
    </v-simple-table>
  </v-card>
</template>
<script>
export default {
  name: 'LogsCard',
  props: {
    logs: {}
  }
}
</script>