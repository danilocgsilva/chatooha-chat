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
      
      <!-- Input section -->
      <div class="flex flex-col gap-4">
        <textarea 
          v-model="inputText"
          placeholder="Enter your question..."
          class="w-full p-4 rounded-lg border transition-colors"
          :class="isDark 
            ? 'bg-dark-surface text-dark-subtle border-dark-border' 
            : 'bg-light-surface text-gray-700 border-light-strong'"
          rows="4"
        ></textarea>
        
        <div class="flex gap-2">
          <select 
            v-model="selectedModel" 
            class="p-2 rounded-lg border transition-colors"
            :class="isDark 
              ? 'bg-dark-surface text-dark-subtle border-dark-border' 
              : 'bg-light-surface text-gray-700 border-light-strong'"
          >
            <option v-for="model in models" :key="model" :value="model">{{ model }}</option>
          </select>
          
          <button
            @click="toggleSettings"
            class="px-4 py-2 rounded-lg border transition-colors"
            :class="isDark 
              ? 'bg-dark-surface text-dark-subtle border-dark-border hover:bg-dark-muted' 
              : 'bg-light-surface text-gray-700 border-light-strong hover:bg-light-muted'"
          >
            Settings
          </button>
          
          <button
            @click="ask"
            :disabled="loading || !inputText.trim()"
            class="px-4 py-2 bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {{ loading ? 'Processing...' : 'Ask' }}
          </button>
        </div>
      </div>

      <!-- Settings panel -->
      <div v-if="showSettings" class="p-4 rounded-lg border transition-colors"
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

      <!-- Response section -->
      <div class="mt-4 p-4 rounded-lg border transition-colors"
        :class="isDark 
          ? 'bg-dark-surface text-dark-subtle border-dark-border' 
          : 'bg-light-surface text-gray-700 border-light-strong'">
        <div v-if="loading" class="flex items-center gap-2">
          <div class="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
          <div class="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
          <div class="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
        </div>
        <div v-else-if="requestError" class="text-red-500">{{ requestError }}</div>
        <div v-else v-html="outputText"></div>
      </div>

      <!-- Models error -->
      <div v-if="modelsError" class="p-4 rounded-lg border bg-red-100 text-red-700">
        {{ modelsError }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useStore } from 'vuex';
import MenuComponent from './../components/MenuComponent.vue';
import { OllamaData, OllamaClient } from '../services/OllamaService';

const store = useStore();
const isDark = computed(() => store.state.isDark);
const serverDns = computed(() => store.state.serverDns);
const selectedModel = computed(() => store.state.selectedModel);
const models = computed(() => store.state.models);
const modelsError = computed(() => store.state.modelsError);
const apiMode = computed(() => store.state.apiMode);
const systemPrompt = computed(() => store.state.systemPrompt);
const showSettings = computed(() => store.state.showSettings);

const inputText = ref('');
const outputText = ref('');
const loading = ref(false);
const requestError = ref('');
const answered = ref(false);
const aborted = ref(false);

let dnsDebounce: ReturnType<typeof setTimeout>;

const ollama = new OllamaData(serverDns.value);
const ollamClient = new OllamaClient(ollama);

async function fetchModels(): Promise<void> {
  try {
    ollamClient.updateHostAndDns(serverDns.value);
    const fetchedModels = await ollamClient.getModels();
    store.commit('SET_MODELS', fetchedModels);
    if (fetchedModels.length > 0 && !store.state.selectedModel) {
      store.commit('SET_SELECTED_MODEL', fetchedModels[0]);
    }
    store.commit('SET_MODELS_ERROR', '');
  } catch {
    store.commit('SET_MODELS', []);
    store.commit('SET_MODELS_ERROR', `Could not reach Ollama at ${ollama.getDnsAndPort()}. Make sure the server is running.`);
  }
}

onMounted(() => {
  fetchModels();
});

watch(serverDns, (val) => {
  store.dispatch('updateServerDns', val);
  clearTimeout(dnsDebounce);
  dnsDebounce = setTimeout(fetchModels, 3000);
});

function toggleTheme(): void {
  store.dispatch('toggleTheme');
}

function toggleSettings(): void {
  store.commit('SET_SHOW_SETTINGS', !store.state.showSettings);
}

async function ask(): Promise<void> {
  if (answered.value) {
    inputText.value = '';
    outputText.value = '';
    requestError.value = null;
    answered.value = false;
    return;
  }

  if (!inputText.value.trim() || loading.value) {
    return;
  }

  loading.value = true;
  outputText.value = '';
  requestError.value = null;

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
    answered.value = true;
  }
}
</script>