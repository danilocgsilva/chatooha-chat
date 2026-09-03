import { defineStore } from 'pinia';
import { ApiMode } from '../domain/OllamaData';
import DocumentTitleDynamic from '../domain/DocumentTitleDynamic';
import OllamaData from '../domain/OllamaData';
import OllamaClient from '../domain/OllamaClient';
import { markRaw } from 'vue'
import { PastActivity } from 'types/PastActivity';
import { v4 as uuidv4 } from 'uuid';

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
    answerDate: null as string | null,
    answerStartedAt: null as number | null,
    answerDuration: null as string | null,
    history: [] as PastActivity[],
    chatId: null as string | null,
    settings: [] as { key: string, value: string }[],
    dynamicOptions: [{ key: '', value: '' }] as { key: string; value: string }[],
    disableReasoning: false
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
    getAnswerDate: (state) => state.answerDate,
    getAnswerStartedAt: (state) => state.answerStartedAt,
    getAnswerDuration: (state) => state.answerDuration,
    getDynamicOptions: (state) => state.dynamicOptions,
    getDisableReasoning: (state) => state.disableReasoning,
  },
  
  actions: {
    init() {
      const clientVersion = process.env.npm_package_version;
      this.chatId = uuidv4();
      const ollama = new OllamaData(this.serverDns, this.chatId, clientVersion);
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

    setAnswerDate(answerDateString: string | null) {
      this.answerDate = answerDateString;
    },

    setAnswerStartedAt(timestamp: number | null) {
      this.answerStartedAt = timestamp;
    },

    setAnswerDuration(duration: string | null) {
      this.answerDuration = duration;
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
    },

    setHistory(history: PastActivity[]) {
      this.history = history;
    },

    addHistoryItem(item: PastActivity) {
      this.history.push(item);
    },

    updateSettings(settings: { key: string, value: string }[]) {
      this.settings = settings;
    },
    
    addSetting() {
      this.settings.push({ key: '', value: '' });
    },
    
    removeSetting(index: number) {
      this.settings.splice(index, 1);
    },
    
    updateSettingKey(index: number, key: string) {
      this.settings[index].key = key;
    },
    
    updateSettingValue(index: number, value: string) {
      this.settings[index].value = value;
    },

    setDynamicOptions(options: { key: string, value: string }[]) {
      this.dynamicOptions = options;
    },

    setDisableReasoning(value: boolean) {
      this.disableReasoning = value;
    },

    addDynamicOption(option: { key: string, value: string }) {
      this.dynamicOptions.push(option);
    },

    removeDynamicOption(index: number) {
      this.dynamicOptions.splice(index, 1);
    },

    updateDynamicOptionKey(index: number, key: string) {
      this.dynamicOptions[index].key = key;
    },

    updateDynamicOptionValue(index: number, value: string) {
      this.dynamicOptions[index].value = value;
    },

    async copyTextToClipboard(text: string): Promise<void> {
      try {
        await navigator.clipboard.writeText(text);
      } catch (err) {
        // Fallback for older browsers or secure contexts
        const el = document.createElement('textarea');
        el.value = text;
        el.style.position = 'fixed';
        el.style.opacity = '0';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
    },
  }
});