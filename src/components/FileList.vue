<template>
  <q-table
    title="Treats"
    :rows="rows"
    :columns="columns"
    :hide-bottom="true"
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
    <template v-slot:body-cell-name="props">
      <q-td :props="props">
        <q-icon name="description" size="1.5em"/>
        &nbsp;&nbsp;
        {{ props.value }}
      </q-td>
    </template>
    <template v-slot:body-cell-download="props">
      <q-td :props="props">
        <div v-if="props.value===1">
          <q-btn size="sm" round dense @click="downloadFile">
            <q-icon name="file_download" size="1.5em"/>
          </q-btn>
        </div>
      </q-td>
    </template>
    <template v-slot:bottom>

    </template>
  </q-table>
</template>

<script>

export default {
  name: "FileList",
  props: {
    fileList: Array,
  },
  methods: {
    sizeFormat(val) {
      let size = val / 1024;
      let isKb = true;
      if (size > 1024) {
        size = size / 1024;
        isKb = false;
      }
      return size.toFixed(1) + (isKb ? " KB" : " MB");
    },
    downloadFile(e) {
      console.log("downloadFile");
    },
    rowDbClick(evt, row, index){

    }
  },
  data() {
    return {
      columns: [
        {name: 'name', align: 'left', required: true, label: '文件名', field: 'name', sortable: true},
        {name: 'date', align: 'center', label: '修改日期', field: 'date', sortable: true, style: 'width:20px'},
        {name: 'type', align: 'center', label: '文件类型', field: 'type', style: 'width:20px'},
        {name: 'size', align: 'right', label: '大小', field: 'size', format: this.sizeFormat, sortable: true, style: 'width:10px;padding-right:5px'},
        {name: 'download', align: 'center', label: '', field: 'download', style: 'width:20px;padding-left:15px;padding-right:20px'},
      ],
      rows: [
        {
          name: '200412041108-ANCT2004_2-vs-SwordFish_Poor_0',
          date: '2004-12-04 11:08',
          type: '文件',
          size: 4406451,
          download: 1
        },
        {
          name: '200412041109-FUK2_0-vs-ikuei_3',
          date: '2004-12-04 11:09',
          type: '文件',
          size: 4606451,
          download: 1
        },
        {
          name: '200412041110-Rhona_2004_0-vs-TokyoTech2004_2',
          date: '2004-12-04 11:10',
          type: '文件',
          size: 4906451,
          download: 1
        },
        {
          name: '200412041123-FU-I_8-vs-FUK2_0',
          date: '2004-12-04 11:23',
          type: '文件',
          size: 4206451,
          download: 1
        },
      ]
    }
  }
}
</script>

<style scoped>

</style>
