<template>
    <a class="button">
        <span class="inner">
            <slot></slot>
        </span>
    </a>
</template>

<style scoped>
.button {
    display: flex;
    padding: 1px;
    background-color: #23262d;
    background-image: none;
    background-size: 400%;
    border-radius: 7px;
    background-position: 100%;
    transition: background-position 0.6s cubic-bezier(0.22, 1, 0.36, 1);
    box-shadow: inset 0 0 0 1px oklch(100% 0.014 267.05 / 20%);
    text-decoration: none;
}

.button:is(:hover, :focus-within) {
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
    color: white;
    background-color: oklch(27% 0.015 267 / 80%);
}

.inner>:global(svg:first-child) {
    margin-right: 2ch;
}
</style>