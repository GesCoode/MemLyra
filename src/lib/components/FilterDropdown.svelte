<script lang="ts">
  import { slide } from "svelte/transition";
  import arrowDown from "$lib/assets/keyboard_arrow_down.svg";

  export let title: string = "Filter";
  export let options: string[] = [];

  let selected: Record<string, boolean> = {};
  let open = true; // collapsed state

  $: options.forEach(opt => {
    if (!(opt in selected)) selected[opt] = false;
  });

  function toggle() {
    open = !open;
  }
</script>

<div class="flex flex-col items-start self-stretch bg-white rounded">
  <!-- Header -->
  <div class="flex justify-between items-center w-full cursor-pointer" on:click={toggle}>
    <div class="text-[14px] font-bold tracking-[-0.266px] text-[#292C2F] font-sans">{title}</div>
    <img
      src={arrowDown}
      alt="icon"
      class="w-6 h-6 transition-transform duration-300"
      style="transform: rotate({open ? 180 : 0}deg)"
    />
  </div>

  <div class="w-full border-t border-[#ABAEB1]"></div>

  <!-- Collapsible Options -->
  {#if open}
    <div transition:slide={{ duration: 200 }} class="flex flex-col items-start mt-2">
      {#each options as opt}
        <label class="flex items-center gap-2 cursor-pointer w-full">
          <input type="checkbox" bind:checked={selected[opt]} class="w-4 h-4" />
          <div class="text-[14px] font-light text-[#212529] font-sans">{opt}</div>
        </label>
      {/each}
    </div>
  {/if}
</div>