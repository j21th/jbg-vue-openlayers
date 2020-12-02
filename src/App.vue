<template>

  <v-app :class="$vuetify.breakpoint.mdAndUp ? 'jbg-big' : 'jbg-small'">
    <Overlay />

    <v-navigation-drawer
      v-model="drawer"
      :expand-on-hover="$vuetify.breakpoint.mdAndUp"
      :mini-variant="false"
      :right="false"
      :permanent="$vuetify.breakpoint.mdAndUp"
      absolute
      dark
    >
      <v-list
        dense
        nav
        class="py-0"
      >
        <v-list-item two-line>
          <v-list-item-content>
            <v-list-item-title>Jose B. G.</v-list-item-title>
            <v-list-item-subtitle>{{ $t('app_title') }}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-divider></v-divider>

        <v-list-item
          v-for="item in items"
          :key="item.title"
          link
          @click="goto(item)"
        >
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar color="white" absolute right>
      <v-app-bar-nav-icon
          class="hidden-md-and-up"
          @click.stop="drawer = !drawer"
      ></v-app-bar-nav-icon>
      <v-spacer />
      <v-btn
        rounded
        color="primary"
        @click="refresh()">
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
    </v-app-bar>
    <router-view class="router-view" :class="$vuetify.breakpoint.mdAndUp ? 'jbg-big' : 'jbg-small'"/>
  </v-app>    
</template>

<script>

import VueRouter from "vue-router"
import i18n from "./plugins/translate"
import Overlay from "./components/Overlay"

const { isNavigationFailure, NavigationFailureType } = VueRouter
export default {
  components: { Overlay },
  data() {
    return {
      drawer: false,
      items: [
        { title: i18n.t("menu.map"), icon: 'mdi-map-marker', link: "/" },
        { title: i18n.t("menu.hotels"), icon: 'mdi-table', link: "/hotels" },
      ]
    }
  },
  methods: {
    goto(item) {
      this.$router.push(item.link).catch((e) => {
            if (!isNavigationFailure(e, NavigationFailureType.redirected)) {
              Promise.reject(e)
            }
          })
    },
    refresh() {
      this.$store.dispatch("getHotels", true)
      .catch(err => {
        console.error("Hotels getHotels", err)
      })   
    }
  }
}
</script>

<style lang="scss" scope>
  aside {
    position: fixed !important;;
    height: calc(100% - #{$jbg-header-h}) !important;
    top: $jbg-header-h !important;
  }
  .router-view {
    padding: 0px;
    position: relative;
    top: $jbg-header-h !important;
  }
  .jbg-big {
    .router-view {
      left: $jbg-drawer-w !important; 
      width: calc(100% - #{$jbg-drawer-w}) !important;
      height: calc(100% - #{$jbg-header-h}) !important;
    }
  }
  header {
    position: fixed !important;;
    max-height: $jbg-header-h !important;
    .v-toolbar__content {
      max-height: $jbg-header-h !important;
    }
  }
  aside {
    .v-navigation-drawer__content {
      @include jbg-main-bg;
    }
  }
  header .v-toolbar__content {
    @include jbg-main-bg;
    .v-app-bar__nav-icon i {
      color: white !important;
    }
  }
</style>
