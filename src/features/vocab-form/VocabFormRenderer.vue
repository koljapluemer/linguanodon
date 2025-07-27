<template>
  <div class="max-w-2xl mx-auto">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <span class="loading loading-spinner loading-lg"></span>
      <p class="mt-4">Loading vocab...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-error mb-6">
      <span>{{ error }}</span>
    </div>

    <!-- Form -->
    <form v-else @submit.prevent="$emit('save')" class="space-y-6">
      <!-- Basic Information -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <h3 class="card-title">Basic Information</h3>
          
          <!-- Language -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">Language *</span>
            </label>
            <input
              v-model="formData.language"
              type="text"
              placeholder="e.g., Italian, Spanish, French"
              class="input input-bordered"
              required
            />
          </div>

          <!-- Content -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">Content *</span>
            </label>
            <input
              v-model="formData.content"
              type="text"
              placeholder="The word or phrase"
              class="input input-bordered"
              required
            />
          </div>

          <!-- Pronunciation -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">Pronunciation</span>
            </label>
            <input
              v-model="formData.pronunciation"
              type="text"
              placeholder="Phonetic pronunciation"
              class="input input-bordered"
            />
          </div>

          <!-- Priority -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">Priority</span>
            </label>
            <input
              v-model.number="formData.priority"
              type="number"
              min="1"
              max="5"
              placeholder="1"
              class="input input-bordered w-24"
            />
            <div class="label">
              <span class="label-text-alt">1 = lowest, 5 = highest priority</span>
            </div>
          </div>

          <!-- Exclude from practice -->
          <div class="form-control">
            <label class="cursor-pointer label justify-start gap-2">
              <input
                v-model="formData.doNotPractice"
                type="checkbox"
                class="checkbox"
              />
              <span class="label-text">Exclude from practice</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Notes -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <div class="flex justify-between items-center">
            <h3 class="card-title">Notes</h3>
            <button
              type="button"
              @click="$emit('addNote')"
              class="btn btn-sm btn-outline"
            >
              <Plus class="w-4 h-4 mr-1" />
              Add Note
            </button>
          </div>
          
          <div v-if="formData.notes.length === 0" class="text-gray-500 text-center py-4">
            No notes yet. Click "Add Note" to get started.
          </div>
          
          <div v-else class="space-y-4">
            <div
              v-for="(note, index) in formData.notes"
              :key="index"
              class="border rounded-lg p-4"
            >
              <div class="flex justify-between items-start gap-4">
                <div class="flex-1">
                  <textarea
                    v-model="note.content"
                    placeholder="Enter note content..."
                    class="textarea textarea-bordered w-full"
                    rows="2"
                  ></textarea>
                  
                  <div class="form-control mt-2">
                    <label class="cursor-pointer label justify-start gap-2">
                      <input
                        v-model="note.showBeforeExercise"
                        type="checkbox"
                        class="checkbox checkbox-sm"
                      />
                      <span class="label-text">Show before exercise</span>
                    </label>
                  </div>
                </div>
                
                <button
                  type="button"
                  @click="$emit('removeNote', index)"
                  class="btn btn-sm btn-ghost btn-circle text-error"
                >
                  <X class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Links -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <div class="flex justify-between items-center">
            <h3 class="card-title">Links</h3>
            <button
              type="button"
              @click="$emit('addLink')"
              class="btn btn-sm btn-outline"
            >
              <Plus class="w-4 h-4 mr-1" />
              Add Link
            </button>
          </div>
          
          <div v-if="formData.links.length === 0" class="text-gray-500 text-center py-4">
            No links yet. Click "Add Link" to add external resources.
          </div>
          
          <div v-else class="space-y-4">
            <div
              v-for="(link, index) in formData.links"
              :key="index"
              class="border rounded-lg p-4"
            >
              <div class="flex justify-between items-start gap-4">
                <div class="flex-1 space-y-2">
                  <input
                    v-model="link.label"
                    type="text"
                    placeholder="Link label"
                    class="input input-bordered input-sm w-full"
                  />
                  <input
                    v-model="link.url"
                    type="url"
                    placeholder="https://..."
                    class="input input-bordered input-sm w-full"
                  />
                </div>
                
                <button
                  type="button"
                  @click="$emit('removeLink', index)"
                  class="btn btn-sm btn-ghost btn-circle text-error"
                >
                  <X class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-between items-center">
        <router-link to="/vocab" class="btn btn-outline">
          Cancel
        </router-link>
        
        <button
          type="submit"
          :disabled="!isValid || saving"
          class="btn btn-primary"
        >
          <span v-if="saving" class="loading loading-spinner loading-sm"></span>
          {{ saving ? 'Saving...' : (isEditing ? 'Update Vocab' : 'Create Vocab') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { Plus, X } from 'lucide-vue-next';
import type { VocabFormData } from './types';

defineProps<{
  formData: VocabFormData;
  loading: boolean;
  saving: boolean;
  error: string | null;
  isValid: boolean;
  isEditing: boolean;
}>();

defineEmits<{
  save: [];
  addNote: [];
  removeNote: [index: number];
  addLink: [];
  removeLink: [index: number];
}>();
</script>