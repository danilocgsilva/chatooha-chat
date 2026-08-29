<template>
  <div :class="['stats-container', { 'dark-mode': isDark }]">
    <h2 class="stats-title font-bold" :class="isDark ? 'text-dark-subtle' : 'text-gray-800'">Model Usage Statistics</h2>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading statistics...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
    </div>

    <table v-else class="stats-table">
      <thead>
        <tr>
          <th class="count-column" :class="isDark ? 'text-dark-subtle' : 'text-gray-500'">Count</th>
          <th :class="isDark ? 'text-dark-subtle' : 'text-gray-500'">Model Name</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in stats" :key="index">
          <td class="count-cell" :class="isDark ? 'text-dark-subtle' : 'text-gray-500'">{{ item.count }}</td>
          <td class="model-cell" :class="isDark ? 'text-dark-subtle' : 'text-gray-500'">{{ item.model }}</td>
        </tr>
      </tbody>
    </table>

    <div v-if="stats.length === 0 && !loading && !error" class="no-data">
      <p>No statistics available</p>
    </div>
  </div>
</template>

<script setup lang="ts">

import { ref, onMounted } from 'vue';
import { StatItem } from './../types/StatItem';
import OllamaClient from './../domain/OllamaClient';
import OllamaData from './../domain/OllamaData';

const stats = ref<StatItem[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const serverDns = ref(localStorage.getItem('serverDns') ?? 'localhost:11434');

defineProps<{
  isDark: boolean;
}>();

const fetchStats = async () => {
  try {
    loading.value = true;

    const ollamaClient = new OllamaClient(new OllamaData(serverDns.value));

    stats.value = await ollamaClient.getStatistics();
    error.value = null;

  } catch (err) {
    error.value = 'Failed to load statistics';
    console.error('Stats fetch error:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchStats();
});
</script>

<style scoped>
.stats-container {
  padding: 1.5rem;
  background: var(--bg-color);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin: 1rem 0;
}

.stats-title {
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.4rem;
}

.stats-table {
  width: 100%;
  border-collapse: collapse;
}

.stats-table thead {
  border-bottom: 2px solid var(--border-color);
}

.stats-table th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 600;
}

.stats-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-color);
}

.count-column {
  width: 10%;
  text-align: right;
}

.count-cell {
  font-weight: 600;
}

.model-cell {
  font-family: monospace;
  word-break: break-all;
}

.loading,
.error,
.no-data {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary-color);
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: var(--spinner-color);
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Dark mode styles */
.dark-mode {
  --bg-color: var(--dark-bg);
  --text-color: var(--dark-text);
  --border-color: var(--dark-border);
  --text-secondary-color: var(--dark-text-secondary);
  --accent-color: var(--dark-accent);
  --spinner-color: #6b7280;
}

/* Light mode styles */
:not(.dark-mode) {
  --bg-color: var(--light-bg);
  --text-color: var(--light-text);
  --border-color: var(--light-border);
  --text-secondary-color: var(--light-text-secondary);
  --accent-color: var(--light-accent);
  --spinner-color: #3b82f6;
}

@media (max-width: 768px) {
  .stats-container {
    padding: 1rem;
  }

  .stats-table th,
  .stats-table td {
    padding: 0.5rem;
    font-size: 0.9rem;
  }

  .count-column {
    width: 15%;
  }
}
</style>