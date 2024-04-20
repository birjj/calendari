<script setup lang="ts">
import PlusIcon from "~icons/mdi/plus";
import Button from "../Button.vue";
import { ref } from "vue";

const isLoading = ref(false);
</script>

<template>
  <div class="wrapper">
    <p>You have no registered calendars. To get started, add a new one:</p>
    <Button :loading="isLoading" @click="isLoading = true">
      <template #icon>
        <PlusIcon width="32" height="32" />
      </template>
      Add a new calendar
    </Button>
  </div>
</template>

<style scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  border: 2px dashed rgb(255 255 255 / 20%);
  border-radius: 12px;
}
</style>
