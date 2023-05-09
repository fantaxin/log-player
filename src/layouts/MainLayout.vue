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
            <q-breadcrumbs-el v-for="crumb in crumbs" :key="crumb.path" :label="crumb.label" @click="crumbClick(crumb.path)"/>
          </q-breadcrumbs>

          <q-space/>
          <q-tabs v-model="contentTab" align="right">
            <q-tab name="file-tab" label="文件列表"/>
            <q-tab name="media-tab" label="播放器"/>
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
              <FileList/>
            </q-tab-panel>

            <q-tab-panel name="media-tab">
              <div class="Media">Media</div>
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
            </q-tab-panel>
          </q-tab-panels>

          <q-separator/>

        </q-card>
        <router-view/>
      </q-page-container>
    </q-layout>
  </div>
</template>

<script>
import {defineComponent, ref, toRaw} from 'vue'
import {useQuasar} from 'quasar'
import EssentialLink from 'components/EssentialLink.vue'
import PlayerMedia from 'components/PlayerMedia.vue'
import FileList from 'components/FileList.vue'
import {request} from "src/js/util/Request";
import {useStore} from "vuex";

export default defineComponent({
  name: 'MainLayout',
  components: {
    //EssentialLink,
    FileList
  },
  data() {
    return {
      $q: useQuasar(),
      isDark: false,
      leftDrawerOpen: true,
      store: useStore(),
      contentTab: ref('file-tab'),
      tree_selected: ref(0),
      crumbs: [
        {path: '0', label: 'log'}],
      fileTree: [
        {
          id: 0,
          path: '0',
          label: 'log',
          icon:'folder',
          handler: (node) => {
            this.handleClick(node)
          },
          lazy: true,
          children: []
        }
      ],
    }
  },
  mounted() {
    let arrows = document.getElementsByClassName('my_arrow');
    for (let arrow of arrows) {
      arrow.style.width = '24px';
      arrow.parentElement.style.width = '24px';
      arrow.parentElement.style.margin = '0px';
      arrow.parentElement.style.padding = '0px';
      arrow.parentElement.style.pointerEvents = 'none';
    }
    let tabs = document.getElementsByClassName('my_tab');
    for (let tab of tabs) {
      tab.children[0].style.fontSize = '15px';
      tab.style.paddingTop = "6.8px";
      tab.parentElement.style.margin = '0px';
      tab.parentElement.style.padding = '4px';
    }
  },
  methods: {
    changeDark() {
      this.isDark = !this.isDark;
      this.$q.dark.set(this.isDark);
    },
    selectedChange(path){
      this.updatePath(path);
    },
    handleClick(node) {
      console.log("handleClick")
    },
    toggleLeftDrawer() {
      this.leftDrawerOpen = !this.leftDrawerOpen
    },
    crumbClick(path) {
      //evt.preventDefault();
      this.updatePath(path);
    },
    updatePath(path) {
      this.store.state.filePath=path;
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
      this.store.state.fileId=treeNode.id;
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
    onLazyLoad({node, key, done, fail}) {
      // call fail() if any error occurs
      // if (key.indexOf('Lazy load empty') > -1) {
      //   done([])
      //   return
      // }
      request.get("/api/log-player/fileList?id=" + node.id).then(res => {
        const path = node.path
        let children = [];
        let num = 0;
        this.myForEach(res, fileInfo => {
          if (fileInfo.type === 0) {
            children.push({
              id: fileInfo.id,
              path: `${path}.${num}`,
              label: fileInfo.fileName,
              icon:'folder',
              handler: (node) => {
                this.handleClick(node)
              },
              lazy: true
            });
          }
          num++;
        })
        done(children);
      })
    }
  },
})
</script>
<style>
.my_arrow {
  pointer-events: none;
}

body.body--dark {
  background-color: #1D1D1D;
}
</style>
