<template>
  <div class="mt-4">
    <div 
      v-for="(item, index) in history" 
      :key="index"
      class="mb-6 p-4 rounded-lg border transition-colors"
      :class="isDark 
        ? 'bg-dark-surface border-dark-border' 
        : 'bg-light-surface border-light-strong'"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Question Section -->
        <div>
          <div class="flex justify-between items-start mb-2">
            <h3 class="font-semibold" :class="isDark ? 'text-dark-subtle' : 'text-gray-800'">Question</h3>
            <span class="text-xs" :class="isDark ? 'text-dark-subtle' : 'text-gray-500'">
              {{ item.question.length }} characters
            </span>
          </div>
          <textarea
            readonly
            :value="item.question"
            class="w-full px-3 py-2 rounded-lg text-sm border transition-colors resize-none focus:outline-none"
            :class="isDark
              ? 'bg-dark-surface text-dark-subtle border-dark-border'
              : 'bg-light-surface text-gray-700 border-light-strong'"
            rows="3"
          />
          <div class="mt-1 text-xs" :class="isDark ? 'text-dark-subtle' : 'text-gray-500'">
            Asked: {{ formatDate(item.timestamp) }}
          </div>
        </div>

        <!-- Answer Section -->
        <div>
          <div class="flex justify-between items-start mb-2">
            <h3 class="font-semibold" :class="isDark ? 'text-dark-subtle' : 'text-gray-800'">Answer</h3>
            <span class="text-xs" :class="isDark ? 'text-dark-subtle' : 'text-gray-500'">
              {{ item.answer.length }} characters
            </span>
          </div>
          <textarea
            readonly
            :value="item.answer"
            class="w-full px-3 py-2 rounded-lg text-sm border transition-colors resize-none focus:outline-none"
            :class="isDark
              ? 'bg-dark-surface text-dark-subtle border-dark-border'
              : 'bg-light-surface text-gray-700 border-light-strong'"
            rows="3"
          />
          <div class="mt-1 text-xs" :class="isDark ? 'text-dark-subtle' : 'text-gray-500'">
            Completed: {{ formatDate(item.completed) }}
          </div>
        </div>
      </div>

      <!-- Model Information -->
      <div class="mt-3 pt-3 border-t border-opacity-20" :class="isDark ? 'border-dark-border' : 'border-light-strong'">
        <div class="flex items-center gap-2">
          <span class="text-xs" :class="isDark ? 'text-dark-subtle' : 'text-gray-500'">Model:</span>
          <span class="text-sm font-medium" :class="isDark ? 'text-dark-subtle' : 'text-gray-800'">{{ item.model }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGlobalStore } from '../store';

const store = useGlobalStore();
const isDark = computed(() => store.isDark);

const history = computed(() => store.history || []);

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString();
}
</script>