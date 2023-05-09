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
    @row-dblclick="rowDbClick"
  >
    <template v-slot:top-left>
      <q-btn color="primary">
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
        @click="exportTable"
      />
      <q-btn flat round dense class="q-ml-md">
        <q-icon name="fullscreen"/>
      </q-btn>
    </template>
<!--    <template v-slot:top-row>-->
<!--      <q-tr>-->
<!--        <q-td colspan="100%">-->
<!--          <q-btn color="primary">-->
<!--            <q-icon name="reply"/>-->
<!--          </q-btn>-->
<!--        </q-td>-->
<!--      </q-tr>-->
<!--    </template>-->
<!--    <template v-slot:body-cell-name="props">-->
<!--      <q-td :props="props">-->

<!--      </q-td>-->
<!--    </template>-->

    <template v-slot:body="props">
      <q-tr :props="props">
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
          <q-btn v-if="props.row.type===1" size="sm" round dense @click="downloadFile">
            <q-icon name="file_download" size="1.5em"/>
          </q-btn>
        </q-td>
      </q-tr>
    </template>

<!--    <template v-slot:body-cell-download="props">-->
<!--      <q-td :props="props">-->
<!--        <div v-if="props.value===1">-->
<!--          <q-btn size="sm" round dense @click="downloadFile">-->
<!--            <q-icon name="file_download" size="1.5em"/>-->
<!--          </q-btn>-->
<!--        </div>-->
<!--      </q-td>-->
<!--    </template>-->
    <template v-slot:bottom>

    </template>
  </q-table>
</template>

<script>

import {useStore} from "vuex";
import {request} from "src/js/util/Request";
import {ref} from "vue";

export default {
  name: "FileList",
  props: {
    fileList: Array,
  },
  methods: {
    sizeFormat(val) {
      if(val===undefined||val===null||val===0){
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
    typeFormat(val){
      if(val===0){
        return "文件夹";
      }else{
        return "文件";
      }
    },
    downloadFile(e) {
      console.log("downloadFile");
    },
    rowDbClick(evt, row, index){

    }
  },
  data() {
    return {
      store: useStore(),
      loading: false,
      columns: [
        {name: 'name', align: 'left', label: '文件名', field: 'fileName', required: true, sortable: true},
        {name: 'date', align: 'center', label: '修改日期', field: 'createTime', sortable: true, style: 'width:20px'},
        {name: 'type', align: 'center', label: '文件类型', field: 'type', format: this.typeFormat, style: 'width:20px'},
        {name: 'size', align: 'right', label: '大小', field: 'size', format: this.sizeFormat, sortable: true, style: 'width:10px;padding-right:5px'},
        {name: 'download', align: 'center', label: '', field: 'type', style: 'width:20px;padding-left:15px;padding-right:20px'},
      ],
      rows: []
    }
  },
  computed: {
    fileId() {
      return this.store.state.fileId;
    }
  },
  watch: {
    fileId(newData, oldData) {
      this.loading = true;
      if (newData === oldData && this.rows.length !== 0) {
        this.loading = false;
        return;
      }
      request.get("/api/log-player/fileList?id=" + newData).then(res=>{
        this.rows = res;
        this.loading = false;
      })
    }
  }
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
