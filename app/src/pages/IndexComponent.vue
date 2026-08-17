<template>
  <div
    class="min-h-screen transition-colors"
    :class="isDark ? 'bg-dark-bg' : 'bg-light-bg'"
  >
  <div class="flex flex-col gap-4 p-12 max-w-5xl mx-auto w-full">
    <div class="flex justify-end">
      <button
        @click="toggleTheme"
        class="w-24 shrink-0 py-1.5 rounded-lg text-sm border transition-colors"
        :class="isDark
          ? 'bg-dark-surface text-dark-subtle border-dark-border hover:bg-dark-muted'
          : 'bg-light-surface text-gray-700 border-light-strong hover:bg-light-muted'"
      >{{ isDark ? '☀ Light' : '☾ Dark' }}</button>
      </div>
      <MenuComponent :isDark="isDark"></MenuComponent>
      <h1 class="text-3xl font-bold text-center" :class="isDark ? 'text-dark-subtle' : 'text-gray-800'">
        Chatooha Chat
      </h1>
      <p class="text-left" :class="isDark ? 'text-dark-subtle' : 'text-gray-500'">
        Put a question and ask. It will access the local Ollama server to answer.
      </p>
      <p class="text-left" :class="isDark ? 'text-dark-subtle' : 'text-gray-500'">
        Or connect to the Alooha Proxy, that behaves exactly the same as Ollama and also stores data about server performance and questions history.
      </p>

      <HistoryWidget />


      <div class="flex items-end gap-2">
        <label class="flex-1 min-w-0 flex flex-col gap-1">
          <span class="text-xs" :class="isDark ? 'text-dark-subtle' : 'text-gray-500'">Server DNS</span>
          <input
            v-model="serverDns"
            class="px-3 py-1.5 rounded-lg text-sm border transition-colors focus:outline-none"
            :class="isDark
              ? 'bg-dark-surface text-dark-subtle border-dark-border'
              : 'bg-light-surface text-gray-700 border-light-strong'"
          />
        </label>
        <div class="flex-1 min-w-0 flex flex-col gap-1">
          <span class="text-xs" :class="isDark ? 'text-dark-subtle' : 'text-gray-500'">Model</span>
          <select
            v-model="selectedModel"
            class="px-3 py-1.5 pr-8 rounded-lg text-sm border transition-colors focus:outline-none appearance-none bg-no-repeat bg-[right_0.5rem_center] bg-[length:1rem]"
            :class="isDark
              ? 'bg-dark-surface text-dark-subtle border-dark-border'
              : 'bg-light-surface text-gray-700 border-light-strong'"
            :style="{ backgroundImage: arrowSvg }"
          >
            <option value="" disabled>{{ modelsError ? 'Unavailable' : models.length === 0 ? 'Loading...' : '' }}</option>
            <option v-for="model in models" :key="model" :value="model">{{ model }}</option>
          </select>
        </div>
      </div>
      <div
        v-if="modelsError"
        class="flex items-start gap-2 px-3 py-2 rounded-lg border text-sm"
        :class="isDark
          ? 'bg-red-950 text-red-400 border-red-800'
          : 'bg-red-50 text-red-600 border-red-200'"
      >
        <span>⚠</span>
        <span>{{ modelsError }}</span>
      </div>
      <QuestionEntry />
      <SettingsComponent 
        :isDark="isDark" 
        :show="showSettings" 
        :mode="apiMode" 
        :systemPrompt="systemPrompt"
        :loading="loading || answered"
        @toggle="toggleSettings" 
        @update:mode="apiMode = $event" 
        @update:systemPrompt="systemPrompt = $event" />
      <ActionComponent />
      <AnswerAreaComponent :isDark="isDark" :outputText="outputText" />
    </div>
  </div>
</template>

<script setup lang="ts">

import { computed, onMounted, watch } from 'vue';
import OllamaData from '../domain/OllamaData';
import OllamaClient from '../domain/OllamaClient';
import SettingsComponent from './../components/SettingsComponent.vue';
import { ApiMode } from '../domain/OllamaData';
import AnswerAreaComponent from './../components/AnswerAreaComponent.vue';
import MenuComponent from './../components/MenuComponent.vue';
import { useGlobalStore } from '../store';
import QuestionEntry from './../components/QuestionEntry.vue';
import ActionComponent from './../components/ActionComponent.vue';
import HistoryWidget from './../components/HistoryWidget.vue';

const store = useGlobalStore();
store.init();

const arrowSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='none' stroke='%23888' stroke-width='2' d='M4 6l4 4 4-4'/%3E%3C/svg%3E")`;

const outputText = computed({
  get: () => store.outputText || '',
  set: (val) => store.setOutputText(val)
});

const isDark = computed(() => store.isDark);

const loading = computed({
  get: () => store.loading || false,
  set: (val) => store.setLoading(val)
});

const serverDns = computed({
  get: () => store.serverDns,
  set: (val: string) => store.updateServerDns(val),
});
const selectedModel = computed({
  get: () => store.selectedModel,
  set: (val: string) => store.setSelectedModel(val),
});

const models = computed(
  () => store.models
);

const modelsError = computed(
  () => store.modelsError
);

const apiMode = computed({
  get: () => store.apiMode,
  set: (val: ApiMode) => store.updateApiMode(val),
});

const documentTitleDynamic = store.getDocumentTitleDynamic;

const showSettings = computed(() => store.showSettings);

const systemPrompt = computed({
  get: () => store.systemPrompt,
  set: (val: string) => store.updateSystemPrompt(val),
});
const answered = computed({
  get: () => store.answered,
  set: (answered: boolean) => store.setAnswered(answered)
});

const ollama = store.ollamaData as OllamaData;
const ollamaClient = store.ollamaClient as OllamaClient;

let dnsDebounce: ReturnType<typeof setTimeout>;

async function fetchModels(): Promise<void> {
  try {
    ollamaClient.updateHostAndDns(serverDns.value);
    const modelsAvailable = await ollamaClient.getModels();

    store.setModels(modelsAvailable);
    if (!store.selectedModel && modelsAvailable.length > 0) {
      store.setSelectedModel(modelsAvailable[0]);
    }
    store.setModelsError('');
  } catch {
    store.setModels([]);
    store.setSelectedModel('');
    store.setModelsError(`Could not reach Ollama at ${ollama.getDnsAndPort()}. Make sure the server is running.`);
  }
}

onMounted(() => {
  fetchModels();
});

watch(serverDns, () => {
  clearTimeout(dnsDebounce);
  dnsDebounce = setTimeout(fetchModels, 3000);
});

watch(loading, (isLoading: boolean) => {
  if (isLoading) {
    documentTitleDynamic.start();
  } else {
    documentTitleDynamic.stop();
  }
});

function toggleSettings(): void {
  store.toggleSettings();
}

function toggleTheme(): void {
  store.toggleTheme();
}

</script>
