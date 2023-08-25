<template>
  <div>
    <v-card color="#93deff">
      <v-card-title class="text-h5">
        Export Bookmarks
      </v-card-title>
      <v-card-subtitle>Press the EXPORT button to export your Bookmarks to HTML file and DOWNLOAD it.
      </v-card-subtitle>
      <v-card-actions>
        <v-btn color="#b6d7de" @click="exportHtmlFile">
          <v-icon left>
            mdi-export
          </v-icon>
          <span style="color: #323643">EXPORT</span>
        </v-btn>
      </v-card-actions>
    </v-card>

    <v-card color="#b6d7de" style="margin-top: 2%">
      <v-card-title class="text-h5">
        Import Bookmarks
      </v-card-title>
      <v-card-subtitle>
        To import Bookmarks from HTML file:
        <p></p>
        <p>1. Upload HTML file:</p>
        <v-file-input
            accept="text/html"
            label="Please Upload HTML file"
            v-model="chosenFile"
        >
        </v-file-input>
        <p>2. Press the IMPORT button:</p>
        <v-btn color="#93deff" @click="importHtmlFile" :disabled="importingFile">
          <v-icon left>
            mdi-import
          </v-icon>
          <span style="color: #323643">IMPORT</span>
        </v-btn>
        <span v-html="importingMsg" style="margin-left: 2%"></span>
      </v-card-subtitle>
    </v-card>
  </div>
</template>
<script>
export default {
  name: 'ExportAndImport',

  data: () => ({
    // 是否正在处理上传的文件
    importingFile: false,
    // 上传文件时显示的内容
    importingMsg: '',
    // 需要上传的 HTML 文件
    chosenFile: null,
  }),

  props: {
    currentUsername: {},
  },

  methods: {

    // 导入数据
    importHtmlFile() {
      if (!this.chosenFile) {
        alert("Please Upload HTML File.");
      } else {
        this.importingFile = true;
        this.importingMsg = "<span style='color: #004a7c; font-size: 18px'>Importing... Please wait a minute.</span>"

        let data = new FormData();
        data.append("htmlFile", this.chosenFile);
        this.axios.post('/file', data, {
          headers: {'Content-Type': 'multipart/form-data'}
        }).then(res => {
          // 注意，这里的提示信息是存在 res.data.data 里面的，而不是 res.data.msg
          let msg = res.data.data;
          if (200 === res.data.code) {
            this.importingMsg = "<span style='color: #fff5a5; font-size: 18px'>" + msg + "</span>";
            // 刷新载入数据
            this.$emit("openMyBookmarks");
          } else {
            this.importingMsg = msg;
          }
        }).catch((error) => {
          let code = error.response.data.code;
          let msg = error.response.data.msg;

          if (code === 3018) {
            this.importingMsg = "<span style='color: red; font-size: 15px'>" + msg + "</span>";
          } else {
            this.importingMsg = "<span style='color: red; font-size: 15px'>" + "Something went wrong" + "</span>";
          }
        }).finally(() => {
          this.importingFile = false;
        });
      }
    },
    // 导出数据
    exportHtmlFile() {
      this.axios.get('/file', {
        params: {
          username: this.toUserName
        },
        responseType: 'blob'
      }).then(res => {
        // data 后面可以包装为一个包含二进制数据的 Blob 对象（因为设置了 responseType: 'blob'）
        // headers 是 response 的请求头
        // 分开写为 let data = res.data; 和 let headers = res.headers; 也可以
        let {data, headers} = res;

        // 通过 new 一个 Blob 对象来获取 blob
        // 直接 new Blob([data]) 也可以
        let blob = new Blob([data], {type: headers['content-type']});

        // 获取 headers 中包含 filename 的信息，并提取出 filename
        let searchString = "attachment; filename=";
        // 删除第一次出现的 searchString
        let regex = new RegExp(searchString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        // 最后，获取输出的文件名
        let fileName = headers['content-disposition'].replace(regex, '');
        fileName = decodeURIComponent(fileName)

        // 在 dom 中创建一个 a 标签并下载，下载后删除该元素
        let url = window.URL.createObjectURL(blob);
        let aElement = document.createElement('a');
        aElement.style.display = 'none';
        aElement.href = url;
        // 设置下载的属性和值，其值为下载后的文件名
        aElement.setAttribute('download', fileName);
        document.body.appendChild(aElement);
        aElement.click();
        window.URL.revokeObjectURL(aElement.href);
        document.body.removeChild(aElement);
      }).catch(error => {
        alert(error.response.data.msg);
      });
    },
  },
}
</script>