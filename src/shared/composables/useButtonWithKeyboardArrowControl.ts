import { onMounted, onUnmounted, type Ref } from 'vue';

interface UseButtonWithKeyboardArrowControlOptions {
  buttonCount: Ref<number>;
  onSelect: (index: number) => void;
  disabled?: Ref<boolean>;
}

export function useButtonWithKeyboardArrowControl(options: UseButtonWithKeyboardArrowControlOptions) {
  const { buttonCount, onSelect, disabled } = options;

  const handleKeydown = (event: KeyboardEvent) => {
    if (disabled?.value) return;
    
    const count = buttonCount.value;
    if (count === 0) return;

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        onSelect(0); // Always select the leftmost visual button
        break;
      
      case 'ArrowRight':
        event.preventDefault();
        onSelect(1); // Always select the rightmost visual button
        break;
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
