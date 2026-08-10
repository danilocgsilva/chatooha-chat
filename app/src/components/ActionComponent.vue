<template>

<div class="flex gap-2">
    <div class="flex-1 flex gap-2">
      <button
        v-if="answered"
        class="flex-1 py-2 rounded-lg transition-colors"
        :class="isDark
          ? 'bg-dark-surface text-dark-subtle border border-dark-border hover:bg-dark-muted'
          : 'bg-light-surface text-gray-700 border border-light-strong hover:bg-light-muted'"
      >Continue chat</button>

      <button
        @click="ask"
        :disabled="loading"
        class="flex-1 py-2 rounded-lg transition-colors disabled:opacity-50"
        :class="isDark
          ? 'bg-dark-muted text-dark-subtle hover:bg-dark-border'
          : 'bg-light-subtle text-gray-800 hover:bg-light-muted'"
      >{{ loading ? 'Answering...' : answered ? 'Ask again' : 'Ask' }}</button>
    </div>

    <button
      @click="cancel"
      :disabled="!loading"
      title="Cancel the current request"
      class="px-3 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      :class="isDark
        ? 'bg-dark-surface text-red-400 border border-red-800 hover:bg-red-950'
        : 'bg-light-surface text-red-600 border border-red-200 hover:bg-red-50'"
    >✕</button>
  </div>
      <div v-if="loading" class="w-full h-1 rounded overflow-hidden" :class="isDark ? 'bg-dark-border' : 'bg-light-muted'">
        <div class="h-full w-1/3 rounded animate-progress" :class="isDark ? 'bg-dark-subtle' : 'bg-light-subtle'"></div>
      </div>
      <p v-if="askDate" class="text-xs" :class="isDark ? 'text-dark-subtle' : 'text-gray-400'">{{ askDate }}</p>
      <div
        v-if="requestError"
        class="flex items-start gap-2 px-3 py-2 rounded-lg border text-sm"
        :class="isDark
          ? 'bg-red-950 text-red-400 border-red-800'
          : 'bg-red-50 text-red-600 border-red-200'"
      >
        <span>⚠</span>
        <span>{{ requestError }}</span>
      </div>

</template>


<script setup lang="ts">

import { useGlobalStore } from '../store';
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue';


const isDark = computed(() => store.isDark);

const store = useGlobalStore();

</script>