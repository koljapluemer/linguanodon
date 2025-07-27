<template>
  <div v-html="renderedMarkdown" class="markdown-content"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  content: string;
}

const props = defineProps<Props>();

// Simple and secure markdown renderer - only supports basic features
const renderedMarkdown = computed(() => {
  if (!props.content) return '';
  
  let html = escapeHtml(props.content);
  
  // Bold: **text** -> <strong>text</strong>
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Italic: *text* -> <em>text</em>
  html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
  
  // Links: [text](url) -> <a href="url">text</a>
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  
  // Bullet lists: - item -> <ul><li>item</li></ul>
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
  
  // Line breaks
  html = html.replace(/\n/g, '<br>');
  
  return html;
});

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
</script>

<style scoped>
.markdown-content :deep(a) {
  color: #1d4ed8;
  text-decoration: underline;
}

.markdown-content :deep(a:hover) {
  color: #1e40af;
}

.markdown-content :deep(strong) {
  font-weight: bold;
}

.markdown-content :deep(em) {
  font-style: italic;
}

.markdown-content :deep(ul) {
  list-style-type: disc;
  list-style-position: inside;
  margin: 0.5rem 0;
}

.markdown-content :deep(li) {
  margin: 0.25rem 0;
}
</style>