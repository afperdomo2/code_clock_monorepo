<template>
  <section class="w-full px-0 py-4 rounded-xl">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex-1 min-w-0">
        <slot name="title" />
      </div>
      <div class="flex flex-wrap w-full gap-2 sm:flex-row sm:w-auto sm:justify-end">
        <slot name="actions" />
      </div>
    </div>
    <div class="mt-4">
      <slot name="content" />
    </div>
  </section>
</template>
