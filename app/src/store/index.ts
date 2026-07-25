import { createStore } from 'vuex';

export default createStore({
  state: {
    isDark: document.cookie.split('; ').find(r => r.startsWith('theme='))?.split('=')[1] === 'dark',
    serverDns: localStorage.getItem('serverDns') ?? 'localhost:11434',
    selectedModel: '',
    models: [],
    modelsError: null as string | null,
    apiMode: 'chat' as 'chat' | 'generate',
    systemPrompt: '',
    showSettings: false,
    statsData: null as any,
    statsLoaded: false
  },
  mutations: {
    SET_DARK_THEME(state, value) {
      state.isDark = value;
    },
    SET_SERVER_DNS(state, value) {
      state.serverDns = value;
    },
    SET_SELECTED_MODEL(state, value) {
      state.selectedModel = value;
    },
    SET_MODELS(state, value) {
      state.models = value;
    },
    SET_MODELS_ERROR(state, value) {
      state.modelsError = value;
    },
    SET_API_MODE(state, value) {
      state.apiMode = value;
    },
    SET_SYSTEM_PROMPT(state, value) {
      state.systemPrompt = value;
    },
    SET_SHOW_SETTINGS(state, value) {
      state.showSettings = value;
    },
    SET_STATS_DATA(state, value) {
      state.statsData = value;
    },
    SET_STATS_LOADED(state, value) {
      state.statsLoaded = value;
    }
  },
  actions: {
    toggleTheme({ commit, state }) {
      const newTheme = !state.isDark;
      commit('SET_DARK_THEME', newTheme);
      document.cookie = `theme=${newTheme ? 'dark' : 'light'}; path=/`;
    },
    updateServerDns({ commit }, value) {
      commit('SET_SERVER_DNS', value);
      localStorage.setItem('serverDns', value);
    }
  }
});