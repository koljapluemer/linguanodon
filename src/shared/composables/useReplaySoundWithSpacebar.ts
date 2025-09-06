import { onMounted, onUnmounted, type Ref } from 'vue';

interface UseReplaySoundWithSpacebarOptions {
  onReplay: () => void;
  disabled?: Ref<boolean>;
}

export function useReplaySoundWithSpacebar(options: UseReplaySoundWithSpacebarOptions) {
  const { onReplay, disabled } = options;

  const handleKeydown = (event: KeyboardEvent) => {
    if (disabled?.value) return;
    
    if (event.key === ' ') {
      event.preventDefault();
      onReplay();
    }
  };

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown);
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown);
  });

  return {};
}
