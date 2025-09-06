import { ref, onMounted, onUnmounted, type Ref } from 'vue';

interface UseButtonWithKeyboardArrowControlOptions {
  buttonCount: Ref<number>;
  onSelect: (index: number) => void;
  disabled?: Ref<boolean>;
}

export function useButtonWithKeyboardArrowControl(options: UseButtonWithKeyboardArrowControlOptions) {
  const { buttonCount, onSelect, disabled } = options;
  
  const visualIndex = ref(0);

  const handleKeydown = (event: KeyboardEvent) => {
    if (disabled?.value) return;
    
    const count = buttonCount.value;
    if (count === 0) return;

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        visualIndex.value = visualIndex.value > 0 ? visualIndex.value - 1 : count - 1;
        onSelect(visualIndex.value);
        break;
      
      case 'ArrowRight':
        event.preventDefault();
        visualIndex.value = visualIndex.value < count - 1 ? visualIndex.value + 1 : 0;
        onSelect(visualIndex.value);
        break;
    }
  };

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown);
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown);
  });

  return {
    selectedIndex: visualIndex
  };
}
