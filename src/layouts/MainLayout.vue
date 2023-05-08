<template>
  <div class="q-pa-md">
    <q-layout view="hHh Lpr lff" container style="height: 97vh" class="shadow-2 rounded-borders">
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
            Quasar App
          </q-toolbar-title>

          <q-tabs v-model="tab2" align="left">
            <div v-for="tab in tabs" :key="tab.name" v-bind="tab">
              <q-tab v-if="tab.name==='arrow'" :key="tab.name" v-bind="tab"/>
              <q-tab v-else :key="tab.name" v-bind="tab" />
            </div>
          </q-tabs>
          <q-space/>
          <q-tabs v-model="tab" align="right">
            <q-tab name="file-tab" label="文件列表"/>
            <q-tab name="media-tab" label="播放器"/>
          </q-tabs>
          <div>Quasar v{{ $q.version }}</div>
        </q-toolbar>
      </q-header>

      <q-drawer
        v-model="leftDrawerOpen"
        show-if-above
        bordered
        class="bg-grey-3"
      >
        <q-tree
          :nodes="simple"
          node-key="label"
          no-connectors
          @lazy-load="onLazyLoad"
          v-model:expanded="expanded"
        />
      </q-drawer>

      <q-page-container>
        <q-card>
          <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="file-tab">
              <div class="text-h6">Files</div>
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
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
import {defineComponent, ref} from 'vue'
import EssentialLink from 'components/EssentialLink.vue'
import PlayerMedia from 'components/PlayerMedia.vue'

const linksList = [
  {
    title: 'Docs',
    caption: 'quasar.dev',
    icon: 'school',
    link: 'https://quasar.dev'
  },
  {
    title: 'Github',
    caption: 'github.com/quasarframework',
    icon: 'code',
    link: 'https://github.com/quasarframework'
  },
  {
    title: 'Discord Chat Channel',
    caption: 'chat.quasar.dev',
    icon: 'chat',
    link: 'https://chat.quasar.dev'
  },
  {
    title: 'Forum',
    caption: 'forum.quasar.dev',
    icon: 'record_voice_over',
    link: 'https://forum.quasar.dev'
  },
  {
    title: 'Twitter',
    caption: '@quasarframework',
    icon: 'rss_feed',
    link: 'https://twitter.quasar.dev'
  },
  {
    title: 'Facebook',
    caption: '@QuasarFramework',
    icon: 'public',
    link: 'https://facebook.quasar.dev'
  },
  {
    title: 'Quasar Awesome',
    caption: 'Community Quasar projects',
    icon: 'favorite',
    link: 'https://awesome.quasar.dev'
  }
]

export default defineComponent({
  name: 'MainLayout',

  components: {
    //EssentialLink,
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
    // arrows.forEach(arrow=>{
    //   arrow.parentElement.style.width='24px';
    // })
  },
  methods:{

  },
  setup() {
    const leftDrawerOpen = ref(false);

    const handleClick=function(node){
      // if(node.children===undefined){
      //   Object.assign(node, {children:[]})
      // }
      // let arr = node.children;
      // if(node.label==='logfile'){
      //   if(arr.find(child=>child.label==='okk')===undefined){
      //     arr.push({label:'okk',handler:(node)=>handleClick(node)})
      //   }
      //   console.log(node.children.length);
      // }
      console.log(node.children.length);
    }
    return {
      essentialLinks: linksList,
      leftDrawerOpen,
      tab: ref('file-tab'),
      tab2: ref('file-tab'),
      expanded: ref(['logfile']),
      tabs: [
        {name: 'alarms', label: 'Alarms', 'content-class': 'my_tab'},
        {name: 'arrow', icon: 'navigate_next', 'content-class': 'my_arrow'},
        {name: 'movies', label: 'Movies', 'content-class': 'my_tab'}],
      simple: [
        {
          label: 'logfile',
          lazy:true,
          handler: (node)=>{handleClick(node)},
          // children: [
          //   {
          //     label: 'ChinaOpen',
          //     handler: (node)=>{handleClick(node)},
          //     children: [
          //       {label: '2014',
          //         handler: (node)=>handleClick(node)},
          //       {label: '2018',
          //         handler: (node)=>handleClick(node),}
          //     ]
          //   },
          //   {
          //     label: 'RoboCup',
          //     handler: (node)=>handleClick(node),
          //     children: [
          //       {label: '2013',
          //         handler: (node)=>handleClick(node),},
          //       {label: '2017',
          //         handler: (node)=>handleClick(node),}
          //     ]
          //   },
          // ]
        }
      ],
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value
      },
      onLazyLoad ({ node, key, done, fail }) {
        // call fail() if any error occurs

        setTimeout(() => {
          // simulate loading and setting an empty node
          if (key.indexOf('Lazy load empty') > -1) {
            done([])
            return
          }

          const label = node.label
          done([
            { label: `${label}.1` },
            { label: `${label}.2`, lazy: true },
            {
              label: `${label}.3`,
              children: [
                { label: `${label}.3.1`, lazy: true },
                { label: `${label}.3.2`, lazy: true }
              ]
            }
          ],500)
        })
      }
    }
  }
})
</script>
<style>
.my_arrow{
  pointer-events: none;
}
</style>
