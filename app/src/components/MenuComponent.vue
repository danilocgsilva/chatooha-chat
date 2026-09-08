<template>
  <div class="flex gap-2">
    <RouterLink to="/" class="px-4 py-2 rounded-lg transition-colors" :class="isDark
      ? 'bg-dark-surface text-dark-subtle hover:bg-dark-muted'
      : 'bg-light-surface text-gray-800 hover:bg-light-muted'">
      Home
    </RouterLink>
    <RouterLink to="/stats" class="px-4 py-2 rounded-lg transition-colors" :class="isDark
      ? 'bg-dark-surface text-dark-subtle hover:bg-dark-muted'
      : 'bg-light-surface text-gray-800 hover:bg-light-muted'">
      Stats
    </RouterLink>
    <RouterLink to="/history" class="px-4 py-2 rounded-lg transition-colors" :class="isDark
      ? 'bg-dark-surface text-dark-subtle hover:bg-dark-muted'
      : 'bg-light-surface text-gray-800 hover:bg-light-muted'">
      History
    </RouterLink>

  </div>
</template>

<script setup lang="ts">

defineProps<{
  isDark: boolean;
}>();

</script>