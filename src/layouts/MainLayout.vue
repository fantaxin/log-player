<template>
  <div class="q-pa-md">
    <q-layout view="hHh Lpr lff" container style="height: 95vh" class="shadow-2 rounded-borders">
      <q-header elevated class="bg-black">
        <q-toolbar>
          <q-btn
            flat
            dense
            round
            icon="menu"
            aria-label="Menu"
            @click="toggleLeftDrawer"
          />

          <q-toolbar-title shrink>
            Log Player
          </q-toolbar-title>

          <q-breadcrumbs class="text-secondary" active-color="white" separator-color="grey" style="font-size: 16px">
            <q-breadcrumbs-el v-for="crumb in crumbs" :key="crumb.treePath" :label="crumb.label"
                              :to="'/file/'+url"/>
          </q-breadcrumbs>

          <q-space/>
          <q-tabs v-model="contentTab" align="right">
            <q-route-tab name="file-tab" label="文件列表" :to="'/file/'+url"/>
            <q-route-tab name="media-tab" label="播放器" :to="'/player/'+url"/>
          </q-tabs>
          <q-btn @click="changeDark">
            <q-icon v-if="isDark" name="light_mode"/>
            <q-icon v-else name="dark_mode"/>
          </q-btn>
          <!--          <div>Quasar v{{ $q.version }}</div>-->
        </q-toolbar>
      </q-header>

      <q-drawer
        v-model="leftDrawerOpen"
        show-if-above
        bordered
      >
        <q-tree
          :nodes="fileTree"
          ref="treeRef"
          node-key="path"
          no-connectors
          selected-color="primary"
          @lazy-load="onLazyLoad"
          @update:selected="selectedChange"
          v-model:selected="store.state.filePath"
        />
      </q-drawer>

      <q-page-container>
        <q-card>
          <q-tab-panels v-model="contentTab" animated>
            <q-tab-panel name="file-tab">
              <div v-if="contentTab==='file-tab'" >
                <FileList/>
              </div>
            </q-tab-panel>
            <q-tab-panel name="media-tab">
              <div v-if="contentTab==='media-tab'" >
                <PlayerMedia/>
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
<!--        <router-view/>-->
      </q-page-container>
    </q-layout>
  </div>
</template>

<script>
import {defineComponent, ref, toRaw} from 'vue'
import {useQuasar} from 'quasar'
import PlayerMedia from 'components/PlayerMedia.vue'
import FileList from 'components/FileList.vue'
import {request} from "src/js/util/Request";
import {useStore} from "vuex";
import * as Util from "src/js/util/util";

export default defineComponent({
  name: 'MainLayout',
  components: {
    FileList,
    PlayerMedia
  },
  data() {
    return {
      $q: useQuasar(),
      isDark: false,
      leftDrawerOpen: true,
      store: useStore(),
      contentTab: 'file-tab',
      tree_selected: ref(0),
      crumbs: [
        {path: '0', label: 'log'}],
      fileTree: [
        {
          path: '0',
          label: 'log',
          icon: 'folder',
          handler: (node) => {
            this.handleClick(node)
          },
          lazy: true,
          id: 0,
          type: 0,
          url:'/log',
          children: []
        }
      ],
    }
  },
  mounted() {
    this.fileTree = [];

    this.setFileList(0, '0', (children) => {
      this.getTreeNodeByKey('0').children = children;
      this.setExpanded('0', true);
    })
  },
  methods: {
    updateFileTree(url){
      let paths = url.split('\\');
      let root = this.fileTree;
      paths.forEach(path=>{
        root = this.findFileTreeChild(root, path);
        if(Util.isNull(root)){

        }
      })
    },
    findFileTreeChild(root, path) {
      let children;
      let res;
      if (root === this.fileTree) {
        children = toRaw(root);
      } else {
        children = root.children;
      }
      if (Util.isEmpty(children)) {
        return null;
      }
      children.forEach(child => {
        if (child.label === path) {
          res = child;
        }
      })
      return res;
    },





    findFileTreeOnCurrentLevel(root, path) {
      let children;
      let res;
      if (root === this.fileTree) {
        children = toRaw(root);
      } else {
        children = root.children;
      }
      if (children === undefined || children === null) {
        return null;
      }
      children.forEach(child => {
        if (child.path === path) {
          res = child;
        }
      })
      return res;
    },




    changeDark() {
      this.isDark = !this.isDark;
      this.$q.dark.set(this.isDark);
    },
    selectedChange(path){
      this.store.state.filePath=path;
    },
    handleClick(node) {
      console.log("handleClick")
    },
    toggleLeftDrawer() {
      this.leftDrawerOpen = !this.leftDrawerOpen
    },
    crumbClick(path) {
      //evt.preventDefault();
      this.store.state.filePath=path;
    },
    updatePath(path) {
      let allPaths = this.getAllPaths(path);
      let rootCrumbNum = 0;
      let pathNum = 0;
      for (let i = 0; i < this.crumbs.length; i++) {
        if (pathNum === allPaths.length) {
          break;
        }
        if (this.crumbs[i].path === allPaths[pathNum]) {
          pathNum++;
          rootCrumbNum = i;
        } else {
          break;
        }
      }
      this.removeCrumbs(rootCrumbNum);
      let treeNode = this.findFileTree(allPaths, allPaths[pathNum - 1]);
      for (let i = pathNum; i < allPaths.length; i++) {
        treeNode = this.findFileTreeOnCurrentLevel(treeNode, allPaths[i]);
        this.crumbs.push({path: allPaths[i], label: treeNode.label});
      }
      this.store.state.folderId = treeNode.id;
    },
    //移除该位置之后的元素
    removeCrumbs(num) {
      while (this.crumbs.length > num + 1) {
        this.crumbs.pop();
      }
    },
    myForEach(arr, func) {
      try {
        arr.forEach(item => func(item))
      } catch (e) {
        if (e.message !== "LoopInterrupt") throw e
      }
    },
    myForEachReturn() {
      throw new Error('LoopInterrupt');
    },
    getAllPaths(id) {
      let paths = id.split("\.");
      let prePath = "";
      let allPaths = [];
      paths.forEach(path => {
        if (prePath === "") {
          allPaths.push(path);
        } else {
          allPaths.push(prePath + "." + path);
        }
        prePath = allPaths[allPaths.length - 1];
      })
      return allPaths;
    },
    findFileTree(fullPaths, path) {
      let root = this.fileTree;
      this.myForEach(fullPaths, fullPath => {
        root = this.findFileTreeOnCurrentLevel(root, fullPath);
        if (fullPath === path) {
          this.myForEachReturn();
        }
      })
      return root;
    },

    onLazyLoad({node, key, done, fail}) {
      if (node.children.length !== 0) {
        done(node.children)
        return;
      }
      this.setFileList(node.id, node.path, (children) => {
        done(children);
      });
    },
    setFileList(id, path, func){
      let children = [];
      request.get("/api/log-player/fileList?id=" + id).then(res => {
        let num = 0;
        this.myForEach(res, fileInfo => {
          if (fileInfo.type === 0) {
            children.push({
              id: fileInfo.id,
              path: `${path}.${num}`,
              label: fileInfo.fileName,
              icon: 'folder',
              handler: (node) => {
                this.handleClick(node)
              },
              lazy: true
            });
          }
          num++;
        })
        func(children);
      })
    },
    getTreeNodeByKey(path){
      return this.$refs.treeRef.getNodeByKey(path);
    },
    setExpanded(path, state){
      this.$refs.treeRef.setExpanded(path, state);
    }
  },
  computed: {
    // filePath() {
    //   return this.store.state.filePath;
    // },
    url(){
      return this.$route.params.url;
    }
  },
  watch: {
    url(newData, oldData) {
      if (newData === oldData) {
        return;
      }
      let node = this.getTreeNodeByKey(newData);
      this.setFileList(node.id, node.path, (children) => {
        node.children = children;
      });
      this.setExpanded(newData, true);
      this.updatePath(newData);
    },
    // filePath(newData, oldData) {
    //   if (newData === oldData) {
    //     return;
    //   }
    //   let node = this.getTreeNodeByKey(newData);
    //   this.setFileList(node.id, node.path, (children) => {
    //     node.children = children;
    //   });
    //   this.setExpanded(newData, true);
    //   this.updatePath(newData);
    // }
  }
})
</script>
<style>
body.body--dark {
  background-color: #1D1D1D;
}
</style>
