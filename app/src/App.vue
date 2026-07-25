<template>
  <keep-alive :include="['IndexComponent', 'StatsComponent']">
    <router-view />
  </keep-alive>
</template>

<script lang="ts">
import { Vue } from 'vue-class-component';

export default class App extends Vue {}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

</style>
