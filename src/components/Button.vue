<script setup lang="ts">
import LoadingIcon from "~icons/mdi/loading";

defineEmits<{
    (e: 'click'): void
}>();

const props = defineProps({
    loading: Boolean,
    disabled: Boolean
});

const isLoading = props.loading;
</script>

<template>
    <button class="button" :disabled="isLoading || props.disabled" @click="$emit('click')">
        <span class="inner">
            <slot v-if="!isLoading" name="icon"></slot>
            <LoadingIcon v-else class="loading" width="32" height="32" />
            <slot></slot>
        </span>
    </button>
</template>

<style scoped>
.button {
    display: flex;
    font: inherit;
    padding: 1px;
    background-color: #23262d;
    background-image: none;
    background-size: 400%;
    border-radius: 7px;
    background-position: 100%;
    border: none;
    transition: background-position 0.6s cubic-bezier(0.22, 1, 0.36, 1);
    box-shadow: inset 0 0 0 1px oklch(100% 0.014 267.05 / 20%);
    cursor: pointer;
    color: inherit;
}

.button:disabled {
    background-color: #13161d;
    box-shadow: inset 0 0 0 1px oklch(100% 0.014 267.05 / 10%);
    color: oklch(100% 0.014 267.05 / 20%);
}

.button:not(:disabled):is(:hover) {
    background-position: 0;
    background-image: var(--accent-gradient);
}

.inner {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    width: 100%;
    text-decoration: none;
    line-height: 1.4;
    padding: calc(1rem - 1px) calc(2rem - 1px);
    border-radius: 6px;
    background-color: oklch(27% 0.015 267 / 80%);
}

.inner>:global(svg:first-child) {
    margin-right: 2ch;
}

.loading {
    animation: loading-rotate 0.75s infinite linear;
}

@keyframes loading-rotate {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}
</style>