<template>
  <div class="q-pa-md">
    <q-layout view="hHh Lpr lff" container style="height: 96vh" class="shadow-2 rounded-borders">
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

          <q-breadcrumbs class="text-grey" active-color="white" style="font-size: 16px">
            <q-breadcrumbs-el v-for="crumb in crumbs" :key="crumb.id" :label="crumb.label" @click="crumbClick"/>
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
          node-key="id"
          no-connectors
          @lazy-load="onLazyLoad"
          v-model:expanded="expanded"
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
import { useQuasar } from 'quasar'
import EssentialLink from 'components/EssentialLink.vue'
import PlayerMedia from 'components/PlayerMedia.vue'
import FileList from 'components/FileList.vue'

export default defineComponent({
  name: 'MainLayout',
  components: {
    //EssentialLink,
    FileList
  },
  data(){
    return{
      $q: useQuasar(),
      isDark: false,
      leftDrawerOpen: true,
      contentTab: ref('file-tab'),
      expanded: ref(['0']),
      crumbs:[
        {id:'0', label:'logfile'}],
      fileTree: [
        {
          id:'0',
          label: 'logfile',
          handler: (node)=>{this.handleClick(node)},
          children:[
            {
              id: '0.0',
              label: 'ChinaOpen',
              handler: (node)=>{this.handleClick(node)},
            }
          ]
        }
      ],
    }
  },
  mounted(){
    let arrows = document.getElementsByClassName('my_arrow');
    for (let arrow of arrows) {
      arrow.style.width = '24px';
      arrow.parentElement.style.width='24px';
      arrow.parentElement.style.margin='0px';
      arrow.parentElement.style.padding='0px';
      arrow.parentElement.style.pointerEvents='none';
    }
    let tabs = document.getElementsByClassName('my_tab');
    for (let tab of tabs) {
      tab.children[0].style.fontSize='15px';
      tab.style.paddingTop="6.8px";
      tab.parentElement.style.margin='0px';
      tab.parentElement.style.padding='4px';
    }
  },
  methods:{
    changeDark(){
      this.isDark = !this.isDark;
      this.$q.dark.set(this.isDark);
    },
    handleClick(node){
      // let id;
      // let pathArr = node.id.split('\.');
      // pathArr=[];
      // let treeArr = this.fileTree;
      // while(pathArr.length!==0&&treeArr!==undefined&&treeArr.length!==0){
      //   id = pathArr.pop();
      //   treeArr.find(node=>node.id===id)
      // }
      this.updatePath(node.id);
    },
    toggleLeftDrawer() {
      this.leftDrawerOpen = !this.leftDrawerOpen
    },
    crumbClick(evt, go){
      evt.preventDefault();
      console.log(evt)
    },
    updatePath(id){
      let allPaths = this.getAllPaths(id);
      let rootCrumbNum = 0;
      let pathNum = 0;
      for (let i = 0; i < this.crumbs.length; i++) {
        if(pathNum===allPaths.length){
          break;
        }
        if(this.crumbs[i].id===allPaths[pathNum]){
          pathNum++;
          rootCrumbNum=i;
        }else{
          break;
        }
      }
      this.removeCrumbs(rootCrumbNum);
      let treeNode = this.findFileTree(allPaths, allPaths[pathNum-1]);
      for (let i = pathNum; i <allPaths.length; i++) {
        treeNode = this.findFileTreeOnCurrentLevel(treeNode, allPaths[i]);
        this.crumbs.push({id:allPaths[i], label:treeNode.label});
      }
    },
    //移除该位置之后的元素
    removeCrumbs(num){
      while(this.crumbs.length > num+1){
        this.crumbs.pop();
      }
    },
    myForEach(arr, func){
      try {
        arr.forEach(item => func(item))
      } catch (e) {
        if (e.message !== "LoopInterrupt") throw e
      }
    },
    myForEachReturn(){
      throw new Error('LoopInterrupt');
    },
    getAllPaths(id){
      let paths = id.split("\.");
      let prePath = "";
      let allPaths = [];
      paths.forEach(path=>{
        if(prePath===""){
          allPaths.push(path);
        }else{
          allPaths.push(prePath+"."+path);
        }
        prePath = allPaths[allPaths.length-1];
      })
      return allPaths;
    },
    findFileTree(allPaths, id){
      let root = this.fileTree;
      this.myForEach(allPaths, path=>{
        root = this.findFileTreeOnCurrentLevel(root, path);
        if(path===id){
          this.myForEachReturn();
        }
      })
      return root;
    },
    findFileTreeOnCurrentLevel(root, id){
      let children;
      let res;
      if(root===this.fileTree){
        children = toRaw(root);
      }else{
        children = root.children;
      }
      if(children===undefined||children===null){
        return null;
      }
      children.forEach(child=>{
        if(child.id===id){
          res = child;
          return
        }
      })
      return res;
    },
    onLazyLoad ({ node, key, done, fail }) {
      // call fail() if any error occurs
      setTimeout(() => {
        // simulate loading and setting an empty node
        if (key.indexOf('Lazy load empty') > -1||node.id!=='0') {
          done([])
          return
        }
        const label = node.label
        const id = node.id
        done([
          { label: `${label}.0` , id: `${id}.0`, handler: (node)=>{this.handleClick(node)}},
          { label: `${label}.1`, id: `${id}.1`, lazy: true ,handler: (node)=>{this.handleClick(node)}},
          {
            label: `${label}.2`,
            id: `${id}.2`,
            handler: (node)=>{this.handleClick(node)},
            children: [
              { label: `${label}.2.0`, lazy: true, id: `${id}.2.0` ,handler: (node)=>{this.handleClick(node)}},
              { label: `${label}.2.1`, lazy: true, id: `${id}.2.1` ,handler: (node)=>{this.handleClick(node)}}
            ]
          }
        ],500)
      })
    },
  },
  setup() {
    return {

    }
  }
})
</script>
<style>
.my_arrow{
  pointer-events: none;
}
body.body--dark {
  background-color: #1D1D1D;
}
</style>
