## Question

Look to my Vue.js application (the relevant parts):
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

### src/store/index.ts
```ts
import { defineStore } from 'pinia';
import { ApiMode } from '../domain/OllamaData';

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
    requestError: null as string | null
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
    getRequestError: (state) => state.requestError
  },
  
  actions: {
    toggleTheme() {
      this.isDark = !this.isDark;
      document.cookie = `theme=${this.isDark ? 'dark' : 'light'}; path=/`;
    },
    
    setSelectedModel(model: string) {
      this.selectedModel = model;
    },
    
    setModels(models: string[]) {
      this.models = models;
    },
    
    setModelsError(error: string | null) {
      this.modelsError = error;
    },

    updateServerDns(dns: string) {
      this.serverDns = dns;
      localStorage.setItem('serverDns', dns);
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
    
    toggleSettings() {
      this.showSettings = !this.showSettings;
    },
  }
});
```

### src/App.vue
```vue
<template>
  <keep-alive>
    <router-view />
  </keep-alive>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

</style>
```

### src/pages/IndexComponent.vue
```
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
      <SettingsComponent 
        :isDark="isDark" 
        :show="showSettings" 
        :mode="apiMode" 
        :systemPrompt="systemPrompt"
        :loading="loading || answered"
        @toggle="toggleSettings" 
        @update:mode="apiMode = $event" 
        @update:systemPrompt="systemPrompt = $event" />
      <div class="flex gap-2">
        <button
          @click="ask"
          :disabled="loading"
          class="flex-1 py-2 rounded-lg transition-colors disabled:opacity-50"
          :class="isDark
            ? 'bg-dark-muted text-dark-subtle hover:bg-dark-border'
            : 'bg-light-subtle text-gray-800 hover:bg-light-muted'"
        >{{ loading ? 'Answering...' : answered ? 'Ask again' : 'Ask' }}</button>
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
      <AnswerAreaComponent :isDark="isDark" :outputText="outputText" />
    </div>
  </div>
</template>

<script setup lang="ts">

import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue';
import OllamaData from '../domain/OllamaData';
import OllamaClient from '../domain/OllamaClient';
import DocumentTitleDynamic from '../domain/DocumentTitleDynamic';
import SettingsComponent from './../components/SettingsComponent.vue';
import { ApiMode } from '../domain/OllamaData';
import AnswerAreaComponent from './../components/AnswerAreaComponent.vue';
import MenuComponent from './../components/MenuComponent.vue';
import { useGlobalStore } from '../store';

const store = useGlobalStore();

const arrowSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='none' stroke='%23888' stroke-width='2' d='M4 6l4 4 4-4'/%3E%3C/svg%3E")`;

const inputText = ref('');
const outputText = ref('');

const isDark = computed(() => store.isDark);

const loading = ref<boolean>(false);
const serverDns = computed({
  get: () => store.serverDns,
  set: (val: string) => store.updateServerDns(val),
});
const selectedModel = computed({
  get: () => store.selectedModel,
  set: (val: string) => store.setSelectedModel(val),
});
const models = computed(() => store.models);
const modelsError = computed(() => store.modelsError);
const requestError = ref<string | null>(null);
const askDate = ref<string | null>(null);
const showSettings = computed(() => store.showSettings);
const apiMode = computed({
  get: () => store.apiMode,
  set: (val: ApiMode) => store.updateApiMode(val),
});
const systemPrompt = computed({
  get: () => store.systemPrompt,
  set: (val: string) => store.updateSystemPrompt(val),
});
const answered = ref<boolean>(false);
const aborted = ref<boolean>(false);

const ollama = new OllamaData(serverDns.value);
const ollamClient = new OllamaClient(ollama);
const documentTitleDynamic = new DocumentTitleDynamic(document.title);

let dnsDebounce: ReturnType<typeof setTimeout>;

async function fetchModels(): Promise<void> {
  try {
    ollamClient.updateHostAndDns(serverDns.value);
    const modelsAvailable = await ollamClient.getModels();

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

onMounted(fetchModels);

onBeforeUnmount(() => {
  documentTitleDynamic.stop();
})

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

function cancel(): void {
  ollamClient.abort();
  answered.value = false;
  aborted.value = true;
}

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
  
  if (answered.value) {
    inputText.value = '';
    outputText.value = '';
    requestError.value = null;
    askDate.value = null;
    answered.value = false;
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
    const response = await ollamClient.getResponse(
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
    }
  } catch (e: unknown) {
    if ((e as Error).name !== 'AbortError') throw e;
  } finally {
    loading.value = false;
    ollamClient.cleanAbord();
    if (!requestError.value && !aborted.value) answered.value = true;
    aborted.value = false;
  }
}

</script>
```

### src/pages/StatsComponent.vue
```vue
<template>
  <div class="min-h-screen transition-colors" :class="isDark ? 'bg-dark-bg' : 'bg-light-bg'">
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
      <StatsTableComponent :isDark="isDark"></StatsTableComponent>
    </div>
  </div>
</template>

<script setup lang="ts">

import { computed } from 'vue';
import { useGlobalStore } from '../store';
import MenuComponent from './../components/MenuComponent.vue';
import StatsTableComponent from './../components/StatsTableComponent.vue';

const store = useGlobalStore();
const isDark = computed(() => store.isDark);

function toggleTheme(): void {
  store.toggleTheme();
}

</script>
```
Recently, I've added vue-router to allow page navigation. The problem: the state from the index page must be preserved through pages navigation. I also installed Pinia to manage the global states. But so for I am experiencing a specifc problem: When I change the page, the answer in the firsrt textare disapear. I don't want this. I need to nivigate through the pages, but the content in the first textarea must keep untouched. How to do this?

## System prompt

Rules:
* You are an experienced Vue.js developer.
* Don't break the application functionality.
* Don't change anything in the layout nor apperance.
* Make the minimum possible changes to perform the objective.
* For the files that you need to change, output the whole file.

## Answer

The issue is that Vue Router by default destroys and recreates components during navigation, causing state loss. The solution is to use `keep-alive` to preserve component state.

Here's how to fix it:

1. **Update your main App.vue** to wrap the router view with `keep-alive`:
```vue
<template>
  <div id="app">
    <keep-alive>
      <router-view />
    </keep-alive>
  </div>
</template>
```

2. **Modify your Index page** to properly handle state persistence by using `v-model` with the store and making sure the textarea content is managed through the store:
```vue
<script setup lang="ts">
// ... existing imports ...

const store = useGlobalStore();

// ... existing computed properties ...

// Make sure inputText is managed through the store
const inputText = computed({
  get: () => store.inputText || '',
  set: (val) => store.setInputText(val)
});

// ... rest of your existing code ...
</script>
```

3. **Add a new action to your store** to manage the input text:
```ts
// In your store file
const setInputText = (text: string) => {
  state.inputText = text;
};
```

4. **Update your `ask` function** to properly handle the input text when resetting:
```ts
async function ask(): Promise<void> {
  // ... existing code ...
  
  if (answered.value) {
    // Don't clear inputText here - let it persist
    outputText.value = '';
    requestError.value = null;
    askDate.value = null;
    answered.value = false;
    return;
  }
  
  // ... rest of your existing code ...
}
```

5. **Alternative approach** - If you want to be more explicit about what components to keep alive, you can use `include` prop:
```vue
<template>
  <div id="app">
    <keep-alive include="IndexPage">
      <router-view />
    </keep-alive>
  </div>
</template>
```

The key is that `keep-alive` prevents component destruction during navigation, preserving the component's state. However, since you're using Pinia for global state management, make sure to store the input text in the store as well to ensure it persists across page changes.

The simplest fix is just adding `keep-alive` around your router-view in App.vue - this will preserve all components that are navigated between, including your index page with its textarea content.


