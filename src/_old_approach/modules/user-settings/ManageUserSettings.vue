<script setup lang="ts">
/**
 * General user settings view.
 * - Renders language management and will include more settings in the future.
 */
import ManageUserLanguages from './manage-user-languages/ManageUserLanguages.vue'
</script>

<template>
  <div class="max-w-3xl mx-auto p-6 space-y-10">
    <h1 class="text-2xl font-bold mb-6">User Settings</h1>
    <section>
      <h2 class="text-xl font-semibold mb-4">Languages</h2>
      <ManageUserLanguages />
    </section>
    <section>
      <h2 class="text-xl font-semibold mb-4">Other Settings</h2>
      <div class="text-base-content/60 italic">More settings coming soon...</div>
    </section>
  </div>
</template>
