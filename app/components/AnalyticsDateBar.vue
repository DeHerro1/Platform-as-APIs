<script setup lang="ts">
import type { DatePeriodPreset } from '~/types'

const { periodPreset, customStart, customEnd, periodLabelShort } = useDateFilter()

const presets: { id: DatePeriodPreset; label: string }[] = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'custom', label: 'Custom' },
]
</script>

<template>
  <div
    class="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
    role="group"
    aria-label="Date range"
  >
    <div
      class="inline-flex flex-wrap rounded-lg p-0.5"
      :style="{ backgroundColor: 'var(--surface-secondary)', border: '1px solid var(--border-primary)' }"
    >
      <button
        v-for="p in presets"
        :key="p.id"
        type="button"
        class="rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
        :class="periodPreset === p.id ? 'shadow-sm' : 'hover:opacity-90'"
        :style="
          periodPreset === p.id
            ? { backgroundColor: 'var(--surface-elevated)', color: 'var(--text-primary)' }
            : { color: 'var(--text-secondary)' }
        "
        :aria-pressed="periodPreset === p.id"
        @click="periodPreset = p.id"
      >
        {{ p.label }}
      </button>
    </div>

    <div
      v-if="periodPreset === 'custom'"
      class="flex flex-wrap items-center gap-2"
    >
      <label class="flex items-center gap-1.5 text-xs" :style="{ color: 'var(--text-secondary)' }">
        <span>From</span>
        <input
          v-model="customStart"
          type="date"
          class="rounded-md border px-2 py-1 text-xs"
          :style="{
            borderColor: 'var(--border-primary)',
            backgroundColor: 'var(--surface-primary)',
            color: 'var(--text-primary)',
          }"
        >
      </label>
      <label class="flex items-center gap-1.5 text-xs" :style="{ color: 'var(--text-secondary)' }">
        <span>To</span>
        <input
          v-model="customEnd"
          type="date"
          class="rounded-md border px-2 py-1 text-xs"
          :style="{
            borderColor: 'var(--border-primary)',
            backgroundColor: 'var(--surface-primary)',
            color: 'var(--text-primary)',
          }"
        >
      </label>
    </div>

    <p class="text-xs tabular-nums" :style="{ color: 'var(--text-muted)' }">
      {{ periodLabelShort }}
    </p>
  </div>
</template>
