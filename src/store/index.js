import {store} from 'quasar/wrappers'
import {createStore} from 'vuex'
import {PlayState} from 'src/js/util/Constants'

// import example from './module-example'

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export default store(function (/* { ssrContext } */) {
  return createStore({
    state() {
      return {
        playState: PlayState.NOTUSED,
        isNight: false,
        isFull: false,
        folderId: 0,
        filePath: '0',
        rootFile: null,
        loadFinish: true,
      }

    },
    mutations: {
      changePlayState(state, playState) {
        state.playState = playState;
      },
      changeLightState(state, isNight) {
        state.isNight = isNight;
      },
      changeScreenState(state, isFull) {
        state.isFull = isFull;
      },
      changeTimeState(state, time) {
        state.time = time;
      },
      changeSpeedState(state, playerSpeed) {
        state.speed = playerSpeed;
      },
    },
    actions: {}
  })
})
