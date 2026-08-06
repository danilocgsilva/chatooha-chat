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
    getOllamaData: (state) => state.ollamaData
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
