// @ts-check
// Port of infinite-sentences-frontend's src/pages/stats/{StatsPage,StreakVisualization,DailyCountsChart}.vue
// Nav chrome (AppHeader/AppFooter) is now the shared Django-rendered
// _app_subnav.html/_app_footer.html.

import { createPracticeStore, createUserSettingsStore } from "./store.js";
import { loadLanguages } from "./api.js";
import { iconMarkup } from "./icons.js";

const { ref, computed, onMounted } = window.Vue;

/** @param {string} dateStr "yyyy-MM-dd" */
function formatDateLabel(dateStr) {
  const [, month, day] = dateStr.split("-");
  return `${month}/${day}`;
}

/** @param {number} index @param {number} total */
function generateColor(index, total) {
  const hue = ((index * 360) / Math.max(total, 1)) % 360;
  return `hsl(${hue}, 70%, 50%)`;
}

export const StatsAppComponent = {
  props: {
    config: { type: Object, required: true },
  },
  setup(props) {
    const practiceStore = createPracticeStore();
    const userSettings = createUserSettingsStore();

    const last14Days = computed(() => {
      const counts = practiceStore.getLast14DaysSentenceCounts();
      return counts.map((day) => ({ date: day.date, practiced: day.count > 0 }));
    });
    const streak = computed(() => practiceStore.getCurrentStreak());
    const flameIcon = iconMarkup("Flame", "w-4 h-4 text-orange-500");
    const circleIcon = iconMarkup("Circle", "w-4 h-4");

    /** @type {import('../types.js').VueRef<HTMLCanvasElement | null>} */
    const chartCanvas = ref(null);

    onMounted(async () => {
      const rawData = practiceStore.getLast14DaysSentenceCountsByLanguage();
      const languageIsos = practiceStore.getAllPracticedLanguages();
      const labels = rawData.map((point) => formatDateLabel(point.date));

      /** @type {Record<string, string>} */
      let languageNames = {};
      try {
        const languages = await loadLanguages(props.config.apiLanguagesUrl);
        languageNames = Object.fromEntries(
          languageIsos.map((iso) => [iso, languages[iso]?.displayName || iso])
        );
      } catch (error) {
        console.warn("Failed to load language names:", error);
      }

      let datasets;
      if (languageIsos.length === 0) {
        const totals = practiceStore.getLast14DaysSentenceCounts();
        datasets = [{ label: "Sentences", data: totals.map((d) => d.count), backgroundColor: "#2563eb" }];
      } else {
        datasets = languageIsos.map((iso, index) => ({
          label: languageNames[iso] || iso,
          data: rawData.map((point) => point.counts[iso] || 0),
          backgroundColor: generateColor(index, languageIsos.length),
        }));
      }

      if (!chartCanvas.value || !window.Chart) return;

      new window.Chart(chartCanvas.value, {
        type: "bar",
        data: { labels, datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "bottom" },
            annotation: {
              annotations: {
                goalLine: {
                  type: "line",
                  yMin: userSettings.dailySentenceGoal,
                  yMax: userSettings.dailySentenceGoal,
                  borderColor: "#dc2626",
                  borderWidth: 2,
                  borderDash: [6, 6],
                  label: {
                    display: true,
                    content: `Goal: ${userSettings.dailySentenceGoal}`,
                    position: "end",
                    backgroundColor: "transparent",
                    color: "#dc2626",
                    font: { size: 11 },
                  },
                },
              },
            },
          },
          scales: {
            x: { stacked: true },
            y: { stacked: true, beginAtZero: true, ticks: { stepSize: 1 } },
          },
        },
      });
    });

    return { last14Days, streak, flameIcon, circleIcon, chartCanvas };
  },
  template: `
    <div class="max-w-2xl mx-auto w-full p-4">
      <div class="mb-6">
        <h2 class="text-xl font-semibold mb-4">Streak</h2>
        <div class="flex items-center gap-4 overflow-x-auto">
          <div class="flex gap-1">
            <span v-for="(day, index) in last14Days" :key="index" v-html="day.practiced ? flameIcon : circleIcon"></span>
          </div>
          <div class="text-2xl font-bold">{{ streak }}</div>
        </div>
      </div>

      <div class="mb-6">
        <h2 class="text-xl font-semibold mb-4">Sentences Done</h2>
        <div class="w-full" style="height: 300px">
          <canvas ref="chartCanvas"></canvas>
        </div>
      </div>
    </div>
  `,
};
