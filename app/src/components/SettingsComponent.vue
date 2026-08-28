<template>
  <div>
    <div class="overflow-hidden transition-all duration-300 ease-in-out"
      :style="show ? 'max-height: 500px; opacity: 1' : 'max-height: 0; opacity: 0'"
    >
      <div class="rounded-lg border p-3 mb-4"
        :class="isDark ? 'border-dark-border bg-dark-surface' : 'border-light-strong bg-light-surface'"
      >
        <div class="flex flex-col gap-1">
          <span class="text-xs" :class="isDark ? 'text-dark-subtle' : 'text-gray-500'">API Mode</span>
          <div class="flex gap-4">

            <label v-for="option in (['chat', 'generate'] as ApiMode[])" :key="option" class="flex items-center gap-1.5 text-sm cursor-pointer"
              :class="isDark ? 'text-dark-subtle' : 'text-gray-700'"
            >
              <input type="radio" :value="option" :checked="mode === option"
                @change="$emit('update:mode', option)"
              />
              {{ option }}
            </label>

          </div>

          <div class="flex gap-4">
            <div class="w-full">
              <textarea
                :value="systemPrompt"
                :readonly="loading"
                @input="$emit('update:systemPrompt', ($event.target as HTMLTextAreaElement).value)"
                placeholder="Type system prompt here..."
                class="w-full h-24 p-3 rounded-lg border resize-y focus:outline-none focus:ring-2 transition-colors"
                :class="loading
                  ? isDark
                    ? 'bg-dark-bg text-dark-subtle border-dark-border cursor-default placeholder-dark-subtle'
                    : 'bg-light-surface text-gray-500 border-light-strong cursor-default placeholder-light-subtle'
                  : isDark
                    ? 'bg-dark-surface text-dark-subtle border-dark-border focus:ring-dark-muted placeholder-dark-subtle'
                    : 'bg-light-bg text-gray-800 border-light-strong focus:ring-light-subtle placeholder-light-subtle'"
              ></textarea>
            </div>
            <div class="flex flex-col gap-2 w-1/3">
              <div v-for="(pair, index) in store.dynamicOptions" :key="index" class="flex gap-2">
                <input
                  v-model="pair.key"
                  type="text"
                  placeholder="Key"
                  class="flex-1 min-w-[80px] p-2 rounded border text-sm"
                  :class="isDark
                    ? 'bg-dark-surface border-dark-border text-dark-subtle'
                    : 'bg-light-bg border-light-strong text-gray-800'"
                />
                <input
                  v-model="pair.value"
                  type="text"
                  placeholder="Value"
                  class="flex-1 min-w-[80px] p-2 rounded border text-sm"
                  :class="isDark
                    ? 'bg-dark-surface border-dark-border text-dark-subtle'
                    : 'bg-light-bg border-light-strong text-gray-800'"
                />
                <button
                  v-if="index > 0"
                  type="button"
                  @click="removeOption(index)"
                  class="px-2 py-1.5 rounded-lg text-sm border transition-colors"
                  :class="isDark
                    ? 'bg-dark-surface text-dark-subtle border-dark-border hover:bg-dark-muted'
                    : 'bg-light-surface text-gray-700 border-light-strong hover:bg-light-muted'"
                >×</button>
              </div>

              <button
                type="button"
                @click="addOption"
                class="px-3 py-1.5 rounded-lg text-sm border transition-colors"
                :class="isDark
                  ? 'bg-dark-surface text-dark-subtle border-dark-border hover:bg-dark-muted'
                  : 'bg-light-surface text-gray-700 border-light-strong hover:bg-light-muted'"
              >
                Add Option
              </button>
            </div>
          </div>
          
          <div class="flex justify-end">
            <button @click="copySystemPrompt" :disabled="!systemPrompt" title="Copy to clipboard"
              class="px-3 py-1.5 rounded-lg text-sm border transition-colors disabled:opacity-30" :class="isDark
                ? 'bg-dark-surface text-dark-subtle border-dark-border hover:bg-dark-muted'
                : 'bg-light-surface text-gray-700 border-light-strong hover:bg-light-muted'">{{ copiedSystemPrompt ? '✓ Copied' : '⎘Copy' }}</button>
          </div>
        </div>
      </div>
    </div>

    <button
      @click="$emit('toggle')"
      class="w-full py-1.5 rounded-lg text-sm border transition-colors"
      :class="isDark
        ? 'bg-dark-surface text-dark-subtle border-dark-border hover:bg-dark-muted'
        : 'bg-light-surface text-gray-700 border-light-strong hover:bg-light-muted'"
    >{{ show ? '▲ Settings' : '▼ Settings' }}</button>

  </div>
</template>

<script setup lang="ts">

import { ref } from 'vue';
import { ApiMode } from '../domain/OllamaData';
import { useGlobalStore } from '../store';
import { useClipboard } from '../composables/useClipboard';

const { copyToClipboard } = useClipboard();
const store = useGlobalStore();

const props = defineProps<{ 
  isDark: boolean; 
  show: boolean; 
  mode: ApiMode;
  systemPrompt: string;
  loading: boolean
}>();

defineEmits<{
  (e: 'toggle'): void; 
  (e: 'update:mode', value: ApiMode): void; 
  (e: 'update:systemPrompt', value: string): void;
}>();

const copiedSystemPrompt = ref(false);

async function copySystemPrompt(): Promise<void> {
  copyToClipboard(props.systemPrompt);
  copiedSystemPrompt.value = true;
  setTimeout(() => copiedSystemPrompt.value = false, 2000);
}

function addOption(): void {
  store.addDynamicOption({ key: '', value: '' });
}

function removeOption(index: number): void {
  store.removeDynamicOption(index);
}

</script>
