type Theme = 'dark' | 'light'

const theme = ref<Theme>('dark')

export function useTheme() {
  function initTheme() {
    if (import.meta.client) {
      const stored = localStorage.getItem('hubtel-theme') as Theme | null
      if (stored) {
        theme.value = stored
      } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
        theme.value = 'light'
      }
      applyTheme()
    }
  }

  function applyTheme() {
    if (import.meta.client) {
      document.documentElement.classList.toggle('dark', theme.value === 'dark')
      document.documentElement.classList.toggle('light', theme.value === 'light')
    }
  }

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    if (import.meta.client) {
      localStorage.setItem('hubtel-theme', theme.value)
    }
    applyTheme()
  }

  const isDark = computed(() => theme.value === 'dark')

  return { theme, isDark, toggleTheme, initTheme }
}
