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
            @click="toggleTree"
          />

          <q-toolbar-title shrink>Log Player</q-toolbar-title>

          <q-breadcrumbs class="text-secondary" active-color="white" separator-color="grey" style="font-size: 16px">
            <q-breadcrumbs-el v-for="crumb in crumbs" :key="crumb.url" :label="crumb.label" :to="crumb.url"/>
          </q-breadcrumbs>

          <q-space/>
          <q-tabs v-model="store.state.contentTab" align="right">
            <q-tab name="file-tab" label="文件列表"/>
            <q-tab name="media-tab" label="播放器"/>
          </q-tabs>
          <q-btn @click="changeDark">
            <q-icon v-if="isDark" name="light_mode"/>
            <q-icon v-else name="dark_mode"/>
          </q-btn>
        </q-toolbar>
      </q-header>

      <q-drawer
        v-model="leftDrawerOpen"
        show-if-above
        bordered
      >
        <q-tree
          :nodes="fileTree.children"
          ref="treeRef"
          node-key="url"
          no-connectors
          selected-color="primary"
          @lazy-load="treeLazyLoad"
          v-model:expanded="expandedKeys"
          @update:selected="treeSelectedChange"
          v-model:selected="selectedKey"
        />
      </q-drawer>

      <q-page-container>
        <q-card>
          <q-tab-panels v-model="store.state.contentTab" animated>
            <q-tab-panel name="file-tab">
                <FileList/>
            </q-tab-panel>
            <q-tab-panel name="media-tab">
                <PlayerMedia/>
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
import {useRouter, useRoute} from 'vue-router'
import PlayerMedia from 'components/PlayerMedia.vue'
import FileList from 'components/FileList.vue'
import ErrorNotFound from 'pages/ErrorNotFound.vue'
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
      router: useRouter(),
      route: useRoute(),
      store: useStore(),
      isDark: false,
      leftDrawerOpen: true,
      firstClick: true,
      //contentTab: 'file-tab',
      selectedKey: "",
      expandedKeys:[],
      expandedKeysSet:new Set(),
      crumbs: [],
      fileTree: {id: -1, url: "", children: []},
    }
  },
  async mounted() {
    if (this.route.params.url === "") {
      await this.loadOnFirst(['log']);
      await this.router.push("/log")
    } else {
      let allUrl = '/' + this.route.params.url.join('/');
      try {
        await this.loadOnFirst(this.route.params.url);
      } catch (e) {
        if (e.message === 'PageNotFound') {
          this.pageNotFound(allUrl);
          // this.router.addRoute({path: allUrl, name: allUrl, component: ErrorNotFound})
          // await this.router.push(allUrl);
          // this.router.removeRoute(allUrl)
        } else {
          throw e;
        }
      }
    }
  },
  methods: {
    async loadOnFirst(url) {
      let paths = url;
      let name = paths[paths.length - 1];
      if (name.split('\.').length === 2) {
        //todo:是文件的时候怎么办
      }
      let roots = [];
      let root = toRaw(this.fileTree);
      //更新并获取文件树的路径
      for (const path of paths) {
        if (Util.isEmpty(path)) {
          continue;
        }
        if (root.children.length === 0) {
          await this.getTreeChildrenOnLoad(root, path);
        }
        root = this.findTreeChild(root, path);
        if (Util.isNull(root)) {
          this.throwPageNotFound();
        }
        roots.push(root);
      }
      await this.getTreeChildrenOnLoad(root, "");
      //更新面包屑
      this.crumbsUpdate(paths);
      //this.selectedKey = root.url;
      //更新文件列表
      //this.store.state.folderId = root.id;
      this.store.state.rootFile = root;
    },
    crumbsUpdate(paths){
      this.crumbs = [];
      //this.expandedKeys = [];
      let allPath = "";
      let popNum = this.expandedKeys.length+paths.length-5;
      while(popNum>0){
        this.expandedKeysSet.delete(this.expandedKeys.pop());
        popNum--;
      }
      paths.forEach(path => {
        allPath += "/" + path;
        this.crumbs.push({url: allPath, label: path})
        if(!this.expandedKeysSet.has(allPath)){
          this.expandedKeysSet.add(allPath);
          this.expandedKeys.push(allPath);
        }
      })
      this.selectedKey = allPath;
      this.store.state.rootFile = this.getTreeNodeByKey(allPath);
    },
    findTreeChild(root, path) {
      let children;
      let res;
      children = root.children;
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
    changeDark() {
      this.isDark = !this.isDark;
      this.$q.dark.set(this.isDark);
    },
    treeSelectedChange(path) {
      //this.store.state.filePath = path;
    },
    treeNodeClick(node) {
      // 第一次点击时，将所有在加载阶段加载的node都设置为懒加载
      if(this.firstClick){
        let queue = [];
        queue.push(this.fileTree);
        while(queue.length!==0){
          let node = queue.pop();
          node.lazy = true;
          node.children.forEach(child=>{
            queue.push(child);
          })
        }
        this.firstClick = false;
      }
      //更新url
      this.router.push(node.url);
      //将该node设置为选中并打开
      //this.selectAndExpandedTreeNode(node);
      this.setTreeExpanded(node.url, true);
      //更新文件列表
      // let root = {children: node.children};
      //this.store.state.folderId = node.id;
    },
    selectAndExpandedTreeNode(node){
      this.selectedKey = node.url;
      this.setTreeExpanded(node.url, true);
    },
    toggleTree() {
      this.leftDrawerOpen = !this.leftDrawerOpen;
    },
    throwPageNotFound() {
      throw new Error('PageNotFound');
    },
    pageNotFound(url){
      this.router.addRoute({path: url, name:url, component: ErrorNotFound})
      this.router.push(url);
      this.router.removeRoute(url);
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
    treeLazyLoad({node, done}) {
      if (node.children.length !== 0) {
        done(node.children)
        return;
      }
      this.getTreeChildren(node.id, (children) => {
        done(children);
      });
    },
    getTreeChildren(id, func) {
      let children = [];
      request.get("/api/log-player/fileList?id=" + id).then(res => {
        let num = 0;
        this.myForEach(res, fileInfo => {
          if (fileInfo.type === 0) {
            children.push({
              label: fileInfo.fileName,
              icon: 'folder',
              handler: (node) => {
                this.treeNodeClick(node)
              },
              lazy: true,
              id: fileInfo.id,
              type: fileInfo.type,
              url: fileInfo.url,
              fileName: fileInfo.fileName,
              children: []
            });
          }
          num++;
        })
        func(children);
      })
    },
    async getTreeChildrenOnLoad(root, path) {
      let children = [];
      let res = await request.get("/api/log-player/fileList?id=" + root.id);
      for (const fileInfo of res) {
        let lazy = true;
        if(fileInfo.fileName === path){
          lazy = false;
        }
        if (fileInfo.type === 0) {
          children.push({
            label: fileInfo.fileName,
            icon: 'folder',
            handler: (node) => {
              this.treeNodeClick(node)
            },
            lazy: lazy,
            id: fileInfo.id,
            type: fileInfo.type,
            url: fileInfo.url,
            fileName: fileInfo.fileName,
            children: []
          });
        }
      }
      root.children = children;
    },
    getTreeNodeByKey(key) {
      return this.$refs.treeRef.getNodeByKey(key);
    },
    setTreeExpanded(key, state) {
      this.$refs.treeRef.setExpanded(key, state);
    }
  },
  computed: {
    url() {
      return this.route.params.url;
    }
  },
  watch: {
    url(newData, oldData) {
      if (newData === oldData) {
        return;
      }
      try {
        this.crumbsUpdate(newData);
        this.setTreeExpanded("/"+newData.join('/'), true);
        //this.urlChanged(newData);
      } catch (e) {
        if (e.message === 'PageNotFound') {
          this.pageNotFound(newData);
        } else {
          throw e;
        }
      }
    },
  }
})
</script>
<style>
body.body--dark {
  background-color: #1D1D1D;
}
</style>
