<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import MainLayout from './layouts/MainLayout.vue';

const route = useRoute();
const layout = computed(() => {
  return route.meta.layout === 'MainLayout' ? MainLayout : null;
});
</script>

<template>
  <component
    :is="layout"
    v-if="layout"
  >
    <RouterView />
  </component>
  <RouterView v-else />
</template>
