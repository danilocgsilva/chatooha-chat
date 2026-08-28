<template>
  <div class="flex flex-col gap-2">
    <textarea
      v-model="inputText"
      :readonly="!!modelsError || models.length === 0 || loading || answered"
      placeholder="Type here..."
      class="w-full h-60 min-h-40 p-3 rounded-lg border resize-y focus:outline-none focus:ring-2 transition-colors"
      :class="!!modelsError || models.length === 0 || loading || answered
        ? isDark
          ? 'bg-dark-bg text-dark-subtle border-dark-border cursor-default placeholder-dark-subtle'
          : 'bg-light-surface text-gray-500 border-light-strong cursor-default placeholder-light-subtle'
        : isDark
          ? 'bg-dark-surface text-dark-subtle border-dark-border focus:ring-dark-muted placeholder-dark-subtle'
          : 'bg-light-bg text-gray-800 border-light-strong focus:ring-light-subtle placeholder-light-subtle'"
    ></textarea>

    <div class="flex justify-between items-center mt-1">
      <div 
        class="text-xs px-2 py-1 rounded"
        :class="isDark ? 'bg-dark-surface text-dark-subtle' : 'bg-light-surface text-gray-500'"
      >
        {{ inputText.length }}
      </div>
      <button @click="copyInput" :disabled="!inputText" title="Copy to clipboard"
        class="px-3 py-1.5 rounded-lg text-sm border transition-colors disabled:opacity-30" 
        :class="isDark
          ? 'bg-dark-surface text-dark-subtle border-dark-border hover:bg-dark-muted'
          : 'bg-light-surface text-gray-700 border-light-strong hover:bg-light-muted'"
      >{{ copiedInput ? '✓ Copied' : '⎘Copy' }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useGlobalStore } from '../store';
import { useClipboard } from '../composables/useClipboard';

const { copyToClipboard } = useClipboard();
const store = useGlobalStore();

const isDark = computed(() => store.isDark);
const inputText = computed({
  get: () => store.inputText || '',
  set: (val) => store.setInputText(val)
});
const modelsError = computed(() => store.modelsError);
const models = computed(() => store.models);
const loading = computed(() => store.loading || false);
const answered = computed({
  get: () => store.answered,
  set: (answered: boolean) => store.setAnswered(answered)
});

const copiedInput = ref(false);

async function copyInput(): Promise<void> {
  copyToClipboard(inputText.value);
  copiedInput.value = true;
  setTimeout(() => copiedInput.value = false, 2000);
}
</script>