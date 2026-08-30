<template>

  <textarea :value="outputText" readonly placeholder="Output will appear here..."
    class="w-full h-96 p-3 rounded-lg border resize-none cursor-default transition-colors focus:outline-none focus:ring-2 [scrollbar-width:thin] [scrollbar-gutter:stable] [resize:none]"
    :class="isDark
      ? ['bg-dark-bg text-dark-subtle border-dark-border placeholder-dark-subtle focus:ring-dark-muted', '[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-thumb]:bg-dark-muted hover:[&::-webkit-scrollbar-thumb]:bg-dark-subtle [&::-webkit-scrollbar-button]:hidden [&::-webkit-scrollbar-corner]:bg-transparent [&::-webkit-resizer]:bg-[radial-gradient(circle_at_100%_100%,theme(colors.dark.bg)_0,theme(colors.dark.bg)_12%,theme(colors.dark.strong)_12%,theme(colors.dark.strong)_24%,theme(colors.dark.border)_24%,theme(colors.dark.border)_40%,transparent_40%,transparent_100%)] [scrollbar-color:theme(colors.dark.muted)_transparent]']
      : ['bg-light-surface text-gray-500 border-light-strong placeholder-light-subtle focus:ring-light-subtle', '[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-thumb]:bg-light-strong hover:[&::-webkit-scrollbar-thumb]:bg-light-subtle [&::-webkit-scrollbar-button]:hidden [&::-webkit-scrollbar-corner]:bg-transparent [scrollbar-color:theme(colors.light.strong)_transparent]']"></textarea>

  <p v-if="answerDate" class="text-xs" :class="isDark ? 'text-dark-subtle' : 'text-gray-400'">{{ answerDate }}</p>

  <div class="flex justify-end">
    <button @click="copyAnswerToClipboard" :disabled="!outputText" title="Copy to clipboard"
      class="px-3 py-1.5 rounded-lg text-sm border transition-colors disabled:opacity-30" :class="isDark
        ? 'bg-dark-surface text-dark-subtle border-dark-border hover:bg-dark-muted'
        : 'bg-light-surface text-gray-700 border-light-strong hover:bg-light-muted'">{{ copied ? '✓ Copied' : '⎘Copy' }}</button>
  </div>

</template>

<script setup lang="ts">

import { ref, computed } from 'vue';
import { useGlobalStore } from '../store';
import { useClipboard } from '../composables/useClipboard';

const { copyToClipboard } = useClipboard();
const store = useGlobalStore();

const props = defineProps<{
  outputText: string,
  isDark: boolean
}>();

const answerDate = computed({
  get: () => store.answerDate,
  set: (answerDate) => store.setAnswerDate(answerDate)
});

const copied = ref(false);

async function copyAnswerToClipboard(): Promise<void> {
  copyToClipboard(props.outputText);
  copied.value = true;
  setTimeout(() => copied.value = false, 2000);
}

</script>