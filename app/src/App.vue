<template>
  <router-view v-slot="{ Component }">
    <keep-alive :include="['IndexComponent', 'StatsComponent']">
      <component :is="Component" />
    </keep-alive>
  </router-view>
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
