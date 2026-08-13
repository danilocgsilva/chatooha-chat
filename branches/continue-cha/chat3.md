## Question
---

Look to this Vue.js component:

### src/pages/IndexComponent.vue
```vue
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

import { ref, computed, onMounted, watch } from 'vue';
import OllamaData from '../domain/OllamaData';
import OllamaClient from '../domain/OllamaClient';
import SettingsComponent from './../components/SettingsComponent.vue';
import { ApiMode } from '../domain/OllamaData';
import AnswerAreaComponent from './../components/AnswerAreaComponent.vue';
import MenuComponent from './../components/MenuComponent.vue';
import { useGlobalStore } from '../store';
import QuestionEntry from './../components/QuestionEntry.vue';
import ActionComponent from './../components/ActionComponent.vue';

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

const requestError = computed({
  get: () => store.requestError,
  set: (val) => store.setRequestError(val)
});

const askDate = computed({
  get: () => store.askDate,
  set: (val) => store.setAskDate(val)
});


const showSettings = computed(() => store.showSettings);

const systemPrompt = computed({
  get: () => store.systemPrompt,
  set: (val: string) => store.updateSystemPrompt(val),
});
const answered = computed({
  get: () => store.answered,
  set: (answered: boolean) => store.setAnswered(answered)
});

const copiedInput = ref(false);

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

watch(serverDns, (val) => {
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
```

There are four other components within it that comes into the interest of this task:

* QuestionEntry
* SettingsComponent
* ActionComponent
* AnswerAreaComponent

All of them are together. I want to group them into a single one component, because in the near future, I plan to duplicate it several times in the screen, and having everything into a single one is easier way to do so. And I don't want to remove these components. I want all of them within this new components, that I will call `QuestionAnswerEntryComponent`.

To make it more clear, I will put here the content of these components as well:

### src/components/QuestionEntry.vue
```vue
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
  try {
    await navigator.clipboard.writeText(inputText.value);
  } catch {
    const el = document.createElement('textarea');
    el.value = inputText.value;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }
  copiedInput.value = true;
  setTimeout(() => copiedInput.value = false, 2000);
}
</script>
```

### src/components/SettingsComponent.vue
```vue
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

const props = defineProps<{ 
  isDark: boolean; 
  show: boolean; 
  mode: ApiMode;
  systemPrompt: string;
  loading: boolean
}>();

defineEmits<{ (e: 'toggle'): void; (e: 'update:mode', value: ApiMode): void; (e: 'update:systemPrompt', value: string): void }>();

const copiedSystemPrompt = ref(false);

async function copySystemPrompt(): Promise<void> {
  try {
    await navigator.clipboard.writeText(props.systemPrompt);
  } catch {
    const el = document.createElement('textarea');
    el.value = props.systemPrompt;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }
  copiedSystemPrompt.value = true;
  setTimeout(() => copiedSystemPrompt.value = false, 2000);
}

</script>
```

### src/components/ActionComponent.vue
```vue
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
import { computed } from 'vue';
import { ApiMode } from '../domain/OllamaData';
import OllamaClient from '../domain/OllamaClient';

const store = useGlobalStore();

const isDark = computed(() => store.isDark);

const ollamaClient = store.ollamaClient as OllamaClient;

const loading = computed({
  get: () => store.loading || false,
  set: (val) => store.setLoading(val)
});
const answered = computed({
  get: () => store.answered,
  set: (val) => store.setAnswered(val)
});

const requestError = computed({
  get: () => store.requestError,
  set: (val) => store.setRequestError(val)
});

const askDate = computed({
  get: () => store.askDate,
  set: (val) => store.setAskDate(val)
});

const inputText = computed({
  get: () => store.inputText || '',
  set: (val) => store.setInputText(val)
});

const outputText = computed({
  get: () => store.outputText || '',
  set: (val) => store.setOutputText(val)
});

const apiMode = computed({
  get: () => store.apiMode,
  set: (val: ApiMode) => store.updateApiMode(val),
});

const selectedModel = computed({
  get: () => store.selectedModel,
  set: (val: string) => store.setSelectedModel(val),
});

const systemPrompt = computed({
  get: () => store.systemPrompt,
  set: (val: string) => store.updateSystemPrompt(val),
});

const aborted = computed({
  get: () => store.aborted,
  set: (val: boolean) => store.setAborted(val) 
});

async function ask(): Promise<void> {
  const rendersDate = function(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}s`;
  }
  
  if (store.answered) {
    inputText.value = '';
    outputText.value = '';
    requestError.value = null;
    askDate.value = null;
    store.setAnswered(false);
    return;
  }

  if (!inputText.value.trim() || loading.value) {
    return;
  }

  loading.value = true;
  outputText.value = '';
  requestError.value = null;

  askDate.value = rendersDate();

  try {
    const response = await ollamaClient.getResponse(
      apiMode.value, 
      selectedModel.value, 
      inputText.value, 
      systemPrompt.value
    );

    if (!response.ok) {
      const data = await response.json();
      requestError.value = data.error ?? 'Unknown error';
      return;
    }
    if (!response.body) {
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let done = false;
    while (!done) {
      const { done: isDone, value } = await reader.read();
      done = isDone;

      const listOfData = decoder.decode(value).split('\n').filter(Boolean);
      for (const line of listOfData) {
        const chunk = JSON.parse(line);
        outputText.value += chunk.message?.content ?? chunk.response ?? '';
      }

      if (done) {
        // answered.value = true;
        store.setAnswered(true);
      }
    }
  } catch (e: unknown) {
    if ((e as Error).name !== 'AbortError') throw e;
  } finally {
    loading.value = false;
    ollamaClient.cleanAbord();
    if (!requestError.value && !aborted.value) store.setAnswered(true);
    aborted.value = false;
  }
}



function cancel(): void {
  ollamaClient.abort();
  // answered.value = false;
  store.setAnswered(false);
  aborted.value = true;
}

</script>
```

### src/components/AnswerAreaComponent.vue
```vue
<template>

  <textarea :value="outputText" readonly placeholder="Output will appear here..."
    class="w-full h-96 p-3 rounded-lg border resize-none cursor-default transition-colors" :class="isDark
      ? 'bg-dark-bg text-dark-subtle border-dark-border placeholder-dark-subtle'
      : 'bg-light-surface text-gray-500 border-light-strong placeholder-light-subtle'"></textarea>

  <div class="flex justify-end">
    <button @click="copyToClipboard" :disabled="!outputText" title="Copy to clipboard"
      class="px-3 py-1.5 rounded-lg text-sm border transition-colors disabled:opacity-30" :class="isDark
        ? 'bg-dark-surface text-dark-subtle border-dark-border hover:bg-dark-muted'
        : 'bg-light-surface text-gray-700 border-light-strong hover:bg-light-muted'">{{ copied ? '✓ Copied' : '⎘Copy' }}</button>
  </div>

</template>

<script setup lang="ts">

import { ref } from 'vue';

const props = defineProps<{
  outputText: string,
  isDark: boolean
}>();

const copied = ref(false);

async function copyToClipboard(): Promise<void> {
  try {
    await navigator.clipboard.writeText(props.outputText);
  } catch {
    const el = document.createElement('textarea');
    el.value = props.outputText;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }
  copied.value = true;
  setTimeout(() => copied.value = false, 2000);
}

</script>
```

### src/store/index.ts
```ts
import { defineStore } from 'pinia';
import { ApiMode } from '../domain/OllamaData';
import DocumentTitleDynamic from '../domain/DocumentTitleDynamic';
import OllamaData from '../domain/OllamaData';
import OllamaClient from '../domain/OllamaClient';
import { markRaw } from 'vue'

export const useGlobalStore = defineStore('global', {
  state: () => ({
    isDark: document.cookie.split('; ').find(r => r.startsWith('theme='))?.split('=')[1] === 'dark',
    serverDns: localStorage.getItem('serverDns') ?? 'localhost:11434',
    selectedModel: '',
    models: [] as string[],
    modelsError: null as string | null,
    apiMode: 'chat' as ApiMode,
    systemPrompt: '',
    showSettings: false,
    requestError: null as string | null,
    inputText: '',
    loading: false,
    outputText: '',
    documentTitleDynamic: markRaw(DocumentTitleDynamic.instance(document.title)),
    answered: false,
    aborted: false,
    ollamaData: null as OllamaData | null,
    ollamaClient: null as OllamaClient | null,
    askDate: null as string | null,
  }),
  
  getters: {
    isDarkTheme: (state) => state.isDark,
    getServerDns: (state) => state.serverDns,
    getSelectedModel: (state) => state.selectedModel,
    getModels: (state) => state.models,
    getModelsError: (state) => state.modelsError,
    getApiMode: (state) => state.apiMode,
    getSystemPrompt: (state) => state.systemPrompt,
    getShowSettings: (state) => state.showSettings,
    getRequestError: (state) => state.requestError,
    getInputText: (state) => state.inputText,
    getLoading: (state) => state.loading,
    getOutputText: (state) => state.outputText,
    getDocumentTitleDynamic: (state) => state.documentTitleDynamic,
    getAnswered: (state) => state.answered,
    getAborted: (state) => state.aborted,
    getOllamaClient: (state) => state.ollamaClient,
    getOllamaData: (state) => state.ollamaData,
    getAskDate: (state) => state.askDate,
  },
  
  actions: {
    init() {
      const ollama = new OllamaData(this.serverDns);
      this.ollamaData = ollama;
      this.ollamaClient = new OllamaClient(ollama);
    },

    toggleTheme() {
      this.isDark = !this.isDark;
      document.cookie = `theme=${this.isDark ? 'dark' : 'light'}; path=/`;
    },
    
    setSelectedModel(model: string) {
      this.selectedModel = model;
    },

    setRequestError(error: string | null) {
      this.requestError = error;
    },
    
    setAskDate(date: string | null) {
      this.askDate = date;
    },
    
    setModels(models: string[]) {
      this.models = models;
    },
    
    setModelsError(error: string | null) {
      this.modelsError = error;
    },

    setAnswered(answered: boolean) {
      this.answered = answered;
    },

    setAborted(aborted: boolean) {
      this.aborted = aborted;
    },

    updateServerDns(dns: string) {
      this.serverDns = dns;
      localStorage.setItem('serverDns', dns);
      // Reinitialize if needed
      if (this.ollamaData) {
        this.init();
      }
    },
    
    updateApiMode(mode: ApiMode) {
      this.apiMode = mode;
    },
    
    updateSystemPrompt(prompt: string) {
      this.systemPrompt = prompt;
    },

    updateRequestError(requestError: string|null) {
      this.requestError = requestError;
    },

    replaceInstance(documentDynamic: DocumentTitleDynamic) {
      this.documentTitleDynamic = documentDynamic;
    },
    
    toggleSettings() {
      this.showSettings = !this.showSettings;
    },

    setInputText (text: string) {
      this.inputText = text;
    },

    setLoading (loading: boolean) {
      this.loading = loading
    },

    setOutputText (text: string) {
      this.outputText = text;
    }
  }
});
```

### src/App.vue
```vue
<template>
  <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

</style>
```

### src/router/index.ts
```ts
import { createRouter, createWebHistory } from 'vue-router';

import Index from '../pages/IndexComponent.vue'
import Stats from '../pages/StatsComponent.vue'

const routes = [
    {
        path: '/',
        name: 'Index',
        component: Index
    },
    {
        path: '/stats',
        name: 'Stats',
        component: Stats
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router;
```

### src/domain/OllamaClient.ts
```ts
import OllamaData, { ApiMode } from "./OllamaData";
import { StatItem } from "types/StatItem";
import { ApiStatResponse } from "types/ApiStatResponse";

class OllamaClient {
    private ollamaData: OllamaData;
    private abortController: AbortController | null = null;

    constructor(ollamaData: OllamaData) {
        this.ollamaData = ollamaData;
    }

    public async getStatistics(): Promise<StatItem[]> {
        const res = await fetch(this.ollamaData.getFullAddressOllamaStatistics());
        
        if (!res.ok) {
            throw new Error(`Failed to fetch statistics: ${res.status} ${res.statusText}`);
        }

        const data: ApiStatResponse = await res.json();

        if (data && Array.isArray(data.message)) {
            return data.message.map((item: { count: string, model: string }) => ({
                count: parseInt(item.count, 10),
                model: item.model
            })) as StatItem[];
        }

        throw new Error('Invalid response format');
    }

    public async getModels(): Promise<string[]> {
        const res = await fetch(this.ollamaData.getFullAddressTags());
        const data = await res.json();
        const models = data.models.map((m: { name: string }) => m.name);
        return models;
    }

    public updateHostAndDns(hostAndDns: string): OllamaClient {
        this.ollamaData.updateServerDns(hostAndDns);
        return this;
    }

    public async getResponse(
        mode: ApiMode, 
        model: string, 
        prompt: string, 
        systemPrompt = ''
    ): Promise<Response> {
        this.abortController = new AbortController();
        const response = await fetch(this.ollamaData.getFullAddress(mode), {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(
                this.ollamaData.getQueryObject(mode, model, prompt, systemPrompt)
            ),
            signal: this.abortController.signal,
        });

        return response;
    }

    public abort() {
        this.abortController?.abort();
    }

    public cleanAbord() {
        this.abortController = null;
    }
}

export default OllamaClient;
```

### src/domain/OllamaData.ts
```ts
export type ApiMode = 'chat' | 'generate';
import ChatSend from "types/ChatSend";
import GenerateSend from "types/GenerateSend";

class OllamaData {
    private serverDns: string;
    private generatePath = 'api/generate';
    private chatPath = 'api/chat';
    private tagsPath = 'api/tags';
    private ollamaStatistics = 'alooha_api/stats';

    constructor(serverDns: string) {
        this.serverDns = serverDns;
    }

    public getDnsAndPort(): string {
        return this.serverDns;
    }

    public getFullAddress(mode: ApiMode): string {
        return `http://${this.serverDns}/${mode === 'chat' ? this.chatPath : this.generatePath}`;
    }

    public getFullAddressTags(): string {
        return `http://${this.serverDns}/${this.tagsPath}`;
    }

    public getFullAddressOllamaStatistics(): string {
        return `http://${this.serverDns}/${this.ollamaStatistics}`;
    }

    public updateServerDns(serverDns: string): OllamaData {
        this.serverDns = serverDns;
        return this;
    }

    public getQueryObject(
        mode: ApiMode, 
        model: string, 
        prompt: string,
        systemPrompt = ""
    ): ChatSend | GenerateSend {
        const messages = []
        if (systemPrompt !== "") {
            messages.push({ role: 'system', content: systemPrompt });    
        }
        messages.push({ role: 'user', content: prompt });

        if (mode === 'chat') {
            return { 
                model, 
                messages, 
                stream: true
            };
        }
        if (mode === 'generate') {
            return { model, prompt, system: systemPrompt, stream: true };
        }
        throw new Error("Wrong mode given.");
    }
}

export default OllamaData;
```

Could you create these components and tell which changes may I do do keep my main component working as the same?

---

## System prompt

Role:
* You are a senior frontend developer using Vue.js.
Rules:
* The aplication must preserve its behaviour as before.
* Try to change the minimum required to do the task.
* Don't change the name of components.
* If some logic must be moved from one component to another, be clear about it.
* The template section of components must not be change, or changed the minimum possible. Otherwise, feel free to change the script section to allow the most similar original behaviour.
* Use TypeScript.
* Don't worry much with styles. The application uses Tailwind to format the elements. So, use Tailwind classes instead of css code to style elements, if required.
