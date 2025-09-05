<script setup lang="ts">
import { computed } from 'vue';
import { useTimeTracking } from '@/shared/useTimeTracking';

const { getTodayMinutes, getThisWeekMinutes, getTotalMinutes, getAllTimeData } = useTimeTracking();

const todayMinutes = computed(() => getTodayMinutes());
const weekMinutes = computed(() => getThisWeekMinutes());
const totalMinutes = computed(() => getTotalMinutes());

const chartData = computed(() => {
  const allData = getAllTimeData();
  const today = new Date();
  const last7Days = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

    last7Days.push({
      date: dateKey,
      day: dayName,
      minutes: allData[dateKey] || 0
    });
  }

  return last7Days;
});

const maxMinutes = computed(() => {
  return Math.max(...chartData.value.map(d => d.minutes), 1);
});
</script>

<template>
  <div class="mb-6">
    <h1>Learning Time Tracker</h1>
    <p class="text-light mt-2">Track your daily learning progress</p>
  </div>

  <!-- Stats Cards -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
    <div class="stat bg-base-100 rounded-lg shadow">
      <div class="stat-title">Today</div>
      <div class="stat-value text-primary">{{ todayMinutes }}</div>
      <div class="stat-desc">minutes learned</div>
    </div>

    <div class="stat bg-base-100 rounded-lg shadow">
      <div class="stat-title">This Week</div>
      <div class="stat-value text-secondary">{{ weekMinutes }}</div>
      <div class="stat-desc">minutes learned</div>
    </div>

    <div class="stat bg-base-100 rounded-lg shadow">
      <div class="stat-title">Total</div>
      <div class="stat-value text-accent">{{ totalMinutes }}</div>
      <div class="stat-desc">minutes learned</div>
    </div>
  </div>

  <!-- Chart -->
  <div class="bg-base-100 rounded-lg shadow p-6">
    <h2>Last 7 Days</h2>

    <div class="space-y-3">
      <div v-for="day in chartData" :key="day.date" class="flex items-center gap-4">
        <div class="w-12  font-medium text-right">
          {{ day.day }}
        </div>

        <div class="flex-1 relative">
          <div class="w-full bg-base-200 rounded h-8 relative overflow-hidden">
            <div class="h-full bg-primary transition-all duration-300 rounded flex items-center justify-end pr-2"
              :style="{ width: `${(day.minutes / maxMinutes) * 100}%` }">
              <span v-if="day.minutes > 0" class="text-primary-content text-xs font-medium">
                {{ day.minutes }}m
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="maxMinutes <= 1" class="text-center mt-6 text-base-content/60">
      <p>No learning time recorded yet.</p>
      <p class=" mt-1">Visit the Queue to start tracking your learning time!</p>
    </div>
  </div>
</template>