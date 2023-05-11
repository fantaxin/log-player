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

          <q-toolbar-title shrink>Log Player</q-toolbar-title>

          <q-breadcrumbs class="text-secondary" active-color="white" separator-color="grey" style="font-size: 16px">
            <q-breadcrumbs-el v-for="crumb in crumbs" :key="crumb.url" :label="crumb.label" :to="crumb.url"/>
          </q-breadcrumbs>

          <q-space/>
          <q-tabs v-model="contentTab" align="right">
            <q-route-tab name="file-tab" label="文件列表"/>
            <q-route-tab name="media-tab" label="播放器"/>
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
          :nodes="fileTree.children"
          ref="treeRef"
          node-key="url"
          no-connectors
          selected-color="primary"
          @lazy-load="onLazyLoad"
          v-model:expanded="expandedKeys"
          @update:selected="selectedChange"
          v-model:selected="selectedKey"
        />
      </q-drawer>

      <q-page-container>
        <q-card>
          <q-tab-panels v-model="contentTab" animated>
            <q-tab-panel name="file-tab">
              <div v-if="contentTab==='file-tab'">
<!--                <FileList/>-->
              </div>
            </q-tab-panel>
            <q-tab-panel name="media-tab">
              <div v-if="contentTab==='media-tab'">
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
    //FileList,
    PlayerMedia
  },
  data() {
    return {
      expandedKeys:[],
      $q: useQuasar(),
      router: useRouter(),
      route: useRoute(),
      isDark: false,
      leftDrawerOpen: true,
      store: useStore(),
      contentTab: 'file-tab',
      selectedKey: "",
      crumbs: [],
      fileTree: {
        id: -1,
        url: "",
        children: [
        ]
      },
    }
  },
  async mounted() {
    if (this.route.params.url === "") {
      await this.router.push("/log")
      await this.urlChanged(['log']);
    } else {
      let allUrl = '/' + this.route.params.url.join('/');
      try {
        await this.urlChanged(this.route.params.url);
      } catch (e) {
        if (e.message === 'PageNotFound') {
          this.router.addRoute({path: allUrl, name: allUrl, component: ErrorNotFound})
          await this.router.push(allUrl);
          this.router.removeRoute(allUrl)
        } else {
          throw e;
        }
      }
    }
    //document.getElementsByClassName("q-tree__node--link")[0].click();
  },
  methods: {
    async urlChanged(url) {
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
          await this.asyncGetChildren(root);
        }
        root = this.findFileTreeChild(root, path);
        //this.handleClickUrl("/log");
        if (Util.isNull(root)) {
          //todo: 报错
          //this.pageNotFound();
        }
        roots.push(root);
        this.expandedKeys.push(root.url);
      }
      this.selectedKey = root.url;
      await this.asyncGetChildren(root);
      //更新面包屑
      this.crumbs = [];
      roots.forEach(root => {
        this.crumbs.push({url: root.url, label: root.label})
      })
      //更新文件列表
      this.store.state.fileRoot = root;
    },

    findFileTreeChild(root, path) {
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
    selectedChange(path) {
      this.store.state.filePath = path;
    },
    handleClickUrl(url) {
      //this.router.push(node.url);
      this.selectedKey = url;
      this.setExpanded(url, true);
    },
    handleClick(node) {
      //this.router.push(node.url);
      this.selectedKey = node.url;
      this.setExpanded(node.url, true);
    },
    toggleLeftDrawer() {
      this.leftDrawerOpen = !this.leftDrawerOpen;
    },
    crumbClick(path) {
      //evt.preventDefault();
      this.store.state.filePath = path;
    },
    myForEach(arr, func) {
      try {
        arr.forEach(item => func(item))
      } catch (e) {
        if (e.message !== "LoopInterrupt") throw e
      }
    },
    updateUrl(func, params) {
      try {
        Reflect.apply(func, this, params)
      } catch (e) {
        if (e.message === 'PageNotFound') {
          this.$router.addRoute({path: newData, component: ErrorNotFound})
          this.$router.push(newData);
        } else {
          throw e;
        }
      }
    },
    pageNotFound() {
      throw new Error('PageNotFound');
    },
    myForEachReturn() {
      throw new Error('LoopInterrupt');
    },
    onLazyLoad({node, key, done, fail}) {
      if (node.children.length !== 0) {
        done(node.children)
        return;
      }
      this.getChildren(node.id, (children) => {
        done(children);
      });
    },
    async asyncGetChildren(root, that) {
      let children = [];
      let res = await request.get("/api/log-player/fileList?id=" + root.id);
      for (const fileInfo of res) {
        if (fileInfo.type === 0) {
          children.push({
            label: fileInfo.fileName,
            icon: 'folder',
            handler: (node) => {
              this.handleClick(node)
            },
            lazy: false,
            id: fileInfo.id,
            type: fileInfo.type,
            url: fileInfo.url,
            children: []
          });
        }
      }
      root.children = children;
      //root.lazy = false;
      //that.setExpanded(root.url, true);
      //node.expand();
      //this.tree_selected = root.url;
      //this.setExpanded(root.url, true);
    },
    getChildren(id, func) {
      let children = [];
      request.get("/api/log-player/fileList?id=" + id).then(res => {
        let num = 0;
        this.myForEach(res, fileInfo => {
          if (fileInfo.type === 0) {
            children.push({
              label: fileInfo.fileName,
              icon: 'folder',
              handler: (node) => {
                this.handleClick(node)
              },
              lazy: false,
              id: fileInfo.id,
              type: fileInfo.type,
              url: fileInfo.url,
              children: []
            });
          }
          num++;
        })
        func(children);
      })
    },
    getTreeNodeByKey(key) {
      return this.$refs.treeRef.getNodeByKey(key);
    },
    setExpanded(key, state) {
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
        this.urlChanged(newData);
      } catch (e) {
        if (e.message === 'PageNotFound') {
          this.$router.addRoute({path: newData, component: ErrorNotFound})
          this.$router.push(newData);
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
