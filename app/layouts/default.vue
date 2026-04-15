<script setup lang="ts">
const { isDark, toggleTheme } = useTheme()

useHead({
  title: 'Platform-as-API · Internal Analytics',
})
</script>

<template>
  <div
    class="flex min-h-screen flex-col"
    :style="{ backgroundColor: 'var(--surface-primary)' }"
  >
    <header
      class="flex shrink-0 flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6"
      :style="{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--surface-secondary)' }"
    >
      <div class="min-w-0">
        <h1 class="truncate text-base font-semibold sm:text-lg" :style="{ color: 'var(--text-primary)' }">
          Platform-as-API
        </h1>
      </div>

      <div class="flex w-full flex-col gap-3 sm:w-auto sm:max-w-[min(100%,42rem)] sm:flex-row sm:items-center sm:justify-end">
        <AnalyticsDateBar class="w-full min-w-0" />
        <button
          type="button"
          class="relative flex h-8 w-[60px] shrink-0 items-center rounded-full p-0.5 transition-colors duration-300"
          :style="{
            backgroundColor: isDark ? 'rgba(249, 115, 22, 0.15)' : '#e2e8f0',
          }"
          :aria-pressed="isDark"
          title="Toggle theme"
          @click="toggleTheme"
        >
          <span
            class="flex h-7 w-7 items-center justify-center rounded-full shadow-sm transition-all duration-300"
            :style="{
              transform: isDark ? 'translateX(28px)' : 'translateX(0)',
              backgroundColor: isDark ? '#f97316' : '#ffffff',
            }"
          >
            <svg v-if="!isDark" class="h-3.5 w-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
            </svg>
            <svg v-else class="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
            </svg>
          </span>
        </button>
      </div>
    </header>

    <main class="flex-1">
      <div class="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
        <slot />
      </div>
    </main>
  </div>
</template>
