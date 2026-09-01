<template>
  <div class="flex gap-2">
    <div class="flex-1 flex gap-2">
      <button
        @click="unloadToContinueChat"
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
import { PastActivity } from 'types/PastActivity';

function showNotification(title: string, message: string) {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notification');
    return;
  }

  if (Notification.permission === 'granted') {
    new Notification(title, { body: message });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification(title, { body: message });
      }
    });
  }
}

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

const answerDate = computed({
  get: () => store.answerDate,
  set: (answerDate) => store.setAnswerDate(answerDate)
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

const dynamicOptions = computed(() => store.dynamicOptions || []);

function addHistoryItem() {
  const question = inputText.value;
  const answer = outputText.value;
  const model = selectedModel.value;

  const item: PastActivity = {
    question,
    answer,
    model,
    timestamp: store.askDate,
    completed: store.answerDate
  };
  store.addHistoryItem(item);
}

function unloadToContinueChat() {
  addHistoryItem();
  store.setInputText("");
  store.setOutputText("");
  store.setAnswered(false);
}

async function ask(): Promise<void> {
  const rendersDate = function(date: Date): string {
    // const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    // return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}s`;
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
  
  if (store.answered) {
    inputText.value = '';
    outputText.value = '';
    requestError.value = null;
    askDate.value = null;
    answerDate.value = null;
    store.setAnswerStartedAt(null);
    store.setAnswerDuration(null);
    store.setAnswered(false);
    return;
  }

  if (!inputText.value.trim() || loading.value) {
    return;
  }

  loading.value = true;
  outputText.value = '';
  requestError.value = null;
  answerDate.value = null;
  store.setAnswerDuration(null);
  store.setAnswerStartedAt(Date.now());

  askDate.value = rendersDate(new Date());

  try {
    const response = await ollamaClient.getResponse(
      apiMode.value, 
      selectedModel.value, 
      inputText.value, 
      systemPrompt.value,
      store.history,
      dynamicOptions.value.reduce((acc, setting) => {
        if (setting.key) {
          const num = Number(setting.value);
          acc[setting.key] = setting.value === '' ? '' : isNaN(num) ? setting.value : num;
        }
        return acc;
      }, {} as { [key: string]: unknown })
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
        store.setAnswered(true);
      }
    }
  } catch (e: unknown) {
    if ((e as Error).name !== 'AbortError') throw e;
  } finally {
    loading.value = false;
    answerDate.value = rendersDate(new Date());

    if (store.answerStartedAt) {
      const elapsedMs = Date.now() - store.answerStartedAt;
      const minutes = String(Math.floor(elapsedMs / 60000)).padStart(2, '0');
      const seconds = String(Math.floor((elapsedMs % 60000) / 1000)).padStart(2, '0');
      store.setAnswerDuration(`${minutes}:${seconds}`);
    }

    store.setAnswerStartedAt(null);
    ollamaClient.cleanAbord();
    if (!requestError.value && !aborted.value) store.setAnswered(true);

    if (!requestError.value && !aborted.value) {
      // store.setAnswered(true);
      showNotification('Response Complete', 'Your answer has been generated');
    }

    aborted.value = false;
  }
}

function cancel(): void {
  ollamaClient.abort();
  answerDate.value = null;
  store.setAnswerStartedAt(null);
  store.setAnswerDuration(null);
  store.setAnswered(false);
  aborted.value = true;
}

</script>