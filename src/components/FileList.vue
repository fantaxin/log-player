<template>
  <q-table
    title="Treats"
    color="primary"
    :rows="rows"
    :columns="columns"
    :hide-bottom="false"
    :loading="loading"
    :rows-per-page-options="[0]"
    virtual-scroll
    class="my-sticky-table"
    no-data-label="I didn't find anything for you"
  >
    <template v-slot:top-left>
      <q-btn color="primary" @click="fileListBack">
        <q-icon name="reply"/>
      </q-btn>
      <!--      <div class="q-table__title">Treats</div>-->
    </template>
    <template v-slot:top-right>
      <q-btn
        color="primary"
        icon-right="archive"
        label="Export to csv"
        no-caps
      />
      <q-btn flat round dense class="q-ml-md">
        <q-icon name="fullscreen"/>
      </q-btn>
    </template>

    <template v-slot:body="props">
      <q-tr :props="props" @dblclick="rowDbClick(props)">
        <q-td key="name" :props="props">
          <q-icon v-if="props.row.type===1" name="description" size="1.5em"/>
          <q-icon v-else name="folder" size="1.5em"/>
          &nbsp;&nbsp;
          {{ props.row.fileName }}
        </q-td>
        <q-td key="date" :props="props">
          {{ props.row.createTime }}
        </q-td>
        <q-td key="type" :props="props">
          {{ typeFormat(props.row.type) }}
        </q-td>
        <q-td key="size" :props="props">
          {{ sizeFormat(props.row.size) }}
        </q-td>
        <q-td key="download" :props="props">
          <q-btn v-if="props.row.type===1" size="sm" round dense @click="downloadFile(props.row.id)">
            <q-icon name="file_download" size="1.5em"/>
          </q-btn>
        </q-td>
      </q-tr>
    </template>

    <template v-slot:bottom>

    </template>
  </q-table>
</template>

<script>

import {useStore} from "vuex";
import {request} from "src/js/util/Request";
import * as Util from "src/js/util/util";
import {useRoute, useRouter} from "vue-router";

export default {
  name: "FileList",
  props: {
    fileList: Array,
  },
  mounted() {
    this.getFileList();
  },
  methods: {
    sizeFormat(val) {
      if (val === undefined || val === null || val === 0) {
        return "-";
      }
      let size = val / 1024;
      let isKb = true;
      if (size > 1024) {
        size = size / 1024;
        isKb = false;
      }
      return size.toFixed(1) + (isKb ? " KB" : " MB");
    },
    typeFormat(val) {
      if (val === 0) {
        return "文件夹";
      } else {
        return "文件";
      }
    },
    downloadFile(id) {
      let a = document.createElement('a');
      a.href = "/api/log-player/downloadFile?id=" + id;
      a.click();
      console.log("downloadfile")
    },
    rowDbClick(props) {
      if (props.row.type === 0) {
        this.router.push(props.row.url);
      } else {
        //TODO: 双击文件播放
      }
    },
    fileListBack() {
      let paths = this.route.params.url;
      let url = "/" + paths.slice(0, paths.length - 1).join('/')
      this.router.push(url);
    },
    getFileList() {
      this.loading = true;
      request.get("/api/log-player/fileListUrl?url=" + "%2F"+this.route.params.url.join('%2F')).then(res => {
        this.rows = res;
      }).finally(reason => {
        this.loading = false;
      })
    }
  },
  data() {
    return {
      store: useStore(),
      router: useRouter(),
      route: useRoute(),
      loading: false,
      columns: [
        {name: 'name', align: 'left', label: '文件名', field: 'fileName', required: true, sortable: true},
        {name: 'date', align: 'center', label: '修改日期', field: 'createTime', sortable: true, style: 'width:20px'},
        {name: 'type', align: 'center', label: '文件类型', field: 'type', format: this.typeFormat, style: 'width:20px'},
        {
          name: 'size',
          align: 'right',
          label: '大小',
          field: 'size',
          format: this.sizeFormat,
          sortable: true,
          style: 'width:10px;padding-right:5px'
        },
        {
          name: 'download',
          align: 'center',
          label: '',
          field: 'type',
          style: 'width:20px;padding-left:15px;padding-right:20px'
        },
      ],
      rows: [],
      dbRowIndex: 0,
    }
  },
  computed: {
    // rootFile(){
    //   return this.store.state.rootFile;
    // },
    rootFile() {
      return this.store.state.rootFile;
    }
  },
  watch: {
    rootFile(newData, oldData) {
      // if(newData===oldData){
      //   return;
      // }
      // if(Util.isNull(newData)){
      //   return;
      // }
      this.rows = newData.children;
      if (this.rows.length === 0) {
        this.loading = true;
        request.get("/api/log-player/fileList?id=" + newData.id).then(res => {
          this.rows = res;
        }).finally(reason => {
          this.loading = false;
        })
      }
    }
  },
}
</script>

<style scoped>
.my-sticky-table.body--dark {
  background-color: #1D1D1D;
}
</style>
<style lang="sass">
.my-sticky-table
  /* height or max-height is important */
  height: 84vh

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th
    /* bg color is important for th; just specify one */
    background-color: #ffffff

  thead tr th
    position: sticky
    z-index: 1

  thead tr:first-child th
    top: 0

  /* this is when the loading indicator appears */

  &.q-table--loading thead tr:last-child th
    /* height of all previous header rows */
    top: 48px
</style>
