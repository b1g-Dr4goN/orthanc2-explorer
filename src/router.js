import { createRouter, createWebHashHistory } from 'vue-router'
import Settings from './components/Settings.vue'
import SettingsLabels from './components/SettingsLabels.vue'
import SettingsPermissions from './components/SettingsPermissions.vue'
import StudyList from './components/StudyList.vue'
import MySideBar from './components/MyOrthanc/MySideBar.vue'
import MyEventList from './components/MyOrthanc/MyEventList.vue'
// import SideBar from './components/SideBar.vue'
import NotFound from './components/NotFound.vue'
import { baseOe2Url } from "./globalConfigurations"

console.log('Base URL for router: ', baseOe2Url);

function removeKeyCloakStates(to, from, next) {
  if (to.path.includes("&state=")) {
    // the router does not recognize the &state=... after a redirect from KeyCloak -> simply block it (it works but I don't really understand why !)
    console.log("removeKeyCloakStates", to, from);
    next(false);
  } else {
    next();
  }
}

export const router = createRouter({
  history: createWebHashHistory(baseOe2Url),
  routes: [
    {
      path: '/',
      alias: '/index.html',
      components: {
        SideBarView: MySideBar,
        ContentView: StudyList,
      },
      name: 'home'
    },
    {
      path: '/filtered-studies',
      components: {
        SideBarView: MySideBar,
        ContentView: StudyList,
      },
      name: 'local-studies-list'
    },
    {
      path: '/my-event-queue',
      components: {
        SideBarView: MySideBar,
        ContentView: MyEventList,
      },
    },
    {
      path: '/settings',
      components: {
        SideBarView: MySideBar,
        ContentView: Settings,
      },
      name: 'settings'
    },
    {
      path: '/settings-labels',
      components: {
        SideBarView: MySideBar,
        ContentView: SettingsLabels,
      },
      name: 'settings-labels'
    },
    {
      path: '/settings-permissions',
      components: {
        SideBarView: MySideBar,
        ContentView: SettingsPermissions,
      },
      name: 'settings-permissions'
    },
    {
      path: '/:pathMatch(.*)',
      beforeEnter: removeKeyCloakStates,
      components: {
        SideBarView: MySideBar,
        ContentView: NotFound,
      },
      name: 'keycloak-path-match'
    }

  ],
})
