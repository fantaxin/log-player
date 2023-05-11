const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '/a', component: () => import('pages/IndexPage.vue') },
      { path: '/file/:url(.*)*', component: () => import('components/FileList.vue') },
      { path: '/player/:url(.*)*', component: () => import('components/PlayerMedia.vue') },
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
