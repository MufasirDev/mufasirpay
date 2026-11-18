
import { ref } from 'vue'

const isDark = ref(false)
let initialized = false

const applyTheme = () => {
  if (typeof document === 'undefined') return

  const theme = isDark.value ? 'dark' : 'light'

  document.documentElement.setAttribute(
    'data-theme',
    theme
  )

  document.documentElement.style.colorScheme = theme

  localStorage.setItem('mufasirpay-theme', theme)
}

export const useTheme = () => {
  if (!initialized && typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem(
      'mufasirpay-theme'
    )

    isDark.value = savedTheme === 'dark'
    applyTheme()

    initialized = true
  }

  const toggleTheme = () => {
    isDark.value = !isDark.value
    applyTheme()
  }

  const setTheme = (theme: 'light' | 'dark') => {
    isDark.value = theme === 'dark'
    applyTheme()
  }

  return {
    isDark,
    toggleTheme,
    setTheme
  }
}
