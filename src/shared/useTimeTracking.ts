import { ref, onMounted, onUnmounted } from 'vue'

interface DailyTimeData {
  [date: string]: number // minutes spent
}

export function useTimeTracking() {
  const isTracking = ref(false)
  const startTime = ref<number | null>(null)
  const lastActivityTime = ref<number | null>(null)
  const inactivityTimer = ref<NodeJS.Timeout | null>(null)
  
  const STORAGE_KEY = 'linguanodon-time-tracking'
  const INACTIVITY_THRESHOLD = 20 * 1000 // 20 seconds

  function getTimeData(): DailyTimeData {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  }

  function saveTimeData(data: DailyTimeData) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  function getTodayKey(): string {
    return new Date().toISOString().split('T')[0]
  }

  function recordActivity() {
    lastActivityTime.value = Date.now()
    resetInactivityTimer()
  }

  function resetInactivityTimer() {
    if (inactivityTimer.value) {
      clearTimeout(inactivityTimer.value)
    }
    
    inactivityTimer.value = setTimeout(() => {
      stopTracking()
    }, INACTIVITY_THRESHOLD)
  }

  function startTracking() {
    if (isTracking.value) return
    
    isTracking.value = true
    startTime.value = Date.now()
    lastActivityTime.value = Date.now()
    resetInactivityTimer()
  }

  function stopTracking() {
    if (!isTracking.value || !startTime.value) return

    const now = Date.now()
    const sessionDuration = Math.floor((now - startTime.value) / (1000 * 60)) // minutes
    
    if (sessionDuration > 0) {
      const timeData = getTimeData()
      const today = getTodayKey()
      timeData[today] = (timeData[today] || 0) + sessionDuration
      saveTimeData(timeData)
    }

    isTracking.value = false
    startTime.value = null
    lastActivityTime.value = null
    
    if (inactivityTimer.value) {
      clearTimeout(inactivityTimer.value)
      inactivityTimer.value = null
    }
  }

  function onVisibilityChange() {
    if (document.hidden) {
      stopTracking()
    } else {
      startTracking()
    }
  }

  function onActivity() {
    if (isTracking.value) {
      recordActivity()
    }
  }

  function getTodayMinutes(): number {
    const timeData = getTimeData()
    return timeData[getTodayKey()] || 0
  }

  function getThisWeekMinutes(): number {
    const timeData = getTimeData()
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    
    let weekTotal = 0
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      const dateKey = date.toISOString().split('T')[0]
      weekTotal += timeData[dateKey] || 0
    }
    
    return weekTotal
  }

  function getTotalMinutes(): number {
    const timeData = getTimeData()
    return Object.values(timeData).reduce((sum, minutes) => sum + minutes, 0)
  }

  function getAllTimeData(): DailyTimeData {
    return getTimeData()
  }

  onMounted(() => {
    // Add event listeners for user activity
    document.addEventListener('mousemove', onActivity)
    document.addEventListener('keydown', onActivity)
    document.addEventListener('click', onActivity)
    document.addEventListener('scroll', onActivity)
    document.addEventListener('visibilitychange', onVisibilityChange)
    
    // Start tracking if page is visible
    if (!document.hidden) {
      startTracking()
    }
  })

  onUnmounted(() => {
    // Clean up
    stopTracking()
    document.removeEventListener('mousemove', onActivity)
    document.removeEventListener('keydown', onActivity)
    document.removeEventListener('click', onActivity)
    document.removeEventListener('scroll', onActivity)
    document.removeEventListener('visibilitychange', onVisibilityChange)
  })

  return {
    isTracking: isTracking.value,
    startTracking,
    stopTracking,
    getTodayMinutes,
    getThisWeekMinutes,
    getTotalMinutes,
    getAllTimeData
  }
}