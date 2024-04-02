<script setup lang="ts">
import {
  DropdownMenuArrow,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuItemIndicator,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "radix-vue";
import { ref, inheritAttrs } from "vue";
defineOptions({
  inheritAttrs: false // fixes a warning where the astro ID is treated as a fallthrough attribute by Vue
});

const toggleState = ref(false);

const handleClick = () => alert("Foo");
</script>

<template>
  <DropdownMenuRoot v-model:open="toggleState">
    <DropdownMenuTrigger aria-label="Login"> Login </DropdownMenuTrigger>

    <DropdownMenuPortal>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          value="Login using GitHub"
          class="DropdownMenuItem"
          @click="handleClick"
        >
          Login using GitHub
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>
