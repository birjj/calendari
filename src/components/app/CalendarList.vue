<script setup>
import PlusIcon from "~icons/mdi/plus";
</script>

<template>
  <div class="wrapper">
    <p>You have no registered calendars. To get started, add a new one:</p>
    <div class="btn">
      <a>
        <PlusIcon width="32" height="32" />
        Add a new calendar
      </a>
    </div>
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

.btn {
  display: flex;
  padding: 1px;
  background-color: #23262d;
  background-image: none;
  background-size: 400%;
  border-radius: 7px;
  background-position: 100%;
  transition: background-position 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  box-shadow: inset 0 0 0 1px oklch(100% 0.014 267.05 / 20%);
}

.btn:is(:hover, :focus-within) {
  background-position: 0;
  background-image: var(--accent-gradient);
}

.btn>a {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  text-decoration: none;
  line-height: 1.4;
  padding: calc(1rem - 1px) calc(2rem - 1px);
  border-radius: 6px;
  color: white;
  background-color: oklch(27% 0.015 267 / 80%);
}

.btn>a>svg:first-child {
  margin-right: 2ch;
}
</style>
