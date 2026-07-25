<template>
  <div class="p-4 rounded-lg border transition-colors"
    :class="isDark 
      ? 'bg-dark-surface text-dark-subtle border-dark-border' 
      : 'bg-light-surface text-gray-700 border-light-strong'">
    <h3 class="font-bold mb-2">Settings</h3>
    <div class="flex flex-col gap-2">
      <label>API Mode:</label>
      <select v-model="apiMode" class="p-2 rounded-lg border transition-colors"
        :class="isDark 
          ? 'bg-dark-surface text-dark-subtle border-dark-border' 
          : 'bg-light-surface text-gray-700 border-light-strong'">
        <option value="chat">Chat</option>
        <option value="generate">Generate</option>
      </select>
      
      <label>System Prompt:</label>
      <textarea v-model="systemPrompt" rows="3" class="p-2 rounded-lg border transition-colors"
        :class="isDark 
          ? 'bg-dark-surface text-dark-subtle border-dark-border' 
          : 'bg-light-surface text-gray-700 border-light-strong'">
      </textarea>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const isDark = computed(() => store.state.isDark);
const apiMode = computed(() => store.state.apiMode);
const systemPrompt = computed(() => store.state.systemPrompt);
</script>