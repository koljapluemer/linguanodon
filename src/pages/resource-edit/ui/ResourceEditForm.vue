<template>
  <div class="space-y-4">
    <InlineInput :model-value="resource.title" label="Title" placeholder="Resource title"
      @update:model-value="updateField('title', $event)" />

    <LanguageDropdown :model-value="resource.language" label="Language" inline
      @update:model-value="updateField('language', $event)" />

    <InlineInput :model-value="resource.priority" label="Priority" type="number" placeholder="0"
      @update:model-value="updateField('priority', Number($event))" />

    <InlineToggle :model-value="resource.isImmersionContent" label="Is Immersion Content"
      @update:model-value="updateField('isImmersionContent', $event)" />

    <InlineCheckbox :model-value="resource.finishedExtracting" label="Finished extracting knowledge"
      @update:model-value="updateField('finishedExtracting', $event)" />

    <InlineTextarea :model-value="resource.content || ''" label="Content" placeholder="Main content of the resource"
      @update:model-value="updateField('content', $event || undefined)" />

    <LinksForm :links="resource.link ? [resource.link] : []" :single-link-mode="true" @add-link="updateLink"
      @update-link="(_, link) => updateLink(link)" @remove-link="() => updateLink(undefined)"
      @field-change="() => { }" />

    <NoteList :notes="notes" :show-before-exercise-option="true" @add="handleAddNote" @update="handleUpdateNote"
      @delete="handleRemoveNote" />
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, toRaw } from 'vue';
import InlineInput from '@/shared/ui/InlineInput.vue';
import InlineCheckbox from '@/shared/ui/InlineCheckbox.vue';
import InlineToggle from '@/shared/ui/InlineToggle.vue';
import InlineTextarea from '@/shared/ui/InlineTextarea.vue';
import LinksForm from '@/shared/links/LinksForm.vue';
import NoteList from '@/entities/notes/NoteList.vue';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { ResourceData } from '@/entities/resources/ResourceData';
import LanguageDropdown from '@/entities/languages/LanguageDropdown.vue';
import type { NoteRepoContract } from '@/entities/notes/NoteRepoContract';
import type { NoteData } from '@/entities/notes/NoteData';
import type { Link } from '@/shared/links/Link';

const props = defineProps<{
  resource: ResourceData;
}>();

const emit = defineEmits<{
  'resource-updated': [resource: ResourceData];
}>();

const resourceRepo = inject<ResourceRepoContract>('resourceRepo')!;
const noteRepo = inject<NoteRepoContract>('noteRepo')!;

const notes = ref<NoteData[]>([]);

async function updateField(field: keyof ResourceData, value: string | number | boolean | undefined) {
  const updatedResource = toRaw({
    ...toRaw(props.resource),
    [field]: value
  });

  await resourceRepo.updateResource(updatedResource);
  emit('resource-updated', updatedResource);
}

async function updateLink(link: Link | undefined) {
  const updatedResource = toRaw({
    ...toRaw(props.resource),
    link
  });

  await resourceRepo.updateResource(updatedResource);
  emit('resource-updated', updatedResource);
}

async function handleAddNote(note: NoteData) {
  const savedNote = await noteRepo.saveNote(toRaw(note));
  notes.value.push(savedNote);

  const updatedResource = toRaw({
    ...toRaw(props.resource),
    notes: [...toRaw(props.resource).notes, savedNote.uid]
  });

  await resourceRepo.updateResource(updatedResource);
  emit('resource-updated', updatedResource);
}

async function handleUpdateNote(note: NoteData) {
  await noteRepo.updateNote(toRaw(note));
  const index = notes.value.findIndex(n => n.uid === note.uid);
  if (index !== -1) {
    notes.value[index] = note;
  }
}

async function handleRemoveNote(noteUid: string) {
  await noteRepo.deleteNote(noteUid);
  notes.value = notes.value.filter(n => n.uid !== noteUid);

  const updatedResource = toRaw({
    ...toRaw(props.resource),
    notes: toRaw(props.resource).notes.filter(id => id !== noteUid)
  });

  await resourceRepo.updateResource(updatedResource);
  emit('resource-updated', updatedResource);
}

async function loadNotes() {
  if (props.resource.notes.length > 0) {
    notes.value = await noteRepo.getNotesByUIDs(props.resource.notes);
  }
}

onMounted(async () => {
  await loadNotes();
});
</script>