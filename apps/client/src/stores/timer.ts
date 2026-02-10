import dayjs from 'dayjs';
import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';

export const useTimerStore = defineStore('timer', () => {
  // State
  const isRunning = ref(false);
  const seconds = ref(0);
  const startTime = ref<string | null>(null);
  const intervalId = ref<number | null>(null);
  const faviconIntervalId = ref<number | null>(null);
  const defaultFavicon = '/app_logo.png';
  const recordingFavicon =
    'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><circle cx=%2250%22 cy=%2250%22 r=%2235%22 fill=%22%23ef4444%22 /></svg>';
  const transparentFavicon =
    'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22></svg>';

  // Modal State (Global visibility)
  const isModalOpen = ref(false);
  const activeProjectId = ref<string | undefined>(undefined);

  // Getters
  const formattedTime = computed(() => {
    const h = Math.floor(seconds.value / 3600);
    const m = Math.floor((seconds.value % 3600) / 60);
    const s = seconds.value % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  });

  // Actions
  const startTimer = () => {
    if (isRunning.value) return;

    isRunning.value = true;
    startTime.value = dayjs().toISOString();

    intervalId.value = setInterval(() => {
      seconds.value++;
    }, 1000) as unknown as number;
  };

  const pauseTimer = () => {
    if (!isRunning.value) return;

    if (intervalId.value) {
      clearInterval(intervalId.value);
      intervalId.value = null;
    }
    isRunning.value = false;
  };

  const stopTimer = () => {
    pauseTimer();
    // We don't reset seconds here immediately because we might want to save them
    // The consumer (Modal) will handle the save and then call reset
  };

  const resetTimer = () => {
    pauseTimer();
    seconds.value = 0;
    startTime.value = null;
  };

  const openModal = (projectId?: string) => {
    activeProjectId.value = projectId;
    isModalOpen.value = true;
  };

  const closeModal = () => {
    isModalOpen.value = false;
    activeProjectId.value = undefined;
  };

  const updateFavicon = (href: string) => {
    const link: HTMLLinkElement | null =
      document.querySelector("link[rel~='icon']");
    if (link) {
      link.href = href;
    }
  };

  const startFaviconBlink = () => {
    if (faviconIntervalId.value) return;

    let showRed = true;
    updateFavicon(recordingFavicon);

    faviconIntervalId.value = setInterval(() => {
      showRed = !showRed;
      updateFavicon(showRed ? recordingFavicon : transparentFavicon);
    }, 1000) as unknown as number;
  };

  const stopFaviconBlink = () => {
    if (faviconIntervalId.value) {
      clearInterval(faviconIntervalId.value);
      faviconIntervalId.value = null;
    }
    updateFavicon(defaultFavicon);
  };

  // Watcher for Document Title
  watch(seconds, () => {
    if (isRunning.value) {
      document.title = `${formattedTime.value} - Code Clock`;
    } else {
      document.title = 'Code Clock';
    }
  });

  // Watcher for isRunning to clear title when paused/stopped
  watch(isRunning, (newValue) => {
    if (newValue) {
      startFaviconBlink();
    } else {
      stopFaviconBlink();
      document.title = 'Code Clock';
    }
  });

  return {
    isRunning,
    seconds,
    formattedTime,
    isModalOpen,
    activeProjectId,
    startTimer,
    pauseTimer,
    stopTimer,
    resetTimer,
    openModal,
    closeModal,
  };
});
