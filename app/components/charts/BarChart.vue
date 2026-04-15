<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    data: { label: string; value: number; color?: string }[]
    height?: number
    showLabels?: boolean
    animate?: boolean
  }>(),
  { animate: false, showLabels: true },
)

const maxValue = computed(() => {
  if (!props.data.length) return 1
  return Math.max(1, ...props.data.map(d => d.value))
})
const chartHeight = computed(() => props.height || 200)
const animationDelay = 100

const barHeights = computed(() =>
  props.data.map((item, index) => ({
    ...item,
    height: Math.max((item.value / maxValue.value) * 100, 8),
    delay: props.animate ? index * animationDelay : 0
  }))
)
</script>

<template>
  <div class="w-full">
    <p
      v-if="!data.length"
      class="flex items-center justify-center rounded-lg border border-dashed text-sm"
      :style="{
        height: `${chartHeight}px`,
        borderColor: 'var(--border-primary)',
        color: 'var(--text-muted)',
      }"
    >
      —
    </p>
    <div v-else class="flex items-end gap-1.5 sm:gap-2" :style="{ height: `${chartHeight}px` }">
      <div
        v-for="(item, index) in barHeights"
        :key="index"
        class="group relative flex-1 flex flex-col items-center justify-end"
        :style="{ animationDelay: `${item.delay}ms` }"
      >
        <!-- Enhanced tooltip -->
        <div class="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 rounded-lg bg-slate-900 dark:bg-slate-700 text-white px-3 py-2 text-sm font-medium shadow-lg border border-slate-700 dark:border-slate-600 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 whitespace-nowrap">
          <div class="text-center">
            <div class="font-bold">{{ item.value.toLocaleString() }}</div>
            <div class="text-xs text-slate-300">{{ item.label }}</div>
          </div>
          <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 dark:bg-slate-700 border-r border-b border-slate-700 dark:border-slate-600 rotate-45"></div>
        </div>

        <!-- Bar with gradient and animation -->
        <div
          class="w-full rounded-t-lg transition-all duration-700 ease-out hover:scale-105 hover:brightness-110 relative overflow-hidden"
          :style="{
            height: `${item.height}%`,
            background: `linear-gradient(180deg, ${item.color || '#6366f1'} 0%, ${item.color || '#6366f1'}dd 100%)`,
            boxShadow: `0 4px 12px ${item.color || '#6366f1'}40`,
            transform: props.animate ? 'scaleY(0)' : 'scaleY(1)',
            transformOrigin: 'bottom',
          }"
        >
          <!-- Shine effect -->
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-pulse"></div>
        </div>

        <!-- Label -->
        <span v-if="showLabels" class="mt-3 text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-400 font-medium truncate max-w-full text-center leading-tight">
          {{ item.label }}
        </span>
      </div>
    </div>
  </div>
</template>
