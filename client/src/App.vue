<template>
  <div class="content">
    <Login v-if="!loggedIn.status" @userLoggedIn="userloggedin($event)"/>
    <Navigation v-if="loggedIn.status" @pageChanged="pageChanged($event)" />
    <MyProjects v-if="loggedIn.status && navigation.pageActive == 0"/>
    <ExploreProjects v-if="loggedIn.status && navigation.pageActive == 1"/>
    <Technologies v-if="loggedIn.status && navigation.pageActive == 2"/>
    <User @loggedout="loggedOut($event)" v-if="loggedIn.status && navigation.pageActive == 3"/>
  </div>
</template>

<script>
// imports
import { reactive } from "vue"

// import local used components
import Login from "./components/Login.vue"
import Navigation from "./components/Navigation.vue"
import MyProjects from "./components/MyProjects.vue"
import ExploreProjects from "./components/ExploreProjects.vue"
import Technologies from "./components/Technologies.vue"
import User from "./components/User.vue"

export default {
  name: 'App',
  components: {
    Login,
    Navigation,
    MyProjects, 
    ExploreProjects,
    Technologies,
    User
  },
  setup(props, context) {
    const loggedIn = reactive({status:localStorage.jwt !== undefined})
    const navigation = reactive({pageActive:0})

    const userloggedin = (e) => {
      loggedIn.status = true
      navigation.pageActive = 0
    }
    const loggedOut = (e) => {
      loggedIn.status = e
    }
    const pageChanged = (e) => {
      navigation.pageActive = e
    }
    return { loggedIn, userloggedin, pageChanged, navigation, loggedOut }
  }
}
</script>

<style>
@import url("https://css.gg/css");
* {
  font-family: Arial, Helvetica, sans-serif;
  box-sizing: border-box;
  margin:0;
  padding:0;
  transition: all ease-in-out .2s;
  outline: none;
}
html {
  background:rgb(238, 238, 238);
}
</style>
